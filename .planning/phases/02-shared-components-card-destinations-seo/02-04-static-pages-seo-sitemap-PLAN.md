---
phase: 02-shared-components-card-destinations-seo
plan: 04
type: execute
wave: 3
depends_on: [01, 02, 03]
autonomous: true
requirements: [PAGE-01, PAGE-02, PAGE-03, SEO-01, SEO-02, SEO-03]
files_modified:
  - src/routes/about/+page.svelte
  - src/routes/about/page.test.ts
  - src/routes/press/+page.ts
  - src/routes/press/+page.svelte
  - src/routes/press/page.test.ts
  - src/routes/press/_pressCredits.ts
  - src/routes/press/_pressCredits.test.ts
  - src/routes/contact/+page.svelte
  - src/routes/contact/page.test.ts
  - src/routes/sitemap.xml/+server.ts
  - src/routes/sitemap.xml/server.test.ts
must_haves:
  truths:
    - "/about presents Michelle's approved bio, a ContactBlock, and emits Person JSON-LD"
    - "/press lists broadcast credits grouped by network (HBO, PBS, ABC News, Amazon News, etc.), each row linking to its /watch/[id]"
    - "/contact presents the shared ContactBlock (email mynogo@gmail.com, phone, Vimeo/socials) — same component as about + footer"
    - "about, press, and contact each emit a title, meta description, and a canonical URL; the sitewide OG/Twitter card is inherited from the layout"
    - "A prerendered /sitemap.xml enumerates home + /work + 8 categories + 56 watch + about/press/contact (70 URLs)"
  artifacts:
    - path: "src/routes/about/+page.svelte"
      provides: "About page with approved bio + Person JSON-LD"
      contains: "Person"
    - path: "src/routes/press/_pressCredits.ts"
      provides: "Network-grouped broadcast credits derived from videos.json"
      contains: "PRESTIGE_ORDER"
    - path: "src/routes/sitemap.xml/+server.ts"
      provides: "Prerendered 70-URL sitemap"
      contains: "urlset"
  key_links:
    - from: "src/routes/about/+page.svelte"
      to: "ContactBlock + Person JSON-LD"
      via: "shared component + ld+json sameAs mirroring ContactBlock links"
      pattern: "ContactBlock"
    - from: "src/routes/contact/+page.svelte"
      to: "ContactBlock"
      via: "same shared contact component"
      pattern: "ContactBlock"
    - from: "src/routes/sitemap.xml/+server.ts"
      to: "$lib/data videos + categories"
      via: "enumerates all watch + category URLs"
      pattern: "getCategoriesInDisplayOrder"
  scope_note: "14 files of mostly verbatim ports. If execution quality degrades (context >50%), this plan MAY be split into 04a (about/press/contact + canonicals) and 04b (sitemap)."
---

<objective>
Port v4's static pages — `/about` (approved bio + Person JSON-LD), `/press` (network-grouped broadcast credits), `/contact` (shared ContactBlock) — and the prerendered `/sitemap.xml` (70 URLs), then close per-page SEO for the static pages: about/press/contact each emit a title, meta description, and a canonical URL (SEO-01), with the sitewide OG/Twitter card inherited from the Plan-02-01 layout. The Person JSON-LD on /about co-covers SEO-02 with the VideoObject JSON-LD from Plan 02-02.

Purpose: These are the remaining nav/footer destinations and the search-engine surface. They are a near-verbatim port; the only adaptation is wiring to v5's existing ContactBlock + data barrel and adding a canonical link to about/press/contact. This plan runs in Wave 3 — AFTER Plan 02-02 (56 watch routes) and Plan 02-03 (8 category routes) — because the sitemap's 70-URL build check requires those destinations to already exist.
Output: about/press/contact pages (+ press helper), the sitemap server route, and per-page canonical coverage for the static pages — all with passing tests.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/research/ARCHITECTURE.md
@.planning/research/PITFALLS.md
@.planning/phases/02-shared-components-card-destinations-seo/02-01-shared-components-and-chrome-PLAN.md
@.planning/phases/02-shared-components-card-destinations-seo/02-02-watch-pages-facade-jsonld-PLAN.md
@.planning/phases/02-shared-components-card-destinations-seo/02-03-browse-and-pbs-PLAN.md

<port_source>
Port VERBATIM (adapt only imports to v5 paths) FROM:
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/about/+page.svelte (+ page.test.ts)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/press/+page.ts (+ .svelte, + page.test.ts, + _pressCredits.ts, + _pressCredits.test.ts)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/contact/+page.svelte (+ page.test.ts)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/sitemap.xml/+server.ts
The about page's approved bio paragraph and the Person JSON-LD sameAs URLs are user-approved content — copy byte-for-byte. The sameAs URLs MUST match the literals in v5's ContactBlock.svelte (Plan 02-01).
</port_source>

<interfaces>
From '$lib/data' (already exists):
  videos: readonly Video[]
  getCategoriesInDisplayOrder(): readonly Category[]   // sitemap category order
  categoryToSlug(category): string
