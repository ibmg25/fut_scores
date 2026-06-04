import { createAdminClient } from '@/lib/supabase/admin'
import CreateUserForm from './create-user-form'
import ResetPasswordDialog from './reset-password-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function AdminUsersPage() {
  const adminClient = createAdminClient()

  const [{ data: profiles }, { data: authUsers }] = await Promise.all([
    adminClient
      .from('users_profiles')
      .select('id, display_name, role, total_points, must_change_password')
      .order('display_name', { ascending: true }),
    adminClient.auth.admin.listUsers(),
  ])

  const emailMap = new Map(
    (authUsers?.users ?? []).map((u) => [u.id, u.email])
  )

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">Create User</h2>
        <div className="max-w-sm">
          <CreateUserForm />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">All Users</h2>
        {!profiles || profiles.length === 0 ? (
          <p className="text-muted-foreground text-sm">No users yet.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.display_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {emailMap.get(p.id) ?? '–'}
                    </TableCell>
                    <TableCell>
                      {p.role === 'superadmin' ? (
                        <Badge>Admin</Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{p.total_points}</TableCell>
                    <TableCell className="text-right">
                      {p.must_change_password ? (
                        <span className="text-xs text-yellow-500">Temp password</span>
                      ) : (
                        <span className="text-xs text-primary">Active</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ResetPasswordDialog userId={p.id} userName={p.display_name} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  )
}
