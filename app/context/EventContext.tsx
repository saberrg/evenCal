'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventApi } from '@fullcalendar/core';

// Add custom event interface to extend EventApi properties
export interface CustomEventApi extends EventApi {
  extendedProps: {
    isVenueSelected: boolean;
    venueName?: string;
  };
}

interface EventContextType {
  currentEvent: CustomEventApi | null;
  setCurrentEvent: (event: CustomEventApi | null) => void;
  allEvents: CustomEventApi[];
  setAllEvents: (events: CustomEventApi[]) => void;
  isEventSelected: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [currentEvent, setCurrentEvent] = useState<CustomEventApi | null>(null);
  const [allEvents, setAllEvents] = useState<CustomEventApi[]>([]);

  // Update the localStorage save to include venue properties
  useEffect(() => {
    if (allEvents.length > 0) {
      const eventsToSave = allEvents.map(event => ({
        id: event.id,
        title: event.title,
        start: event.startStr,
        end: event.endStr,
        allDay: event.allDay,
        extendedProps: {
          isVenueSelected: event.extendedProps.isVenueSelected,
          venueName: event.extendedProps.venueName
        }
      }));
      localStorage.setItem('events', JSON.stringify(eventsToSave));
    }
  }, [allEvents]);

  const value = {
    currentEvent,
    setCurrentEvent,
    allEvents,
    setAllEvents,
    isEventSelected: currentEvent !== null,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
} 