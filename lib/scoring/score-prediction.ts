export interface ScoreInput {
  predictedHome: number
  predictedAway: number
  officialHome: number
  officialAway: number
  penaltyWinnerId: string | null
  predictedPenaltyWinnerId: string | null
  homeTeamId: string
  awayTeamId: string
  isKnockout: boolean
}

type Outcome = 'home' | 'away' | 'tie'

function getOutcomeFromScores(home: number, away: number): Outcome {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'tie'
}

export function scorePrediction(input: ScoreInput): number {
  const {
    predictedHome,
    predictedAway,
    officialHome,
    officialAway,
    penaltyWinnerId,
    predictedPenaltyWinnerId,
    homeTeamId,
    isKnockout,
  } = input

  // ── Base tiers ────────────────────────────────────────────────────────────
  let points: number

  if (predictedHome === officialHome && predictedAway === officialAway) {
    points = 10
  } else if ((predictedHome - predictedAway) === (officialHome - officialAway)) {
    points = 5
  } else {
    const predictedOutcome = getOutcomeFromScores(predictedHome, predictedAway)
    const officialOutcome =
      isKnockout && penaltyWinnerId !== null
        ? (penaltyWinnerId === homeTeamId ? 'home' : 'away')
        : getOutcomeFromScores(officialHome, officialAway)
    points = predictedOutcome === officialOutcome ? 2 : 0
  }

  // ── Penalty bonus (+3) ────────────────────────────────────────────────────
  if (
    isKnockout &&
    penaltyWinnerId !== null &&
    predictedHome === predictedAway &&
    predictedPenaltyWinnerId !== null &&
    predictedPenaltyWinnerId === penaltyWinnerId
  ) {
    points += 3
  }

  return points
}
