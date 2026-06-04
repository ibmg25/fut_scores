import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import AddMemberForm from './add-member-form'
import RemoveMemberForm from './remove-member-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminGroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const adminClient = createAdminClient()

  const [
    { data: group },
    { data: members },
    { data: allProfiles },
  ] = await Promise.all([
    adminClient
      .from('groups')
      .select('id, name')
      .eq('id', groupId)
      .single(),
    adminClient
      .from('group_members')
      .select('user_id, joined_at')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true }),
    adminClient
      .from('users_profiles')
      .select('id, display_name')
      .order('display_name', { ascending: true }),
  ])

  if (!group) notFound()

  const memberUserIds = new Set((members ?? []).map((m) => m.user_id))
  const profilesMap = new Map((allProfiles ?? []).map((p) => [p.id, p.display_name]))
  const availableUsers = (allProfiles ?? []).filter((p) => !memberUserIds.has(p.id))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">{group.name}</h2>
        <p className="text-sm text-muted-foreground">{memberUserIds.size} member{memberUserIds.size !== 1 ? 's' : ''}</p>
      </div>

      <section>
        <h3 className="text-base font-semibold mb-3">Add Member</h3>
        <div className="max-w-md">
          <AddMemberForm groupId={groupId} availableUsers={availableUsers} />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-3">Current Members</h3>
        {!members || members.length === 0 ? (
          <p className="text-muted-foreground text-sm">No members yet.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                    <TableRow key={m.user_id}>
                      <TableCell className="font-medium">
                        {profilesMap.get(m.user_id) ?? '–'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Date(m.joined_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <RemoveMemberForm groupId={groupId} userId={m.user_id} />
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
