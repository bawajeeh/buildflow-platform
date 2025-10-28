import React from 'react'
import { cn } from '@/utils'
import { Website, Page } from '@/types'

interface BuilderHeaderProps {
  website?: Website | null
  currentPage?: Page | null
  responsiveMode?: 'desktop' | 'tablet' | 'mobile'
  onResponsiveModeChange?: (mode: 'desktop' | 'tablet' | 'mobile') => void
  onToggleSidebar?: () => void
  onToggleProperties?: () => void
  className?: string
}

const BuilderHeader: React.FC<BuilderHeaderProps> = ({ 
  website,
  currentPage,
  responsiveMode = 'desktop',
  onResponsiveModeChange,
  onToggleSidebar,
  onToggleProperties,
  className 
}) => {
  return (
    <div className={cn('bg-white border-b border-gray-200 px-6 py-4 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            {/* Toggle Sidebar */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Toggle Sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎨 Website Builder
            </h1>
          </div>
          
          {/* Responsive Mode Selector */}
          {onResponsiveModeChange && (
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onResponsiveModeChange('desktop')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  responsiveMode === 'desktop'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                )}
              >
                💻 Desktop
              </button>
              <button
                onClick={() => onResponsiveModeChange('tablet')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  responsiveMode === 'tablet'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                )}
              >
                📱 Tablet
              </button>
              <button
                onClick={() => onResponsiveModeChange('mobile')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  responsiveMode === 'mobile'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                )}
              >
                📱 Mobile
              </button>
            </div>
          )}
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Page Info */}
          {currentPage && (
            <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
              <span className="text-sm font-medium text-blue-900">{currentPage.name}</span>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {onToggleProperties && (
              <button
                onClick={onToggleProperties}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Toggle Properties"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuilderHeader
