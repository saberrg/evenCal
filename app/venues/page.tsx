'use client';

import { useState, useEffect } from 'react';
import { useEventContext } from '../context/sEventContext';
import { useVenue, VenueAvailability } from '../context/VenueContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export default function VenuePage() {
  const { events, updateEvent } = useEventContext();
  const { venues, getAvailableVenues } = useVenue();
  const router = useRouter();
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [venueAvailabilities, setVenueAvailabilities] = useState<VenueAvailability[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const currentEvent = events[events.length - 1];

  // Initialize dates from current event if available
  useEffect(() => {
    if (currentEvent && currentEvent.startDateTime && currentEvent.endDateTime) {
      setStartDateTime(currentEvent.startDateTime.slice(0, 16)); // Format for datetime-local input
      setEndDateTime(currentEvent.endDateTime.slice(0, 16));
    }
  }, [currentEvent]);

  // Check availability when dates change
  useEffect(() => {
    if (startDateTime && endDateTime) {
      checkAvailability();
    } else {
      setVenueAvailabilities([]);
    }
  }, [startDateTime, endDateTime]);

  const checkAvailability = async () => {
    if (!startDateTime || !endDateTime) return;

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      alert('End date and time must be after start date and time');
      return;
    }

    setIsCheckingAvailability(true);
    try {
      const availabilities = await getAvailableVenues(
        startDateTime, 
        endDateTime, 
        currentEvent?.id
      );
      setVenueAvailabilities(availabilities);
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const getVenueAvailability = (venueId: number): VenueAvailability | null => {
    return venueAvailabilities.find(va => va.venueId === venueId) || null;
  };

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

  const filteredVenues = showOnlyAvailable && venueAvailabilities.length > 0
    ? venues.filter(venue => {
        const availability = getVenueAvailability(venue.id);
        return availability?.isAvailable;
      })
    : venues;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        {currentEvent ? `Select Venue for: ${currentEvent.name || 'New Event'}` : 'Available Venues'}
      </h1>

      {/* Date Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Check Venue Availability</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="start-datetime" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time
            </label>
            <input
              id="start-datetime"
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="end-datetime" className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time
            </label>
            <input
              id="end-datetime"
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={checkAvailability}
              disabled={!startDateTime || !endDateTime || isCheckingAvailability}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
            </button>
            
            {venueAvailabilities.length > 0 && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show only available</span>
              </label>
            )}
          </div>
        </div>

        {startDateTime && endDateTime && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Checking availability from {new Date(startDateTime).toLocaleDateString()} at {new Date(startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                {' '} to {new Date(endDateTime).toLocaleDateString()} at {new Date(endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVenues.map((venue) => {
          const availability = getVenueAvailability(venue.id);
          const isAvailable = !availability || availability.isAvailable;
          
          return (
            <div 
              key={venue.id}
              className={`border rounded-lg p-6 transition-all duration-200 ${
                isAvailable 
                  ? 'hover:shadow-lg cursor-pointer border-gray-200' 
                  : 'border-red-200 bg-red-50 cursor-not-allowed opacity-75'
              }`}
              onClick={() => isAvailable && handleVenueSelect(venue.name)}
            >
              {/* Availability Badge */}
              {venueAvailabilities.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  {isAvailable ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Available</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Not Available</span>
                    </>
                  )}
                </div>
              )}

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
              <p className="text-gray-600">Capacity: {venue.capacity}</p>
              <p className="text-gray-600">Type: {venue.type}</p>
              
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

              {/* Show conflicting events if venue is not available */}
              {availability && !availability.isAvailable && availability.conflictingEvents && availability.conflictingEvents.length > 0 && (
                <div className="mt-3 p-3 bg-red-100 rounded-md">
                  <p className="text-sm font-medium text-red-700 mb-2">Conflicting Events:</p>
                  {availability.conflictingEvents.map((event) => (
                    <div key={event.id} className="text-xs text-red-600 mb-1">
                      <p className="font-medium">{event.title}</p>
                      <p>
                        {new Date(event.start_datetime).toLocaleDateString()} {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' '} - {' '}
                        {new Date(event.end_datetime).toLocaleDateString()} {new Date(event.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredVenues.length === 0 && venues.length > 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Available Venues</h3>
          <p className="text-gray-500">
            No venues are available for the selected time period. Try adjusting your dates or check back later.
          </p>
        </div>
      )}
    </div>
  );
} 