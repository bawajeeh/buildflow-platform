import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

const WebsitesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Websites</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your websites in one place
          </p>
        </div>
        <Link to="/builder/new">
          <Button>Create New Website</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🌐</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    My Portfolio
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Published
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm space-x-2">
              <Link
                to="/builder/1"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Edit
              </Link>
              <Link
                to="/preview/1"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Preview
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🛒</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Online Store
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Draft
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm space-x-2">
              <Link
                to="/builder/2"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Edit
              </Link>
              <Link
                to="/preview/2"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Preview
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebsitesPage
