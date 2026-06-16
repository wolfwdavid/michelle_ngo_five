---
phase: 04-hardening-apex-cutover-launch
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - pnpm-lock.yaml
  - playwright.config.ts
  - tests/e2e/axe.spec.ts
  - tests/e2e/responsive.spec.ts
  - tests/e2e/reduced-motion.spec.ts
  - lighthouserc.json
  - .gitignore
autonomous: false
requirements: [QUAL-01, QUAL-02, QUAL-03, QUAL-04]

must_haves:
  truths:
    - "Running `pnpm exec playwright test` against the production build passes with zero axe serious/critical violations on all 8 key pages"
    - "A mobile Lighthouse performance check exists (lighthouserc.json) with an LCP budget that the home page passes"
    - "A responsive test verifies layout at 375/768/1024/1440 and that the TopNav hamburger opens MobileMenu"
    - "A reduced-motion test proves prefers-reduced-motion gates ALL motion (hero parallax/tilt + rail scroll behavior=auto)"
    - "A real iPhone + Android device pass keyboard/focus + momentum-scroll (human-verify checkpoint)"
  artifacts:
    - path: "playwright.config.ts"
      provides: "Playwright config building+previewing the prod static output at a fixed port (BASE_PATH omitted)"
      contains: "webServer"
    - path: "tests/e2e/axe.spec.ts"
      provides: "Parametrized axe WCAG AA scan over 8 key routes"
      contains: "AxeBuilder"
    - path: "tests/e2e/responsive.spec.ts"
      provides: "Viewport 375/768/1024/1440 + mobile-nav open assertions"
      contains: "setViewportSize"
    - path: "tests/e2e/reduced-motion.spec.ts"
      provides: "prefers-reduced-motion gate assertions (hero + rail)"
      contains: "prefers-reduced-motion"
    - path: "lighthouserc.json"
      provides: "Mobile Lighthouse config + LCP budget assertion"
      contains: "largest-contentful-paint"
  key_links:
    - from: "playwright.config.ts"
      to: "build/ (pnpm build && pnpm preview)"
      via: "webServer.command builds the real adapter-static artifact, BASE_PATH omitted so goto('/') resolves at root"
      pattern: "pnpm build.*pnpm preview"
    - from: "tests/e2e/reduced-motion.spec.ts"
      to: "src/lib/state/motion.svelte.ts gate (ReelHero class:motion, CategoryRail behavior)"
      via: "emulateMedia({ reducedMotion: 'reduce' }) then assert .hero lacks .motion and no parallax transform"
      pattern: "emulateMedia"
---

<objective>
Establish the four launch-readiness quality gates for v5 and fix any violations they surface: an automated axe accessibility scan (QUAL-01), a mobile Lighthouse performance check with an LCP budget (QUAL-02), a responsive + mobile-nav test at 375/768/1024/1440 (QUAL-03), and a reduced-motion audit proving the single motion gate governs everything site-wide (QUAL-04).

Purpose: Phase 4 is the final hardening phase before the apex cutover. The site is content-complete and human-approved (Phase 3), but no automated a11y/perf/responsive/motion gate exists yet. This plan installs the Playwright + @axe-core/playwright toolchain (proven in sibling michelle_ngo_three) plus Lighthouse CI, then fixes anything they catch.

Output: A `tests/e2e/` suite (axe + responsive + reduced-motion), a `lighthouserc.json` mobile config, the dev-dependencies + scripts wired into package.json, and a real-device human-verify checkpoint. Any serious/critical axe violation, LCP regression, responsive break, or ungated motion found is fixed in this plan.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/research/PITFALLS.md

<!-- The proven Playwright + axe template lives in the sibling repo. Port it, don't reinvent. -->
Reference (sibling, proven): C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_three/playwright.config.ts
Reference (sibling, proven): C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_three/tests/e2e/axe.spec.ts

<interfaces>
<!-- Key facts the executor needs — extracted from the v5 codebase. No exploration required. -->

