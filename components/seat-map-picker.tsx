'use client'

import { useEffect, useState } from 'react'
import { Loader2, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getEventSeats, addSeatsToCart } from '@/app/customer/actions'

interface Seat {
  seat_id: string
  row_label: string
  seat_number: number
  label: string
  status: string
  held_by: string | null
  held_until: string | null
}

interface SeatMapPickerProps {
  ticketTypeId: string
  eventId: string
  typeName: string
  price: number
  onClose: () => void
  onSuccess: () => void
}

export default function SeatMapPicker({
  ticketTypeId, eventId, typeName, price, onClose, onSuccess,
}: SeatMapPickerProps) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getEventSeats(ticketTypeId).then(data => {
      setSeats(data as Seat[])
      setLoading(false)
    })
  }, [ticketTypeId])

  function toggleSeat(seatId: string, status: string) {
    if (status !== 'available') return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(seatId)) {
        next.delete(seatId)
      } else {
        if (next.size >= 10) return prev
        next.add(seatId)
      }
      return next
    })
  }

  async function handleSubmit() {
    if (selected.size === 0) return
    setSubmitting(true)
    setError(null)

    const result = await addSeatsToCart(ticketTypeId, Array.from(selected), eventId)
    if ('error' in result) {
      setError(result.error)
      setSubmitting(false)
    } else {
      setSubmitting(false)
      onSuccess()
    }
  }

  // Group by row
  const rowMap = new Map<string, Seat[]>()
  seats.forEach(s => {
    const arr = rowMap.get(s.row_label) || []
    arr.push(s)
    rowMap.set(s.row_label, arr)
  })

  const selectedSeats = seats.filter(s => selected.has(s.seat_id))
  const totalPrice = selectedSeats.length * price

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-bold text-lg">Chọn ghế - {typeName}</h2>
            <p className="text-sm text-muted-foreground">
              {price.toLocaleString('vi-VN')}đ / ghế • Tối đa 10 ghế
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-xs mb-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500" /> Trống
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-primary" /> Đang chọn
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-yellow-500" /> Đang giữ
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-500" /> Đã bán
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600" /> Không khả dụng
                </span>
              </div>

              {/* Stage */}
              <div className="text-center mb-4">
                <div className="inline-block px-16 py-2 bg-secondary rounded-b-xl text-xs font-medium text-muted-foreground tracking-widest uppercase">
                  Sân khấu
                </div>
              </div>

              {/* Seats */}
              <div className="overflow-x-auto pb-2">
                <div className="flex flex-col items-center gap-1.5 min-w-fit">
                  {Array.from(rowMap.entries()).map(([rowLabel, rowSeats]) => (
                    <div key={rowLabel} className="flex items-center gap-1">
                      <span className="w-6 text-xs font-medium text-muted-foreground text-center">{rowLabel}</span>
                      {rowSeats.map(seat => {
                        const isSelected = selected.has(seat.seat_id)
                        let colorClass = ''
                        let clickable = false

                        switch (seat.status) {
                          case 'available':
                            colorClass = isSelected
                              ? 'bg-primary hover:bg-primary/80 ring-2 ring-primary ring-offset-1'
                              : 'bg-emerald-500 hover:bg-emerald-600'
                            clickable = true
                            break
                          case 'held':
                            colorClass = 'bg-yellow-500 cursor-not-allowed'
                            break
                          case 'sold':
                            colorClass = 'bg-red-500 cursor-not-allowed'
                            break
                          case 'disabled':
                            colorClass = 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                            break
                        }

                        return (
                          <button
                            key={seat.seat_id}
                            onClick={() => toggleSeat(seat.seat_id, seat.status)}
                            disabled={!clickable}
                            title={`${seat.label} - ${seat.status === 'available' ? (isSelected ? 'Bỏ chọn' : 'Chọn ghế') : seat.status}`}
                            className={`w-8 h-8 rounded text-[10px] font-medium text-white flex items-center justify-center transition-all ${colorClass} disabled:cursor-not-allowed`}
                          >
                            {seat.seat_number}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          {error && (
            <p className="text-sm text-red-500 mb-3">{error}</p>
          )}

          {selected.size > 0 && (
            <div className="mb-3 text-sm">
              <span className="text-muted-foreground">Ghế đã chọn: </span>
              <span className="font-medium">
                {selectedSeats.map(s => s.label).join(', ')}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">{selected.size} ghế</span>
              {selected.size > 0 && (
                <span className="text-lg font-bold text-primary ml-3">
                  {totalPrice.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={selected.size === 0 || submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-1" />
              )}
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
