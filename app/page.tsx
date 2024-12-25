import Image from "next/image";
import Calendar from "./components/Calendar";
import EventsList from "./components/EventsList";

export default function Home() {
  return (
    <>
      <section className="latest-event">
        <h2 className="text-2xl font-bold mb-4">Latest Event</h2>
        {/* Latest event content */}
      </section>
      
      <section className="event-list">
        <h2 className="text-2xl font-bold mb-4">EVENT LIST</h2>
        {/* Event list content */}
      </section>
    </>
  )
}


//return (
  //   <div>
  //     <Calendar editable={false} />
  //   </div>
  // );