import 'server-only'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
})

// Application fee percentage (0.8%)
export const APPLICATION_FEE_PERCENT = 0.8

// Calculate application fee in cents
export const calculateApplicationFee = (amountInCents: number): number => {
  return Math.round((amountInCents * APPLICATION_FEE_PERCENT) / 100)
}

// Format price for display
export const formatPrice = (amountInCents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100)
} 