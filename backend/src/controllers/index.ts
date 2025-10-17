// Base controller class for common functionality

import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError, asyncHandler } from '../utils'

const prisma = new PrismaClient()

export abstract class BaseController {
  protected prisma = prisma

  // Generic CRUD operations
  protected async findAll<T>(
    model: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, limit = 10, ...filters } = req.query
      const offset = (Number(page) - 1) * Number(limit)

      const [data, total] = await Promise.all([
        model.findMany({
          where: filters,
          skip: offset,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        model.count({ where: filters }),
      ])

      res.json({
        success: true,
        data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      next(error)
    }
  }

  protected async findOne<T>(
    model: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params
      const data = await model.findUnique({
        where: { id },
      })

      if (!data) {
        throw new AppError('Resource not found', 404)
      }

      res.json({
        success: true,
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  protected async create<T>(
    model: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await model.create({
        data: req.body,
      })

      res.status(201).json({
        success: true,
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  protected async update<T>(
    model: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params
      const data = await model.update({
        where: { id },
        data: req.body,
      })

      res.json({
        success: true,
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  protected async delete<T>(
    model: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params
      await model.delete({
        where: { id },
      })

      res.json({
        success: true,
        message: 'Resource deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  // Helper method to wrap async functions
  protected wrapAsync = asyncHandler
}

// User Controller
export class UserController extends BaseController {
  public getProfile = this.wrapAsync(async (req: Request, res: Response) => {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json({
      success: true,
      data: user,
    })
  })

  public updateProfile = this.wrapAsync(async (req: Request, res: Response) => {
    const { firstName, lastName, avatar } = req.body

    const user = await this.prisma.user.update({
      where: { id: req.user?.id },
      data: {
        firstName,
        lastName,
        avatar,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        updatedAt: true,
      },
    })

    res.json({
      success: true,
      data: user,
    })
  })
}

// Website Controller
export class WebsiteController extends BaseController {
  public getWebsites = this.wrapAsync(async (req: Request, res: Response) => {
    const websites = await this.prisma.website.findMany({
      where: { userId: req.user?.id },
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
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({
      success: true,
      data: websites,
    })
  })

  public getWebsite = this.wrapAsync(async (req: Request, res: Response) => {
    const { id } = req.params

    const website = await this.prisma.website.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
      include: {
        pages: true,
        products: true,
        services: true,
      },
    })

    if (!website) {
      throw new AppError('Website not found', 404)
    }

    res.json({
      success: true,
      data: website,
    })
  })

  public createWebsite = this.wrapAsync(async (req: Request, res: Response) => {
    const { name, domain, subdomain } = req.body

    const website = await this.prisma.website.create({
      data: {
        name,
        domain,
        subdomain,
        userId: req.user?.id!,
      },
    })

    res.status(201).json({
      success: true,
      data: website,
    })
  })

  public updateWebsite = this.wrapAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const updateData = req.body

    const website = await this.prisma.website.update({
      where: {
        id,
        userId: req.user?.id,
      },
      data: updateData,
    })

    res.json({
      success: true,
      data: website,
    })
  })

  public deleteWebsite = this.wrapAsync(async (req: Request, res: Response) => {
    const { id } = req.params

    await this.prisma.website.delete({
      where: {
        id,
        userId: req.user?.id,
      },
    })

    res.json({
      success: true,
      message: 'Website deleted successfully',
    })
  })

  public publishWebsite = this.wrapAsync(async (req: Request, res: Response) => {
    const { id } = req.params

    const website = await this.prisma.website.update({
      where: {
        id,
        userId: req.user?.id,
      },
      data: {
        status: 'PUBLISHED',
      },
    })

    res.json({
      success: true,
      data: website,
    })
  })
}

// Page Controller
export class PageController extends BaseController {
  public getPages = this.wrapAsync(async (req: Request, res: Response) => {
    const { websiteId } = req.params

    const pages = await this.prisma.page.findMany({
      where: {
        websiteId,
        website: {
          userId: req.user?.id,
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

    res.json({
      success: true,
      data: pages,
    })
  })

  public getPage = this.wrapAsync(async (req: Request, res: Response) => {
    const { websiteId, pageId } = req.params

    const page = await this.prisma.page.findFirst({
      where: {
        id: pageId,
        websiteId,
        website: {
          userId: req.user?.id,
        },
      },
      include: {
        elements: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!page) {
      throw new AppError('Page not found', 404)
    }

    res.json({
      success: true,
      data: page,
    })
  })

  public createPage = this.wrapAsync(async (req: Request, res: Response) => {
    const { websiteId } = req.params
    const { name, slug } = req.body

    const page = await this.prisma.page.create({
      data: {
        name,
        slug,
        websiteId,
      },
    })

    res.status(201).json({
      success: true,
      data: page,
    })
  })

  public updatePage = this.wrapAsync(async (req: Request, res: Response) => {
    const { websiteId, pageId } = req.params
    const updateData = req.body

    const page = await this.prisma.page.update({
      where: {
        id: pageId,
        websiteId,
        website: {
          userId: req.user?.id,
        },
      },
      data: updateData,
    })

    res.json({
      success: true,
      data: page,
    })
  })

  public deletePage = this.wrapAsync(async (req: Request, res: Response) => {
    const { websiteId, pageId } = req.params

    await this.prisma.page.delete({
      where: {
        id: pageId,
        websiteId,
        website: {
          userId: req.user?.id,
        },
      },
    })

    res.json({
      success: true,
      message: 'Page deleted successfully',
    })
  })
}

// Element Controller
export class ElementController extends BaseController {
  public getElements = this.wrapAsync(async (req: Request, res: Response) => {
    const { pageId } = req.params

    const elements = await this.prisma.element.findMany({
      where: {
        pageId,
        page: {
          website: {
            userId: req.user?.id,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    res.json({
      success: true,
      data: elements,
    })
  })

  public createElement = this.wrapAsync(async (req: Request, res: Response) => {
    const { pageId } = req.params
    const elementData = req.body

    const element = await this.prisma.element.create({
      data: {
        ...elementData,
        pageId,
        order: 0,
      },
    })

    res.status(201).json({
      success: true,
      data: element,
    })
  })

  public updateElement = this.wrapAsync(async (req: Request, res: Response) => {
    const { elementId } = req.params
    const updateData = req.body

    const element = await this.prisma.element.update({
      where: {
        id: elementId,
        page: {
          website: {
            userId: req.user?.id,
          },
        },
      },
      data: updateData,
    })

    res.json({
      success: true,
      data: element,
    })
  })

  public deleteElement = this.wrapAsync(async (req: Request, res: Response) => {
    const { elementId } = req.params

    await this.prisma.element.delete({
      where: {
        id: elementId,
        page: {
          website: {
            userId: req.user?.id,
          },
        },
      },
    })

    res.json({
      success: true,
      message: 'Element deleted successfully',
    })
  })
}
