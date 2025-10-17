import React from 'react'

const TemplatesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse and use pre-designed website templates
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Business Template</h3>
            <p className="mt-1 text-sm text-gray-500">Perfect for business websites</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Portfolio Template</h3>
            <p className="mt-1 text-sm text-gray-500">Great for showcasing work</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">E-commerce Template</h3>
            <p className="mt-1 text-sm text-gray-500">Built for online stores</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplatesPage
