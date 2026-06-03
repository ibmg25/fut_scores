-- finalize_match: SECURITY DEFINER RPC callable only by superadmins.
-- Idempotent: calling twice with the same or corrected scores produces correct final state.
CREATE OR REPLACE FUNCTION finalize_match(
  p_match_id        UUID,
  p_home            INT,
  p_away            INT,
  p_penalty_winner  UUID DEFAULT NULL
)
RETURNS INT  -- count of predictions scored
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_home_team       UUID;
  v_away_team       UUID;
  v_phase           match_phase;
  v_pred            RECORD;
  v_points          INT;
  v_count           INT := 0;

  -- Scoring constants
  POINTS_EXACT      CONSTANT INT := 10;
  POINTS_DIFF       CONSTANT INT := 5;
  POINTS_OUTCOME    CONSTANT INT := 2;
  POINTS_NONE       CONSTANT INT := 0;
BEGIN
  -- Authorization check
  IF NOT is_superadmin() THEN
    RAISE EXCEPTION 'Permission denied: superadmin role required'
      USING ERRCODE = '42501';
  END IF;

  -- Input validation
  IF p_home < 0 OR p_away < 0 THEN
    RAISE EXCEPTION 'Scores must be non-negative';
  END IF;

  SELECT home_team_id, away_team_id, phase
    INTO v_home_team, v_away_team, v_phase
  FROM matches WHERE id = p_match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match % not found', p_match_id;
  END IF;

  IF p_penalty_winner IS NOT NULL
     AND p_penalty_winner NOT IN (v_home_team, v_away_team) THEN
    RAISE EXCEPTION 'penalty_winner_team_id must be one of the two teams';
  END IF;

  IF v_phase IN ('group_a','group_b','group_c','group_d','group_e','group_f',
                 'group_g','group_h','group_i','group_j','group_k','group_l')
     AND p_penalty_winner IS NOT NULL THEN
    RAISE EXCEPTION 'Group stage matches cannot have a penalty winner';
  END IF;

  -- Update match record
  UPDATE matches SET
    home_score             = p_home,
    away_score             = p_away,
    penalty_winner_team_id = p_penalty_winner,
    status                 = 'finished',
    results_set_by         = auth.uid(),
    results_set_at         = now()
  WHERE id = p_match_id;

  -- Score every prediction for this match
  FOR v_pred IN
    SELECT id, user_id, predicted_home_score, predicted_away_score
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
      -- predicted outcome
      CASE
        WHEN v_pred.predicted_home_score > v_pred.predicted_away_score THEN 'home'
        WHEN v_pred.predicted_home_score < v_pred.predicted_away_score THEN 'away'
        ELSE 'tie'
      END
      =
      -- official outcome
      CASE
        WHEN p_penalty_winner IS NOT NULL
             AND v_phase NOT IN ('group_a','group_b','group_c','group_d','group_e','group_f',
                                 'group_g','group_h','group_i','group_j','group_k','group_l')
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

    UPDATE predictions SET points_earned = v_points WHERE id = v_pred.id;
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;
