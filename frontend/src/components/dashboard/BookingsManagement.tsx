import React from 'react'
import { cn } from '@/utils'

interface BookingsManagementProps {
  className?: string
}

const BookingsManagement: React.FC<BookingsManagementProps> = ({ className }) => {
  const bookings = [
    {
      id: '#B001',
      customer: 'John Doe',
      service: 'Consultation',
      date: '2024-01-20',
      time: '10:00 AM',
      status: 'Confirmed'
    },
    {
      id: '#B002',
      customer: 'Jane Smith',
      service: 'Design Review',
      date: '2024-01-21',
      time: '2:00 PM',
      status: 'Pending'
    }
  ]

  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Bookings</h3>
          <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
            New Booking
          </button>
        </div>
        
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{booking.service}</h4>
                  <p className="text-xs text-gray-500">{booking.customer}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{booking.date}</p>
                    <p className="text-xs text-gray-500">{booking.time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BookingsManagement
