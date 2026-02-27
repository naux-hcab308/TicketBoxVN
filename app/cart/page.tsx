'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart, Trash2, Minus, Plus, ArrowLeft,
  Loader2, Clock, Ticket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCart, updateCartItem, removeCartItem } from '@/app/customer/actions'
import Header from '@/components/header'
import Footer from '@/components/footer'

interface CartItem {
  ticket_type_id: string
  quantity: number
  unit_price: number
  hold_until: string | null
  ticket_types: {
    type_name: string
    event_id: string
    events: { event_name: string; start_time: string } | null
  } | null
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  function loadCart() {
    setLoading(true)
    getCart().then((data) => {
      setItems(data.items as CartItem[])
      setTotal(data.total)
      setLoading(false)
    })
  }

  useEffect(() => { loadCart() }, [])

  async function handleUpdateQty(ttId: string, newQty: number) {
    setUpdating(ttId)
    await updateCartItem(ttId, newQty)
    loadCart()
    setUpdating(null)
  }

  async function handleRemove(ttId: string) {
    setUpdating(ttId)
    await removeCartItem(ttId)
    loadCart()
    setUpdating(null)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onSearch={() => {}} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
        </Link>

        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <ShoppingCart className="w-6 h-6" /> Giỏ hàng
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-6">Hãy chọn vé từ các sự kiện yêu thích</p>
            <Link href="/">
              <Button>Khám phá sự kiện</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const tt = item.ticket_types
                const ev = tt?.events
                const holdMin = item.hold_until
                  ? Math.max(0, Math.round((new Date(item.hold_until).getTime() - Date.now()) / 60000))
                  : null

                return (
                  <div key={item.ticket_type_id} className="bg-card border border-border rounded-xl p-4 md:p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{ev?.event_name ?? 'Sự kiện'}</h3>
                        <p className="text-sm text-muted-foreground">{tt?.type_name ?? 'Vé'}</p>
                        {ev?.start_time && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(ev.start_time).toLocaleDateString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        )}
                        {holdMin !== null && holdMin > 0 && (
                          <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            Giữ chỗ còn {holdMin} phút
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQty(item.ticket_type_id, item.quantity - 1)}
                          disabled={updating === item.ticket_type_id || item.quantity <= 1}
                          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-background border border-border disabled:opacity-50"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.ticket_type_id, item.quantity + 1)}
                          disabled={updating === item.ticket_type_id}
                          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-background border border-border disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(item.ticket_type_id)}
                          disabled={updating === item.ticket_type_id}
                          className="ml-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-bold text-primary">
                        {(item.unit_price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h2 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h2>

                <div className="space-y-3 text-sm">
                  {items.map((item) => (
                    <div key={item.ticket_type_id} className="flex justify-between">
                      <span className="text-muted-foreground truncate mr-2">
                        {item.ticket_types?.type_name} x{item.quantity}
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {(item.unit_price * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border mt-4 pt-4 flex justify-between items-center">
                  <span className="font-bold">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={() => router.push('/checkout')}
                >
                  Thanh toán
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
