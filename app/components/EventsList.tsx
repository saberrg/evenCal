import React from 'react';
import { EventApi, formatDate } from '@fullcalendar/core';
import { CustomEventApi } from '@/types/calendar';

interface EventsListProps {
  events: CustomEventApi[];
}

const EventsList: React.FC<EventsListProps> = ({ events }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">My Events</h3>
      <div className="space-y-3">
        {events.length > 0 ? (
          events.map((event) => (
            <div 
              key={event.id} 
              className="p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              <h4 className="font-medium text-gray-900">{event.title}</h4>
              <p className="text-sm text-gray-600">
                {formatDate(event.start!, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  meridiem: true
                })}
              </p>
              {!event.allDay && (
                <p className="text-sm text-gray-600">
                  Duration: {event.end ? 
                    `${Math.round((event.end.getTime() - event.start!.getTime()) / (1000 * 60))} minutes` 
                    : '1 hour'}
                </p>
              )}
              {event.extendedProps.venueName && (
                <p className="text-sm text-gray-600 mt-1">
                  Venue: {event.extendedProps.venueName}
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