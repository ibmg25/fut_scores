-- Drop the self-referential policy that causes infinite recursion for regular users.
-- PostgreSQL applies RLS to the inner group_members subquery, which again triggers
-- the same policy — detected at plan time as infinite recursion. Admins avoided it
-- only because is_admin_or_above() short-circuited the OR before the EXISTS was planned.
DROP POLICY "group_members_select_shared_group" ON group_members;

-- SECURITY DEFINER runs as the function owner (postgres), bypassing RLS on the
-- inner JOIN so there is no recursive policy evaluation.
CREATE OR REPLACE FUNCTION can_view_group_member(target_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members gm1
    JOIN  group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
      AND gm2.user_id = target_user_id
  );
$$;

CREATE POLICY "group_members_select_shared_group"
  ON group_members FOR SELECT TO authenticated
  USING (can_view_group_member(user_id));
