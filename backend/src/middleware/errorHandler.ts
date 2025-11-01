import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

// Error handler middleware - DEPRECATED: Use enhanced errorHandler from utils/errorHandler
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error in legacy errorHandler', error, {
    path: req.path,
    method: req.method,
  })

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      error: 'Database operation failed',
    })
  }

  if (error.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid data provided',
    })
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    })
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
    })
  }

  // Multer errors
  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: 'File upload error',
    })
  }

  // Default error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
  })
}

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  })
}

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
