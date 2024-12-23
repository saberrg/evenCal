'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { EventContentArg } from '@fullcalendar/core'

export default function DemoApp() {
  const [events] = useState([
    {
      title: 'Meeting',
      start: new Date().toISOString().split('T')[0]
    }
  ])

  return (
    <div className="h-[calc(100vh-10rem)] p-4 w-full max-w-7xl mx-auto flex items-center justify-center">
      <div className="aspect-square h-full max-h-full w-auto">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView='dayGridMonth'
          weekends={false}
          events={events}
          eventContent={renderEventContent}
          height="100%"
        />
      </div>
    </div>
  )
}

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  )
}