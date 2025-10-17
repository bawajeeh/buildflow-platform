import React from 'react'
import { Link } from 'react-router-dom'

const AboutPage: React.FC = () => {
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
          <h1 className="text-4xl font-bold text-gray-900">About BuildFlow</h1>
          <p className="mt-4 text-xl text-gray-600">Making website building accessible to everyone</p>
        </div>

        <div className="mt-16 prose prose-lg mx-auto">
          <p className="text-gray-600">
            BuildFlow was founded with a simple mission: to make website building accessible to everyone, 
            regardless of technical skill level. We believe that everyone should be able to create 
            beautiful, professional websites without needing to learn how to code.
          </p>
          
          <p className="text-gray-600 mt-6">
            Our drag-and-drop builder combines the power of modern web technologies with an intuitive 
            interface that makes website creation as simple as dragging and dropping elements onto a canvas. 
            Whether you're a small business owner, freelancer, or entrepreneur, BuildFlow gives you 
            the tools you need to succeed online.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8">Our Vision</h2>
          <p className="text-gray-600">
            To democratize web development and empower millions of people to bring their ideas to life 
            through beautiful, functional websites.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8">Our Team</h2>
          <p className="text-gray-600">
            We're a passionate team of designers, developers, and entrepreneurs who are committed to 
            creating the best possible website building experience. We're constantly innovating and 
            improving our platform based on user feedback and the latest web technologies.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
