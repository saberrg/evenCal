'use client'

import { useEvent } from "../context/EventContext";
import Calendar from "../components/Calendar";

export default function CalendarPage() {
  const { allEvents: events } = useEvent();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Event Calendar</h1>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <Calendar viewOnly={true} />
        </div>
      </div>
    </main>
  );
}
