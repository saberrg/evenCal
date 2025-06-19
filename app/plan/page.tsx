'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Calendar, Save, Send, ArrowLeft, ImageIcon, Tag, MapPin, Clock, Users, DollarSign, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/app/context/AuthContext'
import { useVenue } from '@/app/context/VenueContext'
import Link from 'next/link'

const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().min(1, 'Event description is required'),
  short_description: z.string().max(500, 'Short description must be less than 500 characters').optional(),
  start_datetime: z.string().min(1, 'Start date and time is required'),
  end_datetime: z.string().min(1, 'End date and time is required'),
  timezone: z.string().default('UTC'),
  venue_id: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
  is_public: z.boolean().default(true),
  requires_approval: z.boolean().default(false),
  min_age: z.number().min(0, 'Minimum age must be 0 or greater').optional(),
  max_age: z.number().min(0, 'Maximum age must be 0 or greater').optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  banner_image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  tags: z.string().optional(), // Will be split into array
  ticket_price: z.number().min(0, 'Ticket price must be 0 or greater').optional(),
}).refine((data) => {
  if (data.start_datetime && data.end_datetime) {
    return new Date(data.end_datetime) > new Date(data.start_datetime)
  }
  return true
}, {
  message: "End date and time must be after start date and time",
  path: ["end_datetime"],
}).refine((data) => {
  if (data.min_age && data.max_age) {
    return data.max_age >= data.min_age
  }
  return true
}, {
  message: "Maximum age must be greater than or equal to minimum age",
  path: ["max_age"],
})

// Separate schema for drafts - only title is required
const draftSchema = z.object({
  title: z.string().min(1, 'Event title is required for drafts').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  short_description: z.string().max(500, 'Short description must be less than 500 characters').optional(),
  start_datetime: z.string().optional(),
  end_datetime: z.string().optional(),
  timezone: z.string().default('UTC'),
  venue_id: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
  is_public: z.boolean().default(true),
  requires_approval: z.boolean().default(false),
  min_age: z.number().min(0, 'Minimum age must be 0 or greater').optional(),
  max_age: z.number().min(0, 'Maximum age must be 0 or greater').optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  banner_image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  tags: z.string().optional(),
  ticket_price: z.number().min(0, 'Ticket price must be 0 or greater').optional(),
}).refine((data) => {
  if (data.start_datetime && data.end_datetime) {
    return new Date(data.end_datetime) > new Date(data.start_datetime)
  }
  return true
}, {
  message: "End date and time must be after start date and time",
  path: ["end_datetime"],
}).refine((data) => {
  if (data.min_age && data.max_age) {
    return data.max_age >= data.min_age
  }
  return true
}, {
  message: "Maximum age must be greater than or equal to minimum age",
  path: ["max_age"],
})

type EventForm = z.infer<typeof eventSchema>

