"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  formatDate,
  DateSelectArg,
  EventClickArg,
  EventApi,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEvent } from '@/app/context/EventContext';
import { useRouter } from 'next/navigation';

// Add the interface for the component props
interface CalendarProps {
  editable?: boolean;
  showEvents?: boolean;
}

// Add these type definitions at the top of the file
interface CustomEventApi extends EventApi {
  extendedProps: {
    isVenueSelected: boolean;
    venueName?: string;
  };
}

// Near the top of the file, add sample events
const SAMPLE_EVENTS = [
  {
    id: '1',
    title: 'Company Meeting',
    start: new Date(2024, 2, 15, 10, 0),
    end: new Date(2024, 2, 15, 12, 0),
    extendedProps: {
      isVenueSelected: true,
      venueName: 'Conference Room A'
    }
  },
  {
    id: '2',
    title: 'Team Lunch',
    start: new Date(2024, 2, 20, 12, 30),
    end: new Date(2024, 2, 20, 14, 0),
    extendedProps: {
      isVenueSelected: true,
      venueName: 'Cafeteria'
    }
  }
];

const Calendar: React.FC<CalendarProps> = ({ editable = true, showEvents = true }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [newEventTime, setNewEventTime] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const { currentEvent, setCurrentEvent, allEvents, setAllEvents } = useEvent();
  const router = useRouter();

  // Load initial events from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEvents = JSON.parse(localStorage.getItem("events") || "[]");
      const initialEvents = savedEvents.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
      // We'll set these when the calendar loads through eventsSet
    }
  }, []);

  const handleDateClick = (selected: DateSelectArg) => {
    setSelectedDate(selected);
    setIsDialogOpen(true);
  };

  const handleEventClick = (selected: EventClickArg) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event "${selected.event.title}"?`
      )
    ) {
      selected.event.remove();
      // Clear currentEvent if it's the one being deleted
      if (currentEvent && currentEvent.id === selected.event.id) {
        setCurrentEvent(null);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle && selectedDate) {
      const calendarApi = selectedDate.view.calendar;
      calendarApi.unselect();

      // Create new Date objects for start and end times
      const startDate = new Date(selectedDate.start);
      const endDate = new Date(selectedDate.start);

      if (newEventTime) {
        // Parse time string properly
        const timeMatch = newEventTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const period = timeMatch[3]?.toUpperCase();

          // Convert to 24-hour format if AM/PM is provided
          if (period) {
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
          }

          // Set the hours and minutes for both start and end dates
          startDate.setHours(hours, minutes, 0);
          endDate.setHours(hours + 1, minutes, 0);
        }
      } else {
        // If no specific time is set, make it an all-day event
        startDate.setHours(0, 0, 0);
        endDate.setHours(23, 59, 59);
      }

      const newEvent = {
        id: `${selectedDate.start.toISOString()}-${newEventTitle}`,
        title: newEventTitle,
        start: startDate,
        end: endDate,
        allDay: !newEventTime,
        extendedProps: {
          isVenueSelected: false
        }
      };

      const eventApi = calendarApi.addEvent(newEvent);
      setCurrentEvent(eventApi as CustomEventApi);
      handleCloseDialog();
    }
  };

  const handleDisabledButtonClick = useCallback(() => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000); // Hide tooltip after 3 seconds
  }, []);

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-white">
      <div className="flex flex-col lg:flex-row w-full gap-6 relative">
        <div className={`${
          editable 
            ? "w-full lg:w-4/5" 
            : "w-full"
        } min-h-[500px] lg:min-h-[85vh]`}>
          <FullCalendar
            height="100%"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={editable}
            selectable={editable}
            selectMirror={editable}
            dayMaxEvents={true}
            select={editable ? handleDateClick : undefined}
            eventClick={editable ? handleEventClick : undefined}
            eventsSet={(events: EventApi[]) => {
              setAllEvents(events as CustomEventApi[]);
            }}
            initialEvents={
              typeof window !== "undefined"
                ? JSON.parse(localStorage.getItem("events") || "[]").map((event: any) => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end)
                  }))
                : SAMPLE_EVENTS
            }
            // Add responsive views
            views={{
              dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' }
              },
              timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
              },
              timeGridDay: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
              },
              listWeek: {
                titleFormat: { year: 'numeric', month: 'long' }
              }
            }}
          />
        </div>

        {/* Only show the sidebar if editable is true */}
        {editable && (
          <div className="lg:w-1/5">
            <div className="sticky top-4 bg-white rounded-lg shadow-md p-4 space-y-4">
              <div className="relative">
                <button
                  onClick={currentEvent ? () => router.push('/venues') : handleDisabledButtonClick}
                  className={`w-full px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    currentEvent 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-blue-300 cursor-not-allowed text-white'
                  }`}
                  aria-disabled={!currentEvent}
                >
                  <span>Next: Select Venue</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
                
                {showTooltip && !currentEvent && (
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md text-sm whitespace-nowrap z-50">
                    Please create an event first
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 
                                  border-l-8 border-r-8 border-b-8 
                                  border-l-transparent border-r-transparent border-b-gray-800">
                    </div>
                  </div>
                )}
              </div>

              {/* Events List */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">My Events</h3>
                <div className="space-y-3">
                  {allEvents.length > 0 ? (
                    allEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="p-3 bg-gray-50 border border-gray-200"
                      >
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(event.start!, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            meridiem: true
                          })}
                        </p>
                        {!event.allDay && (
                          <p className="text-sm text-gray-600">
                            Duration: {event.end ? 
                              `${Math.round((event.end.getTime() - event.start!.getTime()) / (1000 * 60))} minutes` 
                              : '1 hour'}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No events scheduled</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Only include the Dialog if editable is true */}
      {editable && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]" aria-describedby="event-form-description">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add New Event Details</DialogTitle>
            </DialogHeader>
            <div id="event-form-description" className="sr-only">
              Form to add a new calendar event with title and time
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleAddEvent}>
              <div className="space-y-2">
                <label htmlFor="event-title" className="text-sm font-medium">
                  Event Title
                </label>
                <input
                  id="event-title"
                  type="text"
                  placeholder="Enter event title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="event-time" className="text-sm font-medium">
                  Event Time
                </label>
                <input
                  id="event-time"
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  pattern="[0-9]{2}:[0-9]{2}"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors mt-4"
              >
                Add Event
              </button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Calendar;