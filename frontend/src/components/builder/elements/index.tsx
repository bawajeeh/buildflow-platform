import React from 'react'
import { Element } from '@/types'
import { cn } from '@/utils'
import { useBuilderStore } from '@/store'
import { resolveDataBinding } from '@/utils/dataBinding'

// Types
interface BaseElementProps {
  element: Element
  isSelected: boolean
  isHovered: boolean
  responsiveMode: 'desktop' | 'tablet' | 'mobile'
  onClick: (event: React.MouseEvent) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

// Section Element
export const SectionElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <section
      className={cn(
        'min-h-32 p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Section - Drop elements here
      </div>
    </section>
  )
}

// Container Element
export const ContainerElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'min-h-24 p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Container - Drop elements here
      </div>
    </div>
  )
}

// Row Element
export const RowElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'min-h-16 p-2 border border-dashed border-muted-foreground/25 rounded-lg flex gap-2',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex-1 text-center text-muted-foreground text-sm py-4">
        Row - Drop columns here
      </div>
    </div>
  )
}

// Column Element
export const ColumnElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'min-h-16 p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm py-4">
        Column - Drop content here
      </div>
    </div>
  )
}

// Heading Element
export const HeadingElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const level = element.props.level || 1
  const text = element.props.text || 'Heading'
  
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <HeadingTag
      className={cn(
        'p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {text}
    </HeadingTag>
  )
}

// Text Element
export const TextElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const text = element.props.text || 'Text content goes here...'

  return (
    <p
      className={cn(
        'p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {text}
    </p>
  )
}

// Image Element
export const ImageElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const src = element.props.src || ''
  const alt = element.props.alt || 'Image'

  return (
    <div
      className={cn(
        'p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded"
        />
      ) : (
        <div className="w-full h-32 bg-muted rounded flex items-center justify-center text-muted-foreground">
          Click to add image
        </div>
      )}
    </div>
  )
}

// Video Element
export const VideoElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const src = element.props.src || ''

  return (
    <div
      className={cn(
        'p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {src ? (
        <video
          src={src}
          className="max-w-full h-auto rounded"
          controls
        />
      ) : (
        <div className="w-full h-32 bg-muted rounded flex items-center justify-center text-muted-foreground">
          Click to add video
        </div>
      )}
    </div>
  )
}

// Button Element
export const ButtonElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const text = element.props.text || 'Button'
  const variant = element.props.variant || 'primary'

  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg border border-dashed border-muted-foreground/25',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        variant === 'outline' && 'border border-input hover:bg-accent hover:text-accent-foreground'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {text}
    </button>
  )
}

// Icon Element
export const IconElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const name = element.props.name || 'star'
  const size = element.props.size || 24

  return (
    <div
      className={cn(
        'p-2 border border-dashed border-muted-foreground/25 rounded-lg inline-flex items-center justify-center',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="text-muted-foreground"
        style={{ width: size, height: size }}
      >
        ⭐
      </div>
    </div>
  )
}

// Form Element
export const FormElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <form
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg space-y-4',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Form - Drop form elements here
      </div>
    </form>
  )
}

