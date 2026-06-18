# michelle_ngo_five

## What This Is

A redesign of filmmaker **Michelle Ngo**'s portfolio site (currently michellengo.net), built as a static SvelteKit site hosted on GitHub Pages. The distinctive idea: a **dark, cinematic, YouTube-style homepage** built from horizontal scrolling category rails ("shelves") — one rail per category — so visitors browse Michelle's 56 films/videos the way they browse YouTube's home page. It is the fifth iteration in a series (v2–v4 already shipped as sibling repos); v5's signature is the rails-based home plus a premium, immersive feel with tasteful 3D/depth/motion.

## Core Value

Visitors can immediately see and play Michelle's video work, browsing it by category in a fast, dark, YouTube-like interface — and it must feel premium and load fast on mobile.

## Current Milestone: v1.1 Production Cutover

**Goal:** Take the verified v1.0 build live on the real domain — environment-gate indexing, clear the SEO/deploy debt, flip DNS to michellengo.net, and verify the live apex.

**Target features:**
- Environment-gated indexing — staging stays `noindex`/`Disallow`, the apex build is fully indexable (fixes the 🔴 cutover blocker)
- SEO/deploy debt cleared — per-page `og:title`/`og:url`, prerender-count guard in the production workflow, `#hero-sentinel` for scroll-transparent nav
- DNS cutover to michellengo.net — CNAME → apex, base-`''` build, HTTPS verified, `CUTOVER.md` executed
- Post-launch verification — live apex is indexable, renders, and the rails/watch flow works on real devices

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
- ✓ Environment-gated indexing (SEO-04): apex build emits no `noindex` + `robots.txt` `Allow: /` + Sitemap; staging keeps `noindex`/`Disallow` — gated on build-time `BASE_PATH` via `+layout.server.ts`/`robots.txt/+server.ts` (fixes the 🔴 cutover blocker) — Phase 5
- ✓ SEO/deploy debt cleared (SEO-05, DPLY-01, HERO-05): per-page `og:title`/`og:url` on all 8 heads, prerender-count guard in the production workflow, `#hero-sentinel` for scroll-transparent nav — Phase 5

### Active

<!-- Hypotheses until shipped and validated. v1.1 Production Cutover scope — defined via /gsd:new-milestone. Full REQ-IDs live in REQUIREMENTS.md. -->

**v1.1 Production Cutover** — take the verified v1.0 build live on michellengo.net:

- [x] 🔴 Environment-gate the production `noindex`/`robots.txt` (currently unconditional — would hide the live apex from search engines) and add the step to CUTOVER.md — Phase 5
- [x] Wire the prerender-count guard into the production deploy workflow (staging parity) — Phase 5
- [x] Emit `og:title`/`og:url` per page; emit `#hero-sentinel` so TopNav scroll-transparency activates (cosmetic) — Phase 5
- [ ] Apex DNS cutover to michellengo.net — execute CUTOVER.md (CNAME → apex, base-`''`, HTTPS)
- [ ] Post-launch verification — live apex indexable, renders, rails/watch flow works on real devices

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

**Current state (v1.0 shipped 2026-06-17):** ~5,218 src LOC (SvelteKit 2 / Svelte 5 / Tailwind v4 / adapter-static), live on GitHub Pages at https://wolfwdavid.github.io/michelle_ngo_five/ — all v1.0 requirements satisfied, 4/4 phases verified, mobile LCP 2.05s. **v1.1 Phase 5 complete (2026-06-18):** the apex build is now fully indexable (env-gated `noindex`/`robots.txt`), the production deploy workflow has the prerender-count guard, and the SEO/`#hero-sentinel` debt is cleared — the cutover is now unblocked. The apex (michellengo.net) still serves the prior WordPress site; only the DNS cutover (Phase 6) and post-launch verification remain.

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
| Reuse v4's 56-video dataset + posters | Validated, type-safe, fastest path to content-complete | ✓ Good (build-time Zod, shipped) |
| Two deploy workflows (staging + apex michellengo.net) | Safe iteration on github.io, manual cutover to apex | ✓ Good (staging live; apex cutover deferred) |
| SvelteKit 2 + Svelte 5 + Tailwind v4 + adapter-static | Proven across v3/v4; static is required for Pages | ✓ Good (clean prerender, ~5.2k LOC) |
| Tasteful 3D/parallax, motion-safe gated | Premium feel without hurting a11y/perf | ✓ Good (double-gated; LCP 2.05s, reduced-motion audited) |
| Facade pattern: zero home iframes, one live iframe on watch only | Protect mobile LCP/INP with many embeds | ✓ Good (build-enforced zero-iframe home) |
| Single reduced-motion gate as the one motion source | Avoid scattered matchMedia checks; consistent a11y | ✓ Good (ReelHero + CategoryRail both read it) |
| Defer apex DNS cutover; ship on GitHub Pages first | User chose to validate live before touching the production domain | — Pending (CUTOVER.md ready; noindex fix required first) |

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
*Last updated: 2026-06-18 after Phase 5 (Cutover Prep) — apex made indexable, SEO/deploy debt cleared; cutover unblocked, DNS flip (Phase 6) remains*
