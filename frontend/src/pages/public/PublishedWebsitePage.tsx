import React, { useEffect, useState } from 'react'
import { API_CONFIG } from '@/config/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ElementRenderer from '@/components/builder/ElementRenderer'
import { Page, Element } from '@/types'

interface Website {
  id: string
  name: string
  subdomain: string
  status: string
  pages: Page[]
  settings?: any
}

const PublishedWebsitePage: React.FC = () => {
  const [website, setWebsite] = useState<Website | null>(null)
  const [currentPage, setCurrentPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const subdomain = window.location.hostname.split('.')[0]

  useEffect(() => {
    const loadWebsite = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(API_CONFIG.ENDPOINTS.WEBSITES.GET_BY_SUBDOMAIN(subdomain))
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Website not found or not published')
          } else {
            setError('Failed to load website')
          }
          setIsLoading(false)
          return
        }

        const data = await response.json()
        setWebsite(data)
        
        // Find homepage or first page
        const homepage = data.pages.find((p: Page) => p.isHome) || data.pages[0]
        setCurrentPage(homepage || null)
      } catch (err) {
        console.error('Error loading website:', err)
        setError('Failed to load website')
      } finally {
        setIsLoading(false)
      }
    }

    loadWebsite()
  }, [subdomain])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Website Not Found</h1>
          <p className="text-gray-600">{error || 'This website does not exist or is not published.'}</p>
        </div>
      </div>
    )
  }

  if (!currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Pages Available</h1>
          <p className="text-gray-600">This website has no published pages.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Render page elements */}
      <div className="w-full">
        {currentPage.elements && currentPage.elements.length > 0 ? (
          currentPage.elements
            .filter((el: Element) => !el.parentId) // Only render top-level elements
            .map((element: Element) => (
              <ElementRenderer
                key={element.id}
                element={element}
                isSelected={false}
                isHovered={false}
                responsiveMode="desktop"
                onClick={() => {}}
                onHover={() => {}}
              />
            ))
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Empty Page</h1>
              <p className="text-gray-600">This page has no content yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PublishedWebsitePage

