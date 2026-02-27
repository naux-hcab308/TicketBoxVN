'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, User, Calendar, Shield, Loader2 } from 'lucide-react'
import { getCustomerDetail } from '../../actions'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomerDetail(id).then((data) => {
      setCustomer(data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!customer) {
    return <div className="p-8 text-center text-muted-foreground">Không tìm thấy người dùng.</div>
  }

  const displayName = customer.full_name || customer.email?.split('@')[0] || 'User'
  const roleName = customer.roles?.role_name || 'customer'

  const statusBadge: Record<string, { class: string; label: string }> = {
    active: { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Đang hoạt động' },
    inactive: { class: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', label: 'Không hoạt động' },
    banned: { class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Bị cấm' },
  }

  const roleBadge: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    seller: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    customer: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }

  const badge = statusBadge[customer.status] || statusBadge.active

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>

      {/* Profile Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
        <div className="h-28 bg-gradient-to-r from-green-500 to-emerald-600" />
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-card bg-secondary overflow-hidden">
              {customer.images ? (
                <img src={customer.images} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadge[roleName] || roleBadge.customer}`}>
              {roleName}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Thông tin chi tiết</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={customer.email} />
          <InfoItem icon={<Phone className="w-4 h-4" />} label="Số điện thoại" value={customer.phone_number} />
          <InfoItem icon={<User className="w-4 h-4" />} label="Họ và tên" value={customer.full_name} />
          <InfoItem icon={<Shield className="w-4 h-4" />} label="Trạng thái" value={badge.label} />
          <InfoItem
            icon={<Calendar className="w-4 h-4" />}
            label="Ngày đăng ký"
            value={customer.created_at ? new Date(customer.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null}
          />
          <InfoItem
            icon={<Calendar className="w-4 h-4" />}
            label="Cập nhật lần cuối"
            value={customer.updated_at ? new Date(customer.updated_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null}
          />
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
