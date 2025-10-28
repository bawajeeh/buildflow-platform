import React from 'react'
import { cn } from '@/utils'

interface BuilderPerformancePanelProps {
  pageLoadTime: number
  elementCount: number
  className?: string
}

const BuilderPerformancePanel: React.FC<BuilderPerformancePanelProps> = ({
  pageLoadTime,
  elementCount,
  className,
}) => {
  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    return 'F'
  }

  // Mock performance metrics
  const metrics = {
    pageSpeed: 85,
    accessibility: 92,
    bestPractices: 88,
    seo: 95,
  }

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          ⚡ Performance Monitor
        </h3>
        <p className="text-xs text-gray-500">
          Real-time performance insights
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Overall Score */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg text-center">
          <div className="text-xs font-semibold text-gray-600 mb-1">Overall Score</div>
          <div className={cn('text-5xl font-bold mb-2', getPerformanceColor(metrics.pageSpeed))}>
            {metrics.pageSpeed}
          </div>
          <div className="text-sm font-semibold text-gray-600">Grade: {getPerformanceGrade(metrics.pageSpeed)}</div>
        </div>

        {/* Metrics */}
        <div className="space-y-3">
          {[
            { name: 'Page Speed', value: metrics.pageSpeed, icon: '🚀' },
            { name: 'Accessibility', value: metrics.accessibility, icon: '♿' },
            { name: 'Best Practices', value: metrics.bestPractices, icon: '✅' },
            { name: 'SEO', value: metrics.seo, icon: '🔍' },
          ].map((metric) => (
            <div key={metric.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{metric.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                </div>
                <span className={cn('text-sm font-bold', getPerformanceColor(metric.value))}>
                  {metric.value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn('h-2 rounded-full transition-all duration-500', {
                    'bg-green-500': metric.value >= 90,
                    'bg-yellow-500': metric.value >= 70 && metric.value < 90,
                    'bg-red-500': metric.value < 70,
                  })}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Load Time</span>
            <span className="font-semibold text-gray-900">{pageLoadTime}ms</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Elements</span>
            <span className="font-semibold text-gray-900">{elementCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-semibold text-gray-900">Just now</span>
          </div>
        </div>

        {/* Recommendations */}
        <div className="pt-3 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">💡 Recommendations</h4>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Optimize images for faster load</li>
            <li>• Minimize CSS and JS files</li>
            <li>• Enable browser caching</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BuilderPerformancePanel

