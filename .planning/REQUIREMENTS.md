# Requirements: michelle_ngo_five

**Defined:** 2026-06-14
**Core Value:** Visitors can immediately see and play Michelle's video work, browsing it by category in a fast, dark, YouTube-like interface — premium feel, fast on mobile.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation & Deploy

- [ ] **FND-01**: Project scaffolds as a static SvelteKit app (Svelte 5 + Tailwind v4 + adapter-static) that builds with `pnpm build` and prerenders all routes with no errors
- [ ] **FND-02**: Site works under a GitHub Pages base path — every asset and internal link resolves correctly at `wolfwdavid.github.io/michelle_ngo_five/` (no hardcoded absolute URLs)
- [ ] **FND-03**: A real push-to-main auto-deploys the site to the github.io staging URL via GitHub Actions
- [ ] **FND-04**: A `404.html` SPA fallback and `.nojekyll` marker are present so deep links and static assets resolve on Pages
- [ ] **FND-05**: A manual "production" workflow builds with base path `''` and a persisted `CNAME` for michellengo.net, ready for apex cutover
- [ ] **FND-06**: A shared reduced-motion utility exists and all motion in the site is gated on it (built before any animated feature)

### Content Data Layer

- [ ] **DATA-01**: All 56 videos (Vimeo + YouTube) and their 8 categories are ported from michelle_ngo_four into a typed dataset
- [ ] **DATA-02**: The dataset is validated at build time (Zod schema + source/id uniqueness) so an invalid entry fails the build
- [ ] **DATA-03**: A typed loader exposes videos by id, by category, and categories in display order (count-descending)
- [ ] **DATA-04**: Poster/thumbnail images are present for every video and referenced without layout shift

### Design System

- [ ] **DSGN-01**: A dark cinematic theme (near-black canvas) is applied site-wide
- [ ] **DSGN-02**: The 8 OKLCH per-category accent colors are defined and each passes AA contrast on the dark background
- [ ] **DSGN-03**: Focus-visible rings are clearly visible on the dark/over-video surfaces (keyboard users can always see focus)
- [ ] **DSGN-04**: Typography, spacing, and chrome (top nav + footer) are consistent across all pages, with footer-mirrored nav

### Rails Homepage (signature)

- [ ] **HOME-01**: The homepage renders one horizontal scrolling rail per category, in display order, each labeled with its accent color
- [ ] **HOME-02**: Each rail shows video cards (poster + title + meta) and scrolls horizontally with scroll-snap and a visible "peek" of the next card
- [ ] **HOME-03**: Rails are operable by keyboard (arrow/Home/End, Tab exits — no focus trap) and expose Prev/Next controls on pointer devices
- [ ] **HOME-04**: Rail cards are screen-reader friendly (labeled region, list semantics) and offscreen cards do not strand focus
- [ ] **HOME-05**: Clicking a card opens that video's watch page
- [ ] **HOME-06**: Home uses zero live video iframes — cards are lazy-loaded poster images only

### Cinematic Hero

- [ ] **HERO-01**: A full-bleed hero leads the homepage with Michelle's name/wordmark, a one-line tagline, and a PLAY REEL CTA
- [ ] **HERO-02**: PLAY REEL opens the producer reel (Vimeo 264677021)
- [ ] **HERO-03**: The hero has a tasteful 3D/depth/parallax treatment that is gated on reduced-motion and degrades gracefully (still premium with motion off)
- [ ] **HERO-04**: The hero LCP image loads eagerly (not lazy) for fast first paint

### Watch Page

- [ ] **WATCH-01**: Each video has a deep-linkable page at `/watch/[id]` that prerenders for all 56 videos
- [ ] **WATCH-02**: The watch page embeds the correct Vimeo/YouTube player (lazy / click-to-load facade, never autoplay-with-sound)
- [ ] **WATCH-03**: The watch page shows title, category (accent), uploader/year, and description
- [ ] **WATCH-04**: The watch page shows a "more in this category" rail of sibling videos

### Browse & Flagship

- [ ] **BRWS-01**: `/work` shows all videos in a browsable grid
- [ ] **BRWS-02**: `/work/[category]` shows a category-filtered grid and prerenders for all 8 categories
- [ ] **PBS-01**: A dedicated PBS American Portrait landing page presents the 18 PBS videos with intro copy and a link to the PBS collection

