# Technical Specification & Implementation Guide: Fut_Score (Pro Predictor Web App)

## 1. Project Overview
A serverless web application for predicting football match results. The MVP targets a private group (<20 users) for the **FIFA World Cup 2026**, but the architecture is designed by senior-engineering standards to scale to future tournaments, additional scoring rules, and larger user bases.

**Timeline constraint:** The World Cup 2026 starts on **June 11, 2026**. The MVP must be production-ready before that date.

**Language:** UI is **English-only** for the MVP. The codebase must be structured so a Spanish locale can be added later (centralized copy, no hardcoded strings in components where avoidable).

## 2. Tech Stack & Infrastructure
*   **Frontend & API:** Next.js (App Router, TypeScript, React Server Components, Server Actions).
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Row Level Security, Postgres Triggers, Postgres Functions).
*   **Styling:** Tailwind CSS + shadcn/ui.
*   **Testing:** Vitest for unit tests (scoring logic is the priority).
*   **Data Strategy:** No external APIs in the MVP. Teams and the full WC 2026 fixture list are loaded via idempotent SQL seed migrations checked into the repo.
*   **Hosting (frontend):** Cloudflare Pages, Vercel, or Netlify — final choice deferred. The Next.js app must avoid features that lock us to a single host (e.g., prefer the Edge runtime where reasonable, no Vercel-specific image optimizer assumptions).
*   **Hosting (backend):** Supabase managed Postgres + Auth.

### 2.1 Environment Variables
*   `NEXT_PUBLIC_SUPABASE_URL` — public, browser-safe.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public, browser-safe, RLS-gated.
*   `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, never exposed to the client. Used exclusively by Server Actions that create users.

## 3. Database Architecture

All timestamps are `TIMESTAMPTZ` and stored in UTC. All IDs are `UUID` (default `gen_random_uuid()`) unless otherwise noted. All `INSERT/UPDATE` mutations are gated by RLS.

### 3.1 Schema

```
tournaments
  id              UUID PK
  name            TEXT NOT NULL
  year            INT  NOT NULL
  is_active       BOOLEAN NOT NULL DEFAULT FALSE
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()

teams
  id              UUID PK
  name            TEXT NOT NULL UNIQUE
  flag_url        TEXT
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()

match_phase (ENUM)
  values: 'group_a' .. 'group_l', 'r32', 'r16', 'qf', 'sf', 'third_place', 'final'

match_status (ENUM)
  values: 'pending', 'finished'

matches
  id                       UUID PK
  tournament_id            UUID NOT NULL REFERENCES tournaments(id)
  home_team_id             UUID NOT NULL REFERENCES teams(id)
  away_team_id             UUID NOT NULL REFERENCES teams(id)
  kickoff_time             TIMESTAMPTZ NOT NULL
  phase                    match_phase NOT NULL
  home_score               INT  NULL    -- score at end of 90/120 min
  away_score               INT  NULL    -- score at end of 90/120 min
  penalty_winner_team_id   UUID NULL REFERENCES teams(id)  -- set only if decided on penalties
  status                   match_status NOT NULL DEFAULT 'pending'
  results_set_by           UUID NULL REFERENCES auth.users(id)  -- audit
  results_set_at           TIMESTAMPTZ NULL                      -- audit
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
  CHECK (home_team_id <> away_team_id)
  CHECK (status = 'pending' OR (home_score IS NOT NULL AND away_score IS NOT NULL))
  CHECK (penalty_winner_team_id IS NULL
         OR penalty_winner_team_id IN (home_team_id, away_team_id))

user_role (ENUM)
  values: 'user', 'superadmin'

users_profiles
  id                       UUID PK REFERENCES auth.users(id) ON DELETE CASCADE
  display_name             TEXT NOT NULL
  role                     user_role NOT NULL DEFAULT 'user'
  must_change_password     BOOLEAN NOT NULL DEFAULT TRUE
  total_points             INT NOT NULL DEFAULT 0           -- denormalized, maintained by trigger
  exact_results_count      INT NOT NULL DEFAULT 0           -- tiebreaker, maintained by trigger
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()

predictions
  id                       UUID PK
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
  match_id                 UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE
  predicted_home_score     INT NOT NULL CHECK (predicted_home_score >= 0)
  predicted_away_score     INT NOT NULL CHECK (predicted_away_score >= 0)
  points_earned            INT NOT NULL DEFAULT 0
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
  UNIQUE (user_id, match_id)
```

Index suggestions: `matches(tournament_id, kickoff_time)`, `matches(status)`, `predictions(match_id)`, `predictions(user_id)`.

### 3.2 RLS Policies

*   `tournaments`, `teams`, `matches`: `SELECT` allowed for any authenticated user. `INSERT/UPDATE/DELETE` only when `auth.uid()` has `role = 'superadmin'` in `users_profiles`.
*   `users_profiles`: each user can `SELECT` their own row plus a public projection (id, display_name, total_points, exact_results_count) of all rows for the leaderboard. `UPDATE` allowed on `display_name` and `must_change_password` for their own row only. `role` and points columns are never client-writable.
*   `predictions`: `SELECT` only where `auth.uid() = user_id`. `INSERT/UPDATE` only where `auth.uid() = user_id`. `DELETE` not exposed to clients.

### 3.3 Database Triggers (Source of Truth)

1.  **`enforce_prediction_lock`** — `BEFORE INSERT OR UPDATE ON predictions`. Looks up `matches.kickoff_time` for the row and raises an exception if `now() >= kickoff_time - interval '1 hour'`. This is the authoritative lock; the UI is decorative.
2.  **`maintain_predictions_updated_at`** — `BEFORE UPDATE ON predictions`. Sets `updated_at = now()`.
3.  **`recompute_user_aggregates`** — `AFTER INSERT OR UPDATE OF points_earned ON predictions`. Recomputes the affected user's `total_points` and `exact_results_count` in `users_profiles` (full sum from the user's predictions — keep it simple at this scale).

### 3.4 Postgres RPC: `finalize_match(match_id, home_score, away_score, penalty_winner_team_id)`

A `SECURITY DEFINER` function callable only by superadmins (checked inside the function via `auth.uid()` lookup). Steps:

1.  Validate scores (non-negative integers; `penalty_winner_team_id` must be `home_team_id` or `away_team_id` of this match, or NULL; for group-stage `phase`, `penalty_winner_team_id` MUST be NULL).
2.  Update the `matches` row: set scores, set `penalty_winner_team_id`, set `status = 'finished'`, set `results_set_by` and `results_set_at`.
3.  Iterate over every `predictions` row for this `match_id` and recompute `points_earned` using the scoring algorithm in §4.5. **The function must be idempotent**: calling it twice (or correcting a score later) produces the correct final state without double-counting.
4.  The `recompute_user_aggregates` trigger fires per affected row and updates leaderboards.
5.  Returns the count of predictions scored.

## 4. Core Features & Business Logic

### 4.1 Authentication & Authorization

*   **System:** Supabase Auth (Email/Password).
*   **User creation flow (temp password):**
    1.  Superadmin uses a server-only admin form. The Server Action calls Supabase Admin API (`auth.admin.createUser`) with the user's email and a **randomly generated temporary password**, `email_confirm: true`.
    2.  The same Server Action inserts a `users_profiles` row with `must_change_password = TRUE` and the supplied `display_name`.
    3.  The superadmin shares the email + temp password with the user out-of-band.
*   **First-login flow:** After successful sign-in, the app checks `users_profiles.must_change_password`. If true, the user is redirected to `/auth/change-password` and **cannot access any other route** until they set a new password. On success, the Server Action calls `supabase.auth.updateUser({ password })` and sets `must_change_password = FALSE`.
*   **Authorization:** `superadmin` is determined by `users_profiles.role`. Server-side guards on `/admin/**` routes; never rely on client checks.

### 4.2 Timezone & DateTime Handling
*   **Storage:** All times in DB are UTC (`TIMESTAMPTZ`).
*   **Lock checks:** All time comparisons happen in Postgres (`now()` is UTC) — never trust client time.
*   **Display:** Server Components render ISO strings; a small client component formats them with `Intl.DateTimeFormat` using the browser's locale and timezone. `date-fns` (with `date-fns-tz`) is allowed for relative-time helpers.

### 4.3 Prediction Lock Mechanism (1 Hour Rule)
*   **Source of truth:** the `enforce_prediction_lock` trigger (§3.3). Any insert/update attempted within 1 hour of kickoff is rejected at the DB layer.
*   **UI:** Reads `kickoff_time` and disables inputs once `now() >= kickoff_time - 1h`, showing a "Locked" badge. The Server Action that writes the prediction wraps the DB call and surfaces the trigger's error as a user-friendly message.

### 4.4 Superadmin Panel
*   Protected route `/admin` — server-side guard rejects non-superadmins.
*   **Match results form:** input final 90/120-min `home_score` and `away_score`; for knockout phases, an optional `penalty_winner_team_id` dropdown limited to the two teams. Submits to the `finalize_match` RPC.
*   **User management:** create new users (per §4.1 flow). List existing users with their email, role, and points.
*   After a successful `finalize_match`, the action calls `revalidatePath('/leaderboard')` and `revalidatePath('/matches')` so the public views refresh.

### 4.5 The Scoring System (Hierarchical & Mutually Exclusive)

For a given match with official `home_score`, `away_score` (at 90/120 min) and optional `penalty_winner_team_id`, each prediction is evaluated in this strict order and awarded **only the first matching tier**:

1.  **Exact Result — 10 points.** `predicted_home_score == home_score AND predicted_away_score == away_score`.
2.  **Goal Difference — 5 points.** Not exact, but `(predicted_home_score - predicted_away_score) == (home_score - away_score)`.
3.  **Winner / Tie — 2 points.** Not exact, not same diff, but the predicted outcome matches the official outcome:
    *   Predicted outcome is derived from the prediction scores: home > away → "home wins"; home < away → "away wins"; home == away → "tie".
    *   **Official outcome:**
        *   In **group-stage** matches: derived from `home_score` vs `away_score` (ties allowed).
        *   In **knockout** matches: if `penalty_winner_team_id IS NOT NULL`, the official outcome is "home wins" or "away wins" based on which team advanced via penalties (even though the regulation score was a tie). Otherwise it is derived from the score as in the group stage.
4.  **Failure — 0 points.** None of the above.

**No prediction submitted = no row in `predictions` = 0 points credited.** The leaderboard simply does not add to a user for matches they skipped.

**Re-scoring:** If a superadmin re-runs `finalize_match` with corrected scores, every existing prediction for that match is re-evaluated. The function overwrites `points_earned`, and the aggregates trigger recomputes user totals — no double counting.

### 4.6 Leaderboard
*   Server-rendered route `/leaderboard`. Reads `users_profiles` and orders by `total_points DESC, exact_results_count DESC, display_name ASC`.
*   Refreshed via `revalidatePath('/leaderboard')` triggered by the admin's `finalize_match` action. No Supabase Realtime — the page is static between match finalizations.

### 4.7 UX/UI Guidelines
*   **Match presentation:** matches grouped by phase (group letter or knockout round) using shadcn `Tabs` or `Accordion`. Within each group, ordered by `kickoff_time` ASC.
*   **Status badges:** "Open", "Locked", "Finished". ("Live" is out of scope for the MVP — we have no live data feed.)
*   **Mobile-first:** large tap targets, numeric keyboards on score inputs (`inputMode="numeric"`), prediction form fits on one mobile viewport.
*   **Empty states:** every list has a clear empty state.

### 4.8 Testing (Minimal Coverage)
*   **Unit tests (Vitest)** for the scoring algorithm as a **pure TypeScript function** that mirrors the Postgres implementation. Required cases:
    *   Exact result, including 0-0.
    *   Goal difference positive, negative, and zero (predicted tie matching actual tie at a different score, e.g., 2-2 vs 1-1).
    *   Winner predicted correctly (home, away).
    *   Tie predicted correctly in a group match.
    *   Knockout match decided on penalties: predicted tie → 0 from winner tier (but 10 if exact score, 5 if same diff); predicted winning team correctly → 2.
    *   Wrong outcome → 0.
*   The pure TS scoring function is also used by the UI to preview "what would I score if the match ended X-Y" (nice-to-have, low cost).
*   No E2E tests in the MVP.

## 5. Initial Data Seeding

*   **Location:** `supabase/migrations/` (versioned, idempotent).
*   **Required seeds:**
    1.  One `tournaments` row: `{ name: 'FIFA World Cup', year: 2026, is_active: true }`.
    2.  All 48 participating teams in `teams` (name + flag URL).
    3.  All ~104 fixtures in `matches` with correct `kickoff_time` (UTC), `phase`, and team references.
*   **Idempotency:** use `INSERT ... ON CONFLICT DO NOTHING` keyed on natural keys (e.g., team name; `(tournament_id, home_team_id, away_team_id, kickoff_time)` for matches).
*   Knockout matches whose teams are not yet known are seeded with placeholder rows? **No** — for the MVP, knockout fixtures are inserted by the superadmin via the admin UI once teams are known, or via a follow-up migration. Document this in the README.

## 6. Repository Structure (target)
```
/app                  # Next.js App Router
  /(auth)             # login, change-password
  /(app)
    /matches
    /leaderboard
    /admin
  /api                # only if a route handler is genuinely needed
/components
  /ui                 # shadcn-generated
  /features
/lib
  /supabase           # server + client factories
  /scoring            # pure TS scoring fn + tests
  /datetime
/supabase
  /migrations         # schema + RLS + triggers + RPC + seed data
/tests                # Vitest
```

## 7. Execution Plan for Claude Code

Each step ends in a working, committable state.

1.  **Bootstrap.** Initialize Next.js (App Router, TS, Tailwind), install shadcn/ui, set up Vitest, configure `.env.local` placeholders, scaffold the repo structure in §6.
2.  **Database.** Author `supabase/migrations/` containing: enums, tables, indexes, RLS policies, the three triggers, and the `finalize_match` RPC. Verify with a local Supabase instance.
3.  **Seed data.** Write idempotent migrations for the tournament row, the 48 teams, and the group-stage fixtures with correct UTC kickoff times.
4.  **Auth.** Implement login, the temp-password / `must_change_password` redirect flow, and the server-side superadmin guard. Implement the superadmin "create user" Server Action using the Admin API.
5.  **Scoring (pure TS).** Implement and unit-test the scoring function in `/lib/scoring`. Tests must cover every case in §4.8 before moving on.
6.  **Matches & predictions UI.** Build the matches list (grouped by phase), the prediction form with the UI-level lock, and the Server Action that writes to `predictions` (handling the trigger error gracefully).
7.  **Admin panel.** Build `/admin` with the user-creation form and the match-finalization form that calls `finalize_match` and revalidates the leaderboard + matches routes.
8.  **Leaderboard.** Build the server-rendered leaderboard with the tiebreaker ordering from §4.6.
9.  **Polish.** Status badges, empty states, mobile pass, basic error boundaries.
10. **Deploy.** Pick the host (Cloudflare Pages / Vercel / Netlify), wire env vars, deploy, smoke test with a real superadmin account.

## 8. Out of Scope (MVP)
*   Multiple concurrent tournaments.
*   Multiple languages (Spanish UI deferred to v2).
*   Live match data / live scores.
*   Push notifications, emails.
*   Public sign-ups (invite-only via superadmin).
*   Audit log beyond `results_set_by` / `results_set_at` on `matches`.
