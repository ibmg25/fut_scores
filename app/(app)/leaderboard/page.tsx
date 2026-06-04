import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PodiumSection from '@/components/features/PodiumSection'
import RankingList from '@/components/features/RankingList'

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

  const hasScores = profiles && profiles.some((p) => p.total_points > 0)

  if (!profiles || profiles.length === 0 || !hasScores) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <span className="text-5xl">🏆</span>
          <p className="text-lg font-semibold">No scores yet.</p>
          <p className="text-sm text-muted-foreground">Check back after the first matches are finalized.</p>
        </div>
      </div>
    )
  }

  const top3 = profiles.slice(0, 3)
  const rest = profiles.slice(3)
  const currentUserInTop3 = top3.some((p) => p.id === user.id)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      <PodiumSection top3={top3} />
      <RankingList
        entries={rest}
        currentUserId={user.id}
        startRank={4}
        currentUserInTop3={currentUserInTop3}
      />
    </div>
  )
}
