import React from 'react'
import { cn } from '@/utils'

interface BuilderHeaderProps {
  className?: string
}

const BuilderHeader: React.FC<BuilderHeaderProps> = ({ className }) => {
  return (
    <div className={cn('bg-white border-b border-gray-200 px-4 py-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900">Website Builder</h1>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
              Desktop
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 rounded-md hover:bg-gray-100">
              Tablet
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 rounded-md hover:bg-gray-100">
              Mobile
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Preview
          </button>
          <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Publish
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuilderHeader
