import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth-server'
import { createListingAction } from '@/lib/actions/listing.actions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, agencyId: true, isBlocked: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (dbUser.isBlocked) {
      return NextResponse.json({ error: 'Account is blocked' }, { status: 403 })
    }

    if (dbUser.role === 'USER') {
      return NextResponse.json(
        { error: 'Only agencies can create listings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { images, ...listingData } = body

    // Create listing
    const result = await createListingAction(listingData, dbUser.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const listing = result.data

    // Create listing images
    if (images && images.length > 0) {
      await prisma.listingImage.createMany({
        data: images.map((url: string, index: number) => ({
          listingId: listing.id,
          url,
          order: index,
        })),
      })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create listing' },
      { status: 500 }
    )
  }
}
