import { Request, Response, NextFunction } from 'express'
import { logger } from './logger'
import { Prisma } from '@prisma/client'

/**
 * Professional error handling utilities
 */

export interface ApiError extends Error {
  statusCode?: number
  code?: string
  details?: unknown
}

/**
 * Create a standardized API error
 */
export function createError(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown
): ApiError {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  error.code = code
  error.details = details
  return error
}

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: unknown): ApiError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return createError('Unique constraint violation', 409, 'UNIQUE_CONSTRAINT', {
          field: error.meta?.target,
        })
      case 'P2025':
        return createError('Record not found', 404, 'NOT_FOUND')
      case 'P2003':
        return createError('Foreign key constraint violation', 400, 'FOREIGN_KEY_CONSTRAINT')
      default:
        return createError('Database operation failed', 400, 'DATABASE_ERROR', {
          code: error.code,
        })
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return createError('Invalid data provided', 400, 'VALIDATION_ERROR')
  }

  return createError('Database error', 500, 'DATABASE_ERROR')
}

/**
 * Enhanced error handler middleware
 */
export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error with context
  const context = {
    requestId: req.headers['x-request-id'] || 'unknown',
    userId: (req as any).user?.id,
    path: req.path,
    method: req.method,
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError || 
      error instanceof Prisma.PrismaClientValidationError) {
    const apiError = handlePrismaError(error)
    logger.error('Prisma error', apiError, context)
    
    return res.status(apiError.statusCode || 500).json({
      success: false,
      error: apiError.message,
      code: apiError.code,
      details: apiError.details,
    })
  }

  // Handle API errors
  if ((error as ApiError).statusCode) {
    const apiError = error as ApiError
    logger.error('API error', apiError, context)
    
    return res.status(apiError.statusCode || 500).json({
      success: false,
      error: apiError.message,
      code: apiError.code,
      details: apiError.details,
    })
  }

  // Handle JWT errors
  if ((error as Error).name === 'JsonWebTokenError') {
    logger.error('JWT error', error, context)
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    })
  }

  if ((error as Error).name === 'TokenExpiredError') {
    logger.error('Token expired', error, context)
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
    })
  }

  // Handle Multer errors (file upload)
  if ((error as Error).name === 'MulterError') {
    logger.error('File upload error', error, context)
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      code: 'UPLOAD_ERROR',
    })
  }

  // Handle unknown errors
  logger.error('Unknown error', error, context)
  
  const isDevelopment = process.env.NODE_ENV !== 'production'
  res.status(500).json({
    success: false,
    error: isDevelopment 
      ? (error instanceof Error ? error.message : 'Internal server error')
      : 'Internal server error',
    ...(isDevelopment && error instanceof Error && { stack: error.stack }),
  })
}

/**
 * Not found middleware
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  logger.warn('Route not found', { path: req.originalUrl, method: req.method })
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  })
}

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

