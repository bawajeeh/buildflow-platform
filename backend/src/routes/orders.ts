import { Router } from 'express'
import { getPrismaClient } from '../services/database'

const router = Router()

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await getPrismaClient().order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await getPrismaClient().order.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// Create new order
router.post('/', async (req, res) => {
  try {
    const { websiteId, userId, customerId, orderNumber, subtotal, tax, shipping, discount, total, shippingAddress, billingAddress } = req.body
    
    const order = await getPrismaClient().order.create({
      data: {
        websiteId,
        userId,
        customerId,
        orderNumber,
        subtotal: parseFloat(subtotal),
        tax: parseFloat(tax),
        shipping: parseFloat(shipping),
        discount: parseFloat(discount),
        total: parseFloat(total),
        shippingAddress: JSON.stringify(shippingAddress),
        billingAddress: JSON.stringify(billingAddress),
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
    })
    
    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body
    
    const order = await getPrismaClient().order.update({
      where: { id: req.params.id },
      data: {
        status,
        paymentStatus,
      },
    })
    
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' })
  }
})

export default router
