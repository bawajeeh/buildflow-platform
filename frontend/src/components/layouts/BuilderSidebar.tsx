import React, { useState, useEffect } from 'react'
import { cn } from '@/utils'
import { Website, Page } from '@/types'
import toast from 'react-hot-toast'
import { useBuilderStore } from '@/store'

interface BuilderSidebarProps {
  website?: Website | null
  currentPage?: Page | null
  onPageSelect: (page: Page) => void
  onPageCreate: (pageData: { name: string; slug: string; title: string }) => Promise<Page>
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
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/json', JSON.stringify(element))
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-grab active:cursor-grabbing select-none',
        isDragging && 'opacity-50'
      )}
    >
      <span>{element.icon}</span>
      <span>{element.name}</span>
    </div>
  )
}

const BuilderSidebar: React.FC<BuilderSidebarProps> = ({ 
  website,
  currentPage,
  onPageSelect,
  onPageCreate,
  className 
}) => {
  const [isCreatingPage, setIsCreatingPage] = useState(false)
  const [pageName, setPageName] = useState('')
  const { pages } = useBuilderStore()

  const handleCreatePage = async () => {
    if (!pageName.trim()) {
      toast.error('Please enter a page name')
      return
    }
    setIsCreatingPage(true)
    try {
      const slug = pageName.toLowerCase().replace(/\s+/g, '-')
      const newPage = await onPageCreate({
        name: pageName,
        slug,
        title: pageName,
        description: '',
        isHomePage: false
      })
      toast.success(`Page "${pageName}" created!`)
      setPageName('')
    } catch (error) {
      toast.error('Failed to create page')
    } finally {
      setIsCreatingPage(false)
    }
  }
  const elementCategories = [
    {
      name: 'Layout',
      elements: [
        { name: 'Section', icon: '📦', type: 'SECTION' },
        { name: 'Container', icon: '📋', type: 'CONTAINER' },
        { name: 'Row', icon: '📐', type: 'ROW' },
        { name: 'Column', icon: '📊', type: 'COLUMN' }
      ]
    },
    {
      name: 'Content',
      elements: [
        { name: 'Text', icon: '📝', type: 'TEXT' },
        { name: 'Heading', icon: '📰', type: 'HEADING' },
        { name: 'Image', icon: '🖼️', type: 'IMAGE' },
        { name: 'Button', icon: '🔘', type: 'BUTTON' }
      ]
    },
    {
      name: 'Forms',
      elements: [
        { name: 'Form', icon: '📋', type: 'FORM' },
        { name: 'Input', icon: '📝', type: 'INPUT' },
        { name: 'Select', icon: '📋', type: 'SELECT' },
        { name: 'Checkbox', icon: '☑️', type: 'CHECKBOX' }
      ]
    }
  ]

  return (
    <div className={cn('w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col', className)}>
      {/* Pages Section */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Pages</h2>
          <button
            onClick={handleCreatePage}
            disabled={isCreatingPage}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreatingPage ? '...' : '+ New'}
          </button>
        </div>
        <input
          type="text"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreatePage()}
          placeholder="Page name..."
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
        />
        
        {/* Current Page Display */}
        {currentPage && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <div className="font-semibold text-blue-900">Current Page:</div>
            <div className="text-blue-700">{currentPage.name}</div>
            <div className="text-blue-500">/{currentPage.slug}</div>
          </div>
        )}
        
        {/* Pages List */}
        {pages.length > 0 && (
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onPageSelect(page)}
                className={cn(
                  'w-full text-left px-2 py-1 text-xs rounded',
                  currentPage?.id === page.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {page.isHome && '🏠 '}{page.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Elements Section */}
      <div className="p-4 flex-1 overflow-y-auto">
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
