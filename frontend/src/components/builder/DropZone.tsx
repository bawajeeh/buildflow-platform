import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/utils'

interface DropZoneProps {
  id: string
  className?: string
  children?: React.ReactNode
  parentId?: string
  accepts?: string[]
}

const DropZone: React.FC<DropZoneProps> = ({ id, className, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors',
        isOver && 'border-blue-500 bg-blue-50',
        className
      )}
    >
      {children || (
        <div className="text-center text-gray-500">
          <p className="text-sm">Drop elements here</p>
        </div>
      )}
    </div>
  )
}

export default DropZone
