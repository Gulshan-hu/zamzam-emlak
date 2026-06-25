import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Bookmark, FileText, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getServerUser()

  if (!user) {
    redirect('/auth/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      role: true,
      agencyId: true,
      _count: {
        select: {
          listings: true,
          savedListings: true,
        },
      },
    },
  })

  if (!dbUser) {
    redirect('/auth/login')
  }

  const recentListings = await prisma.listing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      images: { orderBy: { order: 'asc' }, take: 1 },
    },
  })

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Xoş gəldiniz, {dbUser.name}!
        </h1>
        <p className="mt-2 text-text-muted">{dbUser.email}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Mənim Elanlarım</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">
                {dbUser._count.listings}
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Saxlanılanlar</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">
                {dbUser._count.savedListings}
              </p>
            </div>
            <div className="rounded-full bg-accent/10 p-3">
              <Bookmark className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Status</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">
                {dbUser.role === 'AGENCY_OWNER'
                  ? 'Agentlik Sahibi'
                  : dbUser.role === 'AGENT'
                  ? 'Agent'
                  : 'İstifadəçi'}
              </p>
            </div>
            <div className="rounded-full bg-success/10 p-3">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        <Link href="/listings/new">
          <Button variant="primary">
            <Plus className="mr-2 h-5 w-5" />
            Yeni Elan
          </Button>
        </Link>
        <Link href="/dashboard/saved">
          <Button variant="secondary">
            <Bookmark className="mr-2 h-5 w-5" />
            Saxlanılanlar
          </Button>
        </Link>
        {dbUser.agencyId && (
          <Link href="/agency">
            <Button variant="secondary">
              Agentlik Paneli
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Son Elanlar
            </h2>
            <Link href="/dashboard/listings">
              <Button variant="ghost" size="sm">
                Hamısına bax
              </Button>
            </Link>
          </div>
        </div>
        <div className="divide-y divide-border">
          {recentListings.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              Hələ ki elanınız yoxdur
            </div>
          ) : (
            (() => {
              type ListingItem = (typeof recentListings)[number]
              return recentListings.map((listing: ListingItem) => (
              <div key={listing.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">
                      {listing.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {new Intl.NumberFormat('az-AZ').format(listing.price)} ₼ •{' '}
                      {listing.city}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      {getStatusBadge(listing.status)}
                      <span className="text-xs text-text-muted">
                        {listing.views} baxış
                      </span>
                      <span className="text-xs text-text-muted">
                        {new Date(listing.createdAt).toLocaleDateString('az-AZ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
            })()
          )}
        </div>
      </Card>
    </div>
  )
}
