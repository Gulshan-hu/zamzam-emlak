import { z } from 'zod'

export const userRoleSchema = z.enum(['ADMIN', 'AGENCY_OWNER', 'AGENT', 'USER'])

export const listingTypeSchema = z.enum(['SALE', 'RENT'])

export const listingCategorySchema = z.enum(['APARTMENT', 'HOUSE', 'LAND', 'COMMERCIAL'])

export const listingStatusSchema = z.enum(['PENDING', 'ACTIVE', 'REJECTED'])

export const aiSearchStatusSchema = z.enum(['PENDING', 'COMPLETED'])

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const baseListingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  price: z.number().positive('Price must be positive'),
  area: z.number().positive('Area must be positive'),
  rooms: z.number().int().positive().optional().nullable(),
  floor: z.number().int().min(0).optional().nullable(),
  totalFloors: z.number().int().positive().optional().nullable(),
  address: z.string().min(5, 'Address is required'),
  district: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  phone: z.string().regex(/^(\+994|0)[0-9]{9}$/, 'Invalid phone number format').optional().nullable(),
  email: z.string().email('Invalid email format').optional().nullable(),
  type: listingTypeSchema,
  category: listingCategorySchema,
})

export const createListingSchema = baseListingSchema.refine(
  (data) => {
    if (data.floor !== null && data.floor !== undefined && data.totalFloors !== null && data.totalFloors !== undefined) {
      return data.floor <= data.totalFloors;
    }
    return true;
  },
  {
    message: 'Floor must be less than or equal to total floors',
    path: ['floor'],
  }
)

export const updateListingSchema = baseListingSchema.partial()

export const listingFiltersSchema = z.object({
  status: listingStatusSchema.optional(),
  type: listingTypeSchema.optional(),
  category: listingCategorySchema.optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  userId: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
  isFeatured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minArea: z.coerce.number().positive().optional(),
  maxArea: z.coerce.number().positive().optional(),
  rooms: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(['createdAt', 'price', 'area', 'views', 'publishedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: 'Min price must be less than or equal to max price',
    path: ['maxPrice'],
  }
).refine(
  (data) => {
    if (data.minArea !== undefined && data.maxArea !== undefined) {
      return data.minArea <= data.maxArea;
    }
    return true;
  },
  {
    message: 'Min area must be less than or equal to max area',
    path: ['maxArea'],
  }
)

export const createAgencySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  logo: z.string().url('Invalid logo URL').optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  phone: z.string().regex(/^(\+994|0)[0-9]{9}$/, 'Invalid phone number format').optional().nullable(),
  email: z.string().email('Invalid email format').optional().nullable(),
})

export const updateAgencySchema = createAgencySchema.partial()

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^(\+994|0)[0-9]{9}$/, 'Invalid phone number format').optional().nullable(),
  avatar: z.string().url('Invalid avatar URL').optional().nullable(),
  role: userRoleSchema.default('USER'),
  agencyId: z.string().uuid().optional().nullable(),
})

export const updateUserSchema = createUserSchema.partial()

export const aiSearchRequestSchema = z.object({
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
}).refine(
  (data) => data.imageUrl || data.description || data.address,
  'At least one of imageUrl, description, or address must be provided'
)

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
export type ListingFiltersInput = z.infer<typeof listingFiltersSchema>
export type CreateAgencyInput = z.infer<typeof createAgencySchema>
export type UpdateAgencyInput = z.infer<typeof updateAgencySchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type AISearchRequestInput = z.infer<typeof aiSearchRequestSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
