import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { Building2, LayoutDashboard, FileText, Package, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()

  if (!user) {
    redirect('/auth/login?returnUrl=/agency')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      role: true,
      agencyId: true,
      agency: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
    },
  })

  if (!dbUser || !dbUser.agencyId || (dbUser.role !== 'AGENCY_OWNER' && dbUser.role !== 'AGENT')) {
    redirect('/dashboard')
  }

  const navItems = [
    { href: '/agency', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agency/listings', label: 'Elanlar', icon: FileText },
    { href: '/agency/package', label: 'Paket & Kvota', icon: Package },
    ...(dbUser.role === 'AGENCY_OWNER'
      ? [{ href: '/agency/team', label: 'Komanda', icon: Users }]
      : []),
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-surface">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/agency" className="flex items-center gap-2">
            {dbUser.agency?.logo ? (
              <Image
                src={dbUser.agency.logo}
                alt={dbUser.agency.name}
                width={32}
                height={32}
                className="rounded"
              />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
            <span className="text-lg font-bold text-primary">
              {dbUser.agency?.name}
            </span>
          </Link>
        </div>

        <div className="p-4">
          <div className="mb-6 rounded-lg bg-surface-muted p-4">
            <p className="text-sm font-medium text-text-primary">{dbUser.name}</p>
            <Badge variant={dbUser.role === 'AGENCY_OWNER' ? 'blue' : 'green'} className="mt-2">
              {dbUser.role === 'AGENCY_OWNER' ? 'Agentlik Sahibi' : 'Agent'}
            </Badge>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-2 text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}
