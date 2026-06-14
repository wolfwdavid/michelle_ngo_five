---
phase: 01-foundation-data-reuse-proven-deploy
plan: 03
subsystem: design-system
tags: [tailwind-v4, oklch, dark-theme, accessibility, reduced-motion, svelte5-runes]

# Dependency graph
requires:
  - phase: 01-foundation-data-reuse-proven-deploy (Plan 01)
    provides: scaffolded SvelteKit + Tailwind v4 toolchain, placeholder app.css, +layout.svelte importing app.css
  - phase: 01-foundation-data-reuse-proven-deploy (Plan 02)
    provides: "$lib/data barrel (Category type, CATEGORIES array) consumed by categoryAccent map + test"
provides:
  - "dark cinematic token system in src/app.css: near-black canvas, color-scheme:dark, base typography/spacing"
  - "8 OKLCH per-category accent tokens (--color-cat-*) AA-documented on oklch(0.16 0 0)"
  - "thick high-contrast :focus-visible ring (light outline + dark halo for over-thumbnail contrast)"
  - "scrim token/utility (--scrim, .scrim) for legible text over thumbnails"
  - "verbatim Category -> text-cat-* literal accent map (Tailwind-scanner-safe) via categoryAccent()"
  - "single shared SSR-safe reduced-motion gate: prefersReducedMotion at $lib/state/motion.svelte.ts"
affects: [rails-home, hero-parallax, watch-page, work-browse, pbs-landing, top-nav, footer]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tailwind v4 @theme --color-cat-* vars auto-generate text-cat-*/bg-cat-* utilities; literal class strings in source keep the scanner from dropping them"
    - "Single shared reduced-motion gate (runes module, .svelte.ts) as the one source for all motion — never per-component matchMedia"
    - "SSR-safe gate pattern: typeof window guard -> motion-allowed default during prerender, reactive matchMedia listener on client"
    - "Design tokens made explicit as CSS custom props (canvas/ink/focus/scrim/type) instead of leaning on Tailwind utility defaults"

key-files:
  created:
    - src/lib/state/motion.svelte.ts
    - src/lib/state/motion.svelte.test.ts
    - src/lib/components/categoryAccent.ts
    - src/lib/components/categoryAccent.test.ts
  modified:
    - src/app.css
    - vite.config.ts

key-decisions:
  - "Made the sibling's implicit Tailwind-utility tokens explicit CSS custom props (canvas/ink/focus/scrim/type) so the dark system is self-describing — extends the verbatim port rather than copying it blindly"
  - "Reduced-motion gate is zero-dependency (no runed) — a hand-rolled matchMedia gate is sufficient for v1 and adds nothing to the bundle (FND-06)"
  - "Focus ring pairs a light outline with a dark box-shadow halo so it stays visible on pure black AND over bright poster thumbnails (DSGN-03)"

metrics:
  duration_min: 4
  tasks: 2
  files_created: 4
  files_modified: 2
  completed: "2026-06-14"
---

# Phase 1 Plan 3: Design Tokens & Reduced-Motion Utility Summary

Locked the dark cinematic design system (near-black OKLCH canvas, 8 AA-tuned per-category accents, a thick over-thumbnail-safe focus-visible ring, and a scrim convention) and built the single SSR-safe `prefersReducedMotion` gate that all later motion will read from.

## What Was Built

**Task 1 — shared reduced-motion gate (FND-06, NEW):** `src/lib/state/motion.svelte.ts`, a Svelte 5 runes module exporting `prefersReducedMotion` with a `.current` boolean getter. SSR-safe: a `typeof window`/`matchMedia` guard returns motion-allowed (`current === false`) during prerender so static HTML is identical to the animated path; on the client it initializes from `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and stays reactive via a `change` listener. Zero-dependency (no `runed`). jsdom tests (`motion.svelte.test.ts`) cover default-allowed, reduced, and reactive update via a controllable `matchMedia` stub.

**Task 2 — dark token system + accent map (DSGN-01..04):** Replaced the Plan-01 placeholder `src/app.css` with the full token system — `color-scheme: dark`, a near-black `oklch(0.16 0 0)` canvas applied site-wide, the 8 `--color-cat-*` OKLCH accents ported verbatim and inline-documented as AA on dark, a deliberate `:focus-visible` ring (3px light outline + dark halo, never a blanket `outline:none`), a reusable `--scrim`/`.scrim` gradient convention, and base typography/spacing custom props. Ported `categoryAccent.ts` verbatim (the `Category -> 'text-cat-*'` literal map) and hand-wrote `categoryAccent.test.ts` asserting every `CATEGORIES` entry resolves to a non-empty `/^text-cat-/` class. `pnpm build` emits both the `--color-cat-*` custom props and the `text-cat-*` utilities into `build/` (Tailwind scanner picked up the literal strings even with no consumer yet).

## Verification

- `src/app.css`: `color-scheme: dark` present, exactly 8 `--color-cat-*` accents, `:focus-visible` ring, scrim convention — all greps pass.
- `pnpm build` exits 0; `grep -rq -- "--color-cat-pbs" build/` passes (tokens not dropped); `text-cat-pbs` utility class also present in emitted CSS.
- `prefersReducedMotion` exported, SSR-guarded, zero-dep (no `runed`) — all Task 1 greps pass.
- Full suite: **39 tests passed (6 files)**; `pnpm check`: **0 errors, 0 warnings**.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extended the vitest `ui` project include to cover `src/lib/state/`**
- **Found during:** Task 1
- **Issue:** The Plan-02 vitest `ui` (jsdom) project only included `src/lib/components/**` and `src/routes/**`. The motion gate test lives at `src/lib/state/motion.svelte.test.ts` and needs jsdom's `window`/`matchMedia`. With the original globs, `pnpm exec vitest run src/lib/state/` matched no project and ran zero tests, so the plan's acceptance criterion could not pass.
- **Fix:** Added `'src/lib/state/**/*.{test,spec}.{js,ts}'` to the `ui` project's `include` array in `vite.config.ts`. The data (node) project still owns `src/lib/data/**` only.
- **Files modified:** vite.config.ts
- **Commit:** 5282829

### Note on categoryAccent export shape

The plan's `<interfaces>` sketch referenced `categoryAccent[category]` (map indexing) while the sibling exports a `categoryAccent(category)` *function* wrapping a private `ACCENT` record. Ported the sibling verbatim (function form) per the "port verbatim" instruction, and wrote the hand-authored test to call `categoryAccent(category)`. Behavior is identical (every category -> `text-cat-*`); only the call syntax differs from the sketch. Not a functional deviation.

## Authentication Gates

None.

## Known Stubs

None. All tokens are real OKLCH values, the accent map is complete for all 8 categories, and the motion gate is fully wired (consumers arrive in Phase 3).

## Self-Check: PASSED

All 5 created/modified files exist on disk; both task commits (5282829, f32fc4a) are present in git history.
