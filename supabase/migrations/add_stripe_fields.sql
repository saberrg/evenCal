-- Add Stripe-related fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for Stripe account lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id ON users(stripe_account_id);

-- Create tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'confirmed',
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    stripe_session_id TEXT,
    price_paid DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for tickets table
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_stripe_session_id ON tickets(stripe_session_id);

-- Create function to increment event attendance
CREATE OR REPLACE FUNCTION increment_event_attendance(event_id UUID, increment_by INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE events 
    SET current_attendance = COALESCE(current_attendance, 0) + increment_by,
        updated_at = NOW()
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Add current_attendance column to events table if it doesn't exist
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS current_attendance INTEGER DEFAULT 0; 