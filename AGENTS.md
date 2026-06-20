<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Quick Reference

- **Project:** Fut Score — FIFA World Cup 2026 prediction app (private, ~20 users)
- **Stack:** Next.js 16 App Router / React 19 / TypeScript / Tailwind CSS 4 / shadcn/ui / Supabase / Vitest
- **Port:** 3000

```bash
npm run dev          # Dev server on port 3000
npm run build        # Production build (also type-checks)
npm run lint         # ESLint
npm run test         # Vitest (watch)
npm run test:run     # Vitest (single run, use this to verify)
```

## Architecture

Load `docs/architecture.md` when the task touches:
- Route structure, layout, or page organization
- Auth flow, middleware, or role guards (`proxy.ts`)
- Supabase patterns (client vs server vs admin usage)
- Business rules (scoring, prediction lock, leaderboard)
- DB schema, RLS, triggers, or migrations

`proxy.ts` is the Next.js 16 middleware file (renamed from `middleware.ts`). It is the auth gate — check it first for any route access or redirect bugs.

## Hard Rules

- **Supabase client selection:** server components/actions → `lib/supabase/server.ts`; client components → `lib/supabase/client.ts`; admin ops → `lib/supabase/admin.ts` (server-only, never in client bundles)
- **`SUPABASE_SERVICE_ROLE_KEY`** must never appear in client-side code or be passed to the browser
- **Scoring logic** in `lib/scoring/score-prediction.ts` must stay in sync with the `finalize_match` Postgres RPC — change both together
- **DB schema changes** go into new migration files under `supabase/migrations/` — never edit existing migrations
- **RLS is the security layer** — never expose a write path that bypasses RLS without an explicit trigger or RPC
- **Mutations** go through Server Actions, not API route handlers (unless a route handler is strictly necessary)
- Class merging via `cn()` from `lib/utils.ts` — never manual string concatenation for Tailwind classes
- Toast notifications via Sonner (`sonner`) — not `alert()` or custom implementations
- Icons from `lucide-react` only
- No CSS modules or styled-components — Tailwind CSS only
- Path alias `@/*` maps to the project root

## Git Rules

- Divide implementation into logical slices; one commit per slice
- **Whether to commit automatically is specified per task in the plan** — if not stated, suggest commit messages but do not run them
- NEVER push, force-push, or delete remote branches — human only
- NEVER skip hooks (`--no-verify`)
- At end of implementation: always suggest a PR title + description

## AI Workflow

- **Methodology:** `docs/methodology.md`
- **Merge gate:** `docs/definition-of-done.md`
- `plan*.md` files are gitignored — local-only, never committed
- For non-trivial work: produce `plan.md` first, wait for human approval before implementing
- Satisfy every item in `docs/definition-of-done.md` before declaring work complete
