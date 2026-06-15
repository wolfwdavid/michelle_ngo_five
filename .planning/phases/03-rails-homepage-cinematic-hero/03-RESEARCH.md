# Phase 3: Rails Homepage & Cinematic Hero - Research

**Researched:** 2026-06-14
**Domain:** Accessible horizontal scroll-snap rails + CSS-first 3D/parallax hero (static SvelteKit 5, dark, GitHub Pages)
**Confidence:** HIGH

## Summary

This is the signature phase. Everything it needs already exists in the codebase — the data API (`getCategoriesInDisplayOrder`, `getByCategory`, `producerReelId = '264677021'`), the reusable `VideoCard` (`<li><a>` poster facade, zero iframes), the dark OKLCH tokens with an over-thumbnail-safe focus ring, the `prefersReducedMotion` gate, and a proven facade pattern (`WatchPlayer`). Phase 3 composes these into: (1) a reusable accessible **rail** primitive, (2) eight category rails on `/`, and (3) a full-bleed **cinematic hero** with a PLAY REEL CTA and a tasteful, motion-safe 3D/depth treatment.

The two genuinely research-worthy questions both resolve cleanly against current (mid-2026) sources. **Rails:** build on native `overflow-x` + `scroll-snap-type: x proximity`, semantic `<section aria-labelledby>` + `<ul><li>` (the cards are already `<li><a>`), keyboard via the natural-tab-order links plus explicit Prev/Next buttons that `scrollBy(~85%)`, and a Safari-safe focusable scroller — with one important nuance about NOT double-stopping the scroller (see Architecture). **Hero:** CSS-first depth wins decisively — `perspective` + `translateZ` layered parallax driven by `animation-timeline: scroll()`/`view()` (now Baseline-ish: Chrome/Edge/Opera full, **Safari 26 full**, **Firefox still behind a flag**), plus an optional pointer-tilt, all gated on `prefersReducedMotion.current` and feature-detected with `@supports`. No three.js, no GSAP — the PROJECT explicitly forbids them and CSS covers it at zero bundle.

**Primary recommendation:** Two new components — `CategoryRail.svelte` (semantics + scroll container + buttons + keyboard, reuses `VideoCard`) and `ReelHero.svelte` (LCP poster, PLAY REEL, layered CSS-3D parallax gated on the existing motion store) — plus a thin `+page.svelte`/`+page.ts` that maps `getCategoriesInDisplayOrder()` → rails. PLAY REEL should open a **focus-managed lightbox** that lazily mounts the reel iframe (keeps home at zero iframes until intent), with navigate-to-`/watch/264677021` as the graceful no-JS / fallback path.

<user_constraints>
## User Constraints

No `03-CONTEXT.md` exists for this phase (not run through `/gsd:discuss-phase`). Constraints below are the locked PROJECT/REQUIREMENTS decisions that bound this phase — treat them as non-negotiable.

### Locked Decisions (from PROJECT.md / REQUIREMENTS.md / research docs)

