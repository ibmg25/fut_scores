'use client'

import { useActionState, useEffect } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Lock, Loader2 } from 'lucide-react'
import { upsertPrediction } from '@/app/(app)/matches/actions'
import { isPredictionLocked } from '@/lib/datetime/format'
import LocalKickoffTime from './LocalKickoffTime'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { MatchWithTeams, Prediction } from '@/lib/supabase/types'

interface Props {
  match: MatchWithTeams
  prediction: Prediction | undefined
}

function StatusBadge({ match }: { match: MatchWithTeams }) {
  if (match.status === 'finished') {
    return <Badge variant="secondary">Finished</Badge>
  }
  if (isPredictionLocked(match.kickoff_time)) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <Lock className="w-3 h-3" />
        Locked
      </Badge>
    )
  }
  return <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Open</Badge>
}

function PointsBadge({ points }: { points: number }) {
  const colorClass =
    points === 10
      ? 'text-green-400'
      : points === 5
      ? 'text-emerald-400'
      : points === 2
      ? 'text-yellow-400'
      : 'text-muted-foreground'
  return <span className={`font-semibold ${colorClass}`}>{points} pts</span>
}

const initialState = { error: null as string | null, success: false }

export default function MatchCard({ match, prediction }: Props) {
  const [state, action, pending] = useActionState(upsertPrediction, initialState)
  const locked = match.status === 'finished' || isPredictionLocked(match.kickoff_time)

  useEffect(() => {
    if (state.success) toast.success('Prediction saved!')
    else if (state.error) toast.error(state.error)
  }, [state])

  const teamsRow = (scoreCenter: React.ReactNode) => (
    <div className="flex items-center gap-3">
      {/* Home team */}
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

      {scoreCenter}

      {/* Away team */}
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
  )

  return (
    <div className={`bg-card border border-border rounded-xl p-4 space-y-3 ${locked ? 'opacity-75 cursor-default' : ''}`}>
      {/* Header row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <LocalKickoffTime isoString={match.kickoff_time} />
        <StatusBadge match={match} />
      </div>

      {locked ? (
        <>
          {teamsRow(
            match.status === 'finished' ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-2xl font-bold">{match.home_score}</span>
                <span className="text-muted-foreground text-lg">–</span>
                <span className="text-2xl font-bold">{match.away_score}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-12 h-12 flex items-center justify-center rounded-md border border-border bg-muted text-xl font-bold text-muted-foreground">
                  {prediction?.predicted_home_score ?? '–'}
                </div>
                <span className="text-muted-foreground text-sm">–</span>
                <div className="w-12 h-12 flex items-center justify-center rounded-md border border-border bg-muted text-xl font-bold text-muted-foreground">
                  {prediction?.predicted_away_score ?? '–'}
                </div>
              </div>
            )
          )}

          {/* Prediction result for finished matches */}
          {match.status === 'finished' && prediction && (
            <div className="text-xs text-muted-foreground text-center">
              Your pick: {prediction.predicted_home_score}–{prediction.predicted_away_score}
              {' · '}
              <PointsBadge points={prediction.points_earned} />
            </div>
          )}
        </>
      ) : (
        <form key={prediction?.updated_at ?? `new-${match.id}`} action={action} className="space-y-3">
          <input type="hidden" name="matchId" value={match.id} />

          {teamsRow(
            <div className="flex items-center gap-1.5 shrink-0">
              <Input
                name="homeScore"
                type="number"
                inputMode="numeric"
                min={0}
                max={99}
                defaultValue={prediction?.predicted_home_score ?? ''}
                disabled={pending}
                className="w-12 h-12 text-center px-1 text-xl"
                placeholder="0"
              />
              <span className="text-muted-foreground text-sm">–</span>
              <Input
                name="awayScore"
                type="number"
                inputMode="numeric"
                min={0}
                max={99}
                defaultValue={prediction?.predicted_away_score ?? ''}
                disabled={pending}
                className="w-12 h-12 text-center px-1 text-xl"
                placeholder="0"
              />
            </div>
          )}

          <Button type="submit" disabled={pending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Prediction'}
          </Button>
        </form>
      )}
    </div>
  )
}
