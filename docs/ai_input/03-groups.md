# Implementation Plan: Groups as Leagues

## 1. Overview

Add a "groups" feature where users belong to one or more groups and each group has its own leaderboard. Predictions remain global — a user predicts once per match and those predictions count in every group they belong to. The leaderboard page gets a group selector so users can compare scores within different friend circles.

**Key constraint:** This is purely additive. No existing tables, triggers, RPC functions, or scoring logic are modified. The `users_profiles.total_points` and `exact_results_count` columns remain as a global cache and continue to power a default "All Players" leaderboard.

## 2. Database Changes

### 2.1 New Migration: `20260101000020_groups.sql`

Two new tables and their RLS policies.

```sql
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
```

### 2.2 New View: `v_group_leaderboard`

A view that computes per-group leaderboard data by joining `group_members` with `predictions` (via `users_profiles`). This avoids duplicating the scoring aggregation — it reads directly from the already-computed `predictions.points_earned` values.

Add to the same migration or as a separate `20260101000021_group_leaderboard_view.sql`:

```sql
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
```

This view is recalculated on every query (no materialization needed at this scale: ~20 users × ~104 predictions = ~2,000 rows max per group). Ordering is done at query time.

### 2.3 TypeScript Types Update (`lib/supabase/types.ts`)

Add to the `Database` interface:

- `Tables.groups` — Row/Insert/Update types for the `groups` table.
- `Tables.group_members` — Row/Insert/Update types for the `group_members` table.
- `Views.v_group_leaderboard` — Row type with `group_id`, `id`, `display_name`, `total_points`, `exact_results_count`.
- New exported type aliases: `Group`, `GroupMember`.

## 3. Admin Panel — Group Management

### 3.1 New Route: `app/(app)/admin/groups/page.tsx`

Server Component. Two sections (same pattern as `/admin/users`):

1. **Create Group** — `CreateGroupForm` client component.
   - Single input: group name.
   - Server action: `createGroupAction` — validates name (Zod: 2–50 chars), inserts into `groups` with `created_by = auth.uid()`, revalidates path.

2. **All Groups** — Table listing all groups.
   - Columns: Name, Members count, Created at.
   - Each row links to `/admin/groups/[groupId]` for member management.

Fetch groups via admin client (bypasses RLS) with a count of members.

### 3.2 New Route: `app/(app)/admin/groups/[groupId]/page.tsx`

Server Component. Group detail page for managing members:

1. **Group header** — Group name.
2. **Add Member** — `AddMemberForm` client component.
   - Select dropdown listing all users NOT already in this group (fetched from `users_profiles` minus existing `group_members` for this group).
   - Server action: `addMemberAction` — validates `groupId` (UUID) + `userId` (UUID), inserts into `group_members`, revalidates path.
3. **Current Members** — Table of current members.
   - Columns: Name, Joined at, Actions (Remove button).
   - Server action: `removeMemberAction` — validates `groupId` + `userId`, deletes from `group_members`, revalidates path.

### 3.3 Server Actions: `app/(app)/admin/groups/actions.ts`

All actions follow the existing pattern:
- `'use server'` directive.
- Auth check → superadmin check → Zod validation → admin client operation → revalidatePath.
- State type: `{ error: string | null }` (no tempPassword needed here).

Actions:
- `createGroupAction(prevState, formData)` — creates group.
- `addMemberAction(prevState, formData)` — adds member to group. Hidden inputs: `groupId`, `userId`.
- `removeMemberAction(prevState, formData)` — removes member from group. Hidden inputs: `groupId`, `userId`.

### 3.4 Admin Layout Update (`app/(app)/admin/layout.tsx`)

Add a "Groups" nav link alongside "Match Results" and "Users":

```tsx
<Link href="/admin/groups" className="text-muted-foreground hover:text-foreground transition-colors">
  Groups
</Link>
```

## 4. Leaderboard — Group Selector

### 4.1 Leaderboard Page Changes (`app/(app)/leaderboard/page.tsx`)

The page gains a `?group=<groupId>` search param.

Logic:
1. Fetch the user's groups via `group_members` where `user_id = auth.uid()`, joined with `groups` to get names.
2. Read `searchParams.group` — if present and valid, fetch from `v_group_leaderboard` filtered by `group_id`. Otherwise, fetch from `v_leaderboard` (existing global leaderboard — unchanged).
3. Pass the groups list and selected group to a `<GroupSelector>` client component.
4. The rest of the page (PodiumSection + RankingList) receives the same data shape regardless of source — no changes to those components.

### 4.2 New Component: `components/features/GroupSelector.tsx`

Client component. Props: `{ groups: { id: string; name: string }[]; selectedGroupId: string | null }`.

- Renders a row of pill/chip buttons: "All Players" (always first, links to `/leaderboard`) + one per group (links to `/leaderboard?group=<id>`).
- Active pill uses `bg-primary text-primary-foreground`, inactive uses `bg-secondary text-secondary-foreground`.
- Uses `useRouter().push()` or simple `<Link>` elements for navigation (prefer `<Link>` — no client JS needed for navigation).
- If the user belongs to zero groups, render nothing (the page falls back to the global leaderboard without any selector).

### 4.3 Data Flow Summary

```
/leaderboard              → v_leaderboard (global, existing)
/leaderboard?group=<id>   → v_group_leaderboard WHERE group_id = <id>
```

Both return the same shape: `{ id, display_name, total_points, exact_results_count }[]`. PodiumSection and RankingList work unchanged.

## 5. What Does NOT Change

- **`predictions` table** — no schema changes. `UNIQUE(user_id, match_id)` stays.
- **`users_profiles` table** — `total_points` and `exact_results_count` stay as global cache.
- **`finalize_match` RPC** — untouched. It scores predictions globally, and the group view reads from the already-scored `predictions.points_earned`.
- **Triggers** — `recompute_user_aggregates` still fires and updates global totals. Group totals are computed on-the-fly by the view.
- **`/matches` page** — no changes. Predictions are global.
- **Existing RLS policies** — untouched.

## 6. Files Summary

### New files

| File | Purpose |
|---|---|
| `supabase/migrations/20260101000020_groups.sql` | `groups` + `group_members` tables, RLS, indexes |
| `supabase/migrations/20260101000021_group_leaderboard_view.sql` | `v_group_leaderboard` view |
| `app/(app)/admin/groups/page.tsx` | Admin group list + create form |
| `app/(app)/admin/groups/[groupId]/page.tsx` | Admin group detail + member management |
| `app/(app)/admin/groups/actions.ts` | Server actions for group CRUD |
| `app/(app)/admin/groups/create-group-form.tsx` | Client form for creating groups |
| `app/(app)/admin/groups/[groupId]/add-member-form.tsx` | Client form for adding members |
| `app/(app)/admin/groups/[groupId]/remove-member-form.tsx` | Client form for removing members |
| `components/features/GroupSelector.tsx` | Leaderboard group pill selector |

### Modified files

| File | Change |
|---|---|
| `lib/supabase/types.ts` | Add `groups`, `group_members`, `v_group_leaderboard` types |
| `app/(app)/admin/layout.tsx` | Add "Groups" nav link |
| `app/(app)/leaderboard/page.tsx` | Add `?group` param handling + GroupSelector |

## 7. Execution Order

Each step ends in a working, committable state.

1. **Migration** — Write and apply the SQL migration for tables, RLS, and the view.
2. **Types** — Update `lib/supabase/types.ts` with the new tables and view.
3. **Admin CRUD** — Build the admin groups pages and actions. Add the nav link.
4. **Leaderboard** — Add the group selector and `?group` param logic to the leaderboard page.
5. **Verify** — End-to-end testing (see §8).

## 8. Verification

1. As admin, create a group from `/admin/groups`.
2. Add 2–3 users to the group from `/admin/groups/[groupId]`.
3. Remove a user from the group — confirm they disappear from the member list.
4. As a regular user, go to `/leaderboard` — confirm "All Players" shows the existing global leaderboard.
5. Confirm the group pills appear and clicking one filters the leaderboard to only show group members.
6. Finalize a match result as admin — confirm both the global leaderboard and group leaderboard update correctly.
7. Confirm `/matches` page is completely unaffected — predictions still work normally.
8. Confirm a user who belongs to zero groups sees no group selector, just the global leaderboard.
