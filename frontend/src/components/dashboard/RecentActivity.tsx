import React, { useState, useEffect } from 'react'
import { cn } from '@/utils'
import { useAuthStore } from '@/store'
import { API_CONFIG } from '@/config/api'
import { logger } from '@/utils/logger'

interface Activity {
  id: string
  type: 'website' | 'product' | 'service' | 'order' | 'booking'
  action: 'created' | 'updated' | 'published' | 'deleted'
  name: string
  time: string
  icon: string
  createdAt: Date
}

interface RecentActivityProps {
  className?: string
}

const RecentActivity: React.FC<RecentActivityProps> = ({ className }) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuthStore()

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/analytics/recent-activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recent activity')
      }

      const data = await response.json()
      setActivities(data.data || [])
    } catch (error) {
      logger.error('Error fetching recent activity', error)
      // Fallback to empty array if API fails
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'website': return '🌐'
      case 'product': return '📦'
      case 'service': return '🔧'
      case 'order': return '🛒'
      case 'booking': return '📅'
      default: return '📝'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.name}</span> was {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
        
        <div className="mt-4">
          <button 
            className="text-sm text-blue-600 hover:text-blue-500"
            onClick={fetchRecentActivity}
          >
            View all activity →
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecentActivity
