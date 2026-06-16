# Roadmap: michelle_ngo_five

## Overview

v5 is a dark, cinematic, YouTube-style video portfolio for filmmaker Michelle Ngo — 56 curated films across 8 categories, prerendered to GitHub Pages with no backend. Roughly 90% of the architecture is a verbatim port of the shipped sibling `michelle_ngo_four` (data layer, leaf components, browse/watch routes, deploy workflows); the one genuinely new layer is the signature horizontal **category-rails homepage** plus a cinematic 3D/parallax reel hero. The journey: (1) stand up a base-path-safe scaffold, port the validated data layer, lock the dark design tokens, and prove a green deploy to staging — front-loading the riskiest pitfalls; (2) port the shared components, watch/browse/PBS card destinations, static pages, and SEO so the site is content-complete and every link target exists; (3) build the new rails homepage and cinematic hero on top of that foundation — the only phase carrying real a11y/perf risk; (4) harden perf/a11y budgets on real devices and flip the apex CNAME cutover to michellengo.net.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation, Data Reuse & Proven Deploy** - Base-path-safe scaffold, ported data layer, dark design tokens, reduced-motion util, and a green staging deploy
- [ ] **Phase 2: Shared Components, Card Destinations & SEO** - Leaf components + chrome, watch/browse/PBS routes, static pages, and per-page SEO/JSON-LD — content-complete
- [ ] **Phase 3: Rails Homepage & Cinematic Hero** - The signature horizontal category rails plus the motion-safe 3D/parallax reel hero
- [ ] **Phase 4: Hardening, Apex Cutover & Launch** - Perf/a11y budgets verified on real devices, two-workflow deploy, and the apex CNAME cutover to michellengo.net

## Phase Details

### Phase 1: Foundation, Data Reuse & Proven Deploy
**Goal**: A base-path-safe static SvelteKit shell that builds and deploys green to the github.io staging URL, with the validated 56-video data layer ported, the dark design tokens locked, and the shared reduced-motion utility in place — so every later feature reads `$lib/data`, hangs motion off one util, and links resolve correctly.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, DATA-01, DATA-02, DATA-03, DATA-04, DSGN-01, DSGN-02, DSGN-03, DSGN-04
**Success Criteria** (what must be TRUE):
  1. A push to `main` auto-deploys a live page at `wolfwdavid.github.io/michelle_ngo_five/` where every asset and internal link resolves (no 404s, no hardcoded absolute URLs)
  2. `pnpm build` prerenders cleanly, and an invalid entry in the 56-video dataset fails the build (Zod + source/id uniqueness) rather than reaching the browser
  3. A typed loader returns videos by id, by category, and categories in display order (count-descending), with a poster present for every video
  4. The site renders on a near-black canvas with the 8 OKLCH per-category accents and a thick high-contrast focus-visible ring, each verified AA on the dark background
  5. A shared reduced-motion utility exists and is the single gate all later motion reads from; a `.nojekyll` marker, `404.html` fallback, and a base-`''` production workflow with persisted CNAME are present
**Plans**: 3 plans
- [x] 01-01-scaffold-config-proven-deploy-PLAN.md — base-path-safe scaffold, configs, static assets, both deploy workflows; green staging + apex build
- [x] 01-02-data-layer-port-build-validation-PLAN.md — port the validated 56-video data layer + Zod build-time validation (bad data fails the build)
- [x] 01-03-design-tokens-motion-util-PLAN.md — dark canvas + 8 OKLCH accents + focus ring tokens, and the shared reduced-motion utility (FND-06)

### Phase 2: Shared Components, Card Destinations & SEO
**Goal**: Port v4's shared leaf components and chrome and build every page a card or nav can link to — watch pages, browse grids, the PBS flagship, and the static About/Press/Contact pages — each with correct SEO and structured data, so the site is content-complete and the homepage in Phase 3 has real destinations to point at.
**Depends on**: Phase 1
**Requirements**: WATCH-01, WATCH-02, WATCH-03, WATCH-04, BRWS-01, BRWS-02, PBS-01, PAGE-01, PAGE-02, PAGE-03, SEO-01, SEO-02, SEO-03
**Success Criteria** (what must be TRUE):
  1. Every one of the 56 videos has a deep-linkable `/watch/[id]` page that prerenders, embeds the correct Vimeo/YouTube player via a lazy click-to-load facade (never autoplay-with-sound), and shows title, accent category, uploader/year, description, and a "more in this category" rail
  2. `/work` browses all videos in a grid and `/work/[category]` prerenders a filtered grid for all 8 categories, with a dedicated PBS American Portrait landing page presenting the 18 PBS videos with intro copy
  3. About (approved bio), Press (broadcast credits), and a Contact surface (mynogo@gmail.com, phone, Vimeo/socials) exist, with contact details reused consistently across about/footer/contact
  4. Every page emits a correct title, meta description, canonical URL, and OG/Twitter card; watch pages emit VideoObject JSON-LD and About emits Person JSON-LD
  5. A prerendered `sitemap.xml` enumerates all routes (home, work, 8 categories, 56 watch pages, static pages)
