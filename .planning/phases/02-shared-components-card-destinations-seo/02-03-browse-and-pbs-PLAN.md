---
phase: 02-shared-components-card-destinations-seo
plan: 03
type: execute
wave: 2
depends_on: [01]
autonomous: true
requirements: [BRWS-01, BRWS-02, PBS-01, SEO-01]
files_modified:
  - src/routes/work/+page.ts
  - src/routes/work/+page.svelte
  - src/routes/work/page.test.ts
  - src/routes/work/[category]/+page.ts
  - src/routes/work/[category]/+page.svelte
  - src/routes/work/[category]/page.test.ts
  - src/routes/pbs-american-portrait/+page.ts
  - src/routes/pbs-american-portrait/+page.svelte
  - src/routes/pbs-american-portrait/page.test.ts
  - src/routes/pbs-american-portrait/_pbsCollectionUrl.ts
  - src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts
must_haves:
  truths:
    - "/work browses all 56 videos in a responsive 2/3/4-col grid of VideoCards"
    - "/work/[category] prerenders a filtered grid for all 8 categories (entries()-driven), each sorted featured-first then date-desc"
    - "/pbs-american-portrait presents the 18 PBS videos with intro copy, an outbound link to pbs.org/american-portrait, and per-card 'See on PBS' links where available"
    - "Opening /work/[any-of-8-slugs] cold (deep-link) returns the page, not a 404"
    - "/work, all 8 /work/[category] pages, and /pbs-american-portrait each emit a base-path-safe canonical <link rel=\"canonical\"> (SEO-01)"
  artifacts:
    - path: "src/routes/work/[category]/+page.ts"
      provides: "entries() over all 8 category slugs + filtered load"
      contains: "EntryGenerator"
    - path: "src/routes/work/+page.svelte"
      provides: "Unfiltered all-videos grid + canonical"
      contains: "VideoCard"
    - path: "src/routes/pbs-american-portrait/+page.svelte"
      provides: "Flagship PBS landing with intro copy + grid + canonical"
      contains: "American Portrait"
  key_links:
    - from: "src/routes/work/[category]/+page.ts"
      to: "$lib/data CATEGORIES"
      via: "entries() maps every category slug"
      pattern: "CATEGORIES.map"
    - from: "src/routes/work/+page.svelte"
      to: "VideoCard"
      via: "grid of cards from load data"
      pattern: "VideoCard"
    - from: "src/routes/pbs-american-portrait/+page.ts"
      to: "$lib/data getByCategory"
      via: "filter to the 18 PBS videos"
      pattern: "getByCategory"
    - from: "src/routes/work/[category]/+page.svelte"
      to: "canonical link"
      via: "rel=canonical built from site URL + base + /work/{slug}/"
      pattern: "rel=\"canonical\""
---

<objective>
Port v4's browse surfaces — `/work` (all 56), `/work/[category]` (8 prerendered filtered grids), and the `/pbs-american-portrait` flagship landing (18 PBS videos with intro copy) — into v5, consuming the VideoCard from Plan 02-01, and give each of these pages a base-path-safe canonical `<link>` (SEO-01). Every dynamic route enumerates its params via `entries()` so all 8 category pages prerender (deep-link 404 pitfall).

Purpose: These are the card destinations a category nav link or the watch-page "more in {category}" rail points at. They are a near-verbatim port; the adaptations are wiring to v5's already-existing components/tokens and adding a per-page canonical. This plan OWNS canonical coverage for /work, /work/[category], and /pbs-american-portrait (Plan 02-04 owns canonicals only for about/press/contact and builds the sitemap).
Output: the work grid, the category grid (+ entries), and the PBS flagship (+ its helper) with canonicals and passing tests.
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

<port_source>
Port VERBATIM (adapt only imports to v5 paths) FROM:
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/work/+page.ts (+ .svelte, + page.test.ts)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/work/[category]/+page.ts (+ .svelte, + page.test.ts)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/pbs-american-portrait/+page.ts (+ .svelte, + page.test.ts, + _pbsCollectionUrl.ts, + _pbsCollectionUrl.test.ts)
</port_source>

<interfaces>
From '$lib/data' (already exists):
  videos: readonly Video[]
  CATEGORIES: readonly Category[]    // 8 — the entries() source for /work/[category]
  categoryToSlug(c), slugToCategory(slug)
  getByCategory(category): readonly Video[]   // PBS = getByCategory('PBS American Portrait') → 18
Shared sort comparator (used by /work/[category], /pbs, and the watch rail):
  featured-first (a.featured ? -1 : 1) then b.published.localeCompare(a.published)

From Plan 02-01: VideoCard.svelte (the grid leaf), categoryAccent() (PBS h1 accent).
From Plan 02-01: TopNav active-link detection already treats /pbs-american-portrait and
  /work/<slug> as active — no nav change needed here.

Base-path invariant: internal hrefs via `${base}`. Outbound pbs.org link is a real
  absolute external URL (target=_blank rel=noopener) — that is allowed (not a local asset).
