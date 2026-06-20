# Architecture

Fut Score is a private, invite-only football match prediction app for FIFA World Cup 2026.
Users predict match results, earn points via a hierarchical scoring system, and compete on a leaderboard.

## Stack

- **Frontend + API:** Next.js 16 App Router / React 19 / TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (Base UI primitives)
- **Backend + DB:** Supabase (PostgreSQL, Auth, RLS, Postgres Triggers, RPC)
- **Testing:** Vitest (unit tests — scoring logic is the priority)
- **Port:** 3000

## Folder Structure

```
/app
  /(auth)           # /login, /change-password
  /(app)            # all authenticated routes
    /home
    /matches        # prediction UI
    /leaderboard
    /admin          # superadmin only: finalize results, manage users
    /players
  layout.tsx        # root layout (Toaster, fonts)
  page.tsx          # root redirect
/components
  /ui               # shadcn-generated primitives
  /features         # domain-specific components
/lib
  /supabase         # client.ts, server.ts, admin.ts, types.ts
  /scoring          # score-prediction.ts, compute-ranks.ts (pure TS, unit-tested)
  /auth
  /datetime
  match-phases.ts
  utils.ts          # cn() helper
/supabase
  /migrations       # schema, RLS, triggers, RPC, seed data (idempotent)
  /seeds
/tests              # Vitest specs
proxy.ts            # Next.js 16 middleware — auth gate (renamed from middleware.ts)
```

## Route Protection — `proxy.ts`

`proxy.ts` is the Next.js 16 middleware file (runs before every request, before layouts).
Auth logic lives here — check it first when debugging route access or redirect issues.

Flow:
1. Refresh Supabase session on every request.
2. Unauthenticated → redirect to `/login` (except `/login` and `/change-password`).
3. Authenticated + `must_change_password = true` → redirect to `/change-password`.
4. `/admin/**` requires `role = 'superadmin'` or `'admin'`; otherwise redirect to `/home`.

## Supabase Usage Patterns

| Context | Import from | Use for |
|---|---|---|
| Server Components / Server Actions / Route Handlers | `lib/supabase/server.ts` | All server-side data access |
| Client Components | `lib/supabase/client.ts` | Client-side reads (realtime, etc.) |
| Admin operations | `lib/supabase/admin.ts` | `service_role` key — server-only, never in client |

All user-facing mutations go through Server Actions. RLS gates every `INSERT/UPDATE` at the DB level.

## Key Business Rules

### Scoring (hierarchical, first match wins)
1. **Exact result** (predicted home & away scores correct) → 10 pts
2. **Goal difference** (same diff, not exact) → 5 pts
3. **Correct winner / tie** → 2 pts
   - Knockout matches won on penalties: official outcome is the team that advanced, not the score
4. **None of the above** → 0 pts

The pure-TS implementation lives in `lib/scoring/score-prediction.ts` and mirrors the Postgres `finalize_match` RPC. Both must stay in sync.

### Prediction Lock
Predictions are locked **1 hour before kickoff**. The authoritative enforcement is a `BEFORE INSERT OR UPDATE` trigger (`enforce_prediction_lock`) in Postgres — never trust the UI lock alone.

### Roles
- `user` — can predict, view matches, view leaderboard.
- `superadmin` / `admin` — can finalize match results via `finalize_match` RPC, create users.
- User creation is superadmin-only; users receive a temporary password and must change it on first login.

### Leaderboard Ordering
`total_points DESC` → `exact_results_count DESC` → `display_name ASC`.
Scores are denormalized in `users_profiles` and maintained by the `recompute_user_aggregates` trigger.

## UI Conventions

- Class merging via `cn()` from `lib/utils.ts` — never manual string concatenation for Tailwind classes.
- Toast notifications via Sonner (`sonner`) — not `alert()`.
- Icons from `lucide-react` only.
- Dates displayed with `Intl.DateTimeFormat` in client components; use `lib/datetime/` utilities.
  All DB timestamps are UTC (`TIMESTAMPTZ`); DB-level time comparisons use `now()`.
- `inputMode="numeric"` on score inputs.

## Environment Variables

| Variable | Exposure | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (browser-safe) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (browser-safe) | RLS-gated anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** | Admin operations — never expose to client |
