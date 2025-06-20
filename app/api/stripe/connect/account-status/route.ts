import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { accountId, userId } = await request.json()

    if (!accountId || !userId) {
      return NextResponse.json(
        { error: 'Account ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check account status with Stripe
    const account = await stripe.accounts.retrieve(accountId)

    const isOnboardingComplete = account.details_submitted && 
                                account.charges_enabled && 
                                account.payouts_enabled

    // Update user record with onboarding status
    if (isOnboardingComplete) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_onboarding_completed: true })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating user onboarding status:', updateError)
      }
    }

    return NextResponse.json({
      accountId: account.id,
      onboardingComplete: isOnboardingComplete,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      success: true
    })
  } catch (error) {
    console.error('Error checking Stripe account status:', error)
    return NextResponse.json(
      { error: 'Failed to check account status' },
      { status: 500 }
    )
  }
} 