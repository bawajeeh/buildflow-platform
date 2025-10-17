import { Router } from 'express'
import { getPrismaClient } from '../services/database'

const router = Router()
const prisma = getPrismaClient()

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
        categories: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        variants: true,
        categories: true,
      },
    })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// Create new product
router.post('/', async (req, res) => {
  try {
    const { websiteId, name, description, slug, sku, price, comparePrice, quantity, isPublished } = req.body
    
    const product = await prisma.product.create({
      data: {
        websiteId,
        name,
        description,
        slug,
        sku,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        quantity: parseInt(quantity) || 0,
        isPublished: isPublished || false,
      },
    })
    
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, comparePrice, quantity, isPublished } = req.body
    
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
        quantity: quantity ? parseInt(quantity) : undefined,
        isPublished,
      },
    })
    
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    })
    
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router
