---
phase: 05-cutover-prep-make-indexable-clear-seo-deploy-debt
plan: 01
subsystem: seo
tags: [seo, robots, noindex, prerender, adapter-static, sveltekit, env-gating]

# Dependency graph
requires:
  - phase: 04-hardening-apex-cutover-launch
    provides: CUTOVER.md runbook, both deploy workflows with BASE_PATH signal, verified base-'' apex build
provides:
  - Environment-gated noindex robots meta (staging only) via +layout.server.ts
  - Environment-gated robots.txt prerendered route (apex Allow / staging Disallow)
  - CUTOVER.md SEO-04 indexing-gate verification step for Phase 6
affects: [06-apex-dns-cutover, 07-post-launch-verification, cutover, indexing, seo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Indexing gate keyed off build-time process.env.BASE_PATH, surfaced to the layout via a prerendered +layout.server.ts load ($env/dynamic/private) — NOT base from $app/paths"
    - "Env-gated prerendered text route (robots.txt) mirrors the sitemap.xml +server.ts shape, reads process.env.BASE_PATH directly in Node prerender context"

key-files:
  created:
    - src/routes/+layout.server.ts
    - src/routes/robots.txt/+server.ts
  modified:
    - src/routes/+layout.svelte
    - src/routes/watch/[id]/page.test.ts
    - .planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md

key-decisions:
  - "Gate the noindex meta on a server-load isStaging derived from process.env.BASE_PATH, because base from $app/paths resolves to '.' in BOTH builds under adapter-static relative paths and cannot distinguish staging from apex"
  - "Use $env/dynamic/private in +layout.server.ts (graceful '' default when unset) rather than $env/static/private (strict, errors when BASE_PATH undefined on the apex build)"
  - "robots.txt route reads process.env.BASE_PATH directly (Node prerender context) — the +server.ts is server-only, so no client-bundle process.env hazard"

patterns-established:
  - "Build-time env gating for static SvelteKit: read process.env.BASE_PATH in a prerendered server context (+layout.server.ts load or +server.ts), never infer the deploy target from $app/paths base under adapter-static relative paths"

requirements-completed: [SEO-04]

# Metrics
duration: 11min
completed: 2026-06-18
---

# Phase 5 Plan 01: Environment-Gated Indexing (SEO-04) Summary

**The apex (BASE_PATH='') build now emits NO noindex meta and a crawlable `robots.txt` (Allow: / + Sitemap), while the staging build keeps noindex + Disallow: / — driven entirely by the build-time BASE_PATH env signal, gating the milestone's central cutover blocker.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-06-17T23:54:38Z
- **Completed:** 2026-06-18T00:06:10Z
- **Tasks:** 3
- **Files modified:** 5 (2 created, 3 modified)

## Accomplishments
- Neutralized the milestone's 🔴 blocker: the apex build is now search-indexable (no `noindex` meta, `robots.txt` `Allow: /`).
- Staging behavior is unchanged — still `noindex, nofollow` + `robots.txt Disallow: /` — so the github.io host stays out of search results.
- The staging-vs-apex difference is driven purely by the existing `BASE_PATH` env signal (no manual edit at cutover); verified from built HTML/robots output for both builds.
- CUTOVER.md documents the SEO-04 verification step (curl robots.txt + grep for noindex) so Phase 6 can confirm the gate took effect in production.

## Task Commits

Each task was committed atomically:

1. **Task 1: Environment-gate the noindex robots meta in the layout** - `141dcda` (feat)
2. **Task 2: Replace static robots.txt with an environment-gated prerendered route** - `74b6f07` (feat)
3. **Task 3: Document the indexing-gate verification step in CUTOVER.md** - `8e94aef` (docs)

_Plan metadata commit follows this summary._

## Files Created/Modified
- `src/routes/+layout.server.ts` (created) - Prerendered server load surfacing `isStaging` from `process.env.BASE_PATH` (the single source of truth for the SEO-04 gate).
- `src/routes/robots.txt/+server.ts` (created) - Env-gated prerendered robots.txt route; apex emits `Allow: /` + Sitemap, staging emits `Disallow: /`.
- `src/routes/+layout.svelte` (modified) - Robots `noindex` meta now wrapped in `{#if isStaging}` reading `data.isStaging` via `$derived`.
- `src/routes/watch/[id]/page.test.ts` (modified) - Mock `data` augmented with `isStaging: false` (the layout server data now merges into every page's `PageData`).
- `static/robots.txt` (deleted) - Replaced by the env-gated route (a static file cannot be env-gated).
- `.planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md` (modified) - Step 5 item 6 + Pre-flight bullet for the SEO-04 indexing-gate verification.

## Decisions Made
- **Gate on `process.env.BASE_PATH`, not `base` from `$app/paths`.** The plan's interface block assumed `base === ''` (apex) vs `'/michelle_ngo_five'` (staging). In practice, adapter-static's default relative paths make `base` resolve to `'.'` in BOTH builds, so it cannot distinguish them. The reliable build-time signal is `process.env.BASE_PATH`.
- **Surface `isStaging` via `+layout.server.ts` using `$env/dynamic/private`.** Server-only, runs at prerender (Node) where `process.env` is available, and yields `''` gracefully when `BASE_PATH` is unset (the apex case). This keeps `process.env` out of the client bundle.
- The robots.txt route reads `process.env.BASE_PATH` directly (a `+server.ts` is server-only, so this is safe and mirrors the plan's specified shape).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Indexing gate cannot key off `base` from `$app/paths`**
- **Found during:** Task 1 (Environment-gate the noindex robots meta)
- **Issue:** The plan specified `const isStaging = base !== ''` using `base` from `$app/paths`. A debug build showed `base` resolves to `'.'` in BOTH the apex (`BASE_PATH=''`) and staging (`BASE_PATH=/michelle_ngo_five`) builds — a consequence of adapter-static's default relative paths. `'.' !== ''` is always true, so `isStaging` would be `true` on the apex too, leaving the apex `noindex` (the exact milestone-fatal outcome the plan aimed to prevent).
- **Fix:** Added `src/routes/+layout.server.ts` whose prerendered `load` reads `process.env.BASE_PATH` via `$env/dynamic/private` and returns `{ isStaging: basePath !== '' }`. The layout consumes `data.isStaging` (via `$derived`). `base` is still imported for favicon hrefs but no longer drives the gate.
- **Files modified:** src/routes/+layout.svelte, src/routes/+layout.server.ts (new)
- **Verification:** `BASE_PATH='' pnpm build` → `build/index.html` has 0 `noindex`; `BASE_PATH=/michelle_ngo_five pnpm build` → `content="noindex, nofollow"` present. Both confirmed from built HTML.
- **Committed in:** `141dcda` (Task 1 commit)

**2. [Rule 3 - Blocking] Layout server data broke watch page test typing**
- **Found during:** Task 1 (`pnpm check` after the gate change)
- **Issue:** Adding `isStaging` to the layout server data merges it into every page's `PageData`. The watch `page.test.ts` mounts `+page.svelte` with `data` from `callLoad` (only `{video, rail}`), so svelte-check reported 6 errors: `Property 'isStaging' is missing`.
- **Fix:** Updated the `callLoad` helper to return `{ ...result, isStaging: false }` (the apex default), satisfying the mounted prop shape. Also switched the layout's `isStaging` to `$derived(data.isStaging)` to clear a `state_referenced_locally` warning.
- **Files modified:** src/routes/watch/[id]/page.test.ts, src/routes/+layout.svelte
- **Verification:** `pnpm check` → 0 errors / 0 warnings; the 16 watch route tests pass at runtime.
- **Committed in:** `141dcda` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes were essential for correctness — without #1 the gate would not have worked (apex would stay noindex), and #2 was a direct, unavoidable consequence of the correct fix. The implementation differs from the plan's `base`-based approach but achieves the exact must-haves via a more robust build-time env signal. No scope creep.

## Issues Encountered
- **Git Bash path conversion on Windows:** `BASE_PATH='/michelle_ngo_five'` was auto-translated to a Windows path by MSYS, causing `svelte.config.js` to reject the base. Resolved by prefixing staging builds with `MSYS_NO_PATHCONV=1` (test-harness-only; the GitHub Actions workflows are unaffected).

## Known Stubs
None — the gate is fully wired and verified from built output for both deploy targets.

## User Setup Required
None - no external service configuration required. The gate keys off the `BASE_PATH` env each workflow already sets.

## Next Phase Readiness
- **SEO-04 blocker cleared.** The apex build is now indexable while staging stays blocked — the precondition for the Phase 6 DNS flip is satisfied.
- Phase 6 can verify the gate in production using the new CUTOVER.md Step 5 item 6 (`curl https://michellengo.net/robots.txt` shows `Allow: /`; `curl https://michellengo.net/ | grep -i noindex` returns nothing).
- No shipped v1.0 UI surface changed behavior — edits are head-meta gating, a new prerender route, a server load, and docs only.

## Self-Check: PASSED

- FOUND: src/routes/+layout.server.ts
- FOUND: src/routes/robots.txt/+server.ts
- FOUND: .planning/phases/05-cutover-prep-make-indexable-clear-seo-deploy-debt/05-01-SUMMARY.md
- FOUND: static/robots.txt deleted (as planned)
- FOUND commits: 141dcda, 74b6f07, 8e94aef

---
*Phase: 05-cutover-prep-make-indexable-clear-seo-deploy-debt*
*Completed: 2026-06-18*
