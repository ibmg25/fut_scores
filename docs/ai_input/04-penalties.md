# Implementation Plan: Penalty Winner Bonus

## 1. Overview

This plan covers two related changes delivered together:

1. **Penalty winner bonus (+3 pts)** — a new optional pick for knockout matches that rewards correctly predicting which team wins on penalties.
2. **`is_knockout` field on `matches`** — a boolean that makes knockout status explicit and data-driven, decoupling all knockout-detection logic from the `match_phase` enum.

Both changes are additive. The existing scoring tiers (10 / 5 / 2 / 0) are **unchanged**. The bonus stacks on top: a user who predicts the exact tied score AND the correct penalty winner earns 13 points. A user who predicts any tied score with the correct penalty winner earns 8 points. A user with no penalty pick, or a wrong pick, receives no bonus.

**Key constraints:**
- The penalty winner pick is only available when: (a) `match.is_knockout` is true and (b) the user has entered equal scores. It is never shown for group-stage matches or when the predicted score is not a tie.
- The penalty pick is optional. A user who does not submit one still earns their base score as today.
- No changes to the admin panel, leaderboard, or groups feature beyond removing the `GROUP_PHASES` constant where it is currently duplicated.

**Why `is_knockout` now:** the `GROUP_PHASES` constant (a hardcoded list of all group-phase enum values) is already duplicated in `finalize-match-form.tsx` and `score-prediction.ts`, and would be copied a third time into `MatchCard` by this feature. More importantly, adding a new tournament with a different format would require updating both the enum and every copy of the constant. Making knockout status an explicit column on the match record solves both problems at the right layer.

### Scoring table

| Scenario | Base | Bonus | Total |
|---|---|---|---|
| Exact tied score + correct penalty pick | 10 | +3 | **13** |
| Exact tied score + wrong/no pick | 10 | 0 | 10 |
| Same-diff tie + correct penalty pick | 5 | +3 | **8** |
| Same-diff tie + wrong/no pick | 5 | 0 | 5 |
| Non-tie prediction (any) | 0/2/5/10 | 0 | unchanged |
| Match did not go to penalties | 0/2/5/10 | 0 | unchanged |

## 2. Database Changes

### 2.1 New Migration: `20260101000022_prediction_penalty_winner.sql`

One migration covers all DB changes: `is_knockout` on matches, new column on predictions, check constraint, lock trigger fix, aggregate trigger fix, and RPC update.

#### `matches.is_knockout`

```sql
ALTER TABLE matches
  ADD COLUMN is_knockout BOOLEAN NOT NULL DEFAULT false;
```

`DEFAULT false` means all existing group-stage rows are correctly initialised without a backfill. Future knockout fixture inserts (via admin UI or migration) must explicitly set `is_knockout = true`. The column replaces every hardcoded `GROUP_PHASES` check in application code and in the RPC.

#### New column and constraint

```sql
ALTER TABLE predictions
  ADD COLUMN predicted_penalty_winner_team_id UUID NULL REFERENCES teams(id);

-- A penalty pick is only valid alongside a predicted tie.
ALTER TABLE predictions
  ADD CONSTRAINT chk_penalty_pick_requires_tie
  CHECK (
    predicted_penalty_winner_team_id IS NULL
    OR predicted_home_score = predicted_away_score
  );
```

No RLS change needed. The existing `predictions` policy already limits writes to `user_id = auth.uid()`.

#### Lock trigger fix

The current `fn_enforce_prediction_lock` skips the lock when only `points_earned` is changing (i.e., `finalize_match` writing back scores). The skip condition must also include the new column, otherwise a user could POST just a changed penalty pick after kick-off while keeping scores the same and bypass the lock.

```sql
CREATE OR REPLACE FUNCTION fn_enforce_prediction_lock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_kickoff TIMESTAMPTZ;
BEGIN
  -- Skip when only points_earned changed (finalize_match RPC path).
  -- All three prediction fields must be unchanged for the skip to apply.
  IF TG_OP = 'UPDATE'
     AND NEW.predicted_home_score IS NOT DISTINCT FROM OLD.predicted_home_score
     AND NEW.predicted_away_score  IS NOT DISTINCT FROM OLD.predicted_away_score
     AND NEW.predicted_penalty_winner_team_id IS NOT DISTINCT FROM OLD.predicted_penalty_winner_team_id
  THEN
    RETURN NEW;
  END IF;

  SELECT kickoff_time INTO v_kickoff
  FROM matches WHERE id = NEW.match_id;

  IF now() >= v_kickoff - INTERVAL '1 hour' THEN
    RAISE EXCEPTION 'Predictions are locked for this match (kicks off at %)', v_kickoff
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;
```

#### Aggregate trigger fix

`exact_results_count` currently counts rows where `points_earned = 10`. With the bonus, an exact prediction in a penalty match scores 13. The condition must be updated so the tiebreaker remains meaningful (it should count users who hit the exact score tier regardless of whether they also earned the penalty bonus).

The maximum non-exact points is 8 (5-pt tier + 3-pt bonus), so `>= 10` correctly and exclusively identifies the exact-tier.

```sql
CREATE OR REPLACE FUNCTION fn_recompute_user_aggregates()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE users_profiles
  SET
    total_points        = (SELECT COALESCE(SUM(points_earned), 0)
                           FROM predictions WHERE user_id = NEW.user_id),
    exact_results_count = (SELECT COUNT(*)
                           FROM predictions
                           WHERE user_id = NEW.user_id AND points_earned >= 10)
  WHERE id = NEW.user_id;

  RETURN NULL;
END;
$$;
```

#### `finalize_match` RPC update

Three targeted changes inside the existing function body:

**1. Replace `v_phase` with `v_is_knockout`** in the DECLARE block and the match SELECT:

```sql
-- DECLARE block: replace
v_phase       match_phase;
-- with:
v_is_knockout BOOLEAN;

-- Match SELECT: replace
SELECT home_team_id, away_team_id, phase
  INTO v_home_team, v_away_team, v_phase
FROM matches WHERE id = p_match_id;
-- with:
SELECT home_team_id, away_team_id, is_knockout
  INTO v_home_team, v_away_team, v_is_knockout
FROM matches WHERE id = p_match_id;
```

**2. Update the two guards that currently reference `v_phase`:**

```sql
-- Group-stage guard: replace
IF v_phase IN ('group_a','group_b',... 'group_l') AND p_penalty_winner IS NOT NULL THEN
-- with:
IF NOT v_is_knockout AND p_penalty_winner IS NOT NULL THEN
  RAISE EXCEPTION 'Group stage matches cannot have a penalty winner';
END IF;

-- Outcome CASE: replace
WHEN p_penalty_winner IS NOT NULL
     AND v_phase NOT IN ('group_a',... 'group_l')
-- with:
WHEN p_penalty_winner IS NOT NULL AND v_is_knockout
```

**3. Extend the predictions SELECT and append the bonus block** before the `UPDATE predictions` call:

```sql
-- Extend the loop SELECT:
FOR v_pred IN
  SELECT id, user_id, predicted_home_score, predicted_away_score,
         predicted_penalty_winner_team_id
  FROM predictions
  WHERE match_id = p_match_id
LOOP

-- After the existing tier assignment, before UPDATE predictions:
    -- Bonus: +3 for correct penalty winner pick.
    IF p_penalty_winner IS NOT NULL
       AND v_pred.predicted_home_score = v_pred.predicted_away_score
       AND v_pred.predicted_penalty_winner_team_id IS NOT NULL
       AND v_pred.predicted_penalty_winner_team_id = p_penalty_winner
    THEN
      v_points := v_points + 3;
    END IF;
```

## 3. TypeScript Types (`lib/supabase/types.ts`)

### 3.1 `matches` table

Add `is_knockout` to the matches Row, Insert, and Update types:

