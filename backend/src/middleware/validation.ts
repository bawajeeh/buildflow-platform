import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

// Validation middleware factory
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        })
      }
      
      next(error)
    }
  }
}

// Validate query parameters
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        
        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: errors,
        })
      }
      
      next(error)
    }
  }
}

// Validate URL parameters
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        
        return res.status(400).json({
          success: false,
          error: 'Parameter validation failed',
          details: errors,
        })
      }
      
      next(error)
    }
  }
}
