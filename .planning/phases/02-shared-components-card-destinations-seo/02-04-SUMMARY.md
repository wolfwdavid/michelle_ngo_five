---
phase: 02-shared-components-card-destinations-seo
plan: 04
subsystem: ui
tags: [sveltekit, seo, json-ld, sitemap, prerender, canonical, static-pages]

# Dependency graph
requires:
  - phase: 02-01
    provides: ContactBlock (shared single-source contact), sitewide OG/Twitter head in +layout.svelte
  - phase: 02-02
    provides: 56 /watch/[id] routes (sitemap watch destinations + press credit targets) and VideoObject JSON-LD (SEO-02 other half)
  - phase: 02-03
    provides: /work, /work/[category] ×8, /pbs-american-portrait (sitemap category destinations + their canonicals)
provides:
  - /about page (approved bio + ContactBlock + Person JSON-LD, SEO-02 half)
  - /press page (network-grouped broadcast credits derived from videos.json)
  - /contact page (shared ContactBlock surface, no form)
  - Prerendered /sitemap.xml enumerating all 70 routes (6 static + 8 category + 56 watch)
  - Per-page canonicals for /about, /press, /contact (absolute production host)
  - Strict prerendering restored (scoped Wave-2 tolerance removed; broken internal links fail the build)
affects: [phase-04-deploy, robots-txt, apex-cutover]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Static page = h1 + content + shared ContactBlock, max-w-2xl/3xl editorial container"
    - "Per-page <svelte:head> overrides title + description and ADDS an absolute-host rel=canonical on top of the layout's sitewide OG/Twitter"
    - "Sitemap as a prerendered +server.ts emitting absolute production URLs (NOT base-relative, Pitfall 11)"
    - "Canonical ownership partitioned across plans (02-04 owns about/press/contact only — no cross-plan head writes)"

key-files:
  created:
    - src/routes/about/+page.svelte
    - src/routes/about/page.test.ts
    - src/routes/press/+page.ts
    - src/routes/press/+page.svelte
    - src/routes/press/page.test.ts
    - src/routes/press/_pressCredits.ts
    - src/routes/press/_pressCredits.test.ts
    - src/routes/contact/+page.svelte
    - src/routes/contact/page.test.ts
    - src/routes/sitemap.xml/+server.ts
    - src/routes/sitemap.xml/server.test.ts
  modified:
    - svelte.config.js

key-decisions:
  - "Person JSON-LD sameAs literals mirror v5 ContactBlock exactly (IMDb/LinkedIn channel-homepage fallbacks + Vimeo user2149742); both files must be edited together if URLs change"
  - "Sitemap emits absolute production host regardless of BASE_PATH — staging is noindex so wrong-host sitemap on staging is harmless; production build emits identical content"
  - "Removing the scoped prerender tolerance now (last leg of the phase) is the cheapest place to prove every chrome/internal link resolves — strict build is the proof"

patterns-established:
  - "Canonical ownership partition: each plan in this phase owns canonicals only for the routes it created; no cross-plan head edits"
  - "Press credits derive from data (videos.json) via a route-local _-prefixed helper, ordered by a hand-tuned PRESTIGE_ORDER, with unknown uploaders appended defensively"

requirements-completed: [PAGE-01, PAGE-02, PAGE-03, SEO-01, SEO-02, SEO-03]

# Metrics
duration: 36min
completed: 2026-06-14
---

# Phase 2 Plan 04: Static Pages, Per-Page SEO & Sitemap Summary

**Ported v4's /about (approved bio + Person JSON-LD), /press (13 network-grouped broadcast credits), and /contact (shared ContactBlock) onto v5's dark tokens, added a prerendered 70-URL /sitemap.xml + per-page canonicals, and restored strict prerendering with a clean build.**

## Performance

- **Duration:** 36 min
- **Started:** 2026-06-14T22:32:29Z
- **Completed:** 2026-06-14T23:08:52Z
- **Tasks:** 2
- **Files modified:** 12 (11 created, 1 modified)

## Accomplishments
- /about presents Michelle's approved bio, the shared ContactBlock, and emits Person JSON-LD (the SEO-02 half that co-covers with the watch pages' VideoObject JSON-LD)
- /press lists 13 broadcast credits grouped by network in prestige order (HBO Max, HBO, PBS, ABC News, U2, Amazon News, Music Box, …), each row linking to its /watch/[id]
- /contact reuses the one ContactBlock (PAGE-03 single source — same component on about + footer + contact)
- /sitemap.xml prerenders exactly 70 absolute-host `<loc>` entries (6 static + 8 category + 56 watch) — verified against the actual build output
- about/press/contact each carry a title + meta description + absolute-host canonical on top of the layout's sitewide OG/Twitter card
- Scoped Wave-2 prerender tolerance removed; strict `BASE_PATH=/michelle_ngo_five pnpm build` exits 0, proving every chrome/internal link now resolves to a real prerendered route

