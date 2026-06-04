# Implementation Plan: View Player Predictions

## 1. Overview

Any user can click on another player in the leaderboard and see that player's prediction history: every finished match they submitted a pick for, their predicted score, and how many points they earned.

**Key constraint:** Predictions for pending or locked matches must never be visible to other users — only finished matches are exposed. This is enforced at the database layer (new RLS policy), not just in the UI.

**Scope:** purely additive. No schema changes, no scoring changes, no admin panel changes. The only structural addition is one RLS policy, one new page, and making leaderboard entries clickable.

### Access model

- A user can always view their own prediction history (already accessible via the current policy).
- A user can view another player's finished predictions only if they share at least one group. This is a server-side guard in the page component.
- Superadmins can view any player's history.
- Navigating directly to `/players/[userId]` for a user outside your groups returns `notFound()`.

The new RLS policy makes finished predictions readable to all authenticated users at the database layer (consistent with `v_group_leaderboard`, which also has no per-user filtering at the DB level). The page component enforces the group-membership guard above that.

## 2. Database Changes

### 2.1 New Migration: `20260101000023_predictions_public_finished.sql`

One new RLS SELECT policy that opens finished match predictions to all authenticated users:

```sql
-- Allow any authenticated user to read predictions for finished matches.
-- Predictions for pending/locked matches remain private (only owner can read).
-- The page component enforces an additional group-membership guard above this.
CREATE POLICY "predictions_select_finished"
  ON predictions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = predictions.match_id
        AND matches.status = 'finished'
    )
  );
```

The existing `predictions_select_own` policy (`USING (user_id = auth.uid())`) is unchanged — users can still read all their own predictions (including pending ones) from the `/matches` page. The new policy is additive: Postgres applies OR logic across policies on the same operation.

No table changes. No trigger changes. No type changes.

## 3. New Page: `app/(app)/players/[userId]/page.tsx`

Server Component. Fetches data, validates access, renders the history.

### 3.1 Data fetching

```typescript
export default async function PlayerPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch viewer's profile (role check) and target's profile in parallel
  const [{ data: viewerProfile }, { data: targetProfile }] = await Promise.all([
    supabase.from('users_profiles').select('role').eq('id', user.id).single(),
    supabase
      .from('users_profiles')
      .select('id, display_name, total_points, exact_results_count')
      .eq('id', userId)
      .single(),
  ])

  if (!targetProfile) notFound()

  const isSuperadmin = viewerProfile?.role === 'superadmin'
  const isOwnProfile = userId === user.id

  // Group-membership guard for non-admins viewing other users
  if (!isSuperadmin && !isOwnProfile) {
    const { data: viewerGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)

    const viewerGroupIds = (viewerGroups ?? []).map((g) => g.group_id)

    if (viewerGroupIds.length === 0) notFound()

    const { data: commonGroup } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId)
      .in('group_id', viewerGroupIds)
      .limit(1)
      .maybeSingle()

    if (!commonGroup) notFound()
  }

  // Fetch all finished matches and target's predictions in parallel.
  // The new "predictions_select_finished" RLS policy allows this query.
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id')
    .eq('is_active', true)
    .single()

  const [{ data: matches }, { data: predictions }] = await Promise.all([
    supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        penalty_winner_team:teams!matches_penalty_winner_team_id_fkey(*)
      `)
      .eq('tournament_id', tournament?.id ?? '')
      .eq('status', 'finished')
      .order('kickoff_time', { ascending: false }),
    supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId),
  ])

  const predictionMap = new Map((predictions ?? []).map((p) => [p.match_id, p]))
  // Only render matches where the target actually submitted a prediction
  const matchesWithPredictions = (matches ?? []).filter((m) => predictionMap.has(m.id))
  // ...render
}
```

### 3.2 Layout and rendering

The page has two sections:

**Header** — player summary row (same shape as a leaderboard entry):

```tsx
<div className="flex items-center gap-3 mb-6">
  <PlayerAvatar displayName={targetProfile.display_name} rank="other" size="lg" />
  <div>
    <h1 className="text-xl font-bold">{targetProfile.display_name}</h1>
    <p className="text-sm text-muted-foreground">
      {targetProfile.total_points} pts · {targetProfile.exact_results_count} exact
    </p>
  </div>
