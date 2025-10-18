// Database models and types for the backend

import { PrismaClient } from '@prisma/client'
import { getPrismaClient } from '../services/database'


// Extended Prisma client with custom methods
export class DatabaseService {
  private static instance: DatabaseService
  private prisma: PrismaClient

  private constructor() {
    this.prisma = prisma
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  public getClient(): PrismaClient {
    return this.prisma
  }

  // User methods
  async findUserByEmail(email: string) {
    return this.getPrismaClient().user.findUnique({
      where: { email },
      include: {
        subscription: true,
      },
    })
  }

  async findUserById(id: string) {
    return this.getPrismaClient().user.findUnique({
      where: { id },
      include: {
        subscription: true,
      },
    })
  }

  async createUser(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) {
    return this.getPrismaClient().user.create({
      data: userData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    })
  }

  async updateUser(id: string, userData: any) {
    return this.getPrismaClient().user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        updatedAt: true,
      },
    })
  }

  // Website methods
  async findWebsitesByUserId(userId: string) {
    return this.getPrismaClient().website.findMany({
      where: { userId },
      include: {
        pages: {
          select: {
            id: true,
            name: true,
            slug: true,
            isPublished: true,
          },
        },
        _count: {
          select: {
            pages: true,
            products: true,
            services: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findWebsiteById(id: string, userId: string) {
    return this.getPrismaClient().website.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        pages: true,
        products: true,
        services: true,
      },
    })
  }

  async createWebsite(websiteData: {
    name: string
    domain?: string
    subdomain: string
    userId: string
  }) {
    return this.getPrismaClient().website.create({
      data: websiteData,
    })
  }

  async updateWebsite(id: string, userId: string, updateData: any) {
    return this.getPrismaClient().website.update({
      where: {
        id,
        userId,
      },
      data: updateData,
    })
  }

  async deleteWebsite(id: string, userId: string) {
    return this.getPrismaClient().website.delete({
      where: {
        id,
        userId,
      },
    })
  }

  // Page methods
  async findPagesByWebsiteId(websiteId: string, userId: string) {
    return this.getPrismaClient().page.findMany({
      where: {
        websiteId,
        website: {
          userId,
        },
      },
      include: {
        elements: {
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
        _count: {
          select: {
            elements: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findPageById(pageId: string, websiteId: string, userId: string) {
    return this.getPrismaClient().page.findFirst({
      where: {
        id: pageId,
        websiteId,
        website: {
          userId,
        },
      },
      include: {
        elements: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  }

  async createPage(pageData: {
    name: string
    slug: string
    websiteId: string
  }) {
    return this.getPrismaClient().page.create({
      data: pageData,
    })
  }

  async updatePage(pageId: string, websiteId: string, userId: string, updateData: any) {
    return this.getPrismaClient().page.update({
      where: {
        id: pageId,
        websiteId,
        website: {
          userId,
        },
      },
      data: updateData,
    })
  }

  async deletePage(pageId: string, websiteId: string, userId: string) {
    return this.getPrismaClient().page.delete({
      where: {
        id: pageId,
        websiteId,
        website: {
          userId,
        },
      },
    })
  }

  // Element methods
  async findElementsByPageId(pageId: string, userId: string) {
    return this.getPrismaClient().element.findMany({
      where: {
        pageId,
        page: {
          website: {
            userId,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findElementById(elementId: string, userId: string) {
    return this.getPrismaClient().element.findFirst({
      where: {
        id: elementId,
        page: {
          website: {
            userId,
          },
        },
      },
    })
  }

  async createElement(elementData: {
    type: string
    name: string
    content?: string
    styles?: any
    properties?: any
    pageId: string
  }) {
    return this.getPrismaClient().element.create({
      data: {
        ...elementData,
        order: 0,
      },
    })
  }

  async updateElement(elementId: string, userId: string, updateData: any) {
    return this.getPrismaClient().element.update({
      where: {
        id: elementId,
        page: {
          website: {
            userId,
          },
        },
      },
      data: updateData,
    })
  }

  async deleteElement(elementId: string, userId: string) {
    return this.getPrismaClient().element.delete({
      where: {
        id: elementId,
        page: {
          website: {
            userId,
          },
        },
      },
    })
  }

  // Product methods
  async findProductsByWebsiteId(websiteId: string, userId: string) {
    return this.getPrismaClient().product.findMany({
      where: {
        websiteId,
        website: {
          userId,
        },
      },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createProduct(productData: {
    name: string
    description?: string
    slug: string
    sku: string
    price: number
    comparePrice?: number
    quantity: number
    websiteId: string
  }) {
    return this.getPrismaClient().product.create({
      data: productData,
    })
  }

  // Service methods
  async findServicesByWebsiteId(websiteId: string, userId: string) {
    return this.getPrismaClient().service.findMany({
      where: {
        websiteId,
        website: {
          userId,
        },
      },
      include: {
        staff: true,
        bookings: {
          select: {
            id: true,
            status: true,
            startTime: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createService(serviceData: {
    name: string
    description?: string
    type: string
    duration: number
    price: number
    capacity: number
    websiteId: string
  }) {
    return this.getPrismaClient().service.create({
      data: serviceData,
    })
  }

  // Booking methods
  async findBookingsByWebsiteId(websiteId: string, userId: string) {
    return this.getPrismaClient().booking.findMany({
      where: {
        service: {
          websiteId,
          website: {
            userId,
          },
        },
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    })
  }

  async createBooking(bookingData: {
    websiteId: string
    serviceId: string
    staffId: string
    customerId?: string
    userId?: string
    startTime: Date
    endTime: Date
    status: string
    totalPrice: number
    depositPaid: number
    paymentStatus?: string
    notes?: string
  }) {
    return this.getPrismaClient().booking.create({
      data: bookingData,
    })
  }

  // Analytics methods
  async createAnalyticsEvent(eventData: {
    websiteId: string
    date: Date
    visitors?: number
    pageViews?: number
    sessions?: number
    bounceRate?: number
    avgSessionDuration?: number
    conversions?: number
  }) {
    return this.getPrismaClient().analytics.create({
      data: eventData,
    })
  }

  async getAnalyticsEvents(websiteId: string, userId: string, period: string = '7d') {
    const startDate = new Date()
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 1
    startDate.setDate(startDate.getDate() - days)

    return this.getPrismaClient().analytics.findMany({
      where: {
        websiteId,
        website: {
          userId,
        },
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'desc' },
    })
  }

  // Media methods
  async findMediaByUserId(userId: string) {
    return this.getPrismaClient().media.findMany({
      where: {
        website: {
          userId,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createMedia(mediaData: {
    websiteId: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    path: string
    url: string
    type?: string
    alt?: string
    description?: string
  }) {
    return this.getPrismaClient().media.create({
      data: mediaData,
    })
  }

  async deleteMedia(mediaId: string, userId: string) {
    return this.getPrismaClient().media.delete({
      where: {
        id: mediaId,
        website: {
          userId,
        },
      },
    })
  }

  // Template methods
  async findTemplates() {
    return this.getPrismaClient().template.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findTemplateById(templateId: string) {
    return this.getPrismaClient().template.findUnique({
      where: {
        id: templateId,
        isActive: true,
      },
    })
  }

  // Transaction methods
  async withTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.getPrismaClient().$transaction(callback)
  }

  // Cleanup methods
  async cleanup() {
    await this.getPrismaClient().$disconnect()
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance()

// Export types
export type DatabaseServiceType = DatabaseService
export type PrismaClientType = PrismaClient
