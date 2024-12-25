import { notFound } from "next/navigation"
import { EventInfo } from "@/app/cutom-components/event-info"

// This would normally fetch from an API
async function getEvent(name: string) {
  const event = {
    id: "123",
    name: "Winter Gala",
    venueName: "Crystal Ballroom",
    venueAddress: "123 Main St, City, State",
    startDateTime: "2024-12-21T19:00",
    endDateTime: "2024-12-22T00:00",
    createdBy: "admin",
    numberOfTickets: 100,
    ticketPrice: 75,
    addOns: ["VIP Seating", "Drink Package", "Photo Session"],
    food: ["Appetizer: Shrimp Cocktail", "Main: Filet Mignon", "Dessert: Chocolate Cake"],
    isPaid: false,
    amountBilled: 0,
    imageUrl: "/placeholder.svg?height=900&width=1600",
    description: "Join us for an elegant evening of dining and dancing."
  }
  
  return event
}

export default async function EventPage({ params }: { params: { name: string } }) {
  const event = await getEvent(params.name)
  
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

