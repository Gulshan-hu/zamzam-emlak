import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const searchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().max(10000), // Max 10km
})

// Haversine formula to calculate distance in meters
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')

    const validationResult = searchSchema.safeParse({ lat, lng, radius })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Yanlış parametrlər' },
        { status: 400 }
      )
    }

    const { lat: searchLat, lng: searchLng, radius: searchRadius } = validationResult.data

    // Get all active listings with coordinates
    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        lat: { not: null },
        lng: { not: null },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        lat: true,
        lng: true,
        city: true,
        district: true,
        type: true,
        category: true,
        images: {
          orderBy: { order: 'asc' },
          take: 1,
          select: { url: true },
        },
      },
    })

    // Filter by distance using Haversine formula
    const filteredListings = listings
      .filter((listing) => {
        if (!listing.lat || !listing.lng) return false
        const distance = haversineDistance(
          searchLat,
          searchLng,
          listing.lat,
          listing.lng
        )
        return distance <= searchRadius
      })
      .map((listing) => ({
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        price: listing.price,
        lat: listing.lat!,
        lng: listing.lng!,
        city: listing.city,
        district: listing.district,
        type: listing.type,
        category: listing.category,
        imageUrl: listing.images[0]?.url || null,
      }))

    return NextResponse.json({ listings: filteredListings })
  } catch (error) {
    console.error('Map search failed:', error)
    return NextResponse.json(
      { error: 'Axtarış uğursuz oldu' },
      { status: 500 }
    )
  }
}
