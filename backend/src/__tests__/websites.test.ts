import request from 'supertest'
import express from 'express'
import websiteRoutes from '../routes/websites'
import { mockPrisma } from './setup'

const app = express()
app.use(express.json())
app.use('/api/websites', websiteRoutes)

// Mock authentication middleware
app.use((req, res, next) => {
  req.user = { id: '1', email: 'test@example.com', role: 'USER' }
  next()
})

describe('Websites Routes', () => {
  describe('GET /api/websites', () => {
    it('should get all websites for authenticated user', async () => {
      const mockWebsites = [
        {
          id: '1',
          userId: '1',
          name: 'Test Website',
          subdomain: 'test-site',
          status: 'PUBLISHED',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]

      mockPrisma.website.findMany.mockResolvedValue(mockWebsites)

      const response = await request(app)
        .get('/api/websites')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockWebsites)
      expect(mockPrisma.website.findMany).toHaveBeenCalledWith({
        where: { userId: '1' },
        include: {
          pages: true,
          media: true,
        },
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  describe('POST /api/websites', () => {
    it('should create a new website', async () => {
      const websiteData = {
        name: 'New Website',
        subdomain: 'new-site'
      }

      const mockWebsite = {
        id: '2',
        userId: '1',
        ...websiteData,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.website.create.mockResolvedValue(mockWebsite)

      const response = await request(app)
        .post('/api/websites')
        .send(websiteData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockWebsite)
      expect(mockPrisma.website.create).toHaveBeenCalledWith({
        data: {
          ...websiteData,
          userId: '1'
        }
      })
    })

    it('should return error for duplicate subdomain', async () => {
      const websiteData = {
        name: 'Duplicate Website',
        subdomain: 'existing-subdomain'
      }

      mockPrisma.website.create.mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint failed'
      })

      const response = await request(app)
        .post('/api/websites')
        .send(websiteData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Subdomain already exists')
    })
  })

  describe('PUT /api/websites/:id', () => {
    it('should update an existing website', async () => {
      const websiteId = '1'
      const updateData = {
        name: 'Updated Website Name'
      }

      const mockUpdatedWebsite = {
        id: websiteId,
        userId: '1',
        name: 'Updated Website Name',
        subdomain: 'test-site',
        status: 'PUBLISHED',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.website.update.mockResolvedValue(mockUpdatedWebsite)

      const response = await request(app)
        .put(`/api/websites/${websiteId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockUpdatedWebsite)
      expect(mockPrisma.website.update).toHaveBeenCalledWith({
        where: {
          id: websiteId,
          userId: '1'
        },
        data: updateData
      })
    })
  })

  describe('DELETE /api/websites/:id', () => {
    it('should delete a website', async () => {
      const websiteId = '1'

      mockPrisma.website.delete.mockResolvedValue({
        id: websiteId,
        userId: '1',
        name: 'Test Website',
        subdomain: 'test-site',
        status: 'PUBLISHED',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const response = await request(app)
        .delete(`/api/websites/${websiteId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(mockPrisma.website.delete).toHaveBeenCalledWith({
        where: {
          id: websiteId,
          userId: '1'
        }
      })
    })
  })
})
