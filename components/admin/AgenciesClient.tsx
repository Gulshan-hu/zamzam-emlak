'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Building2 } from 'lucide-react'
import {
  toggleAgencyVerificationAction,
  createAgencyPackageAction,
  resetAgencyQuotaAction,
  deleteAgencyAction,
} from '@/lib/actions/admin.actions'
import { prisma } from '@/lib/prisma'
import type { Agency, AgencyPackage } from '@/lib/types'

type AgencyWithRelations = Agency & {
  packages: AgencyPackage[]
  _count: { listings: number }
}

interface AgenciesClientProps {
  agencies: AgencyWithRelations[]
}

export function AgenciesClient({ agencies }: AgenciesClientProps) {
  const router = useRouter()
  const [packageModalOpen, setPackageModalOpen] = useState(false)
  const [selectedAgency, setSelectedAgency] = useState<AgencyWithRelations | null>(null)
  const [packageForm, setPackageForm] = useState({
    name: '',
    listingQuota: 500,
    priceAZN: 0,
    validMonths: 1,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const openPackageModal = (agency: AgencyWithRelations) => {
    setSelectedAgency(agency)
    setPackageModalOpen(true)
  }

  const handleToggleVerification = async (agencyId: string, isVerified: boolean) => {
    setIsSubmitting(true)
    await toggleAgencyVerificationAction(agencyId, !isVerified)
    setIsSubmitting(false)
    router.refresh()
  }

  const handleCreatePackage = async () => {
    if (!selectedAgency) return
    setIsSubmitting(true)
    const result = await createAgencyPackageAction({
      agencyId: selectedAgency.id,
      ...packageForm,
    })
    setIsSubmitting(false)
    if (result.success) {
      setPackageModalOpen(false)
      setPackageForm({ name: '', listingQuota: 500, priceAZN: 0, validMonths: 1 })
      router.refresh()
    }
  }

  const handleResetQuota = async (packageId: string) => {
    setIsSubmitting(true)
    await resetAgencyQuotaAction(packageId)
    setIsSubmitting(false)
    router.refresh()
  }

  const handleDelete = async (agencyId: string) => {
    setIsSubmitting(true)
    await deleteAgencyAction(agencyId)
    setIsSubmitting(false)
    setDeleteConfirmId(null)
    router.refresh()
  }

  const activePackage = selectedAgency?.packages[0]

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                Agentlik
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                Aktiv Paket
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                Elanlar
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                Əməliyyatlar
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {agencies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                  Agentlik yoxdur
                </td>
              </tr>
            ) : (
              agencies.map((agency) => {
                const pkg = agency.packages[0]
                return (
                  <tr key={agency.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                          {agency.logo ? (
                            <Image
                              src={agency.logo}
                              alt={agency.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-surface-muted">
                              <Building2 className="h-5 w-5 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{agency.name}</p>
                          {agency.phone && (
                            <p className="text-xs text-text-muted">{agency.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {agency.isVerified ? (
                        <Badge variant="green">Təsdiqlənib</Badge>
                      ) : (
                        <Badge variant="yellow">Gözləyir</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {pkg ? (
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {pkg.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {pkg.usedQuota} / {pkg.listingQuota} istifadə
                          </p>
                          <p className="text-xs text-text-muted">
                            {new Date(pkg.validUntil).toLocaleDateString('az-AZ')} qədər
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted">Paket yoxdur</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-primary">
                      {agency._count.listings}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openPackageModal(agency)}
                        >
                          Paketi idarə et
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleToggleVerification(agency.id, agency.isVerified)
                          }
                          disabled={isSubmitting}
                        >
                          {agency.isVerified ? 'Ləğv et' : 'Təsdiqlə'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDeleteConfirmId(agency.id)}
                          disabled={isSubmitting}
                        >
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={packageModalOpen}
        onClose={() => {
          setPackageModalOpen(false)
          setSelectedAgency(null)
        }}
        title={`Paket İdarəsi: ${selectedAgency?.name}`}
      >
        <div className="space-y-6">
          {activePackage && (
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-2 font-semibold text-text-primary">Aktiv Paket</h3>
              <p className="text-sm text-text-muted">
                {activePackage.name} - {activePackage.usedQuota} / {activePackage.listingQuota}{' '}
                istifadə
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${
                      (activePackage.usedQuota / activePackage.listingQuota) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => handleResetQuota(activePackage.id)}
                disabled={isSubmitting}
              >
                Kvotanı Sıfırla
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Yeni Paket Əlavə Et</h3>
            <Input
              label="Paket Adı"
              placeholder="Məsələn: Standart 500"
              value={packageForm.name}
              onChange={(e) =>
                setPackageForm({ ...packageForm, name: e.target.value })
              }
            />
            <Input
              type="number"
              label="Elan Kvotası"
              value={packageForm.listingQuota}
              onChange={(e) =>
                setPackageForm({
                  ...packageForm,
                  listingQuota: parseInt(e.target.value) || 0,
                })
              }
            />
            <Input
              type="number"
              label="Qiymət (AZN)"
              value={packageForm.priceAZN}
              onChange={(e) =>
                setPackageForm({
                  ...packageForm,
                  priceAZN: parseFloat(e.target.value) || 0,
                })
              }
            />
            <Select
              label="Etibarlılıq Müddəti"
              value={packageForm.validMonths.toString()}
              onChange={(e) =>
                setPackageForm({
                  ...packageForm,
                  validMonths: parseInt(e.target.value),
                })
              }
              options={[
                { value: '1', label: '1 ay' },
                { value: '3', label: '3 ay' },
                { value: '6', label: '6 ay' },
                { value: '12', label: '12 ay' },
              ]}
            />
            <Button
              variant="primary"
              onClick={handleCreatePackage}
              disabled={!packageForm.name || isSubmitting}
            >
              Paketi Əlavə Et
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Agentliyi Sil"
      >
        <div className="space-y-4">
          <p className="text-text-muted">
            Bu agentliyi silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
          </p>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={isSubmitting}
            >
              Bəli, Sil
            </Button>
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              Ləğv Et
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
