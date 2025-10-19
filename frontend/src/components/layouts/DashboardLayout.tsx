import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useWebsiteStore } from '@/store'
import { useBuilderStore } from '@/store'

// Components
import DashboardSidebar from '../dashboard/DashboardSidebar'
import DashboardHeader from '../dashboard/DashboardHeader'
import DashboardStats from '../dashboard/DashboardStats'
import RecentActivity from '../dashboard/RecentActivity'
import QuickActions from '../dashboard/QuickActions'
import WebsiteList from '../dashboard/WebsiteList'
import WebsiteSettings from '../dashboard/WebsiteSettings'
import AnalyticsDashboard from '../dashboard/AnalyticsDashboard'
import ProductsManagement from '../dashboard/ProductsManagement'
import OrdersManagement from '../dashboard/OrdersManagement'
import ServicesManagement from '../dashboard/ServicesManagement'
import BookingsManagement from '../dashboard/BookingsManagement'
import CustomersManagement from '../dashboard/CustomersManagement'
import UserSettings from '../dashboard/UserSettings'
import DebugInfo from '../DebugInfo'

// Types
import { Website, Page, Element } from '@/types'

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentView, setCurrentView] = useState('overview')
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null)

  const { user } = useAuthStore()
  const { websites, fetchWebsites, setCurrentWebsite } = useWebsiteStore()
  const { pages, fetchPages } = useBuilderStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchWebsites()
    }
  }, [user, fetchWebsites])

  const handleWebsiteSelect = async (website: Website) => {
    setSelectedWebsite(website)
    await fetchPages(website.id)
  }

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DebugInfo />
            <DashboardStats websites={websites} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity />
              <QuickActions onAction={(action) => {
                if (action === 'create-website') {
                  setCurrentView('websites')
                }
              }} />
            </div>
          </div>
        )
      
      case 'websites':
        return (
          <WebsiteList
            websites={websites}
            onWebsiteSelect={handleWebsiteSelect}
            onEditWebsite={(website) => {
              setCurrentWebsite(website)
              navigate(`/builder/${website.id}`)
            }}
          />
        )
      
      case 'website-settings':
        return selectedWebsite ? (
          <WebsiteSettings
            website={selectedWebsite}
            onBack={() => setCurrentView('websites')}
          />
        ) : null
      
      case 'analytics':
        return <AnalyticsDashboard website={selectedWebsite} />
      
      case 'products':
        return <ProductsManagement website={selectedWebsite} />
      
      case 'orders':
        return <OrdersManagement website={selectedWebsite} />
      
      case 'services':
        return <ServicesManagement website={selectedWebsite} />
      
      case 'bookings':
        return <BookingsManagement website={selectedWebsite} />
      
      case 'customers':
        return <CustomersManagement website={selectedWebsite} />
      
      case 'templates':
        return <TemplatesLibrary />
      
      case 'media':
        return <MediaLibrary />
      
      case 'settings':
        return <UserSettings />
      
      default:
        return children
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar
          isOpen={sidebarOpen}
          currentView={currentView}
          onViewChange={setCurrentView}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <DashboardHeader
            user={user}
            currentView={currentView}
            selectedWebsite={selectedWebsite}
            onWebsiteChange={setSelectedWebsite}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Content */}
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
