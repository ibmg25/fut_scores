import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('v_leaderboard')
    .select('id, display_name, total_points, exact_results_count')
    .order('total_points', { ascending: false })
    .order('exact_results_count', { ascending: false })
    .order('display_name', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      {!profiles || profiles.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          No scores yet. Check back after matches are finalized.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Exact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile, index) => (
                <TableRow
                  key={profile.id}
                  className={profile.id === user.id ? 'bg-zinc-50 font-medium' : ''}
                >
                  <TableCell className="text-zinc-500">{index + 1}</TableCell>
                  <TableCell>
                    {profile.display_name}
                    {profile.id === user.id && (
                      <span className="ml-2 text-xs text-zinc-400">(you)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {profile.total_points}
                  </TableCell>
                  <TableCell className="text-right text-zinc-500 hidden sm:table-cell">
                    {profile.exact_results_count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
