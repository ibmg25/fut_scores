'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MatchCard from './MatchCard'
import { PHASE_LABELS, PHASE_ORDER } from '@/lib/match-phases'
import type { MatchWithTeams, MatchPhase, Prediction } from '@/lib/supabase/types'

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
      <div className="text-center py-20 text-muted-foreground">
        No matches scheduled yet.
      </div>
    )
  }

  return (
    <Tabs defaultValue={phases[0]}>
      <TabsList className="flex flex-nowrap overflow-x-auto h-auto gap-1 mb-0 w-full justify-start">
        {phases.map((phase) => (
          <TabsTrigger key={phase} value={phase} className="text-xs shrink-0 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
            {PHASE_LABELS[phase]}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="border-t border-border mb-4" />
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
