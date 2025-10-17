import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export const initializeDatabase = () => {
  try {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    })
    
    console.log('✅ Database connection initialized')
    
    // Test the connection
    prisma.$connect()
      .then(() => {
        console.log('✅ Database connected successfully')
      })
      .catch((error) => {
        console.error('❌ Database connection failed:', error)
        process.exit(1)
      })
    
    return prisma
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
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
    console.log('✅ Database connection closed')
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
