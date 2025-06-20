'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/context/AuthContext'

interface TicketPurchaseButtonProps {
  eventId: string
  eventTitle: string
  ticketPrice: number
  availableCapacity: number
}

export default function TicketPurchaseButton({ 
  eventId, 
  eventTitle, 
  ticketPrice, 
  availableCapacity 
}: TicketPurchaseButtonProps) {
  const { user } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in to purchase tickets')
      return
    }

    if (quantity > availableCapacity) {
      toast.error(`Only ${availableCapacity} tickets available`)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          quantity,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout')
    } finally {
      setIsLoading(false)
    }
  }

  if (availableCapacity <= 0) {
    return (
      <Button disabled className="w-full">
        Sold Out
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="quantity" className="text-sm font-medium">
          Quantity:
        </label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max={availableCapacity}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-20"
        />
        <span className="text-sm text-gray-600">
          (Max: {availableCapacity})
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">
          Total: ${(ticketPrice * quantity).toFixed(2)}
        </span>
        <span className="text-sm text-gray-600">
          + 0.8% platform fee
        </span>
      </div>

      <Button
        onClick={handlePurchase}
        disabled={isLoading || quantity <= 0}
        className="w-full bg-[#f6e47c] text-[#1e1e2e] hover:bg-[#e6d46c]"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating Checkout...
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy {quantity} Ticket{quantity > 1 ? 's' : ''} - ${(ticketPrice * quantity).toFixed(2)}
          </>
        )}
      </Button>
    </div>
  )
} 