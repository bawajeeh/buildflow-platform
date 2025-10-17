import React from 'react'
import { cn } from '@/utils'

interface WebsiteListProps {
  className?: string
}

const WebsiteList: React.FC<WebsiteListProps> = ({ className }) => {
  const websites = [
    {
      id: 1,
      name: 'My Portfolio',
      domain: 'myportfolio.com',
      status: 'Published',
      lastUpdated: '2 hours ago',
      visitors: 1234
    },
    {
      id: 2,
      name: 'Online Store',
      domain: 'mystore.com',
      status: 'Draft',
      lastUpdated: '1 day ago',
      visitors: 567
    }
  ]

  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Your Websites</h3>
          <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Create New
          </button>
        </div>
        
        <div className="space-y-4">
          {websites.map((website) => (
            <div key={website.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{website.name}</h4>
                  <p className="text-xs text-gray-500">{website.domain}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{website.visitors} visitors</p>
                    <p className="text-xs text-gray-500">{website.lastUpdated}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      website.status === 'Published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {website.status}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <button className="text-sm text-blue-600 hover:text-blue-500">
            View all websites →
          </button>
        </div>
      </div>
    </div>
  )
}

export default WebsiteList
