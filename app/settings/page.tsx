'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User, Save, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/app/context/AuthContext'
import Link from 'next/link'

const usernameSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').max(50, 'Username must be less than 50 characters'),
})

type UsernameForm = z.infer<typeof usernameSchema>

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<UsernameForm>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: '',
    },
  })

  // Redirect to account page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/account')
    }
  }, [user, loading, router])

  // Load current username from user metadata
  useEffect(() => {
    if (user?.user_metadata?.name) {
      form.setValue('username', user.user_metadata.name)
    }
  }, [user, form])

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

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  const onSubmit = async (data: UsernameForm) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: data.username }
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Username updated successfully!')
      }
    } catch (error) {
      toast.error('Failed to update username')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Link
              href="/"
              className="flex items-center text-[#f6e47c] hover:text-[#e6d46c] transition-colors mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </div>
          <h2 className="text-3xl font-semibold mb-2 text-[#1e1e2e]">
            Account Settings
          </h2>
          <p className="text-[#1e1e2e] text-lg">
            Manage your account preferences and profile information
          </p>
        </div>

        {/* Settings Form */}
        <div className="bg-[#2a2a3e] rounded-lg p-8 shadow-xl border border-[#3a3a4e]">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Profile Information</h3>
            <p className="text-gray-400 text-sm">Update your username and display name</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Email (Read-only) */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="pl-10 bg-[#1e1e2e] border-[#3a3a4e] text-gray-400 placeholder:text-gray-500"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                </div>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          {...field}
                          className="pl-10 bg-[#1e1e2e] border-[#3a3a4e] text-white placeholder:text-gray-400 focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                          placeholder="Enter your username"
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
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1e1e2e] mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Account Information */}
          <div className="mt-8 pt-6 border-t border-[#3a3a4e]">
            <h4 className="text-white font-medium mb-4">Account Information</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Account created:</span>
                <span className="text-white">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last sign in:</span>
                <span className="text-white">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
