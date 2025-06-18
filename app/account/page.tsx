'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Key } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/app/context/AuthContext'
import { UserEvents } from '../signedIn/userEvents'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const otpSchema = z.object({
  otp: z.string().length(6, 'Please enter the 6-digit code'),
})

type EmailForm = z.infer<typeof emailSchema>
type OtpForm = z.infer<typeof otpSchema>

export default function AccountPage() {
  const { user, loading } = useAuth()
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  // All hooks must be called before any conditional returns
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  })

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  })

  // Clear OTP form whenever we show the OTP input
  useEffect(() => {
    if (isOtpSent) {
      otpForm.reset({ otp: '' })
      // Clear any form errors
      otpForm.clearErrors()
    }
  }, [isOtpSent, otpForm])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6e47c] mx-auto"></div>
          <p className="mt-2 text-[#1e1e2e]">Loading...</p>
        </div>
      </div>
    )
  }

  // Render UserEvents if user is authenticated
  if (user) {
    return <UserEvents />
  }

  const sendOtp = async (email: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined,
          data: {
            type: 'otp'
          }
        },
      })

      if (error) {
        toast.error(error.message)
      } else {
        setUserEmail(email)
        setIsOtpSent(true)
        otpForm.reset({ otp: '' })
        toast.success('Verification code sent to your email!')
      }
    } catch (error) {
      toast.error('Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async (otp: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: otp,
        type: 'email',
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Successfully signed in!')
        // The auth context will automatically update and redirect
      }
    } catch (error) {
      toast.error('Failed to verify code')
    } finally {
      setIsLoading(false)
    }
  }

  const onEmailSubmit = (data: EmailForm) => {
    sendOtp(data.email)
  }

  const onOtpSubmit = (data: OtpForm) => {
    verifyOtp(data.otp)
  }

  const handleBackToEmail = () => {
    setIsOtpSent(false)
    setUserEmail('')
    emailForm.reset()
    // Explicitly reset OTP form with empty string to prevent any value carryover
    otpForm.reset({ otp: '' })
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-2 text-[#1e1e2e]">
            {isOtpSent 
              ? 'Enter Verification Code' 
              : 'Welcome'
            }
          </h2>
          <p className="text-[#1e1e2e] text-lg">
            {isOtpSent 
              ? `We sent a 6-digit code to ${userEmail}` 
              : ''
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#2a2a3e] rounded-lg p-8 shadow-xl border border-[#3a3a4e]">
          {isOtpSent ? (
            // OTP Verification Form
            <Form {...otpForm} key="otp-form">
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Verification Code</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            name={field.name}
                            value={field.value || ''}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="one-time-code"
                            autoFocus
                            className="pl-10 bg-[#1e1e2e] border-[#3a3a4e] text-white placeholder:text-gray-400 focus:border-[#f6e47c] focus:ring-[#f6e47c] text-center text-lg tracking-widest"
                            placeholder="000000"
                            maxLength={6}
                            onChange={(e) => {
                              // Only allow numeric input and ensure clean state
                              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                              field.onChange(value)
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#f6e47c] text-[#1e1e2e] hover:bg-[#e6d46c] font-semibold py-3 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-[#f6e47c] hover:text-[#e6d46c] text-sm"
                  >
                    ← Back to email
                  </button>
                </div>
              </form>
            </Form>
          ) : (
            // Sign In Form
            <Form {...emailForm} key="email-form">
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            {...field}
                            type="email"
                            className="pl-10 bg-[#1e1e2e] border-[#3a3a4e] text-white placeholder:text-gray-400 focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                            placeholder="Enter your email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#f6e47c] text-[#1e1e2e] hover:bg-[#e6d46c] font-semibold py-3 disabled:opacity-50"
                >
                  {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  )
}
