# 06 — New Admin Role: Key Decisions

## Enum Extension Split Into Two Migrations

`ALTER TYPE ... ADD VALUE` is non-transactional in PostgreSQL 12+: the new value is not visible within the same transaction. Any function or policy that references `'admin'` in the same migration file will fail with `SQLSTATE 55P04`. The solution is two sequential migrations:

- `20260101000024_admin_role.sql` — only the `ALTER TYPE user_role ADD VALUE 'admin'` statement.
- `20260101000025_admin_role_policies.sql` — everything that uses the new value: `is_admin_or_above()`, policy replacements, updated trigger, updated RPC.

## `is_admin_or_above()` Alongside `is_superadmin()`

A new helper was added rather than modifying `is_superadmin()`. This avoids touching the four existing superadmin-only guards (tournaments, teams, users_profiles insert, role changes) and makes the intent explicit at the call site: callers of `is_superadmin()` remain superadmin-only; callers of `is_admin_or_above()` accept both roles.

## `fn_protect_profile_columns` Trigger — Two Changes

The existing trigger had a single combined check that blocked any non-superadmin from modifying `role`, `total_points`, or `exact_results_count`. Two independent changes were needed:

1. **Service-role bypass.** `changeRoleAction` uses `createAdminClient()` (service role). With service role, `auth.uid()` is `NULL` and `is_superadmin()` returns `false`, so the old trigger blocked every role update via the admin panel. Fix: add `IF auth.uid() IS NULL THEN RETURN NEW` at the top.

2. **Score columns loosened.** The `finalize_match` pipeline triggers `fn_recompute_user_aggregates` which updates `total_points` and `exact_results_count`. If the caller is an `admin` (not superadmin), the old combined check blocks the aggregate update. Fix: split into two guards — `role` stays superadmin-only, score columns loosen to `is_admin_or_above()`.

## Admin Layout — Static Redirect

The layout guard uses a static import of `redirect` from `next/navigation` rather than the dynamic-import pattern used in `requireSuperadmin`. This is more explicit and avoids a stale `.next` build cache serving the old `requireSuperadmin` call. The `requireAdminOrAbove()` helper in `get-user-profile.ts` is still exported for any future use, but the layout inlines the check directly.

## `changeRoleAction` — `z.enum(['user', 'admin'])` Only

The schema deliberately excludes `'superadmin'`. Granting superadmin via the UI is intentionally impossible; it can only be done directly in the database. This ensures no admin can escalate privileges through the role form.

The action also guards `parsed.data.userId === user.id` to prevent a superadmin from accidentally changing their own role to `'admin'` and losing superadmin access.

## Nav Visibility vs. Route Guard

Two independent layers protect access:

- **Nav layer** (`app/(app)/layout.tsx`, `AdminNavLinks.tsx`): hides the Admin link and Users link from non-qualifying roles. UI-only, not a security boundary.
- **Route layer** (`admin/layout.tsx`, `admin/users/page.tsx`): server-side guards that redirect on direct URL access. The users page has its own `requireSuperadmin()` call because the layout now admits `admin` users, so the layout guard alone is no longer sufficient for that subroute.

## Leaderboard and Player Pages

Both files used `isSuperadmin` as a local boolean for two distinct decisions: global leaderboard visibility and group-membership bypass. Rather than introduce a new variable name, the boolean was widened in place (`role === 'superadmin' || role === 'admin'`). Admin users manage all groups and need full visibility — restricting them to a group-scoped view would make the admin UI unusable.

## Files Summary

| File | Action |
|---|---|
| `supabase/migrations/20260101000024_admin_role.sql` | New: enum extension only |
| `supabase/migrations/20260101000025_admin_role_policies.sql` | New: helper, policies, trigger, RPC |
| `lib/supabase/types.ts` | Modified: `UserRole` + `is_admin_or_above` in Functions |
| `lib/auth/get-user-profile.ts` | Modified: added `requireAdminOrAbove()` |
| `app/(app)/layout.tsx` | Modified: `isAdmin` widened to include `'admin'` |
| `app/(app)/admin/layout.tsx` | Modified: inline guard with static `redirect` |
| `components/features/AdminNavLinks.tsx` | Modified: `isSuperadmin` prop filters Users link |
| `app/(app)/admin/users/page.tsx` | Modified: `requireSuperadmin()` guard + `ChangeRoleForm` |
| `app/(app)/admin/users/actions.ts` | Modified: added `changeRoleAction` |
| `app/(app)/admin/users/change-role-form.tsx` | New: inline role selector |
| `app/(app)/admin/groups/actions.ts` | Modified: `checkSuperadmin` widened to allow `'admin'` |
| `app/(app)/leaderboard/page.tsx` | Modified: `isSuperadmin` widened |
| `app/(app)/players/[userId]/page.tsx` | Modified: `isSuperadmin` widened |
