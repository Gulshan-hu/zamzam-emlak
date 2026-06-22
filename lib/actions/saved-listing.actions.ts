'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { ActionResponse } from '@/lib/types'

export async function saveListingAction(
  userId: string,
  listingId: string
): Promise<ActionResponse> {
  try {
    await prisma.savedListing.create({
      data: {
        userId,
        listingId,
      },
    })

    revalidatePath('/listings')
    revalidatePath(`/listings/${listingId}`)

    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: 'Failed to save listing' }
  }
}

export async function unsaveListingAction(
  userId: string,
  listingId: string
): Promise<ActionResponse> {
  try {
    await prisma.savedListing.deleteMany({
      where: {
        userId,
        listingId,
      },
    })

    revalidatePath('/listings')
    revalidatePath(`/listings/${listingId}`)

    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: 'Failed to unsave listing' }
  }
}

export async function checkListingSavedAction(
  userId: string,
  listingId: string
): Promise<ActionResponse<boolean>> {
  try {
    const saved = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    })

    return { success: true, data: !!saved }
  } catch (err) {
    return { success: false, error: 'Failed to check saved listing' }
  }
}
