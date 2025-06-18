'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, Download, QrCode } from 'lucide-react'
import { toast } from 'sonner'

interface Ticket {
  id: string
  event_id: string
  ticket_number: string
  status: 'active' | 'used' | 'cancelled'
  purchased_at: string
  events: {
    id: string
    name: string
    description: string
    startDateTime: string
    endDateTime: string
    venueName: string
    imageUrl?: string
  }
}

interface TicketsProps {
  userId: string
}

export function Tickets({ userId }: TicketsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [userId])

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          event_id,
          ticket_number,
          status,
          purchased_at,
          events (
            id,
            name,
            description,
            startDateTime,
            endDateTime,
            venueName,
            imageUrl
          )
        `)
        .eq('user_id', userId)
        .gte('events.startDateTime', new Date().toISOString())
        .order('events.startDateTime', { ascending: true })

      if (error) {
        toast.error('Failed to load tickets')
        console.error('Error fetching tickets:', error)
      } else {
        // Transform the data to match the Ticket interface
        const transformedTickets = (data || []).map((ticket: any) => ({
          ...ticket,
          events: ticket.events[0] // Extract the first event from the array
        }))
        setTickets(transformedTickets)
      }
    } catch (error) {
      toast.error('Failed to load tickets')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400'
      case 'used':
        return 'text-gray-400'
      case 'cancelled':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const downloadTicket = (ticket: Ticket) => {
    // This would generate and download a PDF ticket
    toast.success('Ticket download started')
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6e47c] mx-auto"></div>
        <p className="mt-2 text-white">Loading tickets...</p>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Tickets</h3>
        <p className="text-gray-300 mb-4">
          You don't have any upcoming event tickets.
        </p>
        <Button 
          className="bg-[#f6e47c] text-[#1e1e2e] hover:bg-[#e6d46c]"
          onClick={() => window.location.href = '/venues'}
        >
          Browse Events
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">My Tickets</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="bg-[#1e1e2e] border-[#3a3a4e] text-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-white">{ticket.events.name}</CardTitle>
                <span className={`text-sm font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Ticket #{ticket.ticket_number}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {ticket.events.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(ticket.events.startDateTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(ticket.events.startDateTime, ticket.events.endDateTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4" />
                  <span>{ticket.events.venueName}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#3a3a4e]">
                <Button 
                  className="w-full bg-[#f6e47c] text-[#1e1e2e] hover:bg-[#e6d46c]"
                  onClick={() => downloadTicket(ticket)}
                  disabled={ticket.status !== 'active'}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 