---
phase: 05-cutover-prep-make-indexable-clear-seo-deploy-debt
plan: 02
subsystem: seo-deploy-chrome
tags: [seo, open-graph, ci, deploy, nav, hero]
requires:
  - "SEO-01 per-page absolute canonicals (Phase 2)"
  - "scripts/assert-prerender-count.mjs (Phase 4)"
  - "TopNav #hero-sentinel IntersectionObserver contract (Phase 3)"
provides:
  - "Per-page og:title + og:url on all 8 prerendered page heads (SEO-05)"
  - "Prerender-count guard in the production/apex deploy workflow (DPLY-01)"
  - "#hero-sentinel in ReelHero activating scroll-transparent nav on / (HERO-05)"
affects:
  - "src/routes/*/+page.svelte head metadata"
  - ".github/workflows/deploy-production.yml build job"
  - "src/lib/components/ReelHero.svelte hero section + styles"
tech-stack:
  added: []
  patterns:
    - "og:title/og:url mirror the existing <title> + canonical per page (no new sources of truth)"
    - "decorative 1px absolutely-positioned sentinel observed by an existing IntersectionObserver"
key-files:
  created: []
  modified:
    - "src/routes/+page.svelte"
    - "src/routes/about/+page.svelte"
    - "src/routes/press/+page.svelte"
    - "src/routes/contact/+page.svelte"
    - "src/routes/work/+page.svelte"
    - "src/routes/work/[category]/+page.svelte"
    - "src/routes/watch/[id]/+page.svelte"
    - "src/routes/pbs-american-portrait/+page.svelte"
    - ".github/workflows/deploy-production.yml"
    - "src/lib/components/ReelHero.svelte"
decisions:
  - "og values mirror title/canonical verbatim rather than introducing OG-specific copy — keeps a single per-page source of truth and matches SEO-01."
  - "Sentinel is a 1px decorative div (aria-hidden, no pointer events) pinned to the hero's bottom edge — zero layout/visual impact, reuses TopNav's existing observer (TopNav untouched)."
  - "Production guard step copied verbatim from staging deploy.yml for true parity."
metrics:
  duration_min: 4
  tasks: 3
  files_modified: 10
  completed: 2026-06-17
---

# Phase 5 Plan 02: SEO/Deploy Debt Cleanup Summary

Cleared the three remaining cutover-blocking debt items — per-page `og:title`/`og:url` on all 8 prerendered heads (SEO-05), a 56+8 prerender-count guard in the production/apex deploy workflow (DPLY-01), and a `#hero-sentinel` in ReelHero that activates TopNav's scroll-transparent nav on `/` (HERO-05) — with no change to any shipped v1.0 visible UI surface.

## What Was Built

### Task 1 — Per-page og:title + og:url (SEO-05)
Added two `<meta property="og:*">` lines immediately after the existing `<link rel="canonical">` in each of the 8 page heads. `og:title` mirrors the page `<title>` text and `og:url` mirrors the page's absolute canonical href exactly — including the dynamic template expressions for `/work/[category]` (`${data.category} — Michelle Ngo` / `https://michellengo.net/work/${categorySlug}/`) and `/watch/[id]` (`${video.title} — Michelle Ngo` / `https://michellengo.net/watch/${video.id}/`). The sitewide `og:image`/`og:type`/`og:site_name` in `+layout.svelte` were left untouched (SEO-05 is per-page only).

### Task 2 — Production prerender-count guard (DPLY-01)
Inserted the `Assert prerender route count` step (`run: node scripts/assert-prerender-count.mjs`) into the `build` job of `deploy-production.yml`, between the apex Build step and the CNAME verify step — verbatim from staging `deploy.yml`. The apex deploy now fails CI on any route-count drift (must be exactly 56 watch + 8 category + required static pages), matching staging. `BASE_PATH: ''` and the workflow_dispatch-only trigger are unchanged.

### Task 3 — #hero-sentinel (HERO-05)
Rendered `<div id="hero-sentinel" aria-hidden="true"></div>` as the last child of the `.hero` section in ReelHero, with a scoped `position: absolute; bottom: 0; left: 0; width: 1px; height: 1px; pointer-events: none` rule. Because `.hero` is `position: relative` with `min-height: 88svh`, the sentinel sits at the hero's bottom edge — it intersects the viewport while the hero is on screen and leaves on scroll-past, driving TopNav's existing `getElementById('hero-sentinel')` IntersectionObserver (threshold 0) to toggle transparent-over-hero / solid-after-scroll. TopNav was not modified.

## Verification

- Apex build (`BASE_PATH='' pnpm build`) succeeded including the home zero-iframe guard.
- All static pages (home, about, press, contact, work, pbs) contain both `property="og:title"` and `property="og:url"` in built HTML.
- Sampled `build/watch/264677021/index.html` og:url = `https://michellengo.net/watch/264677021/`; sampled `build/work/reel/index.html` og:url = `https://michellengo.net/work/reel/` — each equals that page's canonical.
- `build/index.html` contains `id="hero-sentinel"`.
- `deploy-production.yml` contains `assert-prerender-count.mjs` and still builds with `BASE_PATH: ''`.
- `git diff` shows TopNav.svelte unchanged.
- `pnpm check`: 496 files, 0 errors, 0 warnings.

## Deviations from Plan

None — plan executed exactly as written.

## Commits

- `2c18b42` feat(05-02): add per-page og:title and og:url to all 8 page heads
- `e0cd636` ci(05-02): wire prerender-count guard into production deploy workflow
- `55eabdb` feat(05-02): emit #hero-sentinel in ReelHero for scroll-transparent nav

## Known Stubs

None.

## Self-Check: PASSED

- SUMMARY.md present at expected path.
- All 3 commits found in history (2c18b42, e0cd636, 55eabdb).
