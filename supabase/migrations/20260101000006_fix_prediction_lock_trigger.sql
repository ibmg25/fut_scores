-- Fix: enforce_prediction_lock was blocking finalize_match RPC.
-- The trigger fired on ALL updates to predictions, including when finalize_match
-- writes points_earned after kickoff. Skip the lock check when predicted scores
-- haven't changed (i.e., only metadata like points_earned is being updated).
CREATE OR REPLACE FUNCTION fn_enforce_prediction_lock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_kickoff TIMESTAMPTZ;
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.predicted_home_score IS NOT DISTINCT FROM OLD.predicted_home_score
     AND NEW.predicted_away_score  IS NOT DISTINCT FROM OLD.predicted_away_score THEN
    RETURN NEW;
  END IF;

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
