---
phase: 02-shared-components-card-destinations-seo
plan: 03
subsystem: ui
tags: [sveltekit, adapter-static, prerender, entries, canonical, seo, pbs, video-grid]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: 56-video Zod-validated data layer ($lib/data), dark token system, base-path wiring
  - phase: 02-shared-components-card-destinations-seo (Plan 02-01)
    provides: VideoCard.svelte, categoryAccent helper, TopNav active-link detection
provides:
  - /work browse surface (all 56 videos, 2/3/4 responsive VideoCard grid)
  - /work/[category] — 8 prerendered filtered grids via entries() (deep-link safe)
  - /pbs-american-portrait flagship landing (18 videos, intro copy, outbound link, per-card PBS badges)
  - Base-path-safe rel=canonical on /work, all 8 /work/[category], and /pbs-american-portrait (SEO-01, browse surfaces)
affects: [02-04-sitemap-and-about-press-contact, 03-rails-home, watch-page-more-rail]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "EntryGenerator over CATEGORIES single-source-of-truth so all 8 category pages prerender (adapter-static strict:true)"
    - "Absolute production-host canonicals (https://michellengo.net/...) NOT base-relative — Pitfall 11"
    - "Sort comparator (featured-first then published date desc) computed in load() — zero client-side ordering JS"

key-files:
  created:
    - src/routes/work/+page.ts
    - src/routes/work/+page.svelte
    - src/routes/work/page.test.ts
    - src/routes/work/[category]/+page.ts
    - src/routes/work/[category]/+page.svelte
    - src/routes/work/[category]/page.test.ts
    - src/routes/pbs-american-portrait/+page.ts
    - src/routes/pbs-american-portrait/+page.svelte
    - src/routes/pbs-american-portrait/page.test.ts
    - src/routes/pbs-american-portrait/_pbsCollectionUrl.ts
    - src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts
  modified: []

key-decisions:
  - "Canonical convention matched to Plan 02-02's watch canonical: absolute production host, trailing-slash, not base-relative"
  - "Verbatim port from michelle_ngo_four with imports repointed to v5 $lib paths; nested-<li> badge pattern kept as v4 shipped it (svelte-check 0 errors)"
  - "Category-page canonical slug derived from data.category via categoryToSlug() (not params) so it always matches rendered data"

patterns-established:
  - "Pattern: dynamic prerendered routes export entries() enumerating every param from the data layer's source-of-truth array"
  - "Pattern: per-page <link rel=canonical> lives in each route's svelte:head, owned by the plan that owns the route"

requirements-completed: [BRWS-01, BRWS-02, PBS-01, SEO-01]

# Metrics
duration: 17min
completed: 2026-06-14
---

# Phase 2 Plan 3: Browse Surfaces + PBS Flagship Summary

**Ported v4's /work (all 56), /work/[category] (8 entries()-prerendered filtered grids), and the /pbs-american-portrait flagship (18 videos + approved intro copy + per-card PBS badges) into v5's VideoCard/token system, each with a base-path-safe production-host canonical.**

## Performance

- **Duration:** 17 min
- **Started:** 2026-06-14T17:48:00Z
- **Completed:** 2026-06-14T18:05:00Z
- **Tasks:** 2
- **Files modified:** 11 created

## Accomplishments
- /work renders all 56 videos featured-first/date-desc in a 2/3/4 responsive VideoCard grid; prerenders to build/work/index.html with a canonical.
- /work/[category] prerenders exactly 8 filtered grids (one per category, entries()-driven) so deep-linking any category slug returns the page, not a 404. Unknown slugs throw 404. Each emits its own production-host canonical.
- /pbs-american-portrait flagship: PBS-accent h1, "18 stories produced by Michelle Ngo" subtitle, the user-approved blockquote + attribution, outbound pbs.org link (target=_blank rel=noopener), an 18-card grid, and 15 per-card "See on PBS" badges extracted from descriptions via _pbsCollectionUrl. Emits a canonical.
- SEO-01 (browse surfaces): /work, all 8 /work/[category], and /pbs-american-portrait carry base-path-safe rel=canonical links in the build output.

