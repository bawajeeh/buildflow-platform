import React from 'react'
import { cn } from '@/utils'
import { Element } from '@/types'

interface BuilderLayersPanelProps {
  elements: Element[]
  selectedElement: Element | null
  onElementSelect: (element: Element | null) => void
  onDuplicate?: (element: Element) => void
  onDelete?: (elementId: string) => void
  className?: string
}

const BuilderLayersPanel: React.FC<BuilderLayersPanelProps> = ({
  elements,
  selectedElement,
  onElementSelect,
  onDuplicate,
  onDelete,
  className
}) => {
  const renderLayer = (element: Element, level = 0) => {
    const isSelected = selectedElement?.id === element.id
    const indent = level * 16

    return (
      <div key={element.id}>
        <div
          className={cn(
            'flex items-center justify-between p-2 rounded-md cursor-pointer transition-all group',
            isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100',
            !isSelected && 'border border-transparent'
          )}
          style={{ marginLeft: `${indent}px` }}
          onClick={() => onElementSelect(element)}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-lg">{getElementIcon(element.type)}</span>
            <span className={cn('text-sm font-medium truncate', isSelected && 'text-blue-900')}>
              {element.name}
            </span>
            <span className="text-xs text-gray-500 uppercase">{element.type}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onDuplicate && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate(element)
                }}
                className="p-1 hover:bg-gray-200 rounded text-gray-600"
                title="Duplicate"
              >
                📋
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(element.id)
                }}
                className="p-1 hover:bg-red-100 rounded text-red-600"
                title="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Render children recursively */}
        {element.children && element.children.length > 0 && (
          <div className="ml-4 border-l border-gray-200">
            {element.children.map((child) => renderLayer(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const getElementIcon = (type: string) => {
    const icons: Record<string, string> = {
      SECTION: '📦',
      CONTAINER: '📋',
      ROW: '📐',
      COLUMN: '📊',
      TEXT: '📝',
      HEADING: '📰',
      IMAGE: '🖼️',
      BUTTON: '🔘',
      FORM: '📋',
      INPUT: '📝',
      SELECT: '📋',
      CHECKBOX: '☑️',
      RADIO: '🔘',
      SPACER: '⬜',
      DIVIDER: '➖',
    }
    return icons[type] || '📄'
  }

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Layers</h3>
        <p className="text-xs text-gray-500">
          {elements.length} element{elements.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="p-2">
        {elements.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <div className="text-4xl mb-2">📁</div>
            <p>No elements yet</p>
            <p className="text-xs mt-1">Add elements to see them here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {elements.map((element) => renderLayer(element))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BuilderLayersPanel

