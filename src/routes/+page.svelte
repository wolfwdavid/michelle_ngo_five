<!--
  The signature home (HOME-01/02/05 + HERO-01): a full-bleed cinematic ReelHero
  leading into one CategoryRail per category, in display order, from a
  prerenderable load() (+page.ts builds `data.rails` at build time).

  Invariants this page upholds:
    - ZERO live iframes (HOME-06): cards are poster <img> (CategoryRail/VideoCard);
      the reel iframe mounts only inside ReelHero's lightbox, on click. The
      build-time guard scripts/assert-home-no-iframe.mjs enforces this.
    - Skip-to-content: the layout owns the single <main id="main"> landmark and a
      "Skip to content" link targeting it, so keyboard users jump straight to the
      page content (HOME-03 / QUAL-01). The hero + rails render inside that main.
    - SEO parity (SEO-01): absolute production-host canonical for `/`, matching
      the convention the Phase-2 browse/watch pages use (NOT base-relative).
-->
<script lang="ts">
  import type { PageData } from './$types';
  import ReelHero from '$lib/components/ReelHero.svelte';
  import CategoryRail from '$lib/components/CategoryRail.svelte';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Michelle Ngo — Filmmaker & Producer</title>
  <meta
    name="description"
    content="Michelle Ngo is a filmmaker and producer based in New York City."
  />
  <!-- Absolute, production-host canonical for `/` (NOT base-relative — Pitfall 11). -->
  <link rel="canonical" href="https://michellengo.net/" />
  <!-- Per-page Open Graph (SEO-05): og:title mirrors the page title; og:url mirrors the canonical. -->
  <meta property="og:title" content="Michelle Ngo — Filmmaker & Producer" />
  <meta property="og:url" content="https://michellengo.net/" />
</svelte:head>

<ReelHero />

<div class="home-rails">
  {#each data.rails as { category, videos } (category)}
    <CategoryRail {category} {videos} />
  {/each}
</div>

<style>
  /*
   * Vertical rhythm between rails (UI-SPEC "Rhythm & layout"): generous
   * clamp(2.5rem, 6vh, 4rem) between shelves — the "large 48px+ sections" cue.
   * The hero→first rail hand-off is slightly tighter (top padding) to invite the
   * scroll, while inter-rail spacing stays generous.
   */
  .home-rails {
    display: flex;
    flex-direction: column;
    gap: clamp(2.5rem, 6vh, 4rem);
    padding-top: clamp(1.5rem, 4vh, 2.5rem);
    padding-bottom: clamp(2.5rem, 6vh, 4rem);
  }
</style>
