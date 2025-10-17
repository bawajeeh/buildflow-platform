import React from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <div className="text-3xl font-bold text-blue-600">BuildFlow</div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to BuildFlow
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Build amazing websites with our drag & drop builder
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link 
          to="/" 
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default AuthLayout
