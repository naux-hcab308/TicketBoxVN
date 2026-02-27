'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CalendarDays, MapPin, Building2, Clock,
  Ticket, CheckCircle2, XCircle, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getEventDetail, updateEventStatus } from '../../actions'

const STATUS_BADGE: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-gray-100 text-gray-600', label: 'Nháp' },
  pending_approval: { class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Chờ duyệt' },
  approved: { class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Đã duyệt' },
  published: { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Đang bán' },
  cancelled: { class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Đã hủy' },
  completed: { class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Hoàn thành' },
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    getEventDetail(id).then((data) => {
      setEvent(data)
      setLoading(false)
    })
  }, [id])

  async function handleAction(status: 'published' | 'cancelled') {
    setActionLoading(true)
    const result = await updateEventStatus(id, status, adminNote || undefined)
    if (result.success) {
      const updated = await getEventDetail(id)
      setEvent(updated)
      setAdminNote('')
    }
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) {
    return <div className="p-8 text-center text-muted-foreground">Không tìm thấy event.</div>
  }

  const badge = STATUS_BADGE[event.status] || STATUS_BADGE.draft
  const isPending = event.status === 'pending_approval'

  function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{event.event_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {isPending && (
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => handleAction('published')}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Duyệt & Đăng bán
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAction('cancelled')}
              disabled={actionLoading}
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Từ chối
            </Button>
          </div>
        )}
      </div>

      {/* Admin Note (when pending) */}
      {isPending && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <label className="block text-sm font-medium mb-2">Ghi chú admin (tùy chọn)</label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Lý do duyệt hoặc từ chối..."
            rows={3}
            className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
          />
        </div>
      )}

      <div className="space-y-6">
        {/* Banner */}
        {event.banner_url && (
          <div className="rounded-xl overflow-hidden border border-border">
            <img src={event.banner_url} alt={event.event_name} className="w-full h-56 object-cover" />
          </div>
        )}

        {/* Event Info */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Thông tin sự kiện</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoItem icon={<Building2 className="w-4 h-4" />} label="Nhà tổ chức" value={event.seller_profiles?.business_name} />
            <InfoItem icon={<MapPin className="w-4 h-4" />} label="Địa điểm" value={
              event.venues ? `${event.venues.venue_name}${event.venues.city ? `, ${event.venues.city}` : ''}` : null
            } />
            <InfoItem icon={<CalendarDays className="w-4 h-4" />} label="Bắt đầu" value={
              new Date(event.start_time).toLocaleString('vi-VN')
            } />
            <InfoItem icon={<Clock className="w-4 h-4" />} label="Kết thúc" value={
              event.end_time ? new Date(event.end_time).toLocaleString('vi-VN') : null
            } />
          </div>
          {event.description && (
            <div className="px-6 pb-6">
              <p className="text-xs text-muted-foreground mb-1">Mô tả</p>
              <p className="text-sm whitespace-pre-line">{event.description}</p>
            </div>
          )}
        </div>

        {/* Ticket Types */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Loại vé ({event.ticket_types?.length || 0})
            </h2>
          </div>
          {event.ticket_types && event.ticket_types.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tên vé</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Giá</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Tổng</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Đã bán</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bán từ</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Đến</th>
                  </tr>
                </thead>
                <tbody>
                  {event.ticket_types.map((t: any) => (
                    <tr key={t.ticket_type_id} className="border-b border-border">
                      <td className="px-4 py-3 font-medium">{t.type_name}</td>
                      <td className="px-4 py-3 text-right">{formatPrice(t.price)}</td>
                      <td className="px-4 py-3 text-right">{t.quantity_total}</td>
                      <td className="px-4 py-3 text-right">{t.quantity_sold}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {t.sale_start ? new Date(t.sale_start).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {t.sale_end ? new Date(t.sale_end).toLocaleDateString('vi-VN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground text-sm">Chưa có loại vé nào</div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm">{value || '—'}</p>
      </div>
    </div>
  )
}
