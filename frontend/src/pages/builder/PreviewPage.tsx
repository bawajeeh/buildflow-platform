import React from 'react'

const PreviewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Website Preview
          </h1>
          <p className="text-gray-600 mb-8">
            This is how your website will look to visitors
          </p>
          
          <div className="bg-gray-100 rounded-lg p-8">
            <div className="text-gray-500">
              <div className="text-6xl mb-4">🚧</div>
              <p className="text-xl">Preview mode coming soon</p>
              <p className="text-sm mt-2">Your website content will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewPage
