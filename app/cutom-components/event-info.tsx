import { cn, formatDate, generateSlug } from "@/lib/utils"
import { Event } from "@/app/types/event"
import Image from "next/image"
import Link from "next/link"

interface EventInfoProps {
  event: Event
}

export function EventInfo({ event }: EventInfoProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="relative aspect-[16/9] w-full mb-8">
        <Image
          src={event.imageUrl}
          alt={event.name}
          fill
          className="object-cover rounded-lg border-2 border-[#1e1e2e]"
        />
      </div>
      
      <Link 
        href={`/event/${generateSlug(event.name)}/rsvp`}
        className="block w-full max-w-xs mx-auto mb-12 py-4 text-center text-2xl text-white bg-[#6f0c0c] rounded-full hover:bg-[#6f0c0c]/90 transition-colors"
      >
        RSVP
      </Link>

      <div className="space-y-12 mb-12">
        <section>
          <h2 className="text-2xl font-serif mb-4">Location</h2>
          <p className="text-lg">{event.venueName}</p>
          <p className="text-lg">{event.venueAddress}</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif mb-4">Menu</h2>
          <ul className="text-lg space-y-2">
            {event.food.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif mb-4">Pricing</h2>
          <p className="text-lg">${event.ticketPrice} per person</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif mb-4">Other</h2>
          <div className="text-lg space-y-2">
            <p>Event Time: {formatDate(event.startDateTime)} - {formatDate(event.endDateTime)}</p>
            <p>Available Tickets: {event.numberOfTickets}</p>
          </div>
        </section>
      </div>
    </div>
  )
}