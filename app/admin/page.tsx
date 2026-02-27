'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, CalendarDays, UserCheck, Clock } from 'lucide-react'
import { getDashboardStats } from './actions'

interface Stats {
  totalSellers: number
  totalEvents: number
  totalCustomers: number
  pendingSellers: number
  pendingEvents: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    getDashboardStats().then(setStats)
  }, [])

  if (!stats) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Tổng Sellers', value: stats.totalSellers, icon: UserCheck, href: '/admin/sellers', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Tổng Events', value: stats.totalEvents, icon: CalendarDays, href: '/admin/events', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Tổng Customers', value: stats.totalCustomers, icon: Users, href: '/admin/customers', color: 'text-green-500 bg-green-50 dark:bg-green-950/30' },
    { label: 'Chờ duyệt Seller', value: stats.pendingSellers, icon: Clock, href: '/admin/sellers?status=pending', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Tổng quan hệ thống TicketBox</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending alerts */}
      {(stats.pendingSellers > 0 || stats.pendingEvents > 0) && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Cần xử lý</h2>
          <div className="space-y-3">
            {stats.pendingSellers > 0 && (
              <Link
                href="/admin/sellers?status=pending"
                className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">{stats.pendingSellers} seller đang chờ duyệt KYC</span>
                </div>
                <span className="text-xs text-muted-foreground">Xem &rarr;</span>
              </Link>
            )}
            {stats.pendingEvents > 0 && (
              <Link
                href="/admin/events?status=pending_approval"
                className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">{stats.pendingEvents} event đang chờ duyệt</span>
                </div>
                <span className="text-xs text-muted-foreground">Xem &rarr;</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
