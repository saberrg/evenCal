export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold">
            <a href="/" className="hover:text-primary-foreground/80 transition-colors">
              Dore Hami
            </a>
          </h1>
        </div>

        <nav className="ml-auto">
          <ul className="flex items-center gap-8">
            <li>
              <a href="/" className="hover:text-primary-foreground/80 transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="/calendar" className="hover:text-primary-foreground/80 transition-colors">
                Calendar
              </a>
            </li>
            <li>
              <a href="/creator" className="hover:text-primary-foreground/80 transition-colors">
                Create Event
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-primary-foreground/80 transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-primary-foreground/80 transition-colors">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}