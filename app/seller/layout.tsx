'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, Ticket, Users,
  UserCog, ChevronLeft, ChevronRight, LogOut, Store,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/seller', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/events', label: 'Sự kiện', icon: CalendarDays },
  { href: '/seller/staff', label: 'Nhân viên', icon: Users },
  { href: '/seller/profile', label: 'Hồ sơ', icon: UserCog },
]

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login'); return }

    const supabase = createClient()

    async function checkAccess() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role_id')
        .eq('user_id', user?.id ?? '')
        .single()

      if (profile?.role_id === 2) {
        setAuthorized(true)
        return
      }

      const { data: seller } = await supabase
        .from('seller_profiles')
        .select('seller_id')
        .eq('user_id', user?.id ?? '')
        .maybeSingle()

      if (seller) {
        setAuthorized(true)
      } else {
        router.push('/')
      }
    }

    checkAccess()
  }, [user, loading, router])

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex bg-secondary/30">
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-card border-r border-border flex flex-col transition-all duration-200 sticky top-0 h-screen`}>
        <div className="h-16 flex items-center px-4 border-b border-border gap-3">
          <Store className="w-6 h-6 text-primary flex-shrink-0" />
          {!collapsed && <span className="font-bold text-lg text-primary">Seller</span>}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/seller' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-2 space-y-1">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground w-full transition-colors"
            title={collapsed ? 'Đăng xuất' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground w-full transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5 flex-shrink-0" /><span>Thu gọn</span></>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
