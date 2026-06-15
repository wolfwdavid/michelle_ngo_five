<!--
  ReelHero — the full-bleed cinematic hero (HERO-01..04).

  Composition (3 depth layers, back -> front, UI-SPEC "HERO"):
    1. Background poster <img> — the LCP element: eager loading +
       fetchpriority="high" + explicit width/height (never deferred),
       object-fit:cover, slightly scaled so parallax never reveals the edges.
       alt="" (decorative; the wordmark carries the name). HERO-04, no CLS.
    2. Scrim — a layered gradient (+ soft top vignette) guaranteeing AA contrast
       for the wordmark + tagline over ANY poster.
    3. Foreground — wordmark <h1> (Display scale, letter-spacing discipline),
       a one-line tagline, the single PLAY REEL CTA, and a scroll-cue chevron.

  PLAY REEL is an <a href="{base}/watch/264677021/"> styled as a pill: it is a
  REAL link that reaches the reel with NO JS (HERO-02 fallback), and when JS is
  present it preventDefaults into the focus-managed ReelLightbox (zero embeds on
  home until intent — HOME-06 / Pitfall B). The live player lives ONLY inside
  ReelLightbox; this component never renders one.

  Motion is DOUBLE-gated (HERO-03 / QUAL-04):
    - JS: `class:motion={motionOK}` where motionOK = !prefersReducedMotion.current
      (the single FND-06 gate; reacts live if the user flips OS reduce-motion).
    - CSS: @media (prefers-reduced-motion: no-preference) for pre-hydration
      correctness, plus @supports (animation-timeline: scroll()) for the scroll
      parallax (Firefox mid-2026 is flagged -> graceful static fallback).
    - Pointer-tilt only on @media (hover:hover) and (pointer:fine), rAF-throttled,
      transform/opacity ONLY, max +-8px, and guarded by `if (!motionOK) return`.
  Reduced-motion / no @supports / touch -> static layered hero (still premium:
  poster + scrim + type). Never animate width/height/top/left; no CLS.
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { base } from '$app/paths';
  import { getById, producerReelId } from '$lib/data';
  import { prefersReducedMotion } from '$lib/state/motion.svelte';
  import ReelLightbox from './ReelLightbox.svelte';

  // Resolve the reel once at build time; narrow safely (noUncheckedIndexedAccess)
  // and fall back to literals if the dataset ever drops it.
  const reel = getById(producerReelId);
  const embed = reel?.embed ?? `https://player.vimeo.com/video/${producerReelId}`;
  const poster = reel?.thumbnail ?? '';
  const reelTitle = reel?.title ?? "Michelle Ngo Producer's Reel";

  let open = $state(false);
  const motionOK = $derived(!prefersReducedMotion.current);

  // The hero layers; bound so the pointer-tilt handler can transform them.
  let bg: HTMLImageElement | undefined = $state();
  let fg: HTMLDivElement | undefined = $state();
  let rafId = 0;

  // Optional desktop pointer-tilt (UI-SPEC) — a decorative, viewport-relative
  // depth effect, NOT an interactive control, so it lives on `window` (not a
  // static-element handler that would demand an ARIA role). rAF-throttled,
  // transform-only, and double-gated: it only registers when motionOK is true
  // and the device has a fine, hovering pointer.
  $effect(() => {
    if (!motionOK) return;
    // matchMedia is absent under jsdom/SSR — mirror the motion gate's guard.
    if (typeof window.matchMedia !== 'function') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const onMove = (e: PointerEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx; // -1..1
        const dy = (e.clientY - cy) / cy;
        // bg drifts WITH the pointer (max +-8px); fg opposite (max +-4px).
        if (bg) bg.style.transform = `translate3d(${dx * 8}px, ${dy * 8}px, 0) scale(1.08)`;
        if (fg) fg.style.transform = `translate3d(${dx * -4}px, ${dy * -4}px, 0)`;
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };
  });

  function openReel(e: MouseEvent) {
    e.preventDefault();
    open = true;
  }
</script>

<section class="hero" class:motion={motionOK}>
  <!-- Layer 1: LCP poster — eager, fetchpriority=high, dimensioned, never deferred. -->
  <img
    bind:this={bg}
    class="hero-bg"
    src={poster}
    alt=""
    width="1920"
    height="1080"
    loading="eager"
    fetchpriority="high"
    decoding="async"
  />

  <!-- Layer 2: scrim for AA text contrast over any poster. -->
  <div class="hero-scrim" aria-hidden="true"></div>

  <!-- Layer 3: foreground content. -->
  <div bind:this={fg} class="hero-fg">
    <h1 class="hero-wordmark">Michelle Ngo</h1>
    <p class="hero-tagline">Filmmaker &amp; producer based in New York City.</p>

    <a
      class="hero-cta"
      href={`${base}/watch/${producerReelId}/`}
      data-sveltekit-preload-data="hover"
      onclick={openReel}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
        <path d="M8 5v14l11-7z" fill="currentColor" />
      </svg>
      Play reel
    </a>

    <!-- Subtle scroll-cue chevron near the bottom. -->
    <span class="hero-scrollcue" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </div>
