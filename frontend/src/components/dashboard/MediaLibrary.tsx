import React from 'react'
import { cn } from '@/utils'

interface MediaLibraryProps {
  className?: string
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ className }) => {
  const mediaItems = [
    {
      id: 1,
      name: 'hero-image.jpg',
      type: 'image',
      size: '2.3 MB',
      uploaded: '2 days ago'
    },
    {
      id: 2,
      name: 'logo.png',
      type: 'image',
      size: '156 KB',
      uploaded: '1 week ago'
    },
    {
      id: 3,
      name: 'product-video.mp4',
      type: 'video',
      size: '15.2 MB',
      uploaded: '3 days ago'
    }
  ]

  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Media Library</h3>
          <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Upload Media
          </button>
        </div>
        
        <div className="space-y-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.type === 'image' ? '🖼️' : '🎥'}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.size} • {item.uploaded}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MediaLibrary
