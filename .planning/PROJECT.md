# michelle_ngo_five

## What This Is

A redesign of filmmaker **Michelle Ngo**'s portfolio site (currently michellengo.net), built as a static SvelteKit site hosted on GitHub Pages. The distinctive idea: a **dark, cinematic, YouTube-style homepage** built from horizontal scrolling category rails ("shelves") — one rail per category — so visitors browse Michelle's 56 films/videos the way they browse YouTube's home page. It is the fifth iteration in a series (v2–v4 already shipped as sibling repos); v5's signature is the rails-based home plus a premium, immersive feel with tasteful 3D/depth/motion.

## Core Value

Visitors can immediately see and play Michelle's video work, browsing it by category in a fast, dark, YouTube-like interface — and it must feel premium and load fast on mobile.

## Requirements

### Validated

- ✓ Static SvelteKit scaffold builds + prerenders cleanly, base-path-safe for both staging and apex — Phase 1
- ✓ 56-video data layer ported with Zod build-time validation (bad record fails the build) — Phase 1
- ✓ Dark cinematic design system: near-black canvas, 8 OKLCH category accents (AA), focus-visible ring — Phase 1
- ✓ Shared reduced-motion utility (the single gate for all later motion) — Phase 1
- ✓ Both GitHub Actions deploy workflows (staging subpath + manual apex/CNAME) — Phase 1
- ✓ Content-complete: 56 watch pages (click-to-load facade, VideoObject JSON-LD), /work + 8 category grids, PBS flagship, About/Press/Contact — Phase 2
- ✓ Site chrome (TopNav + Footer with mirrored nav, accessible mobile menu) — Phase 2
- ✓ SEO: per-page canonical/title/meta/OG, Person JSON-LD, 70-URL sitemap, strict prerendering — Phase 2
- ✓ Signature YouTube-style home: cinematic hero (eager LCP, double-gated 3D/parallax, PLAY REEL lightbox) + 8 accent category rails (peek, keyboard/SR, Prev/Next, zero home iframes) — Phase 3 (human-approved)
- ✓ Launch-readiness quality gates (QUAL-01..04): axe a11y (24/24, zero serious/critical), mobile Lighthouse (LCP 2.05s / CLS 0 / perf 98), responsive 375–1440 + mobile nav, reduced-motion audit; real-device iPhone+Android QA approved — Phase 4
- ✓ Deploy hardened for launch: both workflows on current action majors, prerender-count CI guard (56+8), verified base-'' apex build, CUTOVER.md runbook — Phase 4 (apex DNS flip deferred by user; site live on GitHub Pages)

### Active

<!-- Hypotheses until shipped and validated. -->

- [ ] Static SvelteKit site (Svelte 5 + Tailwind v4 + adapter-static) that prerenders cleanly for GitHub Pages
- [ ] Dark cinematic design system with v4's OKLCH per-category accent colors
- [ ] Homepage built as YouTube-style horizontal category rails (one rail per category), each scrollable, with accessible keyboard/touch controls
- [ ] Full-bleed hero with the producer reel (Vimeo 264677021) and a PLAY REEL CTA, with tasteful 3D/depth/parallax (motion-safe gated)
- [ ] Reuse the validated 56-video dataset from michelle_ngo_four (Vimeo + YouTube embeds, 8 categories) with build-time Zod validation
- [ ] Per-video watch page (/watch/[id]) with lazy iframe embed, metadata, and same-category "more" rail
- [ ] Category browse page (/work and /work/[category]) for grid/full browsing
- [ ] PBS American Portrait flagship landing page (18 videos)
- [ ] About page (approved bio + Person JSON-LD) and Press page (broadcast credits)
- [ ] Contact surface (email mynogo@gmail.com, phone, Vimeo, socials)
- [ ] Accessible (AA contrast, keyboard nav, reduced-motion support, semantic landmarks) and performant (good mobile LCP, peaked iframe budget)
- [ ] Two GitHub Actions deploy workflows: auto staging at wolfwdavid.github.io/michelle_ngo_five/ + manual production build for michellengo.net (CNAME)

