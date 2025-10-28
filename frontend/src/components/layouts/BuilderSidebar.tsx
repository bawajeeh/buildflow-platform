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
        'flex flex-col items-center justify-center p-3 text-xs text-gray-700 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-lg cursor-grab active:cursor-grabbing select-none transition-all duration-200 bg-white shadow-sm hover:shadow-md transform hover:scale-105',
        isDragging && 'opacity-50 scale-95'
      )}
    >
      <span className="text-2xl mb-1">{element.icon}</span>
      <span className="font-semibold text-center">{element.name}</span>
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
    <div className={cn('w-72 bg-gradient-to-br from-gray-50 to-white border-r border-gray-300 overflow-hidden flex flex-col shadow-lg', className)}>
      {/* Pages Section */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            📄 Pages
          </h2>
          <button
            onClick={handleCreatePage}
            disabled={isCreatingPage}
            className="px-3 py-1.5 text-xs bg-white text-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 font-semibold shadow-md transition-all"
          >
            {isCreatingPage ? '⏳ Creating...' : '+ New Page'}
          </button>
        </div>
        
        {/* Create Page Input */}
        <div className="relative mb-3">
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreatePage()}
            placeholder="Enter page name..."
            className="w-full px-3 py-2 text-sm bg-white/90 border border-white/50 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
          />
        </div>
        
        {/* Current Page Display */}
        {currentPage && (
          <div className="p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg">
            <div className="text-xs font-semibold text-white/90 mb-1">Current Page</div>
            <div className="text-sm font-bold">{currentPage.name}</div>
            <div className="text-xs text-white/70">/{currentPage.slug}</div>
          </div>
        )}
      </div>
      
      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {pages.length > 0 ? (
          pages.map((page) => (
            <button
              key={page.id}
              onClick={() => onPageSelect(page)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2',
                currentPage?.id === page.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
              )}
            >
              <span className="text-lg">{page.isHome ? '🏠' : '📄'}</span>
              <span className="text-sm font-medium">{page.name}</span>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            <div className="text-3xl mb-2">📄</div>
            <p>No pages yet</p>
          </div>
        )}
      </div>

      {/* Elements Section */}
      <div className="p-4 bg-white border-t border-gray-200 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            🎨 Elements
          </h2>
          <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
            {elementCategories.reduce((acc, cat) => acc + cat.elements.length, 0)} total
          </div>
        </div>
        
        {elementCategories.map((category) => (
          <div key={category.name} className="mb-5 bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                {category.name}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
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
