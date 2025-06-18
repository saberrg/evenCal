'use client'

import Link from 'next/link'
import { Menu, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/app/context/AuthContext'
import { toast } from 'sonner'

export function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1e1e2e]">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          {/* Logo Section - Left */}
          <div className="flex-1">
            <div className="relative h-10">
              <Link href="/" className="absolute inset-0 text-4xl font-bold text-white whitespace-nowrap font-[--font-rozha-one]">
                Dore Hami
              </Link>
            </div>
          </div>

          {/* Desktop Navigation - Right */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-8">
            {[
              { href: '/venues', label: 'Venues' },
              { href: '/plan-event', label: 'Plan Event' },
              { href: '/about', label: 'About' },
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
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/settings"
                  className="text-white hover:text-[#f6e47c] transition-colors whitespace-nowrap"
                >
                  Settings
                </Link>
                <span className="text-white text-sm">
                  Welcome, {user.user_metadata?.name || user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-[#f6e47c] hover:bg-[#3a3a4e]"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link
                href="/account"
                className="text-white hover:text-[#f6e47c] transition-colors whitespace-nowrap"
              >
                Account
              </Link>
            )}
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
                {user ? (
                  <>
                    <div className="border-t border-[#3a3a4e] pt-4">
                      <Link href="/settings" className="text-lg hover:text-[#f6e47c] transition-colors block mb-4">
                        Settings
                      </Link>
                      <p className="text-sm text-gray-300 mb-2">
                        Welcome, {user.user_metadata?.name || user.email}
                      </p>
                      <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        className="w-full justify-start text-white hover:text-[#f6e47c] hover:bg-[#3a3a4e]"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <Link href="/account" className="text-lg hover:text-[#f6e47c] transition-colors">
                    Sign In
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  )
}