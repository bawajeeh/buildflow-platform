import React from 'react'
import { cn } from '@/utils'

interface Component {
  id: string
  name: string
  category: string
  preview: string
  price: number
  rating: number
  downloads: number
  isPremium: boolean
  author: string
}

interface BuilderMarketplacePanelProps {
  onInstall: (component: Component) => void
  className?: string
}

const marketplaceComponents: Component[] = [
  {
    id: 'navbar-1',
    name: 'Modern Navbar',
    category: 'Navigation',
    preview: '🧭',
    price: 0,
    rating: 4.8,
    downloads: 1250,
    isPremium: false,
    author: 'Design Team',
  },
  {
    id: 'hero-1',
    name: 'Animated Hero',
    category: 'Layout',
    preview: '🎬',
    price: 5,
    rating: 4.9,
    downloads: 3200,
    isPremium: true,
    author: 'Pro Designers',
  },
  {
    id: 'form-1',
    name: 'Contact Form Pro',
    category: 'Form',
    preview: '📧',
    price: 3,
    rating: 4.7,
    downloads: 890,
    isPremium: true,
    author: 'Form Masters',
  },
  {
    id: 'testimonial-1',
    name: 'Testimonial Carousel',
    category: 'Content',
    preview: '💬',
    price: 0,
    rating: 4.6,
    downloads: 2100,
    isPremium: false,
    author: 'Content Team',
  },
]

const categories = ['All', 'Free', 'Premium', 'Navigation', 'Layout', 'Form']

const BuilderMarketplacePanel: React.FC<BuilderMarketplacePanelProps> = ({
  onInstall,
  className,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState('All')

  const filteredComponents = selectedCategory === 'All'
    ? marketplaceComponents
    : selectedCategory === 'Free'
    ? marketplaceComponents.filter(c => c.price === 0)
    : selectedCategory === 'Premium'
    ? marketplaceComponents.filter(c => c.price > 0)
    : marketplaceComponents.filter(c => c.category === selectedCategory)

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⭐' : '')
  }

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          🛒 Component Marketplace
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
        {filteredComponents.map((component) => (
          <div
            key={component.id}
            className="group p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="text-4xl flex-shrink-0">{component.preview}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {component.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{renderStars(component.rating)}</span>
                      <span>{component.rating}</span>
                      <span>•</span>
                      <span>{component.downloads.toLocaleString()} downloads</span>
                    </div>
                  </div>
                  {component.isPremium && (
                    <span className="px-2 py-1 text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded font-bold">
                      PRO
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  by {component.author} • {component.category}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">
                    {component.price === 0 ? 'FREE' : `$${component.price}`}
                  </div>
                  <button
                    onClick={() => onInstall(component)}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Install
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BuilderMarketplacePanel

