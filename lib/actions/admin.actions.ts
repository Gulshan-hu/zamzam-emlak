'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import { getServerUser } from '@/lib/auth-server'
import {
  approveListingSchema,
  rejectListingSchema,
  bulkApproveListingsSchema,
  bulkRejectListingsSchema,
  updateUserRoleSchema,
  toggleUserBlockSchema,
  assignUserToAgencySchema,
  toggleAgencyVerificationSchema,
  createAgencyPackageSchema,
  resetAgencyQuotaSchema,
  deleteAgencySchema,
} from '@/lib/validation/admin-schemas'
import type { ActionResponse } from '@/lib/types'

async function verifyAdminRole(): Promise<string | null> {
  const user = await getServerUser()
  if (!user) {
    return null
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!dbUser || dbUser.role !== 'ADMIN') {
    return null
  }

  return user.id
}

export async function getDashboardStats(): Promise<
  ActionResponse<{
    totalListings: number
    pendingReview: number
    activeListings: number
    totalUsers: number
    totalAgencies: number
    todayNewListings: number
    aiAnalysesToday: number
  }>
> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalListings,
      pendingReview,
      activeListings,
      totalUsers,
      totalAgencies,
      todayNewListings,
    ] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.agency.count(),
      prisma.listing.count({ where: { createdAt: { gte: today } } }),
    ])

    return {
      success: true,
      data: {
        totalListings,
        pendingReview,
        activeListings,
        totalUsers,
        totalAgencies,
        todayNewListings,
        aiAnalysesToday: 0,
      },
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return { success: false, error: 'Statistikanı yükləmək mümkün olmadı' }
  }
}

export async function getRecentActivity(): Promise<
  ActionResponse<
    Array<{
      id: string
      type: string
      description: string
      createdAt: Date
    }>
  >
> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const [recentListings, recentUsers, recentAgencies] = await Promise.all([
      prisma.listing.findMany({
        where: {
          OR: [{ status: 'ACTIVE' }, { status: 'REJECTED' }],
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),
      prisma.agency.findMany({
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),
    ])

    const activity = [
      ...recentListings.map((listing: (typeof recentListings)[number]) => ({
        id: listing.id,
        type: listing.status === 'ACTIVE' ? 'listing_approved' : 'listing_rejected',
        description:
          listing.status === 'ACTIVE'
            ? `Elan təsdiqləndi: ${listing.title}`
            : `Elan rədd edildi: ${listing.title}`,
        createdAt: listing.updatedAt,
      })),
      ...recentUsers.map((user: (typeof recentUsers)[number]) => ({
        id: user.id,
        type: 'user_registered',
        description: `Yeni istifadəçi qeydiyyatdan keçdi: ${user.name}`,
        createdAt: user.createdAt,
      })),
     ...recentAgencies.map((agency: (typeof recentAgencies)[number]) => ({
        id: agency.id,
        type: 'agency_registered',
        description: `Yeni agentlik qeydiyyatdan keçdi: ${agency.name}`,
        createdAt: agency.createdAt,
      })),
    ]

    activity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return {
      success: true,
      data: activity.slice(0, 10),
    }
  } catch (error) {
    console.error('Failed to fetch recent activity:', error)
    return { success: false, error: 'Fəaliyyət tarixçəsini yükləmək mümkün olmadı' }
  }
}

export async function approveListingAction(listingId: string): Promise<ActionResponse> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const validated = approveListingSchema.parse({ listingId })

    await prisma.listing.update({
      where: { id: validated.listingId },
      data: {
        status: 'ACTIVE',
        publishedAt: new Date(),
        rejectionReason: null,
      },
    })

    revalidatePath('/admin/listings')
    revalidatePath('/listings')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to approve listing:', error)
    return { success: false, error: 'Elanı təsdiqləmək mümkün olmadı' }
  }
}

export async function rejectListingAction(
  listingId: string,
  reason: string
): Promise<ActionResponse> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const validated = rejectListingSchema.parse({ listingId, reason })

    const listing = await prisma.listing.update({
      where: { id: validated.listingId },
      data: {
        status: 'REJECTED',
        rejectionReason: validated.reason,
      },
      include: {
        user: { select: { email: true, name: true } },
      },
    })

    const supabase = createAdminClient()
    await supabase.auth.admin.inviteUserByEmail(listing.user.email, {
      data: {
        listingTitle: listing.title,
        rejectionReason: validated.reason,
      },
    })

    revalidatePath('/admin/listings')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to reject listing:', error)
    return { success: false, error: 'Elanı rədd etmək mümkün olmadı' }
  }
}

export async function bulkApproveListingsAction(listingIds: string[]): Promise<ActionResponse> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const validated = bulkApproveListingsSchema.parse({ listingIds })

    await prisma.listing.updateMany({
      where: { id: { in: validated.listingIds } },
      data: {
        status: 'ACTIVE',
        publishedAt: new Date(),
        rejectionReason: null,
      },
    })

    revalidatePath('/admin/listings')
    revalidatePath('/listings')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to bulk approve listings:', error)
    return { success: false, error: 'Elanları təsdiqləmək mümkün olmadı' }
  }
}

export async function bulkRejectListingsAction(
  listingIds: string[],
  reason: string
): Promise<ActionResponse> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const validated = bulkRejectListingsSchema.parse({ listingIds, reason })

    await prisma.listing.updateMany({
      where: { id: { in: validated.listingIds } },
      data: {
        status: 'REJECTED',
        rejectionReason: validated.reason,
      },
    })

    revalidatePath('/admin/listings')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to bulk reject listings:', error)
    return { success: false, error: 'Elanları rədd etmək mümkün olmadı' }
  }
}

export async function updateUserRoleAction(
  userId: string,
  role: 'USER' | 'AGENT' | 'AGENCY_OWNER' | 'ADMIN'
): Promise<ActionResponse> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const validated = updateUserRoleSchema.parse({ userId, role })

    await prisma.user.update({
      where: { id: validated.userId },
      data: { role: validated.role },
    })

    const supabase = createAdminClient()
    await supabase.auth.admin.updateUserById(validated.userId, {
      user_metadata: { role: validated.role },
    })

    revalidatePath('/admin/users')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to update user role:', error)
    return { success: false, error: 'İstifadəçi rolunu yeniləmək mümkün olmadı' }
  }
}

export async function toggleUserBlockAction(
  userId: string,
  isBlocked: boolean
): Promise<ActionResponse> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const validated = toggleUserBlockSchema.parse({ userId, isBlocked })

    await prisma.user.update({
      where: { id: validated.userId },
      data: { isBlocked: validated.isBlocked },
    })

    revalidatePath('/admin/users')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to toggle user block status:', error)
    return { success: false, error: 'İstifadəçi statusunu dəyişmək mümkün olmadı' }
  }
}

export async function assignUserToAgencyAction(
  userId: string,
  agencyId: string | null
): Promise<ActionResponse> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const validated = assignUserToAgencySchema.parse({ userId, agencyId })

    await prisma.user.update({
      where: { id: validated.userId },
      data: { agencyId: validated.agencyId },
    })

    revalidatePath('/admin/users')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to assign user to agency:', error)
    return { success: false, error: 'İstifadəçini agentliyə təyin etmək mümkün olmadı' }
  }
}

export async function toggleAgencyVerificationAction(
  agencyId: string,
  isVerified: boolean
): Promise<ActionResponse> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const validated = toggleAgencyVerificationSchema.parse({ agencyId, isVerified })

    await prisma.agency.update({
      where: { id: validated.agencyId },
      data: { isVerified: validated.isVerified },
    })

    revalidatePath('/admin/agencies')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to toggle agency verification:', error)
    return { success: false, error: 'Agentlik statusunu dəyişmək mümkün olmadı' }
  }
}

export async function createAgencyPackageAction(data: {
  agencyId: string
  name: string
  listingQuota: number
  priceAZN: number
  validMonths: number
}): Promise<ActionResponse> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const validated = createAgencyPackageSchema.parse(data)

    await prisma.agencyPackage.updateMany({
      where: { agencyId: validated.agencyId, isActive: true },
      data: { isActive: false },
    })

    const validUntil = new Date()
    validUntil.setMonth(validUntil.getMonth() + validated.validMonths)

    await prisma.agencyPackage.create({
      data: {
        agencyId: validated.agencyId,
        name: validated.name,
        listingQuota: validated.listingQuota,
        priceAZN: validated.priceAZN,
        validUntil,
        isActive: true,
      },
    })

    revalidatePath('/admin/agencies')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to create agency package:', error)
    return { success: false, error: 'Paket yaratmaq mümkün olmadı' }
  }
}

export async function resetAgencyQuotaAction(packageId: string): Promise<ActionResponse> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const validated = resetAgencyQuotaSchema.parse({ packageId })

    await prisma.agencyPackage.update({
      where: { id: validated.packageId },
      data: { usedQuota: 0 },
    })

    revalidatePath('/admin/agencies')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to reset agency quota:', error)
    return { success: false, error: 'Kvotanı sıfırlamaq mümkün olmadı' }
  }
}

export async function deleteAgencyAction(agencyId: string): Promise<ActionResponse> {
  try {
    const adminId = await verifyAdminRole()
    if (!adminId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const validated = deleteAgencySchema.parse({ agencyId })

    await prisma.agency.delete({
      where: { id: validated.agencyId },
    })

    revalidatePath('/admin/agencies')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to delete agency:', error)
    return { success: false, error: 'Agentliyi silmək mümkün olmadı' }
  }
}
