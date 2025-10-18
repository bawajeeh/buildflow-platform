import { Router } from 'express'
import { getPrismaClient } from '../services/database'

const router = Router()

// Get website settings
router.get('/website/:websiteId', async (req, res) => {
  try {
    const settings = await getPrismaClient().websiteSettings.findUnique({
      where: { websiteId: req.params.websiteId },
    })
    
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' })
    }
    
    res.json(settings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// Update website settings
router.put('/website/:websiteId', async (req, res) => {
  try {
    const { 
      seoTitle, 
      seoDescription, 
      seoKeywords, 
      ogImage,
      googleAnalyticsId,
      facebookPixelId,
      customTrackingCode,
      primaryColor,
      secondaryColor,
      fontFamily,
      borderRadius
    } = req.body
    
    const settings = await getPrismaClient().websiteSettings.upsert({
      where: { websiteId: req.params.websiteId },
      update: {
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        googleAnalyticsId,
        facebookPixelId,
        customTrackingCode,
        primaryColor,
        secondaryColor,
        fontFamily,
        borderRadius,
      },
      create: {
        websiteId: req.params.websiteId,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        googleAnalyticsId,
        facebookPixelId,
        customTrackingCode,
        primaryColor: primaryColor || '#3b82f6',
        secondaryColor: secondaryColor || '#64748b',
        fontFamily: fontFamily || 'Inter',
        borderRadius: borderRadius || 8,
      },
    })
    
    res.json(settings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

// Get user settings
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await getPrismaClient().user.findUnique({
      where: { id: req.params.userId },
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
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user settings' })
  }
})

// Update user settings
router.put('/user/:userId', async (req, res) => {
  try {
    const { firstName, lastName, avatar } = req.body
    
    const user = await getPrismaClient().user.update({
      where: { id: req.params.userId },
      data: {
        firstName,
        lastName,
        avatar,
      },
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
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user settings' })
  }
})

// Get subscription settings
router.get('/subscription/:userId', async (req, res) => {
  try {
    const subscription = await getPrismaClient().subscription.findUnique({
      where: { userId: req.params.userId },
    })
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }
    
    res.json(subscription)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' })
  }
})

// Update subscription settings
router.put('/subscription/:userId', async (req, res) => {
  try {
    const { plan, status, cancelAtPeriodEnd } = req.body
    
    const subscription = await getPrismaClient().subscription.update({
      where: { userId: req.params.userId },
      data: {
        plan,
        status,
        cancelAtPeriodEnd,
      },
    })
    
    res.json(subscription)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' })
  }
})

// Get system settings (admin only)
router.get('/system', async (req, res) => {
  try {
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
    
    res.json(systemSettings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system settings' })
  }
})

// Update system settings (admin only)
router.put('/system', async (req, res) => {
  try {
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
    
    res.json(systemSettings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update system settings' })
  }
})

export default router
