import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Element, ElementStyles } from '@/types'
import { cn } from '@/utils'
import { useAuthStore } from '@/store'
import { API_CONFIG } from '@/config/api'

// Element Components
import {
  SectionElement,
  ContainerElement,
  RowElement,
  ColumnElement,
  HeadingElement,
  TextElement,
  ImageElement,
  VideoElement,
  ButtonElement,
  IconElement,
  FormElement,
  InputElement,
  TextareaElement,
  SelectElement,
  CheckboxElement,
  RadioElement,
  NavbarElement,
  MenuElement,
  BreadcrumbElement,
  ProductGridElement,
  ProductCardElement,
  CalendarElement,
  ServiceListElement,
  BookingFormElement,
  BlogGridElement,
  BlogPostElement,
  BlogCardElement,
  PortfolioGridElement,
  PortfolioItemElement,
  MapElement,
  EmbedElement,
  CodeElement,
  SpacerElement,
  DividerElement
} from './elements'

// Types
interface ElementRendererProps {
  element: Element
  isSelected: boolean
  isHovered: boolean
  responsiveMode: 'desktop' | 'tablet' | 'mobile'
  onClick: (event: React.MouseEvent) => void
  onHover: (element: Element | null) => void
}

const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  isHovered,
  responsiveMode,
  onClick,
  onHover,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    disabled: false,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Get responsive styles
  const getResponsiveStyles = (styles: ElementStyles): React.CSSProperties => {
    const baseStyles = { ...styles }
    
    // Apply responsive overrides
    if (responsiveMode === 'mobile' && element.responsive.mobile) {
      return { ...baseStyles, ...element.responsive.mobile }
    }
    if (responsiveMode === 'tablet' && element.responsive.tablet) {
      return { ...baseStyles, ...element.responsive.tablet }
    }
    if (responsiveMode === 'desktop' && element.responsive.desktop) {
      return { ...baseStyles, ...element.responsive.desktop }
    }
    
    return baseStyles
  }

  // Handle mouse events
  const handleMouseEnter = () => {
    onHover(element)
  }

  const handleMouseLeave = () => {
    onHover(null)
  }

  // Render element based on type
  const renderElement = () => {
    const elementProps = {
      element,
      isSelected,
      isHovered,
      responsiveMode,
      onClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    }

    switch (element.type) {
      case 'SECTION':
        return <SectionElement {...elementProps} />
      case 'CONTAINER':
        return <ContainerElement {...elementProps} />
      case 'ROW':
        return <RowElement {...elementProps} />
      case 'COLUMN':
        return <ColumnElement {...elementProps} />
      case 'HEADING':
        return <HeadingElement {...elementProps} />
      case 'TEXT':
        return <TextElement {...elementProps} />
      case 'IMAGE':
        return <ImageElement {...elementProps} />
      case 'VIDEO':
        return <VideoElement {...elementProps} />
      case 'BUTTON':
        return <ButtonElement {...elementProps} />
      case 'ICON':
        return <IconElement {...elementProps} />
      case 'FORM':
        return <FormElement {...elementProps} />
      case 'INPUT':
        return <InputElement {...elementProps} />
      case 'TEXTAREA':
        return <TextareaElement {...elementProps} />
      case 'SELECT':
        return <SelectElement {...elementProps} />
      case 'CHECKBOX':
        return <CheckboxElement {...elementProps} />
      case 'RADIO':
        return <RadioElement {...elementProps} />
      case 'NAVBAR':
        return <NavbarElement {...elementProps} />
      case 'MENU':
        return <MenuElement {...elementProps} />
      case 'BREADCRUMB':
        return <BreadcrumbElement {...elementProps} />
      case 'PRODUCT_GRID':
        return <ProductGridElement {...elementProps} />
      case 'PRODUCT_CARD':
        return <ProductCardElement {...elementProps} />
      case 'CALENDAR':
        return <CalendarElement {...elementProps} />
      case 'SERVICE_LIST':
        return <ServiceListElement {...elementProps} />
      case 'BOOKING_FORM':
        return <BookingFormElement {...elementProps} />
      case 'BLOG_GRID':
        return <BlogGridElement {...elementProps} />
      case 'BLOG_POST':
        return <BlogPostElement {...elementProps} />
      case 'BLOG_CARD':
        return <BlogCardElement {...elementProps} />
      case 'PORTFOLIO_GRID':
        return <PortfolioGridElement {...elementProps} />
      case 'PORTFOLIO_ITEM':
        return <PortfolioItemElement {...elementProps} />
      case 'MAP':
        return <MapElement {...elementProps} />
      case 'EMBED':
        return <EmbedElement {...elementProps} />
      case 'CODE':
        return <CodeElement {...elementProps} />
      case 'SPACER':
        return <SpacerElement {...elementProps} />
      case 'DIVIDER':
        return <DividerElement {...elementProps} />
      default:
        return (
          <div className="p-4 border border-dashed border-muted-foreground/50 rounded-lg text-center text-muted-foreground">
            Unknown element type: {element.type}
          </div>
        )
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50',
        isSelected && 'element-selected',
        isHovered && !isSelected && 'element-hover'
      )}
      {...attributes}
      {...listeners}
    >
      {/* Drag Handle */}
      <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 bg-primary text-primary-foreground rounded cursor-grab active:cursor-grabbing flex items-center justify-center text-xs">
          ⋮⋮
        </div>
      </div>

      {/* Element Content */}
      <div
        style={getResponsiveStyles(element.styles)}
        className={cn(
          'relative',
          !element.isVisible && 'opacity-50'
        )}
      >
        {renderElement()}
      </div>

      {/* Element Actions */}
      {(isSelected || isHovered) && (
        <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="w-6 h-6 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
            onClick={async (e) => {
              e.stopPropagation()
              try {
                const { token } = useAuthStore.getState()
                const response = await fetch(API_CONFIG.ENDPOINTS.ELEMENTS.CREATE, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    pageId: element.pageId,
                    type: element.type,
                    name: `${element.name} (Copy)`,
                    props: element.props,
                    styles: element.styles,
                    parentId: element.parentId,
                    order: element.order + 1,
                  }),
                })

                if (!response.ok) {
                  throw new Error('Failed to duplicate element')
                }

                const data = await response.json()
                // TODO: Refresh elements list
                console.log('Element duplicated:', data)
              } catch (error) {
                console.error('Error duplicating element:', error)
              }
            }}
            title="Duplicate"
          >
            +
          </button>
          <button
            className="w-6 h-6 bg-destructive text-destructive-foreground rounded text-xs hover:bg-destructive/90"
            onClick={async (e) => {
              e.stopPropagation()
              try {
                const { token } = useAuthStore.getState()
                const response = await fetch(API_CONFIG.ENDPOINTS.ELEMENTS.DELETE(element.id), {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                })

                if (!response.ok) {
                  throw new Error('Failed to delete element')
                }

                // TODO: Remove element from UI
                console.log('Element deleted:', element.id)
              } catch (error) {
                console.error('Error deleting element:', error)
              }
            }}
            title="Delete"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default ElementRenderer
