-- ── 1. matches.is_knockout ───────────────────────────────────────────────────
ALTER TABLE matches
  ADD COLUMN is_knockout BOOLEAN NOT NULL DEFAULT false;

-- ── 2. predictions.predicted_penalty_winner_team_id ──────────────────────────
ALTER TABLE predictions
  ADD COLUMN predicted_penalty_winner_team_id UUID NULL REFERENCES teams(id);

-- A penalty pick is only valid alongside a predicted tie.
ALTER TABLE predictions
  ADD CONSTRAINT chk_penalty_pick_requires_tie
  CHECK (
    predicted_penalty_winner_team_id IS NULL
    OR predicted_home_score = predicted_away_score
  );

-- ── 3. Lock trigger fix ───────────────────────────────────────────────────────
-- The skip condition must also include the new column so a user cannot POST just
-- a changed penalty pick after kick-off while keeping scores the same.
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

-- ── 4. Aggregate trigger fix ──────────────────────────────────────────────────
-- exact_results_count must count >= 10 (not = 10) because exact picks in
-- penalty matches now earn 13 pts. The max non-exact score is 8 (5 + 3 bonus),
-- so >= 10 exclusively identifies the exact tier.
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

-- ── 5. finalize_match RPC update ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION finalize_match(
  p_match_id        UUID,
  p_home            INT,
  p_away            INT,
  p_penalty_winner  UUID DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_home_team       UUID;
  v_away_team       UUID;
  v_is_knockout     BOOLEAN;
  v_pred            RECORD;
  v_points          INT;
  v_count           INT := 0;

  POINTS_EXACT      CONSTANT INT := 10;
  POINTS_DIFF       CONSTANT INT := 5;
  POINTS_OUTCOME    CONSTANT INT := 2;
  POINTS_NONE       CONSTANT INT := 0;
BEGIN
  IF NOT is_superadmin() THEN
    RAISE EXCEPTION 'Permission denied: superadmin role required'
      USING ERRCODE = '42501';
  END IF;

  IF p_home < 0 OR p_away < 0 THEN
    RAISE EXCEPTION 'Scores must be non-negative';
  END IF;

  SELECT home_team_id, away_team_id, is_knockout
    INTO v_home_team, v_away_team, v_is_knockout
  FROM matches WHERE id = p_match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match % not found', p_match_id;
  END IF;

  IF p_penalty_winner IS NOT NULL
     AND p_penalty_winner NOT IN (v_home_team, v_away_team) THEN
    RAISE EXCEPTION 'penalty_winner_team_id must be one of the two teams';
  END IF;

  IF NOT v_is_knockout AND p_penalty_winner IS NOT NULL THEN
    RAISE EXCEPTION 'Group stage matches cannot have a penalty winner';
  END IF;

  UPDATE matches SET
    home_score             = p_home,
    away_score             = p_away,
    penalty_winner_team_id = p_penalty_winner,
    status                 = 'finished',
    results_set_by         = auth.uid(),
    results_set_at         = now()
  WHERE id = p_match_id;

  FOR v_pred IN
    SELECT id, user_id, predicted_home_score, predicted_away_score,
           predicted_penalty_winner_team_id
    FROM predictions
    WHERE match_id = p_match_id
  LOOP
    -- Tier 1: Exact
    IF v_pred.predicted_home_score = p_home
       AND v_pred.predicted_away_score = p_away THEN
      v_points := POINTS_EXACT;

    -- Tier 2: Same goal difference
    ELSIF (v_pred.predicted_home_score - v_pred.predicted_away_score)
          = (p_home - p_away) THEN
      v_points := POINTS_DIFF;

    -- Tier 3: Correct outcome
    ELSIF (
      CASE
        WHEN v_pred.predicted_home_score > v_pred.predicted_away_score THEN 'home'
        WHEN v_pred.predicted_home_score < v_pred.predicted_away_score THEN 'away'
        ELSE 'tie'
      END
      =
      CASE
        WHEN p_penalty_winner IS NOT NULL AND v_is_knockout
        THEN CASE WHEN p_penalty_winner = v_home_team THEN 'home' ELSE 'away' END
        WHEN p_home > p_away THEN 'home'
        WHEN p_home < p_away THEN 'away'
        ELSE 'tie'
      END
    ) THEN
      v_points := POINTS_OUTCOME;

    ELSE
      v_points := POINTS_NONE;
    END IF;

    -- Bonus: +3 for correct penalty winner pick
    IF p_penalty_winner IS NOT NULL
       AND v_pred.predicted_home_score = v_pred.predicted_away_score
       AND v_pred.predicted_penalty_winner_team_id IS NOT NULL
       AND v_pred.predicted_penalty_winner_team_id = p_penalty_winner
    THEN
      v_points := v_points + 3;
    END IF;

    UPDATE predictions SET points_earned = v_points WHERE id = v_pred.id;
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;
