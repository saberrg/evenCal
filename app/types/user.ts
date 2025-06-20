import { User as SupabaseUser } from '@supabase/supabase-js'

export interface CustomUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  stripe_account_id?: string
  stripe_onboarding_completed?: boolean
  is_organizer?: boolean
  auth_user_id: string
  created_at?: string
}

export interface ExtendedUser extends SupabaseUser {
  // Profile data from users table
  profile?: CustomUser
} 