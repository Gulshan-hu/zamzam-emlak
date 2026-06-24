import { prisma } from '@/lib/prisma'
import { AgenciesClient } from '@/components/admin/AgenciesClient'

export default async function AdminAgenciesPage() {
  const agencies = await prisma.agency.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      packages: {
        where: { isActive: true },
        take: 1,
      },
      _count: { select: { listings: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Agentliklər</h1>
        <p className="text-text-muted">Agentlikləri və paketləri idarə edin</p>
      </div>

      <AgenciesClient agencies={agencies} />
    </div>
  )
}
