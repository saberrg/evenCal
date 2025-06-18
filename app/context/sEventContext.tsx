'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Event } from '../types/event'
import { supabase } from '@/lib/supabase'

interface EventContextType {
  events: Event[]
  addEvent: (event: Event) => Promise<void>
  removeEvent: (eventId: string) => Promise<void>
  updateEvent: (updatedEvent: Event) => Promise<void>
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

// Transform Supabase event data to our Event type
const transformSupabaseEvent = (data: any): Event => {
  // Get the ticket price directly from the ticket_price column
  const ticketPrice = data.ticket_price || 0

  const isPaid = ticketPrice > 0

  // Calculate total amount billed (simplified - would need actual booking data)
  const amountBilled = data.ticket_types 
    ? data.ticket_types.reduce((total: number, ticket: any) => {
        return total + (parseFloat(ticket.price) * (ticket.quantity_sold || 0))
      }, 0)
    : 0

  return {
    id: data.id,
    name: data.title,
    venueName: data.venues?.name || '',
    venueAddress: data.venues 
      ? `${data.venues.address_line1 || ''}, ${data.venues.city || ''}, ${data.venues.state_province || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '')
      : '',
    startDateTime: data.start_datetime,
    endDateTime: data.end_datetime,
    createdBy: data.organizer_id || '', // Use organizer_id directly
    numberOfTickets: data.capacity || 0,
    ticketPrice: ticketPrice,
    addOns: data.tags || [],
    food: [], // This would need to be added to your database schema if needed
    isPaid: isPaid,
    amountBilled: amountBilled,
    imageUrl: data.banner_image_url || 'https://via.placeholder.com/800x400/e5e7eb/6b7280?text=Event+Image',
    description: data.description || ''
  }
}

// Transform Event type back to Supabase format for create/update operations
const transformEventToSupabase = (event: Event): any => {
  return {
    title: event.name,
    description: event.description,
    start_datetime: event.startDateTime,
    end_datetime: event.endDateTime,
    capacity: event.numberOfTickets,
    banner_image_url: event.imageUrl,
    tags: event.addOns,
    // Note: venue_id and organizer_id would need to be handled separately
    // as they require lookups/inserts in their respective tables
  }
}

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('events')
        .select('*')

        console.log('data', data)

      if (error) throw error
      const transformedEvents = (data || []).map(transformSupabaseEvent)
      setEvents(transformedEvents)
      console.log('Loaded events:', transformedEvents)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Error loading events:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const addEvent = async (event: Event): Promise<void> => {
    try {
      setError(null)
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('User not authenticated')

      // Get user profile to get the user ID from our users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (profileError) throw profileError

      // Transform event data for Supabase
      const supabaseEvent = {
        ...transformEventToSupabase(event),
        organizer_id: userProfile.id,
        status: 'draft', // New events start as draft
        visibility: 'public'
      }

      const { data, error } = await supabase
        .from('events')
        .insert([supabaseEvent])
        .select()
        .single()

      if (error) throw error

      // If the event has a ticket price, create a default ticket type
      if (event.ticketPrice > 0) {
        const { error: ticketError } = await supabase
          .from('ticket_types')
          .insert([{
            event_id: data.id,
            name: 'General Admission',
            price: event.ticketPrice,
            quantity_total: event.numberOfTickets,
            is_active: true
          }])

        if (ticketError) {
          console.error('Error creating ticket type:', ticketError)
          // Don't throw here as the event was created successfully
        }
      }

      // Reload events to get the updated list
      await loadEvents()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add event'
      setError(errorMessage)
      console.error('Error adding event:', err)
      throw err
    }
  }

  const updateEvent = async (updatedEvent: Event): Promise<void> => {
    try {
      setError(null)
      
      const supabaseEvent = transformEventToSupabase(updatedEvent)
      
      const { error } = await supabase
        .from('events')
        .update(supabaseEvent)
        .eq('id', updatedEvent.id)

      if (error) throw error

      // Update local state
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event'
      setError(errorMessage)
      console.error('Error updating event:', err)
      throw err
    }
  }

  const removeEvent = async (eventId: string): Promise<void> => {
    try {
      setError(null)
      
      // Note: This will cascade delete related records due to our foreign key constraints
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      // Update local state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove event'
      setError(errorMessage)
      console.error('Error removing event:', err)
      throw err
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  return (
    <EventContext.Provider value={{
      events,
      addEvent,
      removeEvent,
      updateEvent,
      isLoading,
      error,
      refetch: loadEvents
    }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEventContext() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider')
  }
  return context
}

// Additional helper functions for common operations
export const getEventsByCategory = async (categoryId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      description,
      start_datetime,
      end_datetime,
      banner_image_url,
      capacity,
      tags,
      organizer_id,
      venues (name, city, state_province, address_line1),
      ticket_types (price, quantity_total, quantity_sold)
    `)
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .gte('end_datetime', new Date().toISOString())

  if (error) throw error
  return (data || []).map(transformSupabaseEvent)
}

export const getEventsByUser = async (userId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      description,
      start_datetime,
      end_datetime,
      banner_image_url,
      capacity,
      status,
      tags,
      organizer_id,
      venues (name, city, state_province, address_line1),
      ticket_types (price, quantity_total, quantity_sold)
    `)
    .eq('organizer_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(transformSupabaseEvent)
}