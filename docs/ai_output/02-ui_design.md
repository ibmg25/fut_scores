# Fut_Score — UI/UX Redesign Reference

## What this task did

Transformed a functional but plain light-themed, desktop-biased layout into a dark-themed, mobile-first football app. Three phases were implemented in order: (1) dark palette + shell layout, (2) match card redesign + toast feedback, (3) leaderboard podium.

---

## Tailwind CSS v4 — critical constraints

This project uses **Tailwind v4**. There is no `tailwind.config.ts` and one must never be created.

- All theme customisation lives in `app/globals.css`.
- Custom tokens are declared as CSS custom properties inside `:root` / `.dark` blocks.
- They are mapped into Tailwind utility classes via the `@theme inline { }` block in the same file.
- Adding a new design token requires **two edits**: the CSS variable in the `.dark` block, and a `--color-<name>: var(--<name>)` line inside `@theme inline`.

The gold/silver/bronze tokens for the podium follow this exact pattern:

```css
/* in .dark block */
--gold: oklch(0.78 0.14 88);

/* in @theme inline block */
--color-gold: var(--gold);
```

Then usable as `bg-gold`, `text-gold`, `ring-gold`, etc.

---

## Dark palette

The app is **always dark** — `dark` class is forced on `<html>` in `app/layout.tsx`. The `:root` block (light mode) is kept as a fallback only; it is never active.

| Role | Token | Value |
|---|---|---|
| Page background | `--background` | `oklch(0.13 0.008 240)` — near-black slate |
| Card surface | `--card` | `oklch(0.18 0.008 240)` — slightly lighter than bg |
| Primary / accent | `--primary` | `oklch(0.65 0.18 145)` — grass green |
| Primary text on green | `--primary-foreground` | `oklch(0.10 0.005 240)` — near-black |
| Focus ring | `--ring` | same green as `--primary` |
| Border | `--border` | `oklch(1 0 0 / 8%)` — very subtle white |
| Radius | `--radius` | `0.75rem` (slightly rounder than the shadcn default) |

**When restyling components:** replace `bg-white` → `bg-card`, `border-zinc-200` → `border-border`, `text-zinc-500` → `text-muted-foreground`, `text-zinc-600` → `text-muted-foreground`, `hover:text-zinc-900` → `hover:text-foreground`, `rounded-lg` → `rounded-xl` to match the radius token.

---

## App shell layout

Two navigation modes coexist in `app/(app)/layout.tsx`:

| Breakpoint | Navigation |
|---|---|
| `< md` (< 768px) | No top navbar. Fixed `<BottomNav>` at bottom (`h-16`, `z-50`). Content has `pb-24` to clear it. |
| `≥ md` | Sticky top navbar (`bg-card`, dark). No bottom nav. |

The layout is a server component — it fetches the user profile once and passes `isAdmin: boolean` as a prop to `<BottomNav>`. The client component never fetches the profile itself.

---

## BottomNav

**File:** `components/features/BottomNav.tsx`

- Client component, receives `isAdmin: boolean`.
- Uses `usePathname()` for active-route detection (`pathname.startsWith(href)`).
- Admin item rendered only when `isAdmin === true`.
- Active item: `text-primary` (green). Inactive: `text-muted-foreground`.
- Tap target: each item is `flex-1` with `min-h-[44px] min-w-[44px]` — meets the 44×44px minimum.
- Hidden on desktop via `md:hidden`.

---

## Toaster (Sonner)

Installed via `npx shadcn@latest add sonner`. The shadcn wrapper at `components/ui/sonner.tsx` uses `useTheme` from `next-themes`, but this project has no `ThemeProvider`. To avoid it defaulting to "system" (which could render light toasts), `theme="dark"` is passed explicitly in `app/layout.tsx`:

```tsx
<Toaster theme="dark" />
```

Toast calls in `MatchCard.tsx` are fired from a `useEffect` watching `[state]` (the `useActionState` return value), not inline in the render. This avoids React render-phase side effects:

```tsx
useEffect(() => {
  if (state.success) toast.success('Prediction saved!')
  else if (state.error) toast.error(state.error)
}, [state])
```

---

## MatchCard structure

The card uses a single `<form>` when the match is open, wrapping both the score inputs and the full-width Save button. This avoids the need for `form` attribute cross-referencing between a hidden form and an external button.

When locked or finished, the form is omitted entirely. The locked state shows:
- `opacity-75 cursor-default` on the outer card.
- A `Lock` icon (lucide) inside the status badge.
- Finished: official score in `text-2xl font-bold`; prediction result below with colour-coded points badge.
- Pre-kickoff locked: the predicted scores are shown in read-only boxes (not editable inputs).

Points badge colours (dark-friendly):

| Points | Class |
|---|---|
| 10 | `text-green-400` |
| 5 | `text-emerald-400` |
| 2 | `text-yellow-400` |
| 0 | `text-muted-foreground` |

---

## MatchesByPhase — horizontal tabs

`TabsList` changed from `flex-wrap` to `flex-nowrap overflow-x-auto` so tabs scroll horizontally on mobile instead of wrapping. Each trigger has `shrink-0` to prevent compression. A `border-t border-border` separator sits between the tab list and the content area.

---

## Leaderboard podium

Three new components, all server components:

| File | Purpose |
|---|---|
| `components/features/PlayerAvatar.tsx` | Initials avatar; rank `1/2/3` applies gold/silver/bronze ring via CSS variable |
| `components/features/PodiumSection.tsx` | Column order is 2nd–1st–3rd (left to right), with 1st elevated. 1st gets a 👑 emoji above. |
| `components/features/RankingList.tsx` | 4th-place+ card list; current user gets `border-l-2 border-l-primary` highlight |

**Podium column order decision:** The visual convention for podiums is 2nd on the left, 1st in the centre (tallest block), 3rd on the right. The data comes in rank order `[1st, 2nd, 3rd]` but the display order remaps it to `[2nd, 1st, 3rd]` via a `displayOrder = [2, 1, 3]` mapping in `PodiumSection`.

**Graceful degradation:** If fewer than 3 users have entries, `top3[rank - 1] ?? null` is checked and `null` slots are skipped — no empty block is rendered.

**Empty state trigger:** The page shows the empty state when `profiles` is empty *or* when all users have `total_points === 0`. This avoids a pointless podium of zeroes at tournament start.

---

## Admin panel — restyling notes

The admin pages were originally unstyled (light-mode `bg-white`, `border-zinc-200`, etc.). All hardcoded light-theme classes were replaced with design tokens. Key replacements:

| Old | New |
|---|---|
| `bg-white rounded-lg border border-zinc-200` | `bg-card rounded-xl border border-border` |
| `text-zinc-500 / text-zinc-600` | `text-muted-foreground` |
| `hover:text-zinc-900` | `hover:text-foreground` |
| Amber success box (light bg) | `bg-yellow-500/10 border-yellow-500/30` with `text-yellow-400` heading |
| `text-amber-600` (temp password) | `text-yellow-500` |
| `text-green-600` (active status) | `text-primary` (green token) |

The temp-password reveal box previously used solid amber light-mode colours (`bg-amber-50`, `text-amber-800`). These were replaced with a translucent yellow tint (`yellow-500/10`, `yellow-500/30`) that works on the dark background, avoiding the jarring white box.

---

## Files modified / created

```
app/globals.css                              ← dark palette, gold/silver/bronze tokens
app/layout.tsx                               ← forces dark class on <html>, adds <Toaster>
app/(app)/layout.tsx                         ← responsive shell (top nav desktop / bottom nav mobile)
app/(auth)/login/page.tsx                    ← bg-background, text-primary logo, text-muted-foreground
app/(auth)/change-password/page.tsx          ← same auth page dark treatment
app/(app)/leaderboard/page.tsx               ← replaced table with PodiumSection + RankingList
app/(app)/admin/layout.tsx                   ← dark nav links, dark border
app/(app)/admin/results/page.tsx             ← dark card tokens throughout
app/(app)/admin/results/finalize-match-form.tsx ← dark card, muted separators/labels
app/(app)/admin/users/page.tsx               ← dark table wrapper, muted text, token status colours
app/(app)/admin/users/create-user-form.tsx   ← dark-compatible temp-password reveal box
components/features/BottomNav.tsx            ← NEW: fixed mobile bottom navigation
components/features/PlayerAvatar.tsx         ← NEW: initials avatar with rank ring colours
components/features/PodiumSection.tsx        ← NEW: top-3 podium (2nd–1st–3rd columns)
components/features/RankingList.tsx          ← NEW: 4th+ ranking card list
components/features/MatchCard.tsx            ← redesigned card, toast, locked state, points colours
components/features/MatchesByPhase.tsx       ← horizontal-scroll tabs, border separator
components/ui/sonner.tsx                     ← added by shadcn CLI (do not hand-edit)
```

---

## What was intentionally left untouched

Per spec, these files were not modified:

- `supabase/` — all migrations and seeds
- `lib/scoring/` — pure TS scoring function and tests
- `lib/supabase/` — types, server/client/admin factories
- `lib/auth/get-user-profile.ts`
- All `actions.ts` files — server action signatures and logic are frozen
- `proxy.ts` — auth/routing middleware
- `tests/`
