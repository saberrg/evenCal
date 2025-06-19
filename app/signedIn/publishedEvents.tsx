'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Calendar, MapPin, Tag, Edit } from 'lucide-react'

interface PublishedEventsProps {
  userId: string
}

type PublishedEvent = {
  id: string;
  title: string;
  start_datetime: string;
  venues: { name: string } | null;
  tags: string[] | null;
};

export function PublishedEvents({ userId }: PublishedEventsProps) {
  const [events, setEvents] = useState<PublishedEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchPublishedEvents()
    }
  }, [userId])

  const fetchPublishedEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_datetime, tags, venues(name)')
        .eq('organizer_id', userId)
        .eq('status', 'published')
        .order('start_datetime', { ascending: true })

      if (error) {
        toast.error('Failed to fetch published events.')
        console.error('Error fetching events:', error)
      } else if (data) {
        setEvents(data as unknown as PublishedEvent[])
      }
    } catch (error) {
      toast.error('An unexpected error occurred.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f6e47c] mx-auto"></div>
        <p className="mt-2 text-white">Loading published events...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center text-white py-8">
        <h3 className="text-xl font-semibold">No Published Events</h3>
        <p className="text-gray-400 mt-2">You haven't published any events yet.</p>
        <Link href="/plan" className="mt-4 inline-block bg-[#f6e47c] text-[#1e1e2e] font-bold py-2 px-4 rounded-lg hover:bg-[#e6d46c] transition-colors">
          Create an Event
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <div key={event.id} className="bg-[#1e1e2e] p-6 rounded-lg border border-[#3a3a4e] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-white">{event.title}</h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.start_datetime).toLocaleString()}</span>
            </div>
            {event.venues && (
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                <MapPin className="h-4 w-4" />
                <span>{event.venues.name}</span>
              </div>
            )}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Tag className="h-4 w-4 text-gray-400" />
                {event.tags.map((tag: string) => (
                  <span key={tag} className="bg-[#3a3a4e] px-2 py-1 rounded-full text-xs text-white">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <Link href={`/plan?edit=${event.id}`} className="flex items-center justify-center px-4 py-2 rounded-lg bg-[#3a3a4e] text-white hover:bg-[#4a4a5e] transition-colors text-sm font-medium">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
} 