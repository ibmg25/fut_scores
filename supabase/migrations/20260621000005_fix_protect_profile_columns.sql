-- The role-change guard must fire unconditionally, including for service_role.
-- Previously the service_role bypass (auth.uid() IS NULL → RETURN NEW) was at
-- the top of the function, so a compromised service key could SET role = 'superadmin'
-- on any row without restriction.
--
-- Fix: move the role-change check BEFORE the service_role early-return so that
-- only authenticated superadmins can change roles. The early-return still allows
-- service_role (GitHub Actions sync) to update aggregate score columns via the
-- finalize_match → recompute_user_aggregates trigger chain.
CREATE OR REPLACE FUNCTION fn_protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Role changes are never permitted without superadmin — not even service_role.
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_superadmin() THEN
    RAISE EXCEPTION 'Permission denied: cannot modify protected profile fields'
      USING ERRCODE = '42501';
  END IF;

  -- Allow service_role (no JWT → auth.uid() IS NULL) to update aggregate columns
  -- written by the finalize_match → recompute_user_aggregates trigger chain.
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;

  -- Direct modifications to score aggregates require admin or above.
  IF (NEW.total_points        IS DISTINCT FROM OLD.total_points
      OR NEW.exact_results_count IS DISTINCT FROM OLD.exact_results_count)
     AND NOT is_admin_or_above() THEN
    RAISE EXCEPTION 'Permission denied: cannot modify protected profile fields'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;
