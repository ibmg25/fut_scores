-- Fix M-3: profiles_select_leaderboard policy exposed all columns to all users,
-- including role and must_change_password. Replace with a view that projects
-- only the safe leaderboard columns.

-- Remove the broad policy that allowed reading all columns of all profiles
DROP POLICY IF EXISTS "profiles_select_leaderboard" ON users_profiles;

-- View exposes only the four leaderboard-safe columns.
-- Runs as view owner (postgres), which bypasses table RLS — intentional, since
-- we want all users visible in the leaderboard. Column restriction is enforced
-- by the view definition itself; the table's remaining policies still govern
-- direct table access (own row only via profiles_select_own).
CREATE OR REPLACE VIEW v_leaderboard AS
  SELECT id, display_name, total_points, exact_results_count
  FROM users_profiles;

GRANT SELECT ON v_leaderboard TO authenticated;
