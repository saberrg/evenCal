"use client"
import React, { useState } from 'react'
import {
  EventApi,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  formatDate,
} from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { INITIAL_EVENTS, createEventId } from './event-utils'
import { PopoverDemo } from '../Popover'

export default function CalendarWrapper() {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (!selectInfo.jsEvent) return;
    const rect = (selectInfo.jsEvent.target as HTMLElement).getBoundingClientRect();
    setClickPosition({ x: rect.left, y: rect.top });
    setSelectedDate(selectInfo.start);
    setIsPopoverOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    // Your event click logic here
  };

  const handleEvents = (events: EventApi[]) => {
    // Your events set logic here
  };

  const renderEventContent = (eventContent: EventContentArg) => {
    return (
      <>
        <b>{eventContent.timeText}</b>
        <i>{eventContent.event.title}</i>
      </>
    )
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-white">
      <div className="calendar-container" style={{ height: '988px' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          initialView='dayGridMonth'
          editable={true}
          selectable={true}
          selectMirror={true}
          weekends={weekendsVisible}
          initialEvents={INITIAL_EVENTS}
          select={handleDateSelect}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          eventsSet={handleEvents}
          //height="100%"
        />
        <PopoverDemo 
          open={isPopoverOpen} 
          onOpenChange={setIsPopoverOpen}
          position={clickPosition}
        />
      </div>
    </div>
  )
}   