### Static Pages

- [ ] **PAGE-01**: An About page presents Michelle's approved bio and contact links
- [ ] **PAGE-02**: A Press page lists broadcast credits (HBO, PBS, ABC News, Amazon News, etc.)
- [ ] **PAGE-03**: A Contact surface exposes email (mynogo@gmail.com), phone, and social/Vimeo links, reused consistently (about/footer/contact)

### SEO & Structured Data

- [ ] **SEO-01**: Every page has a correct title, meta description, canonical URL, and Open Graph/Twitter card image
- [ ] **SEO-02**: Watch pages emit VideoObject JSON-LD (name, description, thumbnailUrl, uploadDate, embedUrl) and About emits Person JSON-LD
- [ ] **SEO-03**: A prerendered sitemap.xml enumerates all routes (home, work, 8 categories, 56 watch pages, static pages)

### Accessibility & Performance

- [ ] **QUAL-01**: Site passes an automated accessibility check (axe) with no serious violations on key pages
- [ ] **QUAL-02**: Mobile Lighthouse performance is strong (good LCP; capped concurrent iframes; no significant CLS)
- [ ] **QUAL-03**: Layout is responsive from small mobile to desktop, with a working mobile nav
- [ ] **QUAL-04**: `prefers-reduced-motion` disables parallax/hover-preview/smooth-scroll animations everywhere

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhancements

- **ENH-01**: Hover-preview autoplay on cards (muted clip / animated WebP, desktop-only, reduced-motion gated) — pending iframe/perf budget
- **ENH-02**: Refresh the dataset by pulling newer videos from the linked Vimeo channel / YouTube playlist
- **ENH-03**: Native CSS `::scroll-button()`/`::scroll-marker()` progressive enhancement where supported (Chrome/Edge)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| CMS / admin backend | Content lives in version-controlled TS/JSON; no runtime DB |
| User accounts / auth | Public portfolio, no personalization |
| Light mode toggle | v5 is dark-only by design decision |
| Request-time SSR | GitHub Pages is static prerender only |
| Comments / recommendations / search-as-a-service | Not core to a portfolio; adds infra/complexity |
| Autoplay-with-sound | Hostile UX; violates motion/sound preferences |
| Heavy 3D engine (three.js / R3F / GSAP) for v1 | CSS-first motion meets the goal without bundle/LCP cost |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Pending |
| FND-02 | Phase 1 | Pending |
| FND-03 | Phase 1 | Pending |
| FND-04 | Phase 1 | Pending |
| FND-05 | Phase 1 | Pending |
| FND-06 | Phase 1 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DSGN-01 | Phase 1 | Pending |
| DSGN-02 | Phase 1 | Pending |
| DSGN-03 | Phase 1 | Pending |
| DSGN-04 | Phase 1 | Pending |
| WATCH-01 | Phase 2 | Pending |
| WATCH-02 | Phase 2 | Pending |
| WATCH-03 | Phase 2 | Pending |
| WATCH-04 | Phase 2 | Pending |
| BRWS-01 | Phase 2 | Pending |
| BRWS-02 | Phase 2 | Pending |
| PBS-01 | Phase 2 | Pending |
| PAGE-01 | Phase 2 | Pending |
| PAGE-02 | Phase 2 | Pending |
| PAGE-03 | Phase 2 | Pending |
| SEO-01 | Phase 2 | Pending |
| SEO-02 | Phase 2 | Pending |
| SEO-03 | Phase 2 | Pending |
| HOME-01 | Phase 3 | Pending |
| HOME-02 | Phase 3 | Pending |
| HOME-03 | Phase 3 | Pending |
| HOME-04 | Phase 3 | Pending |
| HOME-05 | Phase 3 | Pending |
| HOME-06 | Phase 3 | Pending |
| HERO-01 | Phase 3 | Pending |
| HERO-02 | Phase 3 | Pending |
| HERO-03 | Phase 3 | Pending |
| HERO-04 | Phase 3 | Pending |
| QUAL-01 | Phase 4 | Pending |
| QUAL-02 | Phase 4 | Pending |
| QUAL-03 | Phase 4 | Pending |
| QUAL-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 41 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-06-14*
*Last updated: 2026-06-14 after roadmap creation*
