# Phase 3 — Rails Homepage & Cinematic Hero — UI Design Contract

**Source:** ui-ux-pro-max design intelligence + Anthropic frontend-design principles + 03-RESEARCH.md (technical) + locked Phase-1 tokens.
**Status:** Design contract — planner + executors MUST honor this.

## Design north star
Premium, cinematic, dark, content-first — "think YouTube home" but elevated. The work (posters) carries the color; the UI is restrained near-black with thin accent-colored cues. Distinctive, NOT generic-AI: confident large display type, generous vertical rhythm, deliberate depth, motion that means something. Reference moods: isotopefilms (editorial), samhendi (full-bleed reel hero), YouTube (rails).

## Locked tokens (from Phase 1 — do NOT redefine)
- Canvas `oklch(0.16 0 0)` (near-black). 8 `--color-cat-*` OKLCH accents. Thick focus-visible ring (works over thumbnails). `--scrim`. Existing `VideoCard` (16:9 poster, line-clamped title, CategoryTag). Motion gate `prefersReducedMotion.current` (src/lib/state/motion.svelte.ts). categoryAccent() map.

## Typography (precision system)
- Use a single-family precision scale (the existing system stack is acceptable; Inter is a tasteful, self-hostable upgrade — if added, self-host WOFF2, font-display: swap, NO external Google CDN since site is static/offline-safe).
- Scale: Display (hero wordmark) clamp(2.5rem, 7vw, 6rem), weight 700, letter-spacing -0.02em. Rail labels: 0.8125rem, weight 600, UPPERCASE, letter-spacing +0.1em, accent-colored. Tagline: 1rem–1.25rem, weight 400, `rgba(255,255,255,0.72)`. Card titles stay as VideoCard defines.
- Optional cinematic flourish: hero wordmark may use a subtle white→`rgba(255,255,255,0.7)` text gradient (background-clip:text). Keep tasteful.

## HERO (ReelHero.svelte) — full-bleed, layered, motion-safe
Composition (3 depth layers, back→front):
1. **Background poster** — full-bleed `<img>` of the producer reel still (or a dedicated `static/` hero still), `object-fit:cover`, **eager + fetchpriority="high" + width/height** (LCP; never lazy). Slightly scaled (1.08) so parallax never reveals edges.
2. **Scrim** — layered gradient for text contrast: `linear-gradient(to top, oklch(0.16 0 0) 0%, transparent 55%)` + a soft top vignette. Must yield AA (≥4.5:1) for wordmark + tagline over ANY poster.
3. **Foreground content** — lower-left or centered stack: wordmark (Display), one-line tagline, and the **PLAY REEL** CTA. A subtle scroll-cue chevron at the bottom.

Hero sizing: `min-height: 88svh` (leaves a peek of the first rail below the fold — invites scroll). Use `svh` not `vh`.

**Depth / parallax choreography (CSS-first, double-gated):**
- Wrap ALL motion in BOTH `@media (prefers-reduced-motion: no-preference)` AND a JS check on `prefersReducedMotion.current`; plus `@supports (animation-timeline: scroll())` for the scroll parallax (Firefox mid-2026 partial → graceful static fallback).
- **Pointer depth (desktop, fine pointer only):** on `pointermove`, apply a tiny `transform: translate3d()` (max ±8px) to bg layer and an opposite ±4px to the foreground — parallax tilt feel. Throttle via rAF. `@media (hover:hover) and (pointer:fine)` only. transform/opacity ONLY.
- **Scroll parallax:** bg poster drifts up slower than scroll via `animation-timeline: scroll()` (translateY range ~0→-8%). Foreground fades/lifts slightly as you scroll past.
- Reduced-motion / unsupported / touch: static layered hero (still premium — strong type + scrim + poster). No transform.
- NEVER animate width/height/top/left. No CLS. Keep per-frame work <16ms.

**PLAY REEL CTA:** primary, single. Bordered pill (1px `rgba(255,255,255,0.6)`, fills to solid white text-on-dark on hover, 200ms color transition — NO layout shift). ≥44px tall, real `<button>`/`<a>`. Behavior: open a **click-to-load ReelLightbox** (focus-trapped `role="dialog" aria-modal`, Escape closes, returns focus, scrim 55% black, lazily mounts the Vimeo reel iframe on open). No-JS fallback = link to `/watch/264677021`. Mirror the proven WatchPlayer facade pattern.

