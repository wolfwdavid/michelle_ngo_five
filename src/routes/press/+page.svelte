<!--
  /press broadcast credits page (PAGE-02).

  Composition (ported verbatim from michelle_ngo_four):
    - credits derived from videos.json (filter uploader !== 'Michelle Ngo')
    - uploader strings used verbatim as network labels (no normalization)
    - prestige order locked in _pressCredits.ts PRESTIGE_ORDER
    - <h1>Press</h1> + per-network <section>/<h2>/<ul> blocks
    - per-credit row = inline-link to /watch/[id] (title only, no date/role)
    - container max-w-3xl (editorial reading width)

  ESLint: svelte/no-navigation-without-resolve disabled — internal hrefs built
  from `${base}/watch/${id}` (same idiom as VideoCard + TopNav + PBS landing).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import type { PageData } from './$types';
  import { base } from '$app/paths';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Press — Michelle Ngo</title>
  <meta
    name="description"
    content="Broadcast credits: HBO Max, HBO, PBS, ABC News, U2, Amazon News, Music Box, and more."
  />
  <!-- Absolute, production-host canonical (NOT base-relative — Pitfall 11). -->
  <link rel="canonical" href="https://michellengo.net/press/" />
  <!-- Per-page Open Graph (SEO-05): og:title mirrors the page title; og:url mirrors the canonical. -->
  <meta property="og:title" content="Press — Michelle Ngo" />
  <meta property="og:url" content="https://michellengo.net/press/" />
</svelte:head>

<section class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
  <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">Press</h1>

  <div class="mt-10 md:mt-12 space-y-12 md:space-y-16">
    {#each data.groups as group (group.network)}
      <section>
        <h2 class="text-xl md:text-2xl font-bold uppercase tracking-wider">{group.network}</h2>
        <ul class="mt-4 space-y-2">
          {#each group.videos as video (video.id)}
            <li>
              <a
                href={`${base}/watch/${video.id}`}
                data-sveltekit-preload-data="hover"
                class="text-white hover:underline underline-offset-2"
              >
                {video.title}
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>
</section>
