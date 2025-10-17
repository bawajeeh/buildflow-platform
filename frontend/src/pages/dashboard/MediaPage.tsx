import React from 'react'

const MediaPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Media</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your images, videos, and other media files
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500">No media files yet. Upload images and videos to use in your websites.</p>
        </div>
      </div>
    </div>
  )
}

export default MediaPage