**Plans**: 4 plans (Wave 1: 02-01; Wave 2: 02-02, 02-03, 02-04 in parallel)
- [x] 02-01-shared-components-and-chrome-PLAN.md — port leaf components (CategoryTag/VideoCard/ContactBlock) + chrome (TopNav/MobileMenu/Footer), mount chrome in +layout (DSGN-04)
- [x] 02-02-watch-pages-facade-jsonld-PLAN.md — 56 /watch/[id] pages, click-to-load facade embed (WATCH-02 improvement), metadata, sibling rail, VideoObject JSON-LD
- [x] 02-03-browse-and-pbs-PLAN.md — /work (all 56) + /work/[category] (8 prerendered grids) + the PBS American Portrait flagship (18 videos)
- [x] 02-04-static-pages-seo-sitemap-PLAN.md — about (Person JSON-LD) + press + contact, per-page canonical/SEO, and the 70-URL prerendered sitemap.xml

### Phase 3: Rails Homepage & Cinematic Hero
**Goal**: Build the signature experience — a full-bleed reel hero with motion-safe 3D/parallax leading into one accessible horizontal scroll-snap rail per category — composing the data API and `VideoCard` from earlier phases into the homepage. This is the only genuinely new architecture and concentrates the a11y/perf risk; it needs phase-level research before planning.
**Depends on**: Phase 2
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HERO-01, HERO-02, HERO-03, HERO-04
**Success Criteria** (what must be TRUE):
  1. The homepage renders one horizontal rail per category in display order, each accent-labeled, showing poster+title+meta cards that scroll-snap with a visible "peek" of the next card
  2. Rails are fully keyboard-operable (Arrow/Home/End, Tab exits with no focus trap, offscreen cards do not strand focus) and screen-reader friendly (labeled region, list semantics), with real Prev/Next controls on pointer devices
  3. The home mounts zero live video iframes — cards are lazy-loaded poster images only — and clicking a card opens that video's watch page
  4. A full-bleed hero leads the page with Michelle's wordmark, a one-line tagline, and a PLAY REEL CTA that opens the producer reel (Vimeo 264677021), with the hero LCP image loading eagerly
  5. The hero's 3D/depth/parallax is gated on the reduced-motion utility and still looks premium with motion off (degrades gracefully, no jank/CLS)
**Plans**: 3 plans (Wave 1: 03-01, 03-02 in parallel; Wave 2: 03-03)
- [x] 03-01-category-rail-PLAN.md — accessible scroll-snap CategoryRail (peek, proximity snap, gated Prev/Next, zero iframes) wrapping VideoCard
- [x] 03-02-reel-hero-lightbox-PLAN.md — ReelHero (eager LCP poster, PLAY REEL, double-gated CSS-3D parallax) + focus-trapped ReelLightbox
- [x] 03-03-compose-home-PLAN.md — rewrite +page.svelte/+page.ts (hero + 8 rails), skip link, build-time zero-iframe guard

### Phase 4: Hardening, Apex Cutover & Launch
**Goal**: Verify the content-complete site against explicit a11y and mobile-perf budgets on real Safari/iOS/Android devices, then perform the verify-then-flip apex CNAME cutover so the site goes live at michellengo.net over HTTPS.
**Depends on**: Phase 3
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04
**Success Criteria** (what must be TRUE):
  1. Key pages pass an automated axe accessibility check with no serious violations, and keyboard/focus + mobile momentum behavior are verified on a real iPhone and Android device
  2. Mobile Lighthouse performance is strong — good LCP, capped concurrent iframes, no significant CLS — and a CI check confirms exactly 56 watch + 8 category pages prerendered
  3. The layout is responsive from small mobile to desktop with a working mobile nav, and `prefers-reduced-motion` demonstrably disables parallax, hover-preview, and smooth-scroll animations everywhere
  4. The production workflow builds with base path `''`, persists the CNAME, and the apex cutover serves michellengo.net live over verified HTTPS
**Plans**: 2 plans (Wave 1: 04-01; Wave 2: 04-02)
- [x] 04-01-quality-gates-PLAN.md — axe a11y scan + mobile Lighthouse LCP gate + responsive/mobile-nav + reduced-motion audit (QUAL-01..04), real-device human-verify
- [ ] 04-02-deploy-hardening-apex-cutover-PLAN.md — bump deprecated actions, prerender-count CI guard, verified apex (base-'') build, CUTOVER.md runbook, human-action DNS flip

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Data Reuse & Proven Deploy | 0/3 | Not started | - |
| 2. Shared Components, Card Destinations & SEO | 0/4 | Not started | - |
| 3. Rails Homepage & Cinematic Hero | 0/3 | Not started | - |
| 4. Hardening, Apex Cutover & Launch | 0/TBD | Not started | - |
