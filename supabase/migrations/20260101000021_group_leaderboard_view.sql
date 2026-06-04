-- Computes per-group leaderboard by reading already-scored predictions.points_earned.
-- Runs as view owner (postgres), bypassing table RLS — intentional so the view
-- can aggregate all members regardless of who is querying.
CREATE OR REPLACE VIEW v_group_leaderboard AS
  SELECT
    gm.group_id,
    gm.user_id AS id,
    up.display_name,
    COALESCE(SUM(p.points_earned), 0)::INT AS total_points,
    COUNT(*) FILTER (WHERE p.points_earned = 10)::INT AS exact_results_count
  FROM group_members gm
  JOIN users_profiles up ON up.id = gm.user_id
  LEFT JOIN predictions p ON p.user_id = gm.user_id
  GROUP BY gm.group_id, gm.user_id, up.display_name;

GRANT SELECT ON v_group_leaderboard TO authenticated;