- **Stack is frozen:** SvelteKit 2 + Svelte 5 (runes) + Tailwind v4 + adapter-static. No version bumps. (PROJECT Constraints, STACK.md)
- **CSS-first motion only.** Heavy 3D engine (three.js / R3F / Babylon) and GSAP/ScrollTrigger are **Out of Scope** for v1 (REQUIREMENTS Out of Scope; STACK.md "What NOT to Use"). Depth/parallax = CSS perspective/transform + CSS scroll-driven animations + Svelte transitions only.
- **Native scroll-snap rails, no carousel library** (Embla/Swiper/shadcn). (STACK.md, FEATURES.md)
- **`scroll-snap-type` = `proximity`, NOT `mandatory`** — mandatory fights momentum on long rails. (FEATURES.md item 2, PITFALLS Pitfall 5)
- **ZERO live iframes on home (HOME-06).** Cards are lazy poster `<img>` only. PLAY REEL is the only path to a live player from home, and it must mount on intent (click), not on load. (REQUIREMENTS HOME-06, HERO-02; PITFALLS Pitfall 4)
- **All motion gated on the single shared gate** `prefersReducedMotion.current` from `$lib/state/motion.svelte.ts`. Never per-component `matchMedia`. (FND-06; the gate's own doc comment; PITFALLS Pitfall 7)
- **Hero LCP image is eager + `fetchpriority="high"`, NOT lazy** (HERO-04; PITFALLS Pitfall 4 inverse trap).
- **Reduced-motion path still looks premium** — static hero frame, no broken layout, no parallax/tilt (HERO-03; PITFALLS Pitfall 7).
- **Dark-only.** No light mode. Accents reserved for borders/labels/headings, never small body text on near-black (DSGN; PITFALLS Pitfall 10).
- **Base-path-safe links always** — `${base}/...` from `$app/paths`, never leading-slash absolute (PITFALLS Pitfall 1). `VideoCard` already does this.
- **Producer reel = Vimeo `264677021`** (`producerReelId`, already exported; D-09).

### Claude's Discretion (planner decides)

- PLAY REEL: lightbox/modal vs. navigate-to-`/watch/264677021`. (Research **recommends lightbox with navigate fallback** — see Q4.)
- Exact rail card width / peek amount / snap gutter values (research gives a starting recipe).
- Whether to extract a shared `RailRow` (presentational scroller) under both `CategoryRail` (home) and a future refactor of the watch-page "more in category" grid. (Research recommends the split shape but it's optional for v1.)
- Pointer-tilt on the hero (nice-to-have on top of scroll parallax) vs. parallax-only.
- Progressive enhancement to CSS `::scroll-button()`/`::scroll-marker()` (Chromium-only) — **defer to v1.x** per REQUIREMENTS ENH-03; do not block on it.

### Deferred Ideas (OUT OF SCOPE for this phase)

- Hover-preview autoplay on cards (ENH-01) — v2/v1.x; never as per-card iframes.
- Native CSS `::scroll-button()`/`::scroll-marker()` as the rail mechanism (ENH-03) — progressive enhancement only, later.
- Scroll-marker dot navigation per rail (FEATURES v2+).
- Richer scroll-driven depth beyond the hero (subtle card lift on scroll) — v1.x after perf headroom confirmed.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HOME-01 | One horizontal scroll-snap rail per category, in display order, accent-labeled | `getCategoriesInDisplayOrder()` + `getByCategory()` already exist; `categoryAccent()` map exists. Architecture → "Home composition" + `CategoryRail`. |
| HOME-02 | Cards (poster+title+meta), horizontal scroll-snap, visible peek of next card | Native `overflow-x` + `scroll-snap-type: x proximity` + `scroll-snap-align: start`; peek via card width < container + `scroll-padding-inline`. Reuses `VideoCard`. Architecture → Pattern 1, "Peek recipe". |
| HOME-03 | Keyboard (arrow/Home/End), Tab exits (no trap), Prev/Next buttons on pointer devices | Natural-tab-order links + roving-or-natural arrow handling + `scrollBy(~85%)` buttons. Architecture → Pattern 2 "Keyboard & buttons". Pitfall: Safari `tabindex=0` nuance (see "Safari scroller" note). |
| HOME-04 | SR-friendly labeled region + list semantics; offscreen cards don't strand focus | `<section aria-labelledby>` + `<ul><li>`; cards scroll into view on focus; **don't** `display:none` offscreen cards. Optional Chromium `interactivity: inert`. Architecture → Pattern 3 "ARIA shape". |
| HOME-05 | Cards link to `/watch/[id]` | Already wired in `VideoCard` (`${base}/watch/${video.id}`). No new work. |
| HOME-06 | Zero live iframes on home — poster images only | `VideoCard` is poster-only today. Rail must not introduce iframes. Build-time guard recommended (Don't Hand-Roll / "Validation"). |
| HERO-01 | Full-bleed hero: wordmark + tagline + PLAY REEL CTA | `ReelHero.svelte`. Replaces the Phase-1 placeholder `+page.svelte`. Architecture → Pattern 4. |
| HERO-02 | PLAY REEL opens producer reel (Vimeo 264677021) | `producerReelId` exported. Recommend focus-managed lightbox lazily mounting the embed; navigate-to-`/watch/264677021` fallback. Code Examples → lightbox. |
| HERO-03 | Tasteful 3D/depth/parallax, gated on reduced-motion, degrades gracefully | CSS `perspective`+`translateZ` layers + `animation-timeline: scroll()`/`view()`; `@supports` + `prefersReducedMotion.current` gate; static premium fallback. Q2 + Code Examples. |
| HERO-04 | Eager LCP image | `loading="eager"` + `fetchpriority="high"` + reserved aspect box, never lazy. Pattern 4 + Perf. |
</phase_requirements>

## Standard Stack

**No new dependencies.** Everything is native CSS + Svelte 5 + the existing data/design/motion layers. This is deliberate (PROJECT/STACK both forbid motion/carousel libraries for v1).

### Already present (reuse verbatim)
| Asset | Location | Purpose in Phase 3 |
|-------|----------|--------------------|
| `getCategoriesInDisplayOrder()` | `$lib/data` | Rail order (count desc, ties alpha) — HOME-01 |
| `getByCategory(category)` | `$lib/data` | Cards per rail — HOME-02 |
| `getCategoriesWithCounts()` | `$lib/data` | Optional rail header counts / nav chips |
| `producerReelId` (`'264677021'`) | `$lib/data` | PLAY REEL target — HERO-02 |
| `getById(id)` | `$lib/data` | If PLAY REEL needs the reel's embed URL for the lightbox |
| `VideoCard.svelte` | `$lib/components` | The rail card (`<li><a>`, poster facade, base-safe link, accent tag) — HOME-02/05/06 |
| `categoryAccent(category)` | `$lib/components/categoryAccent` | Accent class for rail headings — HOME-01 |
| `prefersReducedMotion` | `$lib/state/motion.svelte.ts` | The ONE motion gate — HERO-03, smooth-scroll |
| Dark tokens + focus ring + `.scrim` | `src/app.css` | Contrast-safe over-thumbnail text, focus visible on black — Pitfall 10 |
| `WatchPlayer.svelte` (facade) | `$lib/components` | Pattern reference for the PLAY REEL lightbox (poster → iframe on click) |

### Alternatives Considered (all rejected for v1)
| Instead of | Could Use | Tradeoff / Why rejected |
|------------|-----------|-------------------------|
| Native scroll-snap | Embla / Swiper / shadcn carousel | Bundle + complexity for simple browse shelves; native is keyboard/touch-native, zero KB. (STACK.md) |
| CSS perspective/parallax | three.js / R3F | Hundreds of KB + render loop competing with the page; wrecks mobile LCP. Out of Scope. |
| CSS scroll-driven animations | GSAP ScrollTrigger | ~25 KB + main-thread scroll handlers; CSS covers it compositor-side. Out of Scope. |
| `::scroll-button()`/`::scroll-marker()` | (native CSS carousel UI) | Chromium-only mid-2026; not Safari/Firefox. Use as progressive enhancement later (ENH-03), never as the base mechanism. |

**Installation:** none.

## Architecture Patterns

### Recommended component shape

```
src/lib/components/
├── CategoryRail.svelte   # NEW — semantics + scroll container + Prev/Next + keyboard; reuses VideoCard
├── ReelHero.svelte       # NEW — full-bleed hero, LCP poster, PLAY REEL, CSS-3D parallax (motion-gated)
└── ReelLightbox.svelte   # NEW (recommended) — focus-trapped modal that lazily mounts the reel iframe
src/routes/
└── +page.svelte          # REWRITE Phase-1 placeholder → ReelHero + {#each rails} CategoryRail
   (+page.ts)             # OPTIONAL — build rails array in a load(); or compute inline in +page.svelte
```

> **Optional `RailRow` split (Claude's Discretion):** if you want one scroller used by both the home rails and a future refactor of the watch-page "more in category" section, extract a presentational `RailRow.svelte` (just the `<ul>` scroller + snap CSS + buttons) and let `CategoryRail.svelte` wrap it with the `<section>`/heading/"See all". For v1, a single `CategoryRail` is fine; the watch page already uses a grid, not a rail, so there's no immediate duplication.

### Pattern 1: Native scroll-snap rail with peek
**What:** A horizontal `overflow-x: auto` `<ul>` of fixed-width cards that snap to the start edge, with the next card half-visible.
**When:** Every category rail (×8) and any future "more like this" rail.
**Recipe (Tailwind v4 / CSS):**
- Scroller: `display:flex; overflow-x:auto; scroll-snap-type: x proximity; scroll-padding-inline: <gutter>; overscroll-behavior-x: contain;` and reduced-motion-aware `scroll-behavior` (see Pattern 2).
- Each `<li>` card: `scroll-snap-align: start; scroll-margin-inline: <gutter>;` with a **fixed width less than the container** so the next card peeks ~15–25% (e.g. `min-width: clamp(220px, 70vw, 320px)` on mobile so one card + a peek shows; smaller fixed widths on desktop where several show).
- 16:9 poster box already reserved by `VideoCard` (`aspect-video`) → no CLS.
```css
/* Source: web.dev CSS Scroll Snap + FEATURES.md "five things that make a rail premium" */
.rail-scroller {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;          /* NOT mandatory (Pitfall 5) */
  scroll-padding-inline: 1rem;
  overscroll-behavior-x: contain;          /* don't chain to page scroll (Pitfall 6) */
  -webkit-overflow-scrolling: touch;
}
.rail-scroller > li { scroll-snap-align: start; flex: 0 0 auto; }
```

### Pattern 2: Keyboard & Prev/Next buttons
**What:** Pointer users get chevron buttons that page the rail; keyboard users tab through the card links naturally, with optional Arrow/Home/End enhancement.
**Recommended behavior:**
- **Prev/Next buttons** call `scroller.scrollBy({ left: ±direction * scroller.clientWidth * 0.85, behavior })`. 85% matches native `::scroll-button` paging. Disable Prev at `scrollLeft <= 0` and Next at `scrollLeft + clientWidth >= scrollWidth - 1` (track with a scroll listener or `IntersectionObserver` on first/last card). Buttons are ≥44×44px, hidden on touch (`@media (hover: hover)`), shown on hover/focus-within.
- **`behavior`** = `prefersReducedMotion.current ? 'auto' : 'smooth'` — reduced motion gets an instant jump, not an animated scroll (Pitfall 7).
- **Keyboard:** the simplest correct baseline is **natural tab order through the card `<a>` links** — Tab moves card→card→out of the rail (no trap, satisfies HOME-03 "Tab exits"), and the browser scrolls a focused card into view automatically (ensure `scroll-margin-inline` so it isn't flush under the gutter). Optionally enhance with an `onkeydown` on the scroller/cards: `ArrowLeft/Right` → focus prev/next card, `Home/End` → focus first/last. If you add Arrow handling, use **roving tabindex** (focused card `tabindex=0`, others `-1`) OR just `.focus()` the sibling link — but do NOT also make the scroller itself a tab stop on top of focusable children (see Safari note).
**Anti-pattern:** JS that hijacks the wheel/`preventDefault` to drive scrolling — fights native momentum (Pitfall 6). Let the browser scroll; only `scrollBy` on explicit button/key.

### Pattern 3: ARIA / list semantics (HOME-04)
**What:** Each rail is a labeled region wrapping a real list.
**Shape:**
```html
<section aria-labelledby="rail-{slug}-h">       <!-- gives SR the region + its name -->
  <div class="rail-head">
    <h2 id="rail-{slug}-h" class="{accent}">PBS American Portrait</h2>
    <a href="{base}/work/{slug}/">See all →</a>
  </div>
  <ul class="rail-scroller">                     <!-- list semantics: "list, N items" -->
    <!-- VideoCard renders each <li><a>…</a></li> -->
  </ul>
  <button …Prev> <button …Next>                   <!-- pointer affordance -->
</section>
```
- A visible `<h2>` per rail doubles as a screen-reader landmark — users navigate by heading; add a top-of-page **skip-to-content** link so keyboard users bypass all 8 rails (FEATURES "Skip rails").
- **Offscreen cards stay in the DOM** (don't `display:none` on scroll — breaks Tab). They remain focusable and scroll into view when focused. That satisfies "offscreen cards don't strand focus": focus *can* reach them and brings them on-screen, rather than being stranded on a hidden element.
- **Chromium-only progressive enhancement:** the 2026 Chrome guidance is to use `interactivity: inert` driven by a scroll-state container query so only *snapped/visible* cards are focusable — cleaner than JS focus management. Treat as an enhancement; the base (all cards focusable, scroll-into-view) is correct everywhere.

**Safari scroller note (important):** Safari does NOT add a bare `overflow` div to the tab order unless it has `tabindex="0"` or a focusable child. Our rail's cards ARE focusable `<a>` links, so the rail is reachable in Safari **without** adding `tabindex=0` to the scroller. Avoid adding `tabindex="0"` to a scroller that already contains focusable children: it creates an extra tab stop and some SRs then announce the whole container's contents. Net rule: **list of focusable cards + `aria-labelledby` region = reachable everywhere, no scroller `tabindex` needed.** Only add `tabindex=0` to a scroller if it has NO focusable children (not our case).

### Pattern 4: Cinematic hero (HERO-01/03/04)
**What:** Full-bleed (`100svh`-ish, or a tall reserved box) hero with a layered background poster, the wordmark + tagline, and the PLAY REEL CTA, with depth via stacked parallax layers.
**Structure (back→front layers for depth):**
1. Background poster `<img>` — **eager, `fetchpriority="high"`, `decoding="async"`**, in a reserved aspect/min-height box (HERO-04, no CLS). This is the LCP element.
2. Optional mid layer (gradient/scrim, subtle texture) at a different parallax depth.
3. Foreground content (wordmark `<h1>`, tagline, PLAY REEL `<button>`).
- Depth = each layer at a different `translateZ` under a shared `perspective`, and/or each layer animated on a `scroll()` timeline at a different rate (back moves least). See Q2 + Code Examples.
- **All motion gated:** wrap the parallax in `@supports (animation-timeline: scroll())` AND only apply when `!prefersReducedMotion.current`. Reduced-motion / unsupported → static layered hero (still premium: scrim + type + poster). Never break layout.

### Anti-Patterns to Avoid
- **`scroll-snap-type: x mandatory`** on long rails → traps mid-swipe (use `proximity`).
- **`display:none` / unmounting offscreen cards on scroll** → breaks keyboard tab order (Pitfall 5).
- **`tabindex="0"` on a scroller that already has focusable cards** → redundant tab stop + SR over-announcement.
- **Mounting any iframe on home** → violates HOME-06; PLAY REEL mounts on click only.
- **Animating `left`/`margin`/`top` for parallax** → layout thrash/CLS; only `transform`/`opacity` (Pitfall 8).
- **Lazy-loading the hero poster** → ~20% LCP regression (Pitfall 4 inverse).
- **Per-component `matchMedia`** → use `prefersReducedMotion.current` (the gate's doc forbids it).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Horizontal carousel | Custom drag/momentum JS, or Embla/Swiper | Native `overflow-x` + `scroll-snap` | Native is keyboard/touch-accessible, momentum-correct, zero KB |
| Scroll parallax | `scroll` event listener doing rAF math | CSS `animation-timeline: scroll()/view()` | Compositor-threaded, no INP cost, no jank (Pitfall 8) |
| Reduced-motion detection | New `matchMedia` per component | `prefersReducedMotion.current` | Single SSR-safe gate already built (FND-06) |
| Card / poster facade | New card markup | `VideoCard.svelte` | Already base-safe, accent-tagged, lazy/eager, CLS-safe, zero-iframe |
| Reel player facade | New player | Pattern from `WatchPlayer.svelte` | Proven poster→iframe-on-click facade |
| Smooth vs instant scroll | Manual animation tween | `element.scrollBy({behavior})` toggled by the gate | Browser-native, respects reduced motion |
| Category order / counts | Sort in the component | `getCategoriesInDisplayOrder()` / `getByCategory()` | Already implements D-04 (count desc, ties alpha) |

**Key insight:** In 2026 the browser ships the carousel and the scroll-animation engine. The entire phase is *composition + a few buttons + gating*, not building primitives.

## Common Pitfalls

(Full catalogue in `.planning/research/PITFALLS.md`; the ones that bite *this phase*:)

### Pitfall A: Rail not operable in Safari / strands focus
**What goes wrong:** Keyboard users can't reach cards 4–7, or Tab lands on a hidden card and the viewport jumps.
**Avoid:** Keep all cards as in-DOM focusable `<a>` links (let focus scroll them into view via `scroll-margin-inline`); add `aria-labelledby` region + `<ul>`/`<li>`; provide Prev/Next buttons; never unmount/`display:none` offscreen cards. Don't add `tabindex=0` to the scroller (it has focusable children).
**Warning sign:** VoiceOver never says "list, N items"; Tab skips most cards.

### Pitfall B: Iframe leaks onto home
**What goes wrong:** PLAY REEL (or a careless card change) mounts a live Vimeo iframe on initial home render → mobile LCP collapse, violates HOME-06.
**Avoid:** Reel iframe exists only after the PLAY REEL click (lightbox `{#if open}`), exactly like `WatchPlayer`. A build-time grep guard (below) makes this enforceable.
**Warning sign:** `<iframe` present in `build/index.html`.

### Pitfall C: Reduced motion half-applied
**What goes wrong:** CSS transitions get gated but the JS smooth-scroll or the scroll-timeline parallax still runs.
**Avoid:** Single gate — `behavior: prefersReducedMotion.current ? 'auto' : 'smooth'` for buttons; `@supports` + gate for parallax; static fallback verified by toggling OS "Reduce motion".
**Warning sign:** Enabling OS reduce-motion changes nothing on `/`.

### Pitfall D: CLS from hero/poster + parallax
**Avoid:** Reserve hero dimensions (aspect-ratio/min-height); animate only `transform`/`opacity`; `will-change: transform` sparingly (hero layers only, not every card); hero poster eager + `fetchpriority=high`.
**Warning sign:** Lighthouse CLS > 0.1 attributed to hero; stutter scrolling home on a phone.

### Pitfall E: `scroll-snap: mandatory` / overscroll chaining on mobile
**Avoid:** `proximity` snap + `overscroll-behavior-x: contain`; test on a real iPhone/Android, not just DevTools.

### Pitfall F: Dark contrast / invisible focus over bright posters
**Avoid:** Already handled by `app.css` (light focus ring + dark halo, `.scrim`). For rail headings use accent on near-black headings only (large text), never accent for small body text.

## Code Examples

### Q1 — `CategoryRail.svelte` shape (rail primitive)
```svelte
<!-- Source: web.dev CSS Scroll Snap; Chrome "accessible carousel"; FEATURES.md rail spec -->
<script lang="ts">
  import VideoCard from './VideoCard.svelte';
  import { categoryAccent } from './categoryAccent';
  import { categoryToSlug, type Category, type Video } from '$lib/data';
  import { prefersReducedMotion } from '$lib/state/motion.svelte';
  import { base } from '$app/paths';

  let { category, videos }: { category: Category; videos: readonly Video[] } = $props();
  const slug = $derived(categoryToSlug(category));
  let scroller: HTMLUListElement;

  function page(dir: 1 | -1) {
    if (!scroller) return;
    scroller.scrollBy({
      left: dir * scroller.clientWidth * 0.85,
      behavior: prefersReducedMotion.current ? 'auto' : 'smooth'
    });
  }
</script>

<section aria-labelledby={`rail-${slug}`} class="rail">
  <div class="flex items-baseline justify-between gap-4 px-4">
    <h2 id={`rail-${slug}`} class={`text-lg font-bold uppercase tracking-wider ${categoryAccent(category)}`}>
      {category}
    </h2>
    <a href={`${base}/work/${slug}/`} class="text-sm text-neutral-400 hover:underline">See all →</a>
  </div>

  <div class="relative">
    <ul bind:this={scroller} class="rail-scroller">
      {#each videos as video, i (video.id)}
        <VideoCard {video} eager={false} />  <!-- offscreen rails stay lazy -->
      {/each}
    </ul>
    <!-- Prev/Next: pointer-only, ≥44px, hidden on touch via CSS @media (hover:hover) -->
    <button type="button" class="rail-btn rail-btn--prev" aria-label={`Scroll ${category} left`} onclick={() => page(-1)}>‹</button>
    <button type="button" class="rail-btn rail-btn--next" aria-label={`Scroll ${category} right`} onclick={() => page(1)}>›</button>
  </div>
</section>

<style>
  .rail-scroller {
    display: flex; gap: .5rem; padding-inline: 1rem;
    overflow-x: auto; scroll-snap-type: x proximity;
    scroll-padding-inline: 1rem; overscroll-behavior-x: contain;
  }
  .rail-scroller > :global(li) {
    scroll-snap-align: start; scroll-margin-inline: 1rem; flex: 0 0 auto;
    min-width: clamp(220px, 70vw, 300px);   /* peek of next card on mobile */
  }
  @media (min-width: 768px) { .rail-scroller > :global(li) { min-width: 280px; } }
  .rail-btn { /* ≥44px, focus-visible inherited from app.css */ }
  @media (hover: none) { .rail-btn { display: none; } }   /* touch uses native swipe */
</style>
```
> Note: `VideoCard` renders its own `<li>`, so the `<ul>` receives `<li>` children directly. The `:global(li)` selector in `<style>` reaches them (scoped Svelte styles don't pierce child components otherwise). Alternative: pass card width via a prop/class. Planner's call.

### Q2 — Hero CSS-3D depth + scroll parallax (motion-gated)
```svelte
<!-- Source: MDN scroll-driven animations; Josh W. Comeau; caniuse animation-timeline -->
<script lang="ts">
  import { prefersReducedMotion } from '$lib/state/motion.svelte';
  // motionOK drives a class; CSS @supports handles the no-scroll-timeline case.
  const motionOK = $derived(!prefersReducedMotion.current);
</script>

<section class="hero" class:motion={motionOK}>
  <img class="hero-bg" src={poster} alt="" loading="eager" fetchpriority="high" decoding="async" />
  <div class="hero-mid" aria-hidden="true"></div>
  <div class="hero-fg">
    <h1>Michelle Ngo</h1>
    <p>Filmmaker &amp; producer based in New York City.</p>
    <button type="button" onclick={openReel}>Play reel ▶</button>
  </div>
</section>

<style>
  .hero { position: relative; min-height: 100svh; overflow: clip; perspective: 1px; /* CSS-3D depth */ }
  .hero-bg, .hero-mid { position: absolute; inset: 0; }
  .hero-bg { width: 100%; height: 100%; object-fit: cover; }

  /* Layered translateZ depth (cheap parallax, transform-only). */
  .hero.motion .hero-bg  { transform: translateZ(-0.6px) scale(1.6); }
  .hero.motion .hero-mid { transform: translateZ(-0.2px) scale(1.2); }

  /* Scroll-driven parallax — compositor-threaded, only where supported AND motion ok. */
  @supports (animation-timeline: scroll()) {
    @media (prefers-reduced-motion: no-preference) {
      .hero.motion .hero-bg {
        animation: rise linear both;
        animation-timeline: scroll(root block);
      }
    }
  }
  @keyframes rise { to { transform: translateY(8%); } }

  /* Fallbacks: no .motion (reduced motion) OR no @supports → static, still premium. */
</style>
```
- `perspective: 1px` + `translateZ()` is the classic zero-JS CSS-3D parallax (depth without an engine). The `scroll()` timeline adds rate-differentiated movement. Both are transform-only → compositor-threaded.
- **Double gate is intentional:** the runtime `class:motion` reflects the live `prefersReducedMotion` store (reacts if the user flips the OS setting), and the CSS `@media (prefers-reduced-motion: no-preference)` + `@supports` ensure correctness even before JS hydrates and on unsupported browsers. `prefersReducedMotion.current` is the right hook — confirmed.

### Q4 — PLAY REEL focus-managed lightbox (zero iframes until click)
```svelte
<!-- ReelLightbox.svelte — mirrors WatchPlayer facade; iframe mounts only when open -->
<script lang="ts">
  let { open = $bindable(false), embed, title }: { open: boolean; embed: string; title: string } = $props();
  let dialog: HTMLDivElement;
  let lastFocused: HTMLElement | null = null;

  $effect(() => {
    if (open) { lastFocused = document.activeElement as HTMLElement; dialog?.focus(); }
    else { lastFocused?.focus(); }
  });
  function onKey(e: KeyboardEvent) { if (e.key === 'Escape') open = false; }
</script>

{#if open}
  <div class="backdrop" onclick={() => (open = false)}></div>
  <div bind:this={dialog} role="dialog" aria-modal="true" aria-label={title}
       tabindex="-1" onkeydown={onKey} class="reel-modal">
    <button type="button" aria-label="Close" onclick={() => (open = false)}>✕</button>
    <div class="aspect-video">
      <iframe src={embed} {title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
    </div>
  </div>
{/if}
```
- Manage focus on open/close, trap inside the dialog (or rely on `aria-modal` + the small focusable set), Escape closes, backdrop closes, restore focus to the PLAY REEL button. Reuse Vimeo embed URL: get it via `getById('264677021')?.embed` (the reel is in the dataset, D-11) so the player URL/format stays consistent with the rest of the site.
- **No-JS / fallback:** the PLAY REEL control can also be (or degrade to) an `<a href="{base}/watch/264677021/">` so the reel is always reachable. Recommended: render an `<a>` styled as a button that `preventDefault`s into the lightbox when JS is available — best of both (works without JS, lightbox with JS).

### Q5 — Home composition (`+page.svelte`)
```svelte
<script lang="ts">
  import { getCategoriesInDisplayOrder, getByCategory } from '$lib/data';
  import CategoryRail from '$lib/components/CategoryRail.svelte';
  import ReelHero from '$lib/components/ReelHero.svelte';
  // Build once at module/prerender time — pure, no fetch (base-path safe, Pitfall 1).
  const rails = getCategoriesInDisplayOrder().map((category) => ({
    category, videos: getByCategory(category)
  }));
</script>

<ReelHero />
<main id="main">
  {#each rails as { category, videos } (category)}
    <CategoryRail {category} {videos} />
  {/each}
</main>
```
- Computing in the component is fine (data is a build-time import, runs during prerender). A `+page.ts` `load()` is optional and equivalent; either keeps home at zero runtime fetch.
- Add a skip-to-content link targeting `#main` in the layout (or here) so keyboard users bypass the hero + 8 rails.

## Research Question Answers (direct)

**Q1 — Accessible horizontal rail (mid-2026 best practice):**
- **Semantics:** `<section aria-labelledby>` (labeled region) wrapping `<ul><li>` (list semantics → "list, N items"). Visible `<h2>` per rail = SR landmark. (HOME-04)
- **Tab order:** natural — cards are focusable `<a>` links; Tab walks card→card→out (no trap). Optional Arrow/Home/End enhancement via roving tabindex or `.focus()` on siblings.
- **Prev/Next:** `scrollBy(±clientWidth*0.85)`, `behavior` toggled by the motion gate; disabled at ends; ≥44px; pointer-only (`@media (hover:hover)`).
- **Safari `tabindex=0`:** NOT needed here because the scroller has focusable children. Adding it would create a redundant tab stop + SR over-announcement. (Only add `tabindex=0` to scrollers with NO focusable content.)
- **Offscreen focus:** keep cards in DOM and focusable; `scroll-margin-inline` lets focus scroll them into view. Don't `display:none`. Chromium-only `interactivity: inert` via scroll-state container query is a clean enhancement (defer).
- **Snap:** `proximity`, not `mandatory`.
- **Shape:** `CategoryRail.svelte` (+ optional `RailRow.svelte` split). Confidence HIGH.

**Q2 — 3D/depth/parallax without an engine:**
- CSS `perspective` + per-layer `translateZ` for static depth; `animation-timeline: scroll()`/`view()` for rate-differentiated parallax; transform/opacity only (off main thread).
- **Support (verified mid-2026):** scroll-driven animations are now broadly Baseline — Chrome/Edge 115+, Opera, **Safari 26 full**; **Firefox still partial / behind `layout.css.scroll-driven-animations.enabled`**. So `@supports (animation-timeline: scroll())` is mandatory; unsupported browsers get the static (still-premium) hero.
- **Gate:** `prefersReducedMotion.current` is the correct hook (confirmed — it's the single FND-06 gate); pair it with the CSS `@media`/`@supports` for pre-hydration correctness.
- **LCP/mobile:** eager `fetchpriority=high` poster as LCP; defer/transform-only parallax; no engine bundle. Confidence HIGH (support facts verified against caniuse/MDN 2026).

**Q3 — Perf with ~8 rails × ~7 cards:**
- `VideoCard` already reserves a 16:9 box (no CLS) and is poster-`<img>`-only. Keep **all** rail cards `loading="lazy"` + `decoding="async"` (offscreen rails cost nothing); the **only** eager/`fetchpriority=high` image is the hero poster. No `eager` on rail cards (unlike the `/work` grid's first-8) because every rail except the first is below the fold and horizontally offscreen.
- Iframe budget invariant holds: **home = 0 iframes**; PLAY REEL mounts exactly one on click (lightbox), or navigates to `/watch/264677021` (1 iframe on that page, on click). Confidence HIGH.

**Q4 — PLAY REEL pattern:** **Recommend a focus-managed lightbox** that lazily mounts the reel iframe (premium, keeps user on home, zero-iframe-until-intent), **with a navigate-to-`/watch/264677021` fallback** (works without JS, always reachable). a11y: focus to dialog on open, Escape + backdrop close, restore focus on close, `role="dialog" aria-modal="true"`. Confidence HIGH.

**Q5 — Home composition:** `getCategoriesInDisplayOrder().map(c => ({category: c, videos: getByCategory(c)}))` → `ReelHero` + `{#each rails} CategoryRail`, reusing `VideoCard`. Pure build-time data, zero runtime fetch, base-path safe. Confidence HIGH.

## State of the Art

| Old Approach | Current Approach (mid-2026) | Impact |
|--------------|------------------------------|--------|
| JS carousel libs (Swiper/Embla) for browse shelves | Native `overflow-x` + `scroll-snap` | Zero KB, native a11y/touch |
| `scroll` listener + rAF parallax | `animation-timeline: scroll()/view()` (Baseline-ish, Safari 26 ✓) | Off main thread, no INP cost |
| three.js/WebGL for "3D feel" | CSS `perspective` + `translateZ` layers | Fraction of cost, no engine bundle |
| `tabindex=0` on every scroller | Only when no focusable children; else rely on focusable cards | Avoids redundant tab stops / SR over-announce |
| JS focus management for offscreen carousel items | CSS `interactivity: inert` via scroll-state queries (Chromium) | Declarative — but progressive; keep JS-free base |

**Deprecated/outdated for this phase:**
- `scroll-snap-type: x mandatory` on long rails (use `proximity`).
- Eager-mounting embeds anywhere on home (HOME-06).
- Firefox: do NOT assume scroll-timeline works unflagged — feature-detect.

## Open Questions

1. **Hero poster asset** — which image is the hero LCP? Likely the reel's poster (`getById('264677021')?.thumbnail`) or a dedicated `static/` hero still. *Recommendation:* use the reel poster for thematic consistency, or add one hero image to `static/`; planner to pick and ensure it's eager + dimensioned.
2. **Rail card width tuning** — exact `min-width`/peek per breakpoint is visual; the recipe (`clamp(220px,70vw,300px)` mobile, ~280px desktop) is a starting point to tune on device.
3. **Arrow-key enhancement depth** — natural tab order satisfies HOME-03; whether to add Arrow/Home/End roving focus is a polish call (recommended but not required). Planner decides scope.

## Validation Architecture

> `workflow.nyquist_validation` is `false` in `.planning/config.json`, so a formal test-map section is omitted. The phase still warrants two cheap **build-time guards** (recommended as plan tasks, not a framework):

- **Zero-iframe home guard (HOME-06):** after `pnpm build`, assert `build/index.html` contains no `<iframe`. A one-line CI grep (`grep -L '<iframe' build/index.html` or a Vitest reading the built file) fails the build if a live embed leaks onto home. This directly enforces the iframe-budget invariant.
- **axe pass on `/` (QUAL-01, lands Phase 4 but cheap to wire now):** Playwright + `@axe-core/playwright` (already in the optional toolchain) on the rendered home — catches `scrollable-region-focusable`, `color-contrast`, and landmark/list violations on the new rails. Optional this phase; required Phase 4.
- **Reduced-motion manual check:** toggle OS "Reduce motion" → confirm hero parallax stops and rail Prev/Next jumps instantly (no smooth scroll). Manual; add to the phase's "looks done but isn't" checklist.

## Sources

### Primary (HIGH confidence)
- [MDN — CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations) — `scroll()`/`view()`, `@supports` fallback pattern
- [caniuse — animation-timeline: scroll()](https://caniuse.com/mdn-css_properties_animation-timeline_scroll) — support matrix (Safari 26 full, Firefox flagged)
- [web.dev — Well-controlled scrolling with CSS Scroll Snap](https://web.dev/articles/css-scroll-snap) — proximity vs mandatory, snap-align/padding
- [Chrome for Developers — Make accessible carousels](https://developer.chrome.com/blog/accessible-carousel) — region/list semantics, `interactivity: inert`, ARIA shape
- [axe — scrollable-region-focusable](https://dequeuniversity.com/rules/axe/4.0/scrollable-region-focusable) + [ACT 0ssw9k](https://act-rules.github.io/rules/0ssw9k/) — keyboard-accessible scrollers
- [Apple Developer Forums — Safari keyboard focus for scrollable containers](https://developer.apple.com/forums/thread/810694) — Safari `tabindex=0` requirement (and the focusable-child exception)
- Codebase: `$lib/data` (loader API + `producerReelId`), `VideoCard.svelte`, `WatchPlayer.svelte`, `motion.svelte.ts`, `app.css` tokens — direct, authoritative
- Project research: `STACK.md`, `FEATURES.md`, `PITFALLS.md`, `PROJECT.md`, `REQUIREMENTS.md` — HIGH (primary project context)

### Secondary (MEDIUM confidence)
- [Josh W. Comeau — Scroll-Driven Animations](https://www.joshwcomeau.com/animation/scroll-driven-animations/) — perspective/translateZ depth patterns, fallbacks
- [TPGi — Improving usability of scrollable regions](https://www.tpgi.com/short-note-on-improving-usability-of-scrollable-regions/) — labeled scroller guidance
- [Creating Complex Scroll-driven Animations with Pure CSS in 2026 (dev.to)](https://dev.to/nickbenksim/creating-complex-scroll-driven-animations-with-pure-css-in-2026-17l) — 2026 currency check on support

## Metadata

**Confidence breakdown:**
- Standard stack (no new deps): HIGH — verified everything needed already exists in-repo.
- Rail architecture/a11y: HIGH — verified against axe/ACT/Chrome/Apple sources; Safari nuance confirmed.
- Hero 3D/scroll-timeline support: HIGH — caniuse/MDN confirm Safari 26 full, Firefox flagged; `@supports` gate mandatory.
- PLAY REEL pattern: HIGH — mirrors the in-repo `WatchPlayer` facade; standard dialog a11y.

**Research date:** 2026-06-14
**Valid until:** ~2026-07-14 (scroll-timeline Firefox status is the most likely thing to improve; re-check caniuse if Firefox ships it unflagged).
