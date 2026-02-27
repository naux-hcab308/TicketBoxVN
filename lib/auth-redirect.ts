import { createClient } from '@/lib/supabase/server'

export async function getRedirectByRole(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return '/login'

  const { data: profile } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('user_id', user.id)
    .single()

  switch (profile?.role_id) {
    case 1: return '/admin'
    case 2: return '/seller'
    default: return '/'
  }
}
