import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PHASE_LABELS, PHASE_ORDER } from '@/lib/match-phases'
import FinalizeMatchForm from './finalize-match-form'
import type { MatchWithTeams, MatchPhase } from '@/lib/supabase/types'

export default async function AdminResultsPage(props: {
  searchParams: Promise<{ phase?: string }>
}) {
  const { phase: phaseParam } = await props.searchParams
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

  const allMatches = (matches ?? []) as MatchWithTeams[]

  const phases = PHASE_ORDER.filter((phase) =>
    allMatches.some((m) => m.phase === phase)
  )

  if (phases.length === 0) {
    return <p className="text-muted-foreground text-sm">No matches found.</p>
  }

  // Default to first phase with a pending match, otherwise first phase
  const defaultPhase =
    phases.find((p) => allMatches.some((m) => m.phase === p && m.status === 'pending')) ??
    phases[0]

  const activePhase: MatchPhase =
    phases.includes(phaseParam as MatchPhase) ? (phaseParam as MatchPhase) : defaultPhase

  const phaseMatches = allMatches.filter((m) => m.phase === activePhase)
  const pending = phaseMatches.filter((m) => m.status === 'pending')
  const finished = phaseMatches.filter((m) => m.status === 'finished')

  return (
    <div className="space-y-6">
      {/* Phase tabs */}
      <div className="flex flex-nowrap overflow-x-auto gap-1 pb-1">
        {phases.map((phase) => {
          const hasPending = allMatches.some((m) => m.phase === phase && m.status === 'pending')
          const isActive = phase === activePhase
          return (
            <Link
              key={phase}
              href={`?phase=${phase}`}
              className={`shrink-0 px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {PHASE_LABELS[phase]}
              {hasPending && !isActive && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-orange-400 align-middle" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Pending
          </h2>
          <div className="space-y-3">
            {pending.map((match) => (
              <FinalizeMatchForm key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Finished */}
      {finished.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Finished
          </h2>
          <div className="space-y-2">
            {finished.map((match) => (
              <FinalizeMatchForm key={`edit-${match.id}`} match={match} compact />
            ))}
          </div>
        </section>
      )}

      {pending.length === 0 && finished.length === 0 && (
        <p className="text-muted-foreground text-sm">No matches in this phase.</p>
      )}
    </div>
  )
}
