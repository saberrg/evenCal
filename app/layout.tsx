import type { Metadata } from 'next'
import { Rozha_One } from 'next/font/google'
import { Header } from './cutom-components/Header'
import { Footer } from './cutom-components/Footer'
import { EventProvider } from './context/sEventContext'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const rozhaOne = Rozha_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-rozha-one',
})

export const metadata: Metadata = {
  title: 'Dore Hami Events',
  description: 'Discover and plan Persian cultural events',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${rozhaOne.variable} flex flex-col min-h-screen`}>
        <AuthProvider>
          <EventProvider>
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </EventProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}