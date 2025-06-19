'use client'

import { useEventContext } from '../../context/sEventContext'
import { EventInfo } from '@/app/cutom-components/event-info'
import { generateSlug } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { use } from 'react'

export default function EventPage({ params }: { params: Promise<{ name: string }> }) {
  const { events } = useEventContext()
  const resolvedParams = use(params)
  const event = events.find(e => generateSlug(e.name) === resolvedParams.name)

  if (!event) {
    notFound()
  }

  return (
    <main className="min-h-screen py-12">
      <div className="w-full bg-[#f6e47c] py-4 mb-12">
        <h1 className="text-center text-2xl">
          {event.name} at {event.venueName} {" "}
          {new Date(event.startDateTime).toLocaleDateString()} {" "}
          {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {" "}
          {new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </h1>
      </div>
      <EventInfo event={event} />
    </main>
  )
}