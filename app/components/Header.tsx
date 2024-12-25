'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#1e1e2e] text-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold tracking-wider">
          Dore Hami
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/venues" className="hover:text-[#f6e47c] transition-colors">
            Venues
          </Link>
          <Link href="/plan-event" className="hover:text-[#f6e47c] transition-colors">
            Plan Event
          </Link>
          <Link href="/about" className="hover:text-[#f6e47c] transition-colors">
            About
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#1e1e2e] text-white">
            <nav className="flex flex-col gap-4">
              <Link href="/venues" className="text-lg hover:text-[#f6e47c] transition-colors">
                Venues
              </Link>
              <Link href="/plan-event" className="text-lg hover:text-[#f6e47c] transition-colors">
                Plan Event
              </Link>
              <Link href="/about" className="text-lg hover:text-[#f6e47c] transition-colors">
                About
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}