```typescript
matches: {
  Row: {
    // ... existing fields ...
    is_knockout: boolean  // ADD
  }
  Insert: {
    // ... existing fields ...
    is_knockout?: boolean  // ADD (defaults to false)
  }
  Update: {
    // ... existing fields ...
    is_knockout?: boolean  // ADD
  }
}
```

`MatchWithTeams` (which extends `Match`) inherits the field automatically.

### 3.2 `predictions` table

Add `predicted_penalty_winner_team_id` to the `predictions` table definition:

```typescript
predictions: {
  Row: {
    // ... existing fields ...
    predicted_penalty_winner_team_id: string | null  // ADD
  }
  Insert: {
    // ... existing fields ...
    predicted_penalty_winner_team_id?: string | null  // ADD
  }
  Update: {
    // ... existing fields ...
    predicted_penalty_winner_team_id?: string | null  // ADD
  }
}
```

## 4. Scoring Utility (`lib/scoring/score-prediction.ts`)

Two changes: replace `phase` with `isKnockout` in `ScoreInput`, and add the bonus computation. The `GROUP_PHASES` constant and `isGroupPhase()` helper become dead code and are deleted.

```typescript
export interface ScoreInput {
  predictedHome: number
  predictedAway: number
  officialHome: number
  officialAway: number
  penaltyWinnerId: string | null           // actual match penalty winner
  predictedPenaltyWinnerId: string | null  // ADD: user's penalty pick
  homeTeamId: string
  awayTeamId: string
  isKnockout: boolean                      // REPLACE phase: MatchPhase
}

export function scorePrediction(input: ScoreInput): number {
  const { predictedHome, predictedAway, officialHome, officialAway,
          penaltyWinnerId, predictedPenaltyWinnerId,
          homeTeamId, isKnockout } = input

  // ── Base tiers (unchanged logic) ─────────────────────────────────────────
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
```

`getOfficialOutcome` is inlined above and can be removed. `getOutcomeFromScores` is still used and stays.

**Backward compatibility:** Update the `make()` helper in `tests/scoring.test.ts` to replace `phase: 'group_a'` with `isKnockout: false` and add `predictedPenaltyWinnerId: null`. All existing test assertions pass unchanged.

## 5. User Prediction UI (`components/features/MatchCard.tsx`)

### 5.1 Knockout phase detection

With `is_knockout` on the match record, no constant or derivation is needed:

```typescript
const isKnockout = match.is_knockout
```

`match.is_knockout` is available via `MatchWithTeams`. Remove the local `GROUP_PHASES` constant from `finalize-match-form.tsx` and replace its `isKnockout` derivation with the same one-liner — that file is the only other place where the constant currently lives.

### 5.2 Score tracking state

The penalty winner selector must appear/disappear based on whether the two score inputs are currently equal. Track score values with `useState` and keep inputs uncontrolled (`defaultValue` + `onChange`):

```typescript
const [homeVal, setHomeVal] = useState(prediction?.predicted_home_score?.toString() ?? '')
const [awayVal, setAwayVal] = useState(prediction?.predicted_away_score?.toString() ?? '')
const showPenaltyPicker = isKnockout && homeVal !== '' && awayVal !== '' && homeVal === awayVal
```

Add `onChange` to both score `<Input>` elements to update these values. When the scores stop being equal, the picker unmounts — its value is no longer part of the submitted `FormData`, so the server action receives no `penaltyWinnerId`, which correctly nullifies any existing pick.

### 5.3 Penalty winner selector (open/editable state)

Rendered conditionally below the score inputs, when `!locked && showPenaltyPicker`:

```tsx
{!locked && showPenaltyPicker && (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">Penalty winner</Label>
    <div className="flex gap-2">
      {[match.home_team, match.away_team].map((team) => (
        // Two toggle-style buttons or a native <select> — same shadcn pattern
        // as AddMemberForm. Name="penaltyWinnerId", value=team.id.
        // Default to prediction?.predicted_penalty_winner_team_id if set.
      ))}
    </div>
  </div>
)}
```

