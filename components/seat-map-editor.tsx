'use client'

import { useEffect, useState } from 'react'
import { Loader2, Grid3x3, Trash2, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateSeatMap, getSeats, toggleSeatDisabled, deleteSeatMap } from '@/app/seller/actions'

interface Seat {
  seat_id: string
  row_label: string
  seat_number: number
  label: string
  status: string
}

interface SeatMapEditorProps {
  ticketTypeId: string
  eventId: string
  hasSeatmap: boolean
  onUpdate?: () => void
}

export default function SeatMapEditor({ ticketTypeId, eventId, hasSeatmap, onUpdate }: SeatMapEditorProps) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [rows, setRows] = useState(5)
  const [seatsPerRow, setSeatsPerRow] = useState(10)
  const [showGenerator, setShowGenerator] = useState(!hasSeatmap)

  useEffect(() => {
    if (hasSeatmap) {
      setLoading(true)
      getSeats(ticketTypeId).then(({ data }) => {
        setSeats(data as Seat[])
        setLoading(false)
      })
    }
  }, [ticketTypeId, hasSeatmap])

  async function handleGenerate() {
    setGenerating(true)
    const result = await generateSeatMap(ticketTypeId, eventId, rows, seatsPerRow)
    if (result.success) {
      const { data } = await getSeats(ticketTypeId)
      setSeats(data as Seat[])
      setShowGenerator(false)
      onUpdate?.()
    }
    setGenerating(false)
  }

  async function handleToggleSeat(seatId: string) {
    await toggleSeatDisabled(seatId)
    const { data } = await getSeats(ticketTypeId)
    setSeats(data as Seat[])
  }

  async function handleDelete() {
    if (!confirm('Xóa toàn bộ sơ đồ ghế? Thao tác không thể hoàn tác.')) return
    await deleteSeatMap(ticketTypeId)
    setSeats([])
    setShowGenerator(true)
    onUpdate?.()
  }

  // Group seats by row
  const rowMap = new Map<string, Seat[]>()
  seats.forEach(s => {
    const arr = rowMap.get(s.row_label) || []
    arr.push(s)
    rowMap.set(s.row_label, arr)
  })

  const stats = {
    total: seats.length,
    available: seats.filter(s => s.status === 'available').length,
    sold: seats.filter(s => s.status === 'sold').length,
    held: seats.filter(s => s.status === 'held').length,
    disabled: seats.filter(s => s.status === 'disabled').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Generator */}
      {showGenerator && (
        <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm">Tạo sơ đồ ghế</h4>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Số hàng</label>
              <input
                type="number"
                min={1}
                max={26}
                value={rows}
                onChange={e => setRows(Math.min(26, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 px-3 py-1.5 bg-card text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Ghế/hàng</label>
              <input
                type="number"
                min={1}
                max={50}
                value={seatsPerRow}
                onChange={e => setSeatsPerRow(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 px-3 py-1.5 bg-card text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-end">
              <Button size="sm" onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Grid3x3 className="w-4 h-4 mr-1" />}
                Tạo {rows * seatsPerRow} ghế
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Seat Map Display */}
      {seats.length > 0 && (
        <>
          {/* Stats */}
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" /> Trống ({stats.available})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-yellow-500" /> Đang giữ ({stats.held})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-500" /> Đã bán ({stats.sold})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600" /> Vô hiệu ({stats.disabled})
            </span>
          </div>

          {/* Stage */}
          <div className="text-center">
            <div className="inline-block px-16 py-2 bg-secondary rounded-b-xl text-xs font-medium text-muted-foreground tracking-widest uppercase">
              Sân khấu
            </div>
          </div>

          {/* Seats Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="flex flex-col items-center gap-1.5 min-w-fit">
              {Array.from(rowMap.entries()).map(([rowLabel, rowSeats]) => (
                <div key={rowLabel} className="flex items-center gap-1">
                  <span className="w-6 text-xs font-medium text-muted-foreground text-center">{rowLabel}</span>
                  {rowSeats.map(seat => {
                    const colors: Record<string, string> = {
                      available: 'bg-emerald-500 hover:bg-emerald-600 cursor-pointer',
                      held: 'bg-yellow-500',
                      sold: 'bg-red-500',
                      disabled: 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 cursor-pointer',
                    }
                    return (
                      <button
                        key={seat.seat_id}
                        onClick={() => handleToggleSeat(seat.seat_id)}
                        title={`${seat.label} - ${seat.status === 'available' ? 'Click để vô hiệu hóa' : seat.status === 'disabled' ? 'Click để kích hoạt' : seat.status}`}
                        disabled={seat.status === 'sold' || seat.status === 'held'}
                        className={`w-7 h-7 rounded text-[10px] font-medium text-white flex items-center justify-center transition-colors ${colors[seat.status] || colors.available} disabled:cursor-not-allowed`}
                      >
                        {seat.seat_number}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setShowGenerator(true)}>
              <Grid3x3 className="w-3.5 h-3.5 mr-1" /> Tạo lại
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa sơ đồ
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
