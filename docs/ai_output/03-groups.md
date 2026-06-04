# 03 — Groups Feature: Key Decisions

## Schema Design

Two new tables: `groups` (name, created_by) and `group_members` (group_id, user_id, composite PK). No changes to `predictions`, `users_profiles`, or any existing trigger/RPC. All scoring logic remains untouched — group leaderboards read from already-computed `predictions.points_earned`.

The `v_group_leaderboard` view aggregates points per group on demand (no materialization). At this scale (~20 users × ~104 matches = ~2,000 rows) this is negligible, and it stays in sync automatically after every `finalize_match` call without any additional triggers.

## RLS Strategy

- Regular users: can SELECT their own `group_members` rows (to know which groups they belong to) and SELECT `groups` they are a member of.
- Superadmin: full access to both tables via the existing `is_superadmin()` helper (consistent with every other admin-only operation in the codebase).
- Admin mutations (create group, add/remove members) use `createAdminClient()` (service role) in server actions — same pattern as user management.

The view (`v_group_leaderboard`) has no RLS and is GRANT-ed to `authenticated`. This means any authenticated user can query any group's leaderboard if they know the `group_id`. This is intentional (same pattern as `v_leaderboard`) and acceptable for a friends-only app. The UI enforces access by only showing pills for groups the current user belongs to. A server-side membership check validates the `?group=` param before querying the view.

## Admin UI

Three server actions (`createGroupAction`, `addMemberAction`, `removeMemberAction`) follow the exact same shape as the existing `users/actions.ts` pattern: auth check → superadmin check → Zod validation → admin client → revalidatePath. The pages mirror the structure of `/admin/users`.

## Leaderboard Integration

The leaderboard page accepts a `?group=<id>` search param (Next.js 15+ async `searchParams`). It fetches the user's groups first, validates the requested group is one the user belongs to, then queries either `v_group_leaderboard` (filtered by `group_id`) or `v_leaderboard`. Both return the same `{ id, display_name, total_points, exact_results_count }` shape, so `PodiumSection` and `RankingList` are unchanged.

`GroupSelector` is a pure server component using `<Link>` elements — no client JS needed for navigation. It renders nothing if the user belongs to zero groups.

## Files Created / Modified

| File | Action |
|---|---|
| `supabase/migrations/20260101000020_groups.sql` | New: tables + RLS |
| `supabase/migrations/20260101000021_group_leaderboard_view.sql` | New: view |
| `lib/supabase/types.ts` | Modified: added `groups`, `group_members`, `v_group_leaderboard`, `Group`, `GroupMember` |
| `app/(app)/admin/groups/actions.ts` | New: server actions |
| `app/(app)/admin/groups/create-group-form.tsx` | New: client form |
| `app/(app)/admin/groups/page.tsx` | New: groups list page |
| `app/(app)/admin/groups/[groupId]/add-member-form.tsx` | New: client form |
| `app/(app)/admin/groups/[groupId]/remove-member-form.tsx` | New: client form |
| `app/(app)/admin/groups/[groupId]/page.tsx` | New: group detail page |
| `app/(app)/admin/layout.tsx` | Modified: added Groups nav link |
| `components/features/GroupSelector.tsx` | New: leaderboard pill selector |
| `app/(app)/leaderboard/page.tsx` | Modified: group param + selector |
