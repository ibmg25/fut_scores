'use client'

import { useActionState } from 'react'
import Image from 'next/image'
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
    return <Badge variant="destructive">Locked</Badge>
  }
  return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Open</Badge>
}

const initialState = { error: null, success: false }

export default function MatchCard({ match, prediction }: Props) {
  const [state, action, pending] = useActionState(upsertPrediction, initialState)
  const locked = match.status === 'finished' || isPredictionLocked(match.kickoff_time)

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <LocalKickoffTime isoString={match.kickoff_time} />
        <StatusBadge match={match} />
      </div>

      {/* Teams and score */}
      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {match.home_team.flag_url && (
            <Image
              src={match.home_team.flag_url}
              alt={match.home_team.name}
              width={28}
              height={20}
              className="rounded-sm shrink-0"
              unoptimized
            />
          )}
          <span className="text-sm font-medium truncate">{match.home_team.name}</span>
        </div>

        {/* Score or input area */}
        {match.status === 'finished' ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-lg font-bold">{match.home_score}</span>
            <span className="text-zinc-400">–</span>
            <span className="text-lg font-bold">{match.away_score}</span>
          </div>
        ) : (
          <form key={prediction?.updated_at ?? `new-${match.id}`} action={action} className="flex items-center gap-1.5 shrink-0">
            <input type="hidden" name="matchId" value={match.id} />
            <Input
              name="homeScore"
              type="number"
              inputMode="numeric"
              min={0}
              max={99}
              defaultValue={prediction?.predicted_home_score ?? ''}
              disabled={locked || pending}
              className="w-12 text-center px-1 h-9 text-base"
              placeholder="0"
            />
            <span className="text-zinc-400 text-sm">–</span>
            <Input
              name="awayScore"
              type="number"
              inputMode="numeric"
              min={0}
              max={99}
              defaultValue={prediction?.predicted_away_score ?? ''}
              disabled={locked || pending}
              className="w-12 text-center px-1 h-9 text-base"
              placeholder="0"
            />
            {!locked && (
              <Button type="submit" size="sm" disabled={pending} className="h-9 px-3">
                {pending ? '…' : 'Save'}
              </Button>
            )}
          </form>
        )}

        {/* Away team */}
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <span className="text-sm font-medium truncate text-right">{match.away_team.name}</span>
          {match.away_team.flag_url && (
            <Image
              src={match.away_team.flag_url}
              alt={match.away_team.name}
              width={28}
              height={20}
              className="rounded-sm shrink-0"
              unoptimized
            />
          )}
        </div>
      </div>

      {/* Prediction points (finished) */}
      {match.status === 'finished' && prediction && (
        <div className="text-xs text-zinc-500 text-center">
          Your prediction: {prediction.predicted_home_score}–{prediction.predicted_away_score}
          {' · '}
          <span className="font-semibold text-zinc-700">{prediction.points_earned} pts</span>
        </div>
      )}

      {/* Feedback messages */}
      {state.error && <p className="text-xs text-red-500 text-center">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600 text-center">Saved!</p>}
    </div>
  )
}
