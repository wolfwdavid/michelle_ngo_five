---
phase: 03-rails-homepage-cinematic-hero
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/components/ReelLightbox.svelte
  - src/lib/components/ReelLightbox.test.ts
  - src/lib/components/ReelHero.svelte
  - src/lib/components/ReelHero.test.ts
autonomous: true
requirements: [HERO-01, HERO-02, HERO-03, HERO-04]
must_haves:
  truths:
    - "A full-bleed hero (min-height 88svh) leads with the wordmark, a one-line tagline, and a single PLAY REEL CTA"
    - "PLAY REEL opens a focus-trapped lightbox that lazily mounts the Vimeo reel iframe (264677021) on click; Escape and backdrop close and return focus"
    - "Before any click the hero mounts zero iframes; the PLAY REEL control degrades to a /watch/264677021 link with no JS"
    - "The hero LCP poster <img> is eager + fetchpriority=high + explicit width/height (never lazy)"
    - "All hero parallax/tilt is double-gated (prefersReducedMotion.current AND @media no-preference, plus @supports for scroll-timeline) and degrades to a static premium hero"
  artifacts:
    - path: "src/lib/components/ReelLightbox.svelte"
      provides: "Focus-managed role=dialog modal that mounts the reel iframe only when open"
      min_lines: 40
      contains: "role=\"dialog\""
    - path: "src/lib/components/ReelHero.svelte"
      provides: "Full-bleed layered hero with eager LCP poster, PLAY REEL CTA, motion-gated CSS-3D parallax"
      min_lines: 70
      contains: "fetchpriority"
    - path: "src/lib/components/ReelLightbox.test.ts"
      provides: "Proof the lightbox mounts no iframe until open, mounts the reel embed when open, Escape closes"
      min_lines: 30
    - path: "src/lib/components/ReelHero.test.ts"
      provides: "Proof of eager fetchpriority LCP img, zero iframes pre-click, single PLAY REEL control, no-JS watch fallback"
      min_lines: 30
  key_links:
    - from: "src/lib/components/ReelHero.svelte"
      to: "src/lib/components/ReelLightbox.svelte"
      via: "PLAY REEL click sets lightbox open=true"
      pattern: "ReelLightbox"
    - from: "src/lib/components/ReelHero.svelte"
      to: "$lib/data getById/producerReelId"
      via: "reel embed + thumbnail resolved from the dataset"
      pattern: "producerReelId|getById"
    - from: "src/lib/components/ReelHero.svelte"
      to: "src/lib/state/motion.svelte.ts"
      via: "parallax/tilt gated on prefersReducedMotion.current"
      pattern: "prefersReducedMotion\\.current"
---

<objective>
Build the cinematic hero and its PLAY REEL lightbox as two leaf components: `ReelLightbox.svelte` (a focus-trapped dialog mirroring the WatchPlayer facade — iframe mounts only on open) and `ReelHero.svelte` (full-bleed layered poster + wordmark + tagline + PLAY REEL CTA + motion-safe CSS-3D parallax). No page wiring yet, so both can be built and unit-tested in isolation in parallel with the rail.

Purpose: HERO-01..04 — the signature first impression. The hero must be premium with motion OFF and never leak an iframe onto home until the user clicks PLAY REEL.
Output: ReelLightbox.svelte + ReelHero.svelte + tests. Zero new dependencies (CSS-first motion only).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-rails-homepage-cinematic-hero/03-RESEARCH.md
@.planning/phases/03-rails-homepage-cinematic-hero/03-UI-SPEC.md

<interfaces>
<!-- Contracts the executor needs — use directly, no codebase exploration. -->

WatchPlayer.svelte is the proven facade to MIRROR: a reserved aspect-video box, no iframe until
`activated`, iframe `allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen`.
ReelLightbox does the same but inside a focus-managed role=dialog.

From $lib/data:
  producerReelId = '264677021' (const)
  getById(id: string): Video | undefined   // narrow with `if (!video)` (noUncheckedIndexedAccess)
  // The reel IS in the dataset: getById('264677021') →
  //   .embed     = 'https://player.vimeo.com/video/264677021'
  //   .thumbnail = remote Vimeo CDN still (640px), .title = "Michelle Ngo Producer's Reel"

