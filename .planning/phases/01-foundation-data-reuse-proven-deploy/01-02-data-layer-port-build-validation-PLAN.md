---
phase: 01-foundation-data-reuse-proven-deploy
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/lib/data/categories.ts
  - src/lib/data/schema.ts
  - src/lib/data/videos.ts
  - src/lib/data/index.ts
  - src/lib/data/videos.json
  - src/lib/data/categories.test.ts
  - src/lib/data/schema.test.ts
  - src/lib/data/videos.test.ts
  - src/lib/data/videos.json.test.ts
  - src/lib/index.ts
  - vite.config.ts
  - vitest-setup-ui.ts
autonomous: true
requirements: [DATA-01, DATA-02, DATA-03, DATA-04]
must_haves:
  truths:
    - "videos.json parses with 56 records across the 8 canonical categories"
    - "An invalid record (bad category, missing required field, duplicate (source,id)) fails `pnpm build` with a row-pointing error, not the browser"
    - "The typed loader returns videos by id, by category, and categories in display order (count-descending, ties-alpha)"
    - "Every video record carries a non-empty thumbnail URL referenced via a reserved 16:9 box downstream (no CLS)"
  artifacts:
    - path: "src/lib/data/videos.json"
      provides: "56-video curated dataset (Vimeo + YouTube), 8 categories"
      contains: "\"source\""
    - path: "src/lib/data/schema.ts"
      provides: "Zod 4 VideoSchema (discriminatedUnion on source, strictObject) + VideoArraySchema"
      contains: "discriminatedUnion"
    - path: "src/lib/data/videos.ts"
      provides: "typed loader: getById, getByCategory, getCategoriesInDisplayOrder, getCategoriesWithCounts, producerReelId"
      exports: ["videos", "getById", "getByCategory", "getCategoriesInDisplayOrder", "getCategoriesWithCounts", "producerReelId"]
    - path: "src/lib/data/index.ts"
      provides: "single $lib/data public barrel"
      contains: "export"
    - path: "vite.config.ts"
      provides: "validateVideosPlugin fails build on schema violation or dup (source,id)"
      contains: "validateVideosPlugin"
  key_links:
    - from: "vite.config.ts"
      to: "src/lib/data/schema.ts"
      via: "import { VideoArraySchema } in validateVideosPlugin"
      pattern: "VideoArraySchema"
    - from: "src/lib/data/videos.ts"
      to: "src/lib/data/videos.json"
      via: "VideoArraySchema.parse(rawVideos)"
      pattern: "VideoArraySchema\\.parse"
    - from: "src/lib/data/index.ts"
      to: "src/lib/data/videos.ts"
      via: "barrel re-export"
      pattern: "from './videos'"
---

<objective>
Port the validated 56-video data layer from `michelle_ngo_four` verbatim — Zod schema, category taxonomy, typed loader, the dataset itself — and re-enable build-time validation so a bad record fails `pnpm build` rather than reaching the browser.

Purpose: Every later route reads `$lib/data`. This is a near-verbatim port of shipped, test-covered v4 code — the fastest, lowest-risk path to a content-complete data layer. Re-installing `validateVideosPlugin` into vite.config.ts is what enforces DATA-02 at build time (defense in depth alongside vitest).

Output: A typed, Zod-validated `$lib/data` barrel exposing the loader API, with the build aborting on invalid data.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/research/ARCHITECTURE.md
@.planning/research/PITFALLS.md

# PORT SOURCE — copy VERBATIM from this shipped sibling:
# C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/

<interfaces>
<!-- The exact $lib/data public surface (port index.ts verbatim). -->

src/lib/data/index.ts re-exports:
  type Video        (from ./schema)
  type Category     (from ./categories)
  CATEGORIES, categoryToSlug, slugToCategory   (from ./categories)
  videos, producerReelId, getById, getByCategory,
  getCategoriesInDisplayOrder, getCategoriesWithCounts   (from ./videos)

Video record shape (Zod, strictObject, discriminatedUnion on `source`):
  source: 'youtube' | 'vimeo'
  id, title, uploader: non-empty string
  published: z.iso.date()  (YYYY-MM-DD)
  thumbnail, embed: z.url()   (thumbnail is the per-video poster — DATA-04)
  url?: z.url()
  category: z.enum(CATEGORIES)
  description?, duration_seconds?(int>0)
  featured: default false, hidden: default false, tags: default []
  credits?: { director?, producer?, agency?, dop? }

producerReelId = '264677021' (Vimeo) — stays in the public `videos` array.
getCategoriesInDisplayOrder(): count-desc, ties-alpha (D-04).

vite.config.ts validateVideosPlugin (port verbatim, runs in buildStart):
  - VideoArraySchema.safeParse(JSON.parse(videos.json)) → this.error(z.prettifyError(...)) on failure
  - cross-row (source,id) uniqueness → this.error on duplicate
  Plugin order: [tailwindcss(), validateVideosPlugin(), sveltekit()]
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Port the data layer files + dataset verbatim</name>
  <files>src/lib/data/categories.ts, src/lib/data/schema.ts, src/lib/data/videos.ts, src/lib/data/index.ts, src/lib/data/videos.json, src/lib/index.ts</files>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/lib/data/categories.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/lib/data/schema.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/lib/data/videos.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/lib/data/index.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/lib/data/videos.json
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/lib/index.ts
  </read_first>
  <action>
    COPY these files VERBATIM (use `cp`, no edits — they are framework-agnostic and have zero base-path/repo-name coupling) from michelle_ngo_four into michelle_ngo_five at the same relative paths:
      - src/lib/data/categories.ts
      - src/lib/data/schema.ts
      - src/lib/data/videos.ts
      - src/lib/data/index.ts
      - src/lib/data/videos.json   (the 56-record dataset)
      - src/lib/index.ts           (if present — the $lib root barrel)

    Do NOT modify the dataset content. Do NOT change category names or slugs. Do NOT strip the reel video (id 264677021 stays in the public set).

    After copying, sanity-check the dataset count and category coverage (DATA-01):
      - exactly 56 records
      - every record's `category` is one of the 8 in CATEGORIES
      - every record has a non-empty `thumbnail` URL (DATA-04 — the per-video poster)
  </action>
  <acceptance_criteria>
    - `node -e "const v=require('./src/lib/data/videos.json'); if(v.length!==56) process.exit(1)"` (exit 0 — 56 records)
    - `node -e "const v=require('./src/lib/data/videos.json'); const ok=v.every(x=>x.thumbnail&&x.thumbnail.length>0); process.exit(ok?0:1)"` (exit 0 — thumbnail present on every record, DATA-04)
    - `node -e "const v=require('./src/lib/data/videos.json'); const C=new Set(['PBS American Portrait','Promos & Trailers','Branded Content','Documentary / Short Film','Reel','Personal / Tribute','Educational / Nonprofit','Other']); process.exit(v.every(x=>C.has(x.category))?0:1)"` (exit 0 — every category canonical)
    - `grep -q "discriminatedUnion" src/lib/data/schema.ts && grep -q "z.iso.date()" src/lib/data/schema.ts` (exit 0)
    - `grep -q "getCategoriesInDisplayOrder" src/lib/data/index.ts && grep -q "producerReelId" src/lib/data/index.ts` (exit 0 — barrel surface intact)
    - `grep -q "264677021" src/lib/data/videos.ts` (exit 0 — reel id preserved)
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && node -e "const v=require('./src/lib/data/videos.json'); if(v.length!==56||!v.every(x=>x.thumbnail))process.exit(1)" && grep -q "getCategoriesInDisplayOrder" src/lib/data/index.ts && echo OK</automated>
  </verify>
  <done>categories.ts, schema.ts, videos.ts, index.ts, videos.json (56 records, all canonical categories, all with thumbnails) ported verbatim; barrel exports + reel id intact.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Re-enable build-time validation (vite plugin) + port data tests</name>
  <files>vite.config.ts, vitest-setup-ui.ts, src/lib/data/categories.test.ts, src/lib/data/schema.test.ts, src/lib/data/videos.test.ts, src/lib/data/videos.json.test.ts</files>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/vite.config.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/vitest-setup-ui.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/lib/data/categories.test.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/lib/data/schema.test.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/lib/data/videos.test.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/lib/data/videos.json.test.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five/vite.config.ts (current Phase-1 subset from Plan 01)
  </read_first>
  <behavior>
    - A valid 56-record videos.json passes validation and `pnpm build` succeeds.
    - A record with an unknown category fails the build with a row-pointing prettify error (DATA-02).
    - A missing required field (e.g. title) fails the build (DATA-02).
    - A duplicate (source,id) pair fails the build via the plugin's cross-row check (DATA-02).
    - getById returns the matching Video or undefined; getByCategory filters correctly; getCategoriesInDisplayOrder returns count-desc/ties-alpha (DATA-03).
  </behavior>
  <action>
    1. REPLACE the Phase-1-subset `vite.config.ts` (from Plan 01) with the sibling's FULL vite.config.ts VERBATIM — it adds `validateVideosPlugin()` (buildStart → VideoArraySchema.safeParse + (source,id) uniqueness, this.error(z.prettifyError(...))) into the plugin array as `[tailwindcss(), validateVideosPlugin(), sveltekit()]`, and adds the vitest two-project (`data` node / `ui` jsdom) `projects` block. The sibling file has no repo-name or base-path coupling — copy as-is.

    2. Copy `vitest-setup-ui.ts` VERBATIM (referenced by the ui vitest project).

    3. Copy the four data test files VERBATIM:
       - src/lib/data/categories.test.ts
       - src/lib/data/schema.test.ts
       - src/lib/data/videos.test.ts
       - src/lib/data/videos.json.test.ts

    4. Run the data tests and a build to prove green:
       - `pnpm test:data` passes
       - `pnpm build` (default base) exits 0 (plugin validated the dataset)

    5. Prove the validation FAILS the build on bad data (DATA-02) WITHOUT committing a broken dataset:
       - Make a temp copy: `cp src/lib/data/videos.json /tmp/videos.bak.json`
       - Corrupt one record's category to an invalid value (e.g. via `node` writing a bad copy), run `pnpm build`, confirm NON-zero exit and a schema error mentioning the row.
       - Restore: `cp /tmp/videos.bak.json src/lib/data/videos.json` and confirm `pnpm build` is green again.
  </action>
  <acceptance_criteria>
    - `grep -q "validateVideosPlugin" vite.config.ts && grep -q "VideoArraySchema" vite.config.ts && grep -q "duplicate (source, id)" vite.config.ts` (exit 0)
    - `grep -q "tailwindcss(), validateVideosPlugin(), sveltekit()" vite.config.ts` (exit 0 — correct plugin order)
    - `pnpm test:data` exits 0
    - `pnpm build` exits 0 with the valid dataset
    - With a deliberately-corrupted category, `pnpm build` exits NON-zero and stderr/stdout contains a Zod validation message (DATA-02 proven); dataset then restored and `pnpm build` exits 0 again
    - `test -f vitest-setup-ui.ts && test -f src/lib/data/schema.test.ts` (exit 0)
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && grep -q "tailwindcss(), validateVideosPlugin(), sveltekit()" vite.config.ts && pnpm test:data && pnpm build && echo OK</automated>
  </verify>
  <done>validateVideosPlugin + vitest projects restored in vite.config.ts; data tests pass; valid build green; corrupting a record demonstrably fails the build with a row-pointing Zod error, then restores green.</done>
</task>

</tasks>

<verification>
- videos.json has exactly 56 records, all in the 8 canonical categories, all with a non-empty thumbnail (DATA-01, DATA-04).
- `$lib/data` barrel exposes getById / getByCategory / getCategoriesInDisplayOrder / getCategoriesWithCounts / producerReelId (DATA-03).
- `pnpm build` validates the dataset at buildStart; an invalid record fails the build with a prettify error; a duplicate (source,id) fails the build (DATA-02).
- `pnpm test:data` passes.
</verification>

<success_criteria>
A typed, Zod-validated `$lib/data` layer ported verbatim from v4 (56 records, 8 categories, full loader API), with build-time validation re-enabled in vite.config.ts so bad data fails `pnpm build` rather than the browser.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-data-reuse-proven-deploy/01-02-SUMMARY.md`.
</output>
