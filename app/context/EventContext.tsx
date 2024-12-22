'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventApi } from '@fullcalendar/core';

interface EventContextType {
  currentEvent: EventApi | null;
  setCurrentEvent: (event: EventApi | null) => void;
  isEventSelected: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [currentEvent, setCurrentEvent] = useState<EventApi | null>(null);
  const [isEventSelected, setIsEventSelected] = useState(false);

  useEffect(() => {
    setIsEventSelected(!!currentEvent);
  }, [currentEvent]);

  return (
    <EventContext.Provider 
      value={{ 
        currentEvent, 
        setCurrentEvent,
        isEventSelected 
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (undefined === context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
} 