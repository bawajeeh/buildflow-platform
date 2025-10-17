import React, { createContext, useContext, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  rectIntersection,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import { Element, ElementType, DragItem } from '@/types'

// Drag & Drop Context
interface DragDropContextType {
  activeElement: Element | null
  draggedElement: Element | null
  dropZones: DropZone[]
  elementTemplates: DragItem[]
  onDragStart: (event: DragStartEvent) => void
  onDragOver: (event: DragOverEvent) => void
  onDragEnd: (event: DragEndEvent) => void
  addElement: (element: Element, parentId?: string) => void
  moveElement: (elementId: string, newParentId: string, newOrder: number) => void
  updateElement: (elementId: string, updates: Partial<Element>) => void
  deleteElement: (elementId: string) => void
}

const DragDropContext = createContext<DragDropContextType | null>(null)

export const useDragDrop = () => {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider')
  }
  return context
}

// Drop Zone Interface
interface DropZone {
  id: string
  parentId?: string
  accepts: ElementType[]
  maxChildren?: number
  strategy?: 'vertical' | 'horizontal' | 'grid'
}

// Element Templates
const ELEMENT_TEMPLATES: DragItem[] = [
  // Layout Elements
  {
    id: 'section',
    type: ElementType.SECTION,
    name: 'Section',
    icon: 'Layout',
    category: 'LAYOUT',
  },
  {
    id: 'container',
    type: ElementType.CONTAINER,
    name: 'Container',
    icon: 'Box',
    category: 'LAYOUT',
  },
  {
    id: 'row',
    type: ElementType.ROW,
    name: 'Row',
    icon: 'Columns',
    category: 'LAYOUT',
  },
  {
    id: 'column',
    type: ElementType.COLUMN,
    name: 'Column',
    icon: 'Column',
    category: 'LAYOUT',
  },
  {
    id: 'spacer',
    type: ElementType.SPACER,
    name: 'Spacer',
    icon: 'Minus',
    category: 'LAYOUT',
  },
  {
    id: 'divider',
    type: ElementType.DIVIDER,
    name: 'Divider',
    icon: 'Separator',
    category: 'LAYOUT',
  },

  // Content Elements
  {
    id: 'heading',
    type: ElementType.HEADING,
    name: 'Heading',
    icon: 'Type',
    category: 'CONTENT',
  },
  {
    id: 'text',
    type: ElementType.TEXT,
    name: 'Text',
    icon: 'FileText',
    category: 'CONTENT',
  },
  {
    id: 'image',
    type: ElementType.IMAGE,
    name: 'Image',
    icon: 'Image',
    category: 'CONTENT',
  },
  {
    id: 'video',
    type: ElementType.VIDEO,
    name: 'Video',
    icon: 'Video',
    category: 'CONTENT',
  },
  {
    id: 'button',
    type: ElementType.BUTTON,
    name: 'Button',
    icon: 'MousePointer',
    category: 'CONTENT',
  },
  {
    id: 'icon',
    type: ElementType.ICON,
    name: 'Icon',
    icon: 'Star',
    category: 'CONTENT',
  },

  // Form Elements
  {
    id: 'form',
    type: ElementType.FORM,
    name: 'Form',
    icon: 'FileText',
    category: 'FORM',
  },
  {
    id: 'input',
    type: ElementType.INPUT,
    name: 'Input',
    icon: 'Square',
    category: 'FORM',
  },
  {
    id: 'textarea',
    type: ElementType.TEXTAREA,
    name: 'Textarea',
    icon: 'AlignLeft',
    category: 'FORM',
  },
  {
    id: 'select',
    type: ElementType.SELECT,
    name: 'Select',
    icon: 'ChevronDown',
    category: 'FORM',
  },
  {
    id: 'checkbox',
    type: ElementType.CHECKBOX,
    name: 'Checkbox',
    icon: 'CheckSquare',
    category: 'FORM',
  },
  {
    id: 'radio',
    type: ElementType.RADIO,
    name: 'Radio',
    icon: 'Circle',
    category: 'FORM',
  },

  // Navigation Elements
  {
    id: 'navbar',
    type: ElementType.NAVBAR,
    name: 'Navbar',
    icon: 'Menu',
    category: 'NAVIGATION',
  },
  {
    id: 'menu',
    type: ElementType.MENU,
    name: 'Menu',
    icon: 'List',
    category: 'NAVIGATION',
  },
  {
    id: 'breadcrumb',
    type: ElementType.BREADCRUMB,
    name: 'Breadcrumb',
    icon: 'ChevronRight',
    category: 'NAVIGATION',
  },

  // eCommerce Elements
  {
    id: 'product-grid',
    type: ElementType.PRODUCT_GRID,
    name: 'Product Grid',
    icon: 'Grid',
    category: 'ECOMMERCE',
  },
  {
    id: 'product-card',
    type: ElementType.PRODUCT_CARD,
    name: 'Product Card',
    icon: 'CreditCard',
    category: 'ECOMMERCE',
  },
  {
    id: 'cart',
    type: ElementType.CART,
    name: 'Cart',
    icon: 'ShoppingCart',
    category: 'ECOMMERCE',
  },
  {
    id: 'checkout',
    type: ElementType.CHECKOUT,
    name: 'Checkout',
    icon: 'CreditCard',
    category: 'ECOMMERCE',
  },

  // Booking Elements
  {
    id: 'calendar',
    type: ElementType.CALENDAR,
    name: 'Calendar',
    icon: 'Calendar',
    category: 'BOOKING',
  },
  {
    id: 'service-list',
    type: ElementType.SERVICE_LIST,
    name: 'Service List',
    icon: 'List',
    category: 'BOOKING',
  },
  {
    id: 'booking-form',
    type: ElementType.BOOKING_FORM,
    name: 'Booking Form',
    icon: 'Calendar',
    category: 'BOOKING',
  },

  // Blog Elements
  {
    id: 'blog-grid',
    type: ElementType.BLOG_GRID,
    name: 'Blog Grid',
    icon: 'Grid',
    category: 'BLOG',
  },
  {
    id: 'blog-post',
    type: ElementType.BLOG_POST,
    name: 'Blog Post',
    icon: 'FileText',
    category: 'BLOG',
  },
  {
    id: 'blog-card',
    type: ElementType.BLOG_CARD,
    name: 'Blog Card',
    icon: 'CreditCard',
    category: 'BLOG',
  },

  // Portfolio Elements
  {
    id: 'portfolio-grid',
    type: ElementType.PORTFOLIO_GRID,
    name: 'Portfolio Grid',
    icon: 'Grid',
    category: 'PORTFOLIO',
  },
  {
    id: 'portfolio-item',
    type: ElementType.PORTFOLIO_ITEM,
    name: 'Portfolio Item',
    icon: 'Image',
    category: 'PORTFOLIO',
  },

  // Other Elements
  {
    id: 'map',
    type: ElementType.MAP,
    name: 'Map',
    icon: 'Map',
    category: 'OTHER',
  },
  {
    id: 'embed',
    type: ElementType.EMBED,
    name: 'Embed',
    icon: 'Code',
    category: 'OTHER',
  },
  {
    id: 'code',
    type: ElementType.CODE,
    name: 'Code',
    icon: 'Code',
    category: 'OTHER',
  },
]

