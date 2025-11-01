import { Router } from 'express'
import { z } from 'zod'
import { getPrismaClient } from '../services/database'
import { logger } from '../utils/logger'
import { asyncHandler, createError } from '../utils/errorHandler'
import { validateParams, validateQuery, validateRequest } from '../middleware/validation'
import { authMiddleware } from '../middleware/auth'
import { websiteIdParamsSchema, analyticsQuerySchema, createAnalyticsSchema } from '../validations/analytics'

const router = Router()

// Get analytics for a website - Requires authentication and ownership check
router.get('/website/:websiteId', authMiddleware, validateParams(websiteIdParamsSchema), validateQuery(analyticsQuerySchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const { websiteId } = req.params
  const { startDate, endDate, groupBy = 'day' } = req.query

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
  
  const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = endDate ? new Date(endDate as string) : new Date()
  
  const analytics = await getPrismaClient().analytics.findMany({
    where: {
      websiteId,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { date: 'asc' },
  })
  
  // Calculate summary statistics
  const summary = {
    totalVisitors: analytics.reduce((sum, a) => sum + a.visitors, 0),
    totalPageViews: analytics.reduce((sum, a) => sum + a.pageViews, 0),
    totalSessions: analytics.reduce((sum, a) => sum + a.sessions, 0),
    totalConversions: analytics.reduce((sum, a) => sum + a.conversions, 0),
    totalRevenue: analytics.reduce((sum, a) => sum + a.revenue, 0),
    averageBounceRate: analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.bounceRate, 0) / analytics.length 
      : 0,
    averageSessionDuration: analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.avgSessionDuration, 0) / analytics.length 
      : 0,
  }
  
  logger.debug('Analytics fetched', { websiteId, userId, recordCount: analytics.length })

  res.json({
    success: true,
    data: {
      analytics,
      summary,
      period: { start, end },
    },
  })
}))

// Create analytics entry - Requires authentication and ownership check
router.post('/', authMiddleware, validateRequest(createAnalyticsSchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const { 
    websiteId, 
    date, 
    visitors = 0, 
    pageViews = 0, 
    sessions = 0, 
    bounceRate = 0, 
    avgSessionDuration = 0, 
    conversions = 0, 
    revenue = 0 
  } = req.body

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
  
  const analytics = await getPrismaClient().analytics.upsert({
    where: {
      websiteId_date: {
        websiteId,
        date: date instanceof Date ? date : new Date(date),
      },
    },
    update: {
      visitors,
      pageViews,
      sessions,
      bounceRate,
      avgSessionDuration,
      conversions,
      revenue,
    },
    create: {
      websiteId,
      date: date instanceof Date ? date : new Date(date),
      visitors,
      pageViews,
      sessions,
      bounceRate,
      avgSessionDuration,
      conversions,
      revenue,
    },
  })
  
  logger.info('Analytics entry created', { analyticsId: analytics.id, websiteId, userId })

  res.status(201).json({ success: true, data: analytics })
}))

// Get real-time analytics - Requires authentication and ownership check
router.get('/realtime/:websiteId', authMiddleware, validateParams(websiteIdParamsSchema), asyncHandler(async (req, res) => {
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
  
  // Get today's analytics
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayAnalytics = await getPrismaClient().analytics.findUnique({
    where: {
      websiteId_date: {
        websiteId,
        date: today,
      },
    },
  })
  
  // Mock real-time data (in production, this would come from a real-time analytics service)
  const realtimeData = {
    currentVisitors: Math.floor(Math.random() * 50) + 10,
    pageViewsToday: todayAnalytics?.pageViews || 0,
    sessionsToday: todayAnalytics?.sessions || 0,
    conversionsToday: todayAnalytics?.conversions || 0,
    revenueToday: todayAnalytics?.revenue || 0,
    topPages: [
      { page: '/', views: 150, uniqueViews: 120 },
      { page: '/products', views: 80, uniqueViews: 65 },
      { page: '/about', views: 45, uniqueViews: 40 },
    ],
    trafficSources: [
      { source: 'Google', visitors: 60, percentage: 45 },
      { source: 'Direct', visitors: 30, percentage: 22 },
      { source: 'Social', visitors: 25, percentage: 18 },
      { source: 'Email', visitors: 20, percentage: 15 },
    ],
    deviceTypes: [
      { device: 'Desktop', visitors: 80, percentage: 60 },
      { device: 'Mobile', visitors: 45, percentage: 33 },
      { device: 'Tablet', visitors: 10, percentage: 7 },
    ],
  }
  
  logger.debug('Real-time analytics fetched', { websiteId, userId })

  res.json({ success: true, data: realtimeData })
}))

// Get analytics summary - Requires authentication and ownership check
router.get('/summary/:websiteId', authMiddleware, validateParams(websiteIdParamsSchema), validateQuery(analyticsQuerySchema), asyncHandler(async (req, res) => {
  const userId = req.user?.id
  if (!userId) {
    throw createError('User not authenticated', 401, 'UNAUTHORIZED')
  }

  const { websiteId } = req.params
  const { period = '30d' } = req.query

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
  
  let days = 30
  if (period === '7d') days = 7
  if (period === '90d') days = 90
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  const analytics = await getPrismaClient().analytics.findMany({
    where: {
      websiteId,
      date: {
        gte: startDate,
      },
    },
    orderBy: { date: 'asc' },
  })
  
  const totalVisitors = analytics.reduce((sum, a) => sum + a.visitors, 0)
  const summary = {
    period,
    totalVisitors,
    totalPageViews: analytics.reduce((sum, a) => sum + a.pageViews, 0),
    totalSessions: analytics.reduce((sum, a) => sum + a.sessions, 0),
    totalConversions: analytics.reduce((sum, a) => sum + a.conversions, 0),
    totalRevenue: analytics.reduce((sum, a) => sum + a.revenue, 0),
    averageBounceRate: analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.bounceRate, 0) / analytics.length 
      : 0,
    averageSessionDuration: analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.avgSessionDuration, 0) / analytics.length 
      : 0,
    conversionRate: totalVisitors > 0 
      ? (analytics.reduce((sum, a) => sum + a.conversions, 0) / totalVisitors) * 100 
      : 0,
    dailyData: analytics,
  }
  
  logger.debug('Analytics summary fetched', { websiteId, userId, period })

  res.json({ success: true, data: summary })
}))

export default router
