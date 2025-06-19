
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { DraftEvents } from './draftEvents'
import { PastEvents } from './pastEvents'
import { Tickets } from './tickets'
import { Calendar, Clock, Ticket } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function UserEvents() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'drafts' | 'past' | 'tickets'>('drafts')
  const [userProfileId, setUserProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      getUserProfile()
    }
  }, [user])

  const getUserProfile = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      // Get user profile from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (profileError) {
        console.error('Error getting user profile:', profileError)
        toast.error('Failed to load user profile')
      } else if (userProfile) {
        setUserProfileId(userProfile.id)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

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

  if (!userProfileId) {
    return (
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="mt-2 text-[#1e1e2e]">User profile not found. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'drafts' as const,
      label: 'Draft Events',
      icon: Calendar,
      description: 'Events you\'re planning'
    },
    {
      id: 'past' as const,
      label: 'Past Events',
      icon: Clock,
      description: 'Events you\'ve attended'
    },
    {
      id: 'tickets' as const,
      label: 'My Tickets',
      icon: Ticket,
      description: 'Your event tickets'
    }
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1e1e2e] mb-2">
          Welcome back, {user.user_metadata?.name || user.email}!
        </h1>
        <p className="text-[#1e1e2e] text-lg">
          Manage your events and tickets
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#f6e47c] text-[#1e1e2e] shadow-lg'
                  : 'bg-[#2a2a3e] text-white hover:bg-[#3a3a4e] border border-[#3a3a4e]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-[#2a2a3e] rounded-lg p-6 shadow-xl border border-[#3a3a4e]">
        {activeTab === 'drafts' && <DraftEvents userId={userProfileId} />}
        {activeTab === 'past' && <PastEvents userId={userProfileId} />}
        {activeTab === 'tickets' && <Tickets userId={userProfileId} />}
      </div>
    </div>
  )
}