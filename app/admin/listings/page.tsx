import { prisma } from '@/lib/prisma'
import { ListingsClient } from '@/components/admin/ListingsClient'

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const tab = (searchParams.tab as 'PENDING' | 'ACTIVE' | 'REJECTED') || 'PENDING'

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      agency: { select: { id: true, name: true } },
      images: { orderBy: { order: 'asc' }, take: 1 },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Elanlar</h1>
        <p className="text-text-muted">Elanları təsdiqləyin və ya rədd edin</p>
      </div>

      <ListingsClient listings={listings} initialTab={tab} />
    </div>
  )
}
