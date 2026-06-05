import { redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './login-form'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/matches')

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Subtle radial glow behind the card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, var(--primary-glow), transparent)' }}
      />
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary/10 rounded-2xl p-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">FutScore</h1>
          <p className="mt-1.5 text-muted-foreground text-sm">WC 2026 Predictor</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
