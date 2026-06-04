import { requireSuperadmin } from '@/lib/auth/get-user-profile'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperadmin()

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
        <h1 className="text-xl font-bold">Admin</h1>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/results" className="text-muted-foreground hover:text-foreground transition-colors">
            Match Results
          </Link>
          <Link href="/admin/users" className="text-muted-foreground hover:text-foreground transition-colors">
            Users
          </Link>
        </nav>
      </div>
      {children}
    </div>
  )
}
