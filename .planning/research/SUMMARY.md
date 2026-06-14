# Project Research Summary

**Project:** michelle_ngo_five
**Domain:** Dark, YouTube-style filmmaker video portfolio - static SvelteKit on GitHub Pages, signature = horizontal category rails homepage
**Researched:** 2026-06-14
**Confidence:** HIGH

## Executive Summary

v5 is a static, dark, cinematic video portfolio for filmmaker Michelle Ngo - 56 curated films across 8 categories, prerendered to GitHub Pages with no backend. The defining experience is a YouTube-style **rails homepage**: one horizontal "shelf" per category, each a scroll-snap row of poster cards. Critically, this is the **fifth iteration in a proven series**: `michelle_ngo_four` is a fully-shipped, test-covered sibling that already implements ~90% of the needed architecture (data layer, Zod validation, route set, prerender `entries()`, base-path handling, two-workflow deploy). The expert approach here is therefore **port-then-extend, not greenfield**: lift v4's data layer, leaf components, browse routes, and deploy workflows nearly verbatim, then build the genuinely new rails homepage on top.

The recommended stack is the **validated sibling pin set, adopted verbatim**: SvelteKit 2.59.x + Svelte 5.55.x (runes) + Tailwind v4.3.x + adapter-static + Vite 8 + TypeScript 5.9.x on Node 22 / pnpm 11, with Zod for build-time data validation. Research confirms there is no Svelte 6, no SvelteKit 3, no Tailwind v5, and no certified TS 6 toolchain as of mid-2026 - so every "newer" version is opt-in at best and TS 6 is an explicit do-not-bump. For the "premium 3D/depth/motion" ask, the strong recommendation is **CSS-first, zero animation library**: native CSS scroll-snap for rails, CSS scroll-driven animations + transform/opacity + CSS perspective for parallax. No three.js, no GSAP, no carousel library for v1 - they wreck mobile LCP on a content site for effects CSS already covers.

The dominant risks are concentrated in **four new surfaces**: (1) the GitHub Pages base-path / apex CNAME cutover, (2) the rails pattern's accessibility (keyboard + screen-reader + Safari focus), (3) the iframe budget on a home page that can show dozens of cards, and (4) "tasteful" motion not destroying perf/a11y. Mitigations are well-understood and cross-cutting: prove base-path end-to-end in Phase 1 with a trivial deploy; use the **facade pattern** (poster + play button, never a live iframe in a card) so the home mounts zero players; build the rail as native overflow-x scroll-snap + tabindex=0 + real Prev/Next buttons with ARIA labels (progressive enhancement only on top); and gate **all** non-essential motion behind a single shared prefers-reduced-motion utility built in Phase 1.

## Key Findings

### Recommended Stack

Adopt michelle_ngo_four's package.json verbatim (plus optional `@sveltejs/enhanced-img`, `runed`, Playwright/axe) rather than hand-assembling versions. The locked baseline is still current; treat any bump as opt-in and **do not bump TypeScript to 6.0** (toolchain not certified). Motion and rails are built from native CSS, not libraries - both the cheapest and the most LCP-safe path. See `STACK.md`.

**Core technologies:**
- `@sveltejs/kit` 2.59.x + `svelte` 5.55.x (runes) - app framework; SvelteKit 3 / Svelte 6 not shipped, 2.x/5.x are current.
- `@sveltejs/adapter-static` 3.0.10 - required for GitHub Pages (no server); prerender all routes, `fallback: '404.html'`, `strict: true`.
- `tailwindcss` 4.3.x + `@tailwindcss/vite` - native OKLCH + CSS-first config, ideal for the dark per-category accent theme; v5 not shipped.
- `zod` 4.4.x - build-time validation of `videos.json` so a bad embed/category fails the build, not the browser.
- Native CSS (scroll-snap, scroll-driven animations, transform/opacity, perspective) - rails + parallax with zero JS bundle; **no three.js / GSAP / carousel lib for v1**.

### Expected Features

The genre has firm table stakes (hero + PLAY REEL, browsable collection, watch pages, about/press/contact, AA a11y, SEO/OG). v5's competitive edge is the rails UX done *right* (peek, proximity snap, keyboard, scroll buttons) plus dark OKLCH accents and tasteful depth. See `FEATURES.md`.

**Must have (table stakes):**
- Full-bleed hero + PLAY REEL (poster as LCP, iframe only on click) - genre norm.
- Rails homepage: 8 category rails with headings + "see all" links + skip-link - THE product.
- Watch page `/watch/[id]` (lazy embed, metadata, "more in category" rail, deep-linkable) + `/work` and `/work/[category]` grid.
- About (bio + Person JSON-LD), Press (credits), Contact surface; WCAG AA; SEO/OG + VideoObject JSON-LD.

**Should have (competitive):**
- Keyboard-navigable rails (Arrow/Home/End, roving tabindex), scroll buttons with peek, proximity snap - most portfolio carousels fail this.
- Per-category OKLCH accents (cheap, high perceived quality); tasteful 3D/parallax hero (motion-safe gated).
- PBS American Portrait flagship landing (18-video crown jewel deserves a designed page).

**Defer (v1.x / v2+):**
- Hover-preview silent autoplay on cards (muted clip / WebP, never per-card iframes) - defer until perf headroom confirmed.
- CSS `::scroll-button()`/`::scroll-marker()` progressive enhancement (Chromium-only mid-2026); richer scroll parallax; client-side grid filter; refreshing/scraping new videos.

**Explicit anti-features:** comments, accounts/likes/subscribe, full-text search service, infinite scroll, autoplay-with-sound, algorithmic recommendations, CMS, light-mode toggle, CSS-native-only rails (no Safari/FF), and live iframes in cards.

### Architecture Approach

Build-time data, zero runtime fetch: 56 videos in version-controlled JSON, parsed once by Zod, baked into prerendered HTML. Routes import only from the `$lib/data` barrel. v4's data layer, leaf components (`VideoCard`, `CategoryTag`), chrome (`TopNav`/`Footer`/`ContactBlock`), browse routes, and deploy workflows are **reused verbatim**. The only genuinely new code is the homepage composition - three components and the home loader. See `ARCHITECTURE.md`.

**Major components:**
1. `$lib/data` (schema.ts / categories.ts / videos.ts / index.ts) - typed loader API + build-time Zod validation; **reuse verbatim**.
2. `VideoCard` / `CategoryTag` / chrome (`TopNav`, `Footer`, `ContactBlock`) - shared leaves and shell; **reuse verbatim**.
3. `RailRow` (NEW) - accessible horizontal scroll-snap primitive (touch + keyboard + Prev/Next + reduced-motion).
4. `CategoryRail` (NEW) - labeled shelf wrapping `RailRow` with a heading-is-link.
5. `ReelHero` (evolve from `HeroPoster`) - full-bleed reel hero with motion-safe 3D/parallax; `#hero-sentinel` contract drives TopNav transparency.

### Critical Pitfalls

1. **Base-path / apex CNAME breakage** - works on localhost, 404s on the github.io subpath or the apex. Avoid: drive `paths.base` from `BASE_PATH` env, prefix every internal href/asset with `base` from `$app/paths`, ship `.nojekyll`, persist `static/CNAME`. Prove end-to-end in Phase 1.
2. **Deep-link 404 + prerender coverage gap** - `/watch/[id]` dies on cold refresh, or unlinked videos never get generated. Avoid: full prerender + `fallback: '404.html'` + explicit `entries()` for every dynamic route + a CI count check (exactly 56 watch + 8 category pages).
3. **Too many iframes on the rails home (LCP/INP death)** - dozens of live Vimeo/YouTube players. Avoid: **facade pattern always** (cards are `<img>` posters linking to `/watch`); exactly one live iframe, on the watch page only. Non-negotiable.
4. **Rails not keyboard / screen-reader operable (esp. Safari)** - bare `overflow-x` isn't keyboard-reachable in Safari. Avoid: section role=region + aria-label, ul/li markup, tabindex=0 on the scroll container, real >=44px Prev/Next buttons, proximity (not mandatory) snap, focus-into-view.
5. **Motion ignores prefers-reduced-motion + parallax jank/CLS** - premium motion becomes a nausea/a11y hazard and stutters. Avoid: one shared `motionSafe` util built in Phase 1, animate only transform/opacity, reserve hero/poster dimensions, CSS 3D over WebGL.
6. **Dark-theme contrast + invisible focus rings** - text over bright thumbnails, neon accents that fail AA, default thin-blue focus on black. Avoid: scrims behind overlay text, accents reserved for borders/large text, a deliberate thick high-contrast :focus-visible ring, automated axe pass.

