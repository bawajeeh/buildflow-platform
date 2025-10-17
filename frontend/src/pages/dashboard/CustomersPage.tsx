import React from 'react'

const CustomersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your customer database and relationships
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500">No customers yet. Customer information will appear here.</p>
        </div>
      </div>
    </div>
  )
}

export default CustomersPage
