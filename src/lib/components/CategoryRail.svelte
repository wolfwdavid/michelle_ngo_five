<!--
  CategoryRail — the reusable, accessible horizontal scroll-snap rail primitive
  the homepage stamps once per category (HOME-01..06).

  Anatomy (UI-SPEC "RAILS" + RESEARCH Q1):
    <section aria-labelledby>           ← labeled region (HOME-04)
      header: accent UPPERCASE <h2>     ← category accent color + thin underline cue
              "View all →" link         ← /work/[slug] destination parity (HOME-05)
      <div relative>
        <ul rail-scroller>              ← list semantics; one VideoCard (<li><a>) per video
          <VideoCard/>…
        Prev / Next <button>            ← pointer-only, ≥44px SVG chevrons, gate-aware paging

  A11y notes (binding):
    - The scroller is a <ul> of focusable <li><a> cards -> natural Tab order, no trap.
      Do NOT make the scroller itself a focusable tab stop: it would create a
      redundant Safari tab stop + SR over-announcement (RESEARCH Safari note, Pitfall A).
    - Offscreen cards stay in the DOM and focusable (never display:none / unmount) -
      scroll-margin-inline lets focusing a partially-offscreen card scroll it in.
    - scroll-snap-type is proximity (proximity, never the forced variant, which traps
      users on long rails, Pitfall E).
    - Cards are poster <img> only, never an embedded player frame (HOME-06). All rail
      cards are lazy (eager={false}); only the hero poster is eager (RESEARCH Q3).

  ESLint: svelte/no-navigation-without-resolve disabled — the See-all href is
  base-safe string concatenation (same pattern locked by VideoCard / Phase 1).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { base } from '$app/paths';
  import { categoryToSlug, type Category, type Video } from '$lib/data';
  import { prefersReducedMotion } from '$lib/state/motion.svelte';
  import { categoryAccent } from './categoryAccent';
  import VideoCard from './VideoCard.svelte';

  let { category, videos }: { category: Category; videos: readonly Video[] } = $props();

  const slug = $derived(categoryToSlug(category));
  let scroller: HTMLUListElement | undefined = $state();

  /** Page the rail by ~85% of its visible width; gate-aware behavior (QUAL-04). */
  function page(dir: 1 | -1) {
    if (!scroller) return;
    scroller.scrollBy({
      left: dir * scroller.clientWidth * 0.85,
      behavior: prefersReducedMotion.current ? 'auto' : 'smooth',
    });
  }
</script>

<section aria-labelledby={`rail-${slug}`} class="rail">
  <div class="flex items-baseline justify-between gap-4 px-[clamp(1rem,5vw,4rem)]">
    <h2
      id={`rail-${slug}`}
      class={`rail-label text-[0.8125rem] font-semibold uppercase tracking-[0.1em] ${categoryAccent(category)}`}
    >
      {category}
    </h2>
    <a
      href={`${base}/work/${slug}/`}
      data-sveltekit-preload-data="hover"
      class="shrink-0 text-sm text-neutral-400 hover:text-neutral-200 hover:underline"
    >
      View all &rarr;
    </a>
  </div>

  <div class="relative mt-3">
    <ul bind:this={scroller} class="rail-scroller">
      {#each videos as video (video.id)}
        <VideoCard {video} eager={false} />
      {/each}
    </ul>

    <button
      type="button"
      class="rail-btn rail-btn--prev"
      aria-label={`Scroll ${category} left`}
      onclick={() => page(-1)}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <button
      type="button"
      class="rail-btn rail-btn--next"
      aria-label={`Scroll ${category} right`}
      onclick={() => page(1)}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </div>
</section>

<style>
  /* Thin accent underline cue beneath the label (color inherits from accent class). */
  .rail-label {
    position: relative;
    padding-bottom: 0.35rem;
  }
  .rail-label::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 1.5rem;
    height: 2px;
    background: currentColor;
    border-radius: 1px;
  }

  /* Track: hidden-but-scrollable, proximity snap, contained overscroll. */
  .rail-scroller {
    display: flex;
    gap: 1rem;
    padding-inline: clamp(1rem, 5vw, 4rem);
    overflow-x: auto;
    scroll-snap-type: x proximity;
    scroll-padding-inline: clamp(1rem, 5vw, 4rem);
    overscroll-behavior-x: contain;
    scrollbar-width: none; /* Firefox */
  }
  .rail-scroller::-webkit-scrollbar {
    display: none; /* WebKit/Blink */
  }

  /* VideoCard owns the <li>; :global pierces into the child component. */
  .rail-scroller > :global(li) {
    scroll-snap-align: start;
    scroll-margin-inline: 1rem;
    flex: 0 0 auto;
    /* Peek of the next card on every breakpoint (HOME-02). */
    min-width: clamp(220px, 70vw, 300px);
  }
  @media (min-width: 768px) {
    .rail-scroller > :global(li) {
      min-width: 280px;
    }
  }

  /* Prev/Next: ≥44px circular dark chevron buttons at the inline edges. */
  .rail-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
    cursor: pointer;
    opacity: 0;
    transition: opacity 200ms ease, background 200ms ease;
  }
  .rail-btn:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  .rail-btn--prev {
    left: 0.5rem;
  }
  .rail-btn--next {
    right: 0.5rem;
  }
  /* Reveal on pointer devices when the rail is hovered or focused within;
     always reachable/visible via keyboard focus. */
  .rail:hover .rail-btn,
  .rail:focus-within .rail-btn,
  .rail-btn:focus-visible {
    opacity: 1;
  }
  /* Touch devices use native swipe — hide the controls. */
  @media (hover: none) {
    .rail-btn {
      display: none;
    }
  }
</style>
