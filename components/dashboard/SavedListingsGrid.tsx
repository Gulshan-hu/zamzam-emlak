'use client'

import { useRouter } from 'next/navigation'
import { ListingCard } from '@/components/listings/ListingCard'
import { Button } from '@/components/ui/Button'
import { Bookmark } from 'lucide-react'
import type { SavedListing, Listing, ListingImage, Agency, User } from '@/lib/types'

type SavedListingWithRelations = SavedListing & {
  listing: Listing & {
    images: ListingImage[]
    agency: Agency | null
    user: Pick<User, 'name' | 'phone'>
  }
}

interface SavedListingsGridProps {
  savedListings: SavedListingWithRelations[]
}

export function SavedListingsGrid({ savedListings }: SavedListingsGridProps) {
  const router = useRouter()

  const handleUnsave = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/save`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to unsave listing:', error)
    }
  }

  if (savedListings.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-12 text-center">
        <Bookmark className="mx-auto h-12 w-12 text-text-muted" />
        <p className="mt-4 text-text-muted">
          Hələ ki saxlanılan elanınız yoxdur
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {savedListings.map((saved) => (
        <div key={saved.id} className="relative">
          <ListingCard listing={saved.listing} />
          <div className="absolute right-2 top-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUnsave(saved.listing.id)}
              className="bg-surface/80 backdrop-blur-sm hover:bg-surface"
            >
              <Bookmark className="h-4 w-4 fill-primary text-primary" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
