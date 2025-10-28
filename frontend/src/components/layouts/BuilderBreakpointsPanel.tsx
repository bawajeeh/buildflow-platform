import React, { useState } from 'react'
import { cn } from '@/utils'

interface Breakpoint {
  name: string
  width: number
  icon: string
  color: string
}

interface BuilderBreakpointsPanelProps {
  currentBreakpoint: number
  onBreakpointChange: (width: number) => void
  className?: string
}

const defaultBreakpoints: Breakpoint[] = [
  { name: 'Mobile', width: 375, icon: '📱', color: 'blue' },
  { name: 'Mobile Large', width: 425, icon: '📱', color: 'purple' },
  { name: 'Tablet', width: 768, icon: '💻', color: 'green' },
  { name: 'Desktop', width: 1024, icon: '🖥️', color: 'orange' },
  { name: 'Large Desktop', width: 1440, icon: '🖥️', color: 'red' },
  { name: 'Ultra Wide', width: 1920, icon: '🖥️', color: 'pink' },
]

const BuilderBreakpointsPanel: React.FC<BuilderBreakpointsPanelProps> = ({
  currentBreakpoint,
  onBreakpointChange,
  className,
}) => {
  const [breakpoints, setBreakpoints] = useState(defaultBreakpoints)
  const [customBreakpoint, setCustomBreakpoint] = useState('')

  const handleAddBreakpoint = () => {
    const width = parseInt(customBreakpoint)
    if (width > 0 && width <= 3000) {
      const newBreakpoint: Breakpoint = {
        name: 'Custom',
        width,
        icon: '🎯',
        color: 'indigo',
      }
      setBreakpoints([...breakpoints, newBreakpoint].sort((a, b) => a.width - b.width))
      setCustomBreakpoint('')
    }
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200',
      purple: 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200',
      green: 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200',
      orange: 'bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200',
      red: 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200',
      pink: 'bg-pink-100 border-pink-300 text-pink-700 hover:bg-pink-200',
      indigo: 'bg-indigo-100 border-indigo-300 text-indigo-700 hover:bg-indigo-200',
    }
    return colors[color] || 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
  }

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          📐 Breakpoints
        </h3>
        <p className="text-xs text-gray-500">
          Customize your responsive breakpoints
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* Current Breakpoint Display */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
          <div className="text-xs font-semibold text-gray-600 mb-1">Current Viewport</div>
          <div className="text-2xl font-bold text-blue-700">
            {currentBreakpoint}px
          </div>
        </div>

        {/* Breakpoint Buttons */}
        <div className="space-y-2">
          {breakpoints.map((breakpoint) => (
            <button
              key={breakpoint.width}
              onClick={() => onBreakpointChange(breakpoint.width)}
              className={cn(
                'w-full p-3 rounded-lg border-2 transition-all text-left',
                currentBreakpoint === breakpoint.width
                  ? 'shadow-lg scale-105'
                  : 'hover:shadow-md',
                getColorClasses(breakpoint.color)
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{breakpoint.icon}</span>
                  <div>
                    <div className="font-semibold">{breakpoint.name}</div>
                    <div className="text-xs opacity-75">
                      {breakpoint.width}px
                    </div>
                  </div>
                </div>
                {currentBreakpoint === breakpoint.width && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Add Custom Breakpoint */}
        <div className="pt-3 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Add Custom Breakpoint</h4>
          <div className="flex space-x-2">
            <input
              type="number"
              value={customBreakpoint}
              onChange={(e) => setCustomBreakpoint(e.target.value)}
              placeholder="Enter width (px)"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="3000"
            />
            <button
              onClick={handleAddBreakpoint}
              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuilderBreakpointsPanel

