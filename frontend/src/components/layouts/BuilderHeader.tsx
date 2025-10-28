import React from 'react'
import { cn } from '@/utils'

interface BuilderHeaderProps {
  className?: string
}

const BuilderHeader: React.FC<BuilderHeaderProps> = ({ className }) => {
  return (
    <div className={cn('bg-white border-b border-gray-200 px-4 py-3 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎨 Website Builder
          </h1>
          
          {/* Responsive Mode Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button className="px-3 py-1.5 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm hover:shadow-md transition-all">
              💻 Desktop
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-200 transition-colors">
              📱 Tablet
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-200 transition-colors">
              📱 Mobile
            </button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <span className="mr-2">👁️</span>
            Preview
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-md hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow transition-all">
            <span className="mr-2">🚀</span>
            Publish
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuilderHeader
