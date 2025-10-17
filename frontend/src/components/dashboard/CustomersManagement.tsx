import React from 'react'
import { cn } from '@/utils'

interface CustomersManagementProps {
  className?: string
}

const CustomersManagement: React.FC<CustomersManagementProps> = ({ className }) => {
  const customers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      orders: 5,
      totalSpent: '$299.99',
      lastOrder: '2024-01-15'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      orders: 3,
      totalSpent: '$149.99',
      lastOrder: '2024-01-10'
    }
  ]

  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Customers</h3>
          <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Add Customer
          </button>
        </div>
        
        <div className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{customer.name}</h4>
                  <p className="text-xs text-gray-500">{customer.email}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{customer.orders} orders</p>
                    <p className="text-xs text-gray-500">{customer.totalSpent} spent</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Last order:</p>
                    <p className="text-xs text-gray-500">{customer.lastOrder}</p>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomersManagement
