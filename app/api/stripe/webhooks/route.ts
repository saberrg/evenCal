import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No Stripe signature found' },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const { eventId, userId, quantity, organizerId } = session.metadata

  if (!eventId || !userId || !quantity) {
    console.error('Missing required metadata in checkout session')
    return
  }

  try {
    // Get user contact information for booking
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, phone')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return
    }

    // Generate unique booking reference
    const { data: bookingRef, error: refError } = await supabase
      .rpc('generate_booking_reference')

    if (refError) {
      console.error('Error generating booking reference:', refError)
      return
    }

    // Create booking record matching your exact schema
    const bookingData = {
      booking_reference: bookingRef,
      user_id: userId,
      event_id: eventId,
      total_amount: session.amount_total / 100, // Convert from cents
      payment_status: 'completed',
      payment_method: 'stripe',
      payment_reference: session.payment_intent,
      status: 'active',
      contact_email: userData.email,
      contact_phone: userData.phone || null,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      application_fee_amount: (session.amount_total * 0.8) / 10000, // 0.8% fee
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking record:', bookingError)
      return
    }

    // Update event attendance count
    const { error: attendanceError } = await supabase
      .rpc('increment_event_attendance', {
        event_id: eventId,
        increment_by: parseInt(quantity)
      })

    if (attendanceError) {
      console.error('Error updating event attendance:', attendanceError)
      // Don't return - booking is still valid
    }

    console.log(`Successfully processed booking ${booking.booking_reference} (${booking.id}) for event ${eventId}`)
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  // Additional handling for payment success if needed
  console.log('Payment intent succeeded:', paymentIntent.id)
} 