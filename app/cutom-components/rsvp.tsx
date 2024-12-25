'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EventDetails {
  firstName: string
  lastName: string
  additionalGuests: string
  email: string
  phoneNumber: string
}

export default function RSVPForm() {
  const [formData, setFormData] = useState<EventDetails>({
    firstName: '',
    lastName: '',
    additionalGuests: '',
    email: '',
    phoneNumber: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Event RSVP Details:', formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            className="bg-[#1E1E2E] text-white hover:bg-[#1E1E2E]/90 rounded-md px-8 py-2"
          >
            RSVP
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] w-full sm:max-w-xl mx-auto">
          <SheetHeader>
            <SheetTitle className="text-3xl font-bold text-center">
              RSVP For Event.Name
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="border-2 rounded-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="border-2 rounded-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalGuests">Additional Guests</Label>
              <Input
                id="additionalGuests"
                name="additionalGuests"
                value={formData.additionalGuests}
                onChange={handleInputChange}
                className="border-2 rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="border-2 rounded-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="border-2 rounded-none"
                required
              />
            </div>
            <Button 
              type="submit"
              className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white text-xl py-6 rounded-none"
            >
              Pay
            </Button>
            <div className="text-center">
              <a href="#" className="text-sm underline">
                Refund Policy
              </a>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}