The single reduced-motion gate (src/lib/state/motion.svelte.ts):
  export const prefersReducedMotion: { readonly current: boolean }
  - SSR/prerender → current === false (motion allowed); client reads matchMedia('(prefers-reduced-motion: reduce)').

ReelHero (src/lib/components/ReelHero.svelte):
  - `<section class="hero" class:motion={motionOK}>` where motionOK = !prefersReducedMotion.current
  - JS pointer-tilt listener is guarded: `if (!motionOK) return` before addEventListener('pointermove', ...)
  - CSS parallax additionally wrapped in `@media (prefers-reduced-motion: no-preference)`
  - LCP poster: loading="eager" fetchpriority="high" with explicit width/height (the only LCP element on home)

CategoryRail (src/lib/components/CategoryRail.svelte):
  - Prev/Next scrollBy uses `behavior: prefersReducedMotion.current ? 'auto' : 'smooth'`
  - scroll container has overscroll-behavior-x: contain; tabindex="0" for Safari keyboard

TopNav + MobileMenu (src/lib/components/): hamburger button toggles MobileMenu (role="dialog", focus trap, Escape, return-focus). Animation is instant (no transition).

Home is iframe-free (scripts/assert-home-no-iframe.mjs chained into `pnpm build` asserts build/index.html has 0 <iframe>). Watch page mounts the live iframe only on play-click (facade).

The 8 key routes (same set the sibling axe spec uses), all resolve at server root when BASE_PATH is omitted:
  /  ·  /work  ·  /work/pbs-american-portrait  ·  /watch/264677021  ·  /pbs-american-portrait  ·  /press  ·  /about  ·  /contact

