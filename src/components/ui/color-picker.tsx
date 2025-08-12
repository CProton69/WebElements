'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const presetColors = [
  '#000000', '#ffffff', '#f87171', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#60a5fa', '#c084fc', '#f472b6',
  '#7f1d1d', '#fef2f2', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#fef3c7', '#fed7aa', '#ffedd5',
  '#166534', '#f0fdf4', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7', '#ecfdf5', '#d1fae5', '#a7f3d0',
  '#1e40af', '#eff6ff', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#e0e7ff', '#c7d2fe', '#a5b4fc',
  '#7c2d12', '#fff7ed', '#ea580c', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#fef3c7', '#fde68a', '#fcd34d',
  '#581c87', '#faf5ff', '#9333ea', '#c084fc', '#d8b4fe', '#e9d5ff', '#f3e8ff', '#ede9fe', '#ddd6fe', '#c4b5fd',
  '#831843', '#fdf2f8', '#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3', '#fce7f3', '#fbcfe8', '#f9a8d4'
]

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(newValue) || /^#[0-9A-F]{3}$/i.test(newValue)) {
      onChange(newValue)
    }
  }

  const handlePresetClick = (color: string) => {
    onChange(color)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          className={cn(
            "w-8 h-8 p-0 border-2",
            className
          )}
          style={{ backgroundColor: value }}
        >
          <span className="sr-only">Pick color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded border border-gray-300"
              style={{ backgroundColor: value }}
            />
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Preset Colors</div>
            <div className="grid grid-cols-8 gap-1">
              {presetColors.map((color, index) => (
                <button
                  key={index}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}