import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth-server'
import { getAgencyByUserId, getAgencyStats } from '@/lib/agency'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { FileText, CheckCircle, Clock, Package as PackageIcon, AlertTriangle } from 'lucide-react'

interface RecentListing {
  id: string
  title: string
  status: 'ACTIVE' | 'PENDING' | 'REJECTED'
  views: number
  createdAt: Date
  user: {
    name: string | null
  }
}

export default async function AgencyDashboardPage() {
  const user = await getServerUser()

  if (!user) {
    redirect('/auth/login')
  }

  const agency = await getAgencyByUserId(user.id)

  if (!agency) {
    redirect('/dashboard')
  }

  const stats = await getAgencyStats(agency.id)
  const activePackage = agency.packages[0]

  const recentListings: RecentListing[] = await prisma.listing.findMany({
    where: { agencyId: agency.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: { select: { name: true } },
    },
  })

  const quotaPercentage = activePackage
    ? (activePackage.usedQuota / activePackage.listingQuota) * 100
    : 0

  const isExpired = activePackage && new Date() > new Date(activePackage.validUntil)
  const isQuotaFull = activePackage && activePackage.usedQuota >= activePackage.listingQuota

  const getProgressColor = () => {
    if (quotaPercentage >= 95) return 'bg-error'
    if (quotaPercentage >= 80) return 'bg-warning'
    return 'bg-success'
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-text-primary">{agency.name}</h1>
          {agency.isVerified && <Badge variant="green">Təsdiqlənib</Badge>}
        </div>
        <p className="mt-2 text-text-muted">Agentlik paneli</p>
      </div>

      {(isExpired || isQuotaFull) && (
        <div className="rounded-lg border border-error bg-error/10 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-error" />
            <p className="text-sm text-error">
              Paketiniz bitib. Yeni paket üçün admin ilə əlaqə saxlayın:{' '}
              <a
                href="mailto:zamcapital.biznes@gmail.com"
                className="font-medium underline"
              >
                zamcapital.biznes@gmail.com
              </a>
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Ümumi Elanlar</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">
                {stats.totalListings}
              </p>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Aktiv Elanlar</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">
                {stats.activeListings}
              </p>
            </div>
            <div className="rounded-full bg-success/10 p-3">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Gözləyən Elanlar</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">
                {stats.pendingListings}
              </p>
            </div>
            <div className="rounded-full bg-warning/10 p-3">
              <Clock className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Qalan Kvota</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">
                {activePackage
                  ? activePackage.listingQuota - activePackage.usedQuota
                  : 0}
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <PackageIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {activePackage && (
        <Card>
          <div className="border-b border-border p-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Aktiv Paket
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-text-primary">
                  {activePackage.name}
                </p>
                <p className="text-sm text-text-muted">
                  {activePackage.usedQuota} / {activePackage.listingQuota} istifadə
                </p>
              </div>
              <p className="text-sm text-text-muted">
                {new Date(activePackage.validUntil).toLocaleDateString('az-AZ')} qədər
              </p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
              <div
                className={`h-full transition-all ${getProgressColor()}`}
                style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="border-b border-border p-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Son Elanlar
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Başlıq
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Baxış
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Tarix
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentListings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                    Hələ ki elan yoxdur
                  </td>
                </tr>
              ) : (
                recentListings.map((listing) => (
                  <tr key={listing.id}>
                    <td className="px-6 py-4 text-text-primary">
                      {listing.title}
                    </td>
                    <td className="px-6 py-4">
                      {listing.status === 'ACTIVE' && (
                        <Badge variant="green">Aktiv</Badge>
                      )}
                      {listing.status === 'PENDING' && (
                        <Badge variant="yellow">Gözləyir</Badge>
                      )}
                      {listing.status === 'REJECTED' && (
                        <Badge variant="red">Rədd edildi</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-primary">
                      {listing.views}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {new Date(listing.createdAt).toLocaleDateString('az-AZ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
