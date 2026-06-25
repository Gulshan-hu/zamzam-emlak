import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth-server'
import { getAgencyByUserId, getAgencyTeam } from '@/lib/agency'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { InviteAgentModal } from '@/components/agency/InviteAgentModal'
import { RemoveAgentButton } from '@/components/agency/RemoveAgentButton'

export const dynamic = 'force-dynamic'

export default async function AgencyTeamPage() {
  const user = await getServerUser()

  if (!user) {
    redirect('/auth/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, agencyId: true },
  })

  if (!dbUser?.agencyId || dbUser.role !== 'AGENCY_OWNER') {
    redirect('/agency')
  }

  const agency = await getAgencyByUserId(user.id)

  if (!agency) {
    redirect('/dashboard')
  }

  const team = await getAgencyTeam(agency.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Komanda</h1>
          <p className="mt-2 text-text-muted">Agentlik komandanızı idarə edin</p>
        </div>
        <InviteAgentModal agencyId={agency.id} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Ad
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  E-poçt
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Elanlar
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Qoşulma Tarixi
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">
                  Əməliyyatlar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {team.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    Komanda üzvü yoxdur
                  </td>
                </tr>
              ) : (
                team.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 text-text-primary">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 text-text-primary">
                      {member.email}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          member.role === 'AGENCY_OWNER' ? 'blue' : 'green'
                        }
                      >
                        {member.role === 'AGENCY_OWNER'
                          ? 'Agentlik Sahibi'
                          : 'Agent'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-text-primary">
                      {(member as typeof member & { _count: { listings: number } })._count.listings}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {new Date(member.createdAt).toLocaleDateString('az-AZ')}
                    </td>
                    <td className="px-6 py-4">
                      {member.role !== 'AGENCY_OWNER' && (
                        <RemoveAgentButton
                          userId={member.id}
                          userName={member.name}
                        />
                      )}
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
