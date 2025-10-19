import React, { useState, useEffect } from 'react'
import { cn } from '@/utils'
import { API_CONFIG } from '@/config/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'
import { Website } from '@/types'
import { 
  Upload, 
  Eye, 
  Download, 
  Trash2, 
  MoreVertical,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Palette,
  Star,
  Calendar,
  Tag,
  Copy,
  ExternalLink
} from 'lucide-react'

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Badge } from '@/components/ui'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui'

interface TemplatesLibraryProps {
  website: Website | null
  className?: string
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnailUrl?: string
  previewUrl?: string
  isPublic: boolean
  isPremium: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
  downloadCount: number
  rating: number
  author: string
  version: string
}

const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({ website, className }) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const { token } = useAuthStore()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }

      const data = await response.json()
      setTemplates(data.data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to fetch templates')
      // Fallback to mock data for demo
      setTemplates([
        {
          id: '1',
          name: 'Modern Business',
          description: 'Clean and professional template for business websites',
          category: 'Business',
          thumbnailUrl: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Modern+Business',
          previewUrl: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Preview',
          isPublic: true,
          isPremium: false,
          tags: ['business', 'professional', 'modern'],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          downloadCount: 1250,
          rating: 4.8,
          author: 'BuildFlow Team',
          version: '1.2.0'
        },
        {
          id: '2',
          name: 'Creative Portfolio',
          description: 'Stunning portfolio template for creatives and artists',
          category: 'Portfolio',
          thumbnailUrl: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Creative+Portfolio',
          previewUrl: 'https://via.placeholder.com/800x600/EC4899/FFFFFF?text=Preview',
          isPublic: true,
          isPremium: true,
          tags: ['portfolio', 'creative', 'art'],
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-20'),
          downloadCount: 890,
          rating: 4.9,
          author: 'Design Studio',
          version: '2.1.0'
        },
        {
          id: '3',
          name: 'E-commerce Store',
          description: 'Complete e-commerce solution with shopping cart',
          category: 'E-commerce',
          thumbnailUrl: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=E-commerce+Store',
          previewUrl: 'https://via.placeholder.com/800x600/10B981/FFFFFF?text=Preview',
          isPublic: true,
          isPremium: false,
          tags: ['ecommerce', 'store', 'shopping'],
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-25'),
          downloadCount: 2100,
          rating: 4.7,
          author: 'Commerce Pro',
          version: '1.5.0'
        },
        {
          id: '4',
          name: 'Restaurant Menu',
          description: 'Beautiful template for restaurants and cafes',
          category: 'Restaurant',
          thumbnailUrl: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Restaurant+Menu',
          previewUrl: 'https://via.placeholder.com/800x600/F59E0B/FFFFFF?text=Preview',
          isPublic: true,
          isPremium: true,
          tags: ['restaurant', 'food', 'menu'],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-30'),
          downloadCount: 650,
          rating: 4.6,
          author: 'Food Design',
          version: '1.0.0'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseTemplate = async (templateId: string) => {
    if (!website) {
      toast.error('Please select a website first')
      return
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/templates/${templateId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ websiteId: website.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to apply template')
      }

      toast.success('Template applied successfully!')
      // TODO: Refresh website data or redirect to builder
    } catch (error) {
      console.error('Error applying template:', error)
      toast.error('Failed to apply template')
    }
  }

  const handlePreviewTemplate = (template: Template) => {
    if (template.previewUrl) {
      window.open(template.previewUrl, '_blank')
    } else {
      toast.error('Preview not available for this template')
    }
  }

  const handleDownloadTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/templates/${templateId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to download template')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template-${templateId}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Template downloaded successfully!')
    } catch (error) {
      console.error('Error downloading template:', error)
      toast.error('Failed to download template')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/templates/${templateId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete template')
        }

        setTemplates(prev => prev.filter(t => t.id !== templateId))
        toast.success('Template deleted successfully!')
      } catch (error) {
        console.error('Error deleting template:', error)
        toast.error('Failed to delete template')
      }
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...new Set(templates.map(t => t.category))]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
          <p className="text-gray-600">Choose from our collection of professional templates</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid className="w-4 h-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Template
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
              <Palette className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Free Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => !t.isPremium).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Premium Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => t.isPremium).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.reduce((sum, t) => sum + t.downloadCount, 0).toLocaleString()}
                </p>
              </div>
              <Download className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid/List */}
      <Card>
        <CardHeader>
          <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            )}>
              {[1, 2, 3, 4].map((i) => (
                viewMode === 'grid' ? (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ) : (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
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
          ) : filteredTemplates.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            )}>
              {filteredTemplates.map((template) => (
                viewMode === 'grid' ? (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                    <div className="relative mb-3">
                      {template.thumbnailUrl ? (
                        <img 
                          src={template.thumbnailUrl} 
                          alt={template.name}
                          className="w-full h-48 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
                          <Palette className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {template.isPremium && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Premium
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {template.category}
                        </Badge>
                      </div>
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="sm" className="bg-white/80 backdrop-blur-sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                        >
                          <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadTemplate(template.id)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{template.name}</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{template.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "w-3 h-3",
                                i < Math.floor(template.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              )} 
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">{template.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{template.downloadCount} downloads</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleUseTemplate(template.id)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div key={template.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {template.thumbnailUrl ? (
                          <img 
                            src={template.thumbnailUrl} 
                            alt={template.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Palette className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{template.name}</h4>
                          {template.isPremium && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{template.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            {template.rating}
                          </div>
                          <span>•</span>
                          <span>{template.downloadCount} downloads</span>
                          <span>•</span>
                          <span>{template.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadTemplate(template.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleUseTemplate(template.id)}
                      >
                        Use
                      </Button>
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadTemplate(template.id)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTemplate(template.id)}
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
              <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Template</h3>
            <p className="text-sm text-gray-500 mb-4">
              Template upload functionality will be implemented in the next version.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplatesLibrary