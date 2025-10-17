import React from 'react'
import { cn } from '@/utils'

interface TemplatesLibraryProps {
  className?: string
}

const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({ className }) => {
  const templates = [
    {
      id: 1,
      name: 'Business Template',
      category: 'Business',
      preview: '🏢',
      description: 'Perfect for business websites'
    },
    {
      id: 2,
      name: 'Portfolio Template',
      category: 'Portfolio',
      preview: '🎨',
      description: 'Great for showcasing work'
    },
    {
      id: 3,
      name: 'E-commerce Template',
      category: 'E-commerce',
      preview: '🛒',
      description: 'Built for online stores'
    }
  ]

  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Templates</h3>
          <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Upload Template
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-4xl mb-2">{template.preview}</div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{template.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {template.category}
                </span>
              </div>
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 px-3 py-1 text-xs text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50">
                  Preview
                </button>
                <button className="flex-1 px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Use
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TemplatesLibrary
