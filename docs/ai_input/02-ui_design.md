# UI/UX Redesign Spec — Fut Score

## 1. Project Context

The app is a Next.js 16 (App Router) football match predictor. The tech stack is:

- **Tailwind CSS v4** — No `tailwind.config.ts` exists or should be created. All theme customisation is done in `app/globals.css` via CSS custom properties inside `:root` and `.dark` blocks, and mapped into Tailwind tokens via `@theme inline`. Do not add a `tailwind.config.ts`.
- **shadcn/ui** (style: `base-nova`, icon library: `lucide-react`) — All components are in `components/ui/`. When adding a new component always run `npx shadcn@latest add <component>` first; never write the component by hand.
- **Current state**: light-themed, desktop-biased top navbar, functional but plain.
- **Goal**: Dark-themed, mobile-first, modern football app feel with green accents.

### What must not be touched
The following are off-limits — do not modify, move, or delete:
- Everything under `supabase/` (migrations, seeds, config)
- Everything under `lib/scoring/`
- Everything under `lib/supabase/` (types, clients)
- `lib/auth/get-user-profile.ts`
- All `actions.ts` files — Server Action signatures and logic are frozen
- `proxy.ts` (middleware)
- `tests/`

---

## 2. Execution Order

Implement and verify one phase at a time. Do not start the next phase until the current one renders correctly at both mobile (375px) and desktop (1280px) widths.

---

## 3. Phase 1 — Dark Theme + Mobile-First Layout

### 3.1 Dark theme (`app/globals.css`)

The file already has `:root` (light) and `.dark` (dark) CSS variable blocks using oklch colors. **Replace the entire contents** of both blocks with the following palette. Do not remove `@theme inline`, the `@import` lines, or the `@layer base` block — only replace the variable values.

**`:root` (light mode — keep for reference but the app will always force dark):**
Keep the current light-mode values unchanged. The app uses forced dark mode (step 3.2), so the `:root` block is a fallback only.

**`.dark` block — replace values with this palette:**

| Token | Value | Purpose |
|---|---|---|
| `--background` | `oklch(0.13 0.008 240)` | Page background, near-black slate |
| `--foreground` | `oklch(0.94 0.005 240)` | Primary text, near-white |
| `--card` | `oklch(0.18 0.008 240)` | Card surface, slightly lighter than bg |
| `--card-foreground` | `oklch(0.94 0.005 240)` | Text on cards |
| `--popover` | `oklch(0.20 0.008 240)` | Dropdowns / popovers |
| `--popover-foreground` | `oklch(0.94 0.005 240)` | |
| `--primary` | `oklch(0.65 0.18 145)` | **Grass green** — accent, CTA buttons |
| `--primary-foreground` | `oklch(0.10 0.005 240)` | Dark text on green buttons |
| `--secondary` | `oklch(0.24 0.008 240)` | Secondary surface (e.g., muted buttons) |
| `--secondary-foreground` | `oklch(0.85 0.005 240)` | |
| `--muted` | `oklch(0.22 0.008 240)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.55 0.005 240)` | Placeholder text, captions |
| `--accent` | `oklch(0.24 0.008 240)` | Hover state surface |
| `--accent-foreground` | `oklch(0.94 0.005 240)` | |
| `--destructive` | `oklch(0.60 0.22 25)` | Error red |
| `--border` | `oklch(1 0 0 / 8%)` | Subtle border |
| `--input` | `oklch(1 0 0 / 10%)` | Input field border |
| `--ring` | `oklch(0.65 0.18 145)` | Focus ring = green |
| `--radius` | `0.75rem` | Slightly rounder than current |

Add these two extra tokens (not currently in the file) to the `.dark` block — they are used for the podium in Phase 3:
```css
--gold:   oklch(0.78 0.14 88);
--silver: oklch(0.70 0.01 240);
--bronze: oklch(0.62 0.10 52);
```

Map them in `@theme inline`:
```css
--color-gold:   var(--gold);
--color-silver: var(--silver);
--color-bronze: var(--bronze);
```

### 3.2 Force dark mode

In `app/layout.tsx`, add `dark` to the `<html>` className so the app is always dark:
```tsx
<html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
```

### 3.3 App shell layout (`app/(app)/layout.tsx`)

Replace the existing layout with a responsive shell that has:

**Mobile (< `md` breakpoint, i.e., < 768px):**
- No top navbar.
- Full-screen content area with `pb-20` bottom padding to clear the fixed bottom nav.
- A fixed `<BottomNav>` component at the bottom of the screen (see 3.4).

**Desktop (`md` and above):**
- A sticky top navbar (keep the existing design but reskin it for the dark theme — dark background, green logo accent, proper spacing).
- No bottom nav.
- Standard content padding.

Implementation pattern:
```tsx
// Server component — fetch profile here and pass isAdmin as prop to BottomNav
const profile = await getUserProfile()
const isAdmin = profile?.role === 'superadmin'
```

### 3.4 Bottom navigation bar (`components/features/BottomNav.tsx`)

New **client component**. Receives `isAdmin: boolean` as a prop (passed from the layout server component — do not fetch the profile inside this client component).

Behaviour:
- Fixed to bottom, full width, `z-50`, dark background (`bg-background border-t border-border`).
- Height: 64px (`h-16`).
- Items: **Matches** (`/matches`, `Trophy` icon), **Leaderboard** (`/leaderboard`, `BarChart3` icon), and **Admin** (`/admin`, `Settings` icon) — the Admin item is only rendered when `isAdmin === true`.
- Use `usePathname()` to detect the active route and apply the green accent color (`text-primary`) to the active item. Inactive items use `text-muted-foreground`.
- Each item is a vertical stack: icon above label text (`text-xs`).
- Tap target: each item must be at least 44×44px.
- No sign-out button in the bottom nav. Keep sign-out in the desktop top navbar only.

### 3.5 Auth pages (`app/(auth)/login/page.tsx`, `app/(auth)/change-password/page.tsx`)

Restyle for the dark theme (the layout component is separate from `(app)`, so these pages manage their own background). Replace the `bg-zinc-50` background with `bg-background`. The cards/forms should use the card token.

---

## 4. Phase 2 — Match Cards and Toast Feedback

### 4.1 Install Sonner (toast)

```bash
npx shadcn@latest add sonner
```

Add `<Toaster />` from `sonner` to `app/layout.tsx` (root layout, inside `<body>`) so toasts are globally available. Import `toast` from `sonner` in client components.

### 4.2 Redesign `MatchCard.tsx`

The card is already a client component using `useActionState`. Keep the `useActionState` hook and the Server Action reference unchanged — only change the visual layer and add toast calls.

**Card anatomy (redesigned):**

```
┌─────────────────────────────────────────────────┐
│  Wed, Jun 11 · 3:00 PM EDT          [Status badge]│
├─────────────────────────────────────────────────┤
│  🇲🇽 Mexico        [  ] – [  ]    South Africa 🇿🇦 │
│  (flag + name)    (inputs)         (name + flag) │
├─────────────────────────────────────────────────┤
│  [        Save Prediction        ]               │
│  (hidden when locked or finished)                │
└─────────────────────────────────────────────────┘
```

**Requirements:**
- Card background: `bg-card`, border: `border-border`, rounded: `rounded-xl`.
- Team names: `font-semibold text-sm`. Flags: `w-8 h-6 rounded-sm`.
- Score inputs: minimum **48×48px** tap target (`w-12 h-12 text-xl text-center`). `inputMode="numeric"`.
- The Save button spans the full card width and uses the `primary` (green) variant.

**Locked state** (match within 1 hour of kickoff OR finished):
- Card gets a subtle `opacity-75` and a `cursor-default` overlay.
- Show a `Lock` icon (lucide) next to the "Locked" badge.
- Inputs are `disabled`. No Save button.
- If the match is finished: show the official score in large bold text instead of inputs.

**Prediction result display** (after the match is finished and the user had a prediction):
- Below the official score, show: `"Your pick: X–Y · N pts"`.
- Color the points badge: green for 10, emerald for 5, yellow for 2, muted for 0.

**Toast integration:**
Remove the existing inline `{state.error && ...}` and `{state.success && ...}` text feedback. Replace with:
- On success (`state.success === true`): `toast.success('Prediction saved!')`
- On error (`state.error !== null`): `toast.error(state.error)`
- Button shows a `Loader2` spinning icon (`animate-spin`) while `pending === true`.

Use a `useEffect` watching `[state]` to fire the toasts:
```tsx
useEffect(() => {
  if (state.success) toast.success('Prediction saved!')
  else if (state.error) toast.error(state.error)
}, [state])
```

### 4.3 Group tabs (`MatchesByPhase.tsx`)

