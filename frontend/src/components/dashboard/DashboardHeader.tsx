import React, { useState } from 'react'
import { cn } from '@/utils'
import { User, Bell, Settings, LogOut, Plus, Globe } from 'lucide-react'
import { User as UserType, Website } from '@/types'

// Components
import { Button } from '@/components/ui'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui'
import CreateWebsiteModal from './CreateWebsiteModal'
import { logger } from '@/utils/logger'
import { useAuthStore } from '@/store'

// Types
interface DashboardHeaderProps {
  user: UserType | null
  currentView: string
  selectedWebsite: Website | null
  onWebsiteChange: (website: Website | null) => void
  onToggleSidebar: () => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  currentView,
  selectedWebsite,
  onWebsiteChange,
  onToggleSidebar,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { logout } = useAuthStore()

  const handleLogout = () => {
    logger.debug('User logout initiated')
    logout()
  }

  const handleCreateWebsite = () => {
    setIsCreateModalOpen(true)
  }

  const handleWebsiteCreated = (website: Website) => {
    logger.info('Website created', { websiteId: website.id, websiteName: website.name })
    // You could redirect to the builder here
  }

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          <Settings className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground capitalize">
            {currentView.replace('-', ' ')}
          </h2>
          
          {selectedWebsite && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">
                {selectedWebsite.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center Section - Website Selector */}
      {currentView !== 'overview' && currentView !== 'settings' && (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedWebsite?.id || ''}
            onChange={(e) => {
              // Handle website selection
              logger.debug('Website selected', { websiteId: e.target.value })
            }}
            className="bg-transparent border-none text-sm font-medium text-foreground focus:outline-none"
          >
            <option value="">Select Website</option>
            {/* Website options would be populated here */}
          </select>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Create Website Button */}
        <Button
          onClick={handleCreateWebsite}
          size="sm"
          className="hidden sm:flex"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Website
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="hidden sm:block text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
            </Button>
          }
        >
          <DropdownMenuItem>
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenu>
      </div>

      {/* Create Website Modal */}
      <CreateWebsiteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleWebsiteCreated}
      />
    </header>
  )
}

export default DashboardHeader
