'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, MapPin, Clock, ChevronRight, Loader2 } from 'lucide-react'
import { getAssignedEvents } from './actions'

interface Event {
  event_id: string
  event_name: string
  start_time: string
  end_time: string
  status: string
  venues: { venue_name: string; city: string }[] | null
}

export default function StaffEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAssignedEvents().then((data) => {
      setEvents(data as Event[])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Chọn sự kiện</h1>
        <p className="text-sm text-muted-foreground">Chọn sự kiện để bắt đầu check-in</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Chưa có sự kiện nào được phân công</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const isOngoing =
              new Date(event.start_time) <= new Date() && new Date(event.end_time) >= new Date()
            return (
              <button
                key={event.event_id}
                onClick={() => router.push(`/staff/checkin?eventId=${event.event_id}&eventName=${encodeURIComponent(event.event_name)}`)}
                className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isOngoing && (
                        <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Đang diễn ra
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold truncate">{event.event_name}</h3>
                    {event.venues?.[0] && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {event.venues[0].venue_name}, {event.venues[0].city}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      {new Date(event.start_time).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
