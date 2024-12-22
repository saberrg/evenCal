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

const Calendar: React.FC = () => {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [newEventTime, setNewEventTime] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);

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
        const [hours, minutes] = newEventTime.split(':').map(Number);
        
        // Set the hours and minutes for both start and end dates
        startDate.setHours(hours, minutes, 0); // Set seconds to 0
        endDate.setHours(hours + 1, minutes, 0); // End time is 1 hour later
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
        allDay: !newEventTime, // Set allDay based on whether time was specified
      };

      calendarApi.addEvent(newEvent);
      handleCloseDialog();
    }
  };

  return (
    <div>
      <div className="flex w-full px-10 justify-center items-center gap-8">
        <div className="w-3/4 mt-8">
          <FullCalendar
            height={"85vh"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // Initialize calendar with required plugins.
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }} // Set header toolbar options.
            initialView="dayGridMonth" // Initial view mode of the calendar.
            editable={true} // Allow events to be edited.
            selectable={true} // Allow dates to be selectable.
            selectMirror={true} // Mirror selections visually.
            dayMaxEvents={true} // Limit the number of events displayed per day.
            select={handleDateClick} // Handle date selection to create new events.
            eventClick={handleEventClick} // Handle clicking on events (e.g., to delete them).
            eventsSet={(events) => setCurrentEvents(events)} // Update state with current events whenever they change.
            initialEvents={
              typeof window !== "undefined"
                ? JSON.parse(localStorage.getItem("events") || "[]").map((event: any) => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end)
                  }))
                : []
            } // Initial events loaded from local storage.
          />
        </div>
      </div>

      {/* Dialog for adding new events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent aria-describedby="event-form-description">
          <DialogHeader>
            <DialogTitle>Add New Event Details</DialogTitle>
          </DialogHeader>
          <div id="event-form-description" className="sr-only">
            Form to add a new calendar event with title and time
          </div>
          <form className="flex flex-col items-center space-y-4 mb-4" onSubmit={handleAddEvent}>
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)} // Update new event title as the user types.
              required
              className="border border-gray-200 p-3 rounded-md text-lg w-full"
            />
            <input
              type="time"
              value={newEventTime}
              onChange={(e) => {
                const timeValue = e.target.value;
                const [hours, minutes] = timeValue.split(':');
                setNewEventTime(`${hours}:${minutes}`); // Set time without seconds
              }}
              className="border border-gray-200 p-3 rounded-md text-lg w-full"
              step="60" // Step in minutes to avoid seconds
            />
            <button
              className="bg-green-500 text-white p-3 rounded-md w-full"
              type="submit"
            >
              Add
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar; // Export the Calendar component for use in other parts of the application.