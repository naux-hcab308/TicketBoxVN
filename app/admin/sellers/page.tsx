'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, Eye } from 'lucide-react'
import { getSellers } from '../actions'

const STATUS_TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'verified', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
]

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function SellersPage() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'
  const [activeTab, setActiveTab] = useState(initialStatus)
  const [sellers, setSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    getSellers(activeTab).then(({ data }) => {
      setSellers(data)
      setLoading(false)
    })
  }, [activeTab])

  const filtered = sellers.filter((s) => {
    const term = search.toLowerCase()
    return (
      s.business_name?.toLowerCase().includes(term) ||
      s.profiles?.full_name?.toLowerCase().includes(term) ||
      s.profiles?.email?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý Sellers</h1>
        <p className="text-muted-foreground mt-1">Danh sách nhà tổ chức sự kiện</p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
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
            placeholder="Tìm seller..."
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
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tên doanh nghiệp</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Chủ sở hữu</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">KYC</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ngày đăng ký</th>
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
                    Không tìm thấy seller nào
                  </td>
                </tr>
              ) : (
                filtered.map((seller) => (
                  <tr key={seller.seller_id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{seller.business_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {seller.profiles?.images ? (
                          <img src={seller.profiles.images} alt="" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {(seller.profiles?.full_name || '?').charAt(0)}
                          </div>
                        )}
                        <span>{seller.profiles?.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{seller.email || seller.profiles?.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[seller.kyc_status] || ''}`}>
                        {seller.kyc_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(seller.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/sellers/${seller.seller_id}`}
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
