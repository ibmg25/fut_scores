import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChangePasswordForm from './change-password-form'

export default async function ChangePasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('must_change_password, display_name')
    .eq('id', user.id)
    .single()

  if (!profile?.must_change_password) redirect('/matches')

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Set Your Password</h1>
          <p className="mt-2 text-zinc-500 text-sm">
            Hi {profile.display_name}, please set a new password to continue.
          </p>
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  )
}
