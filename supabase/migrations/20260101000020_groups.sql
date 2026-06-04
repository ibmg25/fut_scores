-- ── groups ────────────────────────────────────────────────────────────────────
CREATE TABLE groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE group_members (
  group_id  UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_group_members_user ON group_members (user_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can see groups they belong to
CREATE POLICY "groups_select_member"
  ON groups FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
    )
  );

-- Superadmin can do everything on groups
CREATE POLICY "groups_all_superadmin"
  ON groups FOR ALL TO authenticated
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

-- Members can see their own group memberships
CREATE POLICY "group_members_select_own"
  ON group_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Superadmin can see all memberships (needed for admin UI)
CREATE POLICY "group_members_select_superadmin"
  ON group_members FOR SELECT TO authenticated
  USING (is_superadmin());

-- Only superadmin can insert/delete memberships (admin assigns users to groups)
CREATE POLICY "group_members_modify_superadmin"
  ON group_members FOR ALL TO authenticated
  USING (is_superadmin())
  WITH CHECK (is_superadmin());
