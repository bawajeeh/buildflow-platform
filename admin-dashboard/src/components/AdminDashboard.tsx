import React, { useState, useEffect } from 'react'
import { cn } from '../../utils'
import { 
  Users, 
  Globe, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Settings,
  Shield,
  Database,
  Server,
  Activity,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'

// Components
import { Card, CardContent, CardHeader, CardTitle } from './ui'
import { Button } from './ui'
import { Input } from './ui'
import { Badge } from './ui'
import { DropdownMenu, DropdownMenuItem } from './ui'

// Types
import { User, Website, Analytics } from '../../types'

interface AdminDashboardProps {
  // Admin-specific props
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [users, setUsers] = useState<User[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalWebsites: 0,
    totalRevenue: 0,
    activeUsers: 0,
    systemLoad: 0,
    databaseSize: 0,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setIsLoading(true)
    try {
      // Mock data for admin dashboard
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@buildflow.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'SUPER_ADMIN',
          subscription: {
            id: '1',
            userId: '1',
            plan: 'ENTERPRISE',
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
          subscription: {
            id: '2',
            userId: '2',
            plan: 'PRO',
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const mockWebsites: Website[] = [
        {
          id: '1',
          userId: '2',
          name: 'John\'s Portfolio',
          subdomain: 'john-portfolio',
          status: 'PUBLISHED',
          settings: {
            seo: { title: '', description: '', keywords: [] },
            analytics: { googleAnalyticsId: '', facebookPixelId: '', customTrackingCode: '' },
            theme: { primaryColor: '#3b82f6', secondaryColor: '#64748b', fontFamily: 'Inter', borderRadius: 8 },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      setUsers(mockUsers)
      setWebsites(mockWebsites)
      setSystemStats({
        totalUsers: 1250,
        totalWebsites: 3200,
        totalRevenue: 125000,
        activeUsers: 850,
        systemLoad: 45,
        databaseSize: 2.5,
      })
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || user.role === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = [
    {
      title: 'Total Users',
      value: systemStats.totalUsers.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Websites',
      value: systemStats.totalWebsites.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Revenue',
      value: `$${systemStats.totalRevenue.toLocaleString()}`,
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Active Users',
      value: systemStats.activeUsers.toLocaleString(),
      change: '+5.7%',
      trend: 'up',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'System Load',
      value: `${systemStats.systemLoad}%`,
      change: '-2.1%',
      trend: 'down',
      icon: Server,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Database Size',
      value: `${systemStats.databaseSize}GB`,
      change: '+3.2%',
      trend: 'up',
      icon: Database,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ]

  const handleUserAction = (action: string, userId: string) => {
    switch (action) {
      case 'suspend':
        console.log('Suspend user:', userId)
        break
      case 'delete':
        console.log('Delete user:', userId)
        break
      case 'reset-password':
        console.log('Reset password for user:', userId)
        break
      default:
        break
    }
  }

  const handleWebsiteAction = (action: string, websiteId: string) => {
    switch (action) {
      case 'suspend':
        console.log('Suspend website:', websiteId)
        // TODO: Implement suspend website API call
        break
      case 'delete':
        console.log('Delete website:', websiteId)
        // TODO: Implement delete website API call
        break
      case 'view':
        console.log('View website:', websiteId)
        // TODO: Navigate to website view
        break
      default:
        break
    }
  }

  const handleExportData = () => {
    console.log('Exporting admin data...')
    // TODO: Implement data export functionality
    alert('Data export functionality will be implemented')
  }

  const handleSettings = () => {
    console.log('Opening admin settings...')
    // TODO: Navigate to admin settings page
    alert('Admin settings will be implemented')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform management and monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportData()}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" onClick={() => fetchAdminData()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => handleSettings()}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className={cn(
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

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Response Time</span>
                  <Badge variant="default">45ms</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Performance</span>
                  <Badge variant="default">Good</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CDN Status</span>
                  <Badge variant="default">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Service</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Website published</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payment processed</p>
                    <p className="text-xs text-muted-foreground">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Users Management</CardTitle>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Users</option>
                  <option value="USER">Users</option>
                  <option value="ADMIN">Admins</option>
                  <option value="SUPER_ADMIN">Super Admins</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge variant="default">{user.subscription.plan}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      }
                    >
                      <DropdownMenuItem onClick={() => handleUserAction('reset-password', user.id)}>
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('suspend', user.id)}>
                        Suspend User
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleUserAction('delete', user.id)}
                        className="text-destructive"
                      >
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Websites Management */}
        <Card>
          <CardHeader>
            <CardTitle>Websites Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {websites.map((website) => (
                <div
                  key={website.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{website.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {website.subdomain}.buildflow.com
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={website.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                          {website.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created {new Date(website.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      }
                    >
                      <DropdownMenuItem onClick={() => handleWebsiteAction('view', website.id)}>
                        View Website
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleWebsiteAction('suspend', website.id)}>
                        Suspend Website
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleWebsiteAction('delete', website.id)}
                        className="text-destructive"
                      >
                        Delete Website
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">High Memory Usage</p>
                  <p className="text-sm text-yellow-700">Server memory usage is at 85%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Security Update Available</p>
                  <p className="text-sm text-blue-700">Update to version 2.1.3 recommended</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