Use a `<select>` with `name="penaltyWinnerId"` (same pattern as `AddMemberForm`) with options: home team, away team. `defaultValue` set to `prediction?.predicted_penalty_winner_team_id ?? ''`. Give the element a `key={`${homeVal}-${awayVal}`}` so it resets whenever scores change.

### 5.4 Locked / finished display

In the locked or finished state, when `isKnockout && prediction.predicted_penalty_winner_team_id !== null`, show the penalty pick alongside the score. Derive the team name from the prediction's ID against `match.home_team` / `match.away_team`:

```tsx
// existing:
Your pick: {prediction.predicted_home_score}–{prediction.predicted_away_score} · <PointsBadge />

// new (when penalty pick exists):
Your pick: {prediction.predicted_home_score}–{prediction.predicted_away_score}
  ({penaltyPickTeamName} wins pens) · <PointsBadge />
```

The `PointsBadge` thresholds update automatically since we only changed `points_earned` values — the existing color tiers (10 green, 5 emerald, 2 yellow, 0 gray) do not cover 13 or 8. Add two new thresholds:

```typescript
function PointsBadge({ points }: { points: number }) {
  const colorClass =
    points >= 13 ? 'text-yellow-300'  // exact + bonus
    : points === 10 ? 'text-green-400'
    : points === 8  ? 'text-emerald-300' // same-diff + bonus
    : points === 5  ? 'text-emerald-400'
    : points === 2  ? 'text-yellow-400'
    : 'text-muted-foreground'
  return <span className={`font-semibold ${colorClass}`}>{points} pts</span>
}
```

## 6. Server Action (`app/(app)/matches/actions.ts`)

### 6.1 Schema

```typescript
const schema = z.object({
  matchId: z.string().uuid(),
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
  penaltyWinnerId: z.string().uuid().nullish(),  // ADD
})
```

### 6.2 Validation logic

```typescript
// Null out the pick if scores are not equal (covers the case where the user
// changed scores but the hidden/select field still carries an old value).
let penaltyWinnerId = parsed.data.penaltyWinnerId ?? null
if (parsed.data.homeScore !== parsed.data.awayScore) {
  penaltyWinnerId = null
}

// If a pick is still present, validate the match is knockout and the team is valid.
if (penaltyWinnerId !== null) {
  const { data: matchRow } = await supabase
    .from('matches')
    .select('phase, home_team_id, away_team_id')
    .eq('id', parsed.data.matchId)
    .single()

  const isKnockout = matchRow && !GROUP_PHASES.includes(matchRow.phase)
  const isValidTeam = matchRow &&
    (penaltyWinnerId === matchRow.home_team_id || penaltyWinnerId === matchRow.away_team_id)

  if (!isKnockout || !isValidTeam) penaltyWinnerId = null
}
```

### 6.3 Upsert

```typescript
await supabase.from('predictions').upsert(
  {
    user_id: user.id,
    match_id: parsed.data.matchId,
    predicted_home_score: parsed.data.homeScore,
    predicted_away_score: parsed.data.awayScore,
    predicted_penalty_winner_team_id: penaltyWinnerId,  // ADD
  },
  { onConflict: 'user_id,match_id' }
)
```

Passing `null` on an existing prediction explicitly clears the column (upsert overwrites all supplied fields).

## 7. Tests (`tests/scoring.test.ts`)

Update the `make()` helper default to include `predictedPenaltyWinnerId: null`. All existing tests continue to pass unchanged.

Add a new `describe` block for the bonus:

```typescript
describe('Penalty winner bonus (+3 points)', () => {
  // Bonus stacks on exact score (10 + 3 = 13)
  it('awards 13 for exact tied score + correct penalty pick')
  // Bonus stacks on same-diff tie (5 + 3 = 8)
  it('awards 8 for same-diff tie + correct penalty pick')
  // Wrong pick: no bonus, base score unchanged
  it('awards 10 (no bonus) for exact score + wrong penalty pick')
  // No pick submitted: no bonus
  it('awards 10 (no bonus) for exact score + no penalty pick')
  // Match did not go to penalties: no bonus
  it('awards 10 (no bonus) when match had no penalty winner')
  // Non-tie prediction: bonus never applies
  it('awards base tier only for non-tie prediction even if pick would be correct')
  // Group stage: bonus never applies
  it('no bonus in group stage matches')
})
```

## 8. Files Summary

### New files

| File | Purpose |
|---|---|
| `supabase/migrations/20260101000022_prediction_penalty_winner.sql` | New column + constraint, lock trigger fix, aggregate trigger fix, `finalize_match` bonus |

### Modified files

| File | Change |
|---|---|
| `lib/supabase/types.ts` | Add `is_knockout` to `matches`; add `predicted_penalty_winner_team_id` to `predictions` |
| `lib/scoring/score-prediction.ts` | Replace `phase` with `isKnockout` in `ScoreInput`; remove `GROUP_PHASES`/`isGroupPhase`; add bonus |
| `tests/scoring.test.ts` | Replace `phase` with `isKnockout` in `make()`; add `predictedPenaltyWinnerId: null` default; add bonus test suite |
| `components/features/MatchCard.tsx` | Use `match.is_knockout`; score tracking state; conditional penalty picker; updated locked display; `PointsBadge` thresholds |
| `app/(app)/admin/results/finalize-match-form.tsx` | Remove `GROUP_PHASES` constant; replace `isKnockout` derivation with `match.is_knockout` |
| `app/(app)/matches/actions.ts` | Add `penaltyWinnerId` to schema, validation, and upsert payload |

## 9. Execution Order

Each step ends in a working, committable state.

1. **Migration** — Write and apply `20260101000022_prediction_penalty_winner.sql`. Verify `is_knockout` is present on `matches` (all existing rows `false`), the new `predictions` column and constraint are deployed, and the updated functions are live. Confirm existing predictions are unaffected.
2. **Types** — Update `lib/supabase/types.ts` with both new fields. TypeScript compilation must pass.
3. **Scoring utility + tests** — Update `score-prediction.ts` (replace `phase` with `isKnockout`, add bonus) and `scoring.test.ts` (update `make()`, add bonus suite). Run `vitest` — all existing tests must pass, new bonus tests must pass.
4. **Admin form cleanup** — Remove `GROUP_PHASES` from `finalize-match-form.tsx`, replace with `match.is_knockout`. No functional change — verify the penalty winner dropdown still appears/hides correctly.
5. **Server action** — Update `matches/actions.ts`. Test via manual form submit for a group match (pick must be ignored) and a knockout match with a tie score (pick must be saved).
6. **MatchCard** — Update the component. Verify: penalty picker appears only on knockout matches with tied scores; disappears when scores change; displays correctly in locked/finished state; `PointsBadge` shows the right colors for 13 and 8 pt totals.

## 10. Verification

1. Open a **group stage** pending match — confirm no penalty picker appears under any score combination.
2. Open a **knockout** pending match — enter different scores (e.g., 2–1) — confirm no picker appears.
3. Same knockout match — enter equal scores (e.g., 1–1) — confirm the penalty winner selector appears with both team names.
4. Change scores back to different (e.g., 1–2) — confirm picker disappears and the previous pick is gone.
5. Enter 1–1 + select home team, save — confirm the prediction row in DB has `predicted_penalty_winner_team_id = home_team_id`.
6. As admin, finalize the match with score 1–1 + no penalty winner — confirm user earns 10 pts (Tier 1, no bonus).
7. Re-finalize with score 1–1 + correct penalty winner (home) — confirm user earns 13 pts, `exact_results_count` increments.
8. Re-finalize with score 1–1 + wrong penalty winner (away) — confirm user earns 10 pts, `exact_results_count` still counts it.
9. User predicted 0–0 + home wins pens, finalize 1–1 + home — confirm 8 pts (5 + 3), `exact_results_count` does NOT increment (< 10 ... wait, 8 < 10 so correct).
10. User with no penalty pick on exact tied score earns 10 pts (unchanged from current behavior).
11. Confirm `/leaderboard` and group leaderboards sort correctly with the new point totals.
