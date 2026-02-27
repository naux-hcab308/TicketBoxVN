'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, QrCode, CalendarDays, BarChart3, Loader2 } from 'lucide-react'
import { getStaffSession, staffLogout } from './actions'
import { Button } from '@/components/ui/button'

interface StaffInfo {
  staff_id: string
  name: string
  employee_code: string
  seller_id: string
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [staff, setStaff] = useState<StaffInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const isLoginPage = pathname === '/staff/login'

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false)
      return
    }

    getStaffSession().then((s) => {
      if (!s) {
        router.replace('/staff/login')
      } else {
        setStaff(s as StaffInfo)
      }
      setLoading(false)
    })
  }, [isLoginPage, router])

  if (isLoginPage) return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!staff) return null

  const navItems = [
    { href: '/staff', icon: CalendarDays, label: 'Sự kiện' },
    { href: '/staff/checkin', icon: QrCode, label: 'Check-in' },
    { href: '/staff/stats', icon: BarChart3, label: 'Thống kê' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {staff.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">{staff.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{staff.employee_code}</p>
          </div>
        </div>
        <form action={staffLogout}>
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="w-4 h-4" />
          </Button>
        </form>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border px-4 py-2 flex justify-around sticky bottom-0">
        {navItems.map((item) => {
          const isActive = item.href === '/staff'
            ? pathname === '/staff'
            : pathname.startsWith(item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
