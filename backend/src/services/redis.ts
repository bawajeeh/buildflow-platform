import { createClient } from 'redis'
import { logger } from '../utils/logger'

let redisClient: ReturnType<typeof createClient>

export const initializeRedis = () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            logger.warn('Redis connection failed after 3 retries, continuing without Redis')
            return false // Stop reconnecting
          }
          return Math.min(retries * 100, 1000)
        },
      },
    })
    
    redisClient.on('error', (error) => {
      logger.warn('Redis error (continuing without Redis)', error)
    })
    
    redisClient.on('connect', () => {
      logger.info('Redis connected successfully')
    })
    
    redisClient.on('ready', () => {
      logger.info('Redis ready to accept commands')
    })
    
    redisClient.on('end', () => {
      logger.warn('Redis connection ended')
    })
    
    // Connect to Redis
    redisClient.connect().catch((error) => {
      logger.error('Failed to connect to Redis', error)
      // Don't exit process if Redis is not available
    })
    
    return redisClient
  } catch (error) {
    logger.error('Failed to initialize Redis', error)
    // Don't exit process if Redis is not available
    return null
  }
}

export const getRedisClient = () => {
  if (!redisClient) {
      logger.warn('Redis client not initialized')
    return null
  }
  return redisClient
}

// Cache helper functions
export const cache = {
  async get(key: string) {
    try {
      if (!redisClient) return null
      const value = await redisClient.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  },
  
  async set(key: string, value: any, ttlSeconds?: number) {
    try {
      if (!redisClient) return false
      const serialized = JSON.stringify(value)
      if (ttlSeconds) {
        await redisClient.setEx(key, ttlSeconds, serialized)
      } else {
        await redisClient.set(key, serialized)
      }
      return true
    } catch (error) {
      logger.error('Redis set error', error)
      return false
    }
  },
  
  async del(key: string) {
    try {
      if (!redisClient) return false
      await redisClient.del(key)
      return true
    } catch (error) {
      logger.error('Redis del error', error)
      return false
    }
  },
  
  async exists(key: string) {
    try {
      if (!redisClient) return false
      const result = await redisClient.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Redis exists error', error)
      return false
    }
  },
  
  async flush() {
    try {
      if (!redisClient) return false
      await redisClient.flushAll()
      return true
    } catch (error) {
      logger.error('Redis flush error', error)
      return false
    }
  }
}

// Session management
export const session = {
  async create(userId: string, data: any, ttlSeconds = 24 * 60 * 60) {
    const sessionId = `session:${userId}:${Date.now()}`
    await cache.set(sessionId, data, ttlSeconds)
    return sessionId
  },
  
  async get(sessionId: string) {
    return await cache.get(sessionId)
  },
  
  async destroy(sessionId: string) {
    return await cache.del(sessionId)
  },
  
  async extend(sessionId: string, ttlSeconds = 24 * 60 * 60) {
    try {
      if (!redisClient) return false
      await redisClient.expire(sessionId, ttlSeconds)
      return true
    } catch (error) {
      logger.error('Redis expire error', error)
      return false
    }
  }
}

// Rate limiting
export const rateLimit = {
  async check(key: string, limit: number, windowSeconds: number) {
    try {
      if (!redisClient) return { allowed: true, remaining: limit }
      
      const current = await redisClient.incr(key)
      
      if (current === 1) {
        await redisClient.expire(key, windowSeconds)
      }
      
      const remaining = Math.max(0, limit - current)
      const allowed = current <= limit
      
      return { allowed, remaining, resetTime: Date.now() + (windowSeconds * 1000) }
    } catch (error) {
      logger.error('Redis rate limit error', error)
      return { allowed: true, remaining: limit }
    }
  }
}

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit()
    logger.info('Redis connection closed')
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeRedis()
})

process.on('SIGTERM', async () => {
  await closeRedis()
})

export default getRedisClient
