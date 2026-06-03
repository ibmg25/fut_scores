import type { MatchPhase } from '@/lib/supabase/types'

export interface ScoreInput {
  predictedHome: number
  predictedAway: number
  officialHome: number
  officialAway: number
  penaltyWinnerId: string | null
  homeTeamId: string
  awayTeamId: string
  phase: MatchPhase
}

const GROUP_PHASES: MatchPhase[] = [
  'group_a', 'group_b', 'group_c', 'group_d', 'group_e', 'group_f',
  'group_g', 'group_h', 'group_i', 'group_j', 'group_k', 'group_l',
]

function isGroupPhase(phase: MatchPhase): boolean {
  return GROUP_PHASES.includes(phase)
}

type Outcome = 'home' | 'away' | 'tie'

function getOutcomeFromScores(home: number, away: number): Outcome {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'tie'
}

function getOfficialOutcome(
  officialHome: number,
  officialAway: number,
  penaltyWinnerId: string | null,
  homeTeamId: string,
  awayTeamId: string,
  phase: MatchPhase
): Outcome {
  if (!isGroupPhase(phase) && penaltyWinnerId !== null) {
    return penaltyWinnerId === homeTeamId ? 'home' : 'away'
  }
  return getOutcomeFromScores(officialHome, officialAway)
}

export function scorePrediction(input: ScoreInput): number {
  const {
    predictedHome,
    predictedAway,
    officialHome,
    officialAway,
    penaltyWinnerId,
    homeTeamId,
    awayTeamId,
    phase,
  } = input

  // Tier 1: Exact result
  if (predictedHome === officialHome && predictedAway === officialAway) {
    return 10
  }

  // Tier 2: Same goal difference
  if ((predictedHome - predictedAway) === (officialHome - officialAway)) {
    return 5
  }

  // Tier 3: Correct outcome (winner or tie)
  const predictedOutcome = getOutcomeFromScores(predictedHome, predictedAway)
  const officialOutcome = getOfficialOutcome(
    officialHome, officialAway, penaltyWinnerId, homeTeamId, awayTeamId, phase
  )
  if (predictedOutcome === officialOutcome) {
    return 2
  }

  return 0
}
