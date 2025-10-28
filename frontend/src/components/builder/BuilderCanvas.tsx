import React, { useCallback, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Page, Element } from '@/types'
import { useBuilderStore } from '@/store'
import toast from 'react-hot-toast'

// Components
import ElementRenderer from './ElementRenderer'
import DropZone from './DropZone'
import EmptyState from './EmptyState'

// Types
interface BuilderCanvasProps {
  page: Page | null
  selectedElement: Element | null
  responsiveMode: 'desktop' | 'tablet' | 'mobile'
  onElementSelect: (element: Element | null) => void
}

const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  page,
  selectedElement,
  responsiveMode,
  onElementSelect,
}) => {
  const { hoveredElement, hoverElement } = useBuilderStore()

  // Make the page root droppable
  const { setNodeRef: setPageRef, isOver: isPageOver } = useDroppable({
    id: 'page-root',
  })

  // Get page elements sorted by order
  const sortedElements = useMemo(() => {
    if (!page?.elements) return []
    return [...page.elements].sort((a, b) => a.order - b.order)
  }, [page?.elements])

  // Handle element click
  const handleElementClick = useCallback((element: Element, event: React.MouseEvent) => {
    event.stopPropagation()
    onElementSelect(element)
  }, [onElementSelect])

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onElementSelect(null)
    }
  }, [onElementSelect])

  // Handle element hover
  const handleElementHover = useCallback((element: Element | null) => {
    hoverElement(element)
  }, [hoverElement])

  // Render element with drag & drop support
  const renderElement = useCallback((element: Element) => {
    return (
      <ElementRenderer
        key={element.id}
        element={element}
        isSelected={selectedElement?.id === element.id}
        isHovered={hoveredElement?.id === element.id}
        responsiveMode={responsiveMode}
        onClick={(e) => handleElementClick(element, e)}
        onHover={handleElementHover}
      />
    )
  }, [selectedElement, hoveredElement, responsiveMode, handleElementClick, handleElementHover])

  // Handle drop event
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (data) {
      try {
        const elementData = JSON.parse(data)
        const newElement: Element = {
          id: `element-${Date.now()}`,
          type: elementData.type as any,
          name: elementData.name,
          props: {},
          styles: {},
          order: sortedElements.length,
          isVisible: true,
          responsive: {},
        }
        await addElement(newElement)
        toast.success(`${elementData.name} added successfully`)
      } catch (error) {
        console.error('Failed to add element:', error)
        toast.error('Failed to add element')
      }
    }
  }, [addElement, sortedElements.length])

  // Render empty state if no elements
  if (!page || sortedElements.length === 0) {
    return (
      <div
        ref={setPageRef}
        className={`min-h-full p-8 transition-colors ${
          isPageOver ? 'bg-blue-50 border-2 border-dashed border-blue-400' : 'bg-background'
        }`}
        onClick={handleCanvasClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {isPageOver && (
          <div className="text-center py-12">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-blue-600 font-medium">Drop here to add element</p>
          </div>
        )}
        {!isPageOver && <EmptyState />}
      </div>
    )
  }

  return (
    <div
      ref={setPageRef}
      className={`min-h-full transition-colors ${
        isPageOver ? 'bg-primary/5' : 'bg-background'
      }`}
      onClick={handleCanvasClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <SortableContext
        items={sortedElements.map(el => el.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="relative">
          {/* Page Elements */}
          {sortedElements.map((element) => (
            <div key={element.id} className="relative group">
              {/* Element Selection Overlay */}
              {selectedElement?.id === element.id && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-primary rounded-md" />
                  <div className="absolute -top-8 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                    {element.name}
                  </div>
                </div>
              )}

              {/* Element Hover Overlay */}
              {hoveredElement?.id === element.id && selectedElement?.id !== element.id && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <div className="absolute inset-0 border border-muted-foreground/50 rounded-md" />
                </div>
              )}

              {/* Render Element */}
              {renderElement(element)}

              {/* Drop Zones for Element */}
              <DropZone
                id={`dropzone-${element.id}`}
                parentId={element.id}
                accepts={getElementAccepts(element.type)}
                className="absolute inset-0 pointer-events-none"
              />
            </div>
          ))}

          {/* Bottom Drop Zone */}
          <DropZone
            id="dropzone-page-bottom"
            parentId="page-root"
            accepts={['SECTION', 'CONTAINER', 'NAVBAR']}
            className="min-h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg m-4 flex items-center justify-center text-muted-foreground text-sm"
          >
            Drop elements here
          </DropZone>
        </div>
      </SortableContext>
    </div>
  )
}

// Helper function to get accepted element types for a parent
const getElementAccepts = (parentType: string): string[] => {
  switch (parentType) {
    case 'SECTION':
      return ['CONTAINER', 'ROW', 'SPACER', 'DIVIDER']
    case 'CONTAINER':
      return ['ROW', 'COLUMN', 'SPACER', 'DIVIDER']
    case 'ROW':
      return ['COLUMN']
    case 'COLUMN':
      return [
        'HEADING', 'TEXT', 'IMAGE', 'VIDEO', 'BUTTON', 'ICON',
        'FORM', 'INPUT', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'RADIO',
        'PRODUCT_GRID', 'PRODUCT_CARD', 'CALENDAR', 'SERVICE_LIST',
        'BOOKING_FORM', 'BLOG_GRID', 'BLOG_POST', 'BLOG_CARD',
        'PORTFOLIO_GRID', 'PORTFOLIO_ITEM', 'MAP', 'EMBED', 'CODE'
      ]
    default:
      return []
  }
}

export default BuilderCanvas
