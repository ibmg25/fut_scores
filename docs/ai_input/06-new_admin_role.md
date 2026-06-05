# Implementation Plan: New Admin Role

## 1. Overview

Add an `admin` role between `user` and `superadmin`. An admin can set match results, create groups, and assign users to groups. User management (creating users, resetting passwords) and role assignment remain restricted to `superadmin` only.

**Key constraint:** The only way to grant or revoke admin access is via a direct `superadmin` operation. An `admin` cannot promote themselves or others.

**Scope:** Role system extension only. No changes to predictions, scoring, match data, or team/tournament management. All existing `superadmin` capabilities remain unchanged.

### Design decisions

- A new `is_admin_or_above()` SQL helper is added **alongside** the existing `is_superadmin()`. The existing function is not renamed or removed — it continues to guard user management and role changes exclusively.
- The admin panel layout guard is loosened to admit both roles; the `/admin/users` page adds its own explicit superadmin-only guard so direct URL navigation is also blocked.
- `admin` users see the global leaderboard and "All Players" pill (same as superadmin) — they manage all groups and need visibility over all players.
- `admin` users can view any player's prediction history (same as superadmin) — user management is the only restriction.
- The `fn_protect_profile_columns` trigger is split into two independent checks: `role` changes remain superadmin-only; `total_points`/`exact_results_count` are loosened to `is_admin_or_above()` so the `finalize_match` pipeline works for admin callers.

## 2. Database Changes

### 2.1 New Migration: `20260101000024_admin_role.sql`

**Step 1 — Extend the enum**

```sql
-- Must be the first statement: ALTER TYPE ADD VALUE is non-transactional in PG 12+.
ALTER TYPE user_role ADD VALUE 'admin';
```

No data migration, no column changes. Existing rows keep their current role.

**Step 2 — New helper function**

```sql
CREATE OR REPLACE FUNCTION is_admin_or_above() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM users_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
$$;
```

`is_superadmin()` is kept unchanged and continues to guard user management and role changes.

**Step 3 — Replace RLS policies for matches, groups, group_members**

```sql
-- matches
DROP POLICY "matches_modify_superadmin" ON matches;
CREATE POLICY "matches_modify_admin_or_above"
  ON matches FOR ALL TO authenticated
  USING (is_admin_or_above())
  WITH CHECK (is_admin_or_above());

-- groups
DROP POLICY "groups_all_superadmin" ON groups;
CREATE POLICY "groups_all_admin_or_above"
  ON groups FOR ALL TO authenticated
  USING (is_admin_or_above())
  WITH CHECK (is_admin_or_above());

-- group_members (read)
DROP POLICY "group_members_select_superadmin" ON group_members;
CREATE POLICY "group_members_select_admin_or_above"
  ON group_members FOR SELECT TO authenticated
  USING (is_admin_or_above());

-- group_members (write)
DROP POLICY "group_members_modify_superadmin" ON group_members;
CREATE POLICY "group_members_modify_admin_or_above"
  ON group_members FOR ALL TO authenticated
  USING (is_admin_or_above())
  WITH CHECK (is_admin_or_above());
```

These four policies are the only ones changing. The `tournaments`, `teams`, and `users_profiles` insert/role-change policies remain guarded by `is_superadmin()`.

**Step 4 — Update `fn_protect_profile_columns` trigger**

Two changes are needed to this trigger:

1. **`finalize_match` pipeline**: currently blocks `total_points`/`exact_results_count` updates for any non-superadmin — including an `admin` who calls `finalize_match`. Fix: split the check so `role` stays superadmin-only and the score columns loosen to `is_admin_or_above()`.

2. **`changeRoleAction` (§5.7)**: uses `createAdminClient()` (service role) to update `role`. With service role there is no JWT context — `auth.uid()` is `NULL` and `is_superadmin()` returns `false`, blocking the update. Fix: add a service-role bypass at the top of the function.

```sql
-- Trigger dependency chain (unchanged, only the permission checks are updated):
--   finalize_match (SECURITY DEFINER, called by admin or superadmin)
--     → UPDATE predictions SET points_earned = ...
--     → fn_recompute_user_aggregates (AFTER UPDATE OF points_earned)
--       → UPDATE users_profiles SET total_points, exact_results_count
--         → fn_protect_profile_columns (BEFORE UPDATE) ← this function
--
--   changeRoleAction (service role via createAdminClient)
--     → UPDATE users_profiles SET role = ...
--         → fn_protect_profile_columns (BEFORE UPDATE) ← this function
--
-- Service role bypass: auth.uid() is NULL when called via service role key.
-- Role changes remain superadmin-only (admin cannot promote themselves).
-- Score columns loosen to is_admin_or_above() for the finalize_match pipeline.
CREATE OR REPLACE FUNCTION fn_protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Service role has no JWT context; auth.uid() is NULL. Bypass all column guards.
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;

  -- Role changes require superadmin.
  IF NEW.role IS DISTINCT FROM OLD.role
     AND NOT is_superadmin() THEN
    RAISE EXCEPTION 'Permission denied: cannot modify protected profile fields'
      USING ERRCODE = '42501';
  END IF;

  -- Score columns are updated by the finalize_match pipeline;
  -- any direct modification requires admin or above.
  IF (NEW.total_points        IS DISTINCT FROM OLD.total_points
      OR NEW.exact_results_count IS DISTINCT FROM OLD.exact_results_count)
     AND NOT is_admin_or_above() THEN
    RAISE EXCEPTION 'Permission denied: cannot modify protected profile fields'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;
```

The trigger binding (`BEFORE UPDATE ON users_profiles FOR EACH ROW`) is unchanged — only the function body is replaced via `CREATE OR REPLACE`.

**Step 5 — Update `finalize_match` RPC authorization**

The RPC (currently defined in `20260101000022`) has an early guard. The migration recreates the full function with one line changed:

```sql
-- Before:
IF NOT is_superadmin() THEN
  RAISE EXCEPTION 'Permission denied: superadmin role required'
    USING ERRCODE = '42501';
END IF;

-- After:
IF NOT is_admin_or_above() THEN
  RAISE EXCEPTION 'Permission denied: admin role required'
    USING ERRCODE = '42501';
END IF;
```

The migration must contain the full `CREATE OR REPLACE FUNCTION finalize_match(...)` body copied from `20260101000022_prediction_penalty_winner.sql` with only the two lines above updated. All scoring logic is unchanged.

## 3. TypeScript — Types

### 3.1 `lib/supabase/types.ts`

```typescript
export type UserRole = 'user' | 'admin' | 'superadmin'
```

The DB enum now has three values; the TypeScript mirror must match. No other type changes are needed — the `users_profiles` table shape is unchanged.

## 4. Auth Helper

### 4.1 `lib/auth/get-user-profile.ts`

Add `requireAdminOrAbove()` alongside the existing functions. `requireSuperadmin()` stays — it is still used by the users page.

```typescript
export async function requireAdminOrAbove(): Promise<UserProfile> {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'superadmin' && profile.role !== 'admin')) {
    const { redirect } = await import('next/navigation')
    redirect('/matches')
  }
  return profile!
}
```

## 5. Admin Panel

### 5.1 `app/(app)/admin/layout.tsx`

Change the guard from `requireSuperadmin()` to `requireAdminOrAbove()` and pass the role down to `AdminNavLinks` so it can conditionally hide the Users link:

```tsx
import { requireAdminOrAbove } from '@/lib/auth/get-user-profile'
import AdminNavLinks from '@/components/features/AdminNavLinks'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdminOrAbove()

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
        <h1 className="text-xl font-bold">Admin</h1>
        <AdminNavLinks isSuperadmin={profile.role === 'superadmin'} />
      </div>
      {children}
    </div>
  )
}
```

### 5.2 `components/features/AdminNavLinks.tsx`

Accept `isSuperadmin: boolean` and filter the links array. A `superadminOnly` flag marks the Users link:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ALL_LINKS = [
  { href: '/admin/results', label: 'Match Results', superadminOnly: false },
  { href: '/admin/users',   label: 'Users',         superadminOnly: true  },
  { href: '/admin/groups',  label: 'Groups',         superadminOnly: false },
]

export default function AdminNavLinks({ isSuperadmin }: { isSuperadmin: boolean }) {
  const pathname = usePathname()
  const links = ALL_LINKS.filter((l) => !l.superadminOnly || isSuperadmin)

  return (
    <nav className="flex items-center gap-1 text-sm">
      {links.map(({ href, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              active
                ? 'text-foreground bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
```

### 5.3 `app/(app)/admin/users/page.tsx`

The layout now admits `admin` users, so the users page must add its own explicit guard to handle direct URL navigation (`/admin/users`):

```typescript
// At the top of the server component, before any data fetching:
await requireSuperadmin()
```

An `admin` user navigating to `/admin/users` will be redirected to `/matches`. The nav link for Users is already hidden from them, so this is a defensive guard for direct URL access.

### 5.4 `app/(app)/admin/groups/actions.ts`

The `getAuthorizedUser()` helper in this file checks `role !== 'superadmin'`. Widen to accept `admin`:

```typescript
// Before:
if (profile?.role !== 'superadmin') return null

// After:
if (profile?.role !== 'superadmin' && profile?.role !== 'admin') return null
```

### 5.5 `app/(app)/admin/results/actions.ts`

No change. The server action has no explicit role check — authorization is fully delegated to the `finalize_match` RPC (updated in §2.1 Step 5). This is consistent with the existing pattern.

### 5.6 `app/(app)/admin/users/actions.ts`

Add `changeRoleAction`. The existing `createUserAction` and `resetPasswordAction` are unchanged.

```typescript
const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['user', 'admin']),
})

export async function changeRoleAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    return { error: 'Permission denied.' }
  }

  const parsed = changeRoleSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
  })

  if (!parsed.success) {
    return { error: 'Invalid input.' }
  }

  if (parsed.data.userId === user.id) {
    return { error: 'Cannot change your own role.' }
  }

  const adminClient = createAdminClient()
  const { error: updateError } = await adminClient
    .from('users_profiles')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.userId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/admin/users')
  return { error: null }
}
```

`z.enum(['user', 'admin'])` deliberately excludes `'superadmin'` — the superadmin role cannot be granted via this UI, only directly in the database.

### 5.7 New component: `app/(app)/admin/users/change-role-form.tsx`

Inline form with a select dropdown and a Save button, using the same `useActionState` pattern as the other forms in this directory:

```tsx
'use client'

import { useActionState } from 'react'
import { changeRoleAction } from './actions'
import type { UserRole } from '@/lib/supabase/types'

export default function ChangeRoleForm({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: Extract<UserRole, 'user' | 'admin'>
}) {
  const [state, action, pending] = useActionState(changeRoleAction, { error: null })

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        className="text-sm border border-border rounded px-2 py-1 bg-background"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-primary hover:underline disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save'}
      </button>
      {state.error && (
        <span className="text-xs text-destructive">{state.error}</span>
      )}
    </form>
  )
}
```

### 5.8 `app/(app)/admin/users/page.tsx`

Two changes:

1. **Import `ChangeRoleForm`** alongside the existing imports.

2. **Replace the static Role badge** with conditional rendering. Superadmin rows keep a badge (role is not editable via UI); user/admin rows show the inline form. Note: the existing badge labels `superadmin` as "Admin" — rename it to "Superadmin" to avoid confusion now that "Admin" is a real distinct role.

```tsx
// Role column cell — replaces the existing static badge:
<TableCell>
  {p.role === 'superadmin' ? (
    <Badge>Superadmin</Badge>
  ) : (
    <ChangeRoleForm
      userId={p.id}
      currentRole={p.role as 'user' | 'admin'}
    />
  )}
</TableCell>
```

## 6. Leaderboard and Player Pages

### 6.1 `app/(app)/leaderboard/page.tsx`

The page uses `isSuperadmin = profile.role === 'superadmin'` to decide between global and group-scoped views. Replace the derivation so `admin` also gets the global view:

```typescript
const isAdminOrAbove = profile.role === 'superadmin' || profile.role === 'admin'
```

Use `isAdminOrAbove` in place of `isSuperadmin` everywhere in the file: the data fetch decision (`v_leaderboard` vs `v_group_leaderboard`), the `showAllPlayers` prop on `GroupSelector`, and the zero-groups blocking check.

### 6.2 `app/(app)/players/[userId]/page.tsx`

`isSuperadmin` is used to bypass the group membership guard. `admin` users should also bypass it — viewing predictions is not a user management action:

```typescript
// Before:
const isSuperadmin = viewerProfile?.role === 'superadmin'

