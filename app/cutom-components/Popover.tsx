import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { v4 as uuidv4 } from 'uuid'
interface EventData {
  id: string;
  eventName: string;
  venue: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

interface PopoverDemoProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: { x: number; y: number };
}

export function PopoverDemo({ open, onOpenChange, position }: PopoverDemoProps) {
  const [eventData, setEventData] = useState<Partial<EventData>>({
    id: uuidv4(),
    startTime: "",
    endTime: "",
  })

  const form = useForm<Partial<EventData>>({
    defaultValues: eventData,
  })

  function onSubmit(data: Partial<EventData>) {
    const updatedEventData = { ...eventData, ...data }
    setEventData(updatedEventData)
    console.log("Submitted data:", updatedEventData)
    // Here you would typically send the data to your backend or move to the next stage
  }

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div 
          style={{ 
            position: 'absolute',
            left: position?.x ?? 0,
            top: position?.y ?? 0,
            visibility: 'hidden'
          }}
        >
          <Button variant="outline">Create Event</Button>
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 bg-white border rounded-md shadow-lg" 
        side="top" 
        align="start"
        style={{
          zIndex: 1000,
          backgroundColor: 'white',
        }}
      >
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="eventName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label>Start Time (24-hour format)</Label>
                <div className="flex space-x-2">
                  <Select onValueChange={(value: string) => setEventData(prev => ({ ...prev, startTime: `${value}:${prev.startTime?.split(':')[1] || '00'}` }))}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(value: string) => setEventData(prev => ({ ...prev, startTime: `${prev.startTime?.split(':')[0] || '00'}:${value}` }))}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>End Time (24-hour format)</Label>
                <div className="flex space-x-2">
                  <Select onValueChange={(value: string) => setEventData(prev => ({ ...prev, endTime: `${value}:${prev.endTime?.split(':')[1] || '00'}` }))}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(value: string) => setEventData(prev => ({ ...prev, endTime: `${prev.endTime?.split(':')[0] || '00'}:${value}` }))}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button type="submit" className="w-full">Next</Button>
            </form>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  )
}