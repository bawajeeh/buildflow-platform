// Admin Dashboard Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  subscription: {
    id: string
    userId: string
    plan: 'FREE' | 'PRO' | 'ENTERPRISE'
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
    currentPeriodStart: Date
    currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean
    createdAt: Date
    updatedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface Website {
  id: string
  userId: string
  name: string
  subdomain: string
  status: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED'
  settings: {
    seo: {
      title: string
      description: string
      keywords: string[]
    }
    analytics: {
      googleAnalyticsId: string
      facebookPixelId: string
      customTrackingCode: string
    }
    theme: {
      primaryColor: string
      secondaryColor: string
      fontFamily: string
      borderRadius: number
    }
  }
  createdAt: Date
  updatedAt: Date
}

export interface Analytics {
  id: string
  websiteId: string
  date: Date
  visitors?: number
  pageViews?: number
  sessions?: number
  bounceRate?: number
  avgSessionDuration?: number
  conversions?: number
}

export interface SystemStats {
  totalUsers: number
  totalWebsites: number
  totalRevenue: number
  activeUsers: number
  systemLoad: number
  databaseSize: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
