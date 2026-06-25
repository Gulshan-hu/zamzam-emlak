import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth-server'
import { createListingAction } from '@/lib/actions/listing.actions'
import { prisma } from '@/lib/prisma'
import { createListingSchema } from '@/lib/validation/schemas'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    if (!rateLimit(`listing-create-${user.id}`, 20, 60000)) {
      return NextResponse.json(
        { error: 'Çox tez-tez sorğu göndərilir. Bir az sonra yenidən cəhd edin.' },
        { status: 429 }
      )
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, agencyId: true, isBlocked: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (dbUser.isBlocked) {
      return NextResponse.json({ error: 'Hesabınız bloklanıb' }, { status: 403 })
    }

    if (dbUser.role === 'USER') {
      return NextResponse.json(
        { error: 'Yalnız agentliklər elan yarada bilər' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = createListingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Yanlış məlumat formatı' },
        { status: 400 }
      )
    }

    const { images, ...listingData } = body

    // Validate images array
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Ən azı bir şəkil tələb olunur' },
        { status: 400 }
      )
    }

    const imageUrlSchema = z.array(z.string().url()).min(1).max(10)
    const imageValidation = imageUrlSchema.safeParse(images)
    if (!imageValidation.success) {
      return NextResponse.json(
        { error: 'Yanlış şəkil formatı' },
        { status: 400 }
      )
    }

    const result = await createListingAction(listingData, dbUser.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const listing = result.data

    await prisma.listingImage.createMany({
      data: images.map((url: string, index: number) => ({
        listingId: listing.id,
        url,
        order: index,
      })),
    })

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Failed to create listing:', error)
    return NextResponse.json(
      { error: 'Elan yaratmaq mümkün olmadı' },
      { status: 500 }
    )
  }
}
