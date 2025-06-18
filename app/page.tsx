'use client'

import { HeroSection } from './cutom-components/hero-section'
import { EventList } from './cutom-components/EventsList'
import { useEventContext } from './context/sEventContext'

export default function Home() {
  const { events } = useEventContext()

  const featuredEvent = events[0]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatTime = (startDateTime: string, endDateTime: string) => {
    const start = new Date(startDateTime)
    const end = new Date(endDateTime)
    return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }

  return (
    <div className="flex flex-col">
      {featuredEvent && (
        <HeroSection
          imageUrl={featuredEvent.imageUrl || 'https://via.placeholder.com/800x400/e5e7eb/6b7280?text=Event+Image'}
          title={featuredEvent.name}
          venue={featuredEvent.venueName}
          date={formatDate(featuredEvent.startDateTime)}
          time={formatTime(featuredEvent.startDateTime, featuredEvent.endDateTime)}
        />
      )}

      <section className="container mx-auto py-8 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Event List
        </h2>
        <EventList />
      </section>
    </div>
  )
}