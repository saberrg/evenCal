import Link from "next/link";

export default function Header() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#1e1e2e] text-white px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-4xl font-bold tracking-wider">
          Dore Hami
        </Link>
        <nav className="space-x-6">
          <Link 
            href="/events" 
            className="text-2xl hover:text-gray-200 transition-colors"
          >
            Events
          </Link>
          <Link 
            href="/venues" 
            className="text-2xl hover:text-gray-200 transition-colors"
          >
            Venues
          </Link>
          <Link 
            href="/plan-event" 
            className="text-2xl hover:text-gray-200 transition-colors"
          >
            Plan Event
          </Link>
        </nav>
      </header>
    </div>
  );
}
