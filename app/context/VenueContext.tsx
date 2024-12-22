'use client';

import React, { createContext, useContext, ReactNode } from 'react';

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
  // Add more venue-related functions here as needed
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export function VenueProvider({ children }: { children: ReactNode }) {
  const value = {
    venues,
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