// Input Element
export const InputElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const placeholder = element.props.placeholder || 'Enter text...'
  const type = element.props.type || 'text'

  return (
    <input
      type={type}
      placeholder={placeholder}
      className={cn(
        'w-full p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      readOnly
    />
  )
}

// Textarea Element
export const TextareaElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const placeholder = element.props.placeholder || 'Enter text...'
  const rows = element.props.rows || 3

  return (
    <textarea
      placeholder={placeholder}
      rows={rows}
      className={cn(
        'w-full p-2 border border-dashed border-muted-foreground/25 rounded-lg resize-none',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      readOnly
    />
  )
}

// Select Element
export const SelectElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const options = element.props.options || ['Option 1', 'Option 2', 'Option 3']

  return (
    <select
      className={cn(
        'w-full p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled
    >
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

// Checkbox Element
export const CheckboxElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const label = element.props.label || 'Checkbox'
  const checked = element.props.checked || false

  return (
    <label
      className={cn(
        'flex items-center gap-2 p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {}}
        className="pointer-events-none"
      />
      <span>{label}</span>
    </label>
  )
}

// Radio Element
export const RadioElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const label = element.props.label || 'Radio'
  const checked = element.props.checked || false

  return (
    <label
      className={cn(
        'flex items-center gap-2 p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <input
        type="radio"
        checked={checked}
        onChange={() => {}}
        className="pointer-events-none"
      />
      <span>{label}</span>
    </label>
  )
}

// Navbar Element
export const NavbarElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <nav
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Navbar - Drop menu items here
      </div>
    </nav>
  )
}

// Menu Element
export const MenuElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Menu
      </div>
    </div>
  )
}

// Breadcrumb Element
export const BreadcrumbElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <nav
      className={cn(
        'p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Breadcrumb
      </div>
    </nav>
  )
}

// Product Grid Element - Phase 3: Dynamic Data Rendering
export const ProductGridElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { cmsData } = useBuilderStore()
  
  // Phase 3: Get products from dataSource or fallback to all products
  const products = React.useMemo(() => {
    if (element.dataSource?.type === 'products') {
      let items = cmsData.products || []
      if (element.dataSource.filter) {
        Object.entries(element.dataSource.filter).forEach(([key, value]) => {
          items = items.filter((p: any) => p[key] === value)
        })
      }
      if (element.dataSource.sort) {
        const { field, order } = element.dataSource.sort
        items = items.slice().sort((a: any, b: any) => {
          const av = a?.[field]; const bv = b?.[field]
          if (av === bv) return 0
          return (av > bv ? 1 : -1) * (order === 'desc' ? -1 : 1)
        })
      }
      // Pagination support
      if (element.dataSource.page && element.dataSource.pageSize) {
        const page = element.dataSource.page || 1
        const pageSize = element.dataSource.pageSize || 10
        const start = (page - 1) * pageSize
        items = items.slice(start, start + pageSize)
      } else if (element.dataSource.limit) {
        items = items.slice(0, element.dataSource.limit)
      }
      return items
    }
    return cmsData.products || []
  }, [element.dataSource, cmsData.products])

  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer min-h-32'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product: any, idx: number) => (
            <div
              key={product.id || idx}
              className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {element.dataBindings ? (
                <>
                  {element.dataBindings.image && (
                    <img
                      src={resolveDataBinding(element.dataBindings.image, { product, ...cmsData })}
                      alt={product.name || 'Product'}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  {element.dataBindings.title && (
                    <h3 className="font-semibold text-sm mb-1">
                      {resolveDataBinding(element.dataBindings.title, { product, ...cmsData })}
                    </h3>
                  )}
                  {element.dataBindings.price && (
                    <p className="text-blue-600 font-bold">
                      ${resolveDataBinding(element.dataBindings.price, { product, ...cmsData })}
                    </p>
                  )}
                  {element.dataBindings.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {resolveDataBinding(element.dataBindings.description, { product, ...cmsData })}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <img
                    src={product.images?.[0]?.url || '/placeholder.png'}
                    alt={product.name || 'Product'}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h3 className="font-semibold text-sm mb-1">{product.name || 'Product'}</h3>
                  <p className="text-blue-600 font-bold">${product.price || 0}</p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm py-8">
          {isSelected ? 'Configure Data Source in Properties panel' : 'Product Grid - No products found'}
        </div>
      )}
    </div>
  )
}

// Product Card Element - Phase 3: Data Binding Support
export const ProductCardElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { cmsData } = useBuilderStore()
  const currentItem = (element.props as any)?.currentItem
  
  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {element.dataBindings && currentItem ? (
        <div className="border rounded-lg p-3 bg-white">
          {element.dataBindings.image && (
            <img
              src={resolveDataBinding(element.dataBindings.image, { product: currentItem, ...cmsData })}
              alt={currentItem.name || 'Product'}
              className="w-full h-32 object-cover rounded mb-2"
            />
          )}
          {element.dataBindings.title && (
            <h3 className="font-semibold text-sm mb-1">
              {resolveDataBinding(element.dataBindings.title, { product: currentItem, ...cmsData })}
            </h3>
          )}
          {element.dataBindings.price && (
            <p className="text-blue-600 font-bold">
              ${resolveDataBinding(element.dataBindings.price, { product: currentItem, ...cmsData })}
            </p>
          )}
          {element.dataBindings.description && (
            <p className="text-xs text-gray-600 mt-1">
              {resolveDataBinding(element.dataBindings.description, { product: currentItem, ...cmsData })}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm">
          Product Card {isSelected && '- Configure bindings'}
        </div>
      )}
    </div>
  )
}

// Calendar Element
export const CalendarElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Calendar
      </div>
    </div>
  )
}

// Service List Element - Phase 3: Dynamic Data Rendering
export const ServiceListElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { cmsData } = useBuilderStore()
  
  // Phase 3: Get services from dataSource
  const services = React.useMemo(() => {
    if (element.dataSource?.type === 'services') {
      let items = cmsData.services || []
      if (element.dataSource.filter) {
        Object.entries(element.dataSource.filter).forEach(([key, value]) => {
          items = items.filter((s: any) => s[key] === value)
        })
      }
      // Pagination support
      if (element.dataSource.page && element.dataSource.pageSize) {
        const page = element.dataSource.page || 1
        const pageSize = element.dataSource.pageSize || 10
        const start = (page - 1) * pageSize
        items = items.slice(start, start + pageSize)
      } else if (element.dataSource.limit) {
        items = items.slice(0, element.dataSource.limit)
      }
      return items
    }
    return cmsData.services || []
  }, [element.dataSource, cmsData.services])

  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer min-h-32'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {services.length > 0 ? (
        <div className="space-y-2">
          {services.map((service: any, idx: number) => (
            <div
              key={service.id || idx}
              className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {element.dataBindings ? (
                <>
                  {element.dataBindings.name && (
                    <h3 className="font-semibold text-sm mb-1">
                      {resolveDataBinding(element.dataBindings.name, { service, ...cmsData })}
                    </h3>
                  )}
                  {element.dataBindings.description && (
                    <p className="text-xs text-gray-600">
                      {resolveDataBinding(element.dataBindings.description, { service, ...cmsData })}
                    </p>
                  )}
                  {element.dataBindings.price && (
                    <p className="text-blue-600 font-bold mt-1">
                      ${resolveDataBinding(element.dataBindings.price, { service, ...cmsData })}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-sm mb-1">{service.name || 'Service'}</h3>
                  <p className="text-xs text-gray-600">{service.description || ''}</p>
                  {service.price && <p className="text-blue-600 font-bold mt-1">${service.price}</p>}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm py-8">
          {isSelected ? 'Configure Data Source in Properties panel' : 'Service List - No services found'}
        </div>
      )}
    </div>
  )
}

// Booking Form Element
export const BookingFormElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Booking Form
      </div>
    </div>
  )
}

// Blog Grid Element - Phase 3: Dynamic Data Rendering
export const BlogGridElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { cmsData } = useBuilderStore()
  
  // Phase 3: Get blog posts from dataSource
  const blogPosts = React.useMemo(() => {
    if (element.dataSource?.type === 'blog') {
      let items = cmsData.blog || []
      if (element.dataSource.filter) {
        Object.entries(element.dataSource.filter).forEach(([key, value]) => {
          items = items.filter((p: any) => p[key] === value)
        })
      }
      if (element.dataSource.sort) {
        const { field, order } = element.dataSource.sort
        items = items.slice().sort((a: any, b: any) => {
          const av = a?.[field]; const bv = b?.[field]
          if (av === bv) return 0
          return (av > bv ? 1 : -1) * (order === 'desc' ? -1 : 1)
        })
      }
      // Pagination support
      if (element.dataSource.page && element.dataSource.pageSize) {
        const page = element.dataSource.page || 1
        const pageSize = element.dataSource.pageSize || 10
        const start = (page - 1) * pageSize
        items = items.slice(start, start + pageSize)
      } else if (element.dataSource.limit) {
        items = items.slice(0, element.dataSource.limit)
      }
      return items
    }
    return cmsData.blog || []
  }, [element.dataSource, cmsData.blog])

  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer min-h-32'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {blogPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogPosts.map((post: any, idx: number) => (
            <div
              key={post.id || idx}
              className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {element.dataBindings ? (
                <>
                  {element.dataBindings.image && (
                    <img
                      src={resolveDataBinding(element.dataBindings.image, { blog: post, ...cmsData })}
                      alt={post.title || 'Blog Post'}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  {element.dataBindings.title && (
                    <h3 className="font-semibold text-sm mb-1">
                      {resolveDataBinding(element.dataBindings.title, { blog: post, ...cmsData })}
                    </h3>
                  )}
                  {element.dataBindings.excerpt && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {resolveDataBinding(element.dataBindings.excerpt, { blog: post, ...cmsData })}
                    </p>
                  )}
                  {element.dataBindings.date && (
                    <p className="text-xs text-gray-400 mt-1">
                      {resolveDataBinding(element.dataBindings.date, { blog: post, ...cmsData })}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-sm mb-1">{post.title || 'Blog Post'}</h3>
                  <p className="text-xs text-gray-600">{post.excerpt || post.description || ''}</p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm py-8">
          {isSelected ? 'Configure Data Source in Properties panel' : 'Blog Grid - No posts found'}
        </div>
      )}
    </div>
  )
}

// Blog Post Element
export const BlogPostElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Blog Post
      </div>
    </div>
  )
}

// Blog Card Element - Phase 3: Data Binding Support
export const BlogCardElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { cmsData } = useBuilderStore()
  const currentItem = (element.props as any)?.currentItem
  
  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {element.dataBindings && currentItem ? (
        <div className="border rounded-lg p-3 bg-white">
          {element.dataBindings.image && (
            <img
              src={resolveDataBinding(element.dataBindings.image, { blog: currentItem, ...cmsData })}
              alt={currentItem.title || 'Blog Post'}
              className="w-full h-32 object-cover rounded mb-2"
            />
          )}
          {element.dataBindings.title && (
            <h3 className="font-semibold text-sm mb-1">
              {resolveDataBinding(element.dataBindings.title, { blog: currentItem, ...cmsData })}
            </h3>
          )}
          {element.dataBindings.excerpt && (
            <p className="text-xs text-gray-600 mt-1">
              {resolveDataBinding(element.dataBindings.excerpt, { blog: currentItem, ...cmsData })}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm">
          Blog Card {isSelected && '- Configure bindings'}
        </div>
      )}
    </div>
  )
}

// Portfolio Grid Element
export const PortfolioGridElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Portfolio Grid - Drop portfolio items here
      </div>
    </div>
  )
}

// Portfolio Item Element
export const PortfolioItemElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Portfolio Item
      </div>
    </div>
  )
}

// Map Element
export const MapElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Map
      </div>
    </div>
  )
}

// Embed Element
export const EmbedElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Embed
      </div>
    </div>
  )
}

// Code Element
export const CodeElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'p-4 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Code
      </div>
    </div>
  )
}

// Spacer Element
export const SpacerElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const height = element.props.height || 20

  return (
    <div
      className={cn(
        'border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      style={{ height }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-xs">
        Spacer
      </div>
    </div>
  )
}

// Divider Element
export const DividerElement: React.FC<BaseElementProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'p-2 border border-dashed border-muted-foreground/25 rounded-lg',
        isSelected && 'border-primary bg-primary/5',
        isHovered && !isSelected && 'border-muted-foreground/50',
        'cursor-pointer'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center text-muted-foreground text-sm">
        Divider
      </div>
    </div>
  )
}
