# Stack Research

**Domain:** Static SvelteKit video portfolio (dark, YouTube-style rails) on GitHub Pages
**Researched:** 2026-06-14
**Confidence:** HIGH

## TL;DR

The locked baseline is **still the current, correct stack** as of mid-2026. There is **no stable Svelte 6, no SvelteKit 3, and no Tailwind v5** — those major bumps have not shipped. Svelte remains on 5.x and SvelteKit on 2.x, Tailwind on v4.x. The only deltas vs the sibling pins are minor/patch bumps you may optionally take. **Adopt the proven sibling pins verbatim** and treat any version bump as opt-in, not required.

For motion and rails: **go CSS-first**. Use native CSS scroll-snap for the horizontal rails and CSS scroll-driven animations / `transform`+`opacity` transitions for the depth/parallax — zero JS bundle, compositor-threaded, LCP-safe. Do **not** pull in three.js, GSAP, or a carousel library for v1.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@sveltejs/kit` | `2.59.1` (sibling pin; npm latest `2.65.1`) | App framework, routing, prerender | Proven across v3/v4 for this exact content. SvelteKit 3 has **not** shipped — 2.x is current. |
| `svelte` | `5.55.5` (sibling pin; npm latest `5.56.3`) | UI runtime (runes) | Svelte 6 has **not** shipped stable; 5.x with runes is current and is what v3/v4 ship. |
| `@sveltejs/adapter-static` | `3.0.10` | Static prerender for GitHub Pages | Required for Pages (no server). Latest is 3.0.10 — sibling pin is already current. |
| `@sveltejs/vite-plugin-svelte` | `7.1.2` | Svelte ↔ Vite integration | Matches Vite 8 + Svelte 5; sibling pin is current latest. |
| `tailwindcss` | `4.3.0` (sibling pin; npm latest `4.3.1`) | Styling, OKLCH per-category accents | Tailwind v5 has **not** shipped; v4 is current. v4's native OKLCH + CSS-first config is ideal for the dark theme. |
| `@tailwindcss/vite` | `4.3.0` (sibling pin; npm latest `4.3.1`) | Tailwind v4 Vite plugin | v4's first-party Vite plugin (replaces PostCSS pipeline). Must match `tailwindcss` version. |
| `vite` | `8.0.7` (sibling pin; npm latest `8.0.16`) | Build tool / dev server | Vite 8 is current major; sibling pin works, patch bump optional. |
| `typescript` | `5.9.3` (sibling pin; npm latest `6.0.3`) | Type safety, build-time data types | **Keep 5.9.x.** TypeScript 6.0 shipped but is a new major — do NOT bump for v1; the sibling toolchain (svelte-check, typescript-eslint 8.x) is validated against 5.9. |
| Node | `22` (`.nvmrc`) | Runtime / CI | LTS, matches siblings and `engines: ">=22"`. |
| pnpm | `11.0.9` | Package manager | Matches siblings (`packageManager` field) for lockfile parity. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | `4.4.3` | Build-time validation of `videos.json` | Always — validate the 56-video dataset at build so a bad embed/category fails the build, not the browser. Sibling pin is current latest. |
| `@sveltejs/enhanced-img` | `0.10.4` | Responsive `<img>` for posters | Recommended — posters in `static/posters/` benefit from responsive `srcset`/AVIF to protect LCP. Used in v3. Latest = 0.10.4. |
| `@tailwindcss/typography` | `0.5.19` | Prose styling for bio/press copy | Optional — only if About/Press pages have long-form rich text. Used in v3. |
| `runed` | `0.37.1` | Svelte 5 reactive utilities (IntersectionObserver, media queries, etc.) | Optional — handy for lazy-mounting iframes and a `prefers-reduced-motion` rune. Used in v3. Prefer it over hand-rolled observers if you need several. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `svelte-check` `4.4.6` | Type/a11y diagnostics | `svelte-kit sync && svelte-check` — keep in CI. |
| `eslint` `9.39.4` + `typescript-eslint` `8.59.2` + `eslint-plugin-svelte` `3.17.1` | Linting | Flat config; do NOT bump typescript-eslint past 8.x while on TS 5.9. |
| `prettier` `3.8.3` + `prettier-plugin-svelte` `3.5.1` | Formatting | Matches siblings. |
| `vitest` `4.1.5` + `@vitest/coverage-v8` `4.1.5` | Unit/data tests | Use for `videos.json` data tests (mirror v4's `test:data`). |
| `husky` `9.1.7` + `lint-staged` `17.0.4` | Pre-commit hooks | Optional but used in both siblings. |
| `@playwright/test` `1.60.0` + `@axe-core/playwright` `4.11.3` | E2E + a11y audit | Optional — v3 used this to enforce AA + keyboard rails. Recommended for the accessibility requirement. |

## Motion & 3D / Parallax (the v5 signature)

**Recommendation: CSS-first, no animation library.** The "premium, immersive depth/motion" feel should be built from:

1. **Native CSS** — `transform: translate3d()` / `perspective` for depth, `opacity` for fades, `will-change` used sparingly. Composited on the GPU, zero JS, zero bundle.
2. **CSS scroll-driven animations** — `animation-timeline: view()` / `scroll()` for parallax and on-scroll reveals. Runs on the compositor thread off the main thread, so it does not block LCP/INP. (Confidence: HIGH that this is the 2026 best practice; MEDIUM on Firefox support — gate enhancements so the no-support path still looks good.)
3. **Svelte built-in transitions** (`svelte/transition`, `svelte/motion`) — for component enter/exit (rail items, hero CTA). Already in-framework, no dependency.
4. **`prefers-reduced-motion` gating is mandatory** — wrap all non-essential motion in `@media (prefers-reduced-motion: no-preference)` (or a `runed`/CSS guard). This is a hard PROJECT requirement.

**Do NOT use three.js / React-Three-Fiber / Babylon / WebGL engines** for a content portfolio — hundreds of KB + a render loop that competes with video iframes for the main thread, directly harming mobile LCP. The user's "3D websites" inspiration is achievable with CSS perspective/parallax alone.

**Do NOT add GSAP/ScrollTrigger for v1** — ~25KB gzipped and main-thread scroll handlers. CSS scroll-driven animations cover ~80% of these effects with zero bundle. Only reach for GSAP if a later phase genuinely needs scrub/pinning/snap-back orchestration that CSS can't express — and even then, treat it as a scoped, motion-safe-gated addition.

## Horizontal Scroll Rails (YouTube-style shelves)

**Recommendation: native CSS scroll-snap. No carousel library.**

- Build rails as an overflow-x flex/grid row with `scroll-snap-type: x mandatory` (or `proximity`) and `scroll-snap-align` on cards.
- Native solution is keyboard-accessible by default (focusable cards scroll into view), touch-friendly, and adds **zero bundle**. Add visible focus rings and optional prev/next buttons that call `element.scrollBy()`.
- Respect `prefers-reduced-motion` for the smooth-scroll behavior.

**Why not Embla / shadcn-svelte carousel / Swiper for v1:**

| Lib | Why skip for this site |
|-----|------------------------|
| Embla (`embla-carousel-svelte`) | Capable and has a v9 a11y plugin, but it's for autoplay/infinite-loop/dynamic-injection carousels. The rails are simple browse shelves — CSS scroll-snap does it with no dependency. |
| Swiper | Heavy, jQuery-era ergonomics, large bundle. Avoid. |
| shadcn-svelte Carousel | Wraps Embla; same reasoning — unnecessary dependency for static shelves. |

**Adopt Embla later only if** a real requirement appears (looping reel carousel, autoplay marquee). It's the right escape hatch, but not needed for v1's accessible browse rails.

## Installation

```bash
# Core (dev deps — SvelteKit projects keep framework in devDependencies)
pnpm add -D @sveltejs/kit@2.59.1 svelte@5.55.5 @sveltejs/adapter-static@3.0.10 \
  @sveltejs/vite-plugin-svelte@7.1.2 vite@8.0.7 typescript@5.9.3 \
  tailwindcss@4.3.0 @tailwindcss/vite@4.3.0

# Data validation + responsive images
pnpm add -D zod@4.4.3 @sveltejs/enhanced-img@0.10.4

# Optional supporting
pnpm add -D @tailwindcss/typography@0.5.19 runed@0.37.1

# Tooling (match siblings)
pnpm add -D svelte-check@4.4.6 eslint@9.39.4 typescript-eslint@8.59.2 \
  eslint-plugin-svelte@3.17.1 @eslint/js@9.39.4 globals@17.6.0 \
  prettier@3.8.3 prettier-plugin-svelte@3.5.1 \
  vitest@4.1.5 @vitest/coverage-v8@4.1.5 jsdom@29.1.1 \
  husky@9.1.7 lint-staged@17.0.4

# Optional E2E + a11y (recommended for the AA requirement)
pnpm add -D @playwright/test@1.60.0 @axe-core/playwright@4.11.3
```

> Fastest path: copy `michelle_ngo_four/package.json` verbatim, add `@sveltejs/enhanced-img` and (optionally) `runed`/Playwright from `michelle_ngo_three`, then `pnpm install`. Don't hand-assemble.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Svelte 5.55.x | Svelte 6 | Not applicable — Svelte 6 is not stable in mid-2026. |
| SvelteKit 2.59.x | SvelteKit 3 | Not applicable — SvelteKit 3 not released. |
| Tailwind v4.3.0 | Tailwind v5 | Not applicable — v5 not released. |
| TypeScript 5.9.3 | TypeScript 6.0 | Defer. Bump only after the rest of the toolchain (typescript-eslint, svelte-check) certifies TS 6; no benefit for v1. |
| CSS scroll-snap rails | Embla Carousel | Only if you need looping/autoplay/dynamic slides — not v1's browse shelves. |
| CSS scroll-driven animations | GSAP ScrollTrigger | Only for scrub/pin/snap-back orchestration CSS can't do — gate behind motion-safe and treat as scoped. |
| `@sveltejs/enhanced-img` | Manual `<picture>`/`srcset` | If you want full control over poster art direction; enhanced-img is simpler and protects LCP automatically. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| three.js / R3F / Babylon | Hundreds of KB + render loop competes with video iframes; wrecks mobile LCP on a content site | CSS `perspective`/`translate3d` parallax |
| GSAP + ScrollTrigger (for v1) | ~25KB gzipped, main-thread scroll handlers | CSS scroll-driven animations + Svelte transitions |
| Swiper.js | Heavy, large bundle, dated ergonomics | Native CSS scroll-snap |
| A runtime CMS / DB | Out of scope; site is static-only on Pages | Version-controlled `videos.json` + Zod |
| `@sveltejs/adapter-auto` / node/vercel adapters | Won't produce a fully static Pages build | `@sveltejs/adapter-static` with `fallback` off |
| TypeScript 6.0 (now) | New major; toolchain not yet validated against it for this stack | TypeScript 5.9.3 |
| Eagerly mounting all video iframes | Many concurrent Vimeo/YouTube iframes destroy LCP/INP | Lazy-mount on intersection (façade → iframe on click), cap concurrent embeds |

## Stack Patterns by Variant

**Because hosting is GitHub Pages (static):**
- `adapter-static` with `prerender = true` site-wide and `fallback` disabled.
- Configure `paths.base` = `/michelle_ngo_five` for staging, `''` for apex (`michellengo.net` via CNAME); ship `.nojekyll`. (Matches PROJECT constraints.)

**Because LCP on mobile is a hard requirement:**
- Use iframe façades (poster image + play button) and only swap in the real Vimeo/YouTube iframe on user intent.
- Use `@sveltejs/enhanced-img` for posters; prefer AVIF/WebP.
- Keep all motion compositor-only (`transform`/`opacity`), motion-safe gated.

**Because accessibility is AA:**
- Native scroll-snap rails + focus-visible rings + optional `scrollBy` prev/next buttons.
- Add `@axe-core/playwright` checks in CI to enforce contrast/landmarks/keyboard.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@sveltejs/kit@2.59.x` | `svelte@5.55.x`, `@sveltejs/vite-plugin-svelte@7.1.x`, `vite@8.0.x` | The validated sibling matrix — keep them moving together. |
| `tailwindcss@4.3.x` | `@tailwindcss/vite@4.3.x` | Must match versions exactly (v4 plugin is tied to core). |
| `typescript@5.9.x` | `typescript-eslint@8.59.x`, `svelte-check@4.4.x` | Do not bump TS to 6.x without bumping/certifying these together. |
| `zod@4.4.x` | Node 22, build-time only | No runtime cost — runs during prerender/data tests. |

## Sources

- npm registry (`npm view ... version`, 2026-06-14) — confirmed latest: kit 2.65.1, svelte 5.56.3, adapter-static 3.0.10, tailwindcss 4.3.1, @tailwindcss/vite 4.3.1, vite 8.0.16, typescript 6.0.3, zod 4.4.3, enhanced-img 0.10.4, vite-plugin-svelte 7.1.2 — HIGH
- Sibling pins: `michelle_ngo_four/package.json`, `michelle_ngo_three/package.json` — proven, validated baseline — HIGH
- [What's new in Svelte: June 2026](https://svelte.dev/blog/whats-new-in-svelte-june-2026) — confirms Svelte 5.x / SvelteKit 2.x current, no v6/3 stable — HIGH
- [Tailwind CSS blog](https://tailwindcss.com/blog) / [endoflife.date/tailwind-css](https://endoflife.date/tailwind-css) — confirms v4.x current, no v5 — HIGH
- [SitePoint: Scroll-Driven CSS in 2026 — Carousels Without JavaScript](https://www.sitepoint.com/scrolldriven-css-in-2026-building-carousels-without-javascript/) — CSS scroll-snap viable for simple rails; Embla for complex only — MEDIUM
- [Web Animation in 2026: CSS vs GSAP](https://artofstyleframe.com/blog/web-animation-css-vs-gsap-2026/) and [Scroll-Driven Animations — Replace GSAP with Pure CSS](https://medium.com/@alexdev82/scroll-driven-animations-replace-gsap-scrolltrigger-with-pure-css-b7d054ae3d02) — CSS covers ~80% of scroll motion at zero bundle; GSAP ~25KB — MEDIUM (Firefox scroll-timeline support caveat)
- [Embla Carousel — Svelte get-started](https://www.embla-carousel.com/get-started/svelte/) — first-party Svelte adapter + v9 a11y plugin exist (escape hatch) — HIGH

---
*Stack research for: static SvelteKit video portfolio (GitHub Pages)*
*Researched: 2026-06-14*
