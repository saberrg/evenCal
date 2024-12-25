'use client';

import React from 'react';
import { useEvents } from '@/app/context/sEventContext';

const EventsList: React.FC = () => {
  const { events } = useEvents();

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">My Events</h3>
      <div className="space-y-3">
        {events.length > 0 ? (
          events.map((event) => (
            <div 
              key={event.eventId} 
              className="p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              <h4 className="font-medium text-gray-900">{event.venueName}</h4>
              <p className="text-sm text-gray-600">
                Start: {new Date(event.startDateTime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                End: {new Date(event.endDateTime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Created by: {event.createdBy}
              </p>
              <p className="text-sm text-gray-600">
                Tickets Available: {event.numberOfTickets}
              </p>
              <p className="text-sm text-gray-600">
                Price: ${event.ticketPrice}
              </p>
              {event.addOns.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Add-ons: {event.addOns.join(', ')}
                </p>
              )}
              {event.food.length > 0 && (
                <p className="text-sm text-gray-600">
                  Food Options: {event.food.join(', ')}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No events scheduled</p>
        )}
      </div>
    </div>
  );
};

export default EventsList; 