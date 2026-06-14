---
phase: 02-shared-components-card-destinations-seo
plan: 02
type: execute
wave: 2
depends_on: [01]
autonomous: true
requirements: [WATCH-01, WATCH-02, WATCH-03, WATCH-04, SEO-02]
files_modified:
  - src/lib/components/WatchPlayer.svelte
  - src/lib/components/WatchPlayer.test.ts
  - src/routes/watch/[id]/+page.ts
  - src/routes/watch/[id]/+page.svelte
  - src/routes/watch/[id]/page.test.ts
must_haves:
  truths:
    - "All 56 videos have a deep-linkable /watch/[id] page that prerenders to its own index.html"
    - "The watch page shows the correct embed via a click-to-load FACADE: a poster thumbnail with a play button; the iframe mounts only after the user clicks (no autoplay-with-sound, never an eager iframe)"
    - "Each watch page shows title, accent CategoryTag (linking to its /work/[category]), uploader · year, and description (when present)"
    - "Each watch page shows a 'More in {category} →' rail of sibling videos (hidden when empty), heading links to /work/[category]"
    - "Each watch page emits VideoObject JSON-LD with name, description, thumbnailUrl, uploadDate, and embedUrl"
  artifacts:
    - path: "src/lib/components/WatchPlayer.svelte"
      provides: "Click-to-load facade wrapper: poster + play button mounts the iframe on click"
      contains: "aspect-video"
    - path: "src/routes/watch/[id]/+page.ts"
      provides: "entries() over all 56 ids + load() returning {video, rail}"
      contains: "EntryGenerator"
    - path: "src/routes/watch/[id]/+page.svelte"
      provides: "Watch page composing facade + metadata + sibling rail + VideoObject JSON-LD"
      contains: "VideoObject"
  key_links:
    - from: "src/routes/watch/[id]/+page.ts"
      to: "$lib/data videos"
      via: "entries() maps every video id"
      pattern: "videos.map"
    - from: "src/routes/watch/[id]/+page.svelte"
      to: "WatchPlayer facade"
      via: "click mounts iframe with video.embed"
      pattern: "WatchPlayer"
    - from: "src/routes/watch/[id]/+page.svelte"
      to: "VideoObject JSON-LD"
      via: "ld+json script with embedUrl/thumbnailUrl/uploadDate"
      pattern: "application/ld"
---