## Task Commits

Each task was committed atomically:

1. **Task 1: Port /about (Person JSON-LD), /press (credits helper), /contact (ContactBlock)** — `bb76c0b` (feat)
2. **Task 2: Port /sitemap.xml (70 URLs) + static-page canonicals + restore strict prerender** — `81d7d40` (feat)

**Plan metadata:** _(final docs commit below)_

## Files Created/Modified
- `src/routes/about/+page.svelte` — About page: approved bio, ContactBlock, Person JSON-LD, canonical
- `src/routes/about/page.test.ts` — h1, bio first-person token, container width, 5-channel ContactBlock
- `src/routes/press/+page.ts` — load() returns grouped credits from the route-local helper
- `src/routes/press/+page.svelte` — Press page: per-network sections, `${base}/watch/${id}` rows, canonical
- `src/routes/press/page.test.ts` — 13 groups in prestige order, 13 credit anchors, no count suffix
- `src/routes/press/_pressCredits.ts` — derives network groups from videos.json (uploader !== 'Michelle Ngo'), PRESTIGE_ORDER
- `src/routes/press/_pressCredits.test.ts` — filter + grouping invariants + prestige order
- `src/routes/contact/+page.svelte` — Contact page: shared ContactBlock, no form, canonical
- `src/routes/contact/page.test.ts` — h1, container width, 5-channel ContactBlock, asserts no `<form>`
- `src/routes/sitemap.xml/+server.ts` — prerendered 70-URL sitemap, absolute production host
- `src/routes/sitemap.xml/server.test.ts` — exact 70 loc count + all destinations + no base-relative leakage
- `svelte.config.js` — removed scoped Wave-2 prerender.handleHttpError tolerance (strict prerender fully fatal again)

## Decisions Made
- Person JSON-LD sameAs mirrors the v5 ContactBlock literals exactly (verified before porting — they matched v4 byte-for-byte, so the approved Person block ported verbatim).
- Sitemap emits absolute production host irrespective of BASE_PATH (Pitfall 11); the staging-host caveat is acceptable because staging is noindex.
- Canonicals were added in Task 2 (about's canonical was added alongside its Task-1 port for head locality, press/contact canonicals added in Task 2) — ownership stays strictly within about/press/contact; /work, /work/[category], /pbs, and /watch canonicals were left untouched (owned by Plans 02-03/02-02).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed `noUncheckedIndexedAccess` type error in sitemap test**
- **Found during:** Task 2 (sitemap server.test.ts)
- **Issue:** `videos[0].id` flagged by svelte-check as "Object is possibly 'undefined'" under the project's strict indexed-access config, failing `pnpm check`.
- **Fix:** Captured `const firstVideo = videos[0]`, asserted it is defined, then used `firstVideo!.id`.
- **Files modified:** src/routes/sitemap.xml/server.test.ts
- **Verification:** `pnpm check` → 0 errors, 0 warnings; sitemap test still green (7/7).
- **Committed in:** `81d7d40` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking type error in this plan's own new file).
**Impact on plan:** Trivial type-safety fix in a test file. No scope creep, no production-code change.

## Issues Encountered
- The plan's literal acceptance grep `grep -q '"Person"'` (double-quoted) does not match the ported source, which uses single-quoted `'@type': 'Person'` (identical to the approved v4 source). The substantive requirement — Person JSON-LD with a `sameAs` array, and `"@type":"Person"` in the built HTML — is fully met and verified against `build/about/index.html`. No code change was warranted (rewriting to double quotes would diverge from the approved verbatim port and prettier's single-quote style).

## Known Stubs
None — all three pages render real approved content; press credits derive from the live 56-video dataset; the sitemap enumerates real built destinations (verified: 56 watch + 8 category index.html files on disk).

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- All Phase 2 destinations now exist; strict prerendering is fully fatal again, so any future broken internal link fails the build immediately.
- Phase 3 (rails homepage + hero) can proceed; the /sitemap.xml is ready for the Phase-4 robots.txt `Sitemap:` directive.
- The sitemap's absolute-host emission is the correct production behavior for the apex (michellengo.net) cutover in Phase 4.

## Self-Check: PASSED

All 12 plan files verified present on disk; both task commits (`bb76c0b`, `81d7d40`) verified in git history. Strict `BASE_PATH=/michelle_ngo_five pnpm build` exits 0; `build/sitemap.xml` has exactly 70 `<loc>`; 56 watch + 8 category index.html emitted; about/press/contact built with canonicals; Person JSON-LD in built about HTML. `pnpm check` 0 errors / 0 warnings; full `pnpm test` 181/181 green.

---
*Phase: 02-shared-components-card-destinations-seo*
*Completed: 2026-06-14*
