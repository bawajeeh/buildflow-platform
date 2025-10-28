import React, { useState } from 'react'
import { cn } from '@/utils'
import { Element } from '@/types'
import toast from 'react-hot-toast'

interface BuilderAIPanelProps {
  className?: string
}

const BuilderAIPanel: React.FC<BuilderAIPanelProps> = ({ className }) => {
  const [suggestions, setSuggestions] = useState([
    { id: 1, type: 'suggestion', text: 'Add a hero section with a compelling headline', category: 'Layout' },
    { id: 2, type: 'tip', text: 'Consider adding a call-to-action button below the hero', category: 'UX' },
    { id: 3, type: 'warning', text: 'Image sizes may affect page load speed', category: 'Performance' },
    { id: 4, type: 'suggestion', text: 'Add testimonials section to build trust', category: 'Content' },
    { id: 5, type: 'tip', text: 'Use consistent spacing across all sections', category: 'Design' },
  ])

  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      toast.success('🤖 AI suggestion generated!')
      setIsGenerating(false)
    }, 1500)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return '💡'
      case 'tip': return '✨'
      case 'warning': return '⚠️'
      default: return '📝'
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'bg-blue-50 border-blue-200'
      case 'tip': return 'bg-purple-50 border-purple-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            🤖 AI Assistant
          </h3>
          <button
            onClick={handleGenerateSuggestion}
            disabled={isGenerating}
            className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
          >
            {isGenerating ? '⚡ Generating...' : '✨ Generate'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Get intelligent design suggestions for your page
        </p>
      </div>

      <div className="p-4 space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={cn(
              'p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer',
              getColor(suggestion.type)
            )}
          >
            <div className="flex items-start space-x-2">
              <span className="text-xl flex-shrink-0">{getIcon(suggestion.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {suggestion.category}
                  </span>
                  <span className="text-xs text-gray-400">Just now</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{suggestion.text}</p>
                <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Apply suggestion →
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">⚡ Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 text-sm text-left bg-white hover:bg-gray-50 rounded-md border border-gray-200 transition-colors">
              🎨 Optimize colors
            </button>
            <button className="w-full px-3 py-2 text-sm text-left bg-white hover:bg-gray-50 rounded-md border border-gray-200 transition-colors">
              📐 Fix spacing issues
            </button>
            <button className="w-full px-3 py-2 text-sm text-left bg-white hover:bg-gray-50 rounded-md border border-gray-200 transition-colors">
              🚀 Improve performance
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuilderAIPanel

