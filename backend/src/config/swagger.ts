import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'
import { logger } from '../utils/logger'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BuildFlow API',
      version: '1.0.0',
      description: 'BuildFlow - Drag & Drop Website Builder API Documentation',
      contact: {
        name: 'BuildFlow Team',
        email: 'support@buildflow.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server',
      },
      {
        url: 'https://api.buildflow.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
            subscription: {
              $ref: '#/components/schemas/Subscription',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            plan: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE'] },
            status: { type: 'string', enum: ['ACTIVE', 'CANCELLED', 'PAST_DUE'] },
            currentPeriodStart: { type: 'string', format: 'date-time' },
            currentPeriodEnd: { type: 'string', format: 'date-time' },
            cancelAtPeriodEnd: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Website: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            name: { type: 'string' },
            subdomain: { type: 'string' },
            status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'SUSPENDED'] },
            settings: {
              type: 'object',
              properties: {
                seo: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    keywords: { type: 'array', items: { type: 'string' } },
                  },
                },
                analytics: {
                  type: 'object',
                  properties: {
                    googleAnalyticsId: { type: 'string' },
                    facebookPixelId: { type: 'string' },
                    customTrackingCode: { type: 'string' },
                  },
                },
                theme: {
                  type: 'object',
                  properties: {
                    primaryColor: { type: 'string' },
                    secondaryColor: { type: 'string' },
                    fontFamily: { type: 'string' },
                    borderRadius: { type: 'number' },
                  },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Page: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            websiteId: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Element: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            pageId: { type: 'string' },
            type: { type: 'string' },
            content: { type: 'object' },
            styles: { type: 'object' },
            position: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            websiteId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            slug: { type: 'string' },
            sku: { type: 'string' },
            price: { type: 'number' },
            comparePrice: { type: 'number' },
            quantity: { type: 'number' },
            isPublished: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            websiteId: { type: 'string' },
            customerId: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
            total: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API files
}

const specs = swaggerJsdoc(options)

export const setupSwagger = (app: Express) => {
  // Temporarily disabled due to TypeScript compatibility issues
  // TODO: Fix Swagger UI TypeScript integration
  logger.info('Swagger documentation setup skipped due to TypeScript issues')
}
