# Prompt Template

Use this template when writing a task prompt for the AI.
Match the process weight to the task size — see `docs/methodology.md`.

> **Trivial tasks** (typo, style tweak, < 20 lines, one file): skip the template, write a direct instruction.

---

## Template

```
# [Task Title]

**Type:** feature | bugfix | refactor
**Size:** trivial | standard | large

## What & Why
<!-- One sentence: what this changes and why it's needed now. -->

## Context
<!-- Relevant files, routes, DB tables, or components the AI should know about.
     Current behavior if it's a change to something that already exists. -->

## Acceptance Criteria
<!-- Bulleted list of what "done" looks like from a user perspective.
     For bugfixes: replace this section with the Bugfix block below. -->
- 
- 

## Out of Scope
<!-- What this task explicitly does NOT touch. Forces a focused PR. -->
-

## DB Changes  ← remove if no DB work
<!-- Describe the schema change needed (new table, column, RLS policy, trigger).
     The AI will write the migration — never edit existing migration files. -->

## Process
- Plan: produce `plan.md` and wait for my approval before writing any code  ← remove if trivial
- Commits: suggest messages only | auto-commit after each slice  ← pick one
- Update `docs/architecture.md` if structure, routes, or business rules change
- Before declaring done: load `docs/definition-of-done.md`, run `npm run build`, `npm run lint`, `npm run test:run`, show output
- At the end: suggest a PR title and description
```

---

## Bugfix variant — replace Acceptance Criteria with:

```
## Bug
**Current behavior:** [what actually happens]
**Expected behavior:** [what should happen]
**Steps to reproduce:** [minimal steps]

## Root Cause Hypothesis
<!-- Your best guess. The AI will confirm or correct before touching code. -->
```

---

## Example — Standard Feature

```
# Player profile page

**Type:** feature
**Size:** standard

## What & Why
Add a `/players/[id]` page so users can view a player's prediction history for the current tournament.

## Context
- New route under `app/(app)/players/[id]/`
- Data comes from the `predictions` table joined to `matches` and `users_profiles`
- `predictions` RLS: users can only SELECT their own rows — the profile page is self-only for now

## Acceptance Criteria
- Navigating to `/players/[id]` shows the user's display name and a list of their predictions
- Each prediction row shows: match (teams + kickoff), predicted score, actual score (if finished), points earned
- Predictions are sorted chronologically by kickoff time
- If `[id]` is not the logged-in user, redirect to `/home` (no cross-user viewing in MVP)

## Out of Scope
- Admin view of other users' predictions
- Pagination (total predictions per user is bounded by ~104 matches)

## Process
- Plan: produce `plan.md` and wait for my approval before writing any code
- Commits: auto-commit after each slice
- Update `docs/architecture.md` if structure or business rules change
- Before declaring done: load `docs/definition-of-done.md`, run `npm run build`, `npm run lint`, `npm run test:run`, show output
- At the end: suggest a PR title and description
```
