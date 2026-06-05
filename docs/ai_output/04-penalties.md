# 04 — Penalty Winner Bonus: Key Decisions

## Schema Design

Two additive DB changes in a single migration (`20260101000022`): `matches.is_knockout BOOLEAN NOT NULL DEFAULT false` and `predictions.predicted_penalty_winner_team_id UUID NULL`. The `DEFAULT false` means all existing group-stage rows are correctly initialised with no backfill.

A check constraint (`chk_penalty_pick_requires_tie`) enforces at the DB level that a penalty pick can only exist alongside a predicted tie. This is the tightest possible invariant — the server action also nullifies the pick when scores differ, but the constraint is the authoritative guard.

`is_knockout` replaces the hardcoded `GROUP_PHASES` constant that was duplicated in three places (`score-prediction.ts`, `finalize-match-form.tsx`, and would have been needed in `MatchCard`). Knockout status is now a data property of the match record, not a derivation from the phase enum.

## Trigger Fixes

**Lock trigger:** The skip condition (which allows `finalize_match` to write `points_earned` after kickoff) previously checked only `predicted_home_score` and `predicted_away_score`. The new column was added to the condition — without this, a user could POST a changed penalty pick post-kickoff while keeping scores the same and bypass the lock.

**Aggregate trigger:** `exact_results_count` was `points_earned = 10`. Changed to `>= 10` because exact picks in penalty matches now earn 13 pts. The max non-exact score is 8 (5-pt tier + 3-pt bonus), so `>= 10` exclusively and correctly identifies the exact tier.

## Scoring Logic

The bonus stacks on top of the existing tiers — no existing tier changed. The bonus condition requires all four to be true simultaneously: `isKnockout`, match went to penalties (`penaltyWinnerId != null`), user predicted a tie (`predictedHome === predictedAway`), and the user's pick matches the actual winner. Non-tie predictions never qualify regardless of pick.

`GROUP_PHASES`, `isGroupPhase()`, and `getOfficialOutcome()` were deleted from `score-prediction.ts`. The `phase: MatchPhase` field on `ScoreInput` became `isKnockout: boolean`. All existing tests passed unchanged after the `make()` helper was updated.

## MatchCard UI

Score values are tracked with `useState` so the penalty picker can appear/disappear reactively without a form submit. The score inputs stay uncontrolled (`defaultValue` + `onChange`) to avoid fighting React's controlled/uncontrolled input model.

The penalty `<select>` unmounts when scores become unequal — its value is no longer part of `FormData`, so the server action receives no `penaltyWinnerId` and correctly nullifies any existing pick. A `key` prop tied to `${homeVal}-${awayVal}` resets the select's selected option whenever scores change, preventing stale visual state.

The server action nullifies the pick redundantly (scores not equal, match not knockout, team not valid) as a defense-in-depth layer on top of the UI constraint.

## PointsBadge

Two new thresholds added: `>= 13` (gold, exact + bonus) and `=== 8` (light emerald, same-diff + bonus). Existing thresholds 10/5/2/0 are unchanged. The `>= 13` comparison is intentional — in theory a future scoring change could push the max higher, so the threshold stays correct.

## Files Created / Modified

| File | Action |
|---|---|
| `supabase/migrations/20260101000022_prediction_penalty_winner.sql` | New: `is_knockout` column, penalty pick column + constraint, lock trigger fix, aggregate trigger fix, updated `finalize_match` RPC |
| `lib/supabase/types.ts` | Modified: added `is_knockout` to `matches`; added `predicted_penalty_winner_team_id` to `predictions` |
| `lib/scoring/score-prediction.ts` | Modified: replaced `phase` with `isKnockout`; removed `GROUP_PHASES`/`isGroupPhase`/`getOfficialOutcome`; added `predictedPenaltyWinnerId` and bonus |
| `tests/scoring.test.ts` | Modified: updated `make()` helper; added 7-case bonus `describe` block |
| `app/(app)/admin/results/finalize-match-form.tsx` | Modified: removed `GROUP_PHASES` constant; replaced derivation with `match.is_knockout` |
| `app/(app)/matches/actions.ts` | Modified: added `penaltyWinnerId` to schema, validation, and upsert payload |
| `components/features/MatchCard.tsx` | Modified: score tracking state; conditional penalty picker; locked/finished display with team name; updated `PointsBadge` thresholds |
