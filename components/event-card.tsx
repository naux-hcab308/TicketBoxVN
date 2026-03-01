'use client'

import Link from 'next/link'

type CategoryShape = { slug: string; name: string; name_vi: string | null }

interface EventCardProps {
  event: {
    event_id: string
    event_name: string
    description: string | null
    banner_url: string | null
    start_time: string
    end_time: string | null
    status: string
    venues: { venue_name: string; city: string }[] | { venue_name: string; city: string } | null
    event_categories?: CategoryShape | CategoryShape[] | null
  }
}

export default function EventCard({ event }: EventCardProps) {
  const venue = Array.isArray(event.venues) ? event.venues[0] : event.venues
  const category = event.event_categories
    ? Array.isArray(event.event_categories)
      ? event.event_categories[0]
      : event.event_categories
    : null
  const now = new Date()
  const startTime = new Date(event.start_time)
  const endTime = event.end_time ? new Date(event.end_time) : null
  const isOngoing = startTime <= now && endTime && endTime >= now
  const isSoldOut = event.status === 'sold_out'

  const formattedDate = startTime.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Link href={`/events/${event.event_id}`}>
      <div className="group cursor-pointer">
        <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg overflow-hidden aspect-[4/3]">
          {event.banner_url ? (
            <img
              src={event.banner_url}
              alt={event.event_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🎫
            </div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/40 flex items-start justify-end p-3">
              <span className="text-xs bg-black/70 text-white px-2.5 py-1 rounded font-medium">
                Đã bán hết vé
              </span>
            </div>
          )}
          {isOngoing && !isSoldOut && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 text-xs bg-green-500 text-white px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Đang diễn ra
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 space-y-1">
          {category && (
            <span className="inline-block text-xs bg-pink-500 text-white px-2.5 py-0.5 rounded-full font-medium">
              {category.name_vi || category.name}
            </span>
          )}
          <p className="text-sm text-muted-foreground">
            {venue ? `${venue.city}, ` : ''}{formattedDate}
          </p>
          <h3 className="font-bold text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {event.event_name}
          </h3>
        </div>
      </div>
    </Link>
  )
}
