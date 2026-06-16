---
phase: 04-hardening-apex-cutover-launch
plan: 02
subsystem: deploy-ci
status: paused-at-checkpoint
tags: [deploy, github-pages, actions, prerender-guard, apex, cutover, dns]
requires:
  - "Quality gates green (04-01) — a11y/perf-verified launch artifact"
  - "static/CNAME = michellengo.net (Phase 1)"
  - "entries()-driven 56 watch + 8 category prerender (Phase 2)"
provides:
  - "Both deploy workflows on current Node-24-compatible action majors"
  - "scripts/assert-prerender-count.mjs — CI guard against silent route drift"
  - "deploy.yml runs the prerender-count guard on every push to main"
  - "Verified base-'' apex build (CNAME preserved, root-relative assets, apex-host sitemap)"
  - "CUTOVER.md — copy-paste apex DNS + post-DNS launch runbook"
affects:
  - ".github/workflows/deploy.yml"
  - ".github/workflows/deploy-production.yml"
  - "launch readiness (apex DNS flip is the remaining human-action gate)"
tech-stack:
  added: []
  patterns:
    - "Exact-equality prerender-count CI guard (56 watch / 8 category) — catches add AND drop, unlike a coverage floor"
    - "static/CNAME persistence so the custom domain survives every apex redeploy (Pitfall 12)"
key-files:
  created:
    - "scripts/assert-prerender-count.mjs"
    - ".planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md"
  modified:
    - ".github/workflows/deploy.yml"
    - ".github/workflows/deploy-production.yml"
    - "package.json"
decisions:
  - "Prerender guard uses EXACT equality (===) on watch/category, not a floor (>=), so a content edit that adds OR drops a route trips CI for review"
  - "Guard wired into deploy.yml only (push-to-main staging path) — runs on every content change; production workflow keeps its existing CNAME-verify step"
  - "Kept node-version: 22 in setup-node — the ACTION major bump (v4->v6) is about the action runtime, not the installed Node"
metrics:
  duration_min: 5
  tasks_completed: 2
  tasks_total: 3
  files_changed: 5
  completed: "2026-06-16"
---

# Phase 4 Plan 2: Deploy Hardening + Apex Cutover Summary

Hardened both GitHub Pages deploy workflows to current Node-24-compatible action majors, added an exact-count prerender CI guard to `deploy.yml` to close silent route drift (Pitfall 3), verified a base-`''` apex production build is green with the CNAME preserved, and wrote `CUTOVER.md` — the copy-paste apex DNS + post-DNS launch runbook. The DNS flip itself is the remaining human-action checkpoint (Task 3).

## What Was Built

### Task 1 — Action bumps + prerender-count guard (commit `36cc355`)

Bumped every deprecated Node-20-era action major to its current Node-24-compatible version in **both** workflows:

| Action                         | Before | After |
| ------------------------------ | ------ | ----- |
| `actions/checkout`             | v4     | v6    |
| `actions/setup-node`           | v4     | v6    |
| `pnpm/action-setup`            | v4     | v6    |
| `actions/upload-pages-artifact`| v3     | v5    |
| `actions/deploy-pages`         | v4     | v5    |

`node-version: 22` and `version: 11.0.9 / standalone: true` were left untouched — only the version tags changed.

Created `scripts/assert-prerender-count.mjs`: counts `build/watch/<id>/index.html` (expects **exactly 56**) and `build/work/<slug>/index.html` (expects **exactly 8**), and asserts the 6 required static pages (`work`, `pbs-american-portrait`, `about`, `press`, `contact`, home `index.html`) are present. It prints an actual-vs-expected table, exits `1` on any mismatch/missing page, `2` if `build/` is absent, `0` otherwise. Exact equality (not a `>=` floor) means a route ADDED or DROPPED both trip the guard for review. Wired into `deploy.yml` as a step after `Build`, before `Upload artifact`; added the `verify:prerender` package script.

**Guard output against the real build:**
```
route          actual  expected  ok
watch/<id>        56        56  OK
work/<slug>        8         8  OK
required static pages: all present
PASS: 56 watch + 8 category routes and all required static pages present.
```

### Task 2 — Apex build verification + CUTOVER.md (commit `f82b53e`)

Ran a local `BASE_PATH='' pnpm build` (mirrors the production workflow) and asserted base-`''` correctness:

| Assertion                                                  | Result |
| ---------------------------------------------------------- | ------ |
| `BASE_PATH='' pnpm build` exits 0                          | PASS   |
| `build/CNAME` == `michellengo.net`                         | PASS   |
| No `/michelle_ngo_five/` base-path leak in `build/index.html` | PASS (NO_LEAK) |
| `build/sitemap.xml` on apex host (`https://michellengo.net/`) | PASS   |
| Prerender-count guard on the apex build (56 + 8 + static)  | PASS (exit 0) |

Wrote `.planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md` — the launch runbook with: pre-flight confidence list; **Step 1** exact registrar records table (4×A `185.199.108-111.153`, 4×AAAA `2606:50c0:800{0-3}::153`, `www` CNAME → `wolfwdavid.github.io`); **Step 2** production deploy dispatch; **Step 3** Pages custom-domain; **Step 4** Enforce HTTPS; **Step 5** cold verification (dig, incognito home, deep-link hard-refresh, http→https, OG share preview); rollback to staging; and a Pitfall-12 symptom→fix troubleshooting table.

## Deviations from Plan

None — plan executed exactly as written for Tasks 1–2. (Task 3 is the planned human-action checkpoint, not yet started.)

## Checkpoint Status

**Task 3 (`checkpoint:human-action`) — NOT executed.** The DNS flip at the registrar and the repo
Settings → Pages toggles cannot be performed by Claude (no registrar or Pages-UI access). The plan is
**paused at this checkpoint**, not fully complete. The human follows `CUTOVER.md` end-to-end, then
replies "live" to resume final apex HTTPS verification.

## Verification Results

- `! grep -Eq 'checkout@v4|setup-node@v4|action-setup@v4|upload-pages-artifact@v3|deploy-pages@v4' .github/workflows/*.yml` — no deprecated majors remain (PASS)
- Both files contain `checkout@v6 / setup-node@v6 / action-setup@v6 / upload-pages-artifact@v5 / deploy-pages@v5` (PASS)
- `pnpm build && node scripts/assert-prerender-count.mjs` exits 0; guard wired into `deploy.yml` (PASS)
- `BASE_PATH='' pnpm build` → `build/CNAME=michellengo.net`, root-relative assets, apex-host sitemap (PASS)
- `CUTOVER.md` contains all 4 A IPs, AAAA `2606:50c0:8000::153`, `www` CNAME, "Enforce HTTPS", "Custom domain", deep-link hard-refresh (PASS)

## Known Stubs

None. No placeholder data, empty values, or unwired components introduced.
