'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface VenueImage {
  url: string;
  alt: string;
}

export interface Venue {
  id: number;
  name: string;
  capacity: number;
  type: 'Indoor' | 'Outdoor';
  catering: boolean;
  menuLink?: string;
  images: VenueImage[];
}

export interface VenueAvailability {
  venueId: number;
  isAvailable: boolean;
  conflictingEvents?: {
    id: string;
    title: string;
    start_datetime: string;
    end_datetime: string;
  }[];
}

const venues: Venue[] = [
  {
    id: 1,
    name: 'Grand Ballroom',
    capacity: 500,
    type: 'Indoor',
    catering: true,
    menuLink: '/menus/grand-ballroom.pdf',
    images: [
      { url: '/venues/grand-ballroom-1.jpg', alt: 'Grand Ballroom Main Hall' },
      { url: '/venues/grand-ballroom-2.jpg', alt: 'Grand Ballroom Stage Area' },
    ],
  },
  {
    id: 2,
    name: 'Garden Terrace',
    capacity: 200,
    type: 'Outdoor',
    catering: true,
    menuLink: '/menus/garden-terrace.pdf',
    images: [
      { url: '/venues/garden-terrace-1.jpg', alt: 'Garden Terrace Overview' },
      { url: '/venues/garden-terrace-2.jpg', alt: 'Garden Terrace Seating Area' },
    ],
  },
  {
    id: 3,
    name: 'Conference Hall',
    capacity: 300,
    type: 'Indoor',
    catering: false,
    images: [
      { url: '/venues/conference-hall-1.jpg', alt: 'Conference Hall Main View' },
    ],
  },
];

interface VenueContextType {
  venues: Venue[];
  checkVenueAvailability: (venueId: number, startDateTime: string, endDateTime: string, excludeEventId?: string) => Promise<VenueAvailability>;
  getAvailableVenues: (startDateTime: string, endDateTime: string, excludeEventId?: string) => Promise<VenueAvailability[]>;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export function VenueProvider({ children }: { children: ReactNode }) {
  // Check if a venue is available for a specific date/time range
  const checkVenueAvailability = async (
    venueId: number, 
    startDateTime: string, 
    endDateTime: string, 
    excludeEventId?: string
  ): Promise<VenueAvailability> => {
    try {
      const venue = venues.find(v => v.id === venueId);
      if (!venue) {
        return { venueId, isAvailable: false };
      }

      // Query for conflicting events at this venue
      // Events conflict if they overlap in time: 
      // (event_start < new_end) AND (event_end > new_start)
      let query = supabase
        .from('events')
        .select('id, title, start_datetime, end_datetime')
        .eq('venue_id', venueId.toString())
        .neq('status', 'cancelled')
        .lt('start_datetime', endDateTime)
        .gt('end_datetime', startDateTime);

      // Exclude current event if editing
      if (excludeEventId) {
        query = query.neq('id', excludeEventId);
      }

      const { data: conflictingEvents, error } = await query;

      if (error) {
        console.error('Error checking venue availability:', error);
        return { venueId, isAvailable: false };
      }

      const isAvailable = !conflictingEvents || conflictingEvents.length === 0;

      return {
        venueId,
        isAvailable,
        conflictingEvents: conflictingEvents || []
      };
    } catch (error) {
      console.error('Error in checkVenueAvailability:', error);
      return { venueId, isAvailable: false };
    }
  };

  // Get availability for all venues for a specific date/time range
  const getAvailableVenues = async (
    startDateTime: string, 
    endDateTime: string, 
    excludeEventId?: string
  ): Promise<VenueAvailability[]> => {
    const availabilityPromises = venues.map(venue => 
      checkVenueAvailability(venue.id, startDateTime, endDateTime, excludeEventId)
    );

    try {
      const availabilities = await Promise.all(availabilityPromises);
      return availabilities;
    } catch (error) {
      console.error('Error getting available venues:', error);
      return venues.map(venue => ({ venueId: venue.id, isAvailable: false }));
    }
  };

  const value = {
    venues,
    checkVenueAvailability,
    getAvailableVenues,
  };

  return (
    <VenueContext.Provider value={value}>
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue() {
  const context = useContext(VenueContext);
  if (context === undefined) {
    throw new Error('useVenue must be used within a VenueProvider');
  }
  return context;
} 