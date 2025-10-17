import React from 'react'

const WebsiteSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your website settings and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            General Settings
          </h3>
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website Name
              </label>
              <input
                type="text"
                defaultValue="My Website"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Domain
              </label>
              <input
                type="text"
                defaultValue="mywebsite.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebsiteSettingsPage
