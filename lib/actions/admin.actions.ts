'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResponse } from '@/lib/types'

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
    return { success: false, error: 'Failed to fetch dashboard stats' }
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
      ...recentListings.map((listing) => ({
        id: listing.id,
        type: listing.status === 'ACTIVE' ? 'listing_approved' : 'listing_rejected',
        description:
          listing.status === 'ACTIVE'
            ? `Elan təsdiqləndi: ${listing.title}`
            : `Elan rədd edildi: ${listing.title}`,
        createdAt: listing.updatedAt,
      })),
      ...recentUsers.map((user) => ({
        id: user.id,
        type: 'user_registered',
        description: `Yeni istifadəçi qeydiyyatdan keçdi: ${user.name}`,
        createdAt: user.createdAt,
      })),
      ...recentAgencies.map((agency) => ({
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
    return { success: false, error: 'Failed to fetch recent activity' }
  }
}

export async function approveListingAction(listingId: string): Promise<ActionResponse> {
  try {
    await prisma.listing.update({
      where: { id: listingId },
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
    return { success: false, error: 'Failed to approve listing' }
  }
}

export async function rejectListingAction(
  listingId: string,
  reason: string
): Promise<ActionResponse> {
  try {
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
      include: {
        user: { select: { email: true, name: true } },
      },
    })

    const supabase = createAdminClient()
    await supabase.auth.admin.inviteUserByEmail(listing.user.email, {
      data: {
        listingTitle: listing.title,
        rejectionReason: reason,
      },
    })

    revalidatePath('/admin/listings')

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'Failed to reject listing' }
  }
}

export async function bulkApproveListingsAction(listingIds: string[]): Promise<ActionResponse> {
  try {
    await prisma.listing.updateMany({
      where: { id: { in: listingIds } },
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
    return { success: false, error: 'Failed to bulk approve listings' }
  }
}

export async function bulkRejectListingsAction(
  listingIds: string[],
  reason: string
): Promise<ActionResponse> {
  try {
    await prisma.listing.updateMany({
      where: { id: { in: listingIds } },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
    })

    revalidatePath('/admin/listings')

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'Failed to bulk reject listings' }
  }
}

export async function updateUserRoleAction(
  userId: string,
  role: 'USER' | 'AGENT' | 'AGENCY_OWNER' | 'ADMIN'
): Promise<ActionResponse> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    const supabase = createAdminClient()
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    })

    revalidatePath('/admin/users')

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'Failed to update user role' }
  }
}

export async function toggleUserBlockAction(
  userId: string,
  isBlocked: boolean
): Promise<ActionResponse> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isBlocked },
    })

    revalidatePath('/admin/users')

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'Failed to toggle user block status' }
  }
}

export async function assignUserToAgencyAction(
  userId: string,
  agencyId: string | null
): Promise<ActionResponse> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { agencyId },
    })

    revalidatePath('/admin/users')

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'Failed to assign user to agency' }
  }
}

export async function toggleAgencyVerificationAction(
  agencyId: string,
  isVerified: boolean
): Promise<ActionResponse> {
  try {
    await prisma.agency.update({
      where: { id: agencyId },
      data: { isVerified },
    })

    revalidatePath('/admin/agencies')

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'Failed to toggle agency verification' }
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
    await prisma.agencyPackage.updateMany({
      where: { agencyId: data.agencyId, isActive: true },
      data: { isActive: false },
    })

    const validUntil = new Date()
    validUntil.setMonth(validUntil.getMonth() + data.validMonths)

    await prisma.agencyPackage.create({
      data: {
        agencyId: data.agencyId,
        name: data.name,
        listingQuota: data.listingQuota,
        priceAZN: data.priceAZN,
        validUntil,
        isActive: true,
      },
    })

    revalidatePath('/admin/agencies')

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'Failed to create agency package' }
  }
}

export async function resetAgencyQuotaAction(packageId: string): Promise<ActionResponse> {
  try {
    await prisma.agencyPackage.update({
      where: { id: packageId },
      data: { usedQuota: 0 },
    })

    revalidatePath('/admin/agencies')

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'Failed to reset agency quota' }
  }
}

export async function deleteAgencyAction(agencyId: string): Promise<ActionResponse> {
  try {
    await prisma.agency.delete({
      where: { id: agencyId },
    })

    revalidatePath('/admin/agencies')

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'Failed to delete agency' }
  }
}