From $lib/state/motion.svelte (the ONE motion gate, FND-06):
  prefersReducedMotion.current: boolean   // true = reduce; SSR-safe false during prerender

From $app/paths:
  base: string   // ALL hrefs `${base}/...` — no-JS PLAY REEL fallback = `${base}/watch/264677021/`

Svelte 5 runes: `$state`, `$props`, `$derived`, `$effect`, `$bindable`. flushSync from 'svelte' for tests.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: ReelLightbox.svelte (focus-trapped dialog, iframe-on-open)</name>
  <files>src/lib/components/ReelLightbox.svelte</files>
  <read_first>
    - src/lib/components/WatchPlayer.svelte (the facade to mirror — iframe only when activated; allow-list; aspect-video box)
    - .planning/phases/03-rails-homepage-cinematic-hero/03-RESEARCH.md (Code Examples Q4 — the lightbox shape)
    - .planning/phases/03-rails-homepage-cinematic-hero/03-UI-SPEC.md ("PLAY REEL CTA" — dialog/scrim/focus behavior)
    - src/lib/state/motion.svelte.ts (gate — only needed if you animate the open transition; keep it gated)
  </read_first>
  <action>
    Create `src/lib/components/ReelLightbox.svelte`. Props (Svelte 5 runes):
    `let { open = $bindable(false), embed, title }: { open?: boolean; embed: string; title: string } = $props();`
    State: `let dialog: HTMLDivElement | undefined = $state();` and `let lastFocused: HTMLElement | null = null;`

    Focus management (RESEARCH Q4):
    - `$effect(() => { if (open) { lastFocused = document.activeElement as HTMLElement; dialog?.focus(); } else { lastFocused?.focus(); } });`
    - `function onKey(e: KeyboardEvent) { if (e.key === 'Escape') open = false; }`
    - A minimal focus trap: keep Tab within the dialog. Acceptable v1 approach — the dialog has a small focusable set (Close button + iframe); set `role="dialog" aria-modal="true" tabindex="-1"` on the container and `onkeydown={onKey}`. (A full trap that loops Tab between the Close button and iframe is a plus but `aria-modal` + the small set is sufficient for v1.)

    Markup (only when open — `{#if open}`):
    - A backdrop `<div>` (scrim ~55% black, `bg-black/55`) with `onclick={() => (open = false)}`.
    - `<div bind:this={dialog} role="dialog" aria-modal="true" aria-label={title} tabindex="-1" onkeydown={onKey} class="...">`
        containing:
        - A Close `<button type="button" aria-label="Close" onclick={() => (open = false)}>` with an SVG ✕ (NOT emoji), ≥44px, inherits app.css focus ring.
        - `<div class="aspect-video">` wrapping the `<iframe src={embed} {title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen class="...h-full w-full border-0">` — iframe exists ONLY inside `{#if open}`, so home stays at zero iframes until intent (HERO-02 / HOME-06 / Pitfall B).

    Do NOT mount the iframe outside `{#if open}`. Do NOT autoplay-with-sound on load (the facade only mounts the player on user click; autoplay in the allow-list is fine because mount = user intent — same reasoning as WatchPlayer).
  </action>
  <behavior>
    - When open=false: renders nothing (no backdrop, no dialog, NO iframe).
    - When open=true: renders role=dialog aria-modal with an aria-label, a Close button, and an iframe whose src === embed.
    - Pressing Escape sets open=false.
    - Clicking the backdrop sets open=false.
  </behavior>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && pnpm vitest run src/lib/components/ReelLightbox.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q 'role="dialog"' src/lib/components/ReelLightbox.svelte` and `grep -q 'aria-modal="true"' src/lib/components/ReelLightbox.svelte`
    - `grep -q '{#if open}' src/lib/components/ReelLightbox.svelte` (iframe gated behind open)
    - `grep -q "e.key === 'Escape'" src/lib/components/ReelLightbox.svelte` (Escape closes)
    - `grep -q 'allowfullscreen' src/lib/components/ReelLightbox.svelte`
    - `! grep -qi 'emoji' src/lib/components/ReelLightbox.svelte` and Close uses an `<svg` (no emoji glyph)
    - `pnpm check` exits 0
  </acceptance_criteria>
  <done>ReelLightbox.svelte exists, mounts the reel iframe only when open, manages focus, and closes on Escape/backdrop.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: ReelHero.svelte (eager LCP poster + PLAY REEL + double-gated parallax)</name>
  <files>src/lib/components/ReelHero.svelte</files>
  <read_first>
    - src/lib/components/ReelLightbox.svelte (the dialog this opens — from Task 1)
    - src/lib/data/videos.ts (producerReelId, getById — to resolve the reel embed/thumbnail/title)
    - src/lib/state/motion.svelte.ts (prefersReducedMotion.current — the ONLY gate; never per-component matchMedia)
    - .planning/phases/03-rails-homepage-cinematic-hero/03-RESEARCH.md (Code Examples Q2 — hero parallax; Q4 — fallback link)
    - .planning/phases/03-rails-homepage-cinematic-hero/03-UI-SPEC.md ("HERO" section — layers, scrim, typography, sizing, choreography)
  </read_first>
  <action>
    Create `src/lib/components/ReelHero.svelte`. Add `/* eslint-disable svelte/no-navigation-without-resolve */` for the base-safe fallback link.
    Imports: `ReelLightbox` from './ReelLightbox.svelte', `producerReelId` + `getById` from '$lib/data',
    `prefersReducedMotion` from '$lib/state/motion.svelte', `base` from '$app/paths'.

    Resolve the reel once: `const reel = getById(producerReelId);` then narrow safely — fall back to literals if undefined:
      `const embed = reel?.embed ?? 'https://player.vimeo.com/video/264677021';`
      `const poster = reel?.thumbnail ?? '';`
      `const reelTitle = reel?.title ?? "Michelle Ngo Producer's Reel";`
    State: `let open = $state(false);` and `const motionOK = $derived(!prefersReducedMotion.current);`

    LAYERS (back→front, UI-SPEC HERO composition):
    1. Background poster `<img class="hero-bg" src={poster} alt="" width="1920" height="1080" loading="eager" fetchpriority="high" decoding="async" />`
       — eager + fetchpriority=high + explicit width/height (HERO-04; never loading="lazy"). `object-fit:cover`, slightly scaled (1.08) so parallax never reveals edges. `alt=""` (decorative; the wordmark carries the name).
    2. Scrim `<div class="hero-scrim" aria-hidden="true">` — `linear-gradient(to top, oklch(0.16 0 0) 0%, transparent 55%)` + soft top vignette (AA contrast for text over any poster — UI-SPEC).
    3. Foreground `<div class="hero-fg">`:
       - `<h1>Michelle Ngo</h1>` — Display scale `clamp(2.5rem, 7vw, 6rem)`, weight 700, letter-spacing -0.02em (UI-SPEC Typography). Optional white→rgba(255,255,255,0.7) background-clip:text gradient (tasteful).
       - `<p>` one-line tagline: "Filmmaker & producer based in New York City." (1rem–1.25rem, rgba(255,255,255,0.72)).
       - PLAY REEL control: render an `<a href={`${base}/watch/${producerReelId}/`} data-sveltekit-preload-data="hover" onclick={(e) => { e.preventDefault(); open = true; }}>` styled as a bordered pill (1px rgba(255,255,255,0.6), fills solid on hover, 200ms COLOR transition only — no layout shift), ≥44px tall, text "Play reel ▶" (▶ via inline SVG, NOT emoji). This is best-of-both: works as a real link to /watch/264677021 with NO JS (HERO-02 fallback), opens the lightbox when JS is present.
       - A subtle scroll-cue chevron (SVG) near the bottom.
    - Mount `<ReelLightbox bind:open embed={embed} title={reelTitle} />` once.

    SIZING + MOTION (`<style>`, UI-SPEC choreography — DOUBLE-gated):
    - `.hero { position:relative; min-height: 88svh; overflow: clip; perspective: 1px; }` (88svh — `svh` not `vh`; leaves a peek of the first rail).
    - `.hero-bg, .hero-scrim { position:absolute; inset:0; }` `.hero-bg { width:100%; height:100%; object-fit:cover; }`
    - Apply the live runtime gate as a class: `<section class="hero" class:motion={motionOK}>` so parallax reacts if the user flips OS reduce-motion after load.
    - CSS-3D depth: `.hero.motion .hero-bg { transform: translateZ(-0.6px) scale(1.6); }` and a mid/scrim layer at a different translateZ for depth. transform/opacity ONLY — never width/height/top/left (Pitfall D).
    - Scroll parallax wrapped in BOTH guards:
      ```
      @supports (animation-timeline: scroll()) {
        @media (prefers-reduced-motion: no-preference) {
          .hero.motion .hero-bg { animation: heroRise linear both; animation-timeline: scroll(root block); }
        }
      }
      @keyframes heroRise { to { transform: translateY(8%); } }
      ```
    - Optional pointer-tilt (UI-SPEC, desktop only): on `pointermove`, rAF-throttled, apply tiny `translate3d` (≤±8px bg, opposite ≤±4px fg). Wrap in `@media (hover:hover) and (pointer:fine)` AND guard the JS handler with `if (!motionOK) return;`. This is a nice-to-have; if included it MUST be gated.
    - Reduced-motion / no @supports / touch: NO transform animation — static layered hero (still premium: poster + scrim + type). Never break layout / no CLS.
  </action>
  <behavior>
    - Renders an &lt;h1&gt;Michelle Ngo, a tagline &lt;p&gt;, and exactly one PLAY REEL control.
    - The hero background &lt;img&gt; has loading="eager", fetchpriority="high", and explicit width+height (NOT loading="lazy").
    - Before clicking PLAY REEL there is NO iframe in the DOM.
    - The PLAY REEL control is an &lt;a&gt; whose href ends with /watch/264677021/ (no-JS fallback) and clicking it (with JS) opens the lightbox.
  </behavior>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && pnpm vitest run src/lib/components/ReelHero.test.ts && pnpm check</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q 'fetchpriority="high"' src/lib/components/ReelHero.svelte` and `grep -q 'loading="eager"' src/lib/components/ReelHero.svelte` (HERO-04)
    - `grep -qE 'width="[0-9]+"' src/lib/components/ReelHero.svelte` and `grep -qE 'height="[0-9]+"' src/lib/components/ReelHero.svelte` (explicit dimensions, no CLS)
    - `! grep -q 'loading="lazy"' src/lib/components/ReelHero.svelte` (LCP never lazy)
    - `grep -q 'min-height: 88svh' src/lib/components/ReelHero.svelte` (UI-SPEC sizing)
    - `grep -q '@supports (animation-timeline: scroll())' src/lib/components/ReelHero.svelte` (scroll-timeline guard, HERO-03)
    - `grep -q 'prefers-reduced-motion: no-preference' src/lib/components/ReelHero.svelte` AND `grep -q 'class:motion' src/lib/components/ReelHero.svelte` (double gate, HERO-03/QUAL-04)
    - `grep -q 'watch/${producerReelId}' src/lib/components/ReelHero.svelte` (no-JS fallback to /watch/264677021, HERO-02)
    - `! grep -q 'iframe' src/lib/components/ReelHero.svelte` (the iframe lives only inside ReelLightbox; HOME-06)
    - `pnpm check` exits 0
  </acceptance_criteria>
  <done>ReelHero.svelte renders the full-bleed layered hero with an eager LCP poster, a single PLAY REEL control that opens the lightbox (and degrades to /watch/264677021), and double-gated CSS-3D parallax. Type-clean.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: ReelLightbox + ReelHero tests</name>
  <files>src/lib/components/ReelLightbox.test.ts, src/lib/components/ReelHero.test.ts</files>
  <read_first>
    - src/lib/components/WatchPlayer.test.ts (the mount/flushSync facade-test pattern to mirror)
    - src/lib/components/ReelLightbox.svelte (under test — Task 1)
    - src/lib/components/ReelHero.svelte (under test — Task 2)
  </read_first>
  <action>
    Create `src/lib/components/ReelLightbox.test.ts` (mirror WatchPlayer.test.ts harness):
    - Mount with `{ open: false, embed: 'https://player.vimeo.com/video/264677021', title: 'Reel' }` → assert `host.querySelector('iframe')` is null (no iframe until open).
    - Mount with `{ open: true, ... }` → assert `host.querySelector('[role="dialog"]')` exists with `aria-modal="true"`, a Close `<button>`, and an `iframe` whose src === the embed.
    - Dispatch a `keydown` Escape on the dialog and `flushSync()` → assert the dialog is gone (open went false). (If two-way bind in a test is awkward, assert the onKey path by checking the component no longer renders the dialog after dispatch; otherwise assert the Close button click removes the dialog.)

    Create `src/lib/components/ReelHero.test.ts`:
    - Mount ReelHero (no props). Assert:
      1. `host.querySelector('h1')?.textContent` contains "Michelle Ngo".
      2. The hero `<img>` has `loading="eager"`, `fetchpriority="high"`, and both `width` and `height` attributes (HERO-04). (Use `getAttribute`.)
      3. `host.querySelector('iframe')` is null before any click (HOME-06 / Pitfall B).
      4. Exactly one PLAY REEL control exists; it is an `<a>` whose href ends with `/watch/264677021/` (HERO-02 fallback).
      5. Clicking the PLAY REEL control then `flushSync()` mounts a `[role="dialog"]` with an iframe (HERO-02 — opens the reel). (preventDefault keeps navigation from firing in jsdom.)
  </action>
  <behavior>
    - ReelLightbox: no iframe when closed; dialog+iframe(src=embed) when open; Escape/Close removes it.
    - ReelHero: eager fetchpriority LCP img with dimensions; zero iframes pre-click; one PLAY REEL anchor → /watch/264677021/; click opens the dialog.
  </behavior>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && pnpm vitest run src/lib/components/ReelLightbox.test.ts src/lib/components/ReelHero.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `pnpm vitest run src/lib/components/ReelLightbox.test.ts src/lib/components/ReelHero.test.ts` exits 0, all passing
    - `grep -q 'fetchpriority' src/lib/components/ReelHero.test.ts` (asserts eager LCP)
    - `grep -q "querySelector('iframe')" src/lib/components/ReelHero.test.ts` (asserts zero-iframe-pre-click)
    - `grep -qi 'watch/264677021' src/lib/components/ReelHero.test.ts` (asserts reel fallback target)
  </acceptance_criteria>
  <done>Both test files pass, proving the facade (no iframe until open), the eager LCP image, the single PLAY REEL → /watch/264677021 control, and that clicking it opens the reel dialog.</done>
</task>

</tasks>

<verification>
- `pnpm check` exits 0.
- `pnpm vitest run src/lib/components/ReelLightbox.test.ts src/lib/components/ReelHero.test.ts` passes.
- Grep hooks hold: fetchpriority=high + eager + width/height (not lazy), 88svh, @supports scroll() guard + prefers-reduced-motion + class:motion double gate, /watch/264677021 fallback, no iframe in ReelHero.
</verification>

<success_criteria>
A full-bleed cinematic hero leads with the wordmark, a one-line tagline, and a single PLAY REEL CTA that opens a focus-managed, Escape-closable lightbox lazily mounting the Vimeo reel (264677021) — and degrades to a /watch/264677021 link with no JS. The hero LCP poster is eager + fetchpriority=high + dimensioned. All depth/parallax is double-gated and degrades to a static premium hero. Zero iframes until the user clicks. Unit-tested and type-clean.
</success_criteria>

<output>
After completion, create `.planning/phases/03-rails-homepage-cinematic-hero/03-02-SUMMARY.md`.
</output>
