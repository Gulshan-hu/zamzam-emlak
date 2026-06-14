import type { Listing, ListingWithRelations } from '@/lib/types'

export type ListingCardProps = {
  listing: Listing
  onFavorite?: (id: string) => void
  isFavorited?: boolean
}

export type ListingDetailProps = {
  listing: ListingWithRelations
}

export type ListingFilters = {
  status?: string
  type?: string
  category?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
}

export type ListingFiltersProps = {
  onFilterChange: (filters: ListingFilters) => void
  initialFilters?: ListingFilters
}

export type ListingFormData = {
  title: string
  description: string
  price: number
  area: number
  rooms?: number | null
  floor?: number | null
  totalFloors?: number | null
  address: string
  district?: string | null
  city: string
  lat?: number | null
  lng?: number | null
  phone?: string | null
  email?: string | null
  type: 'SALE' | 'RENT'
  category: 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL'
}
