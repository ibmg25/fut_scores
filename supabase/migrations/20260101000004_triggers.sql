-- ── 1. enforce_prediction_lock ────────────────────────────────────────────────
-- Prevents insert/update on predictions if kickoff is within 1 hour.
-- This is the authoritative lock; UI lock is decorative.
CREATE OR REPLACE FUNCTION fn_enforce_prediction_lock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_kickoff TIMESTAMPTZ;
BEGIN
  SELECT kickoff_time INTO v_kickoff
  FROM matches
  WHERE id = NEW.match_id;

  IF now() >= v_kickoff - INTERVAL '1 hour' THEN
    RAISE EXCEPTION 'Predictions are locked for this match (kicks off at %)', v_kickoff
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_prediction_lock
  BEFORE INSERT OR UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION fn_enforce_prediction_lock();

-- ── 2. maintain_predictions_updated_at ───────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_maintain_predictions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER maintain_predictions_updated_at
  BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION fn_maintain_predictions_updated_at();

-- ── 3. recompute_user_aggregates ──────────────────────────────────────────────
-- After any change to points_earned, recompute totals for the affected user.
-- Full SUM approach — safe at this scale (~20 users, ~48 predictions each).
CREATE OR REPLACE FUNCTION fn_recompute_user_aggregates()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE users_profiles
  SET
    total_points        = (SELECT COALESCE(SUM(points_earned), 0) FROM predictions WHERE user_id = NEW.user_id),
    exact_results_count = (SELECT COUNT(*) FROM predictions WHERE user_id = NEW.user_id AND points_earned = 10)
  WHERE id = NEW.user_id;

  RETURN NULL;
END;
$$;

CREATE TRIGGER recompute_user_aggregates
  AFTER INSERT OR UPDATE OF points_earned ON predictions
  FOR EACH ROW EXECUTE FUNCTION fn_recompute_user_aggregates();
