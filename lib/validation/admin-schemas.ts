import { z } from 'zod'
import { userRoleSchema } from './schemas'

export const approveListingSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID'),
})

export const rejectListingSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID'),
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(500),
})

export const bulkApproveListingsSchema = z.object({
  listingIds: z.array(z.string().uuid()).min(1, 'At least one listing ID required').max(50),
})

export const bulkRejectListingsSchema = z.object({
  listingIds: z.array(z.string().uuid()).min(1, 'At least one listing ID required').max(50),
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(500),
})

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: userRoleSchema,
})

export const toggleUserBlockSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  isBlocked: z.boolean(),
})

export const assignUserToAgencySchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  agencyId: z.string().uuid('Invalid agency ID').nullable(),
})

export const toggleAgencyVerificationSchema = z.object({
  agencyId: z.string().uuid('Invalid agency ID'),
  isVerified: z.boolean(),
})

export const createAgencyPackageSchema = z.object({
  agencyId: z.string().uuid('Invalid agency ID'),
  name: z.string().min(3, 'Package name must be at least 3 characters').max(100),
  listingQuota: z.number().int().positive('Listing quota must be positive').max(10000),
  priceAZN: z.number().nonnegative('Price must be non-negative'),
  validMonths: z.number().int().positive().min(1).max(24),
})

export const resetAgencyQuotaSchema = z.object({
  packageId: z.string().uuid('Invalid package ID'),
})

export const deleteAgencySchema = z.object({
  agencyId: z.string().uuid('Invalid agency ID'),
})

export type ApproveListingInput = z.infer<typeof approveListingSchema>
export type RejectListingInput = z.infer<typeof rejectListingSchema>
export type BulkApproveListingsInput = z.infer<typeof bulkApproveListingsSchema>
export type BulkRejectListingsInput = z.infer<typeof bulkRejectListingsSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
export type ToggleUserBlockInput = z.infer<typeof toggleUserBlockSchema>
export type AssignUserToAgencyInput = z.infer<typeof assignUserToAgencySchema>
export type ToggleAgencyVerificationInput = z.infer<typeof toggleAgencyVerificationSchema>
export type CreateAgencyPackageInput = z.infer<typeof createAgencyPackageSchema>
export type ResetAgencyQuotaInput = z.infer<typeof resetAgencyQuotaSchema>
export type DeleteAgencyInput = z.infer<typeof deleteAgencySchema>
