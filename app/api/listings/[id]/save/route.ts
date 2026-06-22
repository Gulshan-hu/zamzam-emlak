import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: id,
        },
      },
    })

    if (existing) {
      await prisma.savedListing.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({ saved: false })
    } else {
      await prisma.savedListing.create({
        data: {
          userId: user.id,
          listingId: id,
        },
      })
      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save listing' },
      { status: 500 }
    )
  }
}
