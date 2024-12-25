'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Event } from '../types/event'
import { mockEvents } from '../data/sampleEvents'

interface EventContextType {
  events: Event[]
  addEvent: (event: Event) => void
  removeEvent: (eventId: string) => void
  updateEvent: (updatedEvent: Event) => void
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Simulate API call
        //await new Promise(resolve => setTimeout(resolve, 1000))
        setEvents(mockEvents)
      } catch (error) {
        console.error('Failed to load events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [])

  const addEvent = (event: Event) => {
    setEvents(prevEvents => [...prevEvents, event])
  }

  const removeEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
  }

  const updateEvent = (updatedEvent: Event) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    )
  }

  const value = {
    events,
    addEvent,
    removeEvent,
    updateEvent,
  }

  if (isLoading) {
    return <div>Loading events...</div>
  }

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider')
  }
  return context
}