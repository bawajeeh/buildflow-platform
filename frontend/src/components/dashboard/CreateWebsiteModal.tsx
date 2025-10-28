import React, { useState } from 'react'
import { cn } from '@/utils'
import { X, Globe, Loader } from 'lucide-react'
import { useWebsiteStore } from '@/store'

// Components
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Modal } from '@/components/ui'

interface CreateWebsiteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (website: any) => void
}

const CreateWebsiteModal: React.FC<CreateWebsiteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    description: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { createWebsite } = useWebsiteStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Website name is required')
      }
      if (!formData.subdomain.trim()) {
        throw new Error('Subdomain is required')
      }

      // Create slug from subdomain
      const slug = formData.subdomain
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .trim()

      const website = await createWebsite({
        name: formData.name.trim(),
        subdomain: slug,
      })

      // Reset form
      setFormData({ name: '', subdomain: '', description: '' })
      
      // Close modal and call success callback
      onClose()
      if (onSuccess) {
        onSuccess(website)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create website')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubdomainChange = (value: string) => {
    // Auto-generate subdomain from name
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    setFormData(prev => ({
      ...prev,
      subdomain: slug,
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Website</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Website Name *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }))
                handleSubdomainChange(e.target.value)
              }}
              placeholder="My Awesome Website"
              required
            />
          </div>

          <div>
            <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
              Subdomain *
            </label>
            <div className="flex items-center">
              <Input
                id="subdomain"
                value={formData.subdomain}
                onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
                placeholder="my-awesome-website"
                required
                className="rounded-r-none"
              />
              <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600">
                .ain90.online
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This will be your website URL: {formData.subdomain || 'your-subdomain'}.ain90.online
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your website..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Create Website
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default CreateWebsiteModal
