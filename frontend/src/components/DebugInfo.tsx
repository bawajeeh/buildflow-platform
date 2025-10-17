import React, { useEffect } from 'react'
import { useAuthStore } from '@/store'
import { useWebsiteStore } from '@/store'

const DebugInfo: React.FC = () => {
  const { user, token, isAuthenticated } = useAuthStore()
  const { websites, isLoading } = useWebsiteStore()

  useEffect(() => {
    console.log('Debug Info:', {
      user,
      token: token ? 'Token exists' : 'No token',
      isAuthenticated,
      websites,
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
