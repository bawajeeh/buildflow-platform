import React, { useEffect } from 'react'
import { useAuthStore } from '@/store'
import { useWebsiteStore } from '@/store'
import { logger } from '@/utils/logger'

const DebugInfo: React.FC = () => {
  const { user, token, isAuthenticated } = useAuthStore()
  const { websites, isLoading } = useWebsiteStore()

  useEffect(() => {
    logger.debug('Debug Info', {
      user: user ? { id: user.id, email: user.email } : null,
      hasToken: !!token,
      isAuthenticated,
      websiteCount: websites.length,
      isLoading
    })
  }, [user, token, isAuthenticated, websites, isLoading])

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <p>User: {user ? user.email : 'No user'}</p>
      <p>Token: {token ? 'Exists' : 'Missing'}</p>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>Websites: {websites.length}</p>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
    </div>
  )
}

export default DebugInfo
