'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface ProfileData {
  user_id: string
  full_name: string | null
  email: string | null
  phone_number: string | null
  images: string | null
  role_id: number
  status: string
  created_at: string
  updated_at: string
  role_name?: string
}

export async function getProfile(): Promise<ProfileData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('profiles')
    .select('*, roles(role_name)')
    .eq('user_id', user.id)
    .single()

  if (!data) return null

  return {
    ...data,
    role_name: data.roles?.role_name ?? 'customer',
    images: data.images ?? user.user_metadata?.avatar_url ?? null,
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const full_name = formData.get('full_name') as string
  const phone_number = formData.get('phone_number') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      phone_number,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateAvatar(avatarUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('profiles')
    .update({ images: avatarUrl, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
