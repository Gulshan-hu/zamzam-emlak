import { prisma } from '@/lib/prisma'
import type { Agency, AgencyPackage, User, Listing } from '@/lib/types'

export async function getAgencyByUserId(
  userId: string
): Promise<(Agency & { packages: AgencyPackage[] }) | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { agencyId: true },
    })

    if (!user?.agencyId) {
      return null
    }

    const agency = await prisma.agency.findUnique({
      where: { id: user.agencyId },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    return agency
  } catch (error) {
    console.error('Failed to get agency by user ID:', error)
    return null
  }
}

export async function getAgencyListings(
  agencyId: string,
  agentId?: string
): Promise<(Listing & { images: { url: string; order: number }[]; user: { id: string; name: string; email: string } })[]> {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        agencyId,
        ...(agentId ? { userId: agentId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return listings as (Listing & { images: { url: string; order: number }[]; user: { id: string; name: string; email: string } })[]
  } catch (error) {
    console.error('Failed to get agency listings:', error)
    return []
  }
}

export async function getAgencyPackage(
  agencyId: string
): Promise<AgencyPackage | null> {
  try {
    const activePackage = await prisma.agencyPackage.findFirst({
      where: {
        agencyId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return activePackage
  } catch (error) {
    console.error('Failed to get agency package:', error)
    return null
  }
}

export async function getAgencyTeam(agencyId: string): Promise<User[]> {
  try {
    const team = await prisma.user.findMany({
      where: { agencyId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { listings: true } },
      },
    })

    return team as User[]
  } catch (error) {
    console.error('Failed to get agency team:', error)
    return []
  }
}

export async function removeAgentFromAgency(userId: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        agencyId: null,
        role: 'USER',
      },
    })

    return true
  } catch (error) {
    console.error('Failed to remove agent from agency:', error)
    return false
  }
}

export async function getPackageHistory(
  agencyId: string
): Promise<AgencyPackage[]> {
  try {
    const packages = await prisma.agencyPackage.findMany({
      where: { agencyId },
      orderBy: { createdAt: 'desc' },
    })

    return packages
  } catch (error) {
    console.error('Failed to get package history:', error)
    return []
  }
}

export async function getAgencyStats(agencyId: string): Promise<{
  totalListings: number
  activeListings: number
  pendingListings: number
}> {
  try {
    const [totalListings, activeListings, pendingListings] = await Promise.all([
      prisma.listing.count({ where: { agencyId } }),
      prisma.listing.count({ where: { agencyId, status: 'ACTIVE' } }),
      prisma.listing.count({ where: { agencyId, status: 'PENDING' } }),
    ])

    return { totalListings, activeListings, pendingListings }
  } catch (error) {
    console.error('Failed to get agency stats:', error)
    return { totalListings: 0, activeListings: 0, pendingListings: 0 }
  }
}
