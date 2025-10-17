import React from 'react'
import { cn } from '@/utils'
import { 
  Home, 
  Globe, 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Calendar, 
  Users, 
  FileText, 
  Image, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// Types
interface DashboardSidebarProps {
  isOpen: boolean
  currentView: string
  onViewChange: (view: string) => void
  onToggle: () => void
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isOpen,
  currentView,
  onViewChange,
  onToggle,
}) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      path: '/dashboard',
    },
    {
      id: 'websites',
      label: 'Websites',
      icon: Globe,
      path: '/dashboard/websites',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/dashboard/analytics',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      path: '/dashboard/products',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      path: '/dashboard/orders',
    },
    {
      id: 'services',
      label: 'Services',
      icon: Calendar,
      path: '/dashboard/services',
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      path: '/dashboard/bookings',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      path: '/dashboard/customers',
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: FileText,
      path: '/dashboard/templates',
    },
    {
      id: 'media',
      label: 'Media',
      icon: Image,
      path: '/dashboard/media',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
    },
  ]

  return (
    <div className={cn(
      'sidebar transition-all duration-300',
      isOpen ? 'w-64' : 'w-16'
    )}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="flex items-center justify-between">
          {isOpen && (
            <h1 className="text-xl font-bold text-foreground">
              BuildFlow
            </h1>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-content">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'nav-item w-full',
                  isActive && 'active',
                  !isOpen && 'justify-center'
                )}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5" />
                {isOpen && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {isOpen && (
          <div className="text-xs text-muted-foreground text-center">
            BuildFlow v1.0.0
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardSidebar
