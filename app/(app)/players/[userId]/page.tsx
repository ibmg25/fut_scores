import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PlayerAvatar from '@/components/features/PlayerAvatar'
import LocalKickoffTime from '@/components/features/LocalKickoffTime'
import { PHASE_LABELS, PHASE_ORDER } from '@/components/features/MatchesByPhase'
import type { MatchWithTeams, Prediction, MatchPhase } from '@/lib/supabase/types'

function PointsBadge({ points }: { points: number }) {
  const colorClass =
    points >= 13 ? 'text-yellow-300'
    : points === 10 ? 'text-green-400'
    : points === 8  ? 'text-emerald-300'
    : points === 5  ? 'text-emerald-400'
    : points === 2  ? 'text-yellow-400'
    : 'text-muted-foreground'
  return <span className={`font-semibold ${colorClass}`}>{points} pts</span>
}

interface PredictionResultCardProps {
  match: MatchWithTeams
  prediction: Prediction
}

function PredictionResultCard({ match, prediction }: PredictionResultCardProps) {
  const penaltyPickTeam =
    prediction.predicted_penalty_winner_team_id === match.home_team_id
      ? match.home_team
      : prediction.predicted_penalty_winner_team_id === match.away_team_id
      ? match.away_team
      : null

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 opacity-75">
      <div className="text-xs text-muted-foreground">
        <LocalKickoffTime isoString={match.kickoff_time} />
      </div>

      {/* Teams row with official result */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {match.home_team.flag_url && (
            <Image
              src={match.home_team.flag_url}
              alt={match.home_team.name}
              width={32}
              height={24}
              className="rounded-sm shrink-0 w-8 h-6"
              unoptimized
            />
          )}
          <span className="text-sm font-semibold truncate">{match.home_team.name}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-2xl font-bold">{match.home_score}</span>
          <span className="text-muted-foreground text-lg">–</span>
          <span className="text-2xl font-bold">{match.away_score}</span>
        </div>

        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <span className="text-sm font-semibold truncate text-right">{match.away_team.name}</span>
          {match.away_team.flag_url && (
            <Image
              src={match.away_team.flag_url}
              alt={match.away_team.name}
              width={32}
              height={24}
              className="rounded-sm shrink-0 w-8 h-6"
              unoptimized
            />
          )}
        </div>
      </div>

      {/* Their pick */}
      <div className="text-xs text-muted-foreground text-center">
        Their pick: {prediction.predicted_home_score}–{prediction.predicted_away_score}
        {match.is_knockout && penaltyPickTeam && (
          <> ({penaltyPickTeam.name} wins pens)</>
        )}
        {' · '}
        <PointsBadge points={prediction.points_earned} />
      </div>
    </div>
  )
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: viewerProfile }, { data: targetProfile }] = await Promise.all([
    supabase.from('users_profiles').select('role').eq('id', user.id).single(),
    supabase
      .from('users_profiles')
      .select('id, display_name, total_points, exact_results_count')
      .eq('id', userId)
      .single(),
  ])

  if (!targetProfile) notFound()

  const isSuperadmin = viewerProfile?.role === 'superadmin'
  const isOwnProfile = userId === user.id

  if (!isSuperadmin && !isOwnProfile) {
    const { data: viewerGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)

    const viewerGroupIds = (viewerGroups ?? []).map((g) => g.group_id)

    if (viewerGroupIds.length === 0) notFound()

    const { data: commonGroup } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId)
      .in('group_id', viewerGroupIds)
      .limit(1)
      .maybeSingle()

    if (!commonGroup) notFound()
  }

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id')
    .eq('is_active', true)
    .single()

  const [{ data: matches }, { data: predictions }] = await Promise.all([
    supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        penalty_winner_team:teams!matches_penalty_winner_team_id_fkey(*)
      `)
      .eq('tournament_id', tournament?.id ?? '')
      .eq('status', 'finished')
      .order('kickoff_time', { ascending: false }),
    supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId),
  ])

  const predictionMap = new Map((predictions ?? []).map((p) => [p.match_id, p]))
  const matchesWithPredictions = (matches ?? []).filter((m) => predictionMap.has(m.id)) as MatchWithTeams[]

  const phases = PHASE_ORDER.filter((phase) =>
    matchesWithPredictions.some((m) => m.phase === phase)
  )

  return (
    <div>
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Leaderboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <PlayerAvatar displayName={targetProfile.display_name} rank="other" size="lg" />
        <div>
          <h1 className="text-xl font-bold">
            {targetProfile.display_name}
            {isOwnProfile && <span className="ml-2 text-sm font-normal text-muted-foreground">(you)</span>}
          </h1>
          <p className="text-sm text-muted-foreground">
            {targetProfile.total_points} pts · {targetProfile.exact_results_count} exact
          </p>
        </div>
      </div>

      {matchesWithPredictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <p className="text-lg font-semibold">No predictions yet.</p>
          <p className="text-sm text-muted-foreground">Check back after the first matches are finalized.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {phases.map((phase) => {
            const phaseMatches = matchesWithPredictions
              .filter((m) => m.phase === phase)
              .sort((a, b) => new Date(b.kickoff_time).getTime() - new Date(a.kickoff_time).getTime())

            return (
              <div key={phase}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {PHASE_LABELS[phase as MatchPhase]}
                </h2>
                <div className="space-y-3">
                  {phaseMatches.map((match) => (
                    <PredictionResultCard
                      key={match.id}
                      match={match}
                      prediction={predictionMap.get(match.id)!}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
