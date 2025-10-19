import React, { useState, useEffect } from 'react'
import { cn } from '@/utils'
import { API_CONFIG } from '@/config/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'
import { 
  Calendar, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  CheckCircle,
  MoreVertical,
  DollarSign,
  User
} from 'lucide-react'

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Modal } from '@/components/ui'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui'

// Types
import { Service, ServiceType, BookingStatus, PaymentStatus, ServiceStaff, Booking, Website } from '@/types'

interface ServicesManagementProps {
  website: Website | null
}

const ServicesManagement: React.FC<ServicesManagementProps> = ({ website }) => {
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [staff, setStaff] = useState<ServiceStaff[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  useEffect(() => {
    if (website) {
      fetchServices()
      fetchBookings()
      fetchStaff()
    }
  }, [website])

  const fetchServices = async () => {
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(API_CONFIG.ENDPOINTS.SERVICES.LIST(website?.id || ''), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      setServices(data.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
    }
  }

  const fetchBookings = async () => {
    // Mock data
    setBookings([
      {
        id: '1',
        serviceId: '1',
        customerId: '1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        date: new Date('2024-01-15'),
        time: '10:00',
        duration: 60,
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        totalAmount: 80.00,
        depositAmount: 20.00,
        notes: 'First time client',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  }

  const fetchStaff = async () => {
    // Mock data
    setStaff([
      {
        id: '1',
        serviceId: '1',
        staffId: '1',
        staffName: 'John Smith',
        staffEmail: 'john@example.com',
        name: 'John Smith',
        email: 'john@example.com',
        specialties: ['Personal Training', 'Nutrition'],
        isPrimary: true,
      },
    ])
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || service.type === filterType
    return matchesSearch && matchesFilter
  })

  const stats = [
    {
      title: 'Total Services',
      value: services.length,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Bookings',
      value: bookings.filter(b => b.status === 'CONFIRMED').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Revenue',
      value: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Staff Members',
      value: staff.length,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Services & Bookings</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.title === 'Total Revenue' ? `$${stat.value.toFixed(2)}` : stat.value}
                    </p>
                  </div>
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center',
                    stat.bgColor
                  )}>
                    <Icon className={cn('w-6 h-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent border border-input rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="APPOINTMENT">Appointments</option>
                <option value="CLASS">Classes</option>
                <option value="COURSE">Courses</option>
                <option value="MEMBERSHIP">Memberships</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Services ({filteredServices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {service.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {service.duration} min • ${service.price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Capacity: {service.capacity}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedService(service)
                      setIsEditModalOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DropdownMenu
                    trigger={
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    }
                  >
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {booking.date.toLocaleDateString()} at {booking.time}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Customer ID: {booking.customerId}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ${booking.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Service Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Service"
      >
        <ServiceForm
          onSave={async (service) => {
            try {
              const { token } = useAuthStore.getState()
              const response = await fetch(API_CONFIG.ENDPOINTS.SERVICES.LIST(website?.id || ''), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(service),
              })

              if (!response.ok) {
                throw new Error('Failed to create service')
              }

              const data = await response.json()
              setServices(prev => [...prev, data.data])
              setIsCreateModalOpen(false)
              toast.success('Service created successfully!')
            } catch (error) {
              console.error('Error creating service:', error)
            }
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Service"
      >
        {selectedService && (
          <ServiceForm
            service={selectedService}
            onSave={async (service) => {
              try {
                const { token } = useAuthStore.getState()
                const response = await fetch(API_CONFIG.ENDPOINTS.SERVICES.UPDATE(selectedService.id), {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify(service),
                })

                if (!response.ok) {
                  throw new Error('Failed to update service')
                }

                const data = await response.json()
                setServices(prev => prev.map(s => s.id === selectedService.id ? data.data : s))
                setIsEditModalOpen(false)
                toast.success('Service updated successfully!')
              } catch (error) {
                console.error('Error updating service:', error)
                toast.error('Failed to update service. Please try again.')
              }
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  )
}

// Service Form Component
interface ServiceFormProps {
  service?: Service
  onSave: (service: Partial<Service>) => void
  onCancel: () => void
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    type: service?.type || ServiceType.CONSULTATION,
    duration: service?.duration || 60,
    price: service?.price || 0,
    capacity: service?.capacity || 1,
    advanceBookingDays: service?.advanceBookingDays || 30,
    cancellationHours: service?.cancellationHours || 24,
    bufferTime: service?.bufferTime || 0,
    allowRescheduling: service?.allowRescheduling || false,
    requireDeposit: service?.requireDeposit || false,
    depositAmount: service?.depositAmount || 0,
    isPublished: service?.isPublished || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Service Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Service Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full p-2 border border-input rounded-md bg-background"
          >
            <option value="APPOINTMENT">Appointment</option>
            <option value="CLASS">Class</option>
            <option value="COURSE">Course</option>
            <option value="MEMBERSHIP">Membership</option>
          </select>
        </div>
        
        <Input
          label="Duration (minutes)"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          required
        />
        <Input
          label="Capacity"
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.allowRescheduling}
            onChange={(e) => setFormData({ ...formData, allowRescheduling: e.target.checked })}
          />
          Allow Rescheduling
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.requireDeposit}
            onChange={(e) => setFormData({ ...formData, requireDeposit: e.target.checked })}
          />
          Require Deposit
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          />
          Published
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {service ? 'Update' : 'Create'} Service
        </Button>
      </div>
    </form>
  )
}

export default ServicesManagement
