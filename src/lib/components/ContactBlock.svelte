<!--
  Shared contact block — single source of truth.

  Single component reused VERBATIM on /about, /contact, and Footer column 1.
  One vertical layout — no orientation prop, no variants. Editing
  email/phone/socials here propagates to all surfaces (CONT-02 satisfied by
  construction).

  Channel literals:
    - Email:    mailto:mynogo@gmail.com → display "mynogo@gmail.com"
    - Phone:    tel:+19175661976        → display "(917) 566-1976"
    - IMDb:     https://www.imdb.com/    → display "IMDb"     (external link)
    - LinkedIn: https://www.linkedin.com/ → display "LinkedIn" (external link)
    - Vimeo:    https://vimeo.com/user2149742 → display "Vimeo" (external link)

  Style: inline-link (text-white hover:underline underline-offset-2) on every
  link.

  NOTE — IMDb and LinkedIn ship as channel-homepage fallbacks
    (https://www.imdb.com/, https://www.linkedin.com/). Channel homepages are
    functional (no 404s). Future enhancement: swap to personalized profile
    URLs of the shape `https://www.imdb.com/name/nm{NUMERIC_ID}/` and
    `https://www.linkedin.com/in/{HANDLE}/` when materializable. This is a
    single-line edit per URL; no test changes needed as long as the new URLs
    still contain 'imdb.com' / 'linkedin.com' respectively.

  The Person JSON-LD sameAs in Plan 02-04 mirrors these exact literals.
-->
<script lang="ts">
  // No props. One vertical layout everywhere.
  // Hardcoded literal URLs. If channels change, edit this file only —
  // it is the single source of truth for /about, /contact, and Footer.
  const IMDB_URL = 'https://www.imdb.com/';
  const LINKEDIN_URL = 'https://www.linkedin.com/';
  const VIMEO_URL = 'https://vimeo.com/user2149742';
</script>

<ul class="space-y-2 text-base">
  <li>
    <a href="mailto:mynogo@gmail.com" class="text-white hover:underline underline-offset-2">
      mynogo@gmail.com
    </a>
  </li>
  <li>
    <a href="tel:+19175661976" class="text-white hover:underline underline-offset-2">
      (917) 566-1976
    </a>
  </li>
  <li>
    <a
      href={IMDB_URL}
      target="_blank"
      rel="noopener"
      class="text-white hover:underline underline-offset-2"
    >
      IMDb
    </a>
  </li>
  <li>
    <a
      href={LINKEDIN_URL}
      target="_blank"
      rel="noopener"
      class="text-white hover:underline underline-offset-2"
    >
      LinkedIn
    </a>
  </li>
  <li>
    <a
      href={VIMEO_URL}
      target="_blank"
      rel="noopener"
      class="text-white hover:underline underline-offset-2"
    >
      Vimeo
    </a>
  </li>
</ul>
