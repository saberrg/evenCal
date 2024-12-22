"use client";

import React, { useState, useEffect } from "react";
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

const Calendar: React.FC = () => {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [newEventTime, setNewEventTime] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const { currentEvent, setCurrentEvent } = useEvent();
  const router = useRouter();

  useEffect(() => {
    if (currentEvents && currentEvents.length > 0) {
      currentEvents.forEach(event => {
        console.log("Event Title:", event.title);
        console.log("Start Date and Time:", event.start);
        console.log("End Date and Time:", event.end);
      });
    }
  }, [currentEvents]);

  useEffect(() => {
    if (currentEvents.length > 0) {
      const eventsToSave = currentEvents.map(event => ({
        id: event.id,
        title: event.title,
        start: event.startStr,
        end: event.endStr,
        allDay: event.allDay
      }));
      localStorage.setItem('events', JSON.stringify(eventsToSave));
    }
  }, [currentEvents]);

  const handleDateClick = (selected: DateSelectArg) => {
    setSelectedDate(selected);
    setIsDialogOpen(true);
  };

  const handleEventClick = (selected: EventClickArg) => {
    // Prompt user for confirmation before deleting an event
    if (
      window.confirm(
        `Are you sure you want to delete the event "${selected.event.title}"?`
      )
    ) {
      selected.event.remove();
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
      };

      const eventApi = calendarApi.addEvent(newEvent);
      setCurrentEvent(eventApi);
      handleCloseDialog();
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-white">
      <div className="flex flex-col lg:flex-row w-full gap-6 relative">
        {/* Calendar Container */}
        <div className="w-full lg:w-4/5 min-h-[500px] lg:min-h-[85vh]">
          <FullCalendar
            height="100%"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            eventsSet={(events) => setCurrentEvents(events)}
            initialEvents={
              typeof window !== "undefined"
                ? JSON.parse(localStorage.getItem("events") || "[]").map((event: any) => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end)
                  }))
                : []
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

        {/* Venue Selection Button - Now responsive */}
        <div className="lg:w-1/5">
          <div className="sticky top-4 bg-white rounded-lg shadow-md p-4">
            <button
              onClick={() => router.push('/venues')}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!currentEvent}
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
            
            {/* Optional: Add event summary */}
            {currentEvent && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Selected Event</h3>
                <p className="text-gray-700">{currentEvent.title}</p>
                <p className="text-sm text-gray-500">
                  {currentEvent.start?.toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog remains the same but with improved styling */}
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
    </div>
  );
};

export default Calendar;