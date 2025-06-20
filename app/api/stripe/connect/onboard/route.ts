import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  console.log('🔵 ONBOARD: Route called')
  
  try {
    const requestBody = await request.json()
    console.log('🔵 ONBOARD: Request body:', requestBody)
    
    const { accountId } = requestBody

    if (!accountId) {
      console.log('🔴 ONBOARD: Missing accountId')
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    console.log('🔵 ONBOARD: Creating onboarding link for account:', accountId)

    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    // Create account link for onboarding
    console.log('🔵 ONBOARD: Creating account link...')
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/plan?refresh=${accountId}`,
      return_url: `${origin}/plan?onboarding=complete`,
      type: 'account_onboarding',
    })

    console.log('🟢 ONBOARD: Account link created:', accountLink.url)
    return NextResponse.json({
      url: accountLink.url,
      success: true
    })
  } catch (error) {
    console.error('🔴 ONBOARD: Error creating Stripe onboarding link:', error)
    
    // Check if it's a Stripe error
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('🔴 ONBOARD: Stripe error details:', {
        type: (error as any).type,
        message: (error as any).message,
        code: (error as any).code
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to create onboarding link: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
} 