## RAILS (CategoryRail.svelte wrapping the existing VideoCard)
One rail per category, in `getCategoriesInDisplayOrder()` order. Anatomy:
- **Header row:** accent-colored UPPERCASE label (small caps treatment per Typography) + a thin accent underline/dot, and a right-aligned "View all →" link to `/work/[category]`. Label color = that category's `--color-cat-*`.
- **Track:** `<section aria-labelledby>` → `<ul>` with `scroll-snap-type: x proximity` (NOT mandatory — mandatory traps users on long rails), `overscroll-behavior-x: contain`, `scroll-padding-left` matching the page gutter, hidden scrollbar (`scrollbar-width:none` + `::-webkit-scrollbar{display:none}`) but keep it scrollable. Each card `scroll-snap-align: start`.
- **Card sizing + peek (16:9):** `min-width: clamp(220px, 70vw, 300px)` mobile → desktop. Gap `1rem`. The clamp guarantees a visible PEEK of the next card on every breakpoint (the key "there's more" affordance). 2.2 cards on mobile, ~4.4 on desktop.
- **Prev/Next controls:** circular icon buttons (SVG chevrons, NOT emoji), ≥44px, semi-transparent dark `rgba(0,0,0,0.5)` + hairline border, appear on rail hover/focus-within (desktop) and always-available via keyboard. Click scrolls by `clientWidth * 0.85` (`behavior: gate ? 'auto' : 'smooth'`). Disable/hide at start/end. Hidden on touch (native swipe).
- **Keyboard / SR (per research):** cards are already focusable `<li><a>` — do NOT add tabindex=0 to the scroller (Safari double-stop). Natural Tab order suffices for HOME-03; optionally add roving Arrow/Home/End on the track as enhancement. Region labelled by the header (`aria-labelledby`); `<ul>`/`<li>` list semantics. Offscreen cards stay in DOM + focusable (never display:none) — focusing a partially-offscreen card scrolls it into view (native).
- **Card hover/focus:** poster brightens slightly + title underline; a soft accent-colored ring/glow on hover (color shift, 200ms, NO scale that shifts layout — a contained `transform: scale(1.03)` on the inner media with `transform-origin:center` is OK since it doesn't reflow). Focus-visible uses the locked thick ring.
- **ZERO iframes** on home — poster `<img>` only (HOME-06). First rail's first ~2 images eager; everything else `loading="lazy" decoding="async"`, reserved 16:9 box (no CLS).

## Rhythm & layout
- Page gutter: `clamp(1rem, 5vw, 4rem)`. Rails are full-bleed horizontally (track can run edge-to-edge with gutter as scroll-padding) for an immersive shelf feel.
- Vertical rhythm between rails: generous — `clamp(2.5rem, 6vh, 4rem)` (the "large 48px+ sections" cue). Hero→first rail slightly tighter to encourage the scroll hand-off.
- Max content width: rails can exceed a centered max-width (full-bleed); the hero is full-bleed. Keep nav/footer chrome from Phase 2.

## States
- **Empty rail:** a category with 0 videos is simply not rendered (no empty shelf).
- **Hover (pointer):** controls fade in, card media brightens, title underline.
- **Focus (keyboard):** thick focus-visible ring on cards/controls/CTA; focusing offscreen card scrolls into view.
- **Reduced motion:** all parallax/scroll-anim/smooth-scroll off; hover color-shifts (non-motion) may remain; everything still fully usable and premium.

## Anti-generic checklist (Anthropic frontend-design ethos)
- Confident, large hero type with real letter-spacing discipline — not a timid centered h1.
- Accent color used as a precise signal (rail labels, focus, hover glow), never as flat fills competing with posters.
- Depth is felt (layering, parallax, soft shadows/vignette) — not flat boxes.
- Motion is purposeful (parallax = depth, slide = "more in rail") and always reduced-motion-safe.
- Details: hairline `rgba(255,255,255,0.08)` dividers, scroll-cue, hidden-but-present scrollbars, snap that feels native.
- No emoji icons (SVG chevrons). One primary CTA (PLAY REEL).

## Acceptance hooks (verifiable)
- `build/index.html` contains ZERO `<iframe>` (HOME-06).
- Hero LCP `<img>` has `fetchpriority="high"` and explicit width/height, NOT loading=lazy (HERO-04).
- 8 rails render in display order, each with its accent label + a `/work/[category]` link.
- All motion wrapped in reduced-motion gate; `@supports` guard on scroll-timeline.
- PLAY REEL opens reel (lightbox or /watch/264677021); keyboard-closable.
- axe pass on `/`; no leading-slash hrefs.
