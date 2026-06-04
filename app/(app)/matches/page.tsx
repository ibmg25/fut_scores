import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchesByPhase from '@/components/features/MatchesByPhase'
import type { MatchWithTeams, Prediction } from '@/lib/supabase/types'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!tournament) {
    return (
      <div className="text-center py-20 text-zinc-500">
        No active tournament found.
      </div>
    )
  }

  const [{ data: matches }, { data: predictions }] = await Promise.all([
    supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        penalty_winner_team:teams!matches_penalty_winner_team_id_fkey(*)
      `)
      .eq('tournament_id', tournament.id)
      .order('kickoff_time', { ascending: true }),
    supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Matches</h1>
      <MatchesByPhase
        matches={(matches ?? []) as MatchWithTeams[]}
        predictions={(predictions ?? []) as Prediction[]}
      />
    </div>
  )
}
