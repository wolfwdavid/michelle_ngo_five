---
phase: 01-foundation-data-reuse-proven-deploy
plan: 02
subsystem: database
tags: [zod, vitest, vite-plugin, data-layer, sveltekit, typescript]

# Dependency graph
requires:
  - phase: 01-foundation-data-reuse-proven-deploy (Plan 01)
    provides: scaffolded SvelteKit + Tailwind toolchain, Phase-1-subset vite.config.ts, deps (zod, vitest) installed
provides:
  - "$lib/data barrel: typed, Zod-validated 56-video dataset + loader API"
  - "Zod 4 VideoSchema (discriminatedUnion on source, strictObject) + VideoArraySchema"
  - "canonical 8-category taxonomy (CATEGORIES, categoryToSlug, slugToCategory)"
  - "typed loader: videos, getById, getByCategory, getCategoriesInDisplayOrder, getCategoriesWithCounts, producerReelId"
  - "build-time validation: validateVideosPlugin aborts pnpm build on schema violation or duplicate (source,id)"
  - "vitest two-project config (data=node, ui=jsdom) + IntersectionObserver stub"
affects: [03-design-tokens-motion-util, rails-home, watch-page, work-browse, pbs-landing]

# Tech tracking
tech-stack:
  added: [zod (build-time data validation), vitest two-project setup]
  patterns:
    - "Build-time data validation via Vite buildStart plugin (fail-fast, row-pointing prettify error)"
    - "Single $lib/data public barrel as the only data import path"
    - "Loader re-parses with Zod to materialize D-08 defaults (featured/hidden/tags)"

key-files:
  created:
    - src/lib/data/categories.ts
    - src/lib/data/schema.ts
    - src/lib/data/videos.ts
    - src/lib/data/index.ts
    - src/lib/data/videos.json
    - src/lib/index.ts
    - src/lib/data/categories.test.ts
    - src/lib/data/schema.test.ts
    - src/lib/data/videos.test.ts
    - src/lib/data/videos.json.test.ts
    - vitest-setup-ui.ts
  modified:
    - vite.config.ts

key-decisions:
  - "Verbatim port from michelle_ngo_four — zero base-path/repo-name coupling, fastest content-complete path"
  - "validateVideosPlugin enforces DATA-02 at build time as defense-in-depth alongside vitest"
  - "Ported dataset already carries the 8 featured flips (matches D-23 quota), so Phase-4 featured tests are green now"

patterns-established:
  - "Build-time Zod validation: bad data fails pnpm build with a row-pointing error, never the browser"
  - "Plugin order [tailwindcss(), validateVideosPlugin(), sveltekit()] — validation aborts before route compilation"

requirements-completed: [DATA-01, DATA-02, DATA-03, DATA-04]

# Metrics
duration: 5min
completed: 2026-06-14
---

# Phase 01 Plan 02: Data Layer Port + Build Validation Summary

**Ported the validated 56-video data layer (Zod 4 schema, 8-category taxonomy, typed loader, dataset) from michelle_ngo_four verbatim and re-enabled the Vite buildStart plugin so a bad record fails `pnpm build` with a row-pointing error rather than reaching the browser.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-14T18:25:52Z
- **Completed:** 2026-06-14T18:30:52Z
- **Tasks:** 2 (1 auto, 1 tdd)
- **Files modified:** 12 (11 created, 1 modified)

## Accomplishments

- `$lib/data` barrel exposes the full loader API: `videos`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder`, `getCategoriesWithCounts`, `producerReelId`, plus `CATEGORIES`/`categoryToSlug`/`slugToCategory` and the `Video`/`Category` types.
- 56-record `videos.json` ported byte-identical: all 8 canonical categories, every record carries a non-empty thumbnail URL (DATA-04 data half), producer reel `vimeo:264677021` preserved in the public set.
- `validateVideosPlugin` re-installed in `vite.config.ts` (`buildStart` → `VideoArraySchema.safeParse` + cross-row `(source,id)` uniqueness → `this.error(z.prettifyError(...))`); plugin order `[tailwindcss(), validateVideosPlugin(), sveltekit()]`.
- vitest two-project config (`data`=node / `ui`=jsdom) and `vitest-setup-ui.ts` IntersectionObserver stub restored; 35 data tests pass.
- **DATA-02 proven empirically:** corrupting one record's `category` made `pnpm build` exit 1 with `✖ Invalid option ... → at [3].category`; restoring the dataset returned the build to green (exit 0).

## Task Commits

1. **Task 1: Port the data layer files + dataset verbatim** — `9476f5a` (feat)
2. **Task 2: Re-enable build-time validation + port data tests** — `7b349f7` (feat, TDD: tests + plugin landed together since modules were already ported)

**Plan metadata:** _(this commit)_ (docs: complete plan)

## Files Created/Modified

- `src/lib/data/categories.ts` - Canonical 8-category taxonomy, slug rules (created)
- `src/lib/data/schema.ts` - Zod 4 VideoSchema (discriminatedUnion/strictObject) + VideoArraySchema (created)
- `src/lib/data/videos.ts` - Typed loader, D-08 default materialization, display-order logic (created)
- `src/lib/data/index.ts` - `$lib/data` public barrel (created)
- `src/lib/data/videos.json` - 56-record dataset, 8 categories, 8 featured flips (created)
- `src/lib/index.ts` - `$lib` root barrel (created)
- `src/lib/data/*.test.ts` - 4 data test files, 35 tests (created)
- `vitest-setup-ui.ts` - jsdom IntersectionObserver stub for future ui tests (created)
- `vite.config.ts` - Replaced Phase-1 subset with full config: validateVideosPlugin + vitest projects block (modified)

## Decisions Made

- **Verbatim cp port** from `michelle_ngo_four` — the data-layer + config files have no base-path or repo-name coupling, so copying as-is is correct and lowest-risk.
- **Featured flips already present:** the ported dataset already has the 8 `featured: true` rows matching the D-23 quota (2 PBS, 2 Promos, 2 Branded, 1 Doc, 1 Reel, reel included), so the Phase-4 featured-slice tests in `videos.test.ts` pass now rather than being skipped. No future re-flip needed.

## Deviations from Plan

None - plan executed exactly as written. The single nuance: Task 2 is `type="tdd"`, but the test files act as the spec and the implementation modules were already ported in Task 1, so the tests were GREEN on first run (35/35). No separate RED commit was warranted because there was no failing-then-passing transition to capture — the RED proof is instead the deliberate dataset-corruption build failure (DATA-02), which was demonstrated and then reverted without committing broken data.

## Issues Encountered

None. `pnpm install` was not needed — `zod` and `vitest` were already present in `node_modules` from Plan 01.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `$lib/data` is content-complete, typed, and build-validated. Every later route (rails home, watch page, work browse, PBS landing) can import from it immediately.
- Plan 01-03 (design tokens + motion util) is unblocked; the `categoryAccent` test it owns will consume `CATEGORIES`/`categoryToSlug` from this barrel.
- No blockers introduced. The Phase-3 rails/hero research flag and Phase-4 CNAME-cutover concern from STATE.md remain unaffected.

## Self-Check: PASSED

All 12 claimed files verified on disk; both task commits (`9476f5a`, `7b349f7`) present in git history.

---
*Phase: 01-foundation-data-reuse-proven-deploy*
*Completed: 2026-06-14*
