---
phase: 02-shared-components-card-destinations-seo
plan: 01
subsystem: ui
tags: [svelte5, sveltekit, tailwind4, components, a11y, focus-trap, chrome, prerender]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: dark OKLCH token system (app.css), categoryAccent() map, $lib/data barrel (getCategoriesInDisplayOrder/categoryToSlug/getById), base-path-safe layout head
provides:
  - CategoryTag, VideoCard, ContactBlock leaf components (+ tests)
  - TopNav, MobileMenu, Footer site chrome (+ tests)
  - +layout.svelte renders TopNav above and Footer below every route
  - scoped prerender handleHttpError tolerating Wave-2 routes
affects: [02-02-watch, 02-03-browse-pbs, 02-04-static-pages-seo, 03-rails-hero]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Leaf components import ONLY from $lib/data + ./categoryAccent; base-path-safe hrefs via ${base}/..."
    - "Keyboard-operable overlay: role=dialog + focus trap + Escape + return-focus, hardened beyond the v4 source"
    - "Scoped prerender handleHttpError: tolerate ONLY the specific routes a later same-phase plan will build; every other 404 still fails the build"

key-files:
  created:
    - src/lib/components/CategoryTag.svelte
    - src/lib/components/CategoryTag.test.ts
    - src/lib/components/VideoCard.svelte
    - src/lib/components/VideoCard.test.ts
    - src/lib/components/ContactBlock.svelte
    - src/lib/components/ContactBlock.test.ts
    - src/lib/components/TopNav.svelte
    - src/lib/components/TopNav.test.ts
    - src/lib/components/MobileMenu.svelte
    - src/lib/components/Footer.svelte
    - src/lib/components/Footer.test.ts
  modified:
    - src/routes/+layout.svelte
    - svelte.config.js

key-decisions:
  - "MobileMenu hardened with a real focus trap + Escape + return-focus (the v4 source had neither) — DSGN-04/QUAL-03 a11y floor"
  - "PBS retargeted to /pbs-american-portrait/ in MobileMenu too, so all three nav surfaces (TopNav/Footer/MobileMenu) agree"
  - "Scoped prerender handleHttpError instead of rel=external on chrome links — keeps SPA preload/nav intact once Wave-2 routes ship"

patterns-established:
  - "Chrome lives in +layout.svelte; every internal href base-safe; no leading-slash local hrefs anywhere in src/"
  - "TopNav scroll-aware \$effect null-guards #hero-sentinel so it safely no-ops to a solid nav until the Phase-3 hero renders it"

requirements-completed: [DSGN-04]

# Metrics
duration: 17min
completed: 2026-06-14
---

# Phase 2 Plan 01: Shared Components and Chrome Summary

**Ported v4's CategoryTag/VideoCard/ContactBlock leaves and TopNav/MobileMenu/Footer chrome into v5, wired to the locked Phase-1 dark tokens + data barrel, mounted in +layout.svelte, with a hardened keyboard-operable mobile menu — full suite (102) green, check 0 errors, base-path-safe build.**

## Performance

- **Duration:** ~17 min
- **Started:** 2026-06-14T16:33Z
- **Completed:** 2026-06-14T16:48Z
- **Tasks:** 2
- **Files created/modified:** 13 (11 created, 2 modified)

## Accomplishments
- Three leaf components (CategoryTag, VideoCard, ContactBlock) ported verbatim and wired to v5's existing `categoryAccent()` function map and `$lib/data` barrel — 28 tests green.
- Site chrome (TopNav + MobileMenu + Footer) ported and mounted in `+layout.svelte`, rendering on every route; footer mirrors the nav via the shared ContactBlock + category directory — 35 chrome tests green.
- MobileMenu upgraded to a keyboard-operable `role="dialog"` overlay: focus trap (Tab/Shift+Tab cycle), Escape-to-close, focus returns to the hamburger trigger, 44px close target.
- Build kept green and base-path-safe via a scoped `handleHttpError` that tolerates only the Wave-2 routes the chrome links to.

## Task Commits

Each task was committed atomically:

1. **Task 1: Port leaf components (CategoryTag, VideoCard, ContactBlock) + tests** — `621c26a` (feat)
2. **Task 2: Port chrome (TopNav, MobileMenu, Footer) + wire into +layout.svelte** — `220ee94` (feat)

**Plan metadata:** see final docs commit.

## Files Created/Modified
- `src/lib/components/CategoryTag.svelte` (+ test) — per-category accent label/link via `categoryAccent()`.
- `src/lib/components/VideoCard.svelte` (+ test) — 16:9 reserved-box lazy thumb, line-clamped title, accent tag, base-safe `/watch/[id]` link.
- `src/lib/components/ContactBlock.svelte` (+ test) — single shared contact surface (email/phone/IMDb/LinkedIn/Vimeo).
- `src/lib/components/TopNav.svelte` (+ test) — wordmark + 8 category links + About/Press/Contact + hamburger; scroll-aware `$effect` null-guarding the Phase-3 hero sentinel.
- `src/lib/components/MobileMenu.svelte` — keyboard-operable overlay (focus trap + Escape + return focus).
- `src/lib/components/Footer.svelte` (+ test) — 3-column footer-mirrored nav: ContactBlock + category mirror + site links.
- `src/routes/+layout.svelte` — imports TopNav/Footer, renders chrome around `{@render children()}`; sitewide OG/favicon head preserved.
- `svelte.config.js` — scoped prerender `handleHttpError` for not-yet-built Wave-2 routes.

## Decisions Made
- Hardened MobileMenu a11y (focus trap + Escape + return focus) because the v4 source lacked them and the plan set a DSGN-04/QUAL-03 keyboard floor.
- Used a scoped `handleHttpError` rather than `rel="external"` on chrome links so SvelteKit preload + client-side nav stay intact once the routes exist.
- Retargeted PBS to `/pbs-american-portrait/` in MobileMenu to match TopNav/Footer.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical a11y] Added focus trap + Escape + return-focus to MobileMenu**
- **Found during:** Task 2 (chrome port)
- **Issue:** v4's MobileMenu had no focus trap, no Escape handler, and didn't restore focus — failing the plan's explicit "keyboard-operable (focus trap + Escape)" requirement and the DSGN-04/QUAL-03 a11y floor.
- **Fix:** Wrapped the overlay in `role="dialog" aria-modal="true"`, added a `keydown` handler (Escape closes; Tab/Shift+Tab cycle within focusables), a `$effect` that focuses the close button on open and restores the previously-focused element (the hamburger) on destroy, and a 44px close target with aria-label.
- **Files modified:** src/lib/components/MobileMenu.svelte
- **Verification:** `grep -qi Escape` passes; full suite + `pnpm check` green.
- **Committed in:** `220ee94`

**2. [Rule 3 - Blocking] Scoped prerender handleHttpError so the build survives links to not-yet-built Wave-2 routes**
- **Found during:** Task 2 (build verification)
- **Issue:** Mounting TopNav/Footer made the strict prerenderer crawl `/work`, `/work/[category]`, `/pbs-american-portrait/`, `/about`, `/press`, `/contact` — routes that ship in Plans 02-02/02-03/02-04 — and 404 the build.
- **Fix:** Added a `prerender.handleHttpError` to `svelte.config.js` that swallows 404s ONLY for those exact route patterns; any other broken internal link still throws. Commented to be narrowed/removed as Wave-2 lands.
- **Files modified:** svelte.config.js
- **Verification:** `MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build` exits 0; chrome present in `build/index.html`.
- **Committed in:** `220ee94`

**3. [Rule 1 - Type bug] Guarded possibly-undefined focusable elements in MobileMenu**
- **Found during:** Task 2 (`pnpm check`)
- **Issue:** Under `noUncheckedIndexedAccess`, `items[0]` / `items[at-1]` are `HTMLElement | undefined`; svelte-check reported 2 errors.
- **Fix:** Added an early `if (!first || !last) return;` guard.
- **Files modified:** src/lib/components/MobileMenu.svelte
- **Verification:** `pnpm check` → 0 errors.
- **Committed in:** `220ee94`

---

**Total deviations:** 3 auto-fixed (1 missing-critical a11y, 1 blocking, 1 type bug)
**Impact on plan:** All three were necessary for correctness, accessibility, or to complete the build. No scope creep — chrome behavior matches the plan; the `handleHttpError` is a temporary, scoped seam that Wave-2 unwinds.

## Issues Encountered
- The plan's port-source paths omitted the `michelle_ngo_websites/` parent dir; resolved to the actual sibling at `Websites/michelle_ngo_websites/michelle_ngo_four`. No behavior impact.
- The plan's CONTEXT @-reference pointed at `01-foundation-data-reuse-proven-deploy/01-03-SUMMARY.md`; the actual phase dir is `01-foundation`. Did not block execution.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All shared dependencies for Wave-2 are in place: VideoCard for browse/watch grids, ContactBlock for about/contact, chrome on every route.
- Wave-2 plans (02-02 watch, 02-03 browse/PBS, 02-04 static pages) should remove their route's pattern from the `prerender.handleHttpError` allowlist as they land; delete the whole block once 02-04 ships and no routes remain unbuilt.
- The Phase-3 hero will render `#hero-sentinel`; TopNav already observes it (currently a safe no-op) — no TopNav change needed then.

## Self-Check: PASSED

- All 6 components + layout verified present on disk.
- Both task commits (`621c26a`, `220ee94`) verified in git history.

---
*Phase: 02-shared-components-card-destinations-seo*
*Completed: 2026-06-14*
