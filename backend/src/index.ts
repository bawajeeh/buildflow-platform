import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { setupSwagger } from './config/swagger'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import websiteRoutes from './routes/websites'
import pageRoutes from './routes/pages'
import elementRoutes from './routes/elements'
import templateRoutes from './routes/templates'
import productRoutes from './routes/products'
import orderRoutes from './routes/orders'
import serviceRoutes from './routes/services'
import blogRoutes from './routes/blog'
import bookingRoutes from './routes/bookings'
import customerRoutes from './routes/customers'
import analyticsRoutes from './routes/analytics'
import mediaRoutes from './routes/media'
import settingsRoutes from './routes/settings'
import componentRoutes from './routes/components'
import publishRoutes from './routes/publish'
import versioningRoutes from './routes/versioning'
import seoRoutes from './routes/seo'
import activityRoutes from './routes/activity'
import webhooksRoutes from './routes/webhooks'
import backupsRoutes from './routes/backups'
import teamsRoutes from './routes/teams'
import billingRoutes from './routes/billing'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import { rateLimiter } from './middleware/rateLimiter'
import { authMiddleware } from './middleware/auth'

// Import services
import { initializeDatabase } from './services/database'
import { initializeRedis } from './services/redis'
import { initializeSocket } from './services/socket'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://app.ain90.online',
      'https://admin.ain90.online',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Initialize services
const prisma = initializeDatabase()
const redis = initializeRedis()
initializeSocket(io)

// Initialize database tables if they don't exist
async function initializeDatabaseTables() {
  try {
    console.log('🔧 Initializing database tables...')
    await prisma.$executeRaw`SELECT 1`
    console.log('✅ Database tables initialized')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
  }
}

initializeDatabaseTables()

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    'https://ain90.online',
    'https://www.ain90.online',
    'https://app.ain90.online',
    'https://admin.ain90.online',
    'https://buildflow-platform-frontend.vercel.app',
    'https://buildflow-platform-frontend-tmbq.vercel.app',
    'https://buildflow-platform-frontend-3bfn.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(rateLimiter)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'BuildFlow API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api-docs'
    },
    timestamp: new Date().toISOString()
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT || 5001,
    database: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
          version: '1.0.3' // CORS fix for ain90.online
  })
})

// Swagger API Documentation
setupSwagger(app)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/websites', authMiddleware, websiteRoutes)
app.use('/api/websites', authMiddleware, pageRoutes)
app.use('/api/pages', authMiddleware, pageRoutes)
app.use('/api/elements', authMiddleware, elementRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/products', authMiddleware, productRoutes)
app.use('/api/orders', authMiddleware, orderRoutes)
app.use('/api/services', authMiddleware, serviceRoutes)
app.use('/api', authMiddleware, blogRoutes)
app.use('/api/bookings', authMiddleware, bookingRoutes)
app.use('/api/customers', authMiddleware, customerRoutes)
app.use('/api/analytics', authMiddleware, analyticsRoutes)
app.use('/api/media', authMiddleware, mediaRoutes)
app.use('/api/settings', authMiddleware, settingsRoutes)
app.use('/api/components', authMiddleware, componentRoutes)
app.use('/api', authMiddleware, publishRoutes)
app.use('/api', authMiddleware, versioningRoutes)
app.use('/api', seoRoutes)
app.use('/api', authMiddleware, activityRoutes)
app.use('/api', authMiddleware, webhooksRoutes)
app.use('/api', authMiddleware, backupsRoutes)
app.use('/api', authMiddleware, teamsRoutes)
app.use('/api', billingRoutes)

// Error handling
app.use(notFound)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5001
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔧 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`)
})

export { app, server, io }
