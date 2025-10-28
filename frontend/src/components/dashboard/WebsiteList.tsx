import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils'
import { API_CONFIG } from '@/config/api'
import toast from 'react-hot-toast'
import { useAuthStore, useWebsiteStore } from '@/store'
import { Website, WebsiteStatus } from '@/types'
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Search,
  Filter,
  Grid,
  List,
  Globe,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Copy,
  ExternalLink,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Badge } from '@/components/ui'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui'

interface WebsiteListProps {
  websites: Website[]
  onWebsiteSelect: (website: Website) => void
  onCreateNew: () => void
  className?: string
}

const WebsiteList: React.FC<WebsiteListProps> = ({ 
  websites, 
  onWebsiteSelect, 
  onCreateNew, 
  className 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([])
  const { token } = useAuthStore()
  const { publishWebsite, unpublishWebsite, deleteWebsite: storeDeleteWebsite, fetchWebsites } = useWebsiteStore()
  const navigate = useNavigate()

  // Removed handleWebsiteAction - using individual handlers now

  const handleViewWebsite = (website: Website) => {
    if (website.status === WebsiteStatus.PUBLISHED && website.subdomain) {
      window.open(`https://${website.subdomain}.ain90.online`, '_blank')
    } else if (website.subdomain) {
      window.open(`https://${website.subdomain}.ain90.online`, '_blank')
    } else {
      toast.error('Website URL not available')
    }
  }

  const handleEditWebsite = (website: Website) => {
    onWebsiteSelect(website)
    window.location.href = `/builder/${website.id}`
  }

  const handleDuplicateWebsite = async (website: Website) => {
    toast.info('Duplicate feature coming soon')
  }

  const handleDeleteWebsite = async (website: Website) => {
    if (window.confirm(`Are you sure you want to delete "${website.name}"? This action cannot be undone.`)) {
      try {
        await storeDeleteWebsite(website.id)
        toast.success('Website deleted successfully')
        fetchWebsites() // Refresh list
      } catch (error) {
        toast.error('Failed to delete website')
      }
    }
  }

  const handlePublishWebsite = async (website: Website) => {
    try {
      if (website.status === WebsiteStatus.PUBLISHED) {
        await unpublishWebsite(website.id)
        toast.success('Website unpublished successfully')
      } else {
        await publishWebsite(website.id)
        toast.success('Website published successfully')
      }
      fetchWebsites() // Refresh list
    } catch (error) {
      toast.error(`Failed to ${website.status === WebsiteStatus.PUBLISHED ? 'unpublish' : 'publish'} website`)
    }
  }

  const getStatusBadge = (status: WebsiteStatus) => {
    switch (status) {
      case WebsiteStatus.PUBLISHED:
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case WebsiteStatus.DRAFT:
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      case WebsiteStatus.ARCHIVED:
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredWebsites = websites.filter(website => {
    const matchesSearch = website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         website.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (website.domain && website.domain.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || website.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: WebsiteStatus.PUBLISHED, label: 'Published' },
    { value: WebsiteStatus.DRAFT, label: 'Draft' },
    { value: WebsiteStatus.ARCHIVED, label: 'Archived' }
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Websites</h2>
          <p className="text-gray-600">Manage and organize your website projects</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid className="w-4 h-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Website
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Websites</p>
                <p className="text-2xl font-bold text-gray-900">{websites.length}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {websites.filter(w => w.status === WebsiteStatus.PUBLISHED).length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {websites.filter(w => w.status === WebsiteStatus.DRAFT).length}
                </p>
              </div>
              <Pause className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-900">
                  {websites.filter(w => w.status === WebsiteStatus.ARCHIVED).length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search websites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Websites Grid/List */}
      <Card>
        <CardHeader>
          <CardTitle>Websites ({filteredWebsites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {false ? (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            )}>
              {[1, 2, 3].map((i) => (
                viewMode === 'grid' ? (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="w-full h-32 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ) : (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  </div>
                )
              ))}
            </div>
          ) : filteredWebsites.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            )}>
              {filteredWebsites.map((website) => (
                viewMode === 'grid' ? (
                  <div key={website.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                    <div className="relative mb-3">
                      <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded flex items-center justify-center">
                        <Globe className="w-12 h-12 text-blue-600" />
                      </div>
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(website.status)}
                      </div>
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="sm" className="bg-white/80 backdrop-blur-sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                        >
                          <DropdownMenuItem onClick={() => handleViewWebsite(website)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Website
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditWebsite(website)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateWebsite(website)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePublishWebsite(website)}>
                            {website.status === WebsiteStatus.PUBLISHED ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Publish
                              </>
                            )}
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
                    </div>
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{website.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {website.domain ? website.domain : `${website.subdomain}.ain90.online`}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Updated {formatDate(website.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewWebsite(website)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditWebsite(website)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div key={website.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{website.name}</h4>
                          {getStatusBadge(website.status)}
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          {website.domain ? website.domain : `${website.subdomain}.ain90.online`}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(website.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewWebsite(website)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditWebsite(website)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem onClick={() => handleViewWebsite(website)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Website
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditWebsite(website)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateWebsite(website)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePublishWebsite(website)}>
                          {website.status === WebsiteStatus.PUBLISHED ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Publish
                            </>
                          )}
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
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No websites found</h3>
              <p className="text-gray-500 mb-4">Create your first website to get started</p>
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Website
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default WebsiteList