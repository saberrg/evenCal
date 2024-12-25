'use client'

import { useId } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  className?: string
}

export function FormInput({ label, error, className, ...props }: FormInputProps) {
  const id = useId()
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xl font-serif">
        {label}
      </Label>
      <Input
        id={id}
        className={cn(
          "h-12 bg-[#d9d9d9] border-none text-[#1e1e2e]",
          error && "border-2 border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

