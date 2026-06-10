# Implementation Plan: Home View

## 1. Overview

Add a Home view as the default landing page for all authenticated users. It shows matches sorted chronologically — pending matches and recently finished ones — so users can quickly see what needs a prediction and what just happened, without navigating through phase tabs.

**Key constraints:**
- All match interactions (set/update predictions, penalty picker) must work identically to the Matches view.
- Finished matches stay visible for 24 hours after results are set, then disappear automatically.
- Pagination: 15 matches per page, Previous/Next navigation.
- Home becomes the default route (`/` redirects to `/home`).

**Scope:** New page and navigation updates only. No changes to the prediction system, scoring, or existing Matches view.

## 2. New Page — `app/(app)/home/page.tsx`

Server Component. Follows the same auth + active tournament pattern as `app/(app)/matches/page.tsx`.

### 2.1 Match Query

```typescript
const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

const { data: rawMatches } = await supabase
  .from('matches')
  .select(`
    *,
    home_team:teams!matches_home_team_id_fkey(*),
    away_team:teams!matches_away_team_id_fkey(*),
    penalty_winner_team:teams!matches_penalty_winner_team_id_fkey(*)
  `)
  .eq('tournament_id', tournament.id)
  .or(`status.eq.pending,and(status.eq.finished,results_set_at.gt.${cutoff})`)
  .order('kickoff_time', { ascending: true })
  .range(offset, offset + PAGE_SIZE) // fetches PAGE_SIZE + 1
```

- `status = 'pending'` catches all upcoming/in-progress matches.
- `status = 'finished' AND results_set_at > cutoff` catches matches finalized within the last 24 hours. `results_set_at` is used (not `kickoff_time`) because it records when an admin actually set the result.
- Results are sorted globally by `kickoff_time` ascending — no phase grouping.

### 2.2 Pagination Strategy

`PAGE_SIZE = 15`. The query fetches `PAGE_SIZE + 1` rows (i.e., `.range(offset, offset + PAGE_SIZE)`). If 16 rows are returned, a next page exists — display the first 15 and enable the Next button. This avoids a separate `COUNT(*)` query.

```typescript
const hasNextPage = (rawMatches?.length ?? 0) > PAGE_SIZE
const matches = rawMatches?.slice(0, PAGE_SIZE) ?? []
```

`searchParams.page` (awaited, Next.js 15+ pattern) drives `offset = (page - 1) * PAGE_SIZE`. Invalid or missing values default to page 1.

Previous/Next are plain `<Link>` components pointing to `/home?page=N`. Previous is hidden on page 1; Next is hidden when `hasNextPage` is false. The pagination row itself is omitted entirely if neither button would show.

### 2.3 Predictions Query

Predictions are fetched only for the 15 visible match IDs using `.in('match_id', matchIds)` — not for all matches in the tournament. Skipped entirely if the page returns zero matches.

```typescript
const { data } = await supabase
  .from('predictions')
  .select('*')
  .eq('user_id', user.id)
  .in('match_id', matchIds)
```

### 2.4 Rendering

Flat list of `MatchCard` components — no phase tabs, no grouping. `MatchCard` is reused unchanged from `components/features/MatchCard.tsx`. A `predMap` (keyed by `match_id`) resolves each card's prediction prop.

## 3. Navigation Updates

### 3.1 `components/features/BottomNav.tsx`

Add `Home` (lucide-react `Home` icon) as the first item in `navItems`, before Matches:

```typescript
const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/matches', label: 'Matches', icon: Trophy },
  { href: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
] as const
```

### 3.2 `components/features/NavLinks.tsx`

Add `Home` as the first link, before Matches:

```typescript
const links = [
  { href: '/home', label: 'Home' },
  { href: '/matches', label: 'Matches' },
  { href: '/leaderboard', label: 'Leaderboard' },
  ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
]
```

### 3.3 `app/page.tsx`

```typescript
redirect('/home')  // was: redirect('/matches')
```

## 4. Files Summary

### New files

| File | Purpose |
|---|---|
| `app/(app)/home/page.tsx` | Home view: chronological matches, 15-per-page pagination, 24h finished-match window |

### Modified files

| File | Change |
|---|---|
| `components/features/BottomNav.tsx` | Add Home as first nav item |
| `components/features/NavLinks.tsx` | Add Home as first nav link |
| `app/page.tsx` | Redirect `/` to `/home` |

## 5. Verification

1. Navigate to `/` → redirects to `/home`.
2. Home shows pending matches + matches finalized within the last 24 hours, sorted chronologically.
3. Matches finalized more than 24 hours ago do not appear.
4. Exactly 15 matches shown per page; a 16th triggers the Next button.
5. Page 1 has no Previous button; the last page has no Next button. If total matches ≤ 15, no pagination row is rendered.
6. MatchCards are fully interactive: predictions can be set/updated, penalty picker works for knockout ties.
7. Bottom nav (mobile) shows Home icon as the leftmost item with correct active state.
8. Top nav (desktop) shows Home as the leftmost link with correct active state.
