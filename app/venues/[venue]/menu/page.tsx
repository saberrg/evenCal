'use client';

import { useVenue } from '../../../context/VenueContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export default function VenueMenuPage() {
  const { venues } = useVenue();
  const params = useParams();
  const venueSlug = params.venue as string;

  const venue = venues.find(v => slugify(v.name) === venueSlug);

  if (!venue) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Venue Not Found</h1>
        <Link href="/venues" className="text-blue-600 hover:underline">
          Back to Venues
        </Link>
      </div>
    );
  }

  if (!venue.catering || !venue.menuLink) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">No Menu Available</h1>
        <p>This venue does not offer catering services.</p>
        <Link href="/venues" className="text-blue-600 hover:underline">
          Back to Venues
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/venues" className="text-blue-600 hover:underline">
          Back to Venues
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">{venue.name} - Menu</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <iframe
          src={venue.menuLink}
          className="w-full h-[800px]"
          title={`${venue.name} Menu`}
        />
      </div>
    </div>
  );
} 