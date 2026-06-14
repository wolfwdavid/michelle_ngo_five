<!--
  /pbs-american-portrait/ — flagship landing page (PBS-01).

  DOM order: h1 (PBS accent) / subtitle / blockquote + attribution / outbound
  link / h2 "Stories" / VideoCard grid (eager first 8) with per-card
  "See on PBS →" badge in the parent <li>.

  The verbatim PBS paragraph inside <blockquote> is user-approved content —
  copied byte-for-byte, no edits.

  SEO-01: this plan OWNS the /pbs-american-portrait canonical — absolute
  production host (NOT base-relative — Pitfall 11), matching the convention
  Plan 02-02 used for the watch canonical.

  ESLint: svelte/no-navigation-without-resolve disabled (project idiom —
  internal hrefs built from $app/paths base; same pattern as VideoCard + TopNav).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import type { PageData } from './$types';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { categoryAccent } from '$lib/components/categoryAccent';
  import { pbsCollectionUrl } from './_pbsCollectionUrl';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>PBS American Portrait — Michelle Ngo</title>
  <meta
    name="description"
    content="Michelle Ngo's PBS American Portrait work: 18 short documentary portraits broadcast on PBS."
  />
  <!-- Absolute, production-host canonical (NOT base-relative — Pitfall 11). -->
  <link rel="canonical" href="https://michellengo.net/pbs-american-portrait/" />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <h1
    class="text-3xl font-bold uppercase tracking-wider md:text-5xl {categoryAccent(
      'PBS American Portrait'
    )}"
  >
    PBS American Portrait
  </h1>
  <p class="mt-3 text-sm uppercase tracking-wide text-neutral-400 md:text-base">
    18 stories produced by Michelle Ngo
  </p>

  <blockquote class="mt-6 max-w-3xl border-l-2 border-neutral-700 pl-4 text-neutral-200">
    Whether it's joy or sorrow, triumph or hardship, family traditions followed for decades or just
    the chaos of the morning school run, PBS American Portrait put together a picture of life as
    it's really lived. The show gives a glimpse into American life, and a chance for everyday
    Americans to be heard.
  </blockquote>
  <p class="mt-2 text-xs text-neutral-500">Description from pbs.org/american-portrait</p>

  <p class="mt-6">
    <a
      href="https://www.pbs.org/american-portrait/"
      target="_blank"
      rel="noopener"
      class="hover:underline"
    >
      Visit pbs.org/american-portrait →
    </a>
  </p>

  <h2 class="mt-12 text-lg font-medium">Stories</h2>
  <ul class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
    {#each data.videos as video, i (video.id)}
      <li>
        <VideoCard {video} eager={i < 8} />
        {#if pbsCollectionUrl(video.description ?? '')}
          <a
            href={pbsCollectionUrl(video.description ?? '') ?? ''}
            target="_blank"
            rel="noopener"
            class="mt-1 inline-block text-xs text-neutral-400 hover:underline"
          >
            See on PBS →
          </a>
        {/if}
      </li>
    {/each}
  </ul>
</section>
