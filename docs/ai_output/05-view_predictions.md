# 05 — View Player Predictions: Key Decisions

## RLS Policy

One additive policy (`predictions_select_finished`) opens finished-match predictions to all authenticated users. The existing `predictions_select_own` policy is untouched — Postgres applies OR logic across policies on the same operation, so users still read all their own predictions (including pending ones) from the matches page.

The policy lives at the DB layer so any future client (API, mobile) inherits the same guarantee without relying on application code.

## Access Guard (Page-Level)

The DB policy is permissive by design — it doesn't filter by group membership. Group-membership enforcement is intentionally done in the server component, consistent with `v_group_leaderboard` which also has no per-user filtering at the DB level. The guard checks:

1. Does the viewer share at least one group with the target? If not → `notFound()`.
2. Is the viewer a superadmin? → bypass group check.
3. Is the viewer viewing their own profile? → bypass group check.

`notFound()` is used instead of a 403 to avoid leaking whether a userId exists.

## Shared Constants: `lib/match-phases.ts`

`PHASE_LABELS` and `PHASE_ORDER` were originally private to `MatchesByPhase.tsx` (`'use client'`). When the admin results page (server component) imported them from that file, Next.js could not resolve the values at runtime — server components cannot consume plain exports from client modules, only React component exports. The fix was extracting the constants into `lib/match-phases.ts` (no directive), making them importable from both server and client code. `MatchesByPhase.tsx` now imports from there too.

## Player Page Structure

The page is a pure server component. Data fetching runs in two parallel batches to minimise latency:
- Batch 1: viewer profile + target profile (needed for the access guard).
- Batch 2 (after guard passes): finished matches + target's predictions.

Matches are grouped by phase using `PHASE_ORDER` / `PHASE_LABELS` from `lib/match-phases.ts`, descending by kickoff within each phase (most recent first — more useful than chronological in a history view).

`PredictionResultCard` is an inline component in the page file. It has no state and is read-only — extracting it to a shared component would add indirection without enabling reuse. The PointsBadge function is duplicated from `MatchCard.tsx` for the same reason; both files are standalone render units with no shared state.

## Leaderboard Links

The `<div>` wrappers in `RankingList` and `PodiumSection` were replaced with `<Link>` elements. No other changes — the row/card content, styling, and props are identical. The entire row is the tap target, which is important on mobile.

## Admin Results Page Redesign

The flat list was replaced with server-side tab navigation using `?phase=` as a URL param — no client JS needed, the URL is bookmarkable, and the page stays a pure server component. `<Link>` elements styled as tabs replace Radix Tabs (which requires a client boundary).

The default tab is the first phase with at least one pending match, so the admin always lands where action is needed. Phases with pending work are marked with an orange dot on inactive tabs, making the remaining workload visible at a glance without switching tabs.

Within each tab the existing layout is preserved: pending matches show the full finalize form, finished matches show the compact inline-edit row.

## Files Created / Modified

| File | Action |
|---|---|
| `supabase/migrations/20260101000023_predictions_public_finished.sql` | New: RLS policy for finished predictions |
| `lib/match-phases.ts` | New: `PHASE_LABELS` and `PHASE_ORDER` extracted from `MatchesByPhase.tsx` |
| `app/(app)/players/[userId]/page.tsx` | New: player prediction history page |
| `components/features/MatchesByPhase.tsx` | Modified: imports constants from `lib/match-phases.ts` |
| `components/features/RankingList.tsx` | Modified: entry rows are now `<Link>` elements |
| `components/features/PodiumSection.tsx` | Modified: podium cards are now `<Link>` elements |
| `app/(app)/admin/results/page.tsx` | Modified: flat list replaced with phase-tab navigation |
