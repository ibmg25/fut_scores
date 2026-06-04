import Link from 'next/link'
import { getUserProfile } from '@/lib/auth/get-user-profile'
import SignOutButton from '@/components/features/SignOutButton'
import BottomNav from '@/components/features/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUserProfile()
  const isAdmin = profile?.role === 'superadmin'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile top bar */}
      <header className="md:hidden bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between h-12 px-4">
          <span className="font-bold text-base text-primary">⚽ Fut Score</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{profile?.display_name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Desktop top navbar */}
      <nav className="hidden md:block bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/matches" className="font-bold text-lg tracking-tight text-primary">
              ⚽ Fut Score
            </Link>
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/matches" className="text-muted-foreground hover:text-foreground transition-colors">
                Matches
              </Link>
              <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Leaderboard
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{profile?.display_name}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav isAdmin={isAdmin} />
    </div>
  )
}
