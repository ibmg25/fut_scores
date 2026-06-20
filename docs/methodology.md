# AI-Assisted Development Methodology

## Principle

Precision beats brevity. Ambiguity is the most expensive thing in this workflow.
Give the AI only the context it needs — the right docs, not all docs.

## Workflow

1. **Write a prompt** describing the task clearly (goal, constraints, acceptance criteria).
2. **Ask AI to produce `plan.md`** — explore and propose, do NOT implement yet.
3. **Review the plan** — this is the highest-value human step. Iterate until the approach is right.
4. **Approve → fresh session implements** against the approved plan.
5. **Review the diff** — check against `docs/definition-of-done.md` before declaring done.
6. **Merge** — `plan*.md` is discarded (gitignored); PR description captures the outcome.

## Sizing — match process weight to risk

| Change type | Process |
|---|---|
| Trivial (typo, style, < 20 lines, one file) | One-shot. No plan. Just review the diff. |
| Standard (few files, one concern) | Prompt + `plan.md` + normal review. |
| Large / cross-cutting (DB schema, auth, scoring) | Full process. Thorough plan review. |

A good task is **one concern, reviewable as one small PR**. If it touches unrelated concerns, split it.

## Session Discipline

- Plan in one session, implement in a fresh one — long sessions degrade quality.
- `plan.md` is the clean handoff artifact between sessions.
- Load only the docs the task needs:
  - `AGENTS.md` loads automatically (always).
  - `docs/architecture.md` — load when the task touches structure, auth flow, or DB patterns.
  - `docs/definition-of-done.md` — load before declaring work complete.
  - `docs/ai_input/01-initial_plan.md` — load only if you need the original spec for context.

## Git Discipline

- Divide implementation into logical slices; one commit per slice.
- **Whether to commit automatically** is specified per task in the plan — if not stated, suggest commit messages but do not run them.
- Commit messages carry the "why" for non-obvious changes.
- At end of implementation, always suggest a PR title + description.
- **HUMAN-ONLY operations — AI must never execute:**
  - `git push` (any form)
  - `git push --force` / `--force-with-lease`
  - Any operation that affects the remote repository
- If undoing local work: prefer `git revert` over `git reset --hard`.