adapter-static strict:true → /work/[category] MUST export entries() (8 slugs) or build fails.

Canonical convention (match how Plan 02-04 builds canonicals for about/press/contact —
  absolute production host, NOT base-relative, Pitfall 11):
  /work               → <link rel="canonical" href="https://michellengo.net/work/" />
  /work/[category]    → <link rel="canonical" href={`https://michellengo.net/work/${slug}/`} />
  /pbs-american-portrait → <link rel="canonical" href="https://michellengo.net/pbs-american-portrait/" />
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Port /work (all videos) and /work/[category] (8 prerendered filtered grids) + canonicals</name>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/work/+page.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/work/+page.svelte
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/work/page.test.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/work/[category]/+page.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/work/[category]/+page.svelte
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/work/[category]/page.test.ts
    - src/lib/components/VideoCard.svelte (Plan 02-01)
  </read_first>
  <action>
    /work: copy +page.ts (load returns all `videos`, or v4's sorted set — match v4 exactly), +page.svelte (max-w-7xl container, grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3, VideoCard with eager={i < 8}), and the per-page svelte:head (title "Work — Michelle Ngo" + meta description). Port page.test.ts.

    /work/[category]: copy +page.ts VERBATIM — entries() = CATEGORIES.map((c) => ({ category: categoryToSlug(c) })) (8 entries); load narrows slugToCategory(params.category) → error(404) on unknown slug → filtered, sorted (featured-first, date-desc). Returns { category, videos }. Copy +page.svelte (heading = category name, same grid markup as /work, per-page title/description reflecting the category). Port page.test.ts (KEEP the entries()=8 and rejects(404) assertions; do not weaken).

    Canonical coverage (SEO-01) — this plan OWNS /work + /work/[category] canonicals:
      - In src/routes/work/+page.svelte svelte:head, ADD `<link rel="canonical" href="https://michellengo.net/work/" />` (absolute production host, NOT base-relative — Pitfall 11).
      - In src/routes/work/[category]/+page.svelte svelte:head, ADD `<link rel="canonical" href={`https://michellengo.net/work/${categorySlug}/`} />` where categorySlug is the route's category slug (from data or params.category). Same absolute-host convention Plan 02-04 uses for about/press/contact.

    Repoint any v4-only import to v5 ('$lib/data', '$lib/components/VideoCard.svelte'). prettier --write all touched files.

    Note: Phase 1's placeholder home had a rel="external" /work/ link to dodge the strict prerenderer. Now that /work exists, the executor MAY drop that rel="external" from src/routes/+page.svelte if it is still present — but ONLY if the home still builds green; otherwise leave it (Phase 3 owns the home). This is optional cleanup, not required by acceptance.
  </action>
  <acceptance_criteria>
    - /work/[category] enumerates all 8: `grep -q "CATEGORIES.map" src/routes/work/[category]/+page.ts` (exit 0)
    - Both pages render cards: `grep -q "VideoCard" src/routes/work/+page.svelte && grep -q "VideoCard" src/routes/work/[category]/+page.svelte` (exit 0)
    - Responsive grid present: `grep -q "lg:grid-cols-4" src/routes/work/+page.svelte` (exit 0)
    - /work canonical present: `grep -q 'rel="canonical"' src/routes/work/+page.svelte` (exit 0)
    - /work/[category] canonical present: `grep -q 'rel="canonical"' src/routes/work/[category]/+page.svelte` (exit 0)
    - No leading-slash local hrefs: `! grep -RnE 'href="/[a-z]' src/routes/work/` (exit 0)
    - Build prerenders exactly 8 category pages: `MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build` exits 0 AND `find build/work -mindepth 2 -name index.html | wc -l` == 8
    - /work itself prerenders: `test -f build/work/index.html` (exit 0)
    - Build emits a canonical on /work and on each category page: `grep -q 'rel="canonical"' build/work/index.html` AND `test "$(grep -rl 'rel=\"canonical\"' build/work -mindepth 2 2>/dev/null | wc -l)" -ge 8`
    - Tests pass: `pnpm exec vitest run src/routes/work/page.test.ts src/routes/work/[category]/page.test.ts` exits 0
  </acceptance_criteria>
  <verify>
    <automated>MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build && test "$(find build/work -mindepth 2 -name index.html | wc -l)" -eq 8 && grep -q 'rel="canonical"' build/work/index.html && pnpm exec vitest run src/routes/work/page.test.ts src/routes/work/[category]/page.test.ts</automated>
  </verify>
  <done>/work shows all 56 in a 2/3/4 grid; /work/[category] prerenders all 8 filtered grids (entries-driven), deep-linkable, sorted consistently; /work and every category page emit a base-path-safe canonical; build green.</done>
</task>

<task type="auto">
  <name>Task 2: Port the /pbs-american-portrait flagship landing (18 videos + intro copy) + canonical</name>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/pbs-american-portrait/+page.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/pbs-american-portrait/+page.svelte
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/pbs-american-portrait/page.test.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/pbs-american-portrait/_pbsCollectionUrl.ts (+ .test.ts)
    - src/lib/components/categoryAccent.ts (PBS h1 accent), src/lib/components/VideoCard.svelte
  </read_first>
  <action>
    Copy all five PBS files VERBATIM into src/routes/pbs-american-portrait/: +page.ts (load = getByCategory('PBS American Portrait'), featured-first/date-desc sort → 18 videos), +page.svelte (h1 in text-cat-pbs via categoryAccent('PBS American Portrait'); subtitle "18 stories produced by Michelle Ngo"; the verbatim PBS blockquote + "Description from pbs.org/american-portrait" attribution; the outbound `https://www.pbs.org/american-portrait/` link target=_blank rel=noopener; h2 "Stories"; the VideoCard grid with per-card "See on PBS ->" link computed by _pbsCollectionUrl(); per-page title/description), and the _pbsCollectionUrl helper (+ its test). Port page.test.ts.

    Canonical coverage (SEO-01) — this plan OWNS the /pbs-american-portrait canonical:
      - In src/routes/pbs-american-portrait/+page.svelte svelte:head, ADD `<link rel="canonical" href="https://michellengo.net/pbs-american-portrait/" />` (absolute production host, NOT base-relative — Pitfall 11; same convention Plan 02-04 uses for about/press/contact).

    Adapt only imports to v5 paths. The blockquote/subtitle/attribution copy is user-approved content — copy it byte-for-byte, do NOT rewrite. prettier --write all files.
  </action>
  <acceptance_criteria>
    - All PBS files exist: `test -f src/routes/pbs-american-portrait/+page.svelte && test -f src/routes/pbs-american-portrait/+page.ts && test -f src/routes/pbs-american-portrait/_pbsCollectionUrl.ts` (exit 0)
    - Filters to PBS category: `grep -q "getByCategory" src/routes/pbs-american-portrait/+page.ts && grep -q "PBS American Portrait" src/routes/pbs-american-portrait/+page.ts` (exit 0)
    - Intro copy + outbound link present: `grep -q "American Portrait" src/routes/pbs-american-portrait/+page.svelte && grep -q "pbs.org/american-portrait" src/routes/pbs-american-portrait/+page.svelte` (exit 0)
    - Grid uses VideoCard: `grep -q "VideoCard" src/routes/pbs-american-portrait/+page.svelte` (exit 0)
    - PBS canonical present: `grep -q 'rel="canonical"' src/routes/pbs-american-portrait/+page.svelte` (exit 0)
    - No leading-slash local hrefs: `! grep -nE 'href="/[a-z]' src/routes/pbs-american-portrait/+page.svelte` (exit 0)
    - Page prerenders with a canonical: `MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build` exits 0 AND `test -f build/pbs-american-portrait/index.html` AND `grep -q 'rel="canonical"' build/pbs-american-portrait/index.html`
    - Tests pass: `pnpm exec vitest run src/routes/pbs-american-portrait/` exits 0
    - `pnpm check` 0 errors
  </acceptance_criteria>
  <verify>
    <automated>MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build && test -f build/pbs-american-portrait/index.html && grep -q 'rel="canonical"' build/pbs-american-portrait/index.html && pnpm exec vitest run src/routes/pbs-american-portrait/ && pnpm check</automated>
  </verify>
  <done>The PBS flagship prerenders with the approved intro copy, the outbound pbs.org link, the 18-video grid, per-card "See on PBS" links, and a base-path-safe canonical; tests green.</done>
</task>

</tasks>

<verification>
- `MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build` exits 0; `find build/work -mindepth 2 -name index.html | wc -l` == 8; build/work/index.html and build/pbs-american-portrait/index.html exist.
- /work, all 8 /work/[category] pages, and /pbs-american-portrait emit `rel="canonical"` (SEO-01 for the browse surfaces this plan owns).
- No `href="/..."` leading-slash literals in src/routes/work/ or pbs-american-portrait/ (outbound pbs.org absolute link is allowed).
- `pnpm check` 0 errors; `pnpm test` green for work, work/[category], and pbs routes.
</verification>

<success_criteria>
- BRWS-01: /work browses all 56 in a responsive grid.
- BRWS-02: /work/[category] prerenders all 8 filtered grids, deep-linkable (entries-driven).
- PBS-01: /pbs-american-portrait presents the 18 PBS videos with approved intro copy and a link to the PBS collection.
- SEO-01 (partial — browse surfaces): /work, /work/[category] (×8), and /pbs-american-portrait each emit a base-path-safe canonical. (about/press/contact canonicals + sitemap are Plan 02-04; watch canonicals are Plan 02-02.)
</success_criteria>

<output>
After completion, create `.planning/phases/02-shared-components-card-destinations-seo/02-03-SUMMARY.md`.
</output>
</content>
</invoke>
