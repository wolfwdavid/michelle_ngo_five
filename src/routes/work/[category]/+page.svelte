<!--
  /work/[category] — heading "Category (count)" in accent color above the
  same 2/3/4 grid as /work. Same VideoCard, no variant.

  SEO-01: this plan OWNS the /work/[category] canonical — absolute production
  host built from the route's category slug (NOT base-relative — Pitfall 11),
  matching the convention Plan 02-02 used for the watch canonical.
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import type { PageData } from './$types';
  import { base } from '$app/paths';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { categoryAccent } from '$lib/components/categoryAccent';
  import { categoryToSlug } from '$lib/data';

  let { data }: { data: PageData } = $props();

  // Canonical is the production host + the category's own slug (not params, so
  // it always matches the data the page renders).
  const categorySlug = $derived(categoryToSlug(data.category));
</script>

<svelte:head>
  <title>{data.category} — Michelle Ngo</title>
  <meta
    name="description"
    content="{data.videos.length} videos by Michelle Ngo in {data.category}."
  />
  <!-- Absolute, production-host canonical (NOT base-relative — Pitfall 11). -->
  <link rel="canonical" href={`https://michellengo.net/work/${categorySlug}/`} />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <h1
    class="mb-6 text-2xl font-bold uppercase tracking-wider md:text-3xl {categoryAccent(
      data.category
    )}"
  >
    {data.category} ({data.videos.length})
  </h1>
  {#if data.category === 'PBS American Portrait'}
    <!-- Cross-link to the dedicated PBS landing page. -->
    <p class="-mt-4 mb-6 text-sm text-neutral-400">
      <a href={`${base}/pbs-american-portrait/`} class="hover:underline">
        → About the PBS American Portrait project
      </a>
    </p>
  {/if}
  <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
    {#each data.videos as video, i (video.id)}
      <VideoCard {video} eager={i < 8} />
    {/each}
  </ul>
</section>
