'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getListingsAction,
  getListingBySlugAction,
  createListingAction,
  updateListingAction,
  deleteListingAction,
} from '@/lib/actions'
import type {
  CreateListingInput,
  UpdateListingInput,
  ListingFiltersInput,
  PaginationInput,
} from '@/lib/validation'
import type { Listing, PaginatedResponse } from '@/lib/types'

export function useListings(
  filters?: ListingFiltersInput,
  pagination?: PaginationInput
) {
  return useQuery({
    queryKey: ['listings', filters, pagination],
    queryFn: async () => {
      const result = await getListingsAction(filters, pagination)
      if (!result.success) throw new Error(result.error)
      return result.data as PaginatedResponse<Listing>
    },
  })
}

export function useListingBySlug(slug: string) {
  return useQuery({
    queryKey: ['listing', slug],
    queryFn: async () => {
      const result = await getListingBySlugAction(slug)
      if (!result.success) throw new Error(result.error)
      return result.data as Listing
    },
    enabled: !!slug,
  })
}

export function useCreateListing(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateListingInput) => {
      const result = await createListingAction(data, userId)
      if (!result.success) throw new Error(result.error)
      return result.data as Listing
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}

export function useUpdateListing(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateListingInput }) => {
      const result = await updateListingAction(id, data, userId)
      if (!result.success) throw new Error(result.error)
      return result.data as Listing
    },
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['listing', listing.slug] })
    },
  })
}

export function useDeleteListing(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteListingAction(id, userId)
      if (!result.success) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}
