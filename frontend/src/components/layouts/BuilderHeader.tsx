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
    <div className={cn('bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 px-6 py-3.5 backdrop-blur-xl shadow-2xl', className)}>
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            {/* Toggle Sidebar */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm"
                title="Toggle Sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">🎨</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">
                  Website Builder
                </h1>
                {website && (
                  <p className="text-xs text-gray-400">{website.name}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Responsive Mode Selector */}
          {onResponsiveModeChange && (
            <div className="flex items-center space-x-1 bg-gray-800/80 backdrop-blur-sm rounded-lg p-1 border border-gray-700/50 shadow-lg">
              <button
                onClick={() => onResponsiveModeChange('desktop')}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-1.5',
                  responsiveMode === 'desktop'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                )}
              >
                <span>💻</span>
                <span>Desktop</span>
              </button>
              <button
                onClick={() => onResponsiveModeChange('tablet')}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-1.5',
                  responsiveMode === 'tablet'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                )}
              >
                <span>📱</span>
                <span>Tablet</span>
              </button>
              <button
                onClick={() => onResponsiveModeChange('mobile')}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-1.5',
                  responsiveMode === 'mobile'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                )}
              >
                <span>📱</span>
                <span>Mobile</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Page Info */}
          {currentPage && (
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs">📄</span>
                <span className="text-sm font-semibold text-white">{currentPage.name}</span>
              </div>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {onToggleProperties && (
              <button
                onClick={onToggleProperties}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm"
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
