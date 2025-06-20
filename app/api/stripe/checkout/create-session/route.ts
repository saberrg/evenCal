import { NextRequest, NextResponse } from 'next/server'
import { stripe, calculateApplicationFee } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { eventId, quantity = 1, userId } = await request.json()

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: 'Event ID and User ID are required' },
        { status: 400 }
      )
    }

    // Get event and organizer details using the new function
    const { data: organizerInfo, error: organizerError } = await supabase
      .rpc('get_event_organizer_stripe_info', { event_id: eventId })

    if (organizerError || !organizerInfo || organizerInfo.length === 0) {
      return NextResponse.json(
        { error: 'Event organizer not found' },
        { status: 404 }
      )
    }

    const organizer = organizerInfo[0]

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (!event.ticket_price || event.ticket_price <= 0) {
      return NextResponse.json(
        { error: 'This is a free event' },
        { status: 400 }
      )
    }

    // Check if event has capacity for more tickets
    const currentAttendance = event.current_attendance || 0
    const availableCapacity = event.capacity - currentAttendance
    
    if (quantity > availableCapacity) {
      return NextResponse.json(
        { error: `Only ${availableCapacity} tickets available` },
        { status: 400 }
      )
    }

    if (!organizer.stripe_account_id || !organizer.stripe_onboarding_completed) {
      return NextResponse.json(
        { error: 'Event organizer has not completed Stripe setup' },
        { status: 400 }
      )
    }

    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    // Convert price to cents
    const unitAmountCents = Math.round(event.ticket_price * 100)
    const totalAmountCents = unitAmountCents * quantity
    const applicationFeeCents = calculateApplicationFee(totalAmountCents)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${event.title} - Event Ticket`,
              description: event.short_description || event.description?.substring(0, 100) + '...',
              images: event.banner_image_url ? [event.banner_image_url] : [],
            },
            unit_amount: unitAmountCents,
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/event/${eventId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/event/${eventId}?payment=cancelled`,
              payment_intent_data: {
          application_fee_amount: applicationFeeCents,
          transfer_data: {
            destination: organizer.stripe_account_id,
          },
        },
        metadata: {
          eventId: eventId,
          userId: userId,
          quantity: quantity.toString(),
          organizerId: organizer.organizer_id.toString(),
        },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      success: true
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 