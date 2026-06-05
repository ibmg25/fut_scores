import { requireAdminOrAbove } from '@/lib/auth/get-user-profile'
import AdminNavLinks from '@/components/features/AdminNavLinks'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdminOrAbove()

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
        <h1 className="text-xl font-bold">Admin</h1>
        <AdminNavLinks isSuperadmin={profile.role === 'superadmin'} />
      </div>
      {children}
    </div>
  )
}
