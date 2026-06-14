<!--
  Phase 1 placeholder home. A single dark hero with the wordmark + tagline and
  ONE base-prefixed internal link — this proves base-path link handling
  end-to-end on the cheapest possible page. The real YouTube-style category
  rails + producer-reel hero land in Phase 3.
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>Michelle Ngo — Filmmaker & Producer</title>
  <meta
    name="description"
    content="Michelle Ngo is a filmmaker and producer based in New York City."
  />
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center px-6 text-center">
  <h1 class="text-4xl font-bold uppercase tracking-[0.3em] sm:text-6xl">Michelle Ngo</h1>
  <p class="mt-6 max-w-xl text-sm text-neutral-400 sm:text-base">
    Filmmaker & producer based in New York City.
  </p>
  <a
    href={`${base}/work/`}
    class="mt-10 inline-block text-sm uppercase tracking-widest underline underline-offset-4 hover:no-underline"
  >
    View work →
  </a>
</main>
