'use client';

import { useEvent } from '../context/EventContext';
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
  const { currentEvent } = useEvent();
  const { venues } = useVenue();
  const router = useRouter();

  const handleMenuClick = (e: React.MouseEvent, venueName: string) => {
    e.stopPropagation();
    router.push(`/venues/${slugify(venueName)}/menu`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        {currentEvent ? `Select Venue for: ${currentEvent.title}` : 'Available Venues'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <div 
            key={venue.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
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