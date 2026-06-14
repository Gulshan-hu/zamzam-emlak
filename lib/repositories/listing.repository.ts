import { PrismaClient, Listing, ListingStatus, ListingType, ListingCategory } from '@prisma/client'
import { BaseRepository } from './base.repository'
import type { PaginationParams, SortOrder } from '../types'

export type ListingFilters = {
  status?: ListingStatus
  type?: ListingType
  category?: ListingCategory
  city?: string
  district?: string
  userId?: string
  agencyId?: string
  isFeatured?: boolean
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  rooms?: number
}

export type ListingSortField =
  | 'createdAt'
  | 'price'
  | 'area'
  | 'views'
  | 'publishedAt'

export class ListingRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma)
  }

  async create(data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<Listing> {
    try {
      return await this.prisma.listing.create({ data })
    } catch (error) {
      this.handleError(error, 'ListingRepository.create')
    }
  }

  async findById(id: string, includeRelations = false): Promise<Listing | null> {
    try {
      return await this.prisma.listing.findUnique({
        where: { id },
        include: includeRelations ? {
          user: true,
          agency: true,
          images: { orderBy: { order: 'asc' } },
          aiAnalysis: true,
        } : undefined,
      })
    } catch (error) {
      this.handleError(error, 'ListingRepository.findById')
    }
  }

  async findBySlug(slug: string, includeRelations = false): Promise<Listing | null> {
    try {
      return await this.prisma.listing.findUnique({
        where: { slug },
        include: includeRelations ? {
          user: true,
          agency: true,
          images: { orderBy: { order: 'asc' } },
          aiAnalysis: true,
        } : undefined,
      })
    } catch (error) {
      this.handleError(error, 'ListingRepository.findBySlug')
    }
  }

  async findMany(
    filters: ListingFilters = {},
    pagination?: PaginationParams,
    sortBy: ListingSortField = 'createdAt',
    sortOrder: SortOrder = 'desc'
  ): Promise<{ listings: Listing[]; total: number }> {
    try {
      const where: Record<string, unknown> = {}

      if (filters.status) where.status = filters.status
      if (filters.type) where.type = filters.type
      if (filters.category) where.category = filters.category
      if (filters.city) where.city = filters.city
      if (filters.district) where.district = filters.district
      if (filters.userId) where.userId = filters.userId
      if (filters.agencyId) where.agencyId = filters.agencyId
      if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured

      if (filters.minPrice || filters.maxPrice) {
        where.price = {
          ...(filters.minPrice && { gte: filters.minPrice }),
          ...(filters.maxPrice && { lte: filters.maxPrice }),
        }
      }

      if (filters.minArea || filters.maxArea) {
        where.area = {
          ...(filters.minArea && { gte: filters.minArea }),
          ...(filters.maxArea && { lte: filters.maxArea }),
        }
      }

      if (filters.rooms) where.rooms = filters.rooms

      const [listings, total] = await Promise.all([
        this.prisma.listing.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
          take: pagination?.limit,
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
          },
        }),
        this.prisma.listing.count({ where }),
      ])

      return { listings, total }
    } catch (error) {
      this.handleError(error, 'ListingRepository.findMany')
    }
  }

  async update(id: string, data: Partial<Listing>): Promise<Listing> {
    try {
      return await this.prisma.listing.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.handleError(error, 'ListingRepository.update')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.listing.delete({ where: { id } })
    } catch (error) {
      this.handleError(error, 'ListingRepository.delete')
    }
  }

  async incrementViews(id: string): Promise<void> {
    try {
      await this.prisma.listing.update({
        where: { id },
        data: { views: { increment: 1 } },
      })
    } catch (error) {
      this.handleError(error, 'ListingRepository.incrementViews')
    }
  }

  async exists(slug: string): Promise<boolean> {
    try {
      const count = await this.prisma.listing.count({ where: { slug } })
      return count > 0
    } catch (error) {
      this.handleError(error, 'ListingRepository.exists')
    }
  }
}
