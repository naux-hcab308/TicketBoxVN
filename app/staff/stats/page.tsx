'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  BarChart3, Users, Ticket, CheckCircle2, Clock,
  ArrowLeft, Loader2, CalendarDays, XCircle, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getEventCheckinStats, getAssignedEvents } from '../actions'

interface Stats {
  totalTickets: number
  remaining: number
  checkedIn: number
  recentLogs: Array<{
    checkin_id: string
    result: string
    checkin_time: string
    note: string | null
    tickets: { code: string }[] | null
  }>
}

interface Event {
  event_id: string
  event_name: string
  start_time: string
  end_time: string
  status: string
  venues: { venue_name: string; city: string }[] | null
}

export default function StaffStatsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const eventIdParam = searchParams.get('eventId')
  const [selectedEventId, setSelectedEventId] = useState(eventIdParam ?? '')
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    getAssignedEvents().then((data) => {
      setEvents(data as Event[])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedEventId) return
    setLoadingStats(true)
    getEventCheckinStats(selectedEventId).then((data) => {
      setStats(data)
      setLoadingStats(false)
    })
  }, [selectedEventId])

  function refreshStats() {
    if (!selectedEventId) return
    setLoadingStats(true)
    getEventCheckinStats(selectedEventId).then((data) => {
      setStats(data)
      setLoadingStats(false)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const percentage = stats ? (stats.totalTickets > 0 ? Math.round((stats.checkedIn / stats.totalTickets) * 100) : 0) : 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Thống kê check-in
        </h1>
      </div>

      {/* Event selector */}
      <div className="bg-card border border-border rounded-xl p-4">
        <label className="block text-sm font-medium mb-2">Chọn sự kiện</label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-3 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">-- Chọn sự kiện --</option>
          {events.map((ev) => (
            <option key={ev.event_id} value={ev.event_id}>
              {ev.event_name}
            </option>
          ))}
        </select>
      </div>

      {!selectedEventId && (
        <div className="text-center py-12">
          <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Chọn sự kiện để xem thống kê</p>
        </div>
      )}

      {loadingStats && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {selectedEventId && stats && !loadingStats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <Ticket className="w-5 h-5 mx-auto text-blue-500 mb-1" />
              <p className="text-2xl font-bold">{stats.totalTickets}</p>
              <p className="text-xs text-muted-foreground">Tổng vé</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <CheckCircle2 className="w-5 h-5 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.checkedIn}</p>
              <p className="text-xs text-muted-foreground">Đã check-in</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-2xl font-bold">{stats.remaining}</p>
              <p className="text-xs text-muted-foreground">Còn lại</p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tỷ lệ check-in</span>
              <span className="text-sm font-bold text-primary">{percentage}%</span>
            </div>
            <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {stats.checkedIn} / {stats.totalTickets} khách đã đến
            </p>
          </div>

          {/* Refresh */}
          <Button variant="outline" className="w-full" onClick={refreshStats}>
            Cập nhật thống kê
          </Button>

          {/* Recent Logs */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Lịch sử check-in gần đây</h2>
            </div>

            {stats.recentLogs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Chưa có lượt check-in nào
              </p>
            ) : (
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {stats.recentLogs.map((log) => (
                  <div key={log.checkin_id} className="px-4 py-3 flex items-center gap-3">
                    {log.result === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : log.result === 'duplicate' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-medium truncate">
                        {log.tickets?.[0]?.code ?? 'Unknown'}
                      </p>
                      {log.note && (
                        <p className="text-xs text-muted-foreground truncate">{log.note}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.checkin_time).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
