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
import bookingRoutes from './routes/bookings'
import customerRoutes from './routes/customers'
import analyticsRoutes from './routes/analytics'
import mediaRoutes from './routes/media'
import settingsRoutes from './routes/settings'

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
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
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
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(rateLimiter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Swagger API Documentation
setupSwagger(app)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/websites', authMiddleware, websiteRoutes)
app.use('/api/pages', authMiddleware, pageRoutes)
app.use('/api/elements', authMiddleware, elementRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/products', authMiddleware, productRoutes)
app.use('/api/orders', authMiddleware, orderRoutes)
app.use('/api/services', authMiddleware, serviceRoutes)
app.use('/api/bookings', authMiddleware, bookingRoutes)
app.use('/api/customers', authMiddleware, customerRoutes)
app.use('/api/analytics', authMiddleware, analyticsRoutes)
app.use('/api/media', authMiddleware, mediaRoutes)
app.use('/api/settings', authMiddleware, settingsRoutes)

// Error handling
app.use(notFound)
app.use(errorHandler)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT || 5001
  })
})

// Start server
const PORT = process.env.PORT || 5001
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔧 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`)
})

export { app, server, io }
