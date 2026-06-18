---
phase: 05-cutover-prep-make-indexable-clear-seo-deploy-debt
verified: 2026-06-17T00:00:00Z
status: passed
score: 5/5 must-haves verified
---

# Phase 5: Cutover Prep Verification Report

**Phase Goal:** Make the production (apex) build search-indexable and clear the remaining SEO/deploy debt so the site is safe to take live — all verified on staging/preview before any DNS change. This phase neutralizes the milestone's central risk: an unconditional `noindex` going live.
**Verified:** 2026-06-17
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Apex build emits no `noindex` meta and a crawlable `robots.txt (Allow: /)`; staging keeps `Disallow: /` and `noindex`; difference driven by environment | VERIFIED | `+layout.server.ts` reads `$env/dynamic/private` BASE_PATH; `+layout.svelte` wraps noindex in `{#if isStaging}`; `robots.txt/+server.ts` branches on `process.env.BASE_PATH`; `static/robots.txt` deleted |
| 2 | Every prerendered page emits both `og:title` and `og:url` completing the per-page Open Graph set | VERIFIED | All 8 page files (`+page.svelte`, `about`, `press`, `contact`, `work`, `work/[category]`, `watch/[id]`, `pbs-american-portrait`) contain both `property="og:title"` and `property="og:url"` matching their `<title>` and `<link rel="canonical">` exactly |
| 3 | Production deploy workflow runs the same prerender-count guard as staging | VERIFIED | `deploy-production.yml` step `Assert prerender route count: node scripts/assert-prerender-count.mjs` present between the apex Build step and the CNAME verify step |
| 4 | Home page TopNav scroll-transparency activates because ReelHero emits `#hero-sentinel` | VERIFIED | `ReelHero.svelte` renders `<div id="hero-sentinel" aria-hidden="true"></div>` as last child of `.hero` section; scoped `#hero-sentinel` CSS rule sets `position: absolute; bottom: 0`; TopNav `$effect` calls `document.getElementById('hero-sentinel')` and observes it with IntersectionObserver |
| 5 | No shipped v1.0 UI surface changes behavior | VERIFIED | Changes are head-meta gating, a new prerendered route, a 1px decorative div, and CI step — no visual surfaces, layouts, or interactive components altered |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/routes/+layout.server.ts` | Prerendered server load surfacing `isStaging` from `$env/dynamic/private` BASE_PATH | VERIFIED | Exists; exports `load` returning `{ isStaging: basePath !== '' }`; uses `$env/dynamic/private` not `process.env` directly; graceful `''` default for apex |
| `src/routes/+layout.svelte` | Conditional noindex meta gated on `data.isStaging` | VERIFIED | `const isStaging = $derived(data.isStaging)`; `{#if isStaging}<meta name="robots" content="noindex, nofollow" />{/if}` in `<svelte:head>` |
| `src/routes/robots.txt/+server.ts` | Environment-gated prerendered robots.txt route | VERIFIED | `export const prerender = true`; reads `process.env.BASE_PATH`; apex branch: `Allow: /\nSitemap: https://michellengo.net/sitemap.xml`; staging branch: `Disallow: /` |
| `static/robots.txt` | Must be deleted (replaced by prerendered route) | VERIFIED | File does not exist |
| `.planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md` | SEO-04 verification step + Pre-flight bullet | VERIFIED | Contains `Indexing gate took effect (SEO-04)` (Step 5 item 6) and `Indexing gate (SEO-04):` Pre-flight bullet |
| `src/routes/+page.svelte` | og:title + og:url | VERIFIED | `"Michelle Ngo — Filmmaker & Producer"` / `"https://michellengo.net/"` |
| `src/routes/about/+page.svelte` | og:title + og:url | VERIFIED | `"About — Michelle Ngo"` / `"https://michellengo.net/about/"` |
| `src/routes/press/+page.svelte` | og:title + og:url | VERIFIED | `"Press — Michelle Ngo"` / `"https://michellengo.net/press/"` |
| `src/routes/contact/+page.svelte` | og:title + og:url | VERIFIED | `"Contact — Michelle Ngo"` / `"https://michellengo.net/contact/"` |
| `src/routes/work/+page.svelte` | og:title + og:url | VERIFIED | `"Work — Michelle Ngo"` / `"https://michellengo.net/work/"` |
| `src/routes/work/[category]/+page.svelte` | og:title + og:url (dynamic) | VERIFIED | Template expressions `${data.category} — Michelle Ngo` and `https://michellengo.net/work/${categorySlug}/` matching existing title and canonical |
| `src/routes/watch/[id]/+page.svelte` | og:title + og:url (dynamic) | VERIFIED | Template expressions `${video.title} — Michelle Ngo` and `https://michellengo.net/watch/${video.id}/` matching existing title and canonical |
| `src/routes/pbs-american-portrait/+page.svelte` | og:title + og:url | VERIFIED | `"PBS American Portrait — Michelle Ngo"` / `"https://michellengo.net/pbs-american-portrait/"` |
| `.github/workflows/deploy-production.yml` | Prerender-count guard step | VERIFIED | `Assert prerender route count` step with `run: node scripts/assert-prerender-count.mjs` present after Build and before CNAME verify; `BASE_PATH: ''` unchanged; trigger remains `workflow_dispatch` only |
| `src/lib/components/ReelHero.svelte` | `#hero-sentinel` div as last child of `.hero` section | VERIFIED | `<div id="hero-sentinel" aria-hidden="true"></div>` present at end of `.hero` section; `#hero-sentinel { position: absolute; bottom: 0; left: 0; width: 1px; height: 1px; pointer-events: none; }` in `<style>` block |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/routes/+layout.svelte` | `src/routes/+layout.server.ts` isStaging | `const isStaging = $derived(data.isStaging)` drives `{#if isStaging}` noindex meta | WIRED | Layout consumes server data; gate logic is `$derived` reactive |
| `src/routes/+layout.server.ts` | `$env/dynamic/private` BASE_PATH | `env.BASE_PATH ?? ''` where `env` is from `$env/dynamic/private` | WIRED | Reads build-time env; graceful empty default for apex |
| `src/routes/robots.txt/+server.ts` | `process.env.BASE_PATH` | `(process.env.BASE_PATH ?? '') !== ''` decision at prerender | WIRED | Node server-only context; both Allow and Disallow branches present with Sitemap line |
| `.github/workflows/deploy-production.yml` | `scripts/assert-prerender-count.mjs` | Step `run: node scripts/assert-prerender-count.mjs` in build job | WIRED | Step is between Build and CNAME-verify; matches staging deploy.yml verbatim |
| `src/lib/components/ReelHero.svelte` | `src/lib/components/TopNav.svelte` IntersectionObserver | `id="hero-sentinel"` element observed by `document.getElementById('hero-sentinel')` | WIRED | Sentinel exists in ReelHero; TopNav $effect queries it, creates IntersectionObserver with threshold 0, toggles `heroVisible` state |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SEO-04 | 05-01-PLAN.md | Apex build is search-indexable; noindex/Disallow: / apply staging-only via BASE_PATH gate | SATISFIED | `+layout.server.ts` + `+layout.svelte` gate noindex; `robots.txt/+server.ts` gates robots.txt; `static/robots.txt` deleted; CUTOVER.md updated |
| SEO-05 | 05-02-PLAN.md | Every page emits `og:title` and `og:url` | SATISFIED | All 8 prerendered page `.svelte` files contain both meta properties; values mirror existing `<title>` and `<link rel="canonical">` |
| DPLY-01 | 05-02-PLAN.md | Prerender-count guard runs in production deploy workflow | SATISFIED | `deploy-production.yml` contains `Assert prerender route count` step verbatim from staging workflow |
| HERO-05 | 05-02-PLAN.md | ReelHero emits `#hero-sentinel` so TopNav scroll-transparency activates | SATISFIED | Sentinel div present at bottom of `.hero` section with correct absolute positioning; TopNav observer contract confirmed unchanged |

All 4 phase-5 requirements accounted for. No orphaned requirements: REQUIREMENTS.md maps SEO-04, SEO-05, DPLY-01, HERO-05 to Phase 5 and marks all four `[x]` complete.

### Anti-Patterns Found

None found. Scanned key changed files:

- `src/routes/+layout.server.ts` — substantive load function, no stubs
- `src/routes/+layout.svelte` — gate is conditional render, not empty/placeholder
- `src/routes/robots.txt/+server.ts` — both branches produce real content; `prerender = true`; no `return null`/`return {}`
- `src/lib/components/ReelHero.svelte` — sentinel is a real `id="hero-sentinel"` div with positioning CSS, not a TODO placeholder
- `.github/workflows/deploy-production.yml` — guard step is a real `node scripts/...` invocation, not a placeholder comment

### Human Verification Required

The following item requires a human on the live apex after the DNS flip (Phase 7) but is not a blocker for Phase 5 goal achievement — Phase 5 verifies the gate is wired, not that it took effect in production (that is Phase 7's scope):

**1. Production indexing gate active at michellengo.net**
- **Test:** After Phase 6 DNS flip: `curl -s https://michellengo.net/robots.txt` and `curl -s https://michellengo.net/ | grep -i noindex`
- **Expected:** robots.txt shows `Allow: /` + Sitemap line; index.html contains no `noindex`
- **Why human:** Requires the actual apex to be live (Phase 6 prerequisite)

### Commits Verified

All 6 commits documented in summaries confirmed present in git history:

| Commit | Message | Plan |
|--------|---------|------|
| `141dcda` | feat(05-01): environment-gate the noindex robots meta | 05-01 |
| `74b6f07` | feat(05-01): env-gate robots.txt via prerendered route | 05-01 |
| `8e94aef` | docs(05-01): add SEO-04 indexing-gate verification to CUTOVER.md | 05-01 |
| `2c18b42` | feat(05-02): add per-page og:title and og:url to all 8 page heads | 05-02 |
| `e0cd636` | ci(05-02): wire prerender-count guard into production deploy workflow | 05-02 |
| `55eabdb` | feat(05-02): emit #hero-sentinel in ReelHero for scroll-transparent nav | 05-02 |

### Notable Deviations (Auto-Fixed, No Impact on Goal)

The 05-01 plan specified gating on `base` from `$app/paths` but the implementation correctly pivoted to `$env/dynamic/private` in `+layout.server.ts`. This is a **more robust** implementation: adapter-static's relative paths make `base` resolve to `'.'` in both builds. The must-haves (gate driven by environment, staging stays blocked, apex is crawlable) are all met by the actual implementation.

### Summary

Phase 5 goal is fully achieved. The four requirements (SEO-04, SEO-05, DPLY-01, HERO-05) are all satisfied and independently verified in source files and git history. The apex build will be search-indexable (no noindex meta, robots.txt Allow: /), all 8 prerendered pages carry complete Open Graph metadata, the production deploy CI is guarded against prerender-count drift, and the home page TopNav scroll-transparency is wired via the #hero-sentinel sentinel. No v1.0 UI surfaces were altered. Phase 6 (DNS flip) may proceed.

---

_Verified: 2026-06-17_
_Verifier: Claude (gsd-verifier)_
