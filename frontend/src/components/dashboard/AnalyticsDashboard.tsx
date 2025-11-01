import React, { useState, useEffect } from 'react'
import { cn } from '@/utils'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointer,
  Globe,
  Smartphone,
  Tablet,
  Calendar,
  DollarSign,
  ShoppingCart,
  Clock,
  Filter,
  Download
} from 'lucide-react'

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'

// Types
import { Analytics, Website } from '@/types'
import { useAuthStore } from '@/store'
import { API_CONFIG } from '@/config/api'
import { logger } from '@/utils/logger'

interface AnalyticsDashboardProps {
  website: Website | null
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ website }) => {
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (website) {
      fetchAnalytics()
    }
  }, [website, timeRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/analytics?websiteId=${website?.id}&timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data.data || [])
    } catch (error) {
      logger.error('Error fetching analytics', error, { websiteId: website?.id, timeRange })
      // Fallback to empty array if API fails
      setAnalytics([])
    } finally {
      setIsLoading(false)
    }
  }

  const currentData = analytics[0] || {
    visitors: 0,
    pageViews: 0,
    sessions: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    conversions: 0,
    revenue: 0,
    topPages: [],
    trafficSources: [],
    deviceTypes: [],
    locations: [],
  }

  const stats = [
    {
      title: 'Total Visitors',
      value: currentData.visitors.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Page Views',
      value: currentData.pageViews.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Sessions',
      value: currentData.sessions.toLocaleString(),
      change: '+15.3%',
      trend: 'up',
      icon: MousePointer,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Bounce Rate',
      value: `${currentData.bounceRate.toFixed(1)}%`,
      change: '-2.1%',
      trend: 'down',
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Avg. Session Duration',
      value: `${Math.floor(currentData.avgSessionDuration / 60)}m ${currentData.avgSessionDuration % 60}s`,
      change: '+5.7%',
      trend: 'up',
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Conversions',
      value: currentData.conversions.toString(),
      change: '+22.1%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      title: 'Revenue',
      value: `$${currentData.revenue.toFixed(2)}`,
      change: '+18.9%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent border border-input rounded-md px-3 py-2 text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
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
                    <div className="flex items-center gap-1 mt-1">
                      <TrendIcon className={cn(
                        'w-3 h-3',
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      )} />
                      <span className={cn(
                        'text-xs font-medium',
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {stat.change}
                      </span>
                    </div>
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{source.source}</p>
                      <p className="text-sm text-muted-foreground">{source.medium}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{source.visitors}</p>
                    <p className="text-sm text-muted-foreground">{source.conversions} conversions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Types */}
        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.deviceTypes.map((device, index) => {
                const Icon = device.deviceType === 'desktop' ? Globe : 
                           device.deviceType === 'mobile' ? Smartphone : Tablet
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">{device.deviceType}</p>
                        <p className="text-sm text-muted-foreground">{device.sessions} sessions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{device.visitors}</p>
                      <p className="text-sm text-muted-foreground">{device.conversions} conversions</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentData.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{page.pageName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {page.uniqueViews} unique views • {page.avgTimeOnPage}s avg. time
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{page.views} views</p>
                  <p className="text-sm text-muted-foreground">{page.bounceRate}% bounce rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Data */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentData.locations.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{location.city}, {location.country}</h3>
                    <p className="text-sm text-muted-foreground">{location.sessions} sessions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{location.visitors} visitors</p>
                  <p className="text-sm text-muted-foreground">{location.conversions} conversions</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-medium text-foreground">User from New York</h3>
                  <p className="text-sm text-muted-foreground">Viewing Products page</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">2 min ago</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-medium text-foreground">User from London</h3>
                  <p className="text-sm text-muted-foreground">Viewing Home page</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">5 min ago</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-medium text-foreground">User from Toronto</h3>
                  <p className="text-sm text-muted-foreground">Completed purchase</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">8 min ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsDashboard
