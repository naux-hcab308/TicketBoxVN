'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag, ChevronRight, Loader2, ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOrders } from '@/app/customer/actions'
import Header from '@/components/header'
import Footer from '@/components/footer'

interface Order {
  order_id: string
  order_code: string
  total_amount: number
  status: string
  payment_method: string | null
  paid_at: string | null
  created_at: string
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ thanh toán', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  confirmed: { label: 'Đã thanh toán', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  refunded: { label: 'Đã hoàn tiền', color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrders().then((data) => {
      setOrders(data as Order[])
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onSearch={() => {}} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Trang chủ
        </Link>

        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <ShoppingBag className="w-6 h-6" /> Lịch sử mua hàng
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Chưa có đơn hàng</h2>
            <p className="text-muted-foreground mb-6">Hãy khám phá và mua vé cho sự kiện yêu thích</p>
            <Link href="/"><Button>Khám phá sự kiện</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const s = STATUS_MAP[order.status] || STATUS_MAP.pending
              return (
                <Link key={order.order_id} href={`/orders/${order.order_id}`}>
                  <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold">{order.order_code}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>
                            {s.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">
                          {order.total_amount.toLocaleString('vi-VN')}đ
                        </span>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
