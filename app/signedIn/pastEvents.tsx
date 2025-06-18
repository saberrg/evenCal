'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, Users, Star } from 'lucide-react'
import { toast } from 'sonner'

interface PastEvent {
  id: string
  name: string
  description: string
  startDateTime: string
  endDateTime: string
  venueName: string
  imageUrl?: string
  attendee_count: number
  rating?: number
  attended_at: string
}

interface PastEventsProps {
  userId: string
}

export function PastEvents({ userId }: PastEventsProps) {
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPastEvents()
  }, [userId])

  const fetchPastEvents = async () => {
    try {
      // This would need to be adjusted based on your actual database schema
      // Assuming you have an attendees table or similar
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          event_id,
          attended_at,
          events (
            id,
            name,
            description,
            startDateTime,
            endDateTime,
            venueName,
            imageUrl,
            attendee_count
          )
        `)
        .eq('user_id', userId)
        .lt('events.startDateTime', new Date().toISOString())
        .order('attended_at', { ascending: false })

      if (error) {
        toast.error('Failed to load past events')
        console.error('Error fetching past events:', error)
      } else {
        // Transform the data to match our interface
        const transformedData = data?.map(item => ({
          id: item.events[0].id,
          name: item.events[0].name,
          description: item.events[0].description,
          startDateTime: item.events[0].startDateTime,
          endDateTime: item.events[0].endDateTime,
          venueName: item.events[0].venueName,
          imageUrl: item.events[0].imageUrl,
          attendee_count: item.events[0].attendee_count,
          attended_at: item.attended_at
        })) || []
        
        setPastEvents(transformedData)
      }
    } catch (error) {
      toast.error('Failed to load past events')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (startDateTime: string, endDateTime: string) => {
    const start = new Date(startDateTime)
    const end = new Date(endDateTime)
    return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6e47c] mx-auto"></div>
        <p className="mt-2 text-white">Loading past events...</p>
      </div>
    )
  }

  if (pastEvents.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Past Events</h3>
        <p className="text-gray-300 mb-4">
          You haven't attended any events yet.
        </p>
        <Button 
          className="bg-[#f6e47c] text-[#1e1e2e] hover:bg-[#e6d46c]"
          onClick={() => window.location.href = '/venues'}
        >
          Discover Events
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Past Events</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pastEvents.map((event) => (
          <Card key={event.id} className="bg-[#1e1e2e] border-[#3a3a4e] text-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-white">{event.name}</CardTitle>
              </div>
              <p className="text-sm text-gray-400">
                Attended on {formatDate(event.attended_at)}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {event.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.startDateTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(event.startDateTime, event.endDateTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venueName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="h-4 w-4" />
                  <span>{event.attendee_count} attendees</span>
                </div>
              </div>

              {event.rating && (
                <div className="mt-4 flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#f6e47c]" />
                  <span className="text-[#f6e47c]">{event.rating}/5</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 