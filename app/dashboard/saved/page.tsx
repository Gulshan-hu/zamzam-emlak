import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { SavedListingsGrid } from '@/components/dashboard/SavedListingsGrid'

export const dynamic = 'force-dynamic'

export default async function DashboardSavedPage() {
  const user = await getServerUser()

  if (!user) {
    redirect('/auth/login')
  }

  const savedListings = await prisma.savedListing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          agency: true,
          user: { select: { name: true, phone: true } },
        },
      },
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">
          Saxlanılan Elanlar
        </h1>
        <p className="mt-2 text-text-muted">
          Saxladığınız {savedListings.length} elan
        </p>
      </div>

      <SavedListingsGrid savedListings={savedListings} />
    </div>
  )
}
