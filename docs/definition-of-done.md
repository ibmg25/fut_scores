# Definition of Done

Every item must be satisfied before declaring work complete.
If an item doesn't apply, state why. Claims must be **demonstrated** (ran the command, showed output).

## Code

- [ ] Implements the approved plan — nothing outside scope
- [ ] Build passes — `npm run build`, output clean
- [ ] Lint passes — `npm run lint`, output clean
- [ ] No new dependencies unless approved in the plan
- [ ] No secrets, credentials, or `.env` changes committed
- [ ] No dead code, commented-out blocks, or debug logging left behind
- [ ] `SUPABASE_SERVICE_ROLE_KEY` used only in server-side code (`lib/supabase/admin.ts` or Server Actions)

## Tests

- [ ] Scoring logic changes: `npm run test:run` passes, output shown
- [ ] New scoring cases have a corresponding Vitest spec in `tests/`
- [ ] (Bugfix) Regression test fails before fix, passes after

## Docs

- [ ] `docs/architecture.md` updated if structure, route protection, DB patterns, or business rules changed
- [ ] `AGENTS.md` updated only if a hard convention or command genuinely changed
- [ ] No stale docs left behind

## DB / Supabase

- [ ] Schema changes are in a new migration file under `supabase/migrations/` — never edited in-place
- [ ] RLS policies cover any new table or column exposed to clients
- [ ] `finalize_match` RPC and `lib/scoring/score-prediction.ts` stay in sync (same scoring logic)
- [ ] Migrations are idempotent (`ON CONFLICT DO NOTHING` / `IF NOT EXISTS`)

## Git & Handoff

- [ ] Implementation divided into logical slices; commits made or messages suggested (per plan's preference)
- [ ] Each commit message is descriptive and carries the "why" for non-obvious changes
- [ ] PR description provided: summary, non-obvious decisions, deviations from plan, follow-ups
- [ ] No pushed commits — human reviews locally before pushing
