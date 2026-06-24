'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Search } from 'lucide-react'
import {
  updateUserRoleAction,
  toggleUserBlockAction,
  assignUserToAgencyAction,
} from '@/lib/actions/admin.actions'
import type { User, Agency } from '@/lib/types'

type UserWithRelations = User & {
  agency: Pick<Agency, 'id' | 'name'> | null
  _count: { listings: number }
}

interface UsersClientProps {
  users: UserWithRelations[]
  agencies: Pick<Agency, 'id' | 'name'>[]
  initialSearch: string
}

export function UsersClient({ users, agencies, initialSearch }: UsersClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/admin/users?search=${encodeURIComponent(search)}`)
  }

  const handleRoleChange = async (userId: string, role: string) => {
    setIsSubmitting(true)
    await updateUserRoleAction(userId, role as any)
    setIsSubmitting(false)
    router.refresh()
  }

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    setIsSubmitting(true)
    await toggleUserBlockAction(userId, !isBlocked)
    setIsSubmitting(false)
    router.refresh()
  }

  const handleAgencyChange = async (userId: string, agencyId: string) => {
    setIsSubmitting(true)
    await assignUserToAgencyAction(userId, agencyId || null)
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad və ya e-poçt ilə axtarın..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-4 text-text-primary"
          />
        </div>
        <Button type="submit" variant="primary">
          Axtar
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                İstifadəçi
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                Agentlik
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                Elanlar
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                Qeydiyyat
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                Əməliyyatlar
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
                  İstifadəçi tapılmadı
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-text-primary">{user.name}</p>
                      <p className="text-sm text-text-muted">{user.email}</p>
                      {user.phone && (
                        <p className="text-xs text-text-muted">{user.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isSubmitting}
                      className="rounded border border-border bg-surface px-2 py-1 text-sm text-text-primary"
                    >
                      <option value="USER">İstifadəçi</option>
                      <option value="AGENT">Agent</option>
                      <option value="AGENCY_OWNER">Agentlik Sahibi</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.agency?.id || ''}
                      onChange={(e) => handleAgencyChange(user.id, e.target.value)}
                      disabled={isSubmitting}
                      className="rounded border border-border bg-surface px-2 py-1 text-sm text-text-primary"
                    >
                      <option value="">Agentlik yoxdur</option>
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-text-primary">
                    {user._count.listings}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {new Date(user.createdAt).toLocaleDateString('az-AZ')}
                  </td>
                  <td className="px-6 py-4">
                    {user.isBlocked ? (
                      <Badge variant="red">Bloklanıb</Badge>
                    ) : (
                      <Badge variant="green">Aktiv</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                      disabled={isSubmitting}
                    >
                      {user.isBlocked ? 'Bloku götür' : 'Blokla'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
