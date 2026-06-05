import { describe, it, expect } from 'vitest'
import { scorePrediction } from '@/lib/scoring/score-prediction'
import type { ScoreInput } from '@/lib/scoring/score-prediction'

const HOME_ID = 'home-team-uuid'
const AWAY_ID = 'away-team-uuid'

function make(overrides: Partial<ScoreInput> = {}): ScoreInput {
  return {
    predictedHome: 0,
    predictedAway: 0,
    officialHome: 0,
    officialAway: 0,
    penaltyWinnerId: null,
    predictedPenaltyWinnerId: null,
    homeTeamId: HOME_ID,
    awayTeamId: AWAY_ID,
    isKnockout: false,
    ...overrides,
  }
}

describe('scorePrediction', () => {
  describe('Tier 1: Exact result (10 points)', () => {
    it('awards 10 for exact 0-0', () => {
      expect(scorePrediction(make({ predictedHome: 0, predictedAway: 0, officialHome: 0, officialAway: 0 }))).toBe(10)
    })

    it('awards 10 for exact 2-1', () => {
      expect(scorePrediction(make({ predictedHome: 2, predictedAway: 1, officialHome: 2, officialAway: 1 }))).toBe(10)
    })

    it('awards 10 for exact away win', () => {
      expect(scorePrediction(make({ predictedHome: 0, predictedAway: 3, officialHome: 0, officialAway: 3 }))).toBe(10)
    })
  })

  describe('Tier 2: Same goal difference (5 points)', () => {
    it('awards 5 for same positive diff (predicted 3-1, actual 2-0)', () => {
      expect(scorePrediction(make({ predictedHome: 3, predictedAway: 1, officialHome: 2, officialAway: 0 }))).toBe(5)
    })

    it('awards 5 for same negative diff (predicted 0-2, actual 1-3)', () => {
      expect(scorePrediction(make({ predictedHome: 0, predictedAway: 2, officialHome: 1, officialAway: 3 }))).toBe(5)
    })

    it('awards 5 for zero diff (predicted tie 2-2, actual tie 1-1)', () => {
      expect(scorePrediction(make({ predictedHome: 2, predictedAway: 2, officialHome: 1, officialAway: 1 }))).toBe(5)
    })
  })

  describe('Tier 3: Correct outcome (2 points)', () => {
    it('awards 2 for predicted home win, correct', () => {
      expect(scorePrediction(make({ predictedHome: 1, predictedAway: 0, officialHome: 3, officialAway: 1 }))).toBe(2)
    })

    it('awards 2 for predicted away win, correct', () => {
      expect(scorePrediction(make({ predictedHome: 0, predictedAway: 1, officialHome: 1, officialAway: 4 }))).toBe(2)
    })

    it('awards 5 for predicted tie when official is also a tie (same diff=0, tier 2)', () => {
      expect(scorePrediction(make({ predictedHome: 1, predictedAway: 1, officialHome: 2, officialAway: 2 }))).toBe(5)
    })

    it('a predicted tie always lands in tier 2 when official is also a tie (any tie has diff=0)', () => {
      // predicted 1-1 (diff=0), official 3-3 (diff=0) → same diff → tier 2, never tier 3
      expect(scorePrediction(make({ predictedHome: 1, predictedAway: 1, officialHome: 3, officialAway: 3 }))).toBe(5)
    })
  })

  describe('Knockout matches decided on penalties', () => {
    it('awards 10 for exact score even with penalty winner set', () => {
      expect(scorePrediction(make({
        predictedHome: 1, predictedAway: 1,
        officialHome: 1, officialAway: 1,
        penaltyWinnerId: HOME_ID,
        isKnockout: true,
      }))).toBe(10)
    })

    it('awards 5 for same goal diff in knockout with penalty winner', () => {
      // predicted 2-2, official 1-1, penalty winner home — same diff (0) but not exact
      expect(scorePrediction(make({
        predictedHome: 2, predictedAway: 2,
        officialHome: 1, officialAway: 1,
        penaltyWinnerId: HOME_ID,
        isKnockout: true,
      }))).toBe(5)
    })

    it('awards 2 for predicting correct team advancing via penalties (home wins on pens)', () => {
      // predicted home win 2-1, official 1-1 pens home
      expect(scorePrediction(make({
        predictedHome: 2, predictedAway: 1,
        officialHome: 1, officialAway: 1,
        penaltyWinnerId: HOME_ID,
        isKnockout: true,
      }))).toBe(2)
    })

    it('awards 2 for predicting correct team advancing via penalties (away wins on pens)', () => {
      // predicted away win 0-1, official 0-0 pens away
      expect(scorePrediction(make({
        predictedHome: 0, predictedAway: 1,
        officialHome: 0, officialAway: 0,
        penaltyWinnerId: AWAY_ID,
        isKnockout: true,
      }))).toBe(2)
    })

    it('awards 10 for predicting exact score in knockout where home won on penalties', () => {
      // predicted tie 1-1, official 1-1 pens home — predicted "tie" outcome but actual outcome is "home"
      expect(scorePrediction(make({
        predictedHome: 1, predictedAway: 1,
        officialHome: 1, officialAway: 1,
        penaltyWinnerId: HOME_ID,
        isKnockout: true,
      }))).toBe(10) // exact score — not 0, this is tier 1
    })

    it('awards 0 for wrong side predicted in knockout decided on penalties', () => {
      // predicted home win, away won on pens (official 1-1 with pens)
      expect(scorePrediction(make({
        predictedHome: 2, predictedAway: 0,
        officialHome: 1, officialAway: 1,
        penaltyWinnerId: AWAY_ID,
        isKnockout: true,
      }))).toBe(0)
    })

    it('awards 5 for predicting same goal difference in knockout where away team advanced via pens', () => {
      // predicted 2-2 tie, official 0-0 pens away — diff matches (both 0) → tier 2: 5 points
      expect(scorePrediction(make({
        predictedHome: 2, predictedAway: 2,
        officialHome: 0, officialAway: 0,
        penaltyWinnerId: AWAY_ID,
        isKnockout: true,
      }))).toBe(5) // same diff (0) — tier 2 fires before tier 3
    })

    it('pure wrong outcome in knockout gives 0', () => {
      // predicted home 3-0, official 0-0 away wins on pens — diff differs, outcome wrong
      expect(scorePrediction(make({
        predictedHome: 3, predictedAway: 0,
        officialHome: 0, officialAway: 0,
        penaltyWinnerId: AWAY_ID,
        isKnockout: true,
      }))).toBe(0)
    })
  })

  describe('Tier 4: Wrong outcome (0 points)', () => {
    it('awards 0 for completely wrong prediction', () => {
      expect(scorePrediction(make({ predictedHome: 3, predictedAway: 0, officialHome: 0, officialAway: 2 }))).toBe(0)
    })

    it('awards 0 for predicted home win when it was a tie', () => {
      expect(scorePrediction(make({ predictedHome: 2, predictedAway: 0, officialHome: 1, officialAway: 1 }))).toBe(0)
    })

    it('awards 0 for predicted away win when home won', () => {
      expect(scorePrediction(make({ predictedHome: 0, predictedAway: 2, officialHome: 3, officialAway: 1 }))).toBe(0)
    })
  })

  describe('Group phase does not treat penalties as outcome override', () => {
    it('group match with penalty_winner null still scores normally', () => {
      expect(scorePrediction(make({
        predictedHome: 1, predictedAway: 0,
        officialHome: 2, officialAway: 1,
        penaltyWinnerId: null,
        isKnockout: false,
      }))).toBe(5)
    })
  })

  describe('Penalty winner bonus (+3 points)', () => {
    it('awards 13 for exact tied score + correct penalty pick', () => {
      expect(scorePrediction(make({
        predictedHome: 1, predictedAway: 1,
        officialHome: 1, officialAway: 1,
        penaltyWinnerId: HOME_ID,
        predictedPenaltyWinnerId: HOME_ID,
        isKnockout: true,
      }))).toBe(13)
    })

    it('awards 8 for same-diff tie + correct penalty pick', () => {
      // predicted 2-2, official 1-1, same diff 0
      expect(scorePrediction(make({
        predictedHome: 2, predictedAway: 2,
        officialHome: 1, officialAway: 1,
        penaltyWinnerId: HOME_ID,
        predictedPenaltyWinnerId: HOME_ID,
        isKnockout: true,
      }))).toBe(8)
    })

    it('awards 10 (no bonus) for exact score + wrong penalty pick', () => {
      expect(scorePrediction(make({
        predictedHome: 1, predictedAway: 1,
        officialHome: 1, officialAway: 1,
        penaltyWinnerId: HOME_ID,
        predictedPenaltyWinnerId: AWAY_ID,
        isKnockout: true,
      }))).toBe(10)
    })

    it('awards 10 (no bonus) for exact score + no penalty pick', () => {
      expect(scorePrediction(make({
        predictedHome: 1, predictedAway: 1,
        officialHome: 1, officialAway: 1,
        penaltyWinnerId: HOME_ID,
        predictedPenaltyWinnerId: null,
        isKnockout: true,
      }))).toBe(10)
    })

    it('awards 10 (no bonus) when match had no penalty winner', () => {
      expect(scorePrediction(make({
        predictedHome: 1, predictedAway: 1,
        officialHome: 1, officialAway: 1,
        penaltyWinnerId: null,
        predictedPenaltyWinnerId: HOME_ID,
        isKnockout: true,
      }))).toBe(10)
    })

    it('awards base tier only for non-tie prediction even if pick would be correct', () => {
      // predicted 2-1 (not a tie) — bonus never applies
      expect(scorePrediction(make({
        predictedHome: 2, predictedAway: 1,
        officialHome: 2, officialAway: 1,
        penaltyWinnerId: HOME_ID,
        predictedPenaltyWinnerId: HOME_ID,
        isKnockout: true,
      }))).toBe(10)
    })

    it('no bonus in group stage matches', () => {
      expect(scorePrediction(make({
        predictedHome: 1, predictedAway: 1,
        officialHome: 1, officialAway: 1,
        penaltyWinnerId: HOME_ID,
        predictedPenaltyWinnerId: HOME_ID,
        isKnockout: false,
      }))).toBe(10)
    })
  })
})
