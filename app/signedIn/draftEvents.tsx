'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Calendar, MapPin, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface DraftEvent {
  id: string
  title: string
  description: string
  start_datetime: string
  end_datetime: string
  venue_id: string
  banner_image_url?: string
  status: 'draft' | 'published'
  created_at: string
  venues?: {
    name: string
  }
}

interface DraftEventsProps {
  userId: string
}

export function DraftEvents({ userId }: DraftEventsProps) {
  const [drafts, setDrafts] = useState<DraftEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDraftEvents()
  }, [userId])

  const fetchDraftEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venues (
            name
          )
        `)
        .eq('organizer_id', userId)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load draft events')
        console.error('Error fetching drafts:', error)
      } else {
        setDrafts(data || [])
      }
    } catch (error) {
      toast.error('Failed to load draft events')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteDraft = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) {
        toast.error('Failed to delete draft')
      } else {
        toast.success('Draft deleted successfully')
        fetchDraftEvents()
      }
    } catch (error) {
      toast.error('Failed to delete draft')
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

  const formatTime = (start_datetime: string, end_datetime: string) => {
    const start = new Date(start_datetime)
    const end = new Date(end_datetime)
    return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6e47c] mx-auto"></div>
        <p className="mt-2 text-white">Loading drafts...</p>
      </div>
    )
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Draft Events</h3>
        <p className="text-gray-300 mb-4">
          You haven't created any draft events yet.
        </p>
        <Button 
          className="bg-[#f6e47c] text-[#1e1e2e] hover:bg-[#e6d46c]"
          onClick={() => window.location.href = '/plan'}
        >
          Create Your First Event
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Draft Events</h2>
        <Button 
          className="bg-[#f6e47c] text-[#1e1e2e] hover:bg-[#e6d46c]"
          onClick={() => window.location.href = '/plan'}
        >
          Create New Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => (
          <Card key={draft.id} className="bg-[#1e1e2e] border-[#3a3a4e] text-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-white">{draft.title}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#f6e47c] hover:text-[#e6d46c] hover:bg-[#3a3a4e]"
                    onClick={() => window.location.href = `/plan?edit=${draft.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-[#3a3a4e]"
                    onClick={() => deleteDraft(draft.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {draft.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(draft.start_datetime)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(draft.start_datetime, draft.end_datetime)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4" />
                  <span>{draft.venues?.name || 'No venue selected'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#3a3a4e]">
                <Button 
                  className="w-full bg-[#f6e47c] text-[#1e1e2e] hover:bg-[#e6d46c]"
                  onClick={() => window.location.href = `/plan?edit=${draft.id}`}
                >
                  Continue Editing
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 