import React from 'react'
import ServicesManagement from '@/components/dashboard/ServicesManagement'

const ServicesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your service offerings and bookings
        </p>
      </div>

      <ServicesManagement />
    </div>
  )
}

export default ServicesPage