</section>

<ReelLightbox bind:open embed={embed} title={reelTitle} />

<style>
  .hero {
    position: relative;
    min-height: 88svh; /* svh, not vh — leaves a peek of the first rail */
    overflow: clip;
    perspective: 1px; /* CSS-3D depth without an engine */
    display: flex;
  }

  .hero-bg,
  .hero-scrim {
    position: absolute;
    inset: 0;
  }
  .hero-bg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Slight overscale so depth/tilt never reveals the poster edges. */
    transform: scale(1.08);
    will-change: transform;
  }

  /* Layered scrim: bottom-up gradient for type contrast + a soft top vignette. */
  .hero-scrim {
    background:
      linear-gradient(to top, oklch(0.16 0 0) 0%, transparent 55%),
      radial-gradient(120% 80% at 50% 0%, oklch(0.16 0 0 / 0.5) 0%, transparent 60%);
  }

  .hero-fg {
    position: relative;
    z-index: 1;
    margin-top: auto; /* anchor the stack toward the lower-left */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: clamp(1.5rem, 5vw, 4rem);
    padding-bottom: clamp(2.5rem, 8vh, 5rem);
    max-width: 60ch;
  }

  .hero-wordmark {
    margin: 0;
    font-size: clamp(2.5rem, 7vw, 6rem);
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -0.02em;
    /* Tasteful white -> translucent text gradient (UI-SPEC optional flourish). */
    background: linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .hero-tagline {
    margin: 0;
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 400;
    color: rgba(255, 255, 255, 0.72);
  }

  /* PLAY REEL pill: bordered, fills solid on hover via COLOR transition only
     (no layout shift); >=44px tall; inherits the app.css focus-visible ring. */
  .hero-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    min-height: 44px;
    padding: 0.5rem 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 9999px;
    color: #fff;
    font-weight: 600;
    text-decoration: none;
    transition:
      background-color 200ms ease,
      color 200ms ease,
      border-color 200ms ease;
  }
  .hero-cta:hover {
    background-color: #fff;
    color: oklch(0.16 0 0);
    border-color: #fff;
  }

  .hero-scrollcue {
    margin-top: 1rem;
    color: rgba(255, 255, 255, 0.55);
  }

  /* ---- Motion (DOUBLE-gated) ---------------------------------------------- */

  /* Static depth: push the bg back in the shared perspective for parallax feel.
     Only when motion is allowed at runtime (class:motion). */
  @media (prefers-reduced-motion: no-preference) {
    .hero.motion .hero-bg {
      transform: translateZ(-0.6px) scale(1.7);
    }
  }

  /* Scroll-driven parallax — compositor-threaded; only where supported AND
     motion is allowed. Unsupported / reduced motion -> static premium hero. */
  @supports (animation-timeline: scroll()) {
    @media (prefers-reduced-motion: no-preference) {
      .hero.motion .hero-bg {
        animation: heroRise linear both;
        animation-timeline: scroll(root block);
      }
      .hero.motion .hero-fg {
        animation: heroFade linear both;
        animation-timeline: scroll(root block);
        animation-range: 0 60vh;
      }
    }
  }
  @keyframes heroRise {
    to {
      transform: translateZ(-0.6px) scale(1.7) translateY(8%);
    }
  }
  @keyframes heroFade {
    to {
      opacity: 0.6;
      transform: translateY(-4%);
    }
  }

  /* Bouncing scroll-cue — gated; off entirely under reduced motion. */
  @media (prefers-reduced-motion: no-preference) {
    .hero.motion .hero-scrollcue {
      animation: cueBob 2s ease-in-out infinite;
    }
  }
  @keyframes cueBob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(4px);
    }
  }

  /* Pointer-tilt is only meaningful on a fine, hovering pointer. The JS handler
     is additionally guarded by `if (!motionOK) return`; this query keeps the
     inline transforms from sticking on touch where pointermove can fire oddly. */
  @media not (hover: hover) and (pointer: fine) {
    .hero-bg,
    .hero-fg {
      transform: none;
    }
  }
</style>