// After:
const isSuperadmin = viewerProfile?.role === 'superadmin' || viewerProfile?.role === 'admin'
```

The variable name can stay as-is since it is local to this file.

## 7. What Does NOT Change

- `app/(app)/admin/users/actions.ts` — `role !== 'superadmin'` guards stay.
- `tournaments` and `teams` RLS policies — superadmin-only, untouched.
- `profiles_insert_superadmin` RLS policy — superadmin-only, untouched.
- All user-facing pages (`/matches`, `/leaderboard` group logic, predictions) — untouched.
- Scoring logic, `finalize_match` scoring body, all other triggers — untouched.
- `GroupSelector` component — unchanged.

## 8. Files Summary

### New files

| File | Purpose |
|---|---|
| `supabase/migrations/20260101000024_admin_role.sql` | Enum value, `is_admin_or_above()`, policy replacements, trigger + RPC updates |

### Modified files

| File | Change |
|---|---|
| `lib/supabase/types.ts` | Add `'admin'` to `UserRole` |
| `lib/auth/get-user-profile.ts` | Add `requireAdminOrAbove()` |
| `app/(app)/admin/layout.tsx` | Use `requireAdminOrAbove()`, pass `isSuperadmin` prop to `AdminNavLinks` |
| `components/features/AdminNavLinks.tsx` | Accept `isSuperadmin` prop, filter Users link |
| `app/(app)/admin/users/page.tsx` | Add `requireSuperadmin()` page-level guard |
| `app/(app)/admin/groups/actions.ts` | Widen role guard to allow `admin` |
| `app/(app)/admin/users/actions.ts` | Add `changeRoleAction` |
| `app/(app)/admin/users/page.tsx` | Replace static role badge with `ChangeRoleForm`; rename Superadmin badge |
| `app/(app)/leaderboard/page.tsx` | Use `isAdminOrAbove` for global view and `showAllPlayers` |
| `app/(app)/players/[userId]/page.tsx` | Use `isAdminOrAbove` to bypass group membership guard |

### New components

| File | Purpose |
|---|---|
| `app/(app)/admin/users/change-role-form.tsx` | Inline role selector for non-superadmin rows |

## 9. Execution Order

Each step ends in a working, committable state.

1. **Migration** — Apply `20260101000024_admin_role.sql`. Verify `is_admin_or_above()` exists. Manually set a test user to `role = 'admin'` and confirm the function returns `true` for their session.
2. **Types + Auth helper** — Update `UserRole` and add `requireAdminOrAbove()`.
3. **Admin panel** — Update layout, `AdminNavLinks`, users page guard, groups actions. Verify behavior end-to-end before touching the leaderboard.
4. **Leaderboard + Player pages** — Update `isAdminOrAbove` derivation in both files.
5. **End-to-end verification** — See §10.

## 10. Verification

1. Promote a test user to `admin`: `UPDATE users_profiles SET role = 'admin' WHERE id = '<id>'`.
2. As admin, navigate to `/admin` — confirm access is granted.
3. Confirm the nav shows "Match Results" and "Groups" but not "Users".
4. Navigate directly to `/admin/users` — confirm redirect to `/matches`.
5. As admin, finalize a match result — confirm it succeeds and the leaderboard updates correctly.
6. As admin, create a group and add/remove a member — confirm both actions work.
7. As admin, navigate to `/leaderboard` — confirm the global leaderboard and "All Players" pill are shown.
8. As admin, navigate to `/players/[anyUserId]` — confirm unrestricted access regardless of group membership.
9. As admin, attempt to trigger `createUserAction` or `resetPasswordAction` — confirm "Permission denied" is returned.
10. As superadmin, open `/admin/users` — confirm the Role column now shows a dropdown for user/admin rows and a "Superadmin" badge for superadmin rows.
11. Change a user's role from "User" to "Admin" via the dropdown — confirm the change persists after page reload and the user can now access the admin panel.
12. Change the role back to "User" — confirm the user loses admin access.
13. Confirm the role selector is not shown for the superadmin's own row (it shows a static badge, not a form).
14. As superadmin, confirm all previous behavior is unchanged: user creation, password reset, and all other admin operations work normally.
15. As a regular user, confirm no visible change: group-scoped leaderboard, predictions, and player page group guard all behave as before.
