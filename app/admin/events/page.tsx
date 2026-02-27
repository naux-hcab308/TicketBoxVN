'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, Eye, CalendarDays } from 'lucide-react'
import { getEvents } from '../actions'

const STATUS_TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending_approval', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'published', label: 'Đang bán' },
  { value: 'cancelled', label: 'Đã hủy' },
]

const STATUS_BADGE: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', label: 'Nháp' },
  pending_approval: { class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Chờ duyệt' },
  approved: { class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Đã duyệt' },
  published: { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Đang bán' },
  cancelled: { class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Đã hủy' },
  completed: { class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Hoàn thành' },
}

export default function EventsPage() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'
  const [activeTab, setActiveTab] = useState(initialStatus)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    getEvents(activeTab).then(({ data }) => {
      setEvents(data)
      setLoading(false)
    })
  }, [activeTab])

  const filtered = events.filter((e) => {
    const term = search.toLowerCase()
    return (
      e.event_name?.toLowerCase().includes(term) ||
      e.seller_profiles?.business_name?.toLowerCase().includes(term) ||
      e.venues?.venue_name?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý Events</h1>
        <p className="text-muted-foreground mt-1">Danh sách sự kiện trên hệ thống</p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-1 bg-secondary rounded-lg p-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sự kiện</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nhà tổ chức</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Địa điểm</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Thời gian</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-secondary rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Không tìm thấy event nào
                  </td>
                </tr>
              ) : (
                filtered.map((event) => (
                  <tr key={event.event_id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {event.banner_url ? (
                          <img src={event.banner_url} alt="" className="w-10 h-10 rounded-md object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <CalendarDays className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <span className="font-medium">{event.event_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{event.seller_profiles?.business_name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {event.venues ? `${event.venues.venue_name}, ${event.venues.city}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(event.start_time).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[event.status]?.class || ''}`}>
                        {STATUS_BADGE[event.status]?.label || event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/events/${event.event_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
