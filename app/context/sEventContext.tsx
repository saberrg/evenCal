'use client'

import React, { createContext, useContext, useState } from 'react';
import { Event, createNewEvent } from '../object/eventObject';
import { mockEvents } from './otjer/sampleEvents';

// Define the context type
interface EventContextType {
  events: Event[];
  addEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (updatedEvent: Event) => void;
}

// Create the context
const EventContext = createContext<EventContextType | undefined>(undefined);

// Create the provider component
export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  // Fetch events on component mount
  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        //const fetchedEvents = await getEvents();
        
        const fetchedEvents = mockEvents;
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        // Optionally set some error state here
      }
    };

    fetchEvents();
  }, []); // Empty dependency array means this runs once on mount

  // Log events after they have been set
  React.useEffect(() => {
    if (events.length > 0) {
      console.log('THIS IS FROM THE CONTEXT', events[0]);
    }
  }, [events]); // Dependency on events to log when they change

  /**
   * Adds a new event to the events list
   * 
   * @example
   * // Create and add a new event
   * const newEvent = createNewEvent();
   * newEvent.venueName = "Concert Hall";
   * newEvent.startDateTime = "2024-03-20T19:00";
   * addEvent(newEvent);
   * 
   * // Add an existing event object
   * addEvent(existingEventObject);
   */
  const addEvent = (event: Event) => {
    setEvents(prevEvents => [...prevEvents, event]);
  };

  /**
   * Removes an event from the events list using its ID
   * 
   * @example
   * // Remove a specific event
   * removeEvent("123e4567-e89b-12d3-a456-426614174000");
   * 
   * // Remove event from a click handler
   * const handleDelete = (eventId: string) => {
   *   removeEvent(eventId);
   * };
   */
  const removeEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.eventId !== eventId));
  };

  /**
   * Updates an existing event in the events list
   * The event to update is identified by its eventId
   * 
   * @example
   * // Update event details
   * const eventToUpdate = events.find(e => e.eventId === targetId);
   * if (eventToUpdate) {
   *   const updatedEvent = {
   *     ...eventToUpdate,
   *     venueName: "New Venue Name",
   *     ticketPrice: 50
   *   };
   *   updateEvent(updatedEvent);
   * }
   * 
   * // Update from a form submission
   * const handleSubmit = (formData: Event) => {
   *   updateEvent(formData);
   * };
   */
  const updateEvent = (updatedEvent: Event) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.eventId === updatedEvent.eventId ? updatedEvent : event
      )
    );
  };

  const value = {
    events,
    addEvent,
    removeEvent,
    updateEvent,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

/**
 * Custom hook to access the event context
 * Must be used within an EventProvider component
 * 
 * @example
 * // In a component
 * function EventComponent() {
 *   const { events, addEvent, removeEvent, updateEvent } = useEvents();
 * 
 *   // Access events array
 *   const totalEvents = events.length;
 * 
 *   // Use context functions
 *   const handleCreateEvent = () => {
 *     const newEvent = createNewEvent();
 *     addEvent(newEvent);
 *   };
 * }
 * 
 * @throws {Error} If used outside of EventProvider
 */
export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
