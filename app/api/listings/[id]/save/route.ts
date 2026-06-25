import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    if (!rateLimit(`listing-save-${user.id}`, 20, 60000)) {
      return NextResponse.json(
        { error: 'Çox tez-tez sorğu göndərilir' },
        { status: 429 }
      )
    }

    const { id } = await params

    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Elan tapılmadı' }, { status: 404 })
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
    console.error('Failed to save listing:', error)
    return NextResponse.json(
      { error: 'Əməliyyat uğursuz oldu' },
      { status: 500 }
    )
  }
}
