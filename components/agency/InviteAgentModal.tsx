'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { UserPlus } from 'lucide-react'

interface InviteAgentModalProps {
  agencyId: string
}

export function InviteAgentModal({ agencyId }: InviteAgentModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleInvite = async () => {
    if (!email.trim()) {
      setError('E-poçt ünvanı tələb olunur')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/agency/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, agencyId }),
      })

      if (response.ok) {
        setIsOpen(false)
        setEmail('')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Dəvət göndərilmədi')
      }
    } catch (err) {
      setError('Xəta baş verdi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        <UserPlus className="mr-2 h-5 w-5" />
        Agenti Dəvət Et
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          setEmail('')
          setError('')
        }}
        title="Agenti Dəvət Et"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Agent kimi dəvət etmək istədiyiniz şəxsin e-poçt ünvanını daxil edin.
          </p>
          <Input
            type="email"
            label="E-poçt"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            disabled={isSubmitting}
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleInvite}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Göndərilir...' : 'Dəvət Göndər'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsOpen(false)
                setEmail('')
                setError('')
              }}
            >
              Ləğv Et
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
