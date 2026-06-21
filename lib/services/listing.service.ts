import { PrismaClient, Listing } from '@prisma/client'
import { BaseService } from './base.service'
import { ListingRepository, ListingFilters, ListingSortField } from '../repositories/listing.repository'
import { AgencyPackageRepository } from '../repositories/agency-package.repository'
import { NotFoundError, ValidationError } from '../errors'
import type { PaginationParams, PaginatedResponse, SortOrder } from '../types'
import type { CreateListingInput, UpdateListingInput } from '../validation/schemas'

export class ListingService extends BaseService {
  private repository: ListingRepository
  private agencyPackageRepository: AgencyPackageRepository

  constructor(prisma: PrismaClient) {
    super(prisma)
    this.repository = new ListingRepository(prisma)
    this.agencyPackageRepository = new AgencyPackageRepository(prisma)
  }

  async createListing(
    data: CreateListingInput,
    userId: string,
    agencyId?: string
  ): Promise<Listing> {
    try {
      // Check agency quota if user is part of an agency
      if (agencyId) {
        const activePackage = await this.agencyPackageRepository.findActiveByAgencyId(agencyId)

        if (!activePackage) {
          throw new ValidationError('No active package found for this agency')
        }

        if (!activePackage.isActive) {
          throw new ValidationError('Agency package is not active')
        }

        if (activePackage.validUntil < new Date()) {
          throw new ValidationError('Agency package has expired')
        }

        if (activePackage.usedQuota >= activePackage.listingQuota) {
          throw new ValidationError('Agency listing quota exhausted')
        }
      }

      const slug = await this.generateUniqueSlug(data.title)

      // Use transaction to create listing and increment quota atomically
      const listing = await this.executeInTransaction(async (tx) => {
        const newListing = await tx.listing.create({
          data: {
            title: data.title,
            description: data.description,
            price: data.price,
            area: data.area,
            rooms: data.rooms ?? null,
            floor: data.floor ?? null,
            totalFloors: data.totalFloors ?? null,
            address: data.address,
            district: data.district ?? null,
            city: data.city,
            lat: data.lat ?? null,
            lng: data.lng ?? null,
            phone: data.phone ?? null,
            email: data.email ?? null,
            type: data.type,
            category: data.category,
            slug,
            userId,
            agencyId: agencyId || null,
            status: 'PENDING',
            publishedAt: null,
            rejectionReason: null,
            isFeatured: false,
          },
        })

        // Increment agency quota if applicable
        if (agencyId) {
          const activePackage = await tx.agencyPackage.findFirst({
            where: {
              agencyId,
              isActive: true,
              validUntil: {
                gt: new Date(),
              },
            },
          })

          if (activePackage) {
            await tx.agencyPackage.update({
              where: { id: activePackage.id },
              data: { usedQuota: { increment: 1 } },
            })
          }
        }

        return newListing
      })

      return listing
    } catch (error) {
      this.handleError(error, 'ListingService.createListing')
    }
  }

  async getListingById(id: string, includeRelations = false): Promise<Listing> {
    try {
      const listing = await this.repository.findById(id, includeRelations)
      if (!listing) {
        throw new NotFoundError('Listing', id)
      }
      return listing
    } catch (error) {
      this.handleError(error, 'ListingService.getListingById')
    }
  }

  async getListingBySlug(slug: string, includeRelations = false): Promise<Listing> {
    try {
      const listing = await this.repository.findBySlug(slug, includeRelations)
      if (!listing) {
        throw new NotFoundError('Listing', slug)
      }
      return listing
    } catch (error) {
      this.handleError(error, 'ListingService.getListingBySlug')
    }
  }

  async getListings(
    filters: ListingFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 },
    sortBy: ListingSortField = 'createdAt',
    sortOrder: SortOrder = 'desc'
  ): Promise<PaginatedResponse<Listing>> {
    try {
      const { listings, total } = await this.repository.findMany(
        filters,
        pagination,
        sortBy,
        sortOrder
      )

      return {
        data: listings,
        meta: {
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(total / pagination.limit),
        },
      }
    } catch (error) {
      this.handleError(error, 'ListingService.getListings')
    }
  }

  async updateListing(id: string, data: UpdateListingInput, userId: string): Promise<Listing> {
    try {
      const listing = await this.getListingById(id)

      if (listing.userId !== userId) {
        throw new ValidationError('You can only update your own listings')
      }

      const updateData: Partial<Listing> = { ...data }

      if (data.title && data.title !== listing.title) {
        updateData.slug = await this.generateUniqueSlug(data.title)
      }

      const updated = await this.repository.update(id, updateData)
      return updated
    } catch (error) {
      this.handleError(error, 'ListingService.updateListing')
    }
  }

  async deleteListing(id: string, userId: string): Promise<void> {
    try {
      const listing = await this.getListingById(id)

      if (listing.userId !== userId) {
        throw new ValidationError('You can only delete your own listings')
      }

      // Use transaction to delete listing and decrement quota atomically
      await this.executeInTransaction(async (tx) => {
        await tx.listing.delete({ where: { id } })

        // Decrement agency quota if applicable
        if (listing.agencyId) {
          const activePackage = await tx.agencyPackage.findFirst({
            where: {
              agencyId: listing.agencyId,
              isActive: true,
            },
          })

          if (activePackage && activePackage.usedQuota > 0) {
            await tx.agencyPackage.update({
              where: { id: activePackage.id },
              data: { usedQuota: { decrement: 1 } },
            })
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'ListingService.deleteListing')
    }
  }

  async approveListing(id: string): Promise<Listing> {
    try {
      const listing = await this.repository.update(id, {
        status: 'ACTIVE',
        publishedAt: new Date(),
        rejectionReason: null,
      })
      return listing
    } catch (error) {
      this.handleError(error, 'ListingService.approveListing')
    }
  }

  async rejectListing(id: string, reason: string): Promise<Listing> {
    try {
      const listing = await this.repository.update(id, {
        status: 'REJECTED',
        rejectionReason: reason,
        publishedAt: null,
      })
      return listing
    } catch (error) {
      this.handleError(error, 'ListingService.rejectListing')
    }
  }

  async toggleFeatured(id: string): Promise<Listing> {
    try {
      const listing = await this.getListingById(id)
      const updated = await this.repository.update(id, {
        isFeatured: !listing.isFeatured,
      })
      return updated
    } catch (error) {
      this.handleError(error, 'ListingService.toggleFeatured')
    }
  }

  async incrementViews(id: string): Promise<void> {
    try {
      await this.repository.incrementViews(id)
    } catch (error) {
      this.handleError(error, 'ListingService.incrementViews')
    }
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = this.slugify(title)
    let slug = baseSlug
    let counter = 1

    while (await this.repository.exists(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  private slugify(text: string): string {
    const azerbaijaniMap: Record<string, string> = {
      ə: 'e',
      ı: 'i',
      ö: 'o',
      ü: 'u',
      ğ: 'g',
      ç: 'c',
      ş: 's',
      Ə: 'e',
      İ: 'i',
      Ö: 'o',
      Ü: 'u',
      Ğ: 'g',
      Ç: 'c',
      Ş: 's',
    }

    return text
      .toLowerCase()
      .split('')
      .map((char) => azerbaijaniMap[char] || char)
      .join('')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100)
  }
}