</div>
```

**Prediction list** — grouped by phase using the existing `PHASE_LABELS` / `PHASE_ORDER` constants from `MatchesByPhase.tsx`. Each entry is a read-only card:

```tsx
{/* One card per finished match with a prediction */}
<div className="bg-card border border-border rounded-xl p-4 space-y-3">
  {/* Teams row with official result in the center */}
  {/* "Their pick: X–Y (Team wins pens) · N pts" */}
</div>
```

The card renders the same information as `MatchCard`'s locked/finished display — team flags, official score, predicted score, penalty pick if present, and a `PointsBadge`. This is a **read-only render**, not the full `MatchCard` component (which carries form logic and state). Inline it directly in the page or extract a small `PredictionResultCard` component if the page grows long — no shared state is needed.

**Empty state** — if the player has no finished predictions yet:

```tsx
<div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
  <p className="text-lg font-semibold">No predictions yet.</p>
  <p className="text-sm text-muted-foreground">Check back after the first matches are finalized.</p>
</div>
```

## 4. Leaderboard — Make Entries Clickable

### 4.1 `components/features/RankingList.tsx`

Wrap each entry row in a `<Link href={`/players/${entry.id}`}>`. The row styling stays identical — the link makes the entire row tappable on mobile:

```tsx
import Link from 'next/link'
// ...
<Link
  key={entry.id}
  href={`/players/${entry.id}`}
  className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${...}`}
>
  {/* existing row content unchanged */}
</Link>
```

The current `<div>` wrapper becomes a `<Link>`. No other changes.

### 4.2 `components/features/PodiumSection.tsx`

Wrap each podium card in a `<Link href={`/players/${entry.id}`}>`:

```tsx
import Link from 'next/link'
// ...
<Link
  key={rank}
  href={`/players/${entry.id}`}
  className="flex flex-col items-center gap-2 flex-1 max-w-[140px] hover:opacity-80 transition-opacity"
>
  {/* existing card content unchanged */}
</Link>
```

The current `<div>` wrapper becomes a `<Link>`. No other changes.

## 5. Files Summary

### New files

| File | Purpose |
|---|---|
| `supabase/migrations/20260101000023_predictions_public_finished.sql` | New RLS policy: finished predictions readable by all authenticated users |
| `app/(app)/players/[userId]/page.tsx` | Player prediction history page |

### Modified files

| File | Change |
|---|---|
| `components/features/RankingList.tsx` | Entry rows become `<Link>` to `/players/[userId]` |
| `components/features/PodiumSection.tsx` | Podium cards become `<Link>` to `/players/[userId]` |

Nothing else changes. No type updates (the query fields already exist), no scoring changes, no admin changes.

## 6. Execution Order

1. **Migration** — Apply `20260101000023_predictions_public_finished.sql`. Verify with a test query: fetch another user's finished prediction using the viewer's auth JWT — should succeed. Fetch a pending prediction for another user — should be blocked.
2. **Page** — Build `app/(app)/players/[userId]/page.tsx`. Validate the access guard: navigating to an out-of-group user's page returns 404; own profile always works; superadmin can view anyone.
3. **Leaderboard links** — Update `RankingList` and `PodiumSection`. Verify clicking a podium card or ranking row navigates to the correct player page.

## 7. Verification

1. As a regular user, open the leaderboard — confirm each ranking row and podium card is now clickable.
2. Click on another user in your group — confirm their prediction history loads, showing only finished matches.
3. Confirm pending matches are not shown on the history page.
4. Confirm that a user's penalty pick is displayed for knockout matches where they submitted one.
5. Directly navigate to `/players/[userId]` for a user NOT in any of your groups — confirm `notFound()` (404 page).
6. Navigate to your own `/players/[userId]` — confirm it works and your history is shown correctly.
7. As superadmin, navigate to any user's `/players/[userId]` — confirm unrestricted access.
8. A user with no finished predictions yet — confirm the empty state is shown instead of an empty list.
