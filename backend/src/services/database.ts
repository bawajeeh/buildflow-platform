import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

let prisma: PrismaClient

export const initializeDatabase = () => {
  try {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    })
    
    logger.info('Database connection initialized')
    
    // Test the connection
    prisma.$connect()
      .then(() => {
        logger.info('Database connected successfully')
      })
      .catch((error) => {
        logger.error('Database connection failed', error)
        process.exit(1)
      })
    
    return prisma
  } catch (error) {
    logger.error('Failed to initialize database', error)
    process.exit(1)
  }
}

export const getPrismaClient = () => {
  if (!prisma) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return prisma
}

export const closeDatabase = async () => {
  if (prisma) {
    await prisma.$disconnect()
    logger.info('Database connection closed')
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await closeDatabase()
  process.exit(0)
})

export default getPrismaClient
