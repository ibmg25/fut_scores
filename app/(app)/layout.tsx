import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { getUserProfile } from '@/lib/auth/get-user-profile'
import SignOutButton from '@/components/features/SignOutButton'
import BottomNav from '@/components/features/BottomNav'
import NavLinks from '@/components/features/NavLinks'
import DisplayNameDialog from '@/components/features/DisplayNameDialog'
import InfoDialog from '@/components/features/InfoDialog'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUserProfile()
  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'admin'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile top bar */}
      <header className="md:hidden bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/matches" className="flex items-center gap-2 font-bold text-base text-primary">
            <Trophy className="w-5 h-5" />
            FutScore
          </Link>
          <div className="flex items-center gap-2">
            <DisplayNameDialog displayName={profile?.display_name ?? ''} />
            <InfoDialog />
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Desktop top navbar */}
      <nav className="hidden md:block bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/matches" className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary">
              <Trophy className="w-5 h-5" />
              FutScore
            </Link>
            <NavLinks isAdmin={isAdmin} />
          </div>
          <div className="flex items-center gap-3">
            <DisplayNameDialog displayName={profile?.display_name ?? ''} />
            <InfoDialog />
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
