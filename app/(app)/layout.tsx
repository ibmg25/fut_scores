import Link from 'next/link'
import { getUserProfile } from '@/lib/auth/get-user-profile'
import SignOutButton from '@/components/features/SignOutButton'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUserProfile()

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/matches" className="font-bold text-lg tracking-tight">
              ⚽ Fut Score
            </Link>
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/matches" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Matches
              </Link>
              <Link href="/leaderboard" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Leaderboard
              </Link>
              {profile?.role === 'superadmin' && (
                <Link href="/admin" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 hidden sm:block">{profile?.display_name}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
