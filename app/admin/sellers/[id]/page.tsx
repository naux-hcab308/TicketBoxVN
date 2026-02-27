'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, Mail, Phone, Landmark, CreditCard,
  Shield, CheckCircle2, XCircle, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSellerDetail, updateSellerKyc } from '../../actions'

export default function SellerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    getSellerDetail(id).then((data) => {
      setSeller(data)
      setLoading(false)
    })
  }, [id])

  async function handleKycAction(status: 'verified' | 'rejected') {
    setActionLoading(true)
    const result = await updateSellerKyc(id, status)
    if (result.success) {
      const updated = await getSellerDetail(id)
      setSeller(updated)
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

  if (!seller) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Không tìm thấy seller.
      </div>
    )
  }

  const kycBadge: Record<string, { class: string; label: string }> = {
    pending: { class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Chờ duyệt' },
    verified: { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Đã duyệt' },
    rejected: { class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Từ chối' },
  }

  const badge = kycBadge[seller.kyc_status] || kycBadge.pending

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <Link href="/admin/sellers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{seller.business_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {seller.kyc_status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleKycAction('verified')}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Duyệt
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleKycAction('rejected')}
              disabled={actionLoading}
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Từ chối
            </Button>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="space-y-6">
        {/* Account info */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Thông tin tài khoản</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={seller.profiles?.email} />
            <InfoItem icon={<Phone className="w-4 h-4" />} label="Số điện thoại" value={seller.profiles?.phone_number} />
            <InfoItem
              icon={<Shield className="w-4 h-4" />}
              label="Trạng thái tài khoản"
              value={seller.profiles?.status}
            />
            <InfoItem
              icon={<Loader2 className="w-4 h-4" />}
              label="Ngày tạo"
              value={seller.profiles?.created_at ? new Date(seller.profiles.created_at).toLocaleDateString('vi-VN') : null}
            />
          </div>
        </div>

        {/* Business info */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Thông tin doanh nghiệp</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoItem icon={<Building2 className="w-4 h-4" />} label="Tên doanh nghiệp" value={seller.business_name} />
            <InfoItem icon={<Mail className="w-4 h-4" />} label="Email doanh nghiệp" value={seller.email} />
            <InfoItem icon={<Building2 className="w-4 h-4" />} label="Địa chỉ" value={seller.address} />
          </div>
        </div>

        {/* Bank info */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Thông tin ngân hàng</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoItem icon={<Landmark className="w-4 h-4" />} label="Ngân hàng" value={seller.bank_name} />
            <InfoItem icon={<CreditCard className="w-4 h-4" />} label="Số tài khoản" value={seller.bank_account_no} />
          </div>
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
