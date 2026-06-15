---
phase: 03-rails-homepage-cinematic-hero
plan: 03
subsystem: ui
tags: [sveltekit, svelte5, prerender, scroll-snap, a11y, seo, lightningcss]

# Dependency graph
requires:
  - phase: 03-rails-homepage-cinematic-hero (03-01)
    provides: CategoryRail.svelte — labeled horizontal scroll-snap rail primitive
  - phase: 03-rails-homepage-cinematic-hero (03-02)
    provides: ReelHero.svelte + ReelLightbox — full-bleed cinematic hero, click-to-load reel
  - phase: 01-foundation
    provides: $lib/data loaders (getCategoriesInDisplayOrder, getByCategory), dark tokens, motion gate
  - phase: 02-content-seo
    provides: TopNav/Footer chrome, absolute-host canonical SEO convention
provides:
  - Composed signature home — ReelHero + one CategoryRail per category (8 rails, display order)
  - Prerenderable +page.ts load() building the rails array at build time (zero runtime fetch)
  - Single <main id="main"> landmark + skip-to-content link, centralized in +layout.svelte
  - Build-time zero-iframe guard (scripts/assert-home-no-iframe.mjs) chained into pnpm build
affects: [phase-04-deploy, accessibility-audit, performance-lcp]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Layout-owned single <main id=\"main\"> landmark + skip link; pages render content as <section>"
    - "Prerendered rails array via +page.ts load() — display-order, empty categories dropped"
    - "Post-build invariant guard chained into the build script (fails CI on regression)"

key-files:
  created:
    - src/routes/+page.ts
    - scripts/assert-home-no-iframe.mjs
  modified:
    - src/routes/+page.svelte
    - src/routes/+layout.svelte
    - src/routes/+error.svelte
    - src/routes/about/+page.svelte
    - src/routes/contact/+page.svelte
    - src/routes/press/+page.svelte
    - src/lib/components/ReelHero.svelte
    - package.json

key-decisions:
  - "Centralized the single <main id=\"main\"> landmark in +layout.svelte (not per-page); converted the redundant per-page <main> wrappers to <section> to avoid nested landmarks and satisfy the strict prerenderer's skip-link target on every route."
  - "Empty categories are dropped in +page.ts load() (filter videos.length > 0), so no empty shelf ever renders."
  - "Home canonical is the absolute production host https://michellengo.net/ (NOT base-relative), matching the Phase-2 SEO-01 convention."

patterns-established:
  - "Pattern: layout owns the main landmark + skip link; route pages supply only inner content wrappers."
  - "Pattern: build-time HTML invariant guards (zero-iframe) chained onto pnpm build for CI enforcement."

requirements-completed: [HOME-01, HOME-02, HOME-05, HOME-06, HERO-01]

# Metrics
duration: 36min
completed: 2026-06-15
---

# Phase 3 Plan 03: Compose Home — Hero + 8 Rails Summary

**The Phase-1 placeholder is replaced by the signature home: a prerendered ReelHero leading into 8 accent-labeled CategoryRails (display order), a layout-owned skip-to-content `<main>` landmark, home SEO head, and a build-time zero-iframe guard wired into `pnpm build`.**

## Performance

- **Duration:** 36 min
- **Started:** 2026-06-15T18:49:37Z
- **Completed:** 2026-06-15T19:25:00Z
- **Tasks:** 2 of 3 automated (Task 3 is a human-verify checkpoint, pending)
- **Files modified:** 10 (2 created, 8 modified)

## Accomplishments
- Composed the home from the two Wave-1 leaf components: `<ReelHero />` then `{#each data.rails}<CategoryRail />` — 8 rails render in display order (verified `aria-labelledby` count == 8 in build/index.html).
- Added a prerenderable `+page.ts` load() mapping `getCategoriesInDisplayOrder()` → `{category, videos}` via `getByCategory`, dropping empty categories. Zero runtime fetch.
- Centralized a single `<main id="main">` landmark + a visually-hidden-until-focused skip-to-content link in `+layout.svelte`, so keyboard users on every route can jump to content. Strict prerendering stays fully fatal.
- Shipped `scripts/assert-home-no-iframe.mjs` and chained it into `build` (`vite build && node scripts/...`) plus a `verify:home` script — a leaked iframe now fails CI. Confirmed: build/index.html has **0** iframes; negative test confirms the guard exits 1 when an iframe is present.
- `pnpm check` 0 errors, `pnpm build` exits 0 (both default and `BASE_PATH=/michelle_ngo_five`), all 196 tests pass, no leading-slash hrefs.

## Task Commits

1. **Task 1: +page.ts load + rewrite +page.svelte (ReelHero + 8 rails) + skip link** — `d5b09e5` (feat)
2. **Task 2: Zero-iframe build guard wired into the build script** — `92adeb4` (feat)

**Plan metadata:** pending (docs: complete plan)

_Task 3 is a `checkpoint:human-verify` — paused for human browser verification; no code._

## Files Created/Modified
- `src/routes/+page.ts` — Prerenderable load() building the rails array (display order, empty categories filtered out).
- `src/routes/+page.svelte` — Replaces the Phase-1 placeholder: ReelHero + rails {#each}, home title/description + absolute-host canonical, generous `clamp(2.5rem,6vh,4rem)` inter-rail rhythm.
- `src/routes/+layout.svelte` — Adds the single `<main id="main">` landmark wrapping children + a skip-to-content link as the first focusable element.
- `src/routes/+error.svelte`, `src/routes/about/+page.svelte`, `src/routes/contact/+page.svelte`, `src/routes/press/+page.svelte` — Converted redundant per-page `<main>` wrappers to `<section>` (the landmark now lives in the layout).
- `src/lib/components/ReelHero.svelte` — Fixed an invalid media query (build-blocker, see Deviations).
- `scripts/assert-home-no-iframe.mjs` — Build-time guard: exits 1 if build/index.html has an `<iframe>` or is missing.
- `package.json` — `build` chains the guard; added `verify:home`.
- `src/routes/{about,contact,press}/page.test.ts` — Updated for the relocated landmark (query `section.max-w-*`; press counts the 13 nested credit `<section>`s).

## Decisions Made
- **Single landmark in the layout, not per-page.** The skip link lives in `+layout.svelte` and must resolve on every prerendered route under strict prerendering. Rather than weaken the strict gate (`handleMissingId`), the layout owns one `<main id="main">` and the per-page `<main>` wrappers became `<section>` — one valid landmark per page, skip link works site-wide.
- **Empty categories dropped in load()** so the view never renders an empty shelf (UI-SPEC "Empty rail" state).
- **Absolute production-host canonical for `/`** (`https://michellengo.net/`), parity with the Phase-2 browse/watch canonical convention.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed invalid `@media` query in ReelHero (lightningcss build-blocker)**
- **Found during:** Task 1 (first `pnpm build`)
- **Issue:** `ReelHero.svelte` (from 03-02) contained `@media not (hover: hover) and (pointer: fine)` — `not … and …` is not valid CSS media-query syntax; lightningcss aborted the build (`Unexpected token Ident("and")`). This blocked the composition build.
- **Fix:** Applied De Morgan — the negation is a coarse/no-hover pointer — written as the comma list `@media (hover: none), (pointer: coarse)`, which is equivalent and parseable.
- **Files modified:** src/lib/components/ReelHero.svelte
- **Verification:** `pnpm build` exits 0; the pointer-tilt suppression intent is preserved.
- **Committed in:** `d5b09e5` (Task 1 commit)

**2. [Rule 1 - Bug] Updated 4 page tests broken by the landmark relocation**
- **Found during:** Task 2 (`pnpm test`)
- **Issue:** about/contact/press tests queried `host.querySelector('main')` (the page rendered in isolation no longer owns a `<main>`); the press test also counted total `<section>`s (now off by one because the wrapper became a `<section>`).
- **Fix:** Query the editorial-width content container (`section.max-w-2xl` / `section.max-w-3xl`); count nested credit sections via `section section` (the 13 prestige groups).
- **Files modified:** src/routes/{about,contact,press}/page.test.ts
- **Verification:** All 196 tests pass.
- **Committed in:** `92adeb4` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug). Both are direct, in-scope consequences of this plan's work (the build it triggered surfaced the prior-plan CSS bug; the landmark refactor required by the skip-link target broke isolated-render tests). No scope creep.
**Impact on plan:** Necessary for a green build + green tests. The architecture (layout-owned landmark) is cleaner than per-page `id="main"` and keeps strict prerendering intact.

## Issues Encountered
- The strict prerenderer (`strict: true`) treated the layout-level `#main` skip link as a broken anchor on every non-home route until a `#main` target existed on each. Resolved by centralizing the landmark in the layout (above) rather than relaxing the strict gate.

## Known Stubs
None. All 8 rails are wired to real `getByCategory` data; no placeholder/empty values flow to render. Home mounts zero live iframes by design (facade pattern — the reel iframe mounts only inside ReelHero's lightbox on click).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Home is composition-complete and CI-guarded (8 rails, 0 iframes, clean prerender at base `''` and `/michelle_ngo_five`).
- **Pending:** Task 3 human-verify checkpoint — visual/interaction verification in a real browser (hero/PLAY REEL, 8 rails, keyboard skip link + no trap, reduced-motion, mobile swipe). This summary is written ahead of that gate per the orchestrator's instruction.
- Phase 4 (deploy/apex CNAME) can proceed once the human-verify passes.

---
*Phase: 03-rails-homepage-cinematic-hero*
*Completed: 2026-06-15*

## Self-Check: PASSED

All created/modified files exist on disk (`+page.ts`, `+page.svelte`, `+layout.svelte`, `scripts/assert-home-no-iframe.mjs`, `package.json`, `03-03-SUMMARY.md`) and both task commits are present in git history (`d5b09e5`, `92adeb4`).
