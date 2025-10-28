import React from 'react'
import { cn } from '@/utils'

interface Collaborator {
  id: string
  name: string
  avatar: string
  isActive: boolean
  cursor?: { x: number; y: number }
}

interface BuilderCollaborationPanelProps {
  className?: string
}

const mockCollaborators: Collaborator[] = [
  { id: '1', name: 'John Doe', avatar: '👤', isActive: true },
  { id: '2', name: 'Jane Smith', avatar: '👩', isActive: true },
  { id: '3', name: 'Mike Johnson', avatar: '👨', isActive: false },
]

const BuilderCollaborationPanel: React.FC<BuilderCollaborationPanelProps> = ({ className }) => {
  const [collaborators, setCollaborators] = React.useState<Collaborator[]>(mockCollaborators)
  const [isOnline, setIsOnline] = React.useState(true)

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            👥 Collaboration
          </h3>
          <div className="flex items-center space-x-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            )} />
            <span className="text-xs text-gray-600">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {collaborators.length} {collaborators.length === 1 ? 'person' : 'people'} viewing
        </p>
      </div>

      {/* Active Collaborators */}
      <div className="p-4">
        <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Active ({collaborators.filter(c => c.isActive).length})
        </h4>
        <div className="space-y-2">
          {collaborators
            .filter(c => c.isActive)
            .map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200 group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {collaborator.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{collaborator.name}</div>
                    <div className="text-xs text-gray-500">Editing...</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Chat */}
      <div className="border-t border-gray-200 p-4">
        <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          💬 Quick Chat
        </h4>
        <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
          <div className="text-xs text-gray-500 italic text-center">
            No messages yet. Start a conversation!
          </div>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuilderCollaborationPanel

