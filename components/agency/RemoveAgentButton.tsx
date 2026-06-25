'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Trash2 } from 'lucide-react'

interface RemoveAgentButtonProps {
  userId: string
  userName: string
}

export function RemoveAgentButton({ userId, userName }: RemoveAgentButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)

    try {
      const response = await fetch('/api/agency/remove-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        setIsOpen(false)
        router.refresh()
      } else {
        alert('Agent çıxarıla bilmədi')
      }
    } catch (error) {
      alert('Xəta baş verdi')
    } finally {
      setIsRemoving(false)
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
        title="Agenti Çıxart"
      >
        <div className="space-y-4">
          <p className="text-text-muted">
            <strong>{userName}</strong> agenti agentlikdən çıxartmaq istədiyinizdən
            əminsiniz? Bu istifadəçinin rolu USER-ə dəyişdiriləcək.
          </p>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? 'Çıxarılır...' : 'Bəli, Çıxart'}
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