- The `TabsList` should scroll horizontally on mobile (`overflow-x-auto flex-nowrap`) rather than wrapping.
- Active tab: green underline / green text using `--primary`.
- Add a thin separator between tabs and content.

---

## 5. Phase 3 — Leaderboard Podium

### 5.1 Overview

The leaderboard page (`app/(app)/leaderboard/page.tsx`) is a server component. Refactor it so the data-fetching stays server-side but the presentation is split into:
- `<PodiumSection>` — server component — renders top 3.
- `<RankingList>` — server component — renders 4th place onwards.

### 5.2 Podium layout

Arrange 2nd, 1st, 3rd in this column order (2nd on the left, 1st in the center elevated, 3rd on the right):

```
         ┌──────────┐
         │  👑  1st │  ← tallest block (e.g., h-28)
 ┌──────┐│          │┌──────┐
 │  2nd ││          ││  3rd │
 └──────┘│          │└──────┘
─────────┴──────────┴──────────
```

Each podium slot contains:
- A circular avatar placeholder with the user's initials (use the first letter of `display_name`). Color: gold for 1st, silver for 2nd, bronze for 3rd.
- Display name (truncated).
- Points badge.
- Rank number (styled: `#1`, `#2`, `#3`).

The podium block heights: 1st = `h-28`, 2nd = `h-20`, 3rd = `h-16`. The blocks sit on a shared baseline to create the elevation effect.

Use `--color-gold`, `--color-silver`, `--color-bronze` CSS variables for the accent borders/rings.

If fewer than 3 users have points, gracefully degrade: show only the available entries in podium slots (left-to-right: 1st, 2nd, 3rd — skip empty slots rather than showing blank blocks).

### 5.3 Ranking list (4th+)

A clean card-based list (not a `<Table>`) for positions 4 and beyond:
- Each row: `#N  [initials avatar]  Name  ···  Points`
- Subtle dividers between rows.
- Highlight the current user's row with a green left border (`border-l-2 border-primary`).
- If the current user is in the top 3, still show all rows below from position 4 but add a subtle sticky row at the bottom of the list: `"You are in the top 3!"`.
- If there are no entries below 3rd place, show nothing (no empty state needed for this section).

### 5.4 Empty state

If there are no profiles at all (or all have 0 points), show a centered card:
```
  🏆
  No scores yet.
  Check back after the first matches are finalized.
```

---

## 6. Component & File Checklist

### New files to create
| File | Purpose |
|---|---|
| `components/features/BottomNav.tsx` | Fixed mobile navigation bar |
| `components/features/PodiumSection.tsx` | Top-3 podium display |
| `components/features/RankingList.tsx` | 4th-place+ ranking list |
| `components/features/PlayerAvatar.tsx` | Initials avatar, reused in podium and ranking |

### Files to modify
| File | Change |
|---|---|
| `app/globals.css` | Replace `.dark` token values; add gold/silver/bronze; force dark |
| `app/layout.tsx` | Add `dark` class to `<html>`; add `<Toaster />` |
| `app/(app)/layout.tsx` | Responsive shell: top nav on desktop, bottom nav on mobile |
| `app/(auth)/login/page.tsx` | Restyle for dark theme |
| `app/(auth)/change-password/page.tsx` | Restyle for dark theme |
| `app/(app)/matches/page.tsx` | No logic changes; verify it still compiles |
| `app/(app)/leaderboard/page.tsx` | Replace table with podium + ranking list |
| `components/features/MatchCard.tsx` | Redesigned card, toast integration, locked state |
| `components/features/MatchesByPhase.tsx` | Horizontal-scroll tabs |

### shadcn components to install before use
```bash
npx shadcn@latest add sonner
```
All other required components (`badge`, `button`, `input`, `tabs`, `card`, `select`, `table`) are already installed.

---

## 7. Quality Gates

Before marking any phase complete:
1. The app renders without TypeScript errors (`next build` should pass).
2. Mobile (375px): no horizontal scroll on any page; bottom nav visible and not overlapping content; all tap targets ≥ 44px.
3. Desktop (1280px): bottom nav hidden; top navbar visible; layout centred at `max-w-4xl`.
4. Dark theme applied everywhere, including auth pages.
5. Prediction saving still works (Server Action round-trip is unchanged).
6. Admin panel retains its full functionality.
7. The `<Toaster />` fires correctly on prediction save success and DB-level lock rejection.
