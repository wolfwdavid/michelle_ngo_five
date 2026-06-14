<!--
  /watch/[id] — the primary card destination (every VideoCard links here).

  Composes:
    - WATCH-02 facade player (poster + play button; the embed mounts only on
      click — the eager-embed approach v4 shipped is replaced; this page renders
      no embed frame in its own markup, the frame lives only inside WatchPlayer).
    - WATCH-03 metadata: <h1> title, interactive CategoryTag → /work/[slug],
      uploader · year, optional description (whitespace-pre-line). PBS videos get
      a cross-link to the dedicated PBS landing.
    - WATCH-04 rail: <h2> heading IS the link → /work/[slug]; same VideoCard +
      2/3/4 grid as /work; the whole section is hidden when the rail is empty.
    - SEO-02 VideoObject JSON-LD (name, description, thumbnailUrl, uploadDate,
      embedUrl; duration conditional) + an absolute production-host canonical
      (NOT base-relative — canonical/OG URLs must be fully-qualified, Pitfall 11).

  ESLint: svelte/no-navigation-without-resolve disabled for this file — the
  rail-heading <a href> is built from `$app/paths` base + categoryToSlug() output
  (already base-path safe), matching the VideoCard idiom locked in by Phase 1's
  BASE_PATH wiring rather than the typed-routes resolve() API.
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { base } from '$app/paths';
  import type { PageData } from './$types';
  import WatchPlayer from '$lib/components/WatchPlayer.svelte';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import CategoryTag from '$lib/components/CategoryTag.svelte';
  import { categoryToSlug } from '$lib/data';

  let { data }: { data: PageData } = $props();
  // $derived so reactivity is preserved if SvelteKit navigates between
  // /watch/[id] entries client-side (svelte/state_referenced_locally warning).
  const video = $derived(data.video);
  const rail = $derived(data.rail);
  const year = $derived(video.published.slice(0, 4)); // 4-digit year from ISO date
  const categorySlug = $derived(categoryToSlug(video.category));

  // SEO-02: VideoObject JSON-LD payload derived per video. duration is ISO 8601
  // (PT5M30S) and only emitted when duration_seconds is present (some videos
  // lack it — conditional preserves the field shape).
  const videoJsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl: video.thumbnail,
    uploadDate: video.published,
    embedUrl: video.embed,
    ...(video.duration_seconds
      ? {
          duration: `PT${Math.floor(video.duration_seconds / 60)}M${video.duration_seconds % 60}S`,
        }
      : {}),
  });
</script>

<svelte:head>
  <title>{video.title} — Michelle Ngo</title>
  <meta
    name="description"
    content={video.description
      ? video.description.slice(0, 150)
      : `${video.title} — by Michelle Ngo`}
  />
  <!-- Absolute, production-host canonical (NOT base-relative — Pitfall 11). -->
  <link rel="canonical" href={`https://michellengo.net/watch/${video.id}/`} />
  <!-- SEO-02 VideoObject JSON-LD for Google video-rich-snippet eligibility.
       {@html} is safe here: videoJsonLd is JSON.stringify of a derived object
       whose values come from videos.json (build-time validated by Zod). No
       runtime user input flows into the JSON payload. -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify(videoJsonLd)}<` + `/script>`}
</svelte:head>

<article class="mx-auto px-4 py-6 sm:px-6 lg:px-8">
  <!-- WATCH-02 player: facade (poster + play button), embed mounts only on click. -->
  <div class="mx-auto max-w-5xl">
    <WatchPlayer embed={video.embed} thumbnail={video.thumbnail} title={video.title} />
  </div>

  <!-- WATCH-03 metadata: h1, interactive chip, uploader · year, optional description -->
  <div class="mx-auto mt-6 max-w-7xl space-y-2">
    <h1 class="text-2xl font-medium md:text-3xl">{video.title}</h1>
    <CategoryTag category={video.category} href={`${base}/work/${categorySlug}`} />
    <p class="text-sm text-neutral-400">{video.uploader} · {year}</p>
    {#if video.description}
      <p class="max-w-3xl whitespace-pre-line pt-2 text-sm text-neutral-300">
        {video.description}
      </p>
    {/if}
    {#if video.category === 'PBS American Portrait'}
      <!-- Cross-link to the dedicated PBS landing (PBS videos only). -->
      <p class="pt-2 text-sm text-neutral-400">
        <a href={`${base}/pbs-american-portrait/`} class="hover:underline">
          → About the PBS American Portrait project
        </a>
      </p>
    {/if}
  </div>

  <!-- WATCH-04 rail: heading-is-link, same VideoCard + 2/3/4 grid, hide if empty -->
  {#if rail.length > 0}
    <section class="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-8">
      <h2 class="mb-4 text-lg font-medium">
        <a href={`${base}/work/${categorySlug}`} class="hover:underline">
          More in {video.category} →
        </a>
      </h2>
      <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {#each rail as v (v.id)}
          <VideoCard video={v} />
        {/each}
      </ul>
    </section>
  {/if}
</article>
