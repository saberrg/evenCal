# Stripe Integration Guide

This guide explains how the Stripe integration works in the event planning application and how to set it up.

## Overview

The application uses **Stripe Connect** to enable event organizers to receive payments directly to their own Stripe accounts, while the platform takes a 0.8% application fee.

## Features

- **Stripe Connect**: Event organizers create their own Stripe accounts
- **Automatic onboarding**: Triggered when ticket price > $0
- **Application fees**: 0.8% automatically deducted from each transaction
- **Direct payments**: Money goes directly to organizer's Stripe account
- **Webhook handling**: Automatic ticket creation and event updates

## Architecture

```
User buys ticket → Stripe Checkout → Organizer's Stripe Account (minus 0.8% fee)
                                  ↓
                              Webhook → Database update → Ticket creation
```

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys (get these from your Stripe dashboard)
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_... (get this when setting up webhooks)
```

### 2. Database Migration

Run the database migration to add required tables and fields:

```sql
-- Apply the migration in supabase/migrations/add_stripe_fields.sql
-- This adds:
-- - stripe_account_id and stripe_onboarding_completed to users table
-- - tickets table for managing ticket purchases
-- - current_attendance field to events table
-- - helper function for updating attendance
```

### 3. Stripe Dashboard Setup

1. **Create Stripe Account**: Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Enable Connect**: Navigate to Connect → Settings → Enable Connect
3. **Set up Webhooks**:
   - Go to Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/stripe/webhooks`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy the webhook secret to your environment variables

### 4. Test the Integration

1. **Create a paid event** with ticket price > $0
2. **Stripe setup prompt** should appear
3. **Complete onboarding** flow
4. **Test ticket purchase** flow

## How It Works

### Event Planning Flow

1. **User creates event** with ticket price > $0
2. **Stripe setup required** - `StripeConnectSetup` component appears
3. **Create Stripe account** - API call to `/api/stripe/connect/create-account`
4. **Redirect to onboarding** - Stripe handles KYC and verification
5. **Return to app** - Account status checked and updated
6. **Event can be published** - Only after Stripe setup is complete

### Ticket Purchase Flow

1. **User clicks "Buy Ticket"** on event page
2. **Checkout session created** - API call to `/api/stripe/checkout/create-session`
3. **Redirect to Stripe Checkout** - Secure payment processing
4. **Payment processed** - Money goes to organizer's account (minus 0.8% fee)
5. **Webhook triggered** - `/api/stripe/webhooks` processes the payment
6. **Ticket created** - Database updated with ticket information
7. **User redirected back** - Confirmation page shown

## API Endpoints

### Stripe Connect
- `POST /api/stripe/connect/create-account` - Create Stripe Connect account
- `POST /api/stripe/connect/onboard` - Create onboarding link
- `POST /api/stripe/connect/account-status` - Check account status

### Payment Processing
- `POST /api/stripe/checkout/create-session` - Create checkout session
- `POST /api/stripe/webhooks` - Handle Stripe webhooks

## Database Schema

### Users Table (additions)
```sql
stripe_account_id TEXT -- Stripe Connect account ID
stripe_onboarding_completed BOOLEAN DEFAULT FALSE -- Onboarding status
```

### Tickets Table (new)
```sql
id UUID PRIMARY KEY
event_id UUID REFERENCES events(id)
user_id UUID REFERENCES users(id)
status TEXT DEFAULT 'confirmed'
purchase_date TIMESTAMP
stripe_session_id TEXT
price_paid DECIMAL(10,2)
```

### Events Table (additions)
```sql
current_attendance INTEGER DEFAULT 0 -- Track ticket sales
```

## Security Considerations

1. **Webhook verification** - All webhooks are verified using Stripe signatures
2. **Server-side validation** - Payment amounts and event details verified
3. **Secure redirects** - All URLs validated and sanitized
4. **Environment variables** - Sensitive keys stored securely

## Error Handling

- **Account creation failures** - User-friendly error messages
- **Onboarding incomplete** - Clear prompts to complete setup
- **Payment failures** - Graceful handling with retry options
- **Webhook failures** - Automatic retry with exponential backoff

## Testing

### Test Cards
Use Stripe's test cards for development:
- Success: `4242424242424242`
- Decline: `4000000000000002`
- 3D Secure: `4000000000003220`

### Test Webhooks
Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoints to production URLs
- [ ] Test complete payment flow
- [ ] Verify application fee collection
- [ ] Monitor webhook delivery
- [ ] Set up proper error logging

## Troubleshooting

### Common Issues

1. **Webhook not triggering**
   - Check webhook URL is correct and accessible
   - Verify webhook secret matches environment variable
   - Check Stripe dashboard for webhook delivery status

2. **Onboarding redirect not working**
   - Ensure return and refresh URLs are correctly configured
   - Check that the domain is added to Stripe's allowed domains

3. **Payment not processing**
   - Verify Stripe Connect account is fully onboarded
   - Check that charges_enabled and payouts_enabled are true
   - Ensure application fee calculation is correct

## Support

For issues with the Stripe integration:
1. Check Stripe Dashboard logs
2. Review webhook delivery status
3. Verify environment variables are set correctly
4. Check application logs for error messages 