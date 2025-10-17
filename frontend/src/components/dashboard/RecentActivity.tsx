import React from 'react'
import { cn } from '@/utils'

interface RecentActivityProps {
  className?: string
}

const RecentActivity: React.FC<RecentActivityProps> = ({ className }) => {
  const activities = [
    {
      id: 1,
      type: 'website',
      action: 'published',
      name: 'My Portfolio',
      time: '2 hours ago',
      icon: '🌐'
    },
    {
      id: 2,
      type: 'product',
      action: 'created',
      name: 'Premium Package',
      time: '1 day ago',
      icon: '📦'
    },
    {
      id: 3,
      type: 'service',
      action: 'updated',
      name: 'Consultation',
      time: '2 days ago',
      icon: '🔧'
    }
  ]

  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-lg">{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.name}</span> was {activity.action}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <button className="text-sm text-blue-600 hover:text-blue-500">
            View all activity →
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecentActivity
