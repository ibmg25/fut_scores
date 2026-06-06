'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { finalizeMatchAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import LocalKickoffTime from '@/components/features/LocalKickoffTime'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MatchWithTeams } from '@/lib/supabase/types'

const initialState = { error: null, success: false }

interface Props {
  match: MatchWithTeams
  compact?: boolean
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

function TeamRow({ match: m, side, score }: {
  match: MatchWithTeams
  side: 'home' | 'away'
  score: React.ReactNode
}) {
  const team = side === 'home' ? m.home_team : m.away_team
  return (
    <div className="flex items-center gap-2">
      <TeamFlag url={team.flag_url} name={team.name} />
      <span className="flex-1 text-sm font-semibold min-w-0">{team.name}</span>
      {score}
    </div>
  )
}

export default function FinalizeMatchForm({ match, compact }: Props) {
  const [state, formAction, pending] = useActionState(finalizeMatchAction, initialState)
  const isKnockout = match.is_knockout

  const [penaltyWinner, setPenaltyWinner] = useState<string>(
    match.penalty_winner_team_id ?? ''
  )

  const penaltyLabel =
    penaltyWinner === match.home_team_id ? match.home_team.name
    : penaltyWinner === match.away_team_id ? match.away_team.name
    : null

  if (compact) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 text-xs text-muted-foreground">
          <LocalKickoffTime isoString={match.kickoff_time} />
          <Badge variant="secondary">Finished</Badge>
        </div>

        {/* Score display */}
        <div className="px-4 pb-3 space-y-1.5">
          <TeamRow
            match={match}
            side="home"
            score={<span className="text-2xl font-bold tabular-nums shrink-0">{match.home_score}</span>}
          />
          <TeamRow
            match={match}
            side="away"
            score={<span className="text-2xl font-bold tabular-nums shrink-0">{match.away_score}</span>}
          />
          {match.penalty_winner_team && (
            <p className="text-xs text-muted-foreground pl-10">
              Pens: {match.penalty_winner_team.name}
            </p>
          )}
        </div>

        {/* Edit footer */}
        <form
          action={formAction}
          className="border-t border-border bg-muted/30 px-4 py-2.5 flex items-center gap-2 flex-wrap"
        >
          <input type="hidden" name="matchId" value={match.id} />
          <Input
            name="homeScore"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={match.home_score ?? 0}
            className="w-12 h-7 text-center px-1 text-sm font-mono tabular-nums"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            name="awayScore"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={match.away_score ?? 0}
            className="w-12 h-7 text-center px-1 text-sm font-mono tabular-nums"
          />
          {isKnockout ? (
            <Select
              name="penaltyWinnerId"
              value={penaltyWinner}
              onValueChange={(v) => setPenaltyWinner(v ?? '')}
            >
              <SelectTrigger className="h-7 flex-1 min-w-[100px] text-xs">
                {penaltyLabel
                  ? <span className="flex-1 text-left">{penaltyLabel}</span>
                  : <SelectValue placeholder="No pens" />}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No pens</SelectItem>
                <SelectItem value={match.home_team_id}>{match.home_team.name}</SelectItem>
                <SelectItem value={match.away_team_id}>{match.away_team.name}</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <input type="hidden" name="penaltyWinnerId" value="" />
          )}
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={pending}
            className="h-7 text-xs px-3 ml-auto"
          >
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update'}
          </Button>
        </form>
      </div>
    )
  }

  // Full pending form
  return (
    <div className="bg-card border border-amber-400/25 border-l-[3px] border-l-amber-400/70 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <LocalKickoffTime isoString={match.kickoff_time} />
        <span className="bg-amber-400/10 text-amber-400 text-xs font-medium px-2 py-0.5 rounded-md capitalize">
          {match.phase.replace(/_/g, ' ')}
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="matchId" value={match.id} />

        {/* Stacked team rows with score inputs */}
        <div className="space-y-2">
          <TeamRow
            match={match}
            side="home"
            score={
              <Input
                name="homeScore"
                type="number"
                inputMode="numeric"
                min={0}
                defaultValue={match.home_score ?? ''}
                required
                placeholder="0"
                className="w-12 h-10 shrink-0 text-center px-1 text-lg font-mono tabular-nums"
              />
            }
          />

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

          <TeamRow
            match={match}
            side="away"
            score={
              <Input
                name="awayScore"
                type="number"
                inputMode="numeric"
                min={0}
                defaultValue={match.away_score ?? ''}
                required
                placeholder="0"
                className="w-12 h-10 shrink-0 text-center px-1 text-lg font-mono tabular-nums"
              />
            }
          />
        </div>

        {isKnockout && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Penalty winner (if applicable)</Label>
            <Select
              name="penaltyWinnerId"
              value={penaltyWinner}
              onValueChange={(v) => setPenaltyWinner(v ?? '')}
            >
              <SelectTrigger>
                {penaltyLabel
                  ? <span className="flex-1 text-left text-sm">{penaltyLabel}</span>
                  : <SelectValue placeholder="No penalties" />}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No penalties</SelectItem>
                <SelectItem value={match.home_team_id}>{match.home_team.name}</SelectItem>
                <SelectItem value={match.away_team_id}>{match.away_team.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {state.error && <p className="text-xs text-destructive">{state.error}</p>}
        {state.success && <p className="text-xs text-primary">Saved!</p>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalize Match'}
        </Button>
      </form>
    </div>
  )
}
