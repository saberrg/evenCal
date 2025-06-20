'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, CreditCard, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'
import type { CustomUser } from '@/app/types/user'

interface StripeConnectSetupProps {
  onSetupComplete: () => void
  ticketPrice: number
}

export default function StripeConnectSetup({ onSetupComplete, ticketPrice }: StripeConnectSetupProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<CustomUser | null>(null)
  const [accountStatus, setAccountStatus] = useState<{
    hasAccount: boolean
    onboardingComplete: boolean
    accountId?: string
  }>({ hasAccount: false, onboardingComplete: false })

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }

      setUserProfile(data)
      if (data) {
        await checkAccountStatus(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const checkAccountStatus = async (profile: CustomUser) => {
    if (!profile.stripe_account_id) {
      setAccountStatus({
        hasAccount: false,
        onboardingComplete: false
      })
      return
    }

    try {
      const response = await fetch('/api/stripe/connect/account-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: profile.id,
          accountId: profile.stripe_account_id 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAccountStatus({
          hasAccount: !!profile.stripe_account_id,
          onboardingComplete: data.onboardingComplete || false,
          accountId: profile.stripe_account_id
        })

        if (data.onboardingComplete) {
          onSetupComplete()
        }
      }
    } catch (error) {
      console.error('Error checking account status:', error)
    }
  }

  const createStripeAccount = async () => {
    if (!user || !userProfile) return

    console.log('🔵 STRIPE SETUP: Starting account creation...')
    console.log('🔵 STRIPE SETUP: User profile:', userProfile)

    setIsLoading(true)
    try {
      const requestBody = {
        userId: userProfile.id,
        email: user.email,
        firstName: userProfile.first_name || 'User',
        lastName: userProfile.last_name || 'User',
      }
      
      console.log('🔵 STRIPE SETUP: Request body:', requestBody)

      const response = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      console.log('🔵 STRIPE SETUP: Response status:', response.status)
      console.log('🔵 STRIPE SETUP: Response headers:', Object.fromEntries(response.headers.entries()))

      // Get response text first to see what we're getting
      const responseText = await response.text()
      console.log('🔵 STRIPE SETUP: Raw response:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
        console.log('🔵 STRIPE SETUP: Parsed data:', data)
      } catch (parseError) {
        console.error('🔴 STRIPE SETUP: JSON parse error:', parseError)
        console.error('🔴 STRIPE SETUP: Response was not valid JSON:', responseText)
        throw new Error('Server returned invalid JSON response')
      }

      if (!response.ok) {
        console.error('🔴 STRIPE SETUP: API error:', data)
        throw new Error(data.error || 'Failed to create Stripe account')
      }

      console.log('🟢 STRIPE SETUP: Account created successfully, starting onboarding...')
      // Start onboarding process
      await startOnboarding(data.accountId)
    } catch (error) {
      console.error('🔴 STRIPE SETUP: Error creating Stripe account:', error)
      toast.error('Failed to create Stripe account: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const startOnboarding = async (accountId: string) => {
    console.log('🔵 START ONBOARDING: Starting with account ID:', accountId)
    
    try {
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      })

      console.log('🔵 START ONBOARDING: Response status:', response.status)

      // Get response text first to see what we're getting
      const responseText = await response.text()
      console.log('🔵 START ONBOARDING: Raw response:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
        console.log('🔵 START ONBOARDING: Parsed data:', data)
      } catch (parseError) {
        console.error('🔴 START ONBOARDING: JSON parse error:', parseError)
        console.error('🔴 START ONBOARDING: Response was not valid JSON:', responseText)
        throw new Error('Server returned invalid JSON response')
      }

      if (!response.ok) {
        console.error('🔴 START ONBOARDING: API error:', data)
        throw new Error(data.error || 'Failed to create onboarding link')
      }

      console.log('🟢 START ONBOARDING: Redirecting to:', data.url)
      // Redirect to Stripe onboarding
      window.location.href = data.url
    } catch (error) {
      console.error('🔴 START ONBOARDING: Error starting onboarding:', error)
      toast.error('Failed to start onboarding process: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const resumeOnboarding = () => {
    if (accountStatus.accountId) {
      startOnboarding(accountStatus.accountId)
    }
  }

  if (accountStatus.onboardingComplete) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Stripe Account Ready
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Your payment processing is set up and ready to receive payments.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            Payment Setup Required
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            Since your event has a ticket price of ${ticketPrice.toFixed(2)}, you need to set up 
            payment processing through Stripe to receive payments directly to your account.
          </p>
          <div className="bg-yellow-100 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>How it works:</strong>
            </p>
            <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
              <li>Payments go directly to your Stripe account</li>
              <li>We charge a small 0.8% application fee</li>
              <li>You keep the majority of ticket sales</li>
              <li>Secure and PCI-compliant processing</li>
            </ul>
          </div>
          <div className="flex gap-3">
            {!accountStatus.hasAccount ? (
              <Button
                onClick={createStripeAccount}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Set Up Payment Processing
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={resumeOnboarding}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 