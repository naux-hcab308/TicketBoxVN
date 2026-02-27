'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Ticket, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { getSellerDashboardStats } from './actions'

interface Stats {
  totalEvents: number
  publishedEvents: number
  totalTicketsSold: number
  totalStaff: number
  kycStatus: string
  businessName: string
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    getSellerDashboardStats().then(setStats)
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
    { label: 'Tổng sự kiện', value: stats.totalEvents, icon: CalendarDays, href: '/seller/events', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Đang bán vé', value: stats.publishedEvents, icon: TrendingUp, href: '/seller/events?status=published', color: 'text-green-500 bg-green-50 dark:bg-green-950/30' },
    { label: 'Vé đã bán', value: stats.totalTicketsSold, icon: Ticket, href: '/seller/events', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Nhân viên', value: stats.totalStaff, icon: Users, href: '/seller/staff', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30' },
  ]

  const kycBadge: Record<string, { class: string; label: string }> = {
    pending: { class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Đang chờ duyệt KYC' },
    verified: { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Đã xác minh' },
    rejected: { class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'KYC bị từ chối' },
  }

  const kyc = kycBadge[stats.kycStatus] || kycBadge.pending

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Xin chào, {stats.businessName}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${kyc.class}`}>{kyc.label}</span>
        </div>
      </div>

      {stats.kycStatus === 'pending' && (
        <div className="mb-6 p-4 rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Tài khoản chưa được xác minh</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Hoàn tất hồ sơ KYC để có thể đăng bán vé sự kiện.</p>
          </div>
        </div>
      )}

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

      {/* Quick actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/seller/events/create" className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-center">
            <CalendarDays className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-sm font-medium">Tạo sự kiện mới</span>
          </Link>
          <Link href="/seller/staff" className="p-4 rounded-lg bg-orange-500/5 hover:bg-orange-500/10 transition-colors text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <span className="text-sm font-medium">Quản lý nhân viên</span>
          </Link>
          <Link href="/seller/profile" className="p-4 rounded-lg bg-purple-500/5 hover:bg-purple-500/10 transition-colors text-center">
            <Ticket className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <span className="text-sm font-medium">Cập nhật hồ sơ</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
