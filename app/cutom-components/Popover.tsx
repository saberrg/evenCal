"use client"
import React from 'react'

interface PopoverDemoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number };
}

export function PopoverDemo({ open, onOpenChange, position }: PopoverDemoProps) {
  if (!open) return null;

  return (
    <div 
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        background: 'white',
        padding: '1rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        borderRadius: '4px',
        zIndex: 1000
      }}
    >
      {/* Add your popover content here */}
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  )
}