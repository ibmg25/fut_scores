'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MatchCard from './MatchCard'
import type { MatchWithTeams, MatchPhase, Prediction } from '@/lib/supabase/types'

const PHASE_LABELS: Record<MatchPhase, string> = {
  group_a: 'Group A', group_b: 'Group B', group_c: 'Group C', group_d: 'Group D',
  group_e: 'Group E', group_f: 'Group F', group_g: 'Group G', group_h: 'Group H',
  group_i: 'Group I', group_j: 'Group J', group_k: 'Group K', group_l: 'Group L',
  r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarter-finals',
  sf: 'Semi-finals', third_place: '3rd Place', final: 'Final',
}

const PHASE_ORDER: MatchPhase[] = [
  'group_a', 'group_b', 'group_c', 'group_d', 'group_e', 'group_f',
  'group_g', 'group_h', 'group_i', 'group_j', 'group_k', 'group_l',
  'r32', 'r16', 'qf', 'sf', 'third_place', 'final',
]

interface Props {
  matches: MatchWithTeams[]
  predictions: Prediction[]
}

export default function MatchesByPhase({ matches, predictions }: Props) {
  const predictionMap = new Map(predictions.map((p) => [p.match_id, p]))

  const phases = PHASE_ORDER.filter((phase) =>
    matches.some((m) => m.phase === phase)
  )

  if (phases.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        No matches scheduled yet.
      </div>
    )
  }

  return (
    <Tabs defaultValue={phases[0]}>
      <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
        {phases.map((phase) => (
          <TabsTrigger key={phase} value={phase} className="text-xs">
            {PHASE_LABELS[phase]}
          </TabsTrigger>
        ))}
      </TabsList>
      {phases.map((phase) => {
        const phaseMatches = matches
          .filter((m) => m.phase === phase)
          .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())

        return (
          <TabsContent key={phase} value={phase} className="space-y-3 mt-0">
            {phaseMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictionMap.get(match.id)}
              />
            ))}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
