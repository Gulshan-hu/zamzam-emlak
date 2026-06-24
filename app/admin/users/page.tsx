import { prisma } from '@/lib/prisma'
import { UsersClient } from '@/components/admin/UsersClient'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const search = searchParams.search || ''

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      agency: { select: { id: true, name: true } },
      _count: { select: { listings: true } },
    },
  })

  const agencies = await prisma.agency.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">İstifadəçilər</h1>
        <p className="text-text-muted">İstifadəçiləri idarə edin</p>
      </div>

      <UsersClient users={users} agencies={agencies} initialSearch={search} />
    </div>
  )
}
