import { Router } from 'express'
import { getPrismaClient } from '../services/database'

const router = Router()
const prisma = getPrismaClient()

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        bookings: true,
        orders: true,
        _count: {
          select: {
            bookings: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(customers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' })
  }
})

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        bookings: {
          include: {
            service: true,
            staff: true,
          },
        },
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    })
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    res.json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' })
  }
})

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { websiteId, email, firstName, lastName, phone, address, tags } = req.body
    
    const customer = await prisma.customer.create({
      data: {
        websiteId,
        email,
        firstName,
        lastName,
        phone,
        address: address ? JSON.stringify(address) : null,
        tags: tags ? tags.join(',') : null,
        totalSpent: 0,
        totalOrders: 0,
      },
    })
    
    res.status(201).json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' })
  }
})

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, phone, address, tags } = req.body
    
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        firstName,
        lastName,
        phone,
        address: address ? JSON.stringify(address) : undefined,
        tags: tags ? tags.join(',') : undefined,
      },
    })
    
    res.json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' })
  }
})

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id },
    })
    
    res.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' })
  }
})

// Get customer analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        bookings: {
          select: {
            totalPrice: true,
            createdAt: true,
            status: true,
          },
        },
        orders: {
          select: {
            total: true,
            createdAt: true,
            status: true,
          },
        },
      },
    })
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    
    const analytics = {
      totalSpent: customer.totalSpent,
      totalOrders: customer.totalOrders,
      totalBookings: customer.bookings.length,
      averageOrderValue: customer.orders.length > 0 
        ? customer.orders.reduce((sum, order) => sum + order.total, 0) / customer.orders.length 
        : 0,
      lastOrderDate: customer.lastOrderDate,
      bookingHistory: customer.bookings,
      orderHistory: customer.orders,
    }
    
    res.json(analytics)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer analytics' })
  }
})

export default router
