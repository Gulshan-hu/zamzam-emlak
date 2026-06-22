'use server'

import { prisma } from '@/lib/prisma'
import { AgencyPackageRepository } from '@/lib/repositories/agency-package.repository'
import type { ActionResponse } from '@/lib/types'

const agencyPackageRepository = new AgencyPackageRepository(prisma)

export async function getAgencyQuotaAction(
  agencyId: string
): Promise<ActionResponse<{ used: number; total: number; remaining: number }>> {
  try {
    const quotaInfo = await agencyPackageRepository.getQuotaInfo(agencyId)

    if (!quotaInfo) {
      return {
        success: false,
        error: 'No active package found for this agency',
      }
    }

    return { success: true, data: quotaInfo }
  } catch (err) {
    return { success: false, error: 'Failed to fetch agency quota' }
  }
}
