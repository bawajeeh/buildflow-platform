import React from 'react'
import { Link } from 'react-router-dom'

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">BuildFlow</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Sign In
              </Link>
              <Link to="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Powerful features for everyone</h1>
          <p className="mt-4 text-xl text-gray-600">Everything you need to build amazing websites</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Drag & Drop Builder</h3>
            <p className="mt-2 text-gray-600">Intuitive visual editor that makes website building effortless</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Mobile Responsive</h3>
            <p className="mt-2 text-gray-600">All websites automatically adapt to any screen size</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">E-commerce</h3>
            <p className="mt-2 text-gray-600">Built-in shopping cart and payment processing</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Analytics</h3>
            <p className="mt-2 text-gray-600">Track performance with detailed analytics dashboard</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">SEO Optimized</h3>
            <p className="mt-2 text-gray-600">Built-in SEO tools to help your site rank higher</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Fast Loading</h3>
            <p className="mt-2 text-gray-600">Optimized for speed and performance</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturesPage
