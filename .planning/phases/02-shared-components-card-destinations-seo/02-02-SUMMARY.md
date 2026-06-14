---
phase: 02-shared-components-card-destinations-seo
plan: 02
subsystem: watch-pages
tags: [watch, facade, seo, json-ld, prerender, a11y]
requires:
  - "$lib/data (videos, getById, getByCategory, categoryToSlug, producerReelId)"
  - "VideoCard.svelte, CategoryTag.svelte (Plan 02-01)"
provides:
  - "WatchPlayer.svelte — reusable click-to-load facade (poster + play button → iframe on click)"
  - "/watch/[id] route — 56 prerendered deep-linkable watch pages"
  - "VideoObject JSON-LD per watch page (SEO-02)"
affects:
  - "Every VideoCard destination now resolves (the primary card target)"
  - "PBS landing (Plan owns /pbs-american-portrait) is cross-linked from PBS watch pages"
tech-stack:
  added: []
  patterns:
    - "Facade gate via Svelte 5 rune: let activated = $state(false); iframe only rendered when activated"
    - "Per-page absolute canonical (production host) decoupled from base — Pitfall 11"
    - "entries() over the full dataset for deterministic prerender coverage — Pitfall 3"
key-files:
  created:
    - src/lib/components/WatchPlayer.svelte
    - src/lib/components/WatchPlayer.test.ts
    - src/routes/watch/[id]/+page.ts
    - src/routes/watch/[id]/+page.svelte
    - src/routes/watch/[id]/page.test.ts
  modified: []
decisions:
  - "WATCH-02 facade replaces v4's eager iframe: the watch page mounts ZERO live iframes until the user clicks play (proven: 0 of 56 prerendered index.html contain <iframe>)"
  - "JSON-LD description falls back to title on EMPTY string (|| not ??) so reel/short videos with no description still emit a non-empty VideoObject description"
  - "Player <article> renders no <iframe> literal at all; the iframe lives only inside WatchPlayer, gated by activated state"
metrics:
  duration_min: 14
  tasks: 2
  files: 5
  completed: 2026-06-14
---

# Phase 2 Plan 02: Watch Pages + Click-to-Load Facade + VideoObject JSON-LD Summary

Built the deep-linkable `/watch/[id]` page for all 56 videos with a click-to-load facade embed (the WATCH-02 improvement over v4's eager iframe), full metadata, a same-category "more in this category" rail, and VideoObject JSON-LD per page — prerendering exactly 56 pages via `entries()`.

## What Was Built

**Task 1 — WatchPlayer facade (WATCH-02, TDD):** `WatchPlayer.svelte` is a Svelte 5 runes component that renders a reserved 16:9 `aspect-video` box with the poster `<img>` + a centered, ≥44px, `aria-label="Play {title}"` button while not activated. Clicking sets `activated = $state(false) → true`, which mounts the embed `<iframe>` (`allow` includes `fullscreen`/`autoplay`, `allowfullscreen`) filling the box and removes the poster/button. The play button inherits app.css's high-contrast `:focus-visible` ring (light outline + dark halo) so it is keyboard-operable and AA-visible on the near-black canvas and over bright posters. Written test-first: RED proved the missing component, GREEN proved (a) no iframe on initial render, (b) iframe with the embed src appears after click, (c) accessible name contains the title.

**Task 2 — Watch route:** `+page.ts` ports v4 verbatim — `entries() = videos.map((v) => ({ id: v.id }))` (56 entries) and a narrowed `load()` that `error(404)`s on unknown ids and computes the same-category rail (current id excluded, featured-first then published desc). `+page.svelte` composes the WatchPlayer facade inside the `max-w-5xl` container, the WATCH-03 metadata block (h1 title, interactive CategoryTag → `/work/[slug]`, uploader · year, optional whitespace-pre-line description, PBS cross-link), the WATCH-04 sibling rail (heading-is-link, VideoCard 2/3/4 grid, hidden when empty), and the `<svelte:head>` with per-page title/description, an **absolute** production-host canonical, and the SEO-02 VideoObject JSON-LD.

## Verification Results

- `pnpm check`: **0 errors, 0 warnings** (430 files).
- `pnpm exec vitest run`: **123 passed (13 files)** — incl. 5 WatchPlayer + 16 watch-route tests.
- `MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build`: **exits 0**.
- `find build/watch -name index.html | wc -l` = **56**.
- `grep -rl 'VideoObject' build/watch | wc -l` = **56**.
- Built JSON-LD sample (`build/watch/264677021/index.html`): `{"@type":"VideoObject","name":...,"description":...,"thumbnailUrl":...,"uploadDate":"2018-04-13","embedUrl":"https://player.vimeo.com/video/264677021","duration":"PT0M52S"}` — all five SEO-02 fields present.
- **Facade proof:** `grep -l '<iframe' build/watch/*/index.html | wc -l` = **0** — no prerendered watch page contains an iframe until the user clicks play.
- No leading-slash local hrefs in `+page.svelte` or `WatchPlayer.svelte`.
- No `<iframe` literal anywhere in `+page.svelte` (the embed frame lives only inside WatchPlayer).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Empty-string description produced an empty VideoObject/JSON-LD `description`**
- **Found during:** Task 2 (SEO-02 JSON-LD test on the producer reel, whose `description` is `""`).
- **Issue:** v4's payload used `description: video.description ?? video.title`. `??` only catches null/undefined, so an empty-string description (e.g. the reel) emitted `description: ""` — an invalid/useless VideoObject field that fails the rich-results intent.
- **Fix:** Changed to `video.description || video.title` so any falsy (empty) description falls back to the title. The `<meta name="description">` ternary already handled the empty case correctly.
- **Files modified:** `src/routes/watch/[id]/+page.svelte` (and the mirrored test expectation in `page.test.ts`).
- **Commit:** e9a582e

**2. [Rule 1 — Correctness] Reworded a comment so the iframe-literal assertion is unambiguous**
- **Found during:** Task 2 acceptance check (`! grep -q "<iframe" +page.svelte`).
- **Issue:** A doc comment originally contained the literal token `<iframe>` while explaining that the page renders none — this would trip the plan's `grep "<iframe"` acceptance gate as a false positive.
- **Fix:** Reworded the comment to say "embed frame" instead of the `<iframe` token. The page now contains zero `<iframe` literals; the iframe exists only inside WatchPlayer (gated by `activated`).
- **Files modified:** `src/routes/watch/[id]/+page.svelte`.
- **Commit:** e9a582e

## Known Stubs

None. The PBS cross-link target (`/pbs-american-portrait/`) and the rail/category target (`/work/[category]`) are owned by other plans in this phase/wave; the watch route links to them base-safely (svelte.config.js's scoped `prerender.handleHttpError` tolerance — added in wave 1, removed in wave 3 — keeps the strict prerenderer from 404ing on those not-yet-built routes). No data is stubbed; all 56 pages render real validated data.

## Self-Check: PASSED

- FOUND: src/lib/components/WatchPlayer.svelte
- FOUND: src/lib/components/WatchPlayer.test.ts
- FOUND: src/routes/watch/[id]/+page.ts
- FOUND: src/routes/watch/[id]/+page.svelte
- FOUND: src/routes/watch/[id]/page.test.ts
- FOUND commit: d885e7e (WatchPlayer facade)
- FOUND commit: e9a582e (watch route)
