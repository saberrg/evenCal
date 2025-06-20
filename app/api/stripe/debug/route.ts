import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🔍 DEBUG: Stripe configuration check')
  
  try {
    // Check environment variables
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY
    const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET
    
    console.log('🔍 DEBUG: Environment check:', {
      hasStripeKey,
      hasPublishableKey,
      hasWebhookSecret,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
    })

    // Try to import Stripe
    const { stripe } = await import('@/lib/stripe')
    console.log('🔍 DEBUG: Stripe import successful')

    // Test basic Stripe functionality
    const balance = await stripe.balance.retrieve()
    console.log('🔍 DEBUG: Stripe API test successful')

    return NextResponse.json({
      status: 'success',
      environment: {
        hasStripeKey,
        hasPublishableKey,
        hasWebhookSecret,
        stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
      },
      stripeTest: {
        balance: balance.available[0]?.amount || 0,
        currency: balance.available[0]?.currency || 'usd'
      }
    })
  } catch (error) {
    console.error('🔴 DEBUG: Error in debug route:', error)
    
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    )
  }
} 