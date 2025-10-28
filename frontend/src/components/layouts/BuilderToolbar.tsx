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
    <div className={cn('bg-white border-b border-gray-200 px-4 py-2.5 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {/* Undo */}
          <button 
            onClick={onUndo} 
            className="p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors" 
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
          </button>
          
          {/* Redo */}
          <button 
            onClick={onRedo} 
            className="p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors" 
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          <div className="w-px h-5 bg-gray-300 mx-1.5"></div>
          
          {/* Zoom Out */}
          <button 
            className="p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors" 
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          {/* Zoom In */}
          <button 
            className="p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors" 
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
          
          <div className="w-px h-5 bg-gray-300 mx-1.5"></div>
          
          {/* History */}
          <button 
            className="p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors" 
            title="History"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        
        {/* Selected Element Info */}
        {selectedElement && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-md border border-blue-200">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">{selectedElement.name}</span>
            <span className="text-xs text-blue-600">{selectedElement.type}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={onSave}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Save Draft
          </button>
          <button 
            onClick={onPreview}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            👁️ Preview
          </button>
          <button 
            onClick={onPublish}
            className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-md hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all"
          >
            🚀 Publish
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuilderToolbar
