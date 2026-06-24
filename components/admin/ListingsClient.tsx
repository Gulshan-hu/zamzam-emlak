'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { CheckCircle, XCircle, Edit } from 'lucide-react'
import {
  approveListingAction,
  rejectListingAction,
  bulkApproveListingsAction,
  bulkRejectListingsAction,
} from '@/lib/actions/admin.actions'
import type { Listing, User, Agency, ListingImage } from '@/lib/types'

type ListingWithRelations = Listing & {
  user: Pick<User, 'id' | 'name' | 'email'>
  agency: Pick<Agency, 'id' | 'name'> | null
  images: ListingImage[]
}

interface ListingsClientProps {
  listings: ListingWithRelations[]
  initialTab: 'PENDING' | 'ACTIVE' | 'REJECTED'
}

export function ListingsClient({ listings, initialTab }: ListingsClientProps) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'REJECTED'>(initialTab)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredListings = listings.filter((l) => l.status === activeTab)

  const handleApprove = async (id: string) => {
    setIsSubmitting(true)
    const result = await approveListingAction(id)
    setIsSubmitting(false)
    if (result.success) {
      window.location.reload()
    }
  }

  const openRejectModal = (id: string) => {
    setRejectingId(id)
    setRejectModalOpen(true)
  }

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) return
    setIsSubmitting(true)
    const result = await rejectListingAction(rejectingId, rejectReason)
    setIsSubmitting(false)
    if (result.success) {
      setRejectModalOpen(false)
      setRejectingId(null)
      setRejectReason('')
      window.location.reload()
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return
    setIsSubmitting(true)
    const result = await bulkApproveListingsAction(selectedIds)
    setIsSubmitting(false)
    if (result.success) {
      setSelectedIds([])
      window.location.reload()
    }
  }

  const handleBulkReject = async () => {
    if (selectedIds.length === 0 || !rejectReason.trim()) return
    setIsSubmitting(true)
    const result = await bulkRejectListingsAction(selectedIds, rejectReason)
    setIsSubmitting(false)
    if (result.success) {
      setSelectedIds([])
      setRejectModalOpen(false)
      setRejectReason('')
      window.location.reload()
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredListings.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredListings.map((l) => l.id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex gap-2">
          {(['PENDING', 'ACTIVE', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setSelectedIds([])
              }}
              className={`border-b-2 px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab === 'PENDING'
                ? 'Gözləyən'
                : tab === 'ACTIVE'
                ? 'Aktiv'
                : 'Rədd Edilmiş'}
              <span className="ml-2 text-sm">
                ({listings.filter((l) => l.status === tab).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'PENDING' && selectedIds.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-surface-muted p-4">
          <span className="text-sm text-text-primary">
            {selectedIds.length} seçildi
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleBulkApprove}
            disabled={isSubmitting}
          >
            Hamısını Təsdiqlə
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRejectModalOpen(true)}
            disabled={isSubmitting}
          >
            Hamısını Rədd Et
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {activeTab === 'PENDING' && filteredListings.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredListings.length}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm text-text-muted">Hamısını seç</span>
          </div>
        )}

        {filteredListings.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-12 text-center text-text-muted">
            Bu statusda elan yoxdur
          </div>
        ) : (
          filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="flex gap-4 rounded-lg border border-border bg-surface p-4"
            >
              {activeTab === 'PENDING' && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(listing.id)}
                  onChange={() => toggleSelect(listing.id)}
                  className="mt-1 h-4 w-4 rounded border-border"
                />
              )}

              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
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
                <h3 className="font-semibold text-text-primary">{listing.title}</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {new Intl.NumberFormat('az-AZ').format(listing.price)} ₼ • {listing.city}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-text-muted">{listing.user.name}</span>
                  {listing.agency && (
                    <Badge variant="blue" className="text-xs">
                      {listing.agency.name}
                    </Badge>
                  )}
                  <span className="text-xs text-text-muted">
                    {new Date(listing.createdAt).toLocaleDateString('az-AZ')}
                  </span>
                </div>
              </div>

              {activeTab === 'PENDING' && (
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(listing.id)}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openRejectModal(listing.id)}
                    disabled={isSubmitting}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {listing.status === 'REJECTED' && listing.rejectionReason && (
                <div className="shrink-0 max-w-xs rounded bg-error/10 p-2 text-xs text-error">
                  {listing.rejectionReason}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false)
          setRejectingId(null)
          setRejectReason('')
        }}
        title="Elanı Rədd Et"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Rədd səbəbini qeyd edin (istifadəçiyə göndəriləcək):
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Məsələn: Şəkillər keyfiyyətsizdir..."
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text-primary"
            rows={4}
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={selectedIds.length > 0 ? handleBulkReject : handleReject}
              disabled={!rejectReason.trim() || isSubmitting}
            >
              Rədd Et
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectModalOpen(false)
                setRejectingId(null)
                setRejectReason('')
              }}
            >
              Ləğv Et
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
