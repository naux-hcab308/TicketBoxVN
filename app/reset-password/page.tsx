'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { resetPassword } from '../login/actions'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)
    setError(null)
    const result = await resetPassword(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-border shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Đặt lại mật khẩu</h2>
            <p className="text-sm text-muted-foreground mt-1">Nhập mật khẩu mới cho tài khoản của bạn</p>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">Mật khẩu mới</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium mb-1.5">Xác nhận mật khẩu</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">{error}</div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
