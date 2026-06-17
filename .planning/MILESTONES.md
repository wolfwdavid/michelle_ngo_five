# Milestones

## v1.0 Cinematic Rails Portfolio (Shipped: 2026-06-17)

**Phases completed:** 4 phases, 12 plans, 20 tasks
**Stats:** 62 commits · 142 files · ~19.9k insertions · ~5,218 src LOC · 4 days (2026-06-14 → 2026-06-17)
**Live:** https://wolfwdavid.github.io/michelle_ngo_five/ (GitHub Pages)

**Delivered:** A dark, cinematic, YouTube-style static portfolio for filmmaker Michelle Ngo — 56 films across 8 horizontal category rails, prerendered to GitHub Pages with no backend, ~90% a verbatim port of sibling michelle_ngo_four plus the new signature rails homepage and parallax reel hero.

**Key accomplishments:**

- **Foundation (P1):** Base-path-safe SvelteKit scaffold + verbatim-ported Zod-validated 56-video data layer (bad record fails the build), dark OKLCH token system, single reduced-motion gate, green staging deploy.
- **Content-complete (P2):** Leaf components + TopNav/Footer chrome, 56 facade watch pages (VideoObject JSON-LD), /work + 8 category grids, PBS flagship, about/press/contact, 70-URL sitemap + per-page canonicals/SEO.
- **Signature home (P3):** 8 accent-labeled CategoryRails (scroll-snap, gate-aware paging) led by a full-bleed double-gated CSS-3D parallax ReelHero whose PLAY REEL opens a focus-trapped lightbox — zero iframes on home, build-enforced.
- **Quality gates (P4):** Four automated launch gates (axe WCAG-AA × 8 routes, mobile Lighthouse LCP 2.05s/CLS 0/perf 98, responsive 375–1440 + mobile-nav, single-gate reduced-motion) green across Chromium/WebKit/Firefox; 9 violations fixed at source; real-device iPhone+Android QA approved.
- **Deploy hardened (P4):** Both workflows on current action majors, prerender-count CI guard (56+8), verified base-'' apex build, copy-paste CUTOVER.md runbook.

### Known Gaps (accepted as tech debt — see v1.0-MILESTONE-AUDIT.md)

- **Apex DNS cutover deferred** by user decision (2026-06-16): site lives on GitHub Pages; michellengo.net untouched. CUTOVER.md is the ready runbook. *(milestone success criterion #4)*
- **🔴 Pre-cutover fix required:** `+layout.svelte` + `robots.txt` are unconditionally `noindex`/`Disallow: /` (correct for staging, fatal for the apex). Must be environment-gated and added to CUTOVER.md before the DNS flip, or the live site is invisible to search engines. *(SEO-01/02/03)*
- Prerender-count guard not wired into the production workflow *(FND-05)*; `og:title`/`og:url` absent *(SEO-01)*; ReelHero never emits `#hero-sentinel` so TopNav scroll-transparency is dormant (cosmetic).

---
