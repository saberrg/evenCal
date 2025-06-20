-- Add Stripe Connect fields to existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for Stripe account lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id ON public.users(stripe_account_id) TABLESPACE pg_default;

-- Add Stripe payment fields to existing bookings table
-- Note: total_amount and payment_status already exist, just adding Stripe-specific fields
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS application_fee_amount NUMERIC(10,2) DEFAULT 0;

-- Create indexes for Stripe lookups on bookings
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session_id ON public.bookings(stripe_session_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent_id ON public.bookings(stripe_payment_intent_id) TABLESPACE pg_default;

-- Create function to update booking payment status
CREATE OR REPLACE FUNCTION update_booking_payment_status(
    booking_id UUID, 
    new_status CHARACTER VARYING(20),
    session_id TEXT DEFAULT NULL,
    payment_intent_id TEXT DEFAULT NULL,
    amount NUMERIC(10,2) DEFAULT NULL,
    fee_amount NUMERIC(10,2) DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.bookings 
    SET 
        payment_status = new_status,
        stripe_session_id = COALESCE(session_id, stripe_session_id),
        stripe_payment_intent_id = COALESCE(payment_intent_id, stripe_payment_intent_id),
        total_amount = COALESCE(amount, total_amount),
        application_fee_amount = COALESCE(fee_amount, application_fee_amount),
        updated_at = NOW()
    WHERE id = booking_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get event organizer stripe info
CREATE OR REPLACE FUNCTION get_event_organizer_stripe_info(event_id UUID)
RETURNS TABLE(
    organizer_id UUID,
    stripe_account_id TEXT,
    stripe_onboarding_completed BOOLEAN,
    organizer_name TEXT,
    organizer_email CHARACTER VARYING(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as organizer_id,
        u.stripe_account_id,
        u.stripe_onboarding_completed,
        CONCAT(u.first_name, ' ', u.last_name) as organizer_name,
        u.email as organizer_email
    FROM public.events e
    JOIN public.users u ON e.organizer_id = u.id
    WHERE e.id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate unique booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS CHARACTER VARYING(20) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result CHARACTER VARYING(20) := '';
    i INT := 0;
    random_index INT;
BEGIN
    -- Generate 8-character random string with prefix 'BK'
    result := 'BK';
    FOR i IN 1..8 LOOP
        random_index = floor(random() * length(chars) + 1);
        result = result || substr(chars, random_index, 1);
    END LOOP;
    
    -- Check if this reference already exists
    WHILE EXISTS(SELECT 1 FROM public.bookings WHERE booking_reference = result) LOOP
        result := 'BK';
        FOR i IN 1..8 LOOP
            random_index = floor(random() * length(chars) + 1);
            result = result || substr(chars, random_index, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add current_attendance column to events table if it doesn't exist
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS current_attendance INTEGER DEFAULT 0;

-- Create function to increment event attendance
CREATE OR REPLACE FUNCTION increment_event_attendance(event_id UUID, increment_by INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE public.events 
    SET current_attendance = COALESCE(current_attendance, 0) + increment_by,
        updated_at = NOW()
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql; 