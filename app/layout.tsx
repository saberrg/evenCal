import type { Metadata } from 'next'
import { Rozha_One } from 'next/font/google'
import { Header } from './cutom-components/Header'
import { Footer } from './cutom-components/Footer'
import { EventProvider } from './context/sEventContext'
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
        <EventProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </EventProvider>
      </body>
    </html>
  )
}