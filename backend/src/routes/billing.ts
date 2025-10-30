import { Router } from 'express'
import { requireAdmin } from '../middleware/auth'

const router = Router()

// Plans (static for now)
router.get('/billing/plans', (req, res) => {
  res.json([
    { id: 'free', name: 'Free', price: 0, features: ['1 website', 'Basic features'] },
    { id: 'pro', name: 'Pro', price: 19, features: ['5 websites', 'Versioning', 'Components'] },
    { id: 'business', name: 'Business', price: 49, features: ['Unlimited', 'Team', 'Snapshots'] },
  ])
})

// Checkout session scaffold
router.post('/billing/checkout', requireAdmin, async (req, res) => {
  if (!process.env.STRIPE_SECRET) {
    return res.status(501).json({ error: 'Stripe not configured' })
  }
  // Here would be Stripe checkout session creation
  res.json({ url: 'https://checkout.stripe.com/test-session' })
})

// Webhook scaffold
router.post('/billing/webhook', async (req, res) => {
  // In production, verify signature and update subscription status
  res.json({ received: true })
})

export default router


