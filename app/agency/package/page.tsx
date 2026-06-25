import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth-server'
import { getAgencyByUserId, getPackageHistory } from '@/lib/agency'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Mail } from 'lucide-react'

export default async function AgencyPackagePage() {
  const user = await getServerUser()

  if (!user) {
    redirect('/auth/login')
  }

  const agency = await getAgencyByUserId(user.id)

  if (!agency) {
    redirect('/dashboard')
  }

  const packages = await getPackageHistory(agency.id)
  const activePackage = packages.find((p) => p.isActive)

  const quotaPercentage = activePackage
    ? (activePackage.usedQuota / activePackage.listingQuota) * 100
    : 0

  const getProgressColor = () => {
    if (quotaPercentage >= 95) return 'bg-error'
    if (quotaPercentage >= 80) return 'bg-warning'
    return 'bg-success'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Paket & Kvota</h1>
        <p className="mt-2 text-text-muted">Paket məlumatlarınız və kvota istifadəsi</p>
      </div>

      {activePackage && (
        <Card>
          <div className="border-b border-border p-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Aktiv Paket
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-text-muted">Paket Adı</p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {activePackage.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Etibarlılıq</p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {new Date(activePackage.validUntil).toLocaleDateString('az-AZ')} qədər
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Ümumi Kvota</p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {activePackage.listingQuota} elan
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Qalan Kvota</p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {activePackage.listingQuota - activePackage.usedQuota} elan
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-text-muted">Kvota İstifadəsi</p>
                <p className="text-sm font-medium text-text-primary">
                  {activePackage.usedQuota} / {activePackage.listingQuota}
                </p>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={`h-full transition-all ${getProgressColor()}`}
                  style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="border-b border-border p-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Paket Tarixçəsi
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Paket Adı
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Kvota
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Qiymət
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Etibarlılıq
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Paket tarixçəsi yoxdur
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 text-text-primary">{pkg.name}</td>
                    <td className="px-6 py-4 text-text-primary">
                      {pkg.listingQuota}
                    </td>
                    <td className="px-6 py-4 text-text-primary">
                      {pkg.priceAZN} ₼
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {new Date(pkg.validUntil).toLocaleDateString('az-AZ')}
                    </td>
                    <td className="px-6 py-4">
                      {pkg.isActive ? (
                        <Badge variant="green">Aktiv</Badge>
                      ) : (
                        <Badge variant="gray">Deaktiv</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="border-l-4 border-l-primary bg-primary/5">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">
                Yeni Paket Almaq İstəyirsiniz?
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                Yeni paket almaq üçün bizimlə əlaqə saxlayın:{' '}
                <a
                  href="mailto:zamcapital.biznes@gmail.com"
                  className="font-medium text-primary hover:underline"
                >
                  zamcapital.biznes@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
