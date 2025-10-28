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
    <div className={cn('bg-gray-50 border-b border-gray-200 px-4 py-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={onUndo} className="p-2 text-gray-600 hover:bg-gray-200 rounded-md" title="Undo">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
          </button>
          <button onClick={onRedo} className="p-2 text-gray-600 hover:bg-gray-200 rounded-md" title="Redo">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-md" title="Import">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-md" title="Export">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={onSave}
            className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Save Draft
          </button>
          <button 
            onClick={onPreview}
            className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Preview
          </button>
          <button 
            onClick={onPublish}
            className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuilderToolbar
