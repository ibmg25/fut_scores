-- Fix: profiles_update_own RLS policy allowed any user to update any column,
-- including role, total_points, exact_results_count. PostgreSQL RLS cannot
-- restrict specific columns, so we enforce this via a BEFORE UPDATE trigger.
--
-- Trigger dependency chain:
--   finalize_match (SECURITY DEFINER, called by superadmin)
--     → UPDATE predictions SET points_earned = ...
--     → recompute_user_aggregates (AFTER UPDATE OF points_earned)
--       → UPDATE users_profiles SET total_points, exact_results_count
--         → protect_profile_columns (BEFORE UPDATE) ← this trigger
--
-- At each step auth.uid() is the superadmin who called finalize_match,
-- so is_superadmin() returns TRUE and the check passes. The trigger only
-- blocks direct client calls from non-superadmin users.
CREATE OR REPLACE FUNCTION fn_protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (NEW.role                IS DISTINCT FROM OLD.role
      OR NEW.total_points         IS DISTINCT FROM OLD.total_points
      OR NEW.exact_results_count  IS DISTINCT FROM OLD.exact_results_count)
     AND NOT is_superadmin() THEN
    RAISE EXCEPTION 'Permission denied: cannot modify protected profile fields'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_columns
  BEFORE UPDATE ON users_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_protect_profile_columns();
