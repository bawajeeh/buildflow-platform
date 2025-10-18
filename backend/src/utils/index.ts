// Utility functions for the backend

import crypto from 'crypto'
import { getPrismaClient } from '../services/database'


// Generate random string
export const generateRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex')
}

// Generate slug from string
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}

// Compare password
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}

// Generate JWT token
export const generateToken = (payload: any): string => {
  const jwt = require('jsonwebtoken')
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' })
}

// Verify JWT token
export const verifyToken = (token: string): any => {
  const jwt = require('jsonwebtoken')
  return jwt.verify(token, process.env.JWT_SECRET)
}

// Format date
export const formatDate = (date: Date): string => {
  return date.toISOString()
}

// Parse date
export const parseDate = (dateString: string): Date => {
  return new Date(dateString)
}

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Sanitize HTML
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
}

// Generate unique ID
export const generateUniqueId = (): string => {
  return crypto.randomUUID()
}

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// Merge objects deeply
export const deepMerge = (target: any, source: any): any => {
  const result = { ...target }
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  
  return result
}

// Pagination helper
export const paginate = (page: number, limit: number) => {
  const offset = (page - 1) * limit
  return { offset, limit }
}

// Calculate pagination metadata
export const getPaginationMeta = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit)
  const hasNext = page < totalPages
  const hasPrev = page > 1
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null,
  }
}

// Database helpers
export const findOrCreate = async <T>(
  model: any,
  where: any,
  createData: any
): Promise<T> => {
  const existing = await model.findUnique({ where })
  if (existing) {
    return existing
  }
  return model.create({ data: createData })
}

// Transaction helper
export const withTransaction = async <T>(
  callback: (tx: any) => Promise<T>
): Promise<T> => {
  return getPrismaClient().$transaction(callback)
}

// Error handling
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// Async error handler
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// File upload helpers
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  return imageExtensions.includes(getFileExtension(filename))
}

export const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
  return videoExtensions.includes(getFileExtension(filename))
}

// Rate limiting helpers
export const createRateLimitKey = (identifier: string, action: string): string => {
  return `rate_limit:${action}:${identifier}`
}

// Cache helpers
export const createCacheKey = (prefix: string, ...parts: string[]): string => {
  return `${prefix}:${parts.join(':')}`
}

// Validation helpers
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`
  }
  return null
}

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`
  }
  return null
}

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value && value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`
  }
  return null
}

// Response helpers
export const successResponse = (data: any, message?: string) => ({
  success: true,
  data,
  message,
})

export const errorResponse = (error: string, statusCode: number = 400) => ({
  success: false,
  error,
  statusCode,
})

// Logging helpers
export const logError = (error: Error, context?: any) => {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })
}

export const logInfo = (message: string, data?: any) => {
  console.log('Info:', {
    message,
    data,
    timestamp: new Date().toISOString(),
  })
}
