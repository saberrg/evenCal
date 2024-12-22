'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventApi } from '@fullcalendar/core';

interface EventContextType {
  currentEvent: EventApi | null;
  setCurrentEvent: (event: EventApi | null) => void;
  allEvents: EventApi[];
  setAllEvents: (events: EventApi[]) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [currentEvent, setCurrentEvent] = useState<EventApi | null>(null);
  const [allEvents, setAllEvents] = useState<EventApi[]>([]);

  // Persist events to localStorage whenever they change
  useEffect(() => {
    if (allEvents.length > 0) {
      const eventsToSave = allEvents.map(event => ({
        id: event.id,
        title: event.title,
        start: event.startStr,
        end: event.endStr,
        allDay: event.allDay
      }));
      localStorage.setItem('events', JSON.stringify(eventsToSave));
    }
  }, [allEvents]);

  return (
    <EventContext.Provider value={{ currentEvent, setCurrentEvent, allEvents, setAllEvents }}>
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