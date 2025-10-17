import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Get analytics for a website
router.get('/website/:websiteId', async (req, res) => {
  try {
    const { websiteId } = req.params
    const { startDate, endDate, groupBy = 'day' } = req.query
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate as string) : new Date()
    
    const analytics = await prisma.analytics.findMany({
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
    
    res.json({
      analytics,
      summary,
      period: { start, end },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

// Create analytics entry
router.post('/', async (req, res) => {
  try {
    const { 
      websiteId, 
      date, 
      visitors, 
      pageViews, 
      sessions, 
      bounceRate, 
      avgSessionDuration, 
      conversions, 
      revenue 
    } = req.body
    
    const analytics = await prisma.analytics.upsert({
      where: {
        websiteId_date: {
          websiteId,
          date: new Date(date),
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
        date: new Date(date),
        visitors,
        pageViews,
        sessions,
        bounceRate,
        avgSessionDuration,
        conversions,
        revenue,
      },
    })
    
    res.status(201).json(analytics)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create analytics entry' })
  }
})

// Get real-time analytics
router.get('/realtime/:websiteId', async (req, res) => {
  try {
    const { websiteId } = req.params
    
    // Get today's analytics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayAnalytics = await prisma.analytics.findUnique({
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
    
    res.json(realtimeData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch real-time analytics' })
  }
})

// Get analytics summary
router.get('/summary/:websiteId', async (req, res) => {
  try {
    const { websiteId } = req.params
    const { period = '30d' } = req.query
    
    let days = 30
    if (period === '7d') days = 7
    if (period === '90d') days = 90
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const analytics = await prisma.analytics.findMany({
      where: {
        websiteId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    })
    
    const summary = {
      period,
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
      conversionRate: analytics.length > 0 
        ? (analytics.reduce((sum, a) => sum + a.conversions, 0) / analytics.reduce((sum, a) => sum + a.visitors, 0)) * 100 
        : 0,
      dailyData: analytics,
    }
    
    res.json(summary)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics summary' })
  }
})

export default router
