import { createClient } from '@/lib/supabase/server'
import FinalizeMatchForm from './finalize-match-form'
import type { MatchWithTeams } from '@/lib/supabase/types'

export default async function AdminResultsPage() {
  const supabase = await createClient()

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!tournament) {
    return <p className="text-zinc-500">No active tournament.</p>
  }

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      penalty_winner_team:teams!matches_penalty_winner_team_id_fkey(*)
    `)
    .eq('tournament_id', tournament.id)
    .order('kickoff_time', { ascending: true })

  const pending = (matches ?? []).filter((m) => m.status === 'pending') as MatchWithTeams[]
  const finished = (matches ?? []).filter((m) => m.status === 'finished') as MatchWithTeams[]

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">Pending Matches</h2>
        {pending.length === 0 ? (
          <p className="text-muted-foreground text-sm">All matches have been finalized.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((match) => (
              <FinalizeMatchForm key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Finished Matches</h2>
        {finished.length === 0 ? (
          <p className="text-muted-foreground text-sm">No finished matches yet.</p>
        ) : (
          <div className="space-y-2">
            {finished.map((match) => (
              <div
                key={match.id}
                className="bg-card border border-border rounded-xl p-3 flex items-center justify-between text-sm"
              >
                <span>
                  {match.home_team.name} {match.home_score}–{match.away_score} {match.away_team.name}
                  {match.penalty_winner_team && (
                    <span className="ml-2 text-muted-foreground">
                      (pens: {match.penalty_winner_team.name})
                    </span>
                  )}
                </span>
                <FinalizeMatchForm key={`edit-${match.id}`} match={match} compact />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
