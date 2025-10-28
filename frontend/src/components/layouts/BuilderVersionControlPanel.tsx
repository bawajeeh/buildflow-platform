import React from 'react'
import { cn } from '@/utils'

interface Version {
  id: string
  name: string
  timestamp: Date
  author: string
  description: string
  isCurrent: boolean
}

interface BuilderVersionControlPanelProps {
  onRestore: (version: Version) => void
  onCreateVersion: () => void
  className?: string
}

const mockVersions: Version[] = [
  {
    id: 'v1',
    name: 'Initial Design',
    timestamp: new Date('2024-01-15'),
    author: 'You',
    description: 'First draft of the page',
    isCurrent: false,
  },
  {
    id: 'v2',
    name: 'Homepage Update',
    timestamp: new Date('2024-01-20'),
    author: 'You',
    description: 'Added hero section and CTA',
    isCurrent: false,
  },
  {
    id: 'v3',
    name: 'Current Version',
    timestamp: new Date('2024-01-25'),
    author: 'You',
    description: 'Latest changes with animations',
    isCurrent: true,
  },
]

const BuilderVersionControlPanel: React.FC<BuilderVersionControlPanelProps> = ({
  onRestore,
  onCreateVersion,
  className,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            📦 Version Control
          </h3>
          <button
            onClick={onCreateVersion}
            className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            + Save Version
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Track and restore previous versions
        </p>
      </div>

      <div className="p-4 space-y-3">
        {mockVersions.map((version) => (
          <div
            key={version.id}
            className={cn(
              'p-4 rounded-lg border-2 transition-all',
              version.isCurrent
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {version.name}
                  </h4>
                  {version.isCurrent && (
                    <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded font-bold">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{version.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>📅 {formatDate(version.timestamp)}</span>
              <span>👤 {version.author}</span>
            </div>
            {!version.isCurrent && (
              <button
                onClick={() => onRestore(version)}
                className="mt-3 w-full px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                🔄 Restore This Version
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Version Stats */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-3">📊 Version History</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Total Versions</span>
            <span className="font-semibold text-gray-900">{mockVersions.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Storage Used</span>
            <span className="font-semibold text-gray-900">2.5 MB</span>
          </div>
          <div className="flex justify-between">
            <span>Last Saved</span>
            <span className="font-semibold text-gray-900">Just now</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuilderVersionControlPanel

