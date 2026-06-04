import { createAdminClient } from '@/lib/supabase/admin'
import CreateGroupForm from './create-group-form'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminGroupsPage() {
  const adminClient = createAdminClient()

  const [{ data: groups }, { data: allMembers }] = await Promise.all([
    adminClient
      .from('groups')
      .select('id, name, created_at')
      .order('created_at', { ascending: false }),
    adminClient
      .from('group_members')
      .select('group_id'),
  ])

  const memberCounts = new Map<string, number>()
  for (const m of allMembers ?? []) {
    memberCounts.set(m.group_id, (memberCounts.get(m.group_id) ?? 0) + 1)
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">Create Group</h2>
        <div className="max-w-sm">
          <CreateGroupForm />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">All Groups</h2>
        {!groups || groups.length === 0 ? (
          <p className="text-muted-foreground text-sm">No groups yet.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.name}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {memberCounts.get(g.id) ?? 0}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {new Date(g.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/groups/${g.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Manage
                      </Link>
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