<objective>
Build the deep-linkable `/watch/[id]` page for all 56 videos: a click-to-load facade embed (the WATCH-02 improvement over v4's eager iframe), full metadata, a same-category "more in this category" rail, and VideoObject JSON-LD per page. Prerenders exactly 56 pages via `entries()`.

Purpose: This is the primary card destination — every VideoCard links here. v4 ships almost all of this verbatim EXCEPT the embed: v4 mounts the iframe eagerly (its D-33 explicitly chose "no facade"). v5's WATCH-02 requires a click-to-load facade so the page mounts zero iframes until the user clicks, capping the live-iframe budget at 1-on-demand.
Output: a WatchPlayer facade component + the watch route (load, page, tests).
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
Port/adapt FROM the shipped sibling:
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/watch/[id]/+page.ts (entries() + load — port VERBATIM)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/watch/[id]/+page.svelte (port metadata + rail + JSON-LD; REPLACE the eager iframe block with the facade)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/watch/[id]/page.test.ts
WATCH-02 IMPROVEMENT: v4's +page.svelte mounts an iframe directly inside the aspect-video box (header comment "D-33 — direct iframe embed ... no facade"). v5 MUST instead render a poster facade that mounts the iframe only on click.
</port_source>

<interfaces>
From '$lib/data' (already exists):
  videos: readonly Video[]          // entries() source — 56 ids
  getById(id): Video | undefined     // narrow with `if (!video) error(404)`
  getByCategory(category): readonly Video[]
  categoryToSlug(category): string
Video shape (videos.json validated): id, source ('vimeo'|'youtube'), title, uploader,
  published (ISO date), description?, category, thumbnail (remote URL), embed (player URL),
  featured, hidden, tags, duration_seconds?

From Plan 02-01 (Wave 1, available now):
  VideoCard.svelte  (rail cards), CategoryTag.svelte (accent chip, link form via href prop)

Base-path invariant: internal hrefs via `${base}` from '$app/paths'.
adapter-static strict:true → /watch/[id] MUST export entries() or the build fails.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Build the WatchPlayer click-to-load facade component (WATCH-02)</name>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/watch/[id]/+page.svelte (the v4 eager-iframe block being replaced, around the max-w-5xl player container)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_five/src/lib/components/VideoCard.svelte (for the reserved-box + focus-ring idiom to mirror)
    - .planning/research/PITFALLS.md (Pitfall 4: facade; Pitfall 9: reserved dimensions; Pitfall 10: focus ring on dark)
  </read_first>
  <behavior>
    - Renders an aspect-video reserved box (no CLS) with the poster img (src=thumbnail, alt=title) and a centered, >=44px, aria-labelled play button while NOT activated.
    - Before click: the DOM contains NO iframe (facade only). Test asserts the iframe is absent on initial render.
    - After the play button is clicked: an iframe (src=embed, title=title, allow includes fullscreen, allowfullscreen) is mounted filling the box, and the poster/button are removed. Because mounting is user-initiated, autoplay in the iframe allow-list is acceptable (no longer "autoplay-with-sound on load"); the facade itself never autoplays.
    - The play button has a visible focus-visible ring (reuse app.css ring) and an accessible label like "Play {title}".
    - Props: embed (string), thumbnail (string), title (string).
  </behavior>
  <action>
    Create src/lib/components/WatchPlayer.svelte as a Svelte 5 runes component. State: let activated = $state(false). Markup outline:
      A relative aspect-video bg-neutral-900 box.
      When NOT activated: poster img (absolute inset-0 h-full w-full object-cover) + an absolutely-centered button (type="button", aria-label=`Play ${title}`, onclick sets activated=true, classes include the app.css focus-visible ring and a >=44px hit area) containing a play triangle (inline SVG or a glyph) over a dark/scrim circle for AA contrast.
      When activated: iframe (src=embed, title=title, allow="autoplay; encrypted-media; picture-in-picture; fullscreen", allowfullscreen, class absolute inset-0 w-full h-full border-0).
    Do NOT add loading="lazy" to the iframe (created on demand, already deferred). Use embed/thumbnail as-is from videos.json.

    Write src/lib/components/WatchPlayer.test.ts (jsdom) asserting: (a) initial render has a play button and NO iframe; (b) after clicking the button, an iframe with the given embed src appears; (c) the play button exposes an accessible name containing the title.

    prettier --write both files.
  </action>
  <acceptance_criteria>
    - File exists: `test -f src/lib/components/WatchPlayer.svelte` (exit 0)
    - Reserved box present: `grep -q "aspect-video" src/lib/components/WatchPlayer.svelte` (exit 0)
    - Facade is gated (iframe only when activated): `grep -q "activated" src/lib/components/WatchPlayer.svelte` (exit 0)
    - Play affordance is a real labelled button: `grep -q "aria-label" src/lib/components/WatchPlayer.svelte` (exit 0)
    - Tests pass (incl. "no iframe before click"): `pnpm exec vitest run src/lib/components/WatchPlayer.test.ts` exits 0
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest run src/lib/components/WatchPlayer.test.ts</automated>
  </verify>
  <done>A reusable facade exists: poster + play button by default, iframe mounted only on click; zero live iframes until interaction; keyboard-operable and AA-visible on dark.</done>
</task>

<task type="auto">
  <name>Task 2: Watch route — entries() (56), load {video,rail}, page with facade + metadata + rail + VideoObject JSON-LD</name>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/watch/[id]/+page.ts (port verbatim)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/watch/[id]/+page.svelte (port metadata/rail/JSON-LD; swap iframe to facade)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/watch/[id]/page.test.ts
    - src/lib/components/WatchPlayer.svelte (Task 1 output)
    - src/lib/components/VideoCard.svelte, src/lib/components/CategoryTag.svelte (Plan 02-01)
  </read_first>
  <action>
    Copy +page.ts VERBATIM into src/routes/watch/[id]/+page.ts: entries() = videos.map((v) => ({ id: v.id })), and the load that narrows getById(params.id) (error(404) when missing) and computes the same-category rail (exclude current id, sort featured-first then published desc). Returns { video, rail }.

    Create src/routes/watch/[id]/+page.svelte by porting v4's, with ONE change — the player:
      - Import WatchPlayer. Replace the v4 player div (relative aspect-video wrapper containing the iframe) with `<WatchPlayer embed={video.embed} thumbnail={video.thumbnail} title={video.title} />` inside the max-w-5xl container.
      - Keep the metadata block VERBATIM: h1 {video.title}, interactive CategoryTag with href={`${base}/work/${categorySlug}`}, p {video.uploader} · {year} (year = published.slice(0,4)), optional description (whitespace-pre-line), and the PBS cross-link `${base}/pbs-american-portrait/` when category is PBS.
      - Keep the rail VERBATIM: {#if rail.length > 0} section, h2 with a link href={`${base}/work/${categorySlug}`} "More in {video.category} ->", grid of VideoCard. Hidden when empty.
      - Keep the svelte:head: per-page title {video.title} — Michelle Ngo, meta description, and the VideoObject JSON-LD {@html} script. SEO-02 requires name, description, thumbnailUrl, uploadDate, embedUrl present (v4 already emits all five; keep duration conditional). ADD a per-page canonical link href={`https://michellengo.net/watch/${video.id}/`} (absolute production host, NOT base-relative — Pitfall 11).
    Keep v4's eslint-disable header comments (no-navigation-without-resolve, no-at-html-tags) — same project idiom.

    Port page.test.ts; adapt any assertion that checked for the eager iframe to instead assert the facade (WatchPlayer present; no iframe in the page markup until interaction) and that VideoObject JSON-LD contains embedUrl + thumbnailUrl + uploadDate. Do NOT weaken the entries()-count or 404 assertions.
    prettier --write all touched files.
  </action>
  <acceptance_criteria>
    - entries() enumerates all videos: `grep -q "videos.map" src/routes/watch/[id]/+page.ts` (exit 0)
    - Page uses the facade, not a raw iframe: `grep -q "WatchPlayer" src/routes/watch/[id]/+page.svelte` AND `! grep -q "<iframe" src/routes/watch/[id]/+page.svelte` (the iframe now lives only inside WatchPlayer)
    - VideoObject JSON-LD with required fields: `grep -q "VideoObject" src/routes/watch/[id]/+page.svelte && grep -q "embedUrl" src/routes/watch/[id]/+page.svelte && grep -q "thumbnailUrl" src/routes/watch/[id]/+page.svelte && grep -q "uploadDate" src/routes/watch/[id]/+page.svelte` (exit 0)
    - Canonical absolute host: `grep -q 'rel="canonical"' src/routes/watch/[id]/+page.svelte` (exit 0)
    - Sibling rail present: `grep -q "More in" src/routes/watch/[id]/+page.svelte && grep -q "VideoCard" src/routes/watch/[id]/+page.svelte` (exit 0)
    - No leading-slash local hrefs: `! grep -nE 'href="/[a-z]' src/routes/watch/[id]/+page.svelte` (exit 0)
    - Build prerenders exactly 56 watch pages: `MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build` exits 0 AND `find build/watch -name index.html | wc -l` == 56
    - Build emits 56 VideoObject blocks: `grep -rl 'VideoObject' build/watch | wc -l` == 56
    - Route tests pass: `pnpm exec vitest run src/routes/watch/[id]/page.test.ts` exits 0
    - `pnpm check` 0 errors
  </acceptance_criteria>
  <verify>
    <automated>MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build && test "$(find build/watch -name index.html | wc -l)" -eq 56 && pnpm exec vitest run src/routes/watch/[id]/page.test.ts</automated>
  </verify>
  <done>All 56 /watch/[id] pages prerender with a click-to-load facade (zero iframes until click), full metadata, a same-category rail, VideoObject JSON-LD (name/description/thumbnailUrl/uploadDate/embedUrl), and an absolute canonical; build green base-path-safe.</done>
</task>

</tasks>

<verification>
- `MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build` exits 0; `find build/watch -name index.html | wc -l` == 56; `grep -rl 'VideoObject' build/watch | wc -l` == 56.
- The page markup has no `<iframe>` literal (it lives only inside WatchPlayer); WatchPlayer renders no iframe until its play button is clicked (test-proven).
- No `href="/..."` leading-slash literals in the watch route or WatchPlayer.
- `pnpm check` 0 errors; `pnpm test` green for WatchPlayer + watch route.
</verification>

<success_criteria>
- WATCH-01: 56 deep-linkable /watch/[id] pages prerender (entries()-driven, not crawl-driven).
- WATCH-02: embed is a click-to-load facade — zero live iframes on load, never autoplay-with-sound.
- WATCH-03: title, accent category (linking to /work/[category]), uploader · year, description shown.
- WATCH-04: "more in this category" rail of siblings (hidden when empty).
- SEO-02: VideoObject JSON-LD with name, description, thumbnailUrl, uploadDate, embedUrl on every watch page.
</success_criteria>

<output>
After completion, create `.planning/phases/02-shared-components-card-destinations-seo/02-02-SUMMARY.md`.
</output>
