import React from 'react'
import { Link } from 'react-router-dom'

const PricingPage: React.FC = () => {
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
          <h1 className="text-4xl font-bold text-gray-900">Simple, transparent pricing</h1>
          <p className="mt-4 text-xl text-gray-600">Choose the plan that's right for you</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Free Plan */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900">Free</h3>
            <p className="mt-4 text-gray-600">Perfect for getting started</p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-600">1 website</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-600">Basic templates</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-600">Mobile responsive</span>
              </li>
            </ul>
            <Link to="/auth/register" className="mt-8 w-full bg-gray-900 text-white py-2 px-4 rounded-md text-center block hover:bg-gray-800">
              Get started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white border-2 border-blue-500 rounded-lg shadow-sm p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
            <p className="mt-4 text-gray-600">For growing businesses</p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900">$29</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-600">5 websites</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-600">Premium templates</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-600">E-commerce features</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-600">Analytics</span>
              </li>
            </ul>
            <Link to="/auth/register" className="mt-8 w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center block hover:bg-blue-700">
              Start free trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
            <p className="mt-4 text-gray-600">For large organizations</p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900">$99</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-600">Unlimited websites</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-600">Custom templates</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-600">Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span className="text-gray-600">Priority support</span>
              </li>
            </ul>
            <Link to="/contact" className="mt-8 w-full bg-gray-900 text-white py-2 px-4 rounded-md text-center block hover:bg-gray-800">
              Contact sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage
