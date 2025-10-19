import React, { useState, useEffect } from 'react'
import { cn } from '@/utils'
import { Globe, Eye, Edit, Trash2, MoreVertical, Calendar, Users, TrendingUp } from 'lucide-react'
import { Website } from '@/types'
import { useAuthStore } from '@/store'
import { API_CONFIG } from '@/config/api'

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui'
import CreateWebsiteModal from './CreateWebsiteModal'

// Types
interface DashboardStatsProps {
  websites?: Website[]
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ websites = [] }) => {
  const [monthlyStats, setMonthlyStats] = useState({
    websitesCreated: 0,
    totalVisitors: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuthStore()

  useEffect(() => {
    fetchMonthlyStats()
  }, [])

  const fetchMonthlyStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/analytics/monthly-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch monthly stats')
      }

      const data = await response.json()
      setMonthlyStats(data.data || {
        websitesCreated: 0,
        totalVisitors: 0,
        totalOrders: 0,
        totalRevenue: 0
      })
    } catch (error) {
      console.error('Error fetching monthly stats:', error)
      // Calculate from websites if API fails
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const websitesThisMonth = websites.filter(w => {
        const createdDate = new Date(w.createdAt)
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
      }).length
      
      setMonthlyStats({
        websitesCreated: websitesThisMonth,
        totalVisitors: 0,
        totalOrders: 0,
        totalRevenue: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalWebsites = websites.length
  const publishedWebsites = websites.filter(w => w.status === 'PUBLISHED').length
  const draftWebsites = websites.filter(w => w.status === 'DRAFT').length

  const stats = [
    {
      title: 'Total Websites',
      value: totalWebsites,
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Published',
      value: publishedWebsites,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Drafts',
      value: draftWebsites,
      icon: Edit,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'This Month',
      value: isLoading ? '...' : monthlyStats.websitesCreated,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  stat.bgColor
                )}>
                  <Icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

interface WebsiteListProps {
  websites?: Website[]
  onWebsiteSelect: (website: Website) => void
  onEditWebsite: (website: Website) => void
}

const WebsiteList: React.FC<WebsiteListProps> = ({
  websites = [],
  onWebsiteSelect,
  onEditWebsite,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleDeleteWebsite = async (website: Website) => {
    if (confirm(`Are you sure you want to delete "${website.name}"?`)) {
      try {
        const { token } = useAuthStore.getState()
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/websites/${website.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete website')
        }

        // Refresh websites list
        window.location.reload()
      } catch (error) {
        console.error('Error deleting website:', error)
        alert('Failed to delete website. Please try again.')
      }
    }
  }

  const handlePublishWebsite = async (website: Website) => {
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/websites/${website.id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to publish website')
      }

      // Refresh websites list
      window.location.reload()
    } catch (error) {
      console.error('Error publishing website:', error)
      alert('Failed to publish website. Please try again.')
    }
  }

  const handleWebsiteCreated = (website: Website) => {
    console.log('Website created:', website)
    setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Your Websites</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Globe className="w-4 h-4 mr-2" />
          Create Website
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map((website) => (
          <Card key={website.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{website.name}</CardTitle>
                <DropdownMenu
                  trigger={
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  }
                >
                  <DropdownMenuItem onClick={() => onWebsiteSelect(website)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditWebsite(website)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePublishWebsite(website)}>
                    <Globe className="w-4 h-4 mr-2" />
                    Publish
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteWebsite(website)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={website.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {website.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {website.subdomain}.buildflow.com
                </span>
              </div>

              <div className="text-sm text-muted-foreground">
                Created {new Date(website.createdAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onWebsiteSelect(website)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onEditWebsite(website)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {websites.length === 0 && (
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No websites yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first website to get started
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Globe className="w-4 h-4 mr-2" />
            Create Website
          </Button>
        </div>
      )}

      {/* Create Website Modal */}
      <CreateWebsiteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleWebsiteCreated}
      />
    </div>
  )
}

export default DashboardStats
export { DashboardStats, WebsiteList }
