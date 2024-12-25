import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { EventProvider } from './context/sEventContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={`${inter.className} flex flex-col min-h-screen`}>
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