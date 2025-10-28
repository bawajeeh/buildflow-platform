import React from 'react'
import { cn } from '@/utils'

interface BuilderAnalyticsPanelProps {
  pageViews: number
  uniqueVisitors: number
  avgTimeOnPage: number
  bounceRate: number
  className?: string
}

const BuilderAnalyticsPanel: React.FC<BuilderAnalyticsPanelProps> = ({
  pageViews,
  uniqueVisitors,
  avgTimeOnPage,
  bounceRate,
  className,
}) => {
  const stats = [
    { label: 'Page Views', value: pageViews.toLocaleString(), icon: '👁️', color: 'blue' },
    { label: 'Unique Visitors', value: uniqueVisitors.toLocaleString(), icon: '👤', color: 'green' },
    { label: 'Avg. Time', value: `${Math.floor(avgTimeOnPage / 60)}:${String(avgTimeOnPage % 60).padStart(2, '0')}`, icon: '⏱️', color: 'purple' },
    { label: 'Bounce Rate', value: `${bounceRate}%`, icon: '📊', color: bounceRate > 50 ? 'red' : 'green' },
  ]

  const trafficSources = [
    { source: 'Direct', percentage: 45, color: 'blue' },
    { source: 'Organic Search', percentage: 30, color: 'green' },
    { source: 'Social Media', percentage: 15, color: 'purple' },
    { source: 'Referrals', percentage: 10, color: 'orange' },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
    }
    return colors[color] || 'from-gray-500 to-gray-600'
  }

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          📈 Usage Analytics
        </h3>
        <p className="text-xs text-gray-500">
          Real-time usage statistics
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-3 bg-gradient-to-br bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-xs font-semibold text-gray-600 mb-1">
                {stat.label}
              </div>
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Performance Score */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg text-center">
          <div className="text-xs font-semibold text-gray-600 mb-2">Performance Score</div>
          <div className="text-5xl font-bold text-blue-700 mb-2">85</div>
          <div className="text-xs text-gray-500">Good performance</div>
        </div>

        {/* Traffic Sources */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-3">Traffic Sources</h4>
          <div className="space-y-3">
            {trafficSources.map((source) => (
              <div key={source.source}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{source.source}</span>
                  <span className="font-semibold">{source.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn('h-2 rounded-full transition-all', {
                      'bg-gradient-to-r from-blue-500 to-blue-600': source.color === 'blue',
                      'bg-gradient-to-r from-green-500 to-green-600': source.color === 'green',
                      'bg-gradient-to-r from-purple-500 to-purple-600': source.color === 'purple',
                      'bg-gradient-to-r from-orange-500 to-orange-600': source.color === 'orange',
                    })}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-3 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors">
              📊 View Detailed Report
            </button>
            <button className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors">
              📥 Export Data
            </button>
            <button className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors">
              ⚙️ Configure Tracking
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuilderAnalyticsPanel

