---
phase: 03-rails-homepage-cinematic-hero
plan: 01
subsystem: ui
tags: [svelte5, scroll-snap, accessibility, rail, carousel, reduced-motion, vitest]

# Dependency graph
requires:
  - phase: 02-watch-page-work-grids
    provides: VideoCard.svelte (renders its own <li><a> poster card, base-safe /watch href, eager prop)
  - phase: 01-foundation
    provides: motion.svelte.ts reduced-motion gate (FND-06), categoryAccent map, categoryToSlug + $lib/data types, $app/paths base
provides:
  - CategoryRail.svelte — reusable accessible horizontal scroll-snap rail wrapping VideoCard
  - Labeled region + list semantics (section[aria-labelledby] > ul > li) with no focus trap
  - Gate-aware Prev/Next paging (clientWidth*0.85, smooth unless reduced motion)
  - Visible next-card peek recipe (clamp(220px,70vw,300px)) and proximity snap track
  - CategoryRail.test.ts — semantics/zero-iframe/controls proof
affects: [03-03-compose-home, homepage, rails]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rail primitive: VideoCard owns the <li>; rail reaches it via .rail-scroller > :global(li)"
    - "Hidden-but-scrollable track (scrollbar-width:none + ::-webkit-scrollbar{display:none}) + proximity snap + overscroll-behavior-x:contain"
    - "Pointer-only controls: @media (hover:none){display:none}, revealed on :hover/:focus-within, kept keyboard-reachable"
    - "Single motion gate read at the call site (prefersReducedMotion.current) — no per-component matchMedia"

key-files:
  created:
    - src/lib/components/CategoryRail.svelte
    - src/lib/components/CategoryRail.test.ts
  modified: []

key-decisions:
  - "Scroller is a <ul> of focusable <li><a> cards — no tabindex=0 on the scroller (avoids Safari double tab-stop + SR over-announcement)"
  - "SVG chevrons (not emoji) for Prev/Next per UI-SPEC anti-generic; >=44px hit target; rgba(0,0,0,0.5) + hairline border"
  - "proximity (never the forced variant) so long rails don't trap the user mid-scroll"
  - "Thin accent underline cue rendered via .rail-label::after using currentColor so it inherits the per-category accent"
  - "Deterministic inline 3-item Reel fixture in the test (videos.json has 4 Reel items) to keep the count assertion stable"

patterns-established:
  - "CategoryRail is a leaf primitive: home composition (03-03) is pure mapping over getCategoriesInDisplayOrder()"
  - "Rail cards are always lazy (eager={false}); only the hero poster is eager (RESEARCH Q3)"

requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06]

# Metrics
duration: ~12min
completed: 2026-06-15
---

# Phase 3 Plan 01: Accessible CategoryRail Summary

**Reusable horizontal scroll-snap rail primitive — a labeled `<section>`/`<ul>` of VideoCards with a visible next-card peek, proximity snap, gate-aware SVG Prev/Next paging, and zero iframes — wrapping the existing VideoCard with no focus trap.**

## Performance

- **Duration:** ~12 min
- **Tasks:** 2 (both TDD-style)
- **Files created:** 2
- **Files modified:** 0 (only the two plan-scoped files)

## Accomplishments
- `CategoryRail.svelte`: labeled region (`section[aria-labelledby]` → `h2` id), `<ul>` of `VideoCard` `<li><a>` cards, accent UPPERCASE label + thin accent underline cue, base-safe "View all →" link to `/work/[slug]/`.
- Track: `scroll-snap-type: x proximity`, `overscroll-behavior-x: contain`, gutter-matching `scroll-padding-inline`, hidden-but-scrollable scrollbar, `clamp(220px,70vw,300px)` peek (→280px ≥768px).
- Prev/Next: circular SVG chevron buttons (≥44px), `rgba(0,0,0,0.5)` + hairline border, page by `clientWidth * 0.85` with `behavior: prefersReducedMotion.current ? 'auto' : 'smooth'`; pointer-only (`@media (hover:none){display:none}`), revealed on hover/focus-within, kept keyboard-reachable.
- A11y: no `tabindex="0"` on the scroller (avoids Safari double tab-stop); offscreen cards stay in the DOM + focusable; zero iframes.
- `CategoryRail.test.ts`: 6 passing assertions — named region resolves, `ul>li` count = 3, zero iframes, View-all href ends `/work/reel/`, exactly two scroll-labeled `button[type=button]`, every card anchor opens `/watch/`.

## Task Commits

1. **Task 1: Build CategoryRail.svelte** — `7407fc7` (feat)
2. **Task 2: CategoryRail.test.ts** — `39d98db` (test)

_TDD note: the component (Task 1) and its proving test (Task 2) were committed separately per the plan's task split._

## Files Created/Modified
- `src/lib/components/CategoryRail.svelte` — accessible scroll-snap rail wrapping VideoCard with accent header, View-all link, and gate-aware Prev/Next controls.
- `src/lib/components/CategoryRail.test.ts` — Vitest proof of region/list semantics, zero iframes, See-all destination, and Prev/Next controls.

## Decisions Made
- Comment wording in `CategoryRail.svelte` was phrased to avoid the literal tokens `mandatory`, `iframe`, and `tabindex="0"` so the plan's negative grep acceptance hooks (`! grep -q ...`) hold against the whole file including comments, while still documenting the underlying rationale.
- Test fixture is an inline deterministic 3-item Reel array (not `getByCategory('Reel')`, which returns 4) so the `ul>li` count assertion is stable against dataset changes.

## Deviations from Plan
None - plan executed exactly as written. (The two adjustments above are wording/fixture choices within the planned files, not behavioral or scope deviations.)

## Issues Encountered
None. Initial grep self-check surfaced three false-positive matches from explanatory comment text; resolved by rewording the comments without changing behavior. `pnpm check`, the rail test, and `pnpm build` all pass.

## Verification
- `pnpm check` → 0 errors, 0 warnings (465 files).
- `pnpm vitest run src/lib/components/CategoryRail.test.ts` → 6/6 passing.
- `pnpm build` → exits 0 (adapter-static wrote `build/`).
- All Task 1 grep hooks pass: aria-labelledby, `scroll-snap-type: x proximity`, no `mandatory`, `clamp(220px, 70vw, 300px)`, `clientWidth * 0.85`, motion-gate ternary, `work/${slug}/`, no `iframe`, no `tabindex="0"`, no leading-slash hrefs.
- All Task 2 grep hooks pass: `querySelector('iframe')`, `aria-labelledby`, `work/reel`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CategoryRail is a finished leaf primitive. 03-03 (compose home) can map over `getCategoriesInDisplayOrder()` and stamp one `<CategoryRail {category} videos={getByCategory(category)} />` per category.
- 03-02 (reel hero + lightbox) is independent of this file.

## Self-Check: PASSED
- FOUND: src/lib/components/CategoryRail.svelte
- FOUND: src/lib/components/CategoryRail.test.ts
- FOUND: .planning/phases/03-rails-homepage-cinematic-hero/03-01-SUMMARY.md
- FOUND commit: 7407fc7 (Task 1)
- FOUND commit: 39d98db (Task 2)

---
*Phase: 03-rails-homepage-cinematic-hero*
*Completed: 2026-06-15*
