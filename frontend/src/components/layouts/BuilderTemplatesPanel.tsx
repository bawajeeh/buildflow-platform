import React from 'react'
import { cn } from '@/utils'

interface Template {
  id: string
  name: string
  category: string
  thumbnail: string
  description: string
}

interface BuilderTemplatesPanelProps {
  onApplyTemplate: (template: Template) => void
  className?: string
}

const templates: Template[] = [
  {
    id: 'hero-section',
    name: 'Hero Section',
    category: 'Layout',
    thumbnail: '🎯',
    description: 'Eye-catching hero with CTA',
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    category: 'Content',
    thumbnail: '⭐',
    description: 'Customer testimonials section',
  },
  {
    id: 'pricing',
    name: 'Pricing Table',
    category: 'eCommerce',
    thumbnail: '💰',
    description: 'Professional pricing cards',
  },
  {
    id: 'features',
    name: 'Features Grid',
    category: 'Layout',
    thumbnail: '🚀',
    description: 'Feature showcase with icons',
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    category: 'Form',
    thumbnail: '📧',
    description: 'Contact form with validation',
  },
  {
    id: 'footer',
    name: 'Footer',
    category: 'Layout',
    thumbnail: '📄',
    description: 'Complete footer with links',
  },
]

const categories = ['All', 'Layout', 'Content', 'eCommerce', 'Form']

const BuilderTemplatesPanel: React.FC<BuilderTemplatesPanelProps> = ({
  onApplyTemplate,
  className,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState('All')

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          📚 Templates Library
        </h3>
        
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all',
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="group p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => onApplyTemplate(template)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-4xl flex-shrink-0">{template.thumbnail}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {template.name}
                  </h4>
                  <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Apply
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {template.category}
                  </span>
                  <span className="text-xs text-gray-400">⚡ Quick Apply</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BuilderTemplatesPanel