From Plan 02-01: ContactBlock.svelte (reused on about + contact + footer — PAGE-03 single source).
ContactBlock link literals (mirror in Person JSON-LD sameAs):
  https://vimeo.com/user2149742 , https://www.imdb.com/ , https://www.linkedin.com/

Sitewide head already in +layout.svelte (Plan 02-01): og:site_name, og:type, og:image
  (https://michellengo.net{base}/og-image.jpg), twitter:card, twitter:image, favicons, noindex.
  Per-page <svelte:head> overrides title + meta description and ADDS canonical.

Canonical ownership (no cross-plan writes):
  - This plan (02-04) owns canonicals for /about, /press, /contact ONLY.
  - Plan 02-03 owns canonicals for /work, /work/[category] (×8), /pbs-american-portrait.
  - Plan 02-02 owns the /watch/[id] canonical.
  Convention (shared across all three plans): absolute production host, NOT base-relative
  (Pitfall 11), e.g. `<link rel="canonical" href="https://michellengo.net/about/" />`.

Sitemap is its own +server.ts with `export const prerender = true;` → emits build/sitemap.xml.
  Absolute production host (https://michellengo.net/...); 6 static + 8 category + 56 watch = 70.
  The 70-URL build check requires the 56 watch routes (Plan 02-02) and 8 category routes
  (Plan 02-03) to already exist — hence this plan is Wave 3 (depends_on [01,02,03]).
Base-path invariant: internal page hrefs via `${base}`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Port /about (+ Person JSON-LD), /press (+ credits helper), /contact (shared ContactBlock)</name>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/about/+page.svelte (+ page.test.ts)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/press/+page.ts (+ .svelte, + page.test.ts)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/press/_pressCredits.ts (+ .test.ts)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/contact/+page.svelte (+ page.test.ts)
    - src/lib/components/ContactBlock.svelte (Plan 02-01 — confirm the sameAs URL literals)
  </read_first>
  <action>
    /about: copy +page.svelte VERBATIM — h1 "About", the approved first-person bio paragraph (copy byte-for-byte, do NOT rewrite), and `<ContactBlock />`. Keep the Person JSON-LD `{@html}` script in svelte:head (name, jobTitle, url https://michellengo.net/about/, sameAs = [IMDB_URL, LINKEDIN_URL, VIMEO_URL]). This Person JSON-LD is the half of SEO-02 this plan co-covers (the other half is the VideoObject JSON-LD in Plan 02-02). Confirm those three sameAs literals match v5's ContactBlock.svelte; if ContactBlock uses different literals, align the JSON-LD to ContactBlock (single source of truth). Keep title + meta description. Port page.test.ts.

    /press: copy +page.ts (load = _pressCredits derives network groups from videos.json, uploader !== 'Michelle Ngo', PRESTIGE_ORDER), +page.svelte (h1 "Press"; per-network sections; each credit row is an inline `${base}/watch/${id}` link with the video title), title + meta description. Copy _pressCredits.ts + _pressCredits.test.ts VERBATIM. Port page.test.ts.

    /contact: copy +page.svelte VERBATIM — h1 "Contact" + `<ContactBlock />` (no form — Out of Scope). Keep title + meta description. Port page.test.ts.

    Adapt only imports to v5 paths ('$lib/components/ContactBlock.svelte', '$lib/data', './$types'). prettier --write all files.
  </action>
  <acceptance_criteria>
    - Pages exist: `test -f src/routes/about/+page.svelte && test -f src/routes/press/+page.svelte && test -f src/routes/contact/+page.svelte` (exit 0)
    - About emits Person JSON-LD (SEO-02 half): `grep -q '"Person"' src/routes/about/+page.svelte && grep -q "sameAs" src/routes/about/+page.svelte` (exit 0)
    - ContactBlock reused on about AND contact: `grep -q "ContactBlock" src/routes/about/+page.svelte && grep -q "ContactBlock" src/routes/contact/+page.svelte` (exit 0)
    - Press groups by network from data: `grep -q "PRESTIGE_ORDER" src/routes/press/_pressCredits.ts && grep -q '${base}/watch/' src/routes/press/+page.svelte` (exit 0)
    - Every static page has a title + description: `for p in about press contact; do grep -q "<title>" src/routes/$p/+page.svelte && grep -q 'name="description"' src/routes/$p/+page.svelte || exit 1; done` (exit 0)
    - No leading-slash local hrefs: `! grep -RnE 'href="/[a-z]' src/routes/about src/routes/press src/routes/contact` (exit 0)
    - Tests pass: `pnpm exec vitest run src/routes/about/ src/routes/press/ src/routes/contact/` exits 0
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest run src/routes/about/ src/routes/press/ src/routes/contact/</automated>
  </verify>
  <done>about/press/contact ported; about emits Person JSON-LD (SEO-02 half) whose sameAs mirrors ContactBlock; contact + about + footer all use the one ContactBlock (PAGE-03); each page has title + description; tests green.</done>
</task>

<task type="auto">
  <name>Task 2: Port /sitemap.xml (70 URLs) + add canonical coverage for about/press/contact (SEO-01)</name>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/sitemap.xml/+server.ts
    - src/routes/+layout.svelte (Plan 02-01 — the sitewide OG/Twitter head this builds on)
    - src/routes/about/+page.svelte, press/+page.svelte, contact/+page.svelte (Task 1 output — add canonicals here)
  </read_first>
  <action>
    Sitemap: copy +server.ts VERBATIM into src/routes/sitemap.xml/+server.ts — `export const prerender = true;`, SITE='https://michellengo.net', the 6 STATIC_ROUTES (/, /work/, /pbs-american-portrait/, /press/, /about/, /contact/), 8 categories via getCategoriesInDisplayOrder()+categoryToSlug(), and 56 watch URLs from `videos`. Total 70 <url> blocks, absolute production host (Pitfall 11 — NOT base-relative).
    Write src/routes/sitemap.xml/server.test.ts asserting: GET() returns an XML body whose `<loc>` count is exactly 70 (6 + 8 + 56), includes a /watch/<id>/ for the first video id, includes all 8 category slugs, and includes /about/ /press/ /contact/. (If v4 shipped a sitemap test, port it instead and ensure the 70 count is asserted.)

    Canonical coverage (SEO-01) — this plan owns ONLY the about/press/contact canonicals. In each of about/press/contact +page.svelte svelte:head, ADD a `<link rel="canonical" href={`https://michellengo.net/<path>/`} />` (absolute production host, Pitfall 11). Do NOT touch /work, /work/[category], or /pbs-american-portrait — those canonicals are owned by Plan 02-03 (no cross-plan writes). Do NOT touch the layout's sitewide OG/Twitter (already correct). The sitewide og:image + twitter:card from the layout satisfy the OG/Twitter half of SEO-01 for every page; this task closes the canonical half for the static pages.
    prettier --write all touched files.
  </action>
  <acceptance_criteria>
    - Sitemap is prerendered + absolute host: `grep -q "prerender = true" src/routes/sitemap.xml/+server.ts && grep -q "https://michellengo.net" src/routes/sitemap.xml/+server.ts` (exit 0)
    - Sitemap enumerates from data: `grep -q "getCategoriesInDisplayOrder" src/routes/sitemap.xml/+server.ts && grep -q "videos" src/routes/sitemap.xml/+server.ts` (exit 0)
    - Sitemap emitted by build with 70 URLs: `MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build` exits 0 AND `test -f build/sitemap.xml` AND `grep -c '<loc>' build/sitemap.xml` == 70
    - Build emits exactly the destinations the sitemap lists: `find build/watch -name index.html | wc -l` == 56 AND `find build/work -mindepth 2 -name index.html | wc -l` == 8
    - Canonical on each static page this plan owns: `for p in about press contact; do grep -q 'rel="canonical"' src/routes/$p/+page.svelte || exit 1; done` (exit 0)
    - Sitemap test passes: `pnpm exec vitest run src/routes/sitemap.xml/` exits 0
    - `pnpm check` 0 errors; full `pnpm test` green
  </acceptance_criteria>
  <verify>
    <automated>MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build && test "$(grep -c '<loc>' build/sitemap.xml)" -eq 70 && pnpm exec vitest run src/routes/sitemap.xml/ && pnpm check</automated>
  </verify>
  <done>/sitemap.xml prerenders with exactly 70 absolute-host URLs (6+8+56), the build emits all those destinations (watch + category routes from Plans 02-02/02-03 already present), and about/press/contact each carry a title + description + canonical (SEO-01) on top of the layout's sitewide OG/Twitter card.</done>
</task>

</tasks>

<verification>
- `MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build` exits 0; build/sitemap.xml has exactly 70 `<loc>` entries; build/about/index.html, build/press/index.html, build/contact/index.html exist.
- About emits Person JSON-LD (SEO-02 half); about + contact + footer share one ContactBlock.
- about/press/contact each have title + meta description + canonical; no leading-slash local hrefs in the static routes. (work/work[category]/pbs canonicals are Plan 02-03; watch canonical is Plan 02-02.)
- `pnpm check` 0 errors; `pnpm test` fully green.
</verification>

<success_criteria>
- PAGE-01: /about presents the approved bio + contact links.
- PAGE-02: /press lists network-grouped broadcast credits.
- PAGE-03: a Contact surface (email/phone/socials) reused consistently across about/footer/contact via one ContactBlock.
- SEO-01 (partial — static pages): about/press/contact each have title + meta description + canonical + (layout-inherited) OG/Twitter card image. (work/work[category]/pbs canonicals are Plan 02-03; watch canonical is Plan 02-02.)
- SEO-02 (co-covered): /about emits Person JSON-LD (the watch pages' VideoObject JSON-LD in Plan 02-02 is the other half).
- SEO-03: /sitemap.xml enumerates all 70 routes (home, work, 8 categories, 56 watch, static pages).
</success_criteria>

<output>
After completion, create `.planning/phases/02-shared-components-card-destinations-seo/02-04-SUMMARY.md`.
</output>
</content>
