# Roadmap: michelle_ngo_five

## Milestones

- ✅ **v1.0 Cinematic Rails Portfolio** — Phases 1–4 (shipped 2026-06-17) → [archive](milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 Production Cutover** — Phases 5–7 (active) — take the verified v1.0 build live on michellengo.net

## Phases

**Phase Numbering:**
- Integer phases (5, 6, 7): Planned milestone work. v1.1 continues from v1.0 (which ended at Phase 4); it does NOT reset to 1.
- Decimal phases (5.1, 5.2): Urgent insertions (marked with INSERTED).

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>✅ v1.0 Cinematic Rails Portfolio (Phases 1–4) — SHIPPED 2026-06-17</summary>

- [x] **Phase 1: Foundation, Data Reuse & Proven Deploy** (3/3 plans) — completed 2026-06-14
  Base-path-safe SvelteKit scaffold, Zod-validated 56-video data layer, dark OKLCH token system, single reduced-motion gate, green staging deploy.
- [x] **Phase 2: Shared Components, Card Destinations & SEO** (4/4 plans) — completed 2026-06-14
  Leaf components + TopNav/Footer chrome, facade watch pages, /work + 8 category grids, PBS flagship, about/press/contact, 70-URL sitemap + per-page SEO/JSON-LD.
- [x] **Phase 3: Rails Homepage & Cinematic Hero** (3/3 plans) — completed 2026-06-15
  Signature 8-rail YouTube-style home + double-gated cinematic parallax ReelHero with focus-trapped PLAY REEL lightbox; build-enforced zero-iframe home.
- [x] **Phase 4: Hardening, Apex Cutover & Launch** (2/2 plans) — completed 2026-06-17
  Four automated launch gates green across Chromium/WebKit/Firefox + real-device QA approved; deploy hardened (current action majors, prerender-count CI guard, verified base-'' apex build, CUTOVER.md). **Apex DNS flip deferred — site live on GitHub Pages.**

Full phase detail, success criteria, and milestone summary: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)
Audit: [milestones/v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md)

</details>

### 🚧 v1.1 Production Cutover (Phases 5–7)

The v1.0 build, content, and `CUTOVER.md` runbook already exist and are verified. This milestone is about **gating, wiring, flipping, and verifying** — not building features. The central risk is ordering: the apex must be made indexable (and the SEO/deploy debt cleared and verified) *before* the DNS flip, or the live site goes dark to search engines.

- [ ] **Phase 5: Cutover Prep — Make Indexable & Clear SEO/Deploy Debt** - Environment-gate `noindex`/`robots.txt`, emit per-page `og:title`/`og:url`, wire the prerender-count guard into the production workflow, emit `#hero-sentinel`
- [ ] **Phase 6: Apex DNS Cutover** - Execute `CUTOVER.md` to flip michellengo.net to the v5 base-`''` build with persisted CNAME and valid HTTPS
- [ ] **Phase 7: Launch Verification** - Confirm the live apex is indexable, renders every route, and the rails/watch flow works on real iPhone + Android

## Phase Details

### Phase 5: Cutover Prep — Make Indexable & Clear SEO/Deploy Debt
**Goal**: Make the production (apex) build search-indexable and clear the remaining SEO/deploy debt so the site is safe to take live — all verified on staging/preview *before* any DNS change. This phase neutralizes the milestone's central risk: an unconditional `noindex` going live.
**Depends on**: Phase 4 (v1.0 shipped — build, content, CUTOVER.md exist)
**Requirements**: SEO-04, SEO-05, DPLY-01, HERO-05
**Success Criteria** (what must be TRUE):
  1. A production/apex build emits a crawlable `robots.txt` and pages carry **no** `noindex` meta, while the staging (subpath) build still emits `Disallow: /` and `noindex` — the difference is driven by environment, not a manual edit, and the gating step is documented in `CUTOVER.md`
  2. Every prerendered page emits both `og:title` and `og:url` (completing the per-page Open Graph set), verifiable by inspecting the built HTML
  3. The production deploy workflow runs the same prerender-count guard as staging — a build that does not produce exactly 56 watch + 8 category pages fails CI before deploy
  4. On the home page the TopNav scroll-transparency activates because `ReelHero` emits a `#hero-sentinel` element (nav is transparent over the hero, solid after scroll)
  5. No shipped v1.0 UI surface changes behavior — these are gating/wiring/cosmetic-only edits
**Plans**: 2 plans (Wave 1, parallel)
- [ ] 05-01-PLAN.md — Environment-gate noindex/robots.txt + document the indexing gate in CUTOVER.md (SEO-04)
- [x] 05-02-PLAN.md — Per-page og:title/og:url, prerender-count guard in the production workflow, ReelHero #hero-sentinel (SEO-05, DPLY-01, HERO-05)

### Phase 6: Apex DNS Cutover
**Goal**: Flip michellengo.net from the prior WordPress site to the v5 build by executing the existing `CUTOVER.md` runbook — the base-`''` apex build served at the apex, CNAME preserved across deploys, HTTPS valid. Performed only after Phase 5 is verified, so the apex is indexable from the moment it goes live.
**Depends on**: Phase 5 (apex must be indexable and the SEO/deploy debt cleared and verified first)
**Requirements**: DPLY-02
**Success Criteria** (what must be TRUE):
  1. michellengo.net resolves to the v5 GitHub Pages site (not the prior WordPress site) over valid HTTPS with no certificate warnings
  2. The site served at the apex is the base-`''` production build (internal links/assets resolve at the root, not under `/michelle_ngo_five/`)
  3. The CNAME persists across a subsequent deploy (a re-deploy does not knock the custom domain off)
**Plans**: TBD

### Phase 7: Launch Verification
**Goal**: Prove the live apex is correct and usable — search-indexable with correct robots/meta, every route renders, and the core rails-browse + watch (play) flow works on real mobile devices. This is the milestone's done-gate.
**Depends on**: Phase 6 (the site must be live at the apex to verify it)
**Requirements**: LIVE-01, LIVE-02
**Success Criteria** (what must be TRUE):
  1. The live apex is confirmed search-indexable — `robots.txt` is crawlable and pages carry no `noindex` (the Phase 5 gate actually took effect in production)
  2. Every route renders at michellengo.net — home, the 8 rails, a sample of `/watch/[id]`, `/work` + the 8 category grids, the PBS flagship, and about/press/contact — with no 404s or broken assets
  3. The rails browse-then-watch flow (scroll a rail, open a card, play the video) works on a real iPhone and a real Android device at michellengo.net
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order across milestones: 1 → 2 → 3 → 4 (v1.0) → 5 → 6 → 7 (v1.1)

Within v1.1, ordering is a hard constraint: **Phase 5 (make-indexable + debt) must be verified before Phase 6 (DNS flip); Phase 7 (verification) follows the flip.**

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation, Data Reuse & Proven Deploy | v1.0 | 3/3 | Complete | 2026-06-14 |
| 2. Shared Components, Card Destinations & SEO | v1.0 | 4/4 | Complete | 2026-06-14 |
| 3. Rails Homepage & Cinematic Hero | v1.0 | 3/3 | Complete | 2026-06-15 |
| 4. Hardening, Apex Cutover & Launch | v1.0 | 2/2 | Complete (apex DNS flip deferred) | 2026-06-17 |
| 5. Cutover Prep — Make Indexable & Clear SEO/Deploy Debt | v1.1 | 0/2 | Not started | - |
| 6. Apex DNS Cutover | v1.1 | 0/TBD | Not started | - |
| 7. Launch Verification | v1.1 | 0/TBD | Not started | - |
