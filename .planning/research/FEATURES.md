# Feature Research

**Domain:** Dark, YouTube-style filmmaker video portfolio (static SvelteKit site, 56 videos across 8 categories, signature = horizontal scrolling category rails)
**Researched:** 2026-06-14
**Confidence:** HIGH (domain patterns well-established; rail/carousel UX and JSON-LD verified against W3C WAI, Chrome for Developers, and Google Search docs; CSS-native carousel browser support verified current)

## Feature Landscape

### Table Stakes (Users Expect These)

A film/video portfolio that lacks any of these feels incomplete or amateur. Users give no credit for having them but immediately distrust the work without them.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Full-bleed hero + PLAY REEL** | Filmmaker sites lead with the showreel; it's the elevator pitch. samhendi.com / samhendi-style hero is the genre norm. | MEDIUM | Vimeo 264677021 reel; poster image as LCP element, iframe loads only on PLAY click (don't autoplay an iframe on load — kills mobile LCP). |
| **Browsable video collection (rails on home)** | Users must see the breadth of work at a glance and find a category fast. This is THE homepage. | HIGH | 8 horizontal rails, one per category. See "Rails-Homepage UX" section — this is the signature, treat as table stakes *for this product* even though it's a differentiator vs. generic portfolios. |
| **Watch page per video** (`/watch/[id]`) | A clickable card must lead somewhere with the actual playable video + context. Deep-linkable/shareable. | MEDIUM | Lazy iframe embed (Vimeo or YouTube), title/category/description, "more in this category" rail. Must be prerendered + deep-linkable. |
| **Category browse / full grid** (`/work`, `/work/[category]`) | Power-browsers want the full set, not just the rail peek. "See all" target. | LOW | Static grid reusing the same card component. PBS American Portrait (18 videos) gets a flagship landing per PROJECT.md. |
| **Poster/thumbnail per card** | Video grids without thumbnails are unusable; users scan visually. | LOW | Reuse `static/posters/`. Lazy-load (`loading="lazy"`), fixed aspect ratio (16:9) to prevent CLS. |
| **About page + bio** | Hiring decision-makers (brands/broadcasters) need to know who Michelle is and her credits. | LOW | Approved bio already in PROJECT.md; PBS/HBO/ABC/U2 Sphere credits are the trust signals. |
| **Contact surface** | The site's job is to generate inquiries. Email/phone must be obvious. | LOW | mynogo@gmail.com, (917) 566-1976, Vimeo, socials. `mailto:` + `tel:` links. Footer-mirrored per reference sites. |
| **Press / credits page** | Per reference teardown (yvonnerusso.com/press), broadcast credits as a first-class page is genre-standard and a trust multiplier. | LOW | Broadcast credits list; can be simple. |
| **Responsive (mobile-first)** | Most portfolio traffic is mobile (shared links, social). Rails MUST work on touch. | MEDIUM | Native touch-scroll on rails (no custom drag JS needed); cards resize; hero collapses gracefully. |
| **Accessibility (WCAG AA)** | Constraint from PROJECT.md; also broadcasters care. Keyboard, contrast, reduced-motion. | MEDIUM | AA contrast on dark theme, focus-visible rings, semantic landmarks, reduced-motion gating. Rails need keyboard ops (see differentiators). |
| **SEO + Open Graph / Twitter cards** | Shared links must render rich previews; search must find the work. | LOW | Per-page `<title>`/meta, OG image (use video poster), Twitter `player`/`summary_large_image`. Trivial in SvelteKit `<svelte:head>`. |
| **Fast load / good mobile LCP** | Cinematic ≠ slow. Constraint from PROJECT.md (cap mounted iframes, lazy embeds). | MEDIUM | Poster images as LCP, zero iframes mounted until interaction, prerendered HTML. |

### Differentiators (Competitive Advantage)

Where v5 competes and earns "premium." Aligned with Core Value (fast, dark, YouTube-like, premium feel). Don't try to differentiate on everything — the rails + depth/motion are the headline.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Keyboard-navigable rails** (Arrow/Home/End, roving focus) | Makes the signature UI accessible AND power-user friendly; most portfolio carousels fail keyboard nav. | MEDIUM | ArrowLeft/Right move between cards, Home/End jump to ends; manage roving `tabindex` so Tab exits the rail (don't trap focus in a non-modal rail). Each rail = labelled `<section>` with an `<h2>` heading. |
| **Scroll buttons (prev/next chevrons) with peek** | Desktop affordance signalling "more to the right"; the half-visible next card (peek) is what makes a rail read as a rail, not a row. | MEDIUM | `scroll-padding-inline` + a partial card width so the next item peeks ~15-25%. Buttons scroll ~85% of viewport (matches native `::scroll-button` behavior). Hide buttons on touch; show on hover/focus. |
| **CSS scroll-snap on rails** | Cards snap to a clean left edge after a flick — feels engineered, not janky. | LOW | `scroll-snap-type: x proximity` (NOT `mandatory` — mandatory fights momentum scroll on long rails and traps users). `scroll-snap-align: start` on cards. |
| **Hover-preview (silent video/animated poster on card)** | The single most "YouTube" affordance; makes browsing feel alive and premium. | HIGH | MUST be muted + desktop-hover-only + reduced-motion-gated. Prefer a lightweight looping muted preview clip or animated WebP over mounting a real iframe (iframe-per-card breaks the iframe budget). Defer to v1.x if budget-constrained. |
| **Per-category OKLCH accent colors** | Visual wayfinding + premium polish; ties rail headers, focus rings, hover states to category identity. | LOW | Reuse v4's validated OKLCH accents. Cheap, high perceived-quality payoff. |
| **Tasteful 3D / parallax hero (depth + motion)** | User's explicit inspiration ("Claude 3D websites"); separates v5 from flat v4. | MEDIUM | Motion-safe gated (`prefers-reduced-motion`). Keep to hero + subtle card lift; do NOT 3D-transform every card (perf + nausea). Depth via layered parallax + shadow, not heavy WebGL. |
| **Deep-linkable, shareable watch pages** | Each film has a clean URL with correct OG/Twitter card → shares look pro. | LOW | Prerendered `/watch/[id]`; per-video OG image = poster, OG `video`/Twitter `player` tags. |
| **"More in this category" rail on watch page** | YouTube "up next" affordance; keeps visitors browsing, increases films-per-session. | LOW | Reuse rail component filtered to same category, excluding current video. |
| **JSON-LD: VideoObject per video + Person (About)** | Eligible for Google video rich results + AI/AEO visibility; Person schema establishes Michelle's entity. | LOW | VideoObject requires `name`, `description`, `thumbnailUrl`, `uploadDate` (Google rejects rich result without all four); add `embedUrl`, `duration` (ISO 8601 `PT#M#S`). Person on About with `sameAs` to Vimeo/IMDb/LinkedIn. Generate from the dataset at build time. |
| **PBS American Portrait flagship landing** | 18-video crown-jewel cluster deserves a dedicated, designed page, not just a category grid. | MEDIUM | Editorial hero + the 18 as a featured grid/rail. Differentiates from a generic category page. |
| **"Skip rails" / skip-to-content link** | Keyboard users on an 8-rail home need to bypass; also a genuine a11y differentiator most sites miss. | LOW | Standard skip-link + per-rail headings so screen-reader users can navigate by heading. |

### Anti-Features (Commonly Requested, Often Problematic)

Things that *seem* like "YouTube has it, so we should" but are wrong for a static, curated, single-creator portfolio. Documenting to prevent scope creep.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Comments** | "YouTube has them." | No backend (static site), moderation burden, spam, dilutes a premium curated feel. Out of scope per PROJECT.md (no DB). | None. Contact email is the engagement channel. |
| **User accounts / auth / likes / subscribe** | Mimic YouTube engagement. | Static site, no auth, no value for a portfolio whose goal is inquiries. Explicit Out of Scope. | A single, prominent Contact CTA. |
| **Search-as-a-service / full-text search** | "Users need to find videos." | Overkill for 56 curated videos; adds a service dependency or heavy client index for a set browsable in seconds. | Category rails + `/work` grid ARE the navigation. Optional: trivial client-side filter on the grid page only (no service). |
| **Infinite scroll on rails or grid** | Feels modern/endless. | 56 videos is finite and small; infinite scroll hurts a11y (focus loss), SEO (content not prerendered), and the footer becomes unreachable. | Finite rails with peek + a "see all" link to the prerendered grid. |
| **Autoplay video WITH SOUND** (hero or cards) | "Immersive." | Hostile UX, browser-blocked, accessibility violation, destroys mobile LCP/data. | Hero = poster + PLAY REEL click-to-play. Cards = muted silent hover-preview only, reduced-motion gated. |
| **Algorithmic recommendations / "trending"** | YouTube-like discovery. | No engagement data exists; would be fake. Implies a backend. | Hand-curated category order + "more in this category" (deterministic, same-category). |
| **CMS / admin backend** | "Easy content updates." | Out of scope per PROJECT.md; content is version-controlled TS/JSON. Adds runtime + hosting complexity GitHub Pages can't serve. | Edit `videos.json`, Zod-validate at build, redeploy via Actions. |
| **CSS-native `::scroll-button()`/`::scroll-marker()` as the ONLY rail mechanism** | "Zero-JS carousels in 2026." | Chrome/Edge 135+ ONLY — not in Firefox or Safari as of mid-2026. Safari is heavy on Apple-device creative audiences. | Build rails on native overflow-scroll + scroll-snap (universal) and a small JS/Svelte controller for buttons; *progressively enhance* with `::scroll-button` where supported. |
| **Light mode toggle** | "Give users choice." | Out of scope per PROJECT.md; v5 is dark-only by design (cinematic). | None — commit to the dark cinematic identity. |
| **Mounting a real video iframe in every card for hover-preview** | "True YouTube preview." | Blows the iframe budget; 8 rails × many cards = dozens of players → mobile death. | Muted looping clip / animated WebP poster, or just a scale/overlay hover. Real iframe only on the watch page. |

## Rails-Homepage UX (Signature Feature — Concrete Spec)

This is v5's differentiator vs. v4 (grid) and v3 (scroll-snap reels). Verified against W3C WAI Carousel guidance, Chrome for Developers carousel articles, and web.dev scroll-snap.

**Anatomy of one rail (repeat ×8, one per category):**
- A labelled `<section>` with a visible `<h2>` category heading (e.g., "PBS American Portrait") + a "See all →" link to `/work/[category]`. Headings are also SR landmarks.
- A horizontal overflow container of cards: `overflow-x: auto; scroll-snap-type: x proximity; scroll-padding-inline: <gutter>`.
- Each card: fixed 16:9 poster (lazy-loaded), `scroll-snap-align: start`, title overlay, category accent.

**The five things that make a rail feel premium (and most sites botch):**
1. **Peek** — the next card is partially visible (~15-25%) at the right edge. This is the single strongest "there's more, scroll me" signal. Achieved with card width < container and `scroll-padding-inline`.
2. **Snap (proximity, not mandatory)** — after a flick the rail settles a card flush-left. Use `proximity` so a deliberate long swipe isn't fought by the browser; `mandatory` traps and feels broken on long rails.
3. **Scroll buttons** — prev/next chevrons appear on hover/focus (desktop), scroll ~85% of the rail width per press. Disable/hide the prev button at the start and next at the end. Hidden on touch (native swipe). Match native `::scroll-button` semantics where you progressively enhance.
4. **Lazy thumbnails** — `loading="lazy"` + fixed aspect-ratio box so off-screen rail cards cost nothing until scrolled near, and there's zero layout shift. Critical with 8 rails on one page.
5. **Keyboard + SR navigation** — roving `tabindex` within a rail (Arrow keys move card focus, Home/End jump ends), and Tab moves OUT to the next rail (do NOT focus-trap — a rail is not a modal). A skip-link bypasses all rails. Reduced-motion disables smooth-scroll animation but keeps the jump.

**Implementation stance:** Base layer = native `overflow-x` + `scroll-snap` + a small Svelte 5 controller for buttons/keyboard (works in all browsers). Progressive enhancement = CSS `::scroll-button()`/`::scroll-marker()` in Chromium 135+ to reduce JS. Never depend on the CSS-native version alone (no Safari/Firefox support mid-2026).

## Feature Dependencies

```
56-video dataset (videos.json + Zod validation)
    └──requires──> nothing (reuse from michelle_ngo_four)
    └──feeds──> Rails homepage
    └──feeds──> Watch pages (/watch/[id])
    └──feeds──> Category grid (/work, /work/[category])
    └──feeds──> JSON-LD VideoObject generation

Card component
    └──required by──> Rails homepage
    └──required by──> Category grid
    └──required by──> "More in category" rail (watch page)

Rail component (snap + peek + buttons + keyboard)
    └──required by──> Rails homepage
    └──required by──> "More in category" rail (watch page)
    └──enhanced by──> CSS ::scroll-button (progressive, Chromium only)
    └──enhanced by──> Hover-preview (silent autoplay)

Watch page (/watch/[id])
    └──requires──> Card/Rail (for "more in category")
    └──requires──> Lazy iframe player
    └──enables──> Deep-linkable share + per-video OG/JSON-LD

prefers-reduced-motion gate
    └──required by──> 3D/parallax hero
    └──required by──> Hover-preview autoplay
    └──required by──> smooth scroll on rails

Hover-preview (silent autoplay) ──conflicts──> Iframe budget
    (resolve: use muted clip/WebP, NOT per-card iframes)

CSS scroll-snap: mandatory ──conflicts──> long-rail momentum scroll
    (resolve: use proximity)
```

### Dependency Notes

- **Everything requires the dataset:** the reused `videos.json` is the foundation; build-time Zod validation must land before rails/watch/grid. Earliest phase.
- **Rail before homepage:** the rail component (snap/peek/buttons/keyboard) is the reusable primitive; build and test it in isolation, then compose 8 of them on the home page and reuse one on each watch page.
- **Card before everything visual:** a single Card component is reused by rails, grid, and "more in category" — build once.
- **Reduced-motion gate is a cross-cutting dependency:** 3D hero, hover-preview, and smooth scroll all must respect it; build the gate (a Svelte store / media-query rune) early so motion features hang off it.
- **Hover-preview conflicts with the iframe budget:** never implement it as per-card iframes. Either a muted clip/animated poster, or defer hover-preview entirely to v1.x.
- **`scroll-snap: mandatory` conflicts with long rails:** use `proximity`.

## MVP Definition

### Launch With (v1)

Content-complete, premium-feeling, accessible. This is what validates the rails concept.

- [ ] Reused 56-video dataset + build-time Zod validation — foundation for all pages.
- [ ] Card component (lazy 16:9 poster, title, accent) — reused everywhere.
- [ ] Rail component: native scroll + proximity snap + peek + prev/next buttons + keyboard (Arrow/Home/End) + reduced-motion gate — the signature primitive.
- [ ] Rails homepage: 8 category rails with headings + "see all" links + skip-link.
- [ ] Full-bleed hero + PLAY REEL (poster LCP, click-to-load Vimeo iframe).
- [ ] Watch page `/watch/[id]`: lazy embed + metadata + "more in this category" rail + deep-linkable.
- [ ] Category grid `/work` and `/work/[category]`.
- [ ] PBS American Portrait flagship landing (18 videos).
- [ ] About (bio + Person JSON-LD), Press (credits), Contact surface (footer-mirrored).
- [ ] SEO/OG/Twitter cards per page + VideoObject JSON-LD per watch page.
- [ ] WCAG AA pass (contrast, focus-visible, landmarks, reduced-motion) + good mobile LCP.
- [ ] Per-category OKLCH accents.

### Add After Validation (v1.x)

Add once the rails concept is proven and perf headroom confirmed.

- [ ] Hover-preview silent autoplay on cards (muted clip / animated WebP) — trigger: rails validated AND iframe/perf budget has room.
- [ ] Richer 3D/parallax depth beyond the hero (subtle card lift on scroll) — trigger: motion feels good and perf is safe.
- [ ] Progressive-enhancement to CSS `::scroll-button()`/`::scroll-marker()` for Chromium — trigger: reduce JS once base works everywhere.
- [ ] Client-side filter/sort on the `/work` grid (no service) — trigger: users report wanting to slice the set.

### Future Consideration (v2+)

