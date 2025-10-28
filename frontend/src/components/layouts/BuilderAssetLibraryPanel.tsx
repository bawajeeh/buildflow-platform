import React, { useState } from 'react'
import { cn } from '@/utils'

interface Asset {
  id: string
  name: string
  type: 'image' | 'video' | 'icon' | 'vector'
  url: string
  thumbnail: string
  size: string
  dimensions?: string
}

interface BuilderAssetLibraryPanelProps {
  onAssetSelect: (asset: Asset) => void
  className?: string
}

const mockAssets: Asset[] = [
  { id: '1', name: 'Hero Image', type: 'image', url: '#', thumbnail: '🖼️', size: '2.5 MB', dimensions: '1920x1080' },
  { id: '2', name: 'Logo', type: 'vector', url: '#', thumbnail: '🎨', size: '125 KB', dimensions: '512x512' },
  { id: '3', name: 'Background Video', type: 'video', url: '#', thumbnail: '🎥', size: '15 MB', dimensions: '1920x1080' },
  { id: '4', name: 'Icon Set', type: 'icon', url: '#', thumbnail: '🔧', size: '45 KB', dimensions: '256x256' },
  { id: '5', name: 'Product Photo', type: 'image', url: '#', thumbnail: '📸', size: '1.8 MB', dimensions: '1024x768' },
  { id: '6', name: 'Banner', type: 'image', url: '#', thumbnail: '🖼️', size: '3.2 MB', dimensions: '1920x600' },
]

const categories = ['All', 'Images', 'Videos', 'Icons', 'Vectors']

const BuilderAssetLibraryPanel: React.FC<BuilderAssetLibraryPanelProps> = ({
  onAssetSelect,
  className,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const filteredAssets = selectedCategory === 'All'
    ? mockAssets
    : mockAssets.filter(asset => asset.type === selectedCategory.toLowerCase())

  const handleUpload = async () => {
    setIsUploading(true)
    setUploadProgress(0)
    // Simulate upload
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadProgress(i)
    }
    setIsUploading(false)
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      image: '🖼️',
      video: '🎥',
      icon: '🔧',
      vector: '🎨',
    }
    return icons[type] || '📄'
  }

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            📚 Asset Library
          </h3>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
          >
            {isUploading ? '⏳ Uploading...' : '📤 Upload'}
          </button>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all',
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="group p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onAssetSelect(asset)}
          >
            <div className="flex items-center space-x-3">
              <div className="text-3xl flex-shrink-0">{asset.thumbnail}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {asset.name}
                  </h4>
                  <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Use
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{asset.size}</span>
                  {asset.dimensions && <span>• {asset.dimensions}</span>}
                  <span>• {asset.type}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BuilderAssetLibraryPanel

