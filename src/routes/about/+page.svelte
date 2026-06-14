<!--
  /about page (PAGE-01 / SEO-02 half).

  Composition (ported verbatim from michelle_ngo_four):
    - h1 "About"
    - approved first-person bio paragraph (copied byte-for-byte; do NOT rewrite)
    - shared <ContactBlock /> (PAGE-03 single source — same component as
      /contact and the Footer)

  The bio paragraph is user-approved content (PROJECT.md "Bio (approved)").
  Copy VERBATIM — do NOT rewrite, summarize, or paraphrase.
-->
<script lang="ts">
  import ContactBlock from '$lib/components/ContactBlock.svelte';

  // Person JSON-LD sameAs values. MUST match the literals in
  // src/lib/components/ContactBlock.svelte (single source of truth for the
  // visible links; this duplication is intentional because ContactBlock does
  // not export its URL constants). Update both files together if URLs change.
  //
  // IMDb + LinkedIn ship as channel-homepage fallbacks — personalized profile
  // URLs were not materializable before cutover. Post-launch: swap to URLs of
  // the shape `https://www.imdb.com/name/nm{NUMERIC_ID}/` and
  // `https://www.linkedin.com/in/{HANDLE}/` — single-line edit in BOTH this
  // file AND ContactBlock.svelte.
  const IMDB_URL = 'https://www.imdb.com/';
  const LINKEDIN_URL = 'https://www.linkedin.com/';
  const VIMEO_URL = 'https://vimeo.com/user2149742';

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Michelle Ngo',
    jobTitle: 'Filmmaker, Producer',
    url: 'https://michellengo.net/about/',
    sameAs: [IMDB_URL, LINKEDIN_URL, VIMEO_URL],
  };
</script>

<svelte:head>
  <title>About — Michelle Ngo</title>
  <meta
    name="description"
    content="I'm Michelle Ngo, a filmmaker and producer based in New York City. I make video that helps brands and broadcasters tell stories well."
  />
  <!-- Absolute, production-host canonical (NOT base-relative — Pitfall 11). -->
  <link rel="canonical" href="https://michellengo.net/about/" />
  <!-- Person JSON-LD for SEO knowledge-panel candidacy (SEO-02 half).
       {@html} is safe here: personJsonLd is JSON.stringify of a hardcoded
       static object literal — no user input flows in. -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify(personJsonLd)}<` + `/script>`}
</svelte:head>

<main class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
  <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">About</h1>

  <p class="mt-8 text-base md:text-lg leading-relaxed text-neutral-200">
    <!-- BEGIN approved bio — copied VERBATIM from PROJECT.md (approved) -->
    I'm Michelle Ngo, a filmmaker and producer based in New York City. I make video that helps brands
    and broadcasters tell stories well — short documentaries, branded films, promos, and trailers. My
    credits include PBS American Portrait, HBO Max, HBO, ABC News, U2's Sphere residency, Amazon News,
    and Music Box Films. I love a tight schedule and a thoughtful script. I work hardest when the subject
    matter is human — real people telling true stories about how they live, what they make, and why it
    matters. If you have a project that needs a steady hand and a quick turn, get in touch.
    <!-- END approved bio -->
  </p>

  <div class="mt-10 md:mt-12">
    <ContactBlock />
  </div>
</main>
