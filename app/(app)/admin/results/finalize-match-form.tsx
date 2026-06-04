'use client'

import { useActionState } from 'react'
import { finalizeMatchAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MatchWithTeams, MatchPhase } from '@/lib/supabase/types'

const GROUP_PHASES: MatchPhase[] = [
  'group_a', 'group_b', 'group_c', 'group_d', 'group_e', 'group_f',
  'group_g', 'group_h', 'group_i', 'group_j', 'group_k', 'group_l',
]

const initialState = { error: null, success: false }

interface Props {
  match: MatchWithTeams
  compact?: boolean
}

export default function FinalizeMatchForm({ match, compact }: Props) {
  const [state, action, pending] = useActionState(finalizeMatchAction, initialState)
  const isKnockout = !GROUP_PHASES.includes(match.phase)

  if (compact) {
    return (
      <form action={action} className="flex items-center gap-2 flex-wrap">
        <input type="hidden" name="matchId" value={match.id} />
        {isKnockout ? (
          <Select name="penaltyWinnerId" defaultValue={match.penalty_winner_team_id ?? ''}>
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue placeholder="No pens" />
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
        <Input
          name="homeScore"
          type="number"
          inputMode="numeric"
          min={0}
          defaultValue={match.home_score ?? 0}
          className="w-12 h-7 text-center px-1 text-sm"
        />
        <span className="text-zinc-400 text-xs">–</span>
        <Input
          name="awayScore"
          type="number"
          inputMode="numeric"
          min={0}
          defaultValue={match.away_score ?? 0}
          className="w-12 h-7 text-center px-1 text-sm"
        />
        <Button type="submit" size="sm" variant="outline" disabled={pending} className="h-7 text-xs px-2">
          {pending ? '…' : 'Update'}
        </Button>
      </form>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm">
          {match.home_team.name} vs {match.away_team.name}
        </div>
        <span className="text-xs text-zinc-500 capitalize">
          {match.phase.replace('_', ' ')}
        </span>
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="matchId" value={match.id} />

        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">{match.home_team.name}</Label>
            <Input
              name="homeScore"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={match.home_score ?? ''}
              required
              placeholder="0"
              className="h-10 text-center text-lg"
            />
          </div>
          <span className="text-zinc-400 mt-5">–</span>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">{match.away_team.name}</Label>
            <Input
              name="awayScore"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={match.away_score ?? ''}
              required
              placeholder="0"
              className="h-10 text-center text-lg"
            />
          </div>
        </div>

        {isKnockout && (
          <div className="space-y-1">
            <Label className="text-xs">Penalty Winner (if applicable)</Label>
            <Select name="penaltyWinnerId" defaultValue={match.penalty_winner_team_id ?? ''}>
              <SelectTrigger>
                <SelectValue placeholder="No penalties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No penalties</SelectItem>
                <SelectItem value={match.home_team_id}>{match.home_team.name}</SelectItem>
                <SelectItem value={match.away_team_id}>{match.away_team.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {state.error && <p className="text-xs text-red-500">{state.error}</p>}
        {state.success && <p className="text-xs text-green-600">Match finalized!</p>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Saving…' : 'Finalize Match'}
        </Button>
      </form>
    </div>
  )
}
