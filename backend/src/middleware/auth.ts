import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getPrismaClient } from '../services/database'
import { logger } from '../utils/logger'


// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
      }
    }
  }
}

// Authentication middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required',
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string }
    
    // Find user
    const user = await getPrismaClient().user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      })
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    next()
  } catch (error) {
    logger.error('Auth middleware error', error, {
      path: req.path,
      method: req.method,
    })
    res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    })
  }
}

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      })
    }

    next()
  }
}

// Admin only middleware
export const requireAdmin = requireRole(['ADMIN', 'SUPER_ADMIN'])

// Super admin only middleware
export const requireSuperAdmin = requireRole(['SUPER_ADMIN'])

// Website ownership or elevated role guard
export const requireWebsiteAccess = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' })
      }
      // Admins can access
      if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
        return next()
      }
      const websiteId = (req.params.websiteId || (req.body && req.body.websiteId)) as string | undefined
      if (!websiteId) {
        return res.status(400).json({ success: false, error: 'websiteId is required' })
      }
      const prisma = getPrismaClient()
      const website = await prisma.website.findUnique({
        where: { id: websiteId },
        select: { id: true, userId: true },
      })
      if (!website) {
        return res.status(404).json({ success: false, error: 'Website not found' })
      }
      if (website.userId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' })
      }
      next()
    } catch (error) {
      logger.error('requireWebsiteAccess error', error, {
        userId: req.user?.id,
        websiteId: req.params.websiteId || req.body?.websiteId,
      })
      res.status(500).json({ 
        success: false, 
        error: 'Authorization check failed',
        code: 'AUTHORIZATION_FAILED',
      })
    }
  }
}
