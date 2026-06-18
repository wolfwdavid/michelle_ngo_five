# Requirements: michelle_ngo_five — v1.1 Production Cutover

**Defined:** 2026-06-17
**Core Value:** Visitors can immediately see and play Michelle's video work, browsing it by category in a fast, dark, YouTube-like interface — premium feel, fast on mobile.

> v1.0 ("Cinematic Rails Portfolio", 41 requirements) shipped 2026-06-17 — see `.planning/milestones/v1.0-REQUIREMENTS.md`. This milestone takes that verified build live on the real domain.

## v1.1 Requirements

Requirements for the production cutover. Each maps to a roadmap phase.

### Indexing & SEO

- [ ] **SEO-04**: The production (apex) build is search-indexable — the `noindex` robots meta and `robots.txt Disallow: /` apply on the staging build only, gated by environment, so the live apex is crawlable
- [x] **SEO-05**: Every page emits `og:title` and `og:url` (completing the per-page Open Graph set begun in SEO-01)

### Deploy & Cutover

- [x] **DPLY-01**: The prerender-count guard (56 watch + 8 category pages) runs in the production deploy workflow, matching the staging workflow
- [ ] **DPLY-02**: DNS cutover to michellengo.net is executed per `CUTOVER.md` — CNAME preserved across deploys, base-`''` build served at the apex, HTTPS valid

### Launch Verification

- [ ] **LIVE-01**: The live apex is verified search-indexable (robots/meta correct) and renders every route — home, the 8 rails, watch, /work + category grids, PBS flagship, about/press/contact
- [ ] **LIVE-02**: The rails browse + watch (play) flow works on a real iPhone and Android at michellengo.net

### Polish

- [x] **HERO-05**: ReelHero emits a `#hero-sentinel` element so the TopNav scroll-transparency behavior activates on the home page (cosmetic; deferred from v1.0)

## Future Requirements

Deferred to a later milestone (likely v1.2 "Features"). Tracked, not in this roadmap.

### Features (FEAT)

- **FEAT-01**: Visitor can search/filter the 56 videos
- **FEAT-02**: Visitor can contact Michelle via an in-page form (vs. mailto)
- **FEAT-03**: Privacy-respecting analytics on the live site
- **FEAT-04**: Content refresh — add newer videos beyond the curated 56

## Out of Scope

Explicitly excluded for v1.1. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| New product/browse features | This milestone is cutover only — features wait until the site is live (v1.2) |
| Content refresh / new videos | Reuse v1.0's curated 56; refresh is a later milestone |
| Light mode / theme toggle | v5 is dark-only by design decision (carried from v1.0) |
| CMS / runtime backend | Static-only on GitHub Pages (carried from v1.0) |
| Redesign of any v1.0 surface | v1.0 is verified and approved; cutover must not alter shipped UI |

## Traceability

Which phases cover which requirements. v1.1 continues phase numbering from v1.0 (which ended at Phase 4).

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEO-04 | Phase 5 | Pending |
| SEO-05 | Phase 5 | Complete |
| DPLY-01 | Phase 5 | Complete |
| HERO-05 | Phase 5 | Complete |
| DPLY-02 | Phase 6 | Pending |
| LIVE-01 | Phase 7 | Pending |
| LIVE-02 | Phase 7 | Pending |

**Coverage:**
- v1.1 requirements: 7 total
- Mapped to phases: 7 ✓
- Unmapped: 0

**Ordering constraint:** Phase 5 (SEO-04 make-indexable + SEO-05/DPLY-01/HERO-05 debt) must land and be verified BEFORE Phase 6 (DPLY-02 DNS flip). Flipping DNS while the apex is unconditionally `noindex` would hide the live site from search engines — the milestone's central risk. Phase 7 (LIVE-01/LIVE-02 verification) follows the flip.

---
*Requirements defined: 2026-06-17*
*Last updated: 2026-06-17 after v1.1 roadmap creation (Phases 5–7, full coverage)*
