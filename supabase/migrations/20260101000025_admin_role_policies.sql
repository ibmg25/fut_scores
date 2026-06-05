-- ── Step 1: New helper function ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin_or_above() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM users_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
$$;

-- ── Step 2: Replace RLS policies for matches, groups, group_members ───────────

-- matches
DROP POLICY "matches_modify_superadmin" ON matches;
CREATE POLICY "matches_modify_admin_or_above"
  ON matches FOR ALL TO authenticated
  USING (is_admin_or_above())
  WITH CHECK (is_admin_or_above());

-- groups
DROP POLICY "groups_all_superadmin" ON groups;
CREATE POLICY "groups_all_admin_or_above"
  ON groups FOR ALL TO authenticated
  USING (is_admin_or_above())
  WITH CHECK (is_admin_or_above());

-- group_members (read)
DROP POLICY "group_members_select_superadmin" ON group_members;
CREATE POLICY "group_members_select_admin_or_above"
  ON group_members FOR SELECT TO authenticated
  USING (is_admin_or_above());

-- group_members (write)
DROP POLICY "group_members_modify_superadmin" ON group_members;
CREATE POLICY "group_members_modify_admin_or_above"
  ON group_members FOR ALL TO authenticated
  USING (is_admin_or_above())
  WITH CHECK (is_admin_or_above());

-- ── Step 3: Update fn_protect_profile_columns trigger ────────────────────────
-- Service role bypass: auth.uid() is NULL when called via service role key.
-- Role changes remain superadmin-only (admin cannot promote themselves).
-- Score columns loosen to is_admin_or_above() for the finalize_match pipeline.
CREATE OR REPLACE FUNCTION fn_protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Service role has no JWT context; auth.uid() is NULL. Bypass all column guards.
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;

  -- Role changes require superadmin.
  IF NEW.role IS DISTINCT FROM OLD.role
     AND NOT is_superadmin() THEN
    RAISE EXCEPTION 'Permission denied: cannot modify protected profile fields'
      USING ERRCODE = '42501';
  END IF;

  -- Score columns are updated by the finalize_match pipeline;
  -- any direct modification requires admin or above.
  IF (NEW.total_points        IS DISTINCT FROM OLD.total_points
      OR NEW.exact_results_count IS DISTINCT FROM OLD.exact_results_count)
     AND NOT is_admin_or_above() THEN
    RAISE EXCEPTION 'Permission denied: cannot modify protected profile fields'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- ── Step 4: Update finalize_match RPC authorization ───────────────────────────
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
  IF NOT is_admin_or_above() THEN
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
