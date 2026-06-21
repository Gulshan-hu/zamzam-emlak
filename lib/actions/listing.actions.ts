'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { ListingService } from '@/lib/services/listing.service'
import {
  createListingSchema,
  updateListingSchema,
  listingFiltersSchema,
  paginationSchema,
  type CreateListingInput,
  type UpdateListingInput,
  type ListingFiltersInput,
  type PaginationInput,
} from '@/lib/validation/schemas'
import { ValidationError } from '@/lib/errors'
import type { ActionResponse, PaginatedResponse, Listing } from '@/lib/types'

const listingService = new ListingService(prisma)

export async function createListingAction(
  data: CreateListingInput,
  userId: string
): Promise<ActionResponse<Listing>> {
  try {
    const validated = createListingSchema.parse(data)
    const listing = await listingService.createListing(validated, userId)

    revalidatePath('/listings')
    revalidatePath('/dashboard/listings')

    return { success: true, data: listing }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, error: error.message, code: error.code }
    }
    return { success: false, error: 'Failed to create listing' }
  }
}

export async function updateListingAction(
  id: string,
  data: UpdateListingInput,
  userId: string
): Promise<ActionResponse<Listing>> {
  try {
    const validated = updateListingSchema.parse(data)
    const listing = await listingService.updateListing(id, validated, userId)

    revalidatePath('/listings')
    revalidatePath(`/listings/${listing.slug}`)
    revalidatePath('/dashboard/listings')

    return { success: true, data: listing }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, error: error.message, code: error.code }
    }
    return { success: false, error: 'Failed to update listing' }
  }
}

export async function deleteListingAction(
  id: string,
  userId: string
): Promise<ActionResponse> {
  try {
    await listingService.deleteListing(id, userId)

    revalidatePath('/listings')
    revalidatePath('/dashboard/listings')

    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, error: error.message, code: error.code }
    }
    return { success: false, error: 'Failed to delete listing' }
  }
}

export async function getListingsAction(
  filters: Partial<ListingFiltersInput> = {},
  pagination: PaginationInput = { page: 1, limit: 20 }
): Promise<ActionResponse<PaginatedResponse<Listing>>> {
  try {
    const validatedFilters = listingFiltersSchema.parse({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...filters,
    })
    const validatedPagination = paginationSchema.parse(pagination)

    const { sortBy, sortOrder, ...restFilters } = validatedFilters

    const result = await listingService.getListings(
      restFilters,
      validatedPagination,
      sortBy,
      sortOrder
    )

    return { success: true, data: result }
  } catch (err) {
    console.error('Failed to fetch listings:', err)

    // Check if it's a database connection error
    if (err && typeof err === 'object' && 'code' in err) {
      const error = err as { code?: string; message?: string }
      if (error.code === 'P1001' || error.code === 'P1000') {
        return {
          success: false,
          error: 'Verilənlər bazası ilə əlaqə qurula bilmədi. Zəhmət olmasa bir az sonra yenidən cəhd edin.',
          code: 'DATABASE_CONNECTION_ERROR'
        }
      }
    }

    return { success: false, error: 'Elanları yükləmək mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.' }
  }
}

export async function getListingBySlugAction(
  slug: string
): Promise<ActionResponse<Listing>> {
  try {
    const listing = await listingService.getListingBySlug(slug, true)

    await listingService.incrementViews(listing.id)

    return { success: true, data: listing }
  } catch (err) {
    console.error('Listing not found:', err)
    return { success: false, error: 'Listing not found' }
  }
}

export async function approveListingAction(id: string): Promise<ActionResponse<Listing>> {
  try {
    const listing = await listingService.approveListing(id)

    revalidatePath('/listings')
    revalidatePath(`/listings/${listing.slug}`)
    revalidatePath('/admin/listings')

    return { success: true, data: listing }
  } catch (err) {
    console.error('Failed to approve listing:', err)
    return { success: false, error: 'Failed to approve listing' }
  }
}

export async function rejectListingAction(
  id: string,
  reason: string
): Promise<ActionResponse<Listing>> {
  try {
    const listing = await listingService.rejectListing(id, reason)

    revalidatePath('/admin/listings')
    revalidatePath('/dashboard/listings')

    return { success: true, data: listing }
  } catch (err) {
    console.error('Failed to reject listing:', err)
    return { success: false, error: 'Failed to reject listing' }
  }
}

export async function toggleFeaturedAction(id: string): Promise<ActionResponse<Listing>> {
  try {
    const listing = await listingService.toggleFeatured(id)

    revalidatePath('/listings')
    revalidatePath(`/listings/${listing.slug}`)
    revalidatePath('/admin/listings')

    return { success: true, data: listing }
  } catch (err) {
    console.error('Failed to toggle featured status:', err)
    return { success: false, error: 'Failed to toggle featured status' }
  }
}
