'use client'

import { useEventContext } from '../context/sEventContext'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function EventList() {
  const { events } = useEventContext()

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/event/${generateSlug(event.name)}`}
          className="group relative bg-[#1e1e2e] text-white p-4 md:p-6 rounded-lg flex items-center justify-between hover:bg-[#1e1e2e]/90 transition-colors"
        >
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              {event.name} @ {event.venueName}
            </h3>
            <p className="text-gray-300 mb-1">{event.venueAddress}</p>
            <p className="text-gray-300">
              {new Date(event.startDateTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </p>
            <p className="text-[#f6e47c] mt-2">
              ${event.ticketPrice.toFixed(2)} per ticket
            </p>
          </div>
          <div className="bg-[#f6e47c] text-[#1e1e2e] p-2 rounded-full">
            <ArrowRight className="h-6 w-6" />
          </div>
        </Link>
      ))}
    </div>
  )
}