## Task Commits

Each task was committed atomically:

1. **Task 1: /work + /work/[category] + canonicals** - `8c4fe1d` (feat)
2. **Task 2: /pbs-american-portrait flagship + canonical** - `897fe2a` (feat)

**Plan metadata:** (docs commit — this summary + STATE/ROADMAP)

## Files Created/Modified
- `src/routes/work/+page.ts` - load returns all 56 videos, featured-first/date-desc sort
- `src/routes/work/+page.svelte` - 2/3/4 VideoCard grid + /work canonical
- `src/routes/work/page.test.ts` - 56-count, sort, non-mutation assertions
- `src/routes/work/[category]/+page.ts` - entries() over 8 CATEGORIES + 404-narrowing filtered load
- `src/routes/work/[category]/+page.svelte` - accent heading, PBS cross-link, grid + per-category canonical
- `src/routes/work/[category]/page.test.ts` - entries()=8, valid/unknown-slug, sort, PBS cross-link mount tests
- `src/routes/pbs-american-portrait/+page.ts` - getByCategory('PBS American Portrait') → 18, sorted
- `src/routes/pbs-american-portrait/+page.svelte` - flagship landing (intro copy, outbound link, badges) + canonical
- `src/routes/pbs-american-portrait/page.test.ts` - 18-card, h1/subtitle/blockquote/outbound/h2, 15-badge, canonical tests
- `src/routes/pbs-american-portrait/_pbsCollectionUrl.ts` - first-match collection-URL extractor with trailing-punct strip
- `src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts` - 15 positive / 3 null / edge-case extractions

## Decisions Made
- Matched the canonical convention to Plan 02-02's watch canonical: absolute `https://michellengo.net/...` with trailing slash, NOT base-relative (Pitfall 11).
- Category-page canonical slug is derived from `data.category` via `categoryToSlug()` rather than `params.category`, so the emitted canonical always matches the rendered data.
- Kept v4's nested-`<li>` per-card badge structure verbatim (VideoCard owns its own `<li>`); `pnpm check` reports 0 errors/0 warnings, so no divergent VideoCard variant was introduced.

## Deviations from Plan
None - plan executed exactly as written. Both files_modified lists, acceptance criteria, and verification commands passed on the verbatim port (imports repointed to v5 `$lib` paths). Added one extra in-route canonical assertion to the PBS page test to cover SEO-01 directly.

## Issues Encountered
- The acceptance grep `! grep -RnE 'href="/[a-z]' src/routes/work/` matches two lines — but both are querySelector strings inside `page.test.ts` (`a[href="/pbs-american-portrait/"]`), which assert the runtime-resolved href under the mocked `base:''`. The page markup files (`+page.svelte`/`+page.ts`) contain zero leading-slash local hrefs; the built cross-link resolves to a relative `../../pbs-american-portrait/`. No source-level base-path violation.
- `grep -c 'collection/'` on the minified build HTML returned 1 (line count, not occurrence count). `grep -o | wc -l` confirms 15 badge URLs, 15 "See on PBS" labels, and 18 card watch-links in the built page.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Browse surfaces and the PBS flagship are live destinations for category nav links and the watch-page "more in {category}" rail.
- Plan 02-04 owns the remaining canonicals (about/press/contact) and the sitemap; watch canonicals are already shipped by Plan 02-02. SEO-01 is now partial (browse surfaces complete).
- svelte.config.js's scoped prerender.handleHttpError tolerance was left untouched (wave 3 removes it).

---
*Phase: 02-shared-components-card-destinations-seo*
*Completed: 2026-06-14*

## Self-Check: PASSED

All 11 created route/test files and the SUMMARY exist on disk; both task commits (8c4fe1d, 897fe2a) are present in git history. Build exits 0, 8 category pages + /work + /pbs prerender with canonicals, 31 tests pass, pnpm check 0 errors.
