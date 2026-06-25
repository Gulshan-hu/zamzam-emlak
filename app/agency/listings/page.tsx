import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getServerUser } from '@/lib/auth-server'
import { getAgencyByUserId, getAgencyListings } from '@/lib/agency'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Edit, Trash2, ExternalLink } from 'lucide-react'
import { DeleteListingButton } from '@/components/dashboard/DeleteListingButton'

export default async function AgencyListingsPage() {
  const user = await getServerUser()

  if (!user) {
    redirect('/auth/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, agencyId: true },
  })

  if (!dbUser?.agencyId) {
    redirect('/dashboard')
  }

  const agency = await getAgencyByUserId(user.id)

  if (!agency) {
    redirect('/dashboard')
  }

  // If AGENT, only show their own listings. If AGENCY_OWNER, show all agency listings
  const listings = await getAgencyListings(
    agency.id,
    dbUser.role === 'AGENT' ? user.id : undefined
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="green">Aktiv</Badge>
      case 'PENDING':
        return <Badge variant="yellow">Gözləyir</Badge>
      case 'REJECTED':
        return <Badge variant="red">Rədd edildi</Badge>
      default:
        return null
    }
  }

  const canEditListing = (listingUserId: string) => {
    return dbUser.role === 'AGENCY_OWNER' || listingUserId === user.id
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Elanlar</h1>
          <p className="mt-2 text-text-muted">
            {dbUser.role === 'AGENCY_OWNER'
              ? 'Bütün agentlik elanları'
              : 'Mənim elanlarım'}
          </p>
        </div>
        <Link href="/listings/new">
          <Button variant="primary">Yeni Elan</Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-text-muted">Hələ ki elan yoxdur</p>
          <Link href="/listings/new" className="mt-4 inline-block">
            <Button variant="primary">İlk Elanı Yaradın</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {(() => {
            type ListingItem = (typeof listings)[number]
            return listings.map((listing: ListingItem) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0].url}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-surface-muted text-text-muted">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">
                    {listing.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">
                    {new Intl.NumberFormat('az-AZ').format(listing.price)} ₼ •{' '}
                    {listing.city}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-text-muted">
                      Agent: {listing.user.name}
                    </span>
                    {getStatusBadge(listing.status)}
                    <span className="text-xs text-text-muted">
                      {listing.views} baxış
                    </span>
                    <span className="text-xs text-text-muted">
                      {new Date(listing.createdAt).toLocaleDateString('az-AZ')}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/listings/${listing.slug}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  {canEditListing(listing.userId) && (
                    <>
                      <Link href={`/listings/${listing.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteListingButton listingId={listing.id} />
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
          })()}
        </div>
      )}
    </div>
  )
}
