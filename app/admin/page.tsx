import { Card } from '@/components/ui/Card'
import { getDashboardStats, getRecentActivity } from '@/lib/actions/admin.actions'
import { FileText, Users, Building2, CheckCircle, Clock, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const [statsResult, activityResult] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
  ])

  if (!statsResult.success || !activityResult.success) {
    return (
      <div className="text-center text-error">
        Failed to load dashboard data
      </div>
    )
  }

  const stats = statsResult.data
  const activity = activityResult.data

  const statCards = [
    {
      title: 'Ümumi Elanlar',
      value: stats.totalListings,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Gözləyən Elanlar',
      value: stats.pendingReview,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'Aktiv Elanlar',
      value: stats.activeListings,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'İstifadəçilər',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Agentliklər',
      value: stats.totalAgencies,
      icon: Building2,
      color: 'text-primary',
    },
    {
      title: 'Bu Gün Yeni',
      value: stats.todayNewListings,
      icon: TrendingUp,
      color: 'text-accent',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted">Admin panel statistikası</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-text-primary">
                  {stat.value}
                </p>
              </div>
              <div className={`rounded-full bg-surface-muted p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-border p-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Son Fəaliyyətlər
          </h2>
        </div>
        <div className="divide-y divide-border">
          {activity.length === 0 ? (
            <div className="p-6 text-center text-text-muted">
              Hələ ki fəaliyyət yoxdur
            </div>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-6">
                <div>
                  <p className="text-text-primary">{item.description}</p>
                  <p className="mt-1 text-sm text-text-muted">
                    {new Date(item.createdAt).toLocaleString('az-AZ', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.type === 'listing_approved'
                      ? 'bg-success/10 text-success'
                      : item.type === 'listing_rejected'
                      ? 'bg-error/10 text-error'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {item.type === 'listing_approved'
                    ? 'Təsdiqləndi'
                    : item.type === 'listing_rejected'
                    ? 'Rədd edildi'
                    : item.type === 'user_registered'
                    ? 'Yeni İstifadəçi'
                    : 'Yeni Agentlik'}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
