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
import { rateLimiter } from './middleware/rateLimiter'
import { authMiddleware } from './middleware/auth'
import { errorHandler, notFound } from './utils/errorHandler'

// Import services
import { initializeDatabase, getPrismaClient } from './services/database'
import { initializeRedis } from './services/redis'
import { initializeSocket } from './services/socket'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
// Socket.IO CORS configuration - must match HTTP CORS to allow all origins
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)
      
      const allowedOrigins = [
        'https://ain90.online',
        'https://www.ain90.online',
        'https://app.ain90.online',
        'https://admin.ain90.online',
        'https://api.ain90.online',
        'https://buildflow-platform-frontend.vercel.app',
        'https://buildflow-platform-frontend-tmbq.vercel.app',
        'https://buildflow-platform-frontend-3bfn.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001'
      ]
      
      // Allow all subdomains of ain90.online (for published websites)
      if (origin.endsWith('.ain90.online') || origin === 'https://ain90.online') {
        return callback(null, true)
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Authorization'],
  },
})

// Initialize services
const prisma = initializeDatabase()
const redis = initializeRedis()
initializeSocket(io)

// Initialize database tables if they don't exist
async function initializeDatabaseTables() {
  try {
    logger.info('Initializing database tables')
    await prisma.$executeRaw`SELECT 1`
    logger.info('Database tables initialized')
  } catch (error) {
    logger.error('Database initialization failed', error)
  }
}

initializeDatabaseTables()

// Middleware
app.use(helmet())
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      'https://ain90.online',
      'https://www.ain90.online',
      'https://app.ain90.online',
      'https://admin.ain90.online',
      'https://api.ain90.online',
      'https://buildflow-platform-frontend.vercel.app',
      'https://buildflow-platform-frontend-tmbq.vercel.app',
      'https://buildflow-platform-frontend-3bfn.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ]
    
    // Allow all subdomains of ain90.online (for published websites)
    if (origin.endsWith('.ain90.online') || origin === 'https://ain90.online') {
      return callback(null, true)
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
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

// Public route for published websites (no auth required)
// CRITICAL: Must be mounted as direct route BEFORE /api/websites to avoid Express route conflict
app.get('/api/websites/subdomain/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params
    const website = await getPrismaClient().website.findUnique({
      where: { subdomain },
      include: {
        pages: {
          where: { isPublished: true },
          include: {
            elements: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        settings: true,
      },
    })
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found' })
    }
    
    if (website.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Website not published' })
    }
    
    // Parse JSON fields for elements
    const parsedPages = website.pages.map(page => ({
      ...page,
      elements: page.elements.map(el => ({
        ...el,
        props: typeof el.props === 'string' ? JSON.parse(el.props) : el.props,
        styles: typeof el.styles === 'string' ? JSON.parse(el.styles) : el.styles,
        responsive: typeof el.responsive === 'string' ? JSON.parse(el.responsive) : el.responsive,
      })),
    }))
    
    res.json({
      ...website,
      pages: parsedPages,
    })
  } catch (error) {
    logger.error('Failed to fetch website by subdomain', error, { subdomain: req.params.subdomain })
    res.status(500).json({ error: 'Failed to fetch website' })
  }
})

// Protected routes (require authentication)
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
  logger.info('Server started', { port: PORT, hasDatabase: !!process.env.DATABASE_URL })
})

export { app, server, io }
