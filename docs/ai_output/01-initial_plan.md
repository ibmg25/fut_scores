# Fut_Score — Implementation Reference

## Project in one sentence
Private football prediction app for FIFA World Cup 2026 (~20 users). Users predict match scores; a superadmin enters final scores; the system auto-scores and maintains a leaderboard.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript) | Spec requirement |
| Backend/DB | Supabase (Postgres, Auth, RLS) | Spec requirement |
| Styling | Tailwind CSS + shadcn/ui | Spec requirement |
| Tests | Vitest | Spec requirement |
| Hosting | Vercel (not yet deployed) | Fastest path; no lock-in at this scale |

**App lives at:** `C:\IBMG\Proyectos\Fut_Score\fut-score\`

---

## Critical Next.js 16 differences (breaking changes)

- **`middleware.ts` → `proxy.ts`** — The file and exported function are renamed. Use `export function proxy(request: NextRequest)`. The old name still works but is deprecated.
- **`proxy` runs in Node.js runtime** (not Edge). The `runtime` config option is not available.
- **`cookies()` is async** — always `await cookies()`.
- **Turbopack by default** — `next dev` and `next build` use Turbopack. No webpack config needed.
- **`revalidateTag` requires a second argument** (cache life profile) in v16 — but this app uses `revalidatePath`, so unaffected.

---

## Auth flow

1. Superadmin creates users via `/admin/users` using the Supabase Admin API (service role key, server-only).
2. A random 16-char temp password is generated and shown **once** in the UI.
3. On first login, `users_profiles.must_change_password = true` forces a redirect to `/auth/change-password` — user **cannot access any other route** until they set a new password.
4. `proxy.ts` enforces this on every request (session refresh + `must_change_password` check + admin guard for `/admin/**`).
5. Authorization is always verified server-side. Never rely on client-side checks.

**Superadmin creation:** Must be done manually in Supabase dashboard (set `role = 'superadmin'` in `users_profiles` table directly).

---

## Database schema summary

```
tournaments     — one active row for WC 2026 (is_active = true)
teams           — 48 teams, name UNIQUE, flag_url from flagcdn.com
matches         — has phase (enum), kickoff_time (UTC), status, scores, penalty_winner_team_id
users_profiles  — extends auth.users; holds role, must_change_password, denormalized points
predictions     — one row per (user, match); points_earned updated by finalize_match RPC
```

Key constraints:
- `matches`: UNIQUE on `(tournament_id, home_team_id, away_team_id, kickoff_time)` — enables idempotent seeding.
- `predictions`: UNIQUE on `(user_id, match_id)`.

---

## Scoring system (hierarchical, first match wins)

Implemented as a **pure TypeScript function** at `lib/scoring/score-prediction.ts` **and** mirrored in the `finalize_match` Postgres RPC.

| Tier | Condition | Points |
|---|---|---|
| 1 | Exact score | 10 |
| 2 | Same goal difference | 5 |
| 3 | Correct outcome (home/away/tie) | 2 |
| 4 | None of the above | 0 |

**Knockout penalty rule:** If `penalty_winner_team_id IS NOT NULL`, the official outcome for tier 3 is determined by which team advanced via penalties — not by the regulation score. Tiers 1 and 2 still use the regulation score only.

**Group stage:** `penalty_winner_team_id` must always be `NULL`. Enforced in `finalize_match` RPC and the admin form.

The pure TS function is tested with **22 Vitest tests** covering all edge cases (`tests/scoring.test.ts`). Run with `npm run test:run`.

---

## Database triggers

1. **`enforce_prediction_lock`** (BEFORE INSERT OR UPDATE on predictions) — raises an exception if `now() >= kickoff_time - 1 hour`. This is the authoritative lock; the UI lock is decorative only.
2. **`maintain_predictions_updated_at`** (BEFORE UPDATE on predictions) — sets `updated_at = now()`.
3. **`recompute_user_aggregates`** (AFTER INSERT OR UPDATE OF points_earned on predictions) — full SUM recompute of `total_points` and `exact_results_count` in `users_profiles`.

---

## `finalize_match` RPC

`SECURITY DEFINER` function, callable only by superadmins (checked internally via `is_superadmin()`). **Idempotent** — calling twice with the same or corrected scores produces the correct final state.

Call signature:
```sql
finalize_match(p_match_id UUID, p_home INT, p_away INT, p_penalty_winner UUID DEFAULT NULL)
```

After calling, the app does `revalidatePath('/leaderboard')` and `revalidatePath('/matches')`.

---

## Supabase client factories

| File | When to use |
|---|---|
| `lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |
| `lib/supabase/client.ts` | Client Components only (singleton) |
| `lib/supabase/admin.ts` | Server Actions that need service role (user creation only) — **never import in components** |

The `Database` type at `lib/supabase/types.ts` is hand-written (not generated). It must include `Relationships: []` on every table — required by `@supabase/supabase-js` `GenericTable` interface. Missing `Relationships` causes all table queries to return type `never`.

---

## Seed data notes

- Group-stage fixtures are seeded (72 matches across 12 groups, approximate UTC kickoff times).
- **Knockout fixtures are NOT seeded.** The superadmin inserts them via the admin UI once teams advance.
- Fixture data is approximate — the actual WC 2026 draw groups and exact kickoff times should be verified and corrected via a follow-up migration before go-live.
- Teams seed uses `flagcdn.com/w80/{country-code}.png` for flags (free, no API key).

---

## RLS policy summary

- `tournaments`, `teams`, `matches`: SELECT for any authenticated user; all mutations require `role = 'superadmin'`.
- `users_profiles`: users read/update their own row; leaderboard projection (id, display_name, total_points, exact_results_count) is readable by all authenticated users. `role` and points columns are never client-writable.
- `predictions`: users can SELECT/INSERT/UPDATE only their own rows. No DELETE exposed to clients.

---

## Route map

```
/                     → redirect to /matches
/auth/login           → login form
/auth/change-password → forced on first login
/matches              → prediction UI (phase-grouped tabs)
/leaderboard          → standings table
/admin                → redirect to /admin/results
/admin/results        → finalize match scores
/admin/users          → create users, list all users
```

---

## Key file locations

```
proxy.ts                                    ← auth/routing guard (NOT middleware.ts)
lib/scoring/score-prediction.ts             ← pure TS scoring fn
tests/scoring.test.ts                       ← 22 scoring unit tests
lib/supabase/types.ts                       ← hand-written Database type
lib/auth/get-user-profile.ts                ← getUserProfile(), requireSuperadmin()
app/(app)/matches/actions.ts                ← upsertPrediction server action
app/(app)/admin/results/actions.ts          ← finalizeMatchAction server action
app/(app)/admin/users/actions.ts            ← createUserAction (uses admin client)
supabase/migrations/                        ← all schema, RLS, triggers, RPC, seeds
```

---

## What's NOT in scope (MVP)

- Multiple tournaments
- Spanish locale (codebase structured for it — centralized copy in components, no hardcoded strings)
- Live match data
- Push notifications or emails
- Public sign-ups
- Knockout bracket auto-seeding
- E2E tests

---

## Deploy checklist (not yet done)

1. Create Supabase project, fill in `.env.local`
2. Run migrations: `supabase db push` or apply SQL files manually in order
3. Create superadmin: sign up via Supabase Auth dashboard, then set `role = 'superadmin'` in `users_profiles`
4. Verify fixture data matches actual WC 2026 draw; apply corrections via migration
5. Deploy to Vercel, set env vars, smoke test