### Out of Scope

- CMS / admin backend — content lives in version-controlled TypeScript/JSON, no runtime DB
- User accounts / auth — it's a public portfolio
- Light mode toggle — v5 is dark-only by design decision
- Server-side rendering at request time — static prerender only (GitHub Pages)
- Scraping brand-new videos from Vimeo/YouTube for v1 — reuse v4's curated 56; refresh later

## Context

- **Sibling repos already built and analyzed:** michelle_ngo_two (older, light, 46 mixed projects across advertising/film/UX/publishing), michelle_ngo_three (dark cinematic vertical scroll-snap fullscreen reels, 56 videos), michelle_ngo_four (dark YouTube-style static grid, 56 videos). v5 reuses v4's content/data and v3/v4's dark design language, but its homepage is a **new pattern: horizontal rails**.
- **Canonical content source:** `michelle_ngo_four/src/lib/data/videos.json` — 56 videos, Vimeo + YouTube, 8 categories: PBS American Portrait (18), Promos & Trailers, Branded Content, Documentary / Short Film, Reel, Personal / Tribute, Educational / Nonprofit, Other. Plus posters in `static/posters/`, bio, and contact block.
- **Bio (approved):** "I'm Michelle Ngo, a filmmaker and producer based in New York City. I make video that helps brands and broadcasters tell stories well — short documentaries, branded films, promos, and trailers. My credits include PBS American Portrait, HBO Max, HBO, ABC News, U2's Sphere residency, Amazon News, and Music Box Films..."
- **Contact:** mynogo@gmail.com · (917) 566-1976 · Vimeo user2149742 · IMDb/LinkedIn (channel fallbacks).
- **Reference sites** (teardown already exists in `michelle_ngo_four/_prep/02-references.md`): isotopefilms.com (editorial sectioned grid, status tags, 3-word tagline), yvonnerusso.com/press (Press as first-class page, footer-mirrored nav), samhendi.com (full-bleed hero + PLAY REEL, monochrome, let photography carry the color).
- **Design inspiration from user:** a "Claude Design Builds Beautiful 3D Websites" tutorial — wants a premium, immersive, depth-and-motion feel.
- **Skills to apply during UI work:** ui-ux-pro-max and the Anthropic frontend-design skill.

## Constraints

- **Tech stack**: SvelteKit 2 + Svelte 5 (runes) + Tailwind v4 + @sveltejs/adapter-static — matches sibling repos and is proven for this content.
- **Runtime**: pnpm 11, Node 22 (`.nvmrc` = 22).
- **Hosting**: GitHub Pages (static only). Base path `/michelle_ngo_five` for staging, `''` for apex; `.nojekyll` required.
- **Repo**: https://github.com/wolfwdavid/michelle_ngo_five.git (own standalone repo on `main`).
- **Performance**: good mobile LCP; cap concurrently-mounted video iframes; lazy-load embeds.
- **Accessibility**: WCAG AA — keyboard-operable rails, focus-visible rings, prefers-reduced-motion honored.
- **Commit hygiene**: commit messages focus on the change; no mention of AI assistants.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dark-only cinematic theme | Fits film work + "think YouTube" + user's 3D-site inspiration | ✓ Good (live, user-approved) |
| Homepage = horizontal category rails (YouTube home) | User's explicit ask; differentiates from v4 grid / v3 scroll-snap | ✓ Good (live, user-approved) |
| Reuse v4's 56-video dataset + posters | Validated, type-safe, fastest path to content-complete | — Pending |
| Two deploy workflows (staging + apex michellengo.net) | Safe iteration on github.io, manual cutover to apex | — Pending |
| SvelteKit 2 + Svelte 5 + Tailwind v4 + adapter-static | Proven across v3/v4; static is required for Pages | — Pending |
| Tasteful 3D/parallax, motion-safe gated | Premium feel without hurting a11y/perf | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-16 after Phase 4 (launch-readiness quality gates + deploy hardening; v1.0 milestone complete, live on GitHub Pages; apex DNS cutover deferred)*
