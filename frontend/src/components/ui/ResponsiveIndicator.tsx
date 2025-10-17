import React from 'react'
import { cn } from '@/utils'

interface ResponsiveIndicatorProps {
  className?: string
  mode?: 'desktop' | 'tablet' | 'mobile'
}

const ResponsiveIndicator: React.FC<ResponsiveIndicatorProps> = ({ className, mode = 'desktop' }) => {
  return (
    <div className={cn('flex items-center space-x-2 text-sm text-gray-600', className)}>
      <div className={cn('flex items-center space-x-1', mode === 'desktop' && 'text-green-600')}>
        <div className={cn('w-2 h-2 rounded-full', mode === 'desktop' ? 'bg-green-500' : 'bg-gray-300')}></div>
        <span>Desktop</span>
      </div>
      <div className={cn('flex items-center space-x-1', mode === 'tablet' && 'text-yellow-600')}>
        <div className={cn('w-2 h-2 rounded-full', mode === 'tablet' ? 'bg-yellow-500' : 'bg-gray-300')}></div>
        <span>Tablet</span>
      </div>
      <div className={cn('flex items-center space-x-1', mode === 'mobile' && 'text-blue-600')}>
        <div className={cn('w-2 h-2 rounded-full', mode === 'mobile' ? 'bg-blue-500' : 'bg-gray-300')}></div>
        <span>Mobile</span>
      </div>
    </div>
  )
}

export default ResponsiveIndicator
