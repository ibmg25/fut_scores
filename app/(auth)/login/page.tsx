import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './login-form'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/matches')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary">⚽ Fut Score</h1>
          <p className="mt-2 text-muted-foreground text-sm">WC 2026 Predictor</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