export default function PlanPage() {
  const { user, loading } = useAuth()
  const { venues } = useVenue()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('')
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])

  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      short_description: '',
      start_datetime: '',
      end_datetime: '',
      timezone: 'UTC',
      venue_id: '',
      capacity: undefined,
      is_public: true,
      requires_approval: false,
      min_age: undefined,
      max_age: undefined,
      visibility: 'public',
      banner_image_url: '',
      tags: '',
      ticket_price: undefined,
    },
  })

  // Image upload handlers
  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFeaturedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setFeaturedImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAdditionalImages(files)
    
    // Create preview URLs
    const previews: string[] = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        previews.push(e.target?.result as string)
        if (previews.length === files.length) {
          setAdditionalImagePreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFeaturedImage = () => {
    setFeaturedImage(null)
    setFeaturedImagePreview('')
    const input = document.getElementById('featured-image') as HTMLInputElement
    if (input) input.value = ''
  }

  const removeAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index)
    const newPreviews = additionalImagePreviews.filter((_, i) => i !== index)
    setAdditionalImages(newImages)
    setAdditionalImagePreviews(newPreviews)
  }

  // Redirect to account page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/account')
    }
  }, [user, loading, router])

  // Load event data if editing
  useEffect(() => {
    if (editId && user) {
      loadEventForEditing(editId)
    }
  }, [editId, user])

  const loadEventForEditing = async (eventId: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) {
        toast.error('Failed to load event for editing')
        console.error('Error loading event:', error)
        return
      }

      if (data) {
        setIsEditMode(true)
        
        // Format datetime strings for input fields
        const startDateTime = data.start_datetime ? new Date(data.start_datetime).toISOString().slice(0, 16) : ''
        const endDateTime = data.end_datetime ? new Date(data.end_datetime).toISOString().slice(0, 16) : ''
        
        form.reset({
          title: data.title || '',
          description: data.description || '',
          short_description: data.short_description || '',
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          timezone: data.timezone || 'UTC',
          venue_id: data.venue_id || '',
          capacity: data.capacity,
          is_public: data.is_public ?? true,
          requires_approval: data.requires_approval ?? false,
          min_age: data.min_age,
          max_age: data.max_age,
          visibility: data.visibility || 'public',
          banner_image_url: data.banner_image_url || '',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          ticket_price: data.ticket_price,
        })
        
        // Load existing image if any
        if (data.banner_image_url) {
          setFeaturedImagePreview(data.banner_image_url)
        }
      }
    } catch (error) {
      toast.error('Failed to load event for editing')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6e47c] mx-auto"></div>
          <p className="mt-2 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  const saveEvent = async (data: EventForm, status: 'draft' | 'published') => {
    setIsLoading(true)
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        toast.error('User not authenticated')
        return
      }

      // Get or create user profile in users table
      let { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('auth_user_id', currentUser.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // User doesn't exist, create them
        const displayName = currentUser.user_metadata?.name || 
                           currentUser.user_metadata?.full_name || 
                           currentUser.email?.split('@')[0] || 
                           'User'
        
        // Split display name into first and last name
        const nameParts = displayName.split(' ')
        const firstName = nameParts[0] || 'User'
        const lastName = nameParts.slice(1).join(' ') || 'User'
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            auth_user_id: currentUser.id,
            email: currentUser.email,
            first_name: firstName,
            last_name: lastName,
            is_organizer: true // Set as organizer since they're creating events
          }])
          .select('id, email, first_name, last_name')
          .single()

        if (createError) {
          toast.error('Failed to create user profile')
          console.error('Create user error:', createError)
          return
        }

        userProfile = newUser
      } else if (profileError) {
        toast.error('Failed to get user profile')
        console.error('Profile error:', profileError)
        return
      }

      if (!userProfile) {
        toast.error('Failed to get user profile')
        return
      }

      // For drafts, provide default values for required database fields
      const isDraft = status === 'draft'
      
      // Prepare event data
      const eventData = {
        title: data.title,
        description: isDraft ? (data.description || 'Draft event - description to be added') : data.description,
        short_description: data.short_description || null,
        start_datetime: isDraft ? (data.start_datetime || new Date().toISOString()) : data.start_datetime,
        end_datetime: isDraft ? (data.end_datetime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()) : data.end_datetime,
        timezone: data.timezone,
        organizer_id: userProfile.id, // Use the users table ID as organizer_id
        organizator_name: `${userProfile.first_name} ${userProfile.last_name}`, // Store the organizer name
        venue_id: data.venue_id || null,
        capacity: data.capacity || null,
        is_public: data.is_public,
        requires_approval: data.requires_approval,
        min_age: data.min_age || null,
        max_age: data.max_age || null,
        status: status,
        visibility: data.visibility,
        banner_image_url: featuredImagePreview || data.banner_image_url || null,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : null,
        ticket_price: data.ticket_price || null,
        published_at: status === 'published' ? new Date().toISOString() : null,
      }

      let result
      if (isEditMode && editId) {
        // Update existing event
        result = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editId)
          .select()
          .single()
      } else {
        // Create new event
        result = await supabase
          .from('events')
          .insert([eventData])
          .select()
          .single()
      }

      if (result.error) {
        toast.error('Failed to save event')
        console.error('Error saving event:', result.error)
        return
      }

      toast.success(status === 'draft' ? 'Event saved as draft!' : 'Event published successfully!')
      
      // Redirect to account page to view events
      router.push('/account')
    } catch (error) {
      toast.error('Failed to save event')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSaveDraft = async () => {
    // Use draft schema validation (only title required)
    const draftValidation = draftSchema.safeParse(form.getValues())
    
    if (!draftValidation.success) {
      // Set form errors for draft validation
      const errors = draftValidation.error.flatten().fieldErrors
      Object.entries(errors).forEach(([field, messages]) => {
        if (messages) {
          form.setError(field as keyof EventForm, {
            type: 'validation',
            message: messages[0]
          })
        }
      })
      return
    }
    
    saveEvent(draftValidation.data as EventForm, 'draft')
  }

  const onPublish = async () => {
    // Use full event schema validation for publishing
    const publishValidation = eventSchema.safeParse(form.getValues())
    
    if (!publishValidation.success) {
      // Set form errors for publish validation
      const errors = publishValidation.error.flatten().fieldErrors
      Object.entries(errors).forEach(([field, messages]) => {
        if (messages) {
          form.setError(field as keyof EventForm, {
            type: 'validation',
            message: messages[0]
          })
        }
      })
      return
    }
    
    saveEvent(publishValidation.data, 'published')
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/account"
            className="text-[#2a2a3e] hover:text-[#2a2a3e] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-4xl font-bold text-[#2a2a3e] text-center flex-1">
            {isEditMode ? 'Edit Event' : 'Plan New Event'}
          </h1>
        </div>
        <p className="text-lg text-[#2a2a3e] text-center">
          {isEditMode ? 'Update your event details below.' : 'Fill in the details below to create your event.'}
        </p>
      </div>

      {/* Form */}
      <div className="bg-[#2a2a3e] rounded-lg p-8 shadow-xl border border-[#3a3a4e]">
        <Form {...form}>
          <form className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-white" />
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Event Title *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        className="bg-[#1e1e2e] border-[#3a3a4e] text-white placeholder:text-gray-400 focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                        placeholder="Enter event title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description *</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        value={field.value || ''}
                        rows={4}
                        className="flex w-full rounded-md border border-[#3a3a4e] bg-[#1e1e2e] px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#f6e47c] focus:border-[#f6e47c] disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Provide a detailed description of your event"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Short Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        className="bg-[#1e1e2e] border-[#3a3a4e] text-white placeholder:text-gray-400 focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                        placeholder="Brief description (500 characters max)"
                        maxLength={500}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-[#f6e47c]" />
                <h2 className="text-xl font-semibold text-white">Date & Time</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="start_datetime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Start Date & Time *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          type="datetime-local"
                          className="bg-[#1e1e2e] border-[#3a3a4e] text-white focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_datetime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">End Date & Time *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          type="datetime-local"
                          className="bg-[#1e1e2e] border-[#3a3a4e] text-white focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Timezone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1e1e2e] border-[#3a3a4e] text-white focus:border-[#f6e47c] focus:ring-[#f6e47c]">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2a2a3e] border-[#3a3a4e]">
                        <SelectItem value="UTC" className="text-white">UTC</SelectItem>
                        <SelectItem value="America/New_York" className="text-white">Eastern (EST/EDT)</SelectItem>
                        <SelectItem value="America/Chicago" className="text-white">Central (CST/CDT)</SelectItem>
                        <SelectItem value="America/Denver" className="text-white">Mountain (MST/MDT)</SelectItem>
                        <SelectItem value="America/Los_Angeles" className="text-white">Pacific (PST/PDT)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Venue & Capacity */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-[#f6e47c]" />
                <h2 className="text-xl font-semibold text-white">Venue & Capacity</h2>
              </div>

              <FormField
                control={form.control}
                name="venue_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Venue</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1e1e2e] border-[#3a3a4e] text-white focus:border-[#f6e47c] focus:ring-[#f6e47c]">
                          <SelectValue placeholder="Select a venue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2a2a3e] border-[#3a3a4e]">
                        {venues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.id.toString()} className="text-white">
                            {venue.name} (Capacity: {venue.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Event Capacity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        type="number"
                        min="1"
                        className="bg-[#1e1e2e] border-[#3a3a4e] text-white placeholder:text-gray-400 focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                        placeholder="Maximum number of attendees"
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-[#f6e47c]" />
                <h2 className="text-xl font-semibold text-white">Pricing</h2>
              </div>

              <FormField
                control={form.control}
                name="ticket_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Ticket Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        type="number"
                        min="0"
                        step="0.01"
                        className="bg-[#1e1e2e] border-[#3a3a4e] text-white placeholder:text-gray-400 focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                        placeholder="0.00 (Leave empty for free events)"
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Age Restrictions */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-[#f6e47c]" />
                <h2 className="text-xl font-semibold text-white">Age Restrictions</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="min_age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Minimum Age</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          type="number"
                          min="0"
                          className="bg-[#1e1e2e] border-[#3a3a4e] text-white placeholder:text-gray-400 focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                          placeholder="Minimum age requirement"
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Maximum Age</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          type="number"
                          min="0"
                          className="bg-[#1e1e2e] border-[#3a3a4e] text-white placeholder:text-gray-400 focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                          placeholder="Maximum age requirement"
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Event Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5 text-[#f6e47c]" />
                <h2 className="text-xl font-semibold text-white">Event Settings</h2>
              </div>

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Event Visibility</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1e1e2e] border-[#3a3a4e] text-white focus:border-[#f6e47c] focus:ring-[#f6e47c]">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2a2a3e] border-[#3a3a4e]">
                        <SelectItem value="public" className="text-white">Public - Anyone can see and join</SelectItem>
                        <SelectItem value="private" className="text-white">Private - Invitation only</SelectItem>
                        <SelectItem value="unlisted" className="text-white">Unlisted - Only those with link can see</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#3a3a4e] p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-white">Public Event</FormLabel>
                        <div className="text-sm text-gray-300">
                          Allow event to be shown in public listings
                        </div>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-[#f6e47c] bg-[#1e1e2e] border-[#3a3a4e] rounded focus:ring-[#f6e47c]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requires_approval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#3a3a4e] p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-white">Requires Approval</FormLabel>
                        <div className="text-sm text-gray-300">
                          Manually approve attendee registrations
                        </div>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-[#f6e47c] bg-[#1e1e2e] border-[#3a3a4e] rounded focus:ring-[#f6e47c]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Media & Tags */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-5 w-5 text-white" />
                <h2 className="text-xl font-semibold text-white">Media & Tags</h2>
              </div>

              {/* Featured Image Upload */}
              <FormField
                control={form.control}
                name="banner_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Featured Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {featuredImagePreview ? (
                          <div className="relative">
                            <img 
                              src={featuredImagePreview} 
                              alt="Featured image preview" 
                              className="w-full h-48 object-cover rounded-lg border border-[#3a3a4e]"
                            />
                            <button
                              type="button"
                              onClick={removeFeaturedImage}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="border-2 border-dashed border-[#3a3a4e] rounded-lg p-6 text-center hover:border-[#f6e47c] transition-colors cursor-pointer"
                            onClick={() => document.getElementById('featured-image')?.click()}
                          >
                            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-white mb-2">Upload Featured Image</p>
                            <p className="text-sm text-gray-400 mb-4">Drag and drop or click to select (Max 1 image)</p>
                          </div>
                        )}
                        <Input
                          id="featured-image"
                          type="file"
                          accept="image/*"
                          onChange={handleFeaturedImageChange}
                          className="hidden"
                        />
                        {/* <Input
                          {...field}
                          value={field.value || ''}
                          placeholder="Or enter image URL"
                          className="bg-[#1e1e2e] border-[#3a3a4e] text-white placeholder:text-gray-400 focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                        /> */}
                      </div>
                    </FormControl>
                    <div className="text-sm text-gray-400">
                      Upload one main featured image or provide a URL
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Images Upload */}
              <div>
                <FormLabel className="text-white">Additional Images</FormLabel>
                <div className="mt-2 space-y-4">
                  {additionalImagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {additionalImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Additional image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-[#3a3a4e]"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div 
                    className="border-2 border-dashed border-[#3a3a4e] rounded-lg p-6 text-center hover:border-[#f6e47c] transition-colors cursor-pointer"
                    onClick={() => document.getElementById('additional-images')?.click()}
                  >
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Upload Additional Images</p>
                    <p className="text-sm text-gray-400 mb-4">Drag and drop or click to select multiple images</p>
                  </div>
                  <Input
                    id="additional-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="hidden"
                  />
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Upload multiple images to showcase your event
                </div>
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Tags</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        className="bg-[#1e1e2e] border-[#3a3a4e] text-white placeholder:text-gray-400 focus:border-[#f6e47c] focus:ring-[#f6e47c]"
                        placeholder="music, culture, food (comma separated)"
                      />
                    </FormControl>
                    <div className="text-sm text-gray-400">
                      Enter tags separated by commas
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                onClick={onSaveDraft}
                disabled={isLoading}
                variant="outline"
                className="flex-1 bg-transparent border-[#f6e47c] text-[#f6e47c] hover:bg-[#f6e47c] hover:text-[#1e1e2e]"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save as Draft'}
              </Button>
              
              <Button
                type="button"
                onClick={onPublish}
                disabled={isLoading}
                className="flex-1 bg-[#f6e47c] text-[#1e1e2e] hover:bg-[#e6d46c]"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? 'Publishing...' : 'Publish Event'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
