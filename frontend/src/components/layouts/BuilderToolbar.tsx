import React from 'react'
import { cn } from '@/utils'
import { Element } from '@/types'

interface BuilderToolbarProps {
  selectedElement: Element | null
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onPreview: () => void
  onPublish: () => void
  className?: string
}

const BuilderToolbar: React.FC<BuilderToolbarProps> = ({ 
  selectedElement,
  onUndo,
  onRedo,
  onSave,
  onPreview,
  onPublish,
  className 
}) => {
  return (
    <div className={cn('bg-white/95 backdrop-blur-xl border-b border-gray-200/50 px-5 py-3 shadow-lg', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Undo */}
          <button 
            onClick={onUndo} 
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group" 
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
          </button>
          
          {/* Redo */}
          <button 
            onClick={onRedo} 
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group" 
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-0.5">
            <button 
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-all duration-200" 
              title="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="px-2 text-xs font-medium text-gray-600">100%</span>
            <button 
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-all duration-200" 
              title="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Selected Element Info */}
        {selectedElement && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50 shadow-sm">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-900">{selectedElement.name}</span>
            <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded">{selectedElement.type}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={onSave}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
          >
            💾 Save Draft
          </button>
          <button 
            onClick={onPreview}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
          >
            👁️ Preview
          </button>
          <button 
            onClick={onPublish}
            className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:via-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            🚀 Publish
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuilderToolbar
