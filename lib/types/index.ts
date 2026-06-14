export type UserRole = 'ADMIN' | 'AGENCY_OWNER' | 'AGENT' | 'USER'
export type ListingType = 'SALE' | 'RENT'
export type ListingCategory = 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL'
export type ListingStatus = 'PENDING' | 'ACTIVE' | 'REJECTED'
export type AISearchStatus = 'PENDING' | 'COMPLETED'

export type User = {
  id: string
  email: string
  phone: string | null
  name: string
  avatar: string | null
  role: UserRole
  agencyId: string | null
  isBlocked: boolean
  createdAt: Date
}

export type Agency = {
  id: string
  name: string
  logo: string | null
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  isVerified: boolean
  createdAt: Date
}

export type AgencyPackage = {
  id: string
  agencyId: string
  name: string
  listingQuota: number
  usedQuota: number
  priceAZN: number
  validUntil: Date
  isActive: boolean
  createdAt: Date
}

export type Listing = {
  id: string
  slug: string
  title: string
  description: string
  price: number
  area: number
  rooms: number | null
  floor: number | null
  totalFloors: number | null
  address: string
  district: string | null
  city: string
  lat: number | null
  lng: number | null
  phone: string | null
  email: string | null
  type: ListingType
  category: ListingCategory
  status: ListingStatus
  publishedAt: Date | null
  rejectionReason: string | null
  isFeatured: boolean
  views: number
  userId: string
  agencyId: string | null
  createdAt: Date
  updatedAt: Date
}

export type ListingImage = {
  id: string
  listingId: string
  url: string
  order: number
}

export type SavedListing = {
  id: string
  userId: string
  listingId: string
  createdAt: Date
}

export type AIAnalysis = {
  id: string
  listingId: string
  rentalYield: number | null
  paybackYears: number | null
  marketComparison: string | null
  liquidityScore: number | null
  summary: string
  recommendation: string
  createdAt: Date
}

export type AISearchRequest = {
  id: string
  userId: string
  imageUrl: string | null
  description: string | null
  address: string | null
  status: AISearchStatus
  createdAt: Date
}

export type ListingWithRelations = Listing & {
  user: User
  agency: Agency | null
  images: ListingImage[]
}

export type UserWithAgency = User & {
  agency: Agency | null
}

export type AgencyWithPackages = Agency & {
  packages: AgencyPackage[]
}

export type PaginationParams = {
  page: number
  limit: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type SortOrder = 'asc' | 'desc'

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
