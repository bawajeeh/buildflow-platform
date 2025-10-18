import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useWebsiteStore } from '@/store'

const WebsitesPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    description: ''
  })
  
  const { createWebsite, websites } = useWebsiteStore()

  const handleCreateWebsite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    
    try {
      const newWebsite = await createWebsite(formData)
      setShowCreateForm(false)
      setFormData({ name: '', subdomain: '', description: '' })
      // Navigate to builder
      window.location.href = `/builder/${newWebsite.id}`
    } catch (error) {
      console.error('Failed to create website:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Websites</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your websites in one place
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          Create New Website
        </Button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Create New Website</h3>
          <form onSubmit={handleCreateWebsite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="My Awesome Website"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subdomain
              </label>
              <input
                type="text"
                required
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="mywebsite"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe your website..."
              />
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Website'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

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
