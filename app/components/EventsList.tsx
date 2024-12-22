import { formatDate } from "@fullcalendar/core";
import { CustomEventApi } from "../context/EventContext";

interface EventsListProps {
  events: CustomEventApi[];
}

export default function EventsList({ events }: EventsListProps) {
  return (
    <div className="lg:w-1/5">
      <div className="sticky top-4 bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">My Events</h3>
          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((event) => (
                <div 
                  key={event.id} 
                  className="p-3 bg-gray-50 border border-gray-200"
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
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No events scheduled</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 