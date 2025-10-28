import React from 'react'
import { useDrag } from '@dnd-kit/core'
import { cn } from '@/utils'

interface BuilderSidebarProps {
  className?: string
}

interface DragElement {
  name: string
  icon: string
  type: string
}

interface ElementDraggableProps {
  element: DragElement
}

const ElementDraggable: React.FC<ElementDraggableProps> = ({ element }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDrag({
    id: element.type,
    type: 'element',
    data: element,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
    >
      <span>{element.icon}</span>
      <span>{element.name}</span>
    </div>
  )
}

const BuilderSidebar: React.FC<BuilderSidebarProps> = ({ className }) => {
  const elementCategories = [
    {
      name: 'Layout',
      elements: [
        { name: 'Section', icon: '📦', type: 'section' },
        { name: 'Container', icon: '📋', type: 'container' },
        { name: 'Row', icon: '📐', type: 'row' },
        { name: 'Column', icon: '📊', type: 'column' }
      ]
    },
    {
      name: 'Content',
      elements: [
        { name: 'Text', icon: '📝', type: 'text' },
        { name: 'Heading', icon: '📰', type: 'heading' },
        { name: 'Image', icon: '🖼️', type: 'image' },
        { name: 'Button', icon: '🔘', type: 'button' }
      ]
    },
    {
      name: 'Forms',
      elements: [
        { name: 'Form', icon: '📋', type: 'form' },
        { name: 'Input', icon: '📝', type: 'input' },
        { name: 'Select', icon: '📋', type: 'select' },
        { name: 'Checkbox', icon: '☑️', type: 'checkbox' }
      ]
    }
  ]

  return (
    <div className={cn('w-64 bg-white border-r border-gray-200 overflow-y-auto', className)}>
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Elements</h2>
        
        {elementCategories.map((category) => (
          <div key={category.name} className="mb-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {category.name}
            </h3>
            <div className="space-y-1">
              {category.elements.map((element) => (
                <ElementDraggable key={element.type} element={element} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BuilderSidebar
