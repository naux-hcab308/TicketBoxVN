'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Camera, Mail, Phone, Shield, Calendar,
  Pencil, Check, X, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { getProfile, updateProfile, type ProfileData } from './actions'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      getProfile().then((data) => {
        setProfile(data)
        setLoading(false)
      })
    }
  }, [user, authLoading, router])

  async function handleSave(formData: FormData) {
    setSaving(true)
    setMessage(null)
    const result = await updateProfile(formData)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Cập nhật thành công!' })
      const updated = await getProfile()
      setProfile(updated)
      setEditing(false)
    }
    setSaving(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy thông tin tài khoản.</p>
      </div>
    )
  }

  const avatarUrl = profile.images || user?.user_metadata?.avatar_url
  const displayName = profile.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header bar */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Tài khoản của tôi</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Avatar + Name Card */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-primary to-accent" />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-card bg-secondary overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                className="absolute bottom-1 left-20 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                title="Đổi ảnh đại diện"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{displayName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                    <Shield className="w-3 h-3" />
                    {profile.role_name}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {profile.status === 'active' ? 'Đang hoạt động' : profile.status}
                  </span>
                </div>
              </div>

              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEditing(true); setMessage(null) }}
                >
                  <Pencil className="w-4 h-4 mr-1.5" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Info */}
        <div className="mt-6 bg-card rounded-xl border border-border shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold">Thông tin cá nhân</h3>
          </div>

          {editing ? (
            <form action={handleSave} className="p-6 space-y-5">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium mb-1.5">
                  Họ và tên
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  defaultValue={profile.full_name ?? ''}
                  className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                  Email
                </label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/50 rounded-lg border border-border text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium mb-1.5">
                  Số điện thoại
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  defaultValue={profile.phone_number ?? ''}
                  placeholder="0912 345 678"
                  className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Đang lưu...</>
                  ) : (
                    <><Check className="w-4 h-4 mr-1.5" /> Lưu thay đổi</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setEditing(false); setMessage(null) }}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Hủy
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-5">
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={profile.email}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Số điện thoại"
                value={profile.phone_number}
                placeholder="Chưa cập nhật"
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Ngày tham gia"
                value={new Date(profile.created_at).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  placeholder = '—',
}: {
  icon: React.ReactNode
  label: string
  value: string | null | undefined
  placeholder?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || placeholder}</p>
      </div>
    </div>
  )
}
