import React from 'react'
import { cn } from '@/utils'
import { Element } from '@/types'

interface ElementAnimationsProps {
  element: Element
  onUpdate: (updates: Partial<Element>) => void
}

const animations = [
  { value: 'fadeIn', label: 'Fade In', icon: '✨' },
  { value: 'slideIn', label: 'Slide In', icon: '➡️' },
  { value: 'bounce', label: 'Bounce', icon: '⚡' },
  { value: 'pulse', label: 'Pulse', icon: '💓' },
  { value: 'zoom', label: 'Zoom', icon: '🔍' },
  { value: 'rotate', label: 'Rotate', icon: '🔄' },
]

const durations = [
  { value: 300, label: 'Fast (0.3s)' },
  { value: 500, label: 'Normal (0.5s)' },
  { value: 700, label: 'Slow (0.7s)' },
  { value: 1000, label: 'Very Slow (1s)' },
]

const delays = [
  { value: 0, label: 'No delay' },
  { value: 100, label: 'Small (0.1s)' },
  { value: 300, label: 'Medium (0.3s)' },
  { value: 500, label: 'Large (0.5s)' },
]

const ElementAnimations: React.FC<ElementAnimationsProps> = ({ element, onUpdate }) => {
  const animation = element.props?.animation || {}
  
  const handleAnimationChange = (key: string, value: any) => {
    onUpdate({
      props: {
        ...element.props,
        animation: { ...animation, [key]: value }
      }
    })
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        🎬 Animations
      </h4>
      
      {/* Animation Type */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Type</label>
        <div className="grid grid-cols-3 gap-2">
          {animations.map((anim) => (
            <button
              key={anim.value}
              onClick={() => handleAnimationChange('type', anim.value)}
              className={cn(
                'p-3 rounded-lg border-2 transition-all text-center',
                animation.type === anim.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div className="text-2xl mb-1">{anim.icon}</div>
              <div className="text-xs text-gray-700">{anim.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Duration</label>
        <select
          value={animation.duration || 500}
          onChange={(e) => handleAnimationChange('duration', parseInt(e.target.value))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          {durations.map((duration) => (
            <option key={duration.value} value={duration.value}>
              {duration.label}
            </option>
          ))}
        </select>
      </div>

      {/* Delay */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Delay</label>
        <select
          value={animation.delay || 0}
          onChange={(e) => handleAnimationChange('delay', parseInt(e.target.value))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          {delays.map((delay) => (
            <option key={delay.value} value={delay.value}>
              {delay.label}
            </option>
          ))}
        </select>
      </div>

      {/* Preview */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 mb-2">Preview</div>
        <div
          className="w-full h-16 bg-blue-500 rounded flex items-center justify-center text-white text-sm"
          style={{
            animation: animation.type 
              ? `${animation.type} ${animation.duration || 500}ms`
              : undefined,
            animationDelay: animation.delay ? `${animation.delay}ms` : undefined,
          }}
        >
          {animation.type ? `🎬 ${animation.type}` : 'No animation'}
        </div>
      </div>
    </div>
  )
}

export default ElementAnimations

