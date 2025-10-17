import { Router } from 'express'
import { getPrismaClient } from '../services/database'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()
const prisma = getPrismaClient()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/media'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|mp4|webm|pdf|doc|docx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// Get all media files
router.get('/', async (req, res) => {
  try {
    const { websiteId, type, page = 1, limit = 20 } = req.query
    
    const where: any = {}
    if (websiteId) where.websiteId = websiteId
    if (type) where.type = type
    
    const skip = (Number(page) - 1) * Number(limit)
    
    const media = await prisma.media.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    })
    
    const total = await prisma.media.count({ where })
    
    res.json({
      media,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media files' })
  }
})

// Upload media file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    
    const { websiteId, type = 'image', alt, description } = req.body
    
    const media = await prisma.media.create({
      data: {
        websiteId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        type,
        alt,
        description,
        url: `/uploads/media/${req.file.filename}`,
      },
    })
    
    res.status(201).json(media)
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload media file' })
  }
})

// Upload multiple files
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No files uploaded' })
    }
    
    const { websiteId, type = 'image' } = req.body
    
    const mediaFiles = await Promise.all(
      req.files.map(async (file) => {
        return await prisma.media.create({
          data: {
            websiteId,
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            type,
            url: `/uploads/media/${file.filename}`,
          },
        })
      })
    )
    
    res.status(201).json(mediaFiles)
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload media files' })
  }
})

// Get media by ID
router.get('/:id', async (req, res) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: req.params.id },
    })
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' })
    }
    
    res.json(media)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media' })
  }
})

// Update media
router.put('/:id', async (req, res) => {
  try {
    const { alt, description, type } = req.body
    
    const media = await prisma.media.update({
      where: { id: req.params.id },
      data: {
        alt,
        description,
        type,
      },
    })
    
    res.json(media)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update media' })
  }
})

// Delete media
router.delete('/:id', async (req, res) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: req.params.id },
    })
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' })
    }
    
    // Delete file from filesystem
    if (fs.existsSync(media.path)) {
      fs.unlinkSync(media.path)
    }
    
    // Delete from database
    await prisma.media.delete({
      where: { id: req.params.id },
    })
    
    res.json({ message: 'Media deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete media' })
  }
})

// Serve media files
router.get('/serve/:filename', (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join('uploads/media', filename)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }
    
    res.sendFile(path.resolve(filePath))
  } catch (error) {
    res.status(500).json({ error: 'Failed to serve media file' })
  }
})

export default router
