'use client'

import { useEvents } from "./context/sEventContext";

export default function Home() {
  const { events } = useEvents();
  return (

    


    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', minHeight: '100vh' }}>
      {events.map(event => (
        <div key={event.eventId}>
          <p>Venue: {event.venueName}</p>
          <p>Start: {event.startDateTime}</p>
          <p>End: {event.endDateTime}</p>
          <p>Created by: {event.createdBy}</p>
          <p>Tickets: {event.numberOfTickets}</p>
          <p>Price: ${event.ticketPrice}</p>
          <hr/>
        </div>
      ))}
    </div>
  )
}

