import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/utils'
import { API_CONFIG } from '@/config/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'
import { Website } from '@/types'
import { 
  Upload, 
  Image, 
  Video, 
  File, 
  Trash2, 
  Download, 
  Eye, 
  MoreVertical,
  Search,
  Filter,
  Grid,
  List,
  FolderPlus,
  Cloud
} from 'lucide-react'

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Badge } from '@/components/ui'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui'
import { logger } from '@/utils/logger'

interface MediaLibraryProps {
  website: Website | null
  className?: string
}

interface MediaItem {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'audio'
  size: number
  url: string
  thumbnailUrl?: string
  uploadedAt: Date
  websiteId: string
  mimeType: string
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ website, className }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { token } = useAuthStore()

  useEffect(() => {
    if (website) {
      fetchMediaItems()
    }
  }, [website])

  const fetchMediaItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/websites/${website?.id}/media`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch media items')
      }

      const data = await response.json()
      setMediaItems(data.data || [])
    } catch (error) {
      logger.error('Error fetching media items', error, { websiteId: website?.id })
      toast.error('Failed to fetch media items')
      setMediaItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/websites/${website?.id}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload files')
      }

      const data = await response.json()
      setMediaItems(prev => [...prev, ...data.data])
      toast.success(`${files.length} file(s) uploaded successfully!`)
    } catch (error) {
      logger.error('Error uploading files', error, { websiteId: website?.id, fileCount: files?.length })
      toast.error('Failed to upload files')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFileUpload(files)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (confirm('Are you sure you want to delete this media item?')) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/media/${mediaId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete media item')
        }

        setMediaItems(prev => prev.filter(item => item.id !== mediaId))
        toast.success('Media item deleted successfully!')
      } catch (error) {
        logger.error('Error deleting media item', error, { mediaId: item.id })
        toast.error('Failed to delete media item')
      }
    }
  }

  const handleDownloadMedia = async (mediaItem: MediaItem) => {
    try {
      const response = await fetch(mediaItem.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = mediaItem.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      logger.error('Error downloading media', error, { mediaId: item.id })
      toast.error('Failed to download media')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-6 h-6 text-blue-600" />
      case 'video': return <Video className="w-6 h-6 text-red-600" />
      case 'audio': return <File className="w-6 h-6 text-green-600" />
      default: return <File className="w-6 h-6 text-gray-600" />
    }
  }

  const filteredMediaItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || item.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
          <p className="text-gray-600">Manage your media files and assets</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid className="w-4 h-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{mediaItems.length}</p>
              </div>
              <Cloud className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Images</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediaItems.filter(m => m.type === 'image').length}
                </p>
              </div>
              <Image className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Videos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediaItems.filter(m => m.type === 'video').length}
                </p>
              </div>
              <Video className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(mediaItems.reduce((sum, item) => sum + item.size, 0))}
                </p>
              </div>
              <File className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search media files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
          </select>
        </div>
      </div>

      {/* Media Items */}
      <Card>
        <CardHeader>
          <CardTitle>Media Files ({filteredMediaItems.length})</CardTitle>
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
                    <div className="w-full h-32 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded"></div>
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
          ) : filteredMediaItems.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            )}>
              {filteredMediaItems.map((item) => (
                viewMode === 'grid' ? (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                    <div className="relative mb-3">
                      {item.type === 'image' && item.thumbnailUrl ? (
                        <img 
                          src={item.thumbnailUrl} 
                          alt={item.name}
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          {getFileIcon(item.type)}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="sm" className="bg-white/80 backdrop-blur-sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                        >
                          <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadMedia(item)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteMedia(item.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(item.size)} • {new Date(item.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(item.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(item.size)} • {new Date(item.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadMedia(item)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadMedia(item)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMedia(item.id)}
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
              <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
              <p className="text-gray-500 mb-4">Upload your first media file to get started</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MediaLibrary
