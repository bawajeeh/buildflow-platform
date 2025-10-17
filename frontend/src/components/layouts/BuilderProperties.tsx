import React from 'react'
import { cn } from '@/utils'

interface BuilderPropertiesProps {
  className?: string
}

const BuilderProperties: React.FC<BuilderPropertiesProps> = ({ className }) => {
  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 p-4', className)}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Element Type
          </label>
          <p className="text-sm text-gray-500">No element selected</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            rows={3}
            placeholder="Enter content..."
            disabled
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Styles
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-500 w-16">Width:</label>
              <input
                type="text"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="auto"
                disabled
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-500 w-16">Height:</label>
              <input
                type="text"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="auto"
                disabled
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-500 w-16">Margin:</label>
              <input
                type="text"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="0"
                disabled
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-500 w-16">Padding:</label>
              <input
                type="text"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="0"
                disabled
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Colors
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-500 w-16">Text:</label>
              <input
                type="color"
                className="w-8 h-6 border border-gray-300 rounded"
                disabled
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-500 w-16">Background:</label>
              <input
                type="color"
                className="w-8 h-6 border border-gray-300 rounded"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuilderProperties
