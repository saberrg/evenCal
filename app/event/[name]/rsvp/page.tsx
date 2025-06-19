'use client'

import { use, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FormInput } from "@/app/cutom-components/ui/form-input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/app/cutom-components/ui/button"
import { useEventContext } from '../../../context/sEventContext'
import { generateSlug } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  addOns: z.array(z.string()),
  additionalGuests: z.number().min(0).max(10)
})

type FormValues = z.infer<typeof formSchema>

export default function RsvpPage({ params }: { params: Promise<{ name: string }> }) {
    const { events } = useEventContext()
    const resolvedParams = use(params)
    const event = events.find(e => generateSlug(e.name) === resolvedParams.name)
  
    const [guests, setGuests] = useState(0)
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        additionalGuests: 0,
        addOns: []
      }
    })
  
    const onSubmit = async (data: FormValues) => {
      console.log(data)
      // Handle form submission
    }
  
    if (!event) {
      return <div>Event not found</div>
    }
  
    return (
      <main className="min-h-screen py-12">
        <div className="w-full bg-[#f6e47c] py-4 mb-12">
          <h1 className="text-center text-2xl">RSVP for {event.name}</h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-4 space-y-8">
          <FormInput
            label="Name"
            {...register("name")}
            error={errors.name?.message}
          />
          
          <FormInput
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />
          
          <FormInput
            label="Phone Number"
            type="tel"
            {...register("phone")}
            error={errors.phone?.message}
          />
  
          <div className="space-y-2">
            <h2 className="text-xl font-serif">Event Options</h2>
            <div className="space-y-4">
              {event.addOns.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <Checkbox {...register("addOns")} value={option} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
  
          <div className="space-y-2">
            <h2 className="text-xl font-serif">Additional Guests</h2>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGuests(Math.max(0, guests - 1))}
              >
                -
              </Button>
              <span className="text-xl w-8 text-center">{guests}</span>
              <Button
                type="button"
                variant="outline"
                onClick={() => setGuests(Math.min(10, guests + 1))}
              >
                +
              </Button>
            </div>
          </div>
  
          <div className="space-y-2">
            <h2 className="text-xl font-serif">Total</h2>
            <p className="text-2xl">${event.ticketPrice * (guests + 1)}</p>
          </div>
  
          <Button
            type="submit"
            className="w-full py-6 text-2xl bg-[#6f0c0c] hover:bg-[#6f0c0c]/90"
          >
            PAY
          </Button>
        </form>
      </main>
    )
  }