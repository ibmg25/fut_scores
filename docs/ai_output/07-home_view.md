# 07 — Home View: Key Decisions

## `results_set_at` as the 24-Hour Anchor

The 24-hour visibility window uses `results_set_at` (when an admin finalized the match), not `kickoff_time`. A match kicked off 30 hours ago but finalized 2 hours ago should still appear — the user needs to see their score. Using `kickoff_time` would make the window unreliable because matches are finalized minutes to hours after the actual final whistle.

`results_set_at` is always `NOT NULL` when `status = 'finished'` (enforced by the `finalize_match` RPC), so no null-handling is needed in the filter.

## `PAGE_SIZE + 1` Fetch to Detect Next Page

The query fetches 16 rows (`.range(offset, offset + PAGE_SIZE)`) to determine whether a next page exists without issuing a separate `COUNT(*)`. If 16 rows come back, display 15 and enable Next. This pattern avoids an extra round-trip and is safe because Supabase `.range()` is inclusive on both bounds.

## Predictions Scoped to Visible Match IDs

Predictions are fetched with `.in('match_id', matchIds)` against only the 15 displayed matches — not all matches in the tournament. The Matches view fetches predictions for all matches at once because it displays everything. The Home view has a bounded page size, so scoping the query is a meaningful optimization and avoids pulling irrelevant rows.

## Flat List, No Phase Grouping

The existing Matches view groups by phase using `MatchesByPhase` with tab navigation. Home deliberately uses a flat chronological list — its purpose is a timeline, not a structured tournament bracket. `MatchCard` is reused unchanged; only the container and data-fetching logic differ.

## `searchParams` Awaited (Next.js 15+)

In Next.js 15, `searchParams` in page components is a `Promise` that must be awaited. The page uses `const { page: pageParam } = await searchParams` to comply. This is consistent with Next.js 16's breaking changes noted in `AGENTS.md`.

## Root Redirect Changed to `/home`

The previous redirect (`/` → `/matches`) was a one-line change. Home is now the default entry point; Matches is still accessible via nav for users who prefer the phase-tab view.

## No Changes to `proxy.ts` Middleware Required

The middleware in `proxy.ts` protects authenticated routes generically — it does not maintain an explicit allowlist of app routes. `/home` is inside `app/(app)/`, which is already covered by the existing session check. No middleware changes were needed.

## Files Summary

| File | Action |
|---|---|
| `app/(app)/home/page.tsx` | New: Home view with 24h filter, 15-per-page pagination, flat MatchCard list |
| `components/features/BottomNav.tsx` | Modified: Home added as first nav item |
| `components/features/NavLinks.tsx` | Modified: Home added as first nav link |
| `app/page.tsx` | Modified: redirect target changed to `/home` |
