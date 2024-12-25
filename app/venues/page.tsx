'use client';

import { useEvents } from '../context/sEventContext';
import { useVenue } from '../context/VenueContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export default function VenuePage() {
  const { events, updateEvent } = useEvents();
  const { venues } = useVenue();
  const router = useRouter();

  // Get the current event (assuming it's the last one in the list)
  const currentEvent = events[events.length - 1];

  const handleVenueSelect = (venueName: string) => {
    if (currentEvent) {
      const updatedEvent = {
        ...currentEvent,
        venueName: venueName
      };
      updateEvent(updatedEvent);
    }
  };

  const handleMenuClick = (e: React.MouseEvent, venueName: string) => {
    e.stopPropagation();
    router.push(`/venues/${slugify(venueName)}/menu`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        {currentEvent ? `Select Venue for: ${currentEvent.venueName || 'New Event'}` : 'Available Venues'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <div 
            key={venue.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleVenueSelect(venue.name)}
          >
            {venue.images.length > 0 && (
              <div className="relative h-48 mb-4">
                <Image
                  src={venue.images[0].url}
                  alt={venue.images[0].alt}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <h2 className="text-xl font-semibold">{venue.name}</h2>
            <p>Capacity: {venue.capacity}</p>
            <p>Type: {venue.type}</p>
            {venue.catering && (
              <div className="mt-2">
                <p className="text-green-600">Catering Available</p>
                {venue.menuLink && (
                  <button 
                    onClick={(e) => handleMenuClick(e, venue.name)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Menu
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 