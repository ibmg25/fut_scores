'use client'

import { useActionState, useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Lock, Loader2, Check } from 'lucide-react'
import { upsertPrediction } from '@/app/(app)/matches/actions'
import { isPredictionLocked } from '@/lib/datetime/format'
import LocalKickoffTime from './LocalKickoffTime'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    points >= 13 ? 'text-yellow-300 bg-yellow-300/10'
    : points === 10 ? 'text-green-400 bg-green-400/10'
    : points === 8  ? 'text-emerald-300 bg-emerald-300/10'
    : points === 5  ? 'text-emerald-400 bg-emerald-400/10'
    : points === 2  ? 'text-yellow-400 bg-yellow-400/10'
    : 'text-muted-foreground bg-muted/50'
  return (
    <span className={`inline-flex items-center font-semibold text-xs px-2 py-0.5 rounded-md ${colorClass}`}>
      {points} pts
    </span>
  )
}

function TeamFlag({ url, name }: { url: string | null; name: string }) {
  if (!url) return null
  return (
    <Image
      src={url}
      alt={name}
      width={32}
      height={24}
      className="rounded-sm shrink-0 w-8 h-6"
      unoptimized
    />
  )
}

const initialState = { error: null as string | null, success: false }

export default function MatchCard({ match, prediction }: Props) {
  const [state, action, pending] = useActionState(upsertPrediction, initialState)
  const isFinished = match.status === 'finished'
  const locked = isFinished || isPredictionLocked(match.kickoff_time)
  const isLocked = locked && !isFinished
  const isKnockout = match.is_knockout

  const [homeVal, setHomeVal] = useState(prediction?.predicted_home_score?.toString() ?? '')
  const [awayVal, setAwayVal] = useState(prediction?.predicted_away_score?.toString() ?? '')
  const [penaltyVal, setPenaltyVal] = useState<string>(prediction?.predicted_penalty_winner_team_id ?? '')

  const showPenaltyPicker = isKnockout && homeVal !== '' && awayVal !== '' && homeVal === awayVal

  const savedHome = prediction?.predicted_home_score?.toString() ?? ''
  const savedAway = prediction?.predicted_away_score?.toString() ?? ''
  const savedPenalty = prediction?.predicted_penalty_winner_team_id ?? ''

  const isDirty =
    homeVal !== savedHome ||
    awayVal !== savedAway ||
    (showPenaltyPicker && penaltyVal !== savedPenalty)

  useEffect(() => {
    if (state.success) toast.success('Prediction saved!')
    else if (state.error) toast.error(state.error)
  }, [state])

  // Uncontrolled inputs don't fire onChange for untouched fields; sync state after each save
  useEffect(() => {
    setHomeVal(prediction?.predicted_home_score?.toString() ?? '')
    setAwayVal(prediction?.predicted_away_score?.toString() ?? '')
    setPenaltyVal(prediction?.predicted_penalty_winner_team_id ?? '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prediction?.updated_at])

  // Reset penalty pick to saved value when tie is broken
  useEffect(() => {
    if (!showPenaltyPicker) setPenaltyVal(savedPenalty)
  }, [showPenaltyPicker, savedPenalty])

  const penaltyPickTeam =
    prediction?.predicted_penalty_winner_team_id === match.home_team_id
      ? match.home_team
      : prediction?.predicted_penalty_winner_team_id === match.away_team_id
      ? match.away_team
      : null

  const cardClass = isFinished
    ? 'bg-card border border-border rounded-xl p-4 space-y-3'
    : isLocked
    ? 'bg-card border border-border border-l-[3px] border-l-amber-400/60 rounded-xl p-4 space-y-3 cursor-default'
    : 'bg-card border border-primary/30 border-l-[3px] border-l-primary rounded-xl p-4 space-y-3'

  const canSave = homeVal !== '' && awayVal !== ''
  const isSaved = !!prediction && !isDirty
  const buttonClass = isSaved
    ? 'w-full bg-green-400/10 text-green-400 border border-green-400/30 hover:bg-green-400/10 cursor-default'
    : 'w-full bg-primary text-primary-foreground hover:bg-primary/90'

  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <LocalKickoffTime isoString={match.kickoff_time} />
        <StatusBadge match={match} />
      </div>

      {locked ? (
        <>
          {/* Stacked team rows — locked/finished display */}
          <div className="space-y-1.5">
            {/* Home row */}
            <div className="flex items-center gap-2">
              <TeamFlag url={match.home_team.flag_url} name={match.home_team.name} />
              <span className="flex-1 text-sm font-semibold min-w-0">{match.home_team.name}</span>
              {isFinished ? (
                <span className="text-2xl font-bold tabular-nums shrink-0">{match.home_score}</span>
              ) : (
                <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-md border border-border bg-muted text-lg font-bold tabular-nums text-muted-foreground">
                  {prediction?.predicted_home_score ?? '–'}
                </div>
              )}
            </div>

            {/* Away row */}
            <div className="flex items-center gap-2">
              <TeamFlag url={match.away_team.flag_url} name={match.away_team.name} />
              <span className="flex-1 text-sm font-semibold min-w-0">{match.away_team.name}</span>
              {isFinished ? (
                <span className="text-2xl font-bold tabular-nums shrink-0">{match.away_score}</span>
              ) : (
                <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-md border border-border bg-muted text-lg font-bold tabular-nums text-muted-foreground">
                  {prediction?.predicted_away_score ?? '–'}
                </div>
              )}
            </div>
          </div>

          {/* Prediction summary for finished matches */}
          {isFinished && prediction && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Your pick: {prediction.predicted_home_score}–{prediction.predicted_away_score}
                {isKnockout && penaltyPickTeam && <> ({penaltyPickTeam.name} wins pens)</>}
              </span>
              <PointsBadge points={prediction.points_earned} />
            </div>
          )}
        </>
      ) : (
        <form key={prediction?.updated_at ?? `new-${match.id}`} action={action} className="space-y-3">
          <input type="hidden" name="matchId" value={match.id} />

          {/* Stacked team rows — prediction inputs */}
          <div className="space-y-2">
            {/* Home row */}
            <div className="flex items-center gap-2">
              <TeamFlag url={match.home_team.flag_url} name={match.home_team.name} />
              <span className="flex-1 text-sm font-semibold min-w-0">{match.home_team.name}</span>
              <Input
                name="homeScore"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={homeVal}
                disabled={pending}
                className="w-12 h-10 shrink-0 text-center px-1 text-lg font-mono tabular-nums"
                placeholder="–"
                onChange={e => setHomeVal(e.target.value.replace(/\D/g, '').slice(0, 2))}
              />
            </div>

            {/* vs divider */}
            <div className="flex items-center gap-2">
              <div className="w-8 shrink-0" />
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-[10px] text-muted-foreground/50 tracking-widest uppercase font-light">vs</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>
              <div className="w-12 shrink-0" />
            </div>

            {/* Away row */}
            <div className="flex items-center gap-2">
              <TeamFlag url={match.away_team.flag_url} name={match.away_team.name} />
              <span className="flex-1 text-sm font-semibold min-w-0">{match.away_team.name}</span>
              <Input
                name="awayScore"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={awayVal}
                disabled={pending}
                className="w-12 h-10 shrink-0 text-center px-1 text-lg font-mono tabular-nums"
                placeholder="–"
                onChange={e => setAwayVal(e.target.value.replace(/\D/g, '').slice(0, 2))}
              />
            </div>
          </div>

          {showPenaltyPicker && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Penalty winner</Label>
              <select
                name="penaltyWinnerId"
                value={penaltyVal}
                onChange={e => setPenaltyVal(e.target.value)}
                disabled={pending}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">— select team —</option>
                <option value={match.home_team_id}>{match.home_team.name}</option>
                <option value={match.away_team_id}>{match.away_team.name}</option>
              </select>
            </div>
          )}

          <Button
            type="submit"
            disabled={pending || isSaved || !canSave}
            className={buttonClass}
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <><Check className="w-4 h-4" /><span>Saved</span></>
            ) : prediction ? (
              'Update Prediction'
            ) : (
              'Save Prediction'
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
