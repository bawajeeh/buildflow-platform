import React from 'react'
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard'

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your website performance and visitor insights
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}

export default AnalyticsPage
