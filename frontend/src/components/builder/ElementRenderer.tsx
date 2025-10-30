import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Element, ElementStyles } from '@/types'
import { cn } from '@/utils'
import { useAuthStore, useBuilderStore } from '@/store'
import { API_CONFIG } from '@/config/api'
import { resolveDataBinding, evaluateCondition, getAnimationClasses } from '@/utils/dataBinding'
import { usePluginsStore } from '@/store/plugins'

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
    if (responsiveMode === 'mobile' && element.responsive?.mobile) {
      return { ...baseStyles, ...element.responsive.mobile }
    }
    if (responsiveMode === 'tablet' && element.responsive?.tablet) {
      return { ...baseStyles, ...element.responsive.tablet }
    }
    if (responsiveMode === 'desktop' && element.responsive?.desktop) {
      return { ...baseStyles, ...(element.responsive.desktop || {}) }
    }
    
    return baseStyles
  }
  
  // Check visibility per breakpoint
  const isVisibleForBreakpoint = React.useMemo(() => {
    if (responsiveMode === 'desktop') {
      return element.isVisible !== false
    }
    const vis = (element.props as any)?.visibility?.[responsiveMode]
    return vis !== undefined ? vis : true
  }, [element, responsiveMode])
  
  if (!isVisibleForBreakpoint || !shouldRender) {
    return null
  }
  // Plugin elements: type like 'PLUGIN:chart.bar'
  if (typeof element.type === 'string' && element.type.toUpperCase().startsWith('PLUGIN:')) {
    const t = element.type.split(':')[1] || ''
    const plugin = usePluginsStore.getState().get(t)
    if (plugin) {
      const p = resolveDataBindings(element.props || {})
      return (
        <div onClick={onClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={animationClasses}>
          {plugin.render(p as any)}
        </div>
      )
    }
  }

  // Handle mouse events
  const handleMouseEnter = () => {
    onHover(element)
  }
  // Lock awareness
  const [lockedBy, setLockedBy] = React.useState<string | null>(null)
  React.useEffect(() => {
    const onLocked = (e: any) => { if (e.detail.elementId === element.id) setLockedBy(e.detail.userId) }
    const onUnlocked = (e: any) => { if (e.detail.elementId === element.id) setLockedBy(null) }
    window.addEventListener('realtime:element:locked', onLocked as any)
    window.addEventListener('realtime:element:unlocked', onUnlocked as any)
    return () => {
      window.removeEventListener('realtime:element:locked', onLocked as any)
      window.removeEventListener('realtime:element:unlocked', onUnlocked as any)
    }
  }, [element.id])

  const handleMouseLeave = () => {
    onHover(null)
  }

  // Resolve theme tokens like 'token:colors.primary'
  const { themeTokens, cmsData } = useBuilderStore()
  const resolveToken = (value: any): any => {
    if (typeof value === 'string' && value.startsWith('token:')) {
      const path = value.replace('token:', '')
      const keys = path.split('.')
      let cur: any = themeTokens
      for (const k of keys) cur = cur?.[k]
      return cur ?? value
    }
    return value
  }

  // Phase 3: Resolve data bindings
  const resolveDataBindings = React.useCallback((props: Record<string, any>) => {
    if (!element.dataBindings) return props
    const resolved = { ...props }
    const context = { ...cmsData, currentItem: (props as any).currentItem }
    Object.entries(element.dataBindings).forEach(([key, template]) => {
      resolved[key] = resolveDataBinding(String(template || ''), context)
    })
    return resolved
  }, [element.dataBindings, cmsData])

  // Phase 3: Check conditional rendering
  const shouldRender = React.useMemo(() => {
    if (!element.condition) return true
    const context = { ...cmsData, currentItem: (element.props as any).currentItem }
    return evaluateCondition(element.condition, context)
  }, [element.condition, element.props, cmsData])

  // Phase 3: Apply animations
  const animationClasses = React.useMemo(() => {
    if (!element.animations) return ''
    return getAnimationClasses({
      entrance: element.animations.entrance,
      exit: element.animations.exit,
      delay: element.animations.delay,
    })
  }, [element.animations])

  // Merge breakpoint overrides for props/styles
  const activeBp = responsiveMode
  const mergedProps = React.useMemo(() => {
    const base: any = element.props || {}
    const bp = base.breakpoints?.[activeBp] || {}
    const withBreakpoints = { ...base, ...bp }
    // Phase 3: Apply data bindings
    return resolveDataBindings(withBreakpoints)
  }, [element.props, activeBp, resolveDataBindings])

  const mergedStyles = React.useMemo<React.CSSProperties>(() => {
    const base: any = element.styles || {}
    const withTokens: any = {}
    for (const key of Object.keys(base)) if (key !== 'variants') withTokens[key] = resolveToken(base[key])
    // apply variant override if present
    const variantName = (element.props as any)?.variantName
    const variants = (element.styles as any)?.variants || {}
    const variantStyles = variantName && variants[variantName] ? variants[variantName] : {}
    for (const key of Object.keys(variantStyles)) withTokens[key] = resolveToken(variantStyles[key])
    return withTokens
  }, [element.styles, themeTokens, element.props])

  const effectiveElement = React.useMemo(() => ({ ...element, props: mergedProps, styles: mergedStyles }), [element, mergedProps, mergedStyles])

  // Helper: resolve dataset for loops
  const resolveDataSet = React.useCallback((ds?: { type?: string }) => {
    if (!ds || !ds.type) return [] as any[]
    if (ds.type === 'products') return cmsData.products || []
    if (ds.type === 'blog') return cmsData.blog || []
    if (ds.type === 'services') return cmsData.services || []
    if (ds.type === 'custom') return cmsData.custom || []
    return [] as any[]
  }, [cmsData])

  // Render element based on type
  const renderElement = (overrideCurrentItem?: any) => {
    const elementProps = {
      element: overrideCurrentItem ? { ...effectiveElement, props: { ...(effectiveElement.props || {}), currentItem: overrideCurrentItem } } : effectiveElement,
      isSelected,
      isHovered,
      responsiveMode,
      onClick: handleInteractionClick, // Phase 3: Use interaction handler
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    }

    const normalizedType = effectiveElement.type.toUpperCase()
    
    switch (normalizedType) {
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
            Unknown element type: {element.type} (normalized: {normalizedType})
          </div>
        )
    }
  }

  // Phase 3: Handle interactions
  const handleInteractionClick = (e: React.MouseEvent) => {
    onClick(e)
    if (element.interactions?.onClick) {
      const { type, target, action } = element.interactions.onClick
      if (type === 'navigate' && target) {
        window.location.href = target
      } else if (type === 'modal') {
        // Open global modal
        try {
          const { useModalStore } = await import('@/store/modal')
          useModalStore.getState().open(target || 'Modal action triggered')
        } catch {
          const content = target || 'Modal action triggered'
          try { window.alert(content) } catch { console.log('Modal:', content) }
        }
      } else if (type === 'toggle' && target) {
        // Toggle visibility of target element by id
        try {
          const { currentPage, updateElement } = useBuilderStore.getState()
          const el = currentPage?.elements.find((x: any) => x.id === target)
          if (el) updateElement(el.id, { isVisible: !el.isVisible } as any)
        } catch (err) {
          console.error('Toggle interaction failed:', err)
        }
      } else if (type === 'custom' && action) {
        // Execute custom JS
        try { eval(action) } catch (err) { console.error('Custom action error:', err) }
      }
    }
  }

  // Phase 3: Inject custom CSS
  React.useEffect(() => {
    if (element.customCSS) {
      const styleId = `element-${element.id}-css`
      let styleEl = document.getElementById(styleId)
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
      }
      styleEl.textContent = `[data-element-id="${element.id}"] { ${element.customCSS} }`
      return () => {
        const el = document.getElementById(styleId)
        if (el) el.remove()
      }
    }
  }, [element.customCSS, element.id])

  // Phase 3: Inject custom JS
  React.useEffect(() => {
    if (element.customJS) {
      const allow = import.meta.env.DEV || import.meta.env.VITE_ALLOW_CUSTOM_JS === 'true'
      if (!allow) return
      try {
        const fn = new Function('element', 'props', element.customJS)
        fn(element, element.props)
      } catch (err) {
        console.error('Custom JS error:', err)
      }
    }
  }, [element.customJS, element.id, element.props])

  // If element has a loop config, repeat rendering for each item in data source
  if ((element as any)?.loop?.dataSource) {
    const items = resolveDataSet((element as any).loop.dataSource) || []
    return (
      <div
        ref={setNodeRef}
        data-element-id={element.id}
        style={style}
        className={cn(
          'relative group',
          isDragging && 'opacity-50',
          animationClasses,
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

        {/* Element Content (looped) */}
        <div
          style={getResponsiveStyles(element.styles)}
          onClick={handleInteractionClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {items.map((it, idx) => (
            <div key={`${element.id}-loop-${idx}`}>{renderElement(it)}</div>
          ))}
        </div>

        {/* Element Actions */}
        <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-white/80 border">{element.type}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      data-element-id={element.id}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50',
        animationClasses,
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
