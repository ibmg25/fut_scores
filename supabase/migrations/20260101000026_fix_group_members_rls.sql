-- Allow authenticated users to see group_members rows for any user
-- who shares at least one group with them (needed for profile visibility check)
CREATE POLICY "group_members_select_shared_group"
  ON group_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
        AND gm2.user_id = auth.uid()
    )
  );
