import { Router } from 'express'
import { z } from 'zod'
import { getPrismaClient } from '../services/database'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateParams, validateRequest } from '../middleware/validation'
import { authMiddleware } from '../middleware/auth'
import { websiteIdParamsSchema, userIdParamsSchema, updateWebsiteSettingsSchema, updateUserSettingsSchema, updateSubscriptionSchema } from '../validations/settings'

const router = Router()

// Get website settings - Requires authentication and ownership check
router.get('/website/:websiteId', authMiddleware, validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const { websiteId } = req.params

  // Verify user owns the website
  const website = await getPrismaClient().website.findUnique({
    where: { id: websiteId },
    select: { userId: true },
  })

  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }

  if (website.userId !== userId && req.user?.role !== 'ADMIN') {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const settings = await getPrismaClient().websiteSettings.findUnique({
    where: { websiteId },
  })
  
  if (!settings) {
    throw createError('Settings not found', 404, 'SETTINGS_NOT_FOUND')
  }
  
  logger.debug('Website settings fetched', { websiteId, userId })

  res.json({ success: true, data: settings })
}))

// Update website settings - Requires authentication and ownership check
router.put('/website/:websiteId', authMiddleware, validateParams(websiteIdParamsSchema), validateRequest(updateWebsiteSettingsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const { websiteId } = req.params
  const updates = req.body

  // Verify user owns the website
  const website = await getPrismaClient().website.findUnique({
    where: { id: websiteId },
    select: { userId: true },
  })

  if (!website) {
    throw createError('Website not found', 404, 'WEBSITE_NOT_FOUND')
  }

  if (website.userId !== userId && req.user?.role !== 'ADMIN') {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }
  
  const settings = await getPrismaClient().websiteSettings.upsert({
    where: { websiteId },
    update: updates,
    create: {
      websiteId,
      ...updates,
      primaryColor: updates.primaryColor || '#3b82f6',
      secondaryColor: updates.secondaryColor || '#64748b',
      fontFamily: updates.fontFamily || 'Inter',
      borderRadius: updates.borderRadius || 8,
    },
  })
  
  logger.info('Website settings updated', { websiteId, userId, changes: Object.keys(updates) })

  res.json({ success: true, data: settings })
}))

// Get user settings - Users can only view their own settings, admins can view any
router.get('/user/:userId', authMiddleware, validateParams(userIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const requestedUserId = req.params.userId

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Users can only view their own settings unless they're admin
  if (requestedUserId !== userId && userRole !== 'ADMIN') {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const user = await getPrismaClient().user.findUnique({
    where: { id: requestedUserId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      createdAt: true,
      subscription: true,
    },
  })
  
  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND')
  }
  
  logger.debug('User settings fetched', { userId: requestedUserId, requestedBy: userId })

  res.json({ success: true, data: user })
}))

// Update user settings - Users can only update their own settings, admins can update any
router.put('/user/:userId', authMiddleware, validateParams(userIdParamsSchema), validateRequest(updateUserSettingsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const requestedUserId = req.params.userId
  const updates = req.body

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Users can only update their own settings unless they're admin
  if (requestedUserId !== userId && userRole !== 'ADMIN') {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  // Check if user exists
  const existingUser = await getPrismaClient().user.findUnique({
    where: { id: requestedUserId },
  })

  if (!existingUser) {
    throw createError('User not found', 404, 'USER_NOT_FOUND')
  }
  
  const user = await getPrismaClient().user.update({
    where: { id: requestedUserId },
    data: updates,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  })
  
  logger.info('User settings updated', { userId: requestedUserId, updatedBy: userId, changes: Object.keys(updates) })

  res.json({ success: true, data: user })
}))

// Get subscription settings - Users can only view their own subscription, admins can view any
router.get('/subscription/:userId', authMiddleware, validateParams(userIdParamsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const requestedUserId = req.params.userId

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Users can only view their own subscription unless they're admin
  if (requestedUserId !== userId && userRole !== 'ADMIN') {
    throw createError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const subscription = await getPrismaClient().subscription.findUnique({
    where: { userId: requestedUserId },
  })
  
  if (!subscription) {
    throw createError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND')
  }
  
  logger.debug('Subscription settings fetched', { userId: requestedUserId, requestedBy: userId })

  res.json({ success: true, data: subscription })
}))

// Update subscription settings - Admin only (subscription changes require admin access)
router.put('/subscription/:userId', authMiddleware, validateParams(userIdParamsSchema), validateRequest(updateSubscriptionSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role
  const requestedUserId = req.params.userId

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Only admins can update subscriptions
  if (userRole !== 'ADMIN') {
    throw createError('Insufficient permissions - Admin access required', 403, 'FORBIDDEN')
  }

  const updates = req.body

  // Check if subscription exists
  const existingSubscription = await getPrismaClient().subscription.findUnique({
    where: { userId: requestedUserId },
  })

  if (!existingSubscription) {
    throw createError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND')
  }
    
  const subscription = await getPrismaClient().subscription.update({
    where: { userId: requestedUserId },
    data: updates,
  })
  
  logger.info('Subscription settings updated', { userId: requestedUserId, updatedBy: userId, changes: Object.keys(updates) })

  res.json({ success: true, data: subscription })
}))

// Get system settings (admin only)
router.get('/system', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Only admins can view system settings
  if (userRole !== 'ADMIN') {
    throw createError('Insufficient permissions - Admin access required', 403, 'FORBIDDEN')
  }

  // This would typically come from a system settings table
  const systemSettings = {
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    analyticsEnabled: true,
    backupFrequency: 'daily',
    maxFileSize: '10MB',
    allowedFileTypes: ['jpg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'pdf'],
    defaultTheme: 'light',
    apiRateLimit: 1000,
    sessionTimeout: 24, // hours
  }
  
  logger.debug('System settings fetched', { requestedBy: userId })

  res.json({ success: true, data: systemSettings })
}))

// Update system settings (admin only)
router.put('/system', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id
  const userRole = req.user?.role

  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  // Only admins can update system settings
  if (userRole !== 'ADMIN') {
    throw createError('Insufficient permissions - Admin access required', 403, 'FORBIDDEN')
  }

  const { 
    maintenanceMode, 
    registrationEnabled, 
    emailNotifications,
    analyticsEnabled,
    backupFrequency,
    maxFileSize,
    allowedFileTypes,
    defaultTheme,
    apiRateLimit,
    sessionTimeout
  } = req.body
  
  // In a real application, this would update a system settings table
  const systemSettings = {
    maintenanceMode: maintenanceMode || false,
    registrationEnabled: registrationEnabled !== undefined ? registrationEnabled : true,
    emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
    analyticsEnabled: analyticsEnabled !== undefined ? analyticsEnabled : true,
    backupFrequency: backupFrequency || 'daily',
    maxFileSize: maxFileSize || '10MB',
    allowedFileTypes: allowedFileTypes || ['jpg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'pdf'],
    defaultTheme: defaultTheme || 'light',
    apiRateLimit: apiRateLimit || 1000,
    sessionTimeout: sessionTimeout || 24,
  }
  
  logger.info('System settings updated', { updatedBy: userId, changes: Object.keys(req.body) })

  res.json({ success: true, data: systemSettings })
}))

export default router