- [ ] Refresh/scrape new videos beyond the curated 56 — deferred per PROJECT.md (reuse v4 for v1).
- [ ] Dedicated case-study pages for marquee films (long-form storytelling) — defer until inbound demand justifies.
- [ ] CSS scroll-marker dot navigation per rail — defer; buttons + swipe suffice for 56 items.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Reused dataset + Zod validation | HIGH | LOW | P1 |
| Card component | HIGH | LOW | P1 |
| Rail component (snap/peek/buttons/keyboard) | HIGH | MEDIUM | P1 |
| Rails homepage (8 rails) | HIGH | MEDIUM | P1 |
| Hero + PLAY REEL | HIGH | MEDIUM | P1 |
| Watch page + "more in category" | HIGH | MEDIUM | P1 |
| Category grid (/work, /work/[category]) | MEDIUM | LOW | P1 |
| About / Press / Contact | HIGH | LOW | P1 |
| SEO/OG + VideoObject/Person JSON-LD | MEDIUM | LOW | P1 |
| WCAG AA + reduced-motion gate | HIGH | MEDIUM | P1 |
| Per-category OKLCH accents | MEDIUM | LOW | P1 |
| PBS flagship landing | MEDIUM | MEDIUM | P1/P2 |
| 3D/parallax hero | MEDIUM | MEDIUM | P2 |
| Hover-preview silent autoplay | MEDIUM | HIGH | P2 |
| CSS ::scroll-button progressive enhancement | LOW | LOW | P2 |
| Client-side grid filter | LOW | LOW | P3 |
| Scroll-marker dot nav | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor / Reference Feature Analysis

Reference teardowns from `michelle_ngo_four/_prep/02-references.md` plus sibling iterations.

| Feature | michelle_ngo_three (v3) | michelle_ngo_four (v4) | Reference sites | v5 Approach |
|---------|-------------------------|------------------------|-----------------|-------------|
| Homepage pattern | Vertical scroll-snap fullscreen reels | Static YouTube-style grid | samhendi full-bleed hero; isotope sectioned grid | **Horizontal category rails** (new) |
| Hero | Fullscreen reel | Grid-led | samhendi: full-bleed + PLAY REEL | Full-bleed + PLAY REEL + tasteful 3D |
| Browse | Scroll-snap reels | Grid by category | isotope: editorial sections w/ status tags | Rails on home + grid on /work |
| Watch | Inline | Per-video | — | Deep-linkable /watch/[id] + "more in category" |
| Press | — | — | yvonnerusso: Press as first-class page | First-class Press page |
| Color | Dark, photography-carried | Dark + OKLCH accents | samhendi: monochrome, let photo carry color | Dark + OKLCH per-category accents |
| Motion | Scroll-snap | Static | — | 3D/parallax hero, reduced-motion gated |

## Sources

- [W3C WAI Carousel guidance — keyboard, pause, list markup, headings] (via search synthesis) — HIGH
- [Chrome for Developers — Carousels with CSS (`::scroll-button`/`::scroll-marker`, browser support Chrome/Edge 135+, no FF/Safari)](https://developer.chrome.com/blog/carousels-with-css) — HIGH
- [Chrome for Developers — Make accessible carousels](https://developer.chrome.com/blog/accessible-carousel) — HIGH
- [web.dev — Well-controlled scrolling with CSS Scroll Snap](https://web.dev/articles/css-scroll-snap) — HIGH
- [Google Search docs — Video (VideoObject) structured data; required name/description/thumbnailUrl/uploadDate](https://developers.google.com/search/docs/appearance/structured-data/video) — HIGH
- [schema.org VideoObject type](https://schema.org/VideoObject) — HIGH
- [Carousel/slider accessibility implementation guide — TestParty](https://testparty.ai/blog/carousel-slider-accessibility) — MEDIUM
- [The A11Y Collective — accessible carousel testing](https://www.a11y-collective.com/blog/accessible-carousel/) — MEDIUM
- [SitePoint — Scroll-driven CSS in 2026 (JS-free carousels)](https://www.sitepoint.com/scrolldriven-css-in-2026-building-carousels-without-javascript/) — MEDIUM
- PROJECT.md — project context, 8 categories, routes, reference-site teardown, constraints — HIGH (primary)

---
*Feature research for: dark YouTube-style filmmaker video portfolio with horizontal category rails*
*Researched: 2026-06-14*
