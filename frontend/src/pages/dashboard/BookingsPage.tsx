import React from 'react'

const BookingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage customer bookings
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500">No bookings yet. Bookings will appear here when customers schedule services.</p>
        </div>
      </div>
    </div>
  )
}

export default BookingsPage
