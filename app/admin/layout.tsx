import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileText, Users, Building2, LayoutDashboard } from 'lucide-react'
import { getServerUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/Badge'

async function getAdminData() {
  const [pendingCount, unverifiedCount] = await Promise.all([
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.agency.count({ where: { isVerified: false } }),
  ])

  return { pendingCount, unverifiedCount }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()

  if (!user) {
    redirect('/auth/login?returnUrl=/admin')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, name: true },
  })

  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/')
  }

  const { pendingCount, unverifiedCount } = await getAdminData()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    {
      href: '/admin/listings',
      label: 'Elanlar',
      icon: FileText,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { href: '/admin/users', label: 'İstifadəçilər', icon: Users },
    {
      href: '/admin/agencies',
      label: 'Agentliklər',
      icon: Building2,
      badge: unverifiedCount > 0 ? unverifiedCount : null,
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-surface">
        <div className="flex h-16 items-center border-b border-border px-6">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
        </div>

        <div className="p-4">
          <div className="mb-6 rounded-lg bg-surface-muted p-4">
            <p className="text-sm font-medium text-text-primary">{dbUser.name}</p>
            <Badge variant="green" className="mt-2">
              ADMIN
            </Badge>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-4 py-2 text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant="red" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
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
