'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#1e1e2e]">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          {/* Logo Section - Left */}
          <div className="w-1/3">
            <div className="relative h-10">
              <Link href="/" className="absolute inset-0 text-4xl font-bold text-white whitespace-nowrap font-[--font-rozha-one]">
                Dore Hami
              </Link>
            </div>
          </div>

          {/* Desktop Navigation - Right */}
          <div className="w-1/3 hidden md:flex justify-end items-center gap-8">
            {[
              { href: '/venues', label: 'Venues' },
              { href: '/plan-event', label: 'Plan Event' },
              { href: '/about', label: 'About' }
            ].map((item) => (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  className="text-white hover:text-[#f6e47c] transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

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
        </nav>
      </div>
    </header>
  )
}