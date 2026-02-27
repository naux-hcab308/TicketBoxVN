'use client'

import { useEffect, useState } from 'react'
import {
  Building2, Mail, MapPin, Landmark, CreditCard, Shield,
  Pencil, Check, X, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSellerProfile, updateSellerProfile } from '../actions'

export default function SellerProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    getSellerProfile().then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [])

  async function handleSave(formData: FormData) {
    setSaving(true)
    setMessage(null)
    const result = await updateSellerProfile(formData)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Cập nhật thành công!' })
      const updated = await getSellerProfile()
      setProfile(updated)
      setEditing(false)
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  if (!profile) {
    return <div className="p-8 text-center text-muted-foreground">Không tìm thấy hồ sơ.</div>
  }

  const kycBadge: Record<string, { class: string; label: string }> = {
    pending: { class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Chờ duyệt KYC' },
    verified: { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Đã xác minh' },
    rejected: { class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'KYC bị từ chối' },
  }

  const kyc = kycBadge[profile.kyc_status] || kycBadge.pending

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hồ sơ doanh nghiệp</h1>
        <p className="text-muted-foreground mt-1">Quản lý thông tin doanh nghiệp và tài khoản ngân hàng</p>
      </div>

      {/* KYC Status */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
        <div className="h-24 bg-gradient-to-r from-primary to-accent" />
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between -mt-4">
            <div>
              <div className="w-16 h-16 rounded-xl bg-card border-4 border-card flex items-center justify-center mb-3 shadow-sm">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{profile.business_name}</h2>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${kyc.class}`}>{kyc.label}</span>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => { setEditing(true); setMessage(null) }} className="mt-6">
                <Pencil className="w-4 h-4 mr-1.5" /> Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        }`}>{message.text}</div>
      )}

      {editing ? (
        <form action={handleSave} className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h3 className="font-semibold border-b border-border pb-3">Thông tin doanh nghiệp</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tên doanh nghiệp *</label>
              <input name="business_name" required defaultValue={profile.business_name}
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email doanh nghiệp</label>
              <input name="email" type="email" defaultValue={profile.email || ''}
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Địa chỉ</label>
              <input name="address" defaultValue={profile.address || ''}
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h3 className="font-semibold border-b border-border pb-3">Thông tin ngân hàng</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tên ngân hàng</label>
              <input name="bank_name" defaultValue={profile.bank_name || ''}
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="VD: Vietcombank" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Số tài khoản</label>
              <input name="bank_account_no" defaultValue={profile.bank_account_no || ''}
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Đang lưu...</> : <><Check className="w-4 h-4 mr-1.5" />Lưu thay đổi</>}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setEditing(false); setMessage(null) }} disabled={saving}>
              <X className="w-4 h-4 mr-1.5" /> Hủy
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border">
            <div className="px-6 py-4 border-b border-border"><h3 className="font-semibold">Thông tin doanh nghiệp</h3></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoItem icon={<Building2 className="w-4 h-4" />} label="Tên doanh nghiệp" value={profile.business_name} />
              <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={profile.email} />
              <InfoItem icon={<MapPin className="w-4 h-4" />} label="Địa chỉ" value={profile.address} />
              <InfoItem icon={<Shield className="w-4 h-4" />} label="Chủ sở hữu" value={profile.profiles?.full_name} />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="px-6 py-4 border-b border-border"><h3 className="font-semibold">Thông tin ngân hàng</h3></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoItem icon={<Landmark className="w-4 h-4" />} label="Ngân hàng" value={profile.bank_name} />
              <InfoItem icon={<CreditCard className="w-4 h-4" />} label="Số tài khoản" value={profile.bank_account_no} />
            </div>
          </div>
        </div>
      )}
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
