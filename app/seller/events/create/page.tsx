'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createEvent } from '../../actions'

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createEvent(formData)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/seller/events/${result.eventId}`)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/seller/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Link>

      <h1 className="text-2xl font-bold mb-6">Tạo sự kiện mới</h1>

      <form action={handleSubmit} className="space-y-6">
        {/* Event info */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-semibold border-b border-border pb-3">Thông tin sự kiện</h2>

          <div>
            <label htmlFor="event_name" className="block text-sm font-medium mb-1.5">Tên sự kiện *</label>
            <input id="event_name" name="event_name" type="text" required
              className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="VD: Đêm nhạc Acoustic" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5">Mô tả</label>
            <textarea id="description" name="description" rows={4}
              className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Mô tả chi tiết về sự kiện..." />
          </div>

          <div>
            <label htmlFor="banner_url" className="block text-sm font-medium mb-1.5">URL hình banner</label>
            <input id="banner_url" name="banner_url" type="url"
              className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://example.com/banner.jpg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium mb-1.5">Bắt đầu *</label>
              <input id="start_time" name="start_time" type="datetime-local" required
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium mb-1.5">Kết thúc</label>
              <input id="end_time" name="end_time" type="datetime-local"
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-semibold border-b border-border pb-3">Địa điểm</h2>

          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium mb-1.5">Tên địa điểm</label>
            <input id="venue_name" name="venue_name" type="text"
              className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="VD: Nhà Văn hóa Thanh Niên" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="venue_city" className="block text-sm font-medium mb-1.5">Thành phố</label>
              <input id="venue_city" name="venue_city" type="text"
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="TP. Hồ Chí Minh" />
            </div>
            <div>
              <label htmlFor="venue_address" className="block text-sm font-medium mb-1.5">Địa chỉ</label>
              <input id="venue_address" name="venue_address" type="text"
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="4 Phạm Ngọc Thạch, Q.1" />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Đang tạo...</> : 'Tạo sự kiện'}
          </Button>
          <Link href="/seller/events">
            <Button type="button" variant="outline">Hủy</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