## Implications for Roadmap

Because ~90% of the architecture is a verbatim port of a shipped sibling, the natural split is a fast low-risk **foundation/reuse phase** followed by the genuinely new **rails + motion** work, then **hardening + cutover**. Build order flows from shared leaves up to composing surfaces; the rails homepage is intentionally **last** because it depends on both the data API and `VideoCard`.

### Phase 1: Foundation, Data Reuse & Proven Deploy
**Rationale:** Everything reads `$lib/data` and every link/asset must be base-path-safe; prove base-path + deploy end-to-end *before* building features (Pitfall 1/2 are cheapest to catch on a trivial page). The shared `motionSafe` util must exist early so all later motion hangs off it.
**Delivers:** Scaffold + config (`svelte.config.js` adapter-static strict+fallback, `vite.config.ts` with validateVideosPlugin, `app.css` OKLCH theme), ported data layer + `videos.json`, `.nojekyll`, a `motionSafe` util, and a trivial page deploying green to the github.io subpath.
**Addresses:** Reused dataset + Zod validation; design-system tokens (scrim, focus ring, 8 accents validated for AA).
**Avoids:** Pitfalls 1 (base-path), 2 (fallback config), 7 (reduced-motion util), 10 (contrast tokens).

### Phase 2: Shared Components, Browse Routes & Static Pages
**Rationale:** `VideoCard`/`CategoryTag` and the chrome are reused everywhere and have no upstream deps; the card destinations (`/watch`, `/work`, `/pbs`) must exist before the home links to them. Near-verbatim v4 port = low risk.
**Delivers:** Leaf components + chrome + `+layout`; `/watch/[id]` (facade rail + single lazy iframe + per-video OG + VideoObject JSON-LD), `/work`, `/work/[category]`, PBS flagship landing; About/Press/Contact; `/sitemap.xml`. Each dynamic route exports `entries()`.
**Uses:** SvelteKit prerender + `entries()`, Zod-typed loaders, base-aware links, enhanced-img posters.
**Implements:** Data barrel, `VideoCard`/`CategoryTag`, watch player, JSON-LD generation.
**Avoids:** Pitfalls 3 (entries coverage), 4-facade on the "more" rail, 11 (per-page OG/VideoObject).

### Phase 3: Rails Homepage & Cinematic Hero (the signature)
**Rationale:** The only genuinely new architecture; depends on the data API + `VideoCard` from earlier phases. Warrants focused a11y/perf attention. Build RailRow -> CategoryRail -> ReelHero -> /+page compose.
**Delivers:** `RailRow` (scroll-snap + keyboard + Prev/Next + overscroll-contain + reduced-motion), `CategoryRail` (labeled shelf), `ReelHero` with motion-safe 3D/parallax, and the 8-rail homepage with skip-link.
**Addresses:** Rails homepage, keyboard-navigable rails, scroll buttons + peek + proximity snap, 3D/parallax hero, per-category accents.
**Avoids:** Pitfalls 4 (keyboard/SR/Safari), 5 (rail a11y), 6 (mobile momentum/overscroll), 8 (parallax jank/CLS), 9 (poster CLS).

### Phase 4: Hardening, Apex Cutover & Launch
**Rationale:** Perf/a11y budgets and the production CNAME cutover are verify-then-flip concerns best done once the site is content-complete; the apex switch is high-risk and needs a dry run.
**Delivers:** Lighthouse mobile LCP/CLS/INP budget pass, axe contrast + keyboard audit on real Safari/iOS/Android devices, CI prerender count check (56+8), robots.txt, the two-workflow deploy (staging auto + apex manual), CNAME persistence + HTTPS verification.
**Addresses:** WCAG AA pass, good mobile LCP, peaked iframe budget.
**Avoids:** Pitfalls 3 (CI count), 4/5/6 verified on device, 8/9 (CLS/INP budget), 12 (apex CNAME/HTTPS cutover).

### Phase Ordering Rationale

- **Dependencies flow upward:** data layer -> leaves -> chrome -> card destinations -> rails compose. The rails home is last because it consumes everything below it.
- **Reuse-first de-risks scope:** Phases 1-2 are a low-risk port of shipped v4 code, banking a content-complete site quickly so the new rails work in Phase 3 gets full attention.
- **Pitfall front-loading:** base-path (1), fallback (2), and the `motionSafe` util (7) are proven in Phase 1 - the cheapest place to catch them. The facade/iframe-budget rule (3/4) is a definition-of-done for the card in Phase 2 and the rail in Phase 3, not a later fix.
- **Cutover isolated:** the apex CNAME switch (12) is fenced into Phase 4 as a deliberate verify-then-flip with a dry run, never bundled into feature work.

