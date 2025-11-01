import { Router } from 'express'
import { requireAdmin } from '../middleware/auth'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateRequest } from '../middleware/validation'
import { checkoutSchema } from '../validations/billing'

const router = Router()

// Plans (static for now) - Public route
router.get('/billing/plans', asyncHandler(async (req, res) => {
  const plans = [
    { id: 'free', name: 'Free', price: 0, features: ['1 website', 'Basic features'] },
    { id: 'pro', name: 'Pro', price: 19, features: ['5 websites', 'Versioning', 'Components'] },
    { id: 'business', name: 'Business', price: 49, features: ['Unlimited', 'Team', 'Snapshots'] },
  ]
  
  logger.debug('Billing plans fetched')
  
  res.json({ success: true, data: plans })
}))

// Checkout session scaffold
router.post('/billing/checkout', requireAdmin, validateRequest(checkoutSchema), asyncHandler(async (req, res) => {
  if (!process.env.STRIPE_SECRET) {
    throw createError('Stripe not configured', 501, 'STRIPE_NOT_CONFIGURED')
  }
  
  const { planId } = req.body
  
  // Here would be Stripe checkout session creation
  logger.info('Checkout session created', { planId })
  
  res.json({ success: true, data: { url: 'https://checkout.stripe.com/test-session' } })
}))

// Webhook scaffold
router.post('/billing/webhook', asyncHandler(async (req, res) => {
  // In production, verify signature and update subscription status
  logger.info('Billing webhook received', { headers: req.headers })
  
  res.json({ success: true, received: true })
}))

export default router


