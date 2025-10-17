import React from 'react'
import { cn } from '@/utils'

interface QuickActionsProps {
  className?: string
}

const QuickActions: React.FC<QuickActionsProps> = ({ className }) => {
  const actions = [
    {
      name: 'Create Website',
      description: 'Start building a new website',
      icon: '🌐',
      color: 'bg-blue-500'
    },
    {
      name: 'Add Product',
      description: 'Add a new product to your store',
      icon: '📦',
      color: 'bg-green-500'
    },
    {
      name: 'Create Service',
      description: 'Add a new service offering',
      icon: '🔧',
      color: 'bg-purple-500'
    },
    {
      name: 'View Analytics',
      description: 'Check your website performance',
      icon: '📊',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{action.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuickActions
