---
phase: 04-hardening-apex-cutover-launch
plan: 01
subsystem: testing
tags: [playwright, axe-core, lighthouse, lhci, a11y, wcag, responsive, reduced-motion, svelte5]

# Dependency graph
requires:
  - phase: 03-signature-rails-home
    provides: "ReelHero (double-gated motion), CategoryRail (gate-aware scroll), TopNav+MobileMenu, zero-iframe home"
  - phase: 02-content-chrome-seo
    provides: "/work, /work/[category], /pbs-american-portrait, /watch/[id], Footer, VideoCard"
  - phase: 01-foundation
    provides: "adapter-static build, BASE_PATH wiring, single reduced-motion gate (motion.svelte.ts)"
provides:
  - "Playwright + @axe-core/playwright 8-route WCAG-AA gate (serious/critical hard-fail, moderate fix-or-document)"
  - "Mobile Lighthouse CI LCP<=3000ms + CLS<=0.1 budget the home passes (LCP 2.05s, CLS 0, perf 98)"
  - "Responsive e2e at 375/768/1024/1440 + mobile-nav open/Escape/focus-return"
  - "Reduced-motion audit proving the single gate toggles ALL hero+rail motion (with positive control)"
  - "AA-clean color contrast, valid list semantics, heading order, and h1 presence across all key routes"
affects: [04-02-deploy-hardening-apex-cutover, apex-cutover, ci]

# Tech tracking
tech-stack:
  added: ["@playwright/test@1.60.0", "@axe-core/playwright@4.11.3", "@lhci/cli@0.15.1"]
  patterns:
    - "Playwright webServer builds+previews the REAL adapter-static artifact at root (BASE_PATH omitted) so goto('/work') resolves"
    - "axe gating policy: serious/critical build-fail, moderate fix-or-document carve-out map, minor advisory log"
    - "VideoCard accepts a children snippet so per-card badges render inside its own <li> (no nested-<li> list break)"
    - "Reduced-motion tested via emulateMedia({reducedMotion}) with a no-preference positive control"

key-files:
  created:
    - playwright.config.ts
    - tests/e2e/axe.spec.ts
    - tests/e2e/responsive.spec.ts
    - tests/e2e/reduced-motion.spec.ts
    - lighthouserc.json
  modified:
    - src/lib/components/TopNav.svelte
    - src/lib/components/Footer.svelte
    - src/lib/components/VideoCard.svelte
    - src/lib/components/MobileMenu.svelte
    - src/routes/work/+page.svelte
    - "src/routes/work/[category]/+page.svelte"
    - src/routes/pbs-american-portrait/+page.svelte
    - package.json
    - .gitignore

key-decisions:
  - "axe gates serious/critical only (QUAL-01 floor); moderate fixed at source, minor advisory — no blanket toEqual([])"
  - "Promote text-neutral-500 -> text-neutral-400 site-wide for AA on the near-black canvas (was 4.1:1, now ~7.5:1)"
  - "TopNav inline nav reveals at lg (1024px), not sm (640px) — the 8 long category names overflowed the page at 768px"
  - "MobileMenu returns focus to the trigger synchronously on Escape (WebKit drops effect-cleanup .focus())"
  - "VideoCard children snippet replaces PBS double-<li> wrapping to satisfy axe list semantics"

patterns-established:
  - "e2e runs the production static build (not vite dev) to catch BASE_PATH/prerender/perf issues a dev server hides"
  - "Visually-hidden sr-only h1/h2 give grid pages a valid document outline without changing the YouTube-density look"

requirements-completed: [QUAL-01, QUAL-02, QUAL-03, QUAL-04]

# Metrics
duration: 92min
completed: 2026-06-16
---

# Phase 4 Plan 01: Quality Gates Summary

**Four automated launch gates (axe WCAG-AA over 8 routes, mobile Lighthouse LCP/CLS, responsive 375–1440 + mobile-nav, single-gate reduced-motion) all green across Chromium/WebKit/Firefox — and the 7 a11y/contrast/list/heading + 2 responsive/Safari-focus violations they surfaced were fixed at source.**

## Performance

- **Duration:** ~92 min
- **Started:** 2026-06-16T15:47:38Z
- **Completed:** 2026-06-16T17:19:53Z
- **Tasks:** 3 of 3 complete (Task 3 real-device human-verify checkpoint — APPROVED by human on 2026-06-16: iPhone Safari + Android Chrome passed rail momentum, keyboard/focus, mobile-nav, OS reduce-motion, and cellular hero LCP)
- **Files modified:** 14 (5 created, 9 modified)

## Accomplishments

- **QUAL-01 — axe WCAG-AA gate:** `tests/e2e/axe.spec.ts` scans all 8 key routes with WCAG 2A/AA + 2.1A/AA + best-practice. Gating policy: serious/critical build-fail, moderate fix-or-document, minor advisory. **24/24 pass (8 routes × 3 engines)** with zero serious/critical AND zero moderate violations after fixes.
- **QUAL-02 — mobile Lighthouse LCP gate:** `lighthouserc.json` runs the mobile (Moto-G4-class 4G) form factor against the built artifact. **Home passes: LCP 2.05s (budget ≤3000ms), CLS 0 (budget ≤0.1), performance 98, TBT 0ms.**
- **QUAL-03 — responsive + mobile-nav:** `tests/e2e/responsive.spec.ts` verifies zero page-overflow at 375/768/1024/1440 (rails scroll internally) plus the densest watch layout, and the hamburger→MobileMenu open / Escape-close / focus-return contract.
- **QUAL-04 — reduced-motion audit:** `tests/e2e/reduced-motion.spec.ts` proves the single `prefersReducedMotion` gate removes the hero `.motion` class, parallax translate, and pointer-tilt under `reduce`, with a no-preference positive control proving the gate TOGGLES (not just absent), and the rail Next button operable under reduced motion.
- **Full suite green:** `pnpm exec playwright test` = **57/57 across chromium + webkit + firefox.**

## Task Commits

1. **Task 1: Playwright+axe toolchain + 8-route WCAG-AA scan (QUAL-01)** — `15095ae` (feat)
2. **Task 2: Mobile Lighthouse LCP gate + responsive & reduced-motion tests (QUAL-02/03/04)** — `f64b543` (feat)

**Plan metadata:** _(final docs commit — pending, see below)_

## Files Created/Modified

- `playwright.config.ts` — builds+previews the prod static artifact at root (PORT 4187, BASE_PATH omitted); chromium+webkit+firefox.
- `tests/e2e/axe.spec.ts` — parametrized 8-route axe scan with the QUAL-01 gating policy + carve-out map.
- `tests/e2e/responsive.spec.ts` — 375/768/1024/1440 overflow + watch-page densest layout + mobile-nav keyboard open/Escape/focus-return.
- `tests/e2e/reduced-motion.spec.ts` — reduce vs no-preference gate assertions for hero parallax/tilt + rail.
- `lighthouserc.json` — mobile form factor, LCP≤3000ms / CLS≤0.1 hard budgets, perf/TBT warnings, filesystem upload.
- `src/lib/components/TopNav.svelte` — desktop nav reveal sm→lg (fixes 768px overflow); About/Press/Contact neutral-500→400.
- `src/lib/components/Footer.svelte` — column labels neutral-500→400 and h3→h2; copyright neutral-500→400.
- `src/lib/components/VideoCard.svelte` — added `children` snippet (rendered inside its `<li>`); uploader neutral-500→400.
- `src/lib/components/MobileMenu.svelte` — synchronous focus-return to the trigger on Escape (+ rAF-deferred cleanup fallback).
- `src/routes/work/+page.svelte` — sr-only h1/h2 (page-has-heading-one + heading nesting).
- `src/routes/work/[category]/+page.svelte` — sr-only h2 so card h3s nest correctly.
- `src/routes/pbs-american-portrait/+page.svelte` — "See on PBS" badge moved into VideoCard's snippet (fixes nested-`<li>` list break); description neutral-500→400.
- `package.json` — `test:e2e` + `lhci` scripts; +@playwright/test, +@axe-core/playwright, +@lhci/cli.
- `.gitignore` — test-results / playwright-report / .lighthouseci.

## Recorded Lighthouse numbers (mobile, Moto-G4-class 4G)

| Metric | Value | Budget | Result |
|--------|-------|--------|--------|
| Largest Contentful Paint | 2.05 s (2053 ms) | ≤ 3000 ms (error) | PASS |
| Cumulative Layout Shift | 0 | ≤ 0.1 (error) | PASS |
| Total Blocking Time | 0 ms | ≤ 300 ms (warn) | PASS |
| Performance score | 98 | ≥ 90 (warn) | PASS |
| First Contentful Paint | 1.7 s | — | — |
| Speed Index | 1.7 s | — | — |

_Run via `pnpm build && pnpm exec lhci autorun` (1 run dumped to `.lighthouseci/`). Env note below on multi-run cleanup._

## Decisions Made

- **axe gating = serious/critical only** for the QUAL-01 floor; moderate violations fixed at source (not carved out — the carve-out map is empty), minor logged as advisory. Avoided the sibling's blanket `toEqual([])`.
- **text-neutral-500 → text-neutral-400 site-wide:** #737373 on the near-black canvas was 4.09–4.17:1 (below AA 4.5:1); #a3a3a3 is ~7.5:1 while staying clearly secondary.
- **TopNav inline nav at `lg` not `sm`:** the 8 full category names + About/Press/Contact only fit on one line at ≥1024px; revealing them at 640px forced 109px of horizontal page scroll at 768px. Hamburger now drives `<lg`.
- **VideoCard `children` snippet:** lets the PBS landing attach its per-card "See on PBS →" badge inside the card's own `<li>` instead of wrapping VideoCard in a second `<li>` (which nested `<li>` in `<li>` and failed axe's `list` rule).
- **Synchronous focus-return on Escape in MobileMenu:** WebKit (the apex cutover's primary engine) dropped a `.focus()` issued from the effect-cleanup tick that unmounts the dialog; restoring focus before `onclose()` lands reliably on all three engines.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Serious color-contrast on every route (WCAG AA fail)**
- **Found during:** Task 1 (axe scan)
- **Issue:** `text-neutral-500` (#737373) on the near-black canvas measured 4.09–4.17:1 (below 4.5:1) in TopNav About/Press/Contact links, Footer column headers + copyright, VideoCard uploader, and the PBS description.
- **Fix:** Promoted all seven usages to `text-neutral-400` (#a3a3a3 ≈ 7.5:1).
- **Files:** TopNav.svelte, Footer.svelte, VideoCard.svelte, pbs-american-portrait/+page.svelte
- **Verification:** axe 24/24 green (0 serious/critical).
- **Committed in:** 15095ae

**2. [Rule 1 — Bug] Serious `list` violation on /pbs-american-portrait**
- **Found during:** Task 1 (axe scan)
- **Issue:** The PBS grid wrapped `<VideoCard>` (which renders its own `<li>`) in a second `<li>` to attach a "See on PBS →" link — nesting `<li>` inside `<li>`, invalid list markup.
- **Fix:** Added a `children` snippet to VideoCard so the badge renders inside the card's `<li>`; removed the outer wrapper.
- **Files:** VideoCard.svelte, pbs-american-portrait/+page.svelte
- **Verification:** axe green on the PBS route; svelte-check 0 errors.
- **Committed in:** 15095ae

**3. [Rule 2 — Missing Critical] Moderate heading-order / page-has-heading-one**
- **Found during:** Task 1 (axe scan)
- **Issue:** Footer column labels were `<h3>` after a page `<h1>` (skip); `/work` had no `<h1>`; grid card `<h3>`s skipped `<h2>` on `/work` and `/work/[category]`.
- **Fix:** Footer h3→h2; sr-only `<h1>`/`<h2>` on `/work`; sr-only `<h2>` on `/work/[category]`.
- **Files:** Footer.svelte, work/+page.svelte, work/[category]/+page.svelte
- **Verification:** axe green (0 moderate).
- **Committed in:** 15095ae

**4. [Rule 1 — Bug] Responsive break: page scrolls horizontally at 768px**
- **Found during:** Task 2 (responsive spec)
- **Issue:** TopNav revealed the full inline category nav at `sm` (640px); the 8 long names + secondary links overflowed to 877px, scrolling the whole page 109px at 768.
- **Fix:** Reveal the inline nav at `lg`; hamburger drives `<lg`.
- **Files:** TopNav.svelte
- **Verification:** responsive spec green at all four widths, all engines.
- **Committed in:** f64b543

**5. [Rule 1 — Bug] Safari keyboard focus-return fails after Escape**
- **Found during:** Task 2 (responsive spec, webkit project)
- **Issue:** WebKit left `activeElement` on `<body>` after Escape because the `.focus()` was issued from the effect-cleanup tick that unmounts the dialog.
- **Fix:** Restore focus to the trigger synchronously in the Escape handler (before `onclose()`); kept an rAF-deferred fallback in cleanup for close-button/link paths.
- **Files:** MobileMenu.svelte
- **Verification:** webkit empirical check returns focus to "Open menu"; full suite 57/57.
- **Committed in:** f64b543

---

**Total deviations:** 5 auto-fixed (4 Rule 1 bugs, 1 Rule 2 missing-critical). All are genuine WCAG-AA / responsive / Safari-keyboard correctness fixes surfaced by the very gates this plan installs — exactly the plan's intent. No scope creep.

## Issues Encountered

- **Stale preview servers corrupted early e2e runs.** `playwright.config.ts` uses `reuseExistingServer: !CI`; zombie `vite preview` processes left on port 4187 (and 4188) from earlier runs served an old/incomplete build, producing phantom "overflow"/"motion-not-gated" failures. Resolved by force-killing the port listeners (PowerShell `Get-NetTCPConnection | Stop-Process`) so each run rebuilds fresh. Lesson for 04-02 / CI: CI sets `reuseExistingServer:false`, so this is a local-only hazard; always clear ports 4187/4188/4189 between manual runs.

## Environment Limitations (verification the human/CI should re-run)

- **Lighthouse multi-run cleanup on Windows:** `pnpm exec lhci autorun` (the default `numberOfRuns: 3`) completed all audits but crashed during Chrome teardown with `taskkill not recognized` (System32 not on the Git-Bash PATH) and `EBUSY unlink` on the temp Chrome profile. **Workaround that succeeded:** put System32 on PATH and run a single pass — `export PATH="$PATH:/c/Windows/System32:/c/Windows/System32/Wbem"; pnpm exec lhci autorun --collect.numberOfRuns=1` → exit 0, assertions passed, LCP 2.05s / CLS 0 recorded above. The committed `lighthouserc.json` keeps `numberOfRuns: 3` (correct for CI/Linux); on a Windows dev box use the single-run + PATH workaround. CI (Linux) is unaffected.

## Self-Check: PASSED

- Files verified on disk: playwright.config.ts, tests/e2e/axe.spec.ts, tests/e2e/responsive.spec.ts, tests/e2e/reduced-motion.spec.ts, lighthouserc.json, 04-01-SUMMARY.md — all FOUND.
- Commits verified: 15095ae (Task 1), f64b543 (Task 2) — both FOUND.
- e2e: 57/57 across chromium+webkit+firefox. Lighthouse mobile: LCP 2.05s, CLS 0, perf 98 (all budgets pass). svelte-check: 0 errors/0 warnings.

## Next Phase Readiness

- All four automated gates are wired and green; ready to be promoted to a blocking CI step in Plan 04-02 (deploy hardening + apex cutover).
- **APPROVED — Task 3 real-device human-verify checkpoint (2026-06-16):** Human confirmed on a real iPhone (Safari) + Android (Chrome) against the live staging site: rail momentum-scroll, keyboard/focus ring on dark, mobile-nav open/close, OS reduce-motion disabling hero+rail motion, and fast hero LCP on cellular all pass.

---
*Phase: 04-hardening-apex-cutover-launch*
*Plan: 01 — quality-gates*
*Status: COMPLETE — all 3 tasks done (Task 3 human-verify APPROVED 2026-06-16)*
*Completed (Tasks 1–2): 2026-06-16*
