---
phase: 04-hardening-apex-cutover-launch
verified: 2026-06-17T00:00:00Z
status: passed
score: 9/9 must-haves verified
re_verification: false
deferred_non_blocking:
  - item: "Apex DNS cutover (michellengo.net)"
    reason: "Deferred by explicit user decision on 2026-06-16. Not a numbered requirement (QUAL-01..04 are a11y/perf/responsive/motion, all satisfied). CUTOVER.md runbook is complete and ready. Site is intentionally live at wolfwdavid.github.io/michelle_ngo_five/."
---

# Phase 4: Hardening, Apex Cutover & Launch — Verification Report

**Phase Goal:** Verify the content-complete site against explicit a11y and mobile-perf budgets on
real Safari/iOS/Android devices, then perform the verify-then-flip apex CNAME cutover so the site
goes live at michellengo.net over HTTPS.

**Verified:** 2026-06-17
**Status:** PASSED
**Re-verification:** No — initial verification
**Plans verified:** 04-01 (quality-gates), 04-02 (deploy-hardening-apex-cutover)

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                                         | Status     | Evidence                                                                                                                                   |
|----|---------------------------------------------------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| 1  | `pnpm exec playwright test` passes with zero axe serious/critical violations on all 8 key pages               | VERIFIED   | `tests/e2e/axe.spec.ts` exists, 85 lines, 8-route parametrized scan; serious/critical hard-gate; MODERATE_CARVE_OUTS empty (none needed). Summary reports 24/24 across chromium+webkit+firefox. Commits 15095ae. |
| 2  | A mobile Lighthouse LCP gate exists and the home passes it (LCP ≤ 3000ms, CLS ≤ 0.1)                        | VERIFIED   | `lighthouserc.json` exists: mobile form factor (412×823, 4G throttle), `largest-contentful-paint` ≤ 3000ms (error), `cumulative-layout-shift` ≤ 0.1 (error). Recorded run: LCP 2.05s / CLS 0 / perf 98. Commit f64b543. |
| 3  | A responsive test verifies layout at 375/768/1024/1440 and that the TopNav hamburger opens MobileMenu         | VERIFIED   | `tests/e2e/responsive.spec.ts` exists, 87 lines; 4 viewport loops + `setViewportSize`; `role="dialog"` assertion; Escape + focus-return assertion. Commit f64b543. |
| 4  | A reduced-motion test proves the single gate toggles ALL hero+rail motion                                     | VERIFIED   | `tests/e2e/reduced-motion.spec.ts` exists, 103 lines; asserts `.hero` lacks `.motion` under `reduce`; positive control asserts `.hero` has `.motion` under `no-preference`; pointer-tilt guard asserted; rail Next button operable. Commit f64b543. |
| 5  | Real iPhone + Android device QA was human-approved                                                            | VERIFIED   | Human-verify checkpoint explicitly approved 2026-06-16 (recorded in 04-01-SUMMARY.md, task 3 section): iPhone Safari + Android Chrome passed rail momentum-scroll, keyboard/focus, mobile-nav, OS reduce-motion, and cellular hero LCP. |
| 6  | Neither workflow references a deprecated Node-20 action major                                                 | VERIFIED   | Both `deploy.yml` and `deploy-production.yml` contain: `checkout@v6`, `setup-node@v6`, `pnpm/action-setup@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`. No v4/v3 references remain. Commit 36cc355. |
| 7  | `deploy.yml` runs a prerender-count guard that fails if route count drifts from 56 watch + 8 category + static | VERIFIED | `deploy.yml` step "Assert prerender route count" (`node scripts/assert-prerender-count.mjs`) is wired after Build, before Upload artifact. `assert-prerender-count.mjs` exists (134 lines), checks EXACTLY 56 watch + 8 category + 6 static pages, exits 1 on mismatch. Commit 36cc355. |
| 8  | A production (apex) build with BASE_PATH='' is verified: CNAME=michellengo.net, root-relative assets          | VERIFIED   | `deploy-production.yml` sets `BASE_PATH: ''` and has "Verify CNAME in build artifact" step (`test -f build/CNAME`). Summary records local apex build exit 0, CNAME=michellengo.net, no `/michelle_ngo_five/` leak, apex-host sitemap, prerender guard exit 0. Commit f82b53e. |
| 9  | CUTOVER.md contains the exact registrar DNS records (4×A, 4×AAAA, www CNAME) plus post-DNS steps             | VERIFIED   | `.planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md` exists (141 lines). Contains all 4 apex A IPs (185.199.108–111.153), all 4 AAAA IPs (2606:50c0:8000–8003::153), www CNAME to wolfwdavid.github.io, Step 3 "Custom domain", Step 4 "Enforce HTTPS", Step 5 cold verification including deep-link hard-refresh, and a Pitfall-12 troubleshooting table. Commit f82b53e. |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact                                                        | Provides                                                | Status     | Details                                                                                     |
|-----------------------------------------------------------------|---------------------------------------------------------|------------|---------------------------------------------------------------------------------------------|
| `playwright.config.ts`                                          | Playwright config building+previewing prod artifact at root | VERIFIED | Exists, 45 lines. Contains `webServer` with `pnpm build && pnpm preview`, PORT 4187, BASE_PATH omitted, chromium+webkit+firefox projects. |
| `tests/e2e/axe.spec.ts`                                         | Parametrized axe WCAG AA scan over 8 key routes         | VERIFIED   | Exists, 85 lines. Contains `AxeBuilder`, WCAG_TAGS, all 8 routes, gating policy.            |
| `tests/e2e/responsive.spec.ts`                                  | Viewport 375/768/1024/1440 + mobile-nav assertions      | VERIFIED   | Exists, 87 lines. Contains `setViewportSize`, all four widths, `role="dialog"` assertion.   |
| `tests/e2e/reduced-motion.spec.ts`                              | prefers-reduced-motion gate assertions (hero + rail)    | VERIFIED   | Exists, 103 lines. Contains `reducedMotion`, both reduce and no-preference paths.           |
| `lighthouserc.json`                                             | Mobile Lighthouse config + LCP budget assertion         | VERIFIED   | Exists, 36 lines. Contains `largest-contentful-paint` budget, `"formFactor": "mobile"`.    |
| `scripts/assert-prerender-count.mjs`                            | CI guard counting prerendered watch/category/static HTML | VERIFIED  | Exists, 134 lines. Contains `watch`, expected counts 56 and 8, exact equality logic, exit codes 0/1/2. |
| `.github/workflows/deploy.yml`                                  | Staging workflow with bumped actions + prerender-count step | VERIFIED | Exists. All 5 actions at current majors. `assert-prerender-count` step wired after Build.  |
| `.github/workflows/deploy-production.yml`                       | Apex workflow with bumped actions; BASE_PATH='' + CNAME verify | VERIFIED | Exists. All 5 actions at current majors. `BASE_PATH: ''` set. CNAME verify step present.  |
| `.planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md` | Apex DNS + cutover runbook with exact records           | VERIFIED   | Exists, 141 lines. Contains 185.199.108.153, 2606:50c0:8000::153, wolfwdavid.github.io, "Enforce HTTPS", "Custom domain", deep-link hard-refresh. |

---

### Key Link Verification

| From                        | To                                                  | Via                                              | Status   | Details                                                                                                      |
|-----------------------------|-----------------------------------------------------|--------------------------------------------------|----------|--------------------------------------------------------------------------------------------------------------|
| `playwright.config.ts`      | `build/` (pnpm build && pnpm preview)               | `webServer.command`                              | WIRED    | Line 40: `command: \`pnpm build && pnpm preview --port ${PORT}\`` — no BASE_PATH in env.                    |
| `tests/e2e/reduced-motion.spec.ts` | `prefersReducedMotion` gate / `.hero.motion` class | `emulateMedia({ reducedMotion: ... })`         | WIRED    | Four `emulateMedia` calls (lines 32, 49, 70, 82); asserts both `reduce` and `no-preference` paths.           |
| `deploy.yml`                | `scripts/assert-prerender-count.mjs`                | Step "Assert prerender route count"              | WIRED    | Line 43–44: `- name: Assert prerender route count` / `run: node scripts/assert-prerender-count.mjs`. Positioned after Build, before Upload artifact. |
| `CUTOVER.md`                | GitHub Pages apex DNS (4×A, 4×AAAA, www CNAME)     | Exact records table in Step 1                   | WIRED    | Contains `185.199.108.153`–`185.199.111.153`, `2606:50c0:8000::153`–`8003::153`, `wolfwdavid.github.io`.   |

---

### Requirements Coverage

| Requirement | Source Plan | Description                                                                          | Status    | Evidence                                                                                              |
|-------------|-------------|--------------------------------------------------------------------------------------|-----------|-------------------------------------------------------------------------------------------------------|
| QUAL-01     | 04-01       | Automated axe scan, zero serious violations on key pages                             | SATISFIED | `axe.spec.ts` scans 8 routes; serious/critical hard-gate; 24/24 pass; violations fixed at source.    |
| QUAL-02     | 04-01       | Mobile Lighthouse: good LCP, capped iframes, no significant CLS                      | SATISFIED | `lighthouserc.json` mobile form factor; LCP 2.05s (≤3000ms), CLS 0 (≤0.1), perf 98.                 |
| QUAL-03     | 04-01       | Responsive from small mobile to desktop with working mobile nav                      | SATISFIED | `responsive.spec.ts` verifies 375/768/1024/1440 no overflow + hamburger/MobileMenu/Escape/focus-return. |
| QUAL-04     | 04-01       | `prefers-reduced-motion` disables parallax/hover-preview/smooth-scroll everywhere    | SATISFIED | `reduced-motion.spec.ts` proves single gate removes `.motion`, parallax translate, pointer-tilt; positive control proves gate toggles. |

All 4 requirements are marked Complete in REQUIREMENTS.md (rows 148–151). No orphaned Phase 4 requirements found.

---

### Anti-Patterns Found

No stub patterns, empty returns, placeholder data, TODO/FIXME markers, or unwired components found in the Phase 4 artifacts. The deferred-items.md records one pre-existing ESLint error in `src/lib/state/motion.svelte.test.ts` (`beforeEach` unused import from Phase 01-03) — this predates Phase 4 and was not introduced by any Phase 4 change.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

---

### Human Verification Completed

The following item required human verification and was explicitly approved before this phase closed:

**Real-device a11y + momentum-scroll verification (Task 3 of 04-01)**

- Test: Open the live staging site (https://wolfwdavid.github.io/michelle_ngo_five/) on a real iPhone (Safari) and a real Android (Chrome)
- Verified items: rail horizontal momentum-scroll (no vertical hijack), keyboard/focus ring visibility on dark canvas, mobile-nav open/Escape/close/focus-return, OS reduce-motion disabling hero parallax and rail smooth-scroll, hero LCP on cellular
- Outcome: APPROVED by the user on 2026-06-16 (recorded in 04-01-SUMMARY.md task 3 section)

---

### Deferred Item (Non-Blocking)

**Apex DNS cutover — michellengo.net**

Task 3 of Plan 04-02 is a human-action checkpoint Claude cannot perform (no registrar or GitHub Pages UI access). The user explicitly decided on 2026-06-16 to keep the site live on the GitHub Pages staging URL (`https://wolfwdavid.github.io/michelle_ngo_five/`) and perform the DNS flip later. `michellengo.net` currently points at the prior WordPress host.

This is NOT a gap or a failed requirement. QUAL-01 through QUAL-04 are all about a11y, performance, responsiveness, and reduced-motion — all satisfied. The apex cutover is a separate human-action gate. When ready, the user follows `CUTOVER.md` end-to-end.

Everything Claude can do is done:
- `deploy-production.yml` builds with `BASE_PATH=''` and verifies `build/CNAME`
- Apex build verified locally: root-relative assets, CNAME=michellengo.net, apex-host sitemap, full prerender count
- `CUTOVER.md` contains the copy-paste DNS records, post-DNS repo steps, HTTPS enforcement, cold verification checklist, rollback instructions, and Pitfall-12 troubleshooting table

---

### Commit Verification

All four implementation commits documented in the SUMMARYs were confirmed present in git history:

| Commit   | Description                                              | Present |
|----------|----------------------------------------------------------|---------|
| 15095ae  | Playwright+axe gate + a11y fixes (QUAL-01)              | YES     |
| f64b543  | Lighthouse LCP gate + responsive + reduced-motion (QUAL-02/03/04) | YES |
| 36cc355  | Deploy action bumps + prerender-count guard             | YES     |
| f82b53e  | Apex build verification + CUTOVER.md runbook            | YES     |

---

## Summary

Phase 4 goal is achieved for everything within Claude's scope. The four numbered requirements (QUAL-01 through QUAL-04) are all satisfied by substantive, wired, passing artifacts:

- **QUAL-01:** `tests/e2e/axe.spec.ts` — 8-route axe scan, serious/critical hard-gate, 24/24 green across all engines.
- **QUAL-02:** `lighthouserc.json` — mobile LCP 2.05s / CLS 0 / perf 98, all budgets pass.
- **QUAL-03:** `tests/e2e/responsive.spec.ts` — layout clean at 375/768/1024/1440, mobile-nav keyboard-operable.
- **QUAL-04:** `tests/e2e/reduced-motion.spec.ts` — single gate proven to toggle ALL hero+rail motion.

Real-device QA on iPhone Safari + Android Chrome was human-approved on 2026-06-16.

Deploy hardening is complete: both workflows run current Node-24-compatible action majors, the prerender-count guard (`scripts/assert-prerender-count.mjs`) is wired into every push-to-main deploy, and the apex production build is verified. The apex DNS cutover is deferred by explicit user decision — the runbook (`CUTOVER.md`) is ready.

---

_Verified: 2026-06-17_
_Verifier: Claude (gsd-verifier)_
