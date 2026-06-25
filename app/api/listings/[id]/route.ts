import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { updateListingSchema } from '@/lib/validation/schemas'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        agency: { select: { id: true, name: true, logo: true, phone: true, email: true } },
        aiAnalysis: true,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Elan tapılmadı' }, { status: 404 })
    }

    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Failed to fetch listing:', error)
    return NextResponse.json(
      { error: 'Elanı yükləmək mümkün olmadı' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    if (!rateLimit(`listing-update-${user.id}`, 20, 60000)) {
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
      select: { userId: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Elan tapılmadı' }, { status: 404 })
    }

    if (listing.userId !== user.id) {
      return NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 })
    }

    const body = await request.json()
    const { images, ...updateData } = body

    // Validate update data
    const validationResult = updateListingSchema.safeParse(updateData)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Yanlış məlumat formatı' },
        { status: 400 }
      )
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: validationResult.data,
    })

    if (images && Array.isArray(images)) {
      const imageUrlSchema = z.array(z.string().url()).max(10)
      const imageValidation = imageUrlSchema.safeParse(images)

      if (!imageValidation.success) {
        return NextResponse.json(
          { error: 'Yanlış şəkil formatı' },
          { status: 400 }
        )
      }

      await prisma.listingImage.deleteMany({
        where: { listingId: id },
      })

      if (images.length > 0) {
        await prisma.listingImage.createMany({
          data: images.map((url: string, index: number) => ({
            listingId: id,
            url,
            order: index,
          })),
        })
      }
    }

    return NextResponse.json({ listing: updatedListing })
  } catch (error) {
    console.error('Failed to update listing:', error)
    return NextResponse.json(
      { error: 'Elanı yeniləmək mümkün olmadı' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    if (!rateLimit(`listing-delete-${user.id}`, 20, 60000)) {
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
      select: { userId: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Elan tapılmadı' }, { status: 404 })
    }

    if (listing.userId !== user.id) {
      return NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 })
    }

    await prisma.listing.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete listing:', error)
    return NextResponse.json(
      { error: 'Elanı silmək mümkün olmadı' },
      { status: 500 }
    )
  }
}
