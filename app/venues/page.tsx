'use client';

import { useEvent } from '../context/EventContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const venues = [
  { id: 1, name: 'Grand Ballroom', capacity: 500, type: 'Indoor' },
  { id: 2, name: 'Garden Terrace', capacity: 200, type: 'Outdoor' },
  { id: 3, name: 'Conference Hall', capacity: 300, type: 'Indoor' },
  // Add more venues as needed
];

export default function VenuePage() {
  const { currentEvent, isEventSelected } = useEvent();
  const router = useRouter();

  useEffect(() => {
    if (!isEventSelected) {
      router.push('/');
    }
  }, [isEventSelected, router]);

  if (!currentEvent) {
    return <div>Please select an event first</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Select Venue for: {currentEvent.title}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <div 
            key={venue.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h2 className="text-xl font-semibold">{venue.name}</h2>
            <p>Capacity: {venue.capacity}</p>
            <p>Type: {venue.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 