Current package.json: pnpm@11.0.9, node>=22, vitest already present. NO @playwright/test, NO @axe-core/playwright, NO lighthouse yet — this plan adds them.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Playwright + axe toolchain and port the parametrized axe WCAG-AA scan (QUAL-01)</name>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_three/playwright.config.ts (proven config — port + webServer pattern)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_three/tests/e2e/axe.spec.ts (proven 8-route axe spec)
    - package.json (current scripts/deps — confirm no playwright/axe yet)
    - svelte.config.js (adapter-static strict; base from BASE_PATH ?? '')
  </read_first>
  <action>
    1. Add dev-dependencies pinned to the sibling's proven versions:
       `pnpm add -D @playwright/test@1.60.0 @axe-core/playwright@4.11.3`
       Then install the chromium+webkit+firefox browsers: `pnpm exec playwright install --with-deps chromium webkit firefox` (CI will re-run install; locally chromium is enough to develop).
    2. Add scripts to package.json: `"test:e2e": "playwright test"`. Leave the existing `build`/`test` scripts intact.
    3. Create `playwright.config.ts` at repo root by porting the sibling's file. Keep these exact properties:
       - `testDir: './tests/e2e'`, `fullyParallel: true`, `forbidOnly: !!process.env.CI`, `retries: process.env.CI ? 2 : 0`, `workers: process.env.CI ? 1 : undefined`.
       - A fixed PORT constant (use 4187 to avoid colliding with sibling _three's 4183 and _four's 4173). `use.baseURL = `http://localhost:${PORT}``.
       - `webServer.command = `pnpm build && pnpm preview --port ${PORT}``, `port: PORT`, `reuseExistingServer: !process.env.CI`, `timeout: 180_000`. CRITICAL: do NOT set BASE_PATH in this command's env — the build must serve at root so `page.goto('/work')` resolves. (The `pnpm build` here also runs scripts/assert-home-no-iframe.mjs, which is fine.)
       - `projects`: chromium, webkit, firefox (all three — the cutover targets Safari).
    4. Create `tests/e2e/axe.spec.ts` by porting the sibling spec verbatim, with these v5 specifics:
       - `WCAG_TAGS = ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']`
       - ROUTES = the 8 paths listed in <interfaces> (home, work, work/pbs-american-portrait, watch/264677021, pbs-american-portrait, press, about, contact).
       - For each route: `await page.goto(path)`, then `const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();` and assert ZERO serious/critical violations. Use `const blocking = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical'); expect(blocking).toEqual([]);` (QUAL-01 floor is "no serious violations" — moderate/minor are reported but not blocking). Print `results.violations` impact+id on failure for debuggability.
    5. Add `test-results/`, `playwright-report/`, and `.lighthouseci/` to `.gitignore`.
    6. Run `pnpm exec playwright test tests/e2e/axe.spec.ts --project=chromium`. FIX every serious/critical violation it reports in the relevant source component (e.g. a missing aria-label on a rail region, a contrast miss on an accent token, a missing iframe title). Re-run until clean on chromium, then run the full 3-project pass.
  </action>
  <verify>
    <automated>pnpm exec playwright test tests/e2e/axe.spec.ts --project=chromium</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q '@axe-core/playwright' package.json` AND `grep -q '@playwright/test' package.json`
    - `playwright.config.ts` exists; `grep -q 'pnpm build && pnpm preview' playwright.config.ts` AND it does NOT set BASE_PATH in the webServer env
    - `tests/e2e/axe.spec.ts` exists; `grep -q 'AxeBuilder' tests/e2e/axe.spec.ts` and lists all 8 routes
    - `pnpm exec playwright test tests/e2e/axe.spec.ts --project=chromium` exits 0 (zero serious/critical violations)
  </acceptance_criteria>
  <done>Playwright+axe installed and pinned; 8-route axe scan passes with zero serious/critical violations on chromium; any violation found was fixed at its source component, not suppressed.</done>
</task>

<task type="auto">
  <name>Task 2: Add the mobile Lighthouse LCP gate (QUAL-02) and the responsive + reduced-motion tests (QUAL-03, QUAL-04)</name>
  <read_first>
    - src/lib/components/ReelHero.svelte (class:motion gate, JS pointer-tilt `if (!motionOK) return`, eager fetchpriority=high LCP poster)
    - src/lib/components/CategoryRail.svelte (behavior: prefersReducedMotion.current ? 'auto' : 'smooth')
    - src/lib/components/TopNav.svelte + src/lib/components/MobileMenu.svelte (hamburger → role=dialog)
    - playwright.config.ts (from Task 1 — reuse its PORT/webServer)
  </read_first>
  <action>
    QUAL-02 — Mobile Lighthouse LCP gate:
    1. `pnpm add -D @lhci/cli@latest`. Add script `"lhci": "lhci autorun"` to package.json.
    2. Create `lighthouserc.json` at repo root:
       - `ci.collect`: `staticDistDir: "./build"` so LHCI serves the already-built artifact (run after `pnpm build`). `numberOfRuns: 3`. `url: ["http://localhost/index.html"]` (the home — iframe-free, eager hero LCP).
       - `ci.collect.settings`: `{ "preset": "desktop": false }` — explicitly use the MOBILE form factor: set `"settings": { "formFactor": "mobile", "screenEmulation": { "mobile": true, "width": 412, "height": 823, "deviceScaleFactor": 1.75, "disabled": false }, "throttling": { "rttMs": 150, "throughputKbps": 1638, "cpuSlowdownMultiplier": 4 } }` (Moto-G4-class 4G mobile).
       - `ci.assert.assertions`: `{ "categories:performance": ["warn", {"minScore": 0.9}], "largest-contentful-paint": ["error", {"maxNumericValue": 3000}], "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}], "total-blocking-time": ["warn", {"maxNumericValue": 300}] }`. LCP ≤ 3000ms and CLS ≤ 0.1 are the load-bearing hard budgets (Pitfalls 8/9).
       - `ci.upload`: `{ "target": "filesystem", "outputDir": ".lighthouseci" }` (no LHCI server — local/CI artifact only).
    3. Run `pnpm build && pnpm exec lhci autorun`. If LCP > 3000ms or CLS > 0.1, FIX the regression (confirm hero poster is eager+fetchpriority=high and dimensioned per ReelHero; confirm no render-blocking added). Record the actual LCP/CLS/perf score in the SUMMARY. If a real mobile-throttled run is environmentally flaky in this sandbox, the assertions config is still the deliverable; document the recorded numbers.

    QUAL-03 — Responsive + mobile-nav test:
    4. Create `tests/e2e/responsive.spec.ts`. For each viewport in `[375, 768, 1024, 1440]` (width; pick a sensible height like 800): `await page.setViewportSize({ width, height })`, `await page.goto('/')`, then assert:
       - No horizontal page overflow: `const sw = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1); expect(sw).toBe(true);` (rails scroll internally; the PAGE must not).
       - At least one rail region is visible and the hero wordmark is visible.
       - Also `goto('/watch/264677021')` at 375 and 1440 and assert no page horizontal overflow (watch page is the densest layout).
    5. Mobile-nav: at width 375 on `/`, assert the hamburger button is visible, click it, assert the MobileMenu dialog (`role="dialog"`) is visible and contains the Work/About/Contact links, press Escape, assert the dialog is hidden and focus returned to the hamburger. At width 1440 assert the hamburger is hidden (desktop nav shown). Fix any responsive break found (e.g. a rail that forces page overflow at 375, a hero that clips at 768).

    QUAL-04 — Reduced-motion audit:
    6. Create `tests/e2e/reduced-motion.spec.ts`. Use Playwright `emulateMedia({ reducedMotion: 'reduce' })`:
       - `await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/');` then assert the hero section does NOT carry the `motion` class: `await expect(page.locator('.hero')).not.toHaveClass(/(^|\s)motion(\s|$)/);`
       - Assert the hero parallax layer has no nonzero translate transform: read `getComputedStyle(...).transform` on the parallax element and expect `none` or an identity matrix (no parallax applied).
       - Move the pointer across the hero (`page.mouse.move`) and assert the tilt transform stays identity (the `if (!motionOK) return` JS guard).
       - Contrast case with motion ON: `await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.goto('/');` and assert `.hero` DOES carry the `motion` class — proving the gate actually toggles, not that motion is globally absent.
       - Rail behavior: with reduced-motion reduce, click a rail Next button and assert the scroll completes without a smooth-scroll animation duration (the `behavior:'auto'` path). A pragmatic assertion: the scrollLeft changes synchronously within one tick. If asserting scroll-behavior is flaky, at minimum assert the rail Next button exists and is operable under reduced-motion.
       - Fix any ungated motion the audit reveals (any element that animates regardless of the gate).
  </action>
  <verify>
    <automated>pnpm exec playwright test tests/e2e/responsive.spec.ts tests/e2e/reduced-motion.spec.ts --project=chromium</automated>
  </verify>
  <acceptance_criteria>
    - `lighthouserc.json` exists; `grep -q 'largest-contentful-paint' lighthouserc.json` AND `grep -q '"formFactor": "mobile"' lighthouserc.json` (mobile form factor + LCP budget present)
    - `tests/e2e/responsive.spec.ts` exists; `grep -q 'setViewportSize' tests/e2e/responsive.spec.ts` and references all four widths 375/768/1024/1440 and a `role="dialog"` mobile-menu assertion
    - `tests/e2e/reduced-motion.spec.ts` exists; `grep -q 'reducedMotion' tests/e2e/reduced-motion.spec.ts` and asserts BOTH the reduce path (no .motion) and the no-preference path (.motion present)
    - `pnpm exec playwright test tests/e2e/responsive.spec.ts tests/e2e/reduced-motion.spec.ts --project=chromium` exits 0
    - `pnpm build && pnpm exec lhci autorun` runs; recorded LCP ≤ 3000ms and CLS ≤ 0.1 on the mobile config (numbers captured in SUMMARY)
  </acceptance_criteria>
  <done>Mobile Lighthouse LCP/CLS gate exists and the home passes it; responsive test passes at all four widths with a working mobile-nav open/close; reduced-motion test proves the single gate toggles ALL hero+rail motion; all fixes applied at source.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Real-device a11y + momentum-scroll verification (iPhone + Android)</name>
  <action>Checkpoint — pause for the human to test on real hardware (steps in how-to-verify below). No code is written in this task; resume on the signal.</action>
  <verify>Human confirms each item in how-to-verify on a real iPhone and Android; replies "approved" or reports the device + issue.</verify>
  <done>Real iPhone + Android pass rail momentum-scroll, keyboard/focus + visible focus ring, mobile-nav open/close, reduced-motion disabling hero+rail motion, and a fast hero LCP on cellular.</done>
  <what-built>
    Automated quality gates now pass: 8-route axe scan (zero serious/critical), mobile Lighthouse LCP ≤ 3000ms / CLS ≤ 0.1, responsive layout at 375/768/1024/1440 with working mobile nav, and a reduced-motion audit proving the single gate disables hero parallax/tilt and rail smooth-scroll. Playwright's webkit is DESKTOP WebKit, not iOS Safari — and DevTools emulation does not faithfully reproduce touch momentum/rubber-banding (Pitfall 6). These two things can only be confirmed on real hardware.
  </what-built>
  <how-to-verify>
    On a REAL iPhone (Safari) and a REAL Android (Chrome), open the live staging site (https://wolfwdavid.github.io/michelle_ngo_five/) and check:
    1. Rails: swipe a category rail horizontally — it scrolls with native momentum and does NOT hijack the vertical page scroll or trigger pull-to-refresh (Pitfall 6).
    2. Keyboard/focus (iPhone with a Bluetooth keyboard if available, else skip to Android): Tab into a rail, use the Prev/Next buttons; the focused card scrolls into view and the focus ring is visible on the dark canvas and over bright thumbnails.
    3. Mobile nav: tap the hamburger → MobileMenu opens, links work, Escape/back closes it and returns focus.
    4. Reduced motion: enable iOS Settings → Accessibility → Motion → Reduce Motion (and Android equivalent), reload the home — the hero parallax/tilt is gone and rail Prev/Next jumps instantly (no smooth animation), but the layout still looks premium (static hero poster).
    5. Hero LCP feels fast on cellular (not just wifi) — the hero poster paints quickly.
  </how-to-verify>
  <resume-signal>Type "approved" if all five check out, or describe the specific device + issue (e.g. "iPhone: rail swipe scrolls the page vertically") so it can be fixed.</resume-signal>
</task>

</tasks>

<verification>
- `pnpm exec playwright test --project=chromium` runs the full e2e suite (axe + responsive + reduced-motion) green.
- `pnpm build && pnpm exec lhci autorun` passes the mobile LCP/CLS assertions.
- The 8 key routes report zero serious/critical axe violations.
- Real iPhone + Android verification approved (Task 3).
</verification>

<success_criteria>
- QUAL-01: automated axe scan over 8 key pages, zero serious/critical violations (fixes applied).
- QUAL-02: mobile Lighthouse check exists with an LCP ≤ 3000ms budget the home passes; recorded scores in SUMMARY.
- QUAL-03: responsive verified at 375/768/1024/1440 with a working hamburger→MobileMenu (test + fixes).
- QUAL-04: reduced-motion audit proves the single motion gate governs hero parallax/tilt + rail scroll, with a positive (motion-on) control.
- Real-device iPhone + Android keyboard/focus + momentum behavior human-verified.
</success_criteria>

<output>
After completion, create `.planning/phases/04-hardening-apex-cutover-launch/04-01-SUMMARY.md` including the recorded mobile Lighthouse LCP/CLS/performance numbers and any axe/responsive/motion fixes made.
</output>
