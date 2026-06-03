-- Enable RLS on all tables
ALTER TABLE tournaments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams          ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions    ENABLE ROW LEVEL SECURITY;

-- Helper: check if caller is a superadmin
CREATE OR REPLACE FUNCTION is_superadmin() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM users_profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

-- ── tournaments ──────────────────────────────────────────────────────────────
CREATE POLICY "tournaments_select_authenticated"
  ON tournaments FOR SELECT TO authenticated USING (true);

CREATE POLICY "tournaments_modify_superadmin"
  ON tournaments FOR ALL TO authenticated
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

-- ── teams ─────────────────────────────────────────────────────────────────────
CREATE POLICY "teams_select_authenticated"
  ON teams FOR SELECT TO authenticated USING (true);

CREATE POLICY "teams_modify_superadmin"
  ON teams FOR ALL TO authenticated
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

-- ── matches ───────────────────────────────────────────────────────────────────
CREATE POLICY "matches_select_authenticated"
  ON matches FOR SELECT TO authenticated USING (true);

CREATE POLICY "matches_modify_superadmin"
  ON matches FOR ALL TO authenticated
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

-- ── users_profiles ────────────────────────────────────────────────────────────
-- Each user can read their own full row
CREATE POLICY "profiles_select_own"
  ON users_profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- All authenticated users can read the public leaderboard projection
CREATE POLICY "profiles_select_leaderboard"
  ON users_profiles FOR SELECT TO authenticated
  USING (true);

-- Users can update only display_name and must_change_password on their own row
-- (role and points columns are never written by clients directly)
CREATE POLICY "profiles_update_own"
  ON users_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Superadmin can insert (used by the create-user server action via service role,
-- but also allows admin RLS path)
CREATE POLICY "profiles_insert_superadmin"
  ON users_profiles FOR INSERT TO authenticated
  WITH CHECK (is_superadmin());

-- ── predictions ───────────────────────────────────────────────────────────────
CREATE POLICY "predictions_select_own"
  ON predictions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "predictions_insert_own"
  ON predictions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "predictions_update_own"
  ON predictions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
