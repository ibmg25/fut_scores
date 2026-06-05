import { createClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/lib/supabase/types'

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data ?? null
}

export async function requireSuperadmin(): Promise<UserProfile> {
  const profile = await getUserProfile()
  if (!profile || profile.role !== 'superadmin') {
    const { redirect } = await import('next/navigation')
    redirect('/matches')
  }
  return profile!
}

export async function requireAdminOrAbove(): Promise<UserProfile> {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'superadmin' && profile.role !== 'admin')) {
    const { redirect } = await import('next/navigation')
    redirect('/matches')
  }
  return profile!
}
