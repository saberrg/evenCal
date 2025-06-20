import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔵 CREATE ACCOUNT: Route called')
  
  try {
    const requestBody = await request.json()
    console.log('🔵 CREATE ACCOUNT: Request body:', requestBody)
    
    const { userId, email, firstName, lastName } = requestBody

    if (!userId || !email) {
      console.log('🔴 CREATE ACCOUNT: Missing required fields', { userId, email })
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    console.log('🔵 CREATE ACCOUNT: Creating Stripe account for:', { userId, email, firstName, lastName })

    // Create Stripe Connect account
    console.log('🔵 CREATE ACCOUNT: Calling Stripe API...')
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        first_name: firstName,
        last_name: lastName,
        email: email,
      },
    })
    
    console.log('🔵 CREATE ACCOUNT: Stripe account created:', account.id)

    // Update user record with Stripe account ID
    console.log('🔵 CREATE ACCOUNT: Updating user record...')
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        stripe_account_id: account.id,
        stripe_onboarding_completed: false 
      })
      .eq('id', userId)

    if (updateError) {
      console.error('🔴 CREATE ACCOUNT: Error updating user with Stripe account ID:', updateError)
      return NextResponse.json(
        { error: 'Failed to save Stripe account information' },
        { status: 500 }
      )
    }

    console.log('🟢 CREATE ACCOUNT: Successfully created and saved account:', account.id)
    return NextResponse.json({
      accountId: account.id,
      success: true
    })
  } catch (error) {
    console.error('🔴 CREATE ACCOUNT: Error creating Stripe Connect account:', error)
    
    // Check if it's a Stripe error
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('🔴 CREATE ACCOUNT: Stripe error details:', {
        type: (error as any).type,
        message: (error as any).message,
        code: (error as any).code
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to create Stripe account: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
} 