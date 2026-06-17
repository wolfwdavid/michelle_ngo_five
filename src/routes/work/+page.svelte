<!--
  /work — unfiltered grid of all 56 videos (BRWS-01). No page heading.
  Layout: single flat CSS grid, 2/3/4 responsive at Tailwind default
  breakpoints (sm=640, lg=1024), tight YouTube-density gaps, max-w-7xl
  content container.

  Cards: <VideoCard> from Plan 02-01. First 8 are eager; rest lazy.

  SEO-01: this plan OWNS the /work canonical — absolute production host
  (NOT base-relative — Pitfall 11), matching the convention Plan 02-02 used
  for the watch canonical.
-->
<script lang="ts">
  import type { PageData } from './$types';
  import VideoCard from '$lib/components/VideoCard.svelte';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Work — Michelle Ngo</title>
  <meta
    name="description"
    content="All 56 videos by filmmaker Michelle Ngo, organized by category."
  />
  <!-- Absolute, production-host canonical (NOT base-relative — Pitfall 11). -->
  <link rel="canonical" href="https://michellengo.net/work/" />
  <!-- Per-page Open Graph (SEO-05): og:title mirrors the page title; og:url mirrors the canonical. -->
  <meta property="og:title" content="Work — Michelle Ngo" />
  <meta property="og:url" content="https://michellengo.net/work/" />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <!--
    Visually-hidden page <h1>: the design intentionally shows no heading (YouTube
    density), but every page needs an h1 for the document outline (axe
    page-has-heading-one, QUAL-01) and to anchor the card <h2>s below it.
  -->
  <h1 class="sr-only">All work</h1>
  <h2 class="sr-only">All 56 videos</h2>
  <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
    {#each data.videos as video, i (video.id)}
      <VideoCard {video} eager={i < 8} />
    {/each}
  </ul>
</section>
