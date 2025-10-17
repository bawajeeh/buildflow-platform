import React from 'react'
import { cn } from '@/utils'

interface EmptyStateProps {
  className?: string
  title?: string
  description?: string
  action?: React.ReactNode
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  className,
  title = "Start Building",
  description = "Drag elements from the sidebar to start building your website",
  action
}) => {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
