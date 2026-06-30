-- Fix: tier 3 scoring no longer treats the penalty winner as the official outcome.
-- The official outcome is always derived from the match scores (90/120 minutes).
-- The penalty bonus (+3) remains unchanged.
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
  IF NOT is_admin_or_above() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Permission denied: admin role required'
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
    IF v_pred.predicted_home_score = p_home
       AND v_pred.predicted_away_score = p_away THEN
      v_points := POINTS_EXACT;

    ELSIF (v_pred.predicted_home_score - v_pred.predicted_away_score)
          = (p_home - p_away) THEN
      v_points := POINTS_DIFF;

    ELSIF (
      CASE
        WHEN v_pred.predicted_home_score > v_pred.predicted_away_score THEN 'home'
        WHEN v_pred.predicted_home_score < v_pred.predicted_away_score THEN 'away'
        ELSE 'tie'
      END
      =
      CASE
        WHEN p_home > p_away THEN 'home'
        WHEN p_home < p_away THEN 'away'
        ELSE 'tie'
      END
    ) THEN
      v_points := POINTS_OUTCOME;

    ELSE
      v_points := POINTS_NONE;
    END IF;

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
