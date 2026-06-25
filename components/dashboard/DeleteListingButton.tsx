'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Trash2 } from 'lucide-react'

interface DeleteListingButtonProps {
  listingId: string
}

export function DeleteListingButton({ listingId }: DeleteListingButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
        setIsOpen(false)
      } else {
        alert('Elanı silmək mümkün olmadı')
      }
    } catch (error) {
      alert('Xəta baş verdi')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <Trash2 className="h-4 w-4 text-error" />
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Elanı Sil"
      >
        <div className="space-y-4">
          <p className="text-text-muted">
            Bu elanı silmək istədiyinizdən əminsiniz? Bu əməliyyat geri
            qaytarıla bilməz.
          </p>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Silinir...' : 'Bəli, Sil'}
            </Button>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Ləğv Et
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
