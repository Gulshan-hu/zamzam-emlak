import { PrismaClient, AgencyPackage } from '@prisma/client'
import { BaseRepository } from './base.repository'

export class AgencyPackageRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma)
  }

  async findActiveByAgencyId(agencyId: string): Promise<AgencyPackage | null> {
    try {
      return await this.prisma.agencyPackage.findFirst({
        where: {
          agencyId,
          isActive: true,
          validUntil: {
            gt: new Date(),
          },
        },
        orderBy: {
          validUntil: 'desc',
        },
      })
    } catch (error) {
      this.handleError(error, 'AgencyPackageRepository.findActiveByAgencyId')
    }
  }

  async checkQuotaAvailable(packageId: string): Promise<boolean> {
    try {
      const pkg = await this.prisma.agencyPackage.findUnique({
        where: { id: packageId },
      })

      if (!pkg) return false
      if (!pkg.isActive) return false
      if (pkg.validUntil < new Date()) return false
      if (pkg.usedQuota >= pkg.listingQuota) return false

      return true
    } catch (error) {
      this.handleError(error, 'AgencyPackageRepository.checkQuotaAvailable')
    }
  }

  async incrementUsedQuota(packageId: string): Promise<AgencyPackage> {
    try {
      return await this.prisma.agencyPackage.update({
        where: { id: packageId },
        data: {
          usedQuota: { increment: 1 },
        },
      })
    } catch (error) {
      this.handleError(error, 'AgencyPackageRepository.incrementUsedQuota')
    }
  }

  async decrementUsedQuota(packageId: string): Promise<AgencyPackage> {
    try {
      return await this.prisma.agencyPackage.update({
        where: { id: packageId },
        data: {
          usedQuota: { decrement: 1 },
        },
      })
    } catch (error) {
      this.handleError(error, 'AgencyPackageRepository.decrementUsedQuota')
    }
  }

  async getQuotaInfo(agencyId: string): Promise<{
    used: number
    total: number
    remaining: number
  } | null> {
    try {
      const pkg = await this.findActiveByAgencyId(agencyId)
      if (!pkg) return null

      return {
        used: pkg.usedQuota,
        total: pkg.listingQuota,
        remaining: pkg.listingQuota - pkg.usedQuota,
      }
    } catch (error) {
      this.handleError(error, 'AgencyPackageRepository.getQuotaInfo')
    }
  }
}
