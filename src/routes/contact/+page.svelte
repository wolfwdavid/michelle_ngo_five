<!--
  /contact page (PAGE-03 surface).

  Composition (ported verbatim from michelle_ngo_four):
    - /contact stays a real page (does NOT redirect, does NOT drop)
    - h1 "Contact" + shared <ContactBlock /> (no intro paragraph, no form)
    - same shared <ContactBlock /> as /about and the Footer (single source)

  Contact form is Out of Scope per REQUIREMENTS.md (mailto: link sufficient).
-->
<script lang="ts">
  import ContactBlock from '$lib/components/ContactBlock.svelte';
</script>

<svelte:head>
  <title>Contact — Michelle Ngo</title>
  <meta name="description" content="Reach Michelle Ngo by email or phone." />
  <!-- Absolute, production-host canonical (NOT base-relative — Pitfall 11). -->
  <link rel="canonical" href="https://michellengo.net/contact/" />
</svelte:head>

<main class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
  <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">Contact</h1>

  <div class="mt-10 md:mt-12">
    <ContactBlock />
  </div>
</main>