// Drag Drop Provider Component
interface DragDropProviderProps {
  children: React.ReactNode
  onAddElement?: (element: Element, parentId?: string) => void
  onMoveElement?: (elementId: string, newParentId: string, newOrder: number) => void
  onUpdateElement?: (elementId: string, updates: Partial<Element>) => void
  onDeleteElement?: (elementId: string) => void
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  onAddElement,
  onMoveElement,
  onUpdateElement,
  onDeleteElement,
}) => {
  const [activeElement, setActiveElement] = React.useState<Element | null>(null)
  const [draggedElement, setDraggedElement] = React.useState<Element | null>(null)

  // Sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Drop zones configuration
  const dropZones: DropZone[] = useMemo(() => [
    {
      id: 'page-root',
      accepts: [ElementType.SECTION, ElementType.CONTAINER, ElementType.NAVBAR],
      strategy: 'vertical',
    },
    {
      id: 'section',
      accepts: [ElementType.CONTAINER, ElementType.ROW, ElementType.SPACER, ElementType.DIVIDER],
      strategy: 'vertical',
    },
    {
      id: 'container',
      accepts: [ElementType.ROW, ElementType.COLUMN, ElementType.SPACER, ElementType.DIVIDER],
      strategy: 'vertical',
    },
    {
      id: 'row',
      accepts: [ElementType.COLUMN],
      strategy: 'horizontal',
    },
    {
      id: 'column',
      accepts: [
        ElementType.HEADING,
        ElementType.TEXT,
        ElementType.IMAGE,
        ElementType.VIDEO,
        ElementType.BUTTON,
        ElementType.ICON,
        ElementType.FORM,
        ElementType.INPUT,
        ElementType.TEXTAREA,
        ElementType.SELECT,
        ElementType.CHECKBOX,
        ElementType.RADIO,
        ElementType.PRODUCT_GRID,
        ElementType.PRODUCT_CARD,
        ElementType.CALENDAR,
        ElementType.SERVICE_LIST,
        ElementType.BOOKING_FORM,
        ElementType.BLOG_GRID,
        ElementType.BLOG_POST,
        ElementType.BLOG_CARD,
        ElementType.PORTFOLIO_GRID,
        ElementType.PORTFOLIO_ITEM,
        ElementType.MAP,
        ElementType.EMBED,
        ElementType.CODE,
      ],
      strategy: 'vertical',
    },
  ], [])

  // Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    
    // Check if it's a template element
    const template = ELEMENT_TEMPLATES.find(t => t.id === active.id)
    if (template) {
      setDraggedElement({
        id: `temp-${Date.now()}`,
        type: template.type,
        name: template.name,
        props: {},
        styles: {},
        order: 0,
        isVisible: true,
        responsive: {},
      } as Element)
      return
    }

    // Find the actual element
    // This would need to be implemented based on your element structure
    setActiveElement(null)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return

    // Handle drag over logic
    // This would need to be implemented based on your specific requirements
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveElement(null)
    setDraggedElement(null)

    if (!over) return

    // Handle drop logic
    const template = ELEMENT_TEMPLATES.find(t => t.id === active.id)
    if (template && onAddElement) {
      const newElement: Element = {
        id: `element-${Date.now()}`,
        type: template.type,
        name: template.name,
        props: {},
        styles: {},
        order: 0,
        isVisible: true,
        responsive: {},
      }
      
      onAddElement(newElement, over.id as string)
    }
  }, [onAddElement])

  // Context value
  const contextValue: DragDropContextType = {
    activeElement,
    draggedElement,
    dropZones,
    elementTemplates: ELEMENT_TEMPLATES,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    addElement: onAddElement || (() => {}),
    moveElement: onMoveElement || (() => {}),
    updateElement: onUpdateElement || (() => {}),
    deleteElement: onDeleteElement || (() => {}),
  }

  return (
    <DragDropContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {draggedElement && (
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-2 shadow-lg">
              <div className="text-sm font-medium text-primary">
                {draggedElement.name}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  )
}

// Utility functions for drag & drop
export const createElement = (type: ElementType, name: string): Element => {
  return {
    id: `element-${Date.now()}`,
    type,
    name,
    props: {},
    styles: {},
    order: 0,
    isVisible: true,
    responsive: {},
  }
}

export const canDropElement = (elementType: ElementType, dropZoneId: string): boolean => {
  const dropZone = dropZones.find(zone => zone.id === dropZoneId)
  return dropZone ? dropZone.accepts.includes(elementType) : false
}

export const getDropZoneStrategy = (dropZoneId: string) => {
  const dropZone = dropZones.find(zone => zone.id === dropZoneId)
  if (!dropZone) return verticalListSortingStrategy

  switch (dropZone.strategy) {
    case 'horizontal':
      return horizontalListSortingStrategy
    case 'grid':
      return rectSortingStrategy
    default:
      return verticalListSortingStrategy
  }
}

// Export types and constants
export { ELEMENT_TEMPLATES, type DropZone }
export type { DragDropContextType }
