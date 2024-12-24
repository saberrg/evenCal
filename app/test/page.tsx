'use client'

import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { EventContentArg, EventInput } from '@fullcalendar/core'

// Sample JSON data structure
const sampleEvents = [
  {
    id: '1',
    title: 'Team Meeting',
    start: '2024-03-20T10:00:00',
    end: '2024-03-20T11:30:00',
    backgroundColor: '#3788d8',
    description: 'Weekly team sync'
  },
  {
    id: '2',
    title: 'Conference',
    start: '2024-03-25',
    end: '2024-03-27',
    allDay: true,
    backgroundColor: '#38B000',
    description: 'Annual Tech Conference'
  },
  {
    id: '3',
    title: 'Client Call',
    start: '2024-03-21T15:00:00',
    end: '2024-03-21T16:00:00',
    backgroundColor: '#FF6B6B',
    description: 'Product demo'
  },
  {
    id: '4',
    title: 'Sprint Planning',
    start: '2024-03-22T09:00:00',
    end: '2024-03-22T12:00:00',
    backgroundColor: '#4361EE',
    description: 'Q2 Planning'
  },
  {
    id: '5',
    title: 'Deadline',
    start: '2024-03-29',
    allDay: true,
    backgroundColor: '#BC4749',
    description: 'Project submission'
  }
]

const sampleEvents2 = [
  {
    id: '1',
    title: 'Workshop',
    start: '2024-03-22T13:00:00',
    end: '2024-03-22T17:00:00',
    backgroundColor: '#FF9F1C',
    description: 'React Workshop'
  },
  {
    id: '2',
    title: 'Training',
    start: '2024-03-27',
    end: '2024-03-28',
    allDay: true,
    backgroundColor: '#7209B7',
    description: 'New hire training'
  },
  {
    id: '3',
    title: 'Review',
    start: '2024-03-23T14:00:00',
    end: '2024-03-23T15:30:00',
    backgroundColor: '#4CC9F0',
    description: 'Code review session'
  },
  {
    id: '4',
    title: 'Deployment',
    start: '2024-03-24',
    allDay: true,
    backgroundColor: '#F72585',
    description: 'Version 2.0 release'
  },
  {
    id: '5',
    title: 'Team Building',
    start: '2024-03-26T13:00:00',
    end: '2024-03-26T17:00:00',
    backgroundColor: '#4895EF',
    description: 'Outdoor activities'
  }
]

export default function DemoApp() {
  const [events1, setEvents1] = useState<EventInput[]>([])
  const [events2, setEvents2] = useState<EventInput[]>([])
  const calendar1Ref = useRef<any>(null)
  const calendar2Ref = useRef<any>(null)

//   useEffect(() => {
//     // Simulate fetching events from an API
//     const fetchEvents = async () => {
//       try {
//         setEvents1(sampleEvents)
//         setEvents2(sampleEvents2)
//       } catch (error) {
//         console.error('Error fetching events:', error)
//       }
//     }

//     fetchEvents()
//   }, [])

  const handleDateSelect = (calendarId: number) => (selectInfo: any) => {

    //The popover spot



    const title = prompt('Please enter a title for the event')
    if (title) {
      const description = prompt('Enter event description (optional)')
      const newEvent: EventInput = {
        id: String(Date.now()),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
        backgroundColor: calendarId === 1 ? '#3788d8' : '#FF9F1C',
        description: description || undefined
      }
      if (calendarId === 1) {
        setEvents1([...events1, newEvent])
      } else {
        setEvents2([...events2, newEvent])
      }
    }
    selectInfo.view.calendar.unselect()
  }

  const handleEventClick = (calendarId: number) => (clickInfo: any) => {
    if (confirm('Would you like to delete this event?')) {
      if (calendarId === 1) {
        setEvents1(events1.filter(event => event.id !== clickInfo.event.id))
      } else {
        setEvents2(events2.filter(event => event.id !== clickInfo.event.id))
      }
    }
  }

  const handleViewChange = (calendarId: number) => (viewType: string) => {
    if (calendarId === 1 && calendar1Ref.current) {
      const calendarApi = calendar1Ref.current.getApi()
      calendarApi.changeView(viewType)
    } else if (calendarId === 2 && calendar2Ref.current) {
      const calendarApi = calendar2Ref.current.getApi()
      calendarApi.changeView(viewType)
    }
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] p-4 w-full max-w-[90rem] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {/* First Calendar */}
        <div className="w-full h-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Calendar 1</h2>
            <select 
              value="dayGridWeek" 
              onChange={(e) => handleViewChange(1)(e.target.value)}
              className="border rounded p-1"
            >
              <option value="dayGridWeek">Week</option>
              <option value="dayGridMonth">Month</option>
            </select>
          </div>
          <FullCalendar
            ref={calendar1Ref}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridWeek"
            weekends={true}
            events={events1}
            eventContent={renderEventContent}
            height="100%"
            editable={true}
            selectable={true}
            select={handleDateSelect(1)}
            eventClick={handleEventClick(1)}
            eventColor="#378006"
          />
        </div>

        {/* Second Calendar */}
        <div className="w-full h-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Calendar 2</h2>
            <select 
              value="dayGridMonth" 
              onChange={(e) => handleViewChange(2)(e.target.value)}
              className="border rounded p-1"
            >
              <option value="dayGridWeek">Week</option>
              <option value="dayGridMonth">Month</option>
            </select>
          </div>
          <FullCalendar
            ref={calendar2Ref}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            weekends={true}
            events={events2}
            eventContent={renderEventContent}
            height="100%"
            editable={true}
            selectable={true}
            select={handleDateSelect(2)}
            eventClick={handleEventClick(2)}
            eventColor="#ff4444"
          />
        </div>
      </div>
    </div>
  )
}

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <div className="event-content p-1">
      <div className="font-semibold text-sm">
        {eventInfo.timeText && (
          <span className="mr-1 text-xs">{eventInfo.timeText}</span>
        )}
        {eventInfo.event.title}
      </div>
      {eventInfo.event.extendedProps.description && (
        <div className="text-xs opacity-75 truncate">
          {eventInfo.event.extendedProps.description}
        </div>
      )}
    </div>
  )
}