### Research Flags

Phases likely needing deeper research during planning (`/gsd:research-phase`):
- **Phase 3 (rails + hero):** the **3D/parallax depth technique + mobile perf budget** is the one area without a directly-shipped sibling precedent - CSS scroll-driven animation has a Firefox support caveat, and "tasteful depth without WebGL" needs a concrete technique/budget decision. The rail a11y pattern (Safari focus, roving tabindex, SR semantics) also benefits from a focused spec.

Phases with standard patterns (skip research-phase):
- **Phase 1 & 2:** near-verbatim ports of shipped, test-covered v4 code (data layer, routes, `entries()`, deploy, JSON-LD) - well-documented, established here.
- **Phase 4:** Lighthouse/axe/CNAME cutover are standard, well-documented operations (pitfalls already enumerated).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | npm registry verified 2026-06-14; sibling pins are a proven, validated matrix; no major versions shipped that change the baseline. |
| Features | HIGH | Genre patterns well-established; rail UX + JSON-LD verified against W3C WAI, Chrome for Developers, Google Search docs; CSS-native carousel support verified current. |
| Architecture | HIGH | michelle_ngo_four is a fully-shipped, test-covered implementation of ~90% of this design; only the rails layer is new. |
| Pitfalls | HIGH | Core mechanics verified against SvelteKit docs, axe/WCAG ACT rules, web.dev, Chrome/TPGi a11y guidance; siblings v2-v4 are a proven baseline. |

**Overall confidence:** HIGH

### Gaps to Address

- **3D/parallax technique + perf budget (MEDIUM):** the "premium depth/motion" feel has no shipped sibling precedent and CSS scroll-driven animation has a Firefox support caveat. Handle in Phase 3 planning - pick a concrete CSS-first technique, set an explicit mobile CLS/INP budget, and gate enhancements so the no-support path still looks good.
- **Hover-preview feasibility (MEDIUM):** deferred to v1.x precisely because the iframe budget forbids per-card players. If pursued, validate the muted-clip / animated-WebP approach against the perf budget before committing.
- **Apex cutover dry-run (LOW):** CNAME preservation + base empty + HTTPS should be validated on a throwaway target before the real DNS switch - flag as an explicit Phase 4 acceptance step.
- **Real-device a11y (LOW):** Safari keyboard focus + mobile momentum/overscroll don't emulate faithfully in DevTools - require real iPhone/Android verification in Phase 4.

## Sources

### Primary (HIGH confidence)
- `michelle_ngo_four` shipped source (data layer, components, routes, `vite.config.ts`, `svelte.config.js`, deploy workflows) - the proven, test-covered reference implementation.
- npm registry (`npm view`, 2026-06-14) - confirmed current versions; no Svelte 6 / SvelteKit 3 / Tailwind v5 / certified TS 6.
- PROJECT.md - scope, locked decisions, rails requirement, constraints, contact/bio/dataset.
- SvelteKit docs (adapter-static, fallback, prerender, `entries()`); axe/W3C ACT rules (scrollable-region-focusable, 0ssw9k); Chrome for Developers (accessible carousels, ::scroll-button support); web.dev (scroll-snap, lazy iframes); Google Search / schema.org (VideoObject required fields).

### Secondary (MEDIUM confidence)
- SitePoint "Scroll-driven CSS in 2026"; "Web Animation: CSS vs GSAP 2026"; Embla Svelte get-started (escape hatch) - CSS covers ~80% of scroll motion at zero bundle; library only for complex cases.
- TPGi / Smashing / A11Y Collective on accessible horizontally-scrollable regions; Apple Developer Forums on Safari scroll-container focus.
- adapter-static base-path GitHub issues/discussions; Frontend Masters on zero-JS video embeds.

### Tertiary (LOW confidence)
- Swarmify "Why YouTube Embeds Hurt Your Website" (vendor, but measurements align with web.dev) - supports the facade requirement.

---
*Research completed: 2026-06-14*
*Ready for roadmap: yes*
