---
phase: 01-foundation-data-reuse-proven-deploy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - pnpm-lock.yaml
  - pnpm-workspace.yaml
  - .npmrc
  - .nvmrc
  - .gitignore
  - .prettierrc
  - .prettierignore
  - eslint.config.js
  - tsconfig.json
  - svelte.config.js
  - vite.config.ts
  - src/app.html
  - src/app.css
  - src/routes/+layout.ts
  - src/routes/+layout.svelte
  - src/routes/+page.svelte
  - src/routes/+error.svelte
  - static/.nojekyll
  - static/CNAME
  - static/robots.txt
  - static/og-image.jpg
  - static/favicon.ico
  - static/favicon.png
  - static/favicon-16.png
  - static/favicon-32.png
  - static/favicon-192.png
  - static/favicon-512.png
  - static/apple-touch-icon.png
  - .github/workflows/deploy.yml
  - .github/workflows/deploy-production.yml
autonomous: true
requirements: [FND-01, FND-02, FND-03, FND-04, FND-05]
must_haves:
  truths:
    - "pnpm build prerenders cleanly with no errors and emits build/index.html and build/404.html"
    - "Every internal link and static asset reference goes through $app/paths base (no leading-slash absolute local URLs, no hardcoded https://wolfwdavid.github.io)"
    - "A push to main triggers the staging workflow which builds with BASE_PATH=/michelle_ngo_five and deploys to GitHub Pages"
    - "A manual production workflow builds with BASE_PATH='' and asserts build/CNAME (michellengo.net) exists before deploy"
    - ".nojekyll and a 404.html SPA fallback are present in the build output"
  artifacts:
    - path: "svelte.config.js"
      provides: "adapter-static (fallback 404.html, strict) + paths.base from BASE_PATH env"
      contains: "process.env.BASE_PATH"
    - path: "static/.nojekyll"
      provides: "Jekyll opt-out so _app/ assets serve on Pages"
    - path: "static/CNAME"
      provides: "apex domain persisted into every build"
      contains: "michellengo.net"
    - path: ".github/workflows/deploy.yml"
      provides: "staging deploy on push-to-main"
      contains: "BASE_PATH: /michelle_ngo_five"
    - path: ".github/workflows/deploy-production.yml"
      provides: "manual apex deploy with CNAME assertion"
      contains: "test -f build/CNAME"
    - path: "src/routes/+layout.svelte"
      provides: "base-path-safe chrome (favicons, OG, noindex) on every route"
      contains: "$app/paths"
  key_links:
    - from: "svelte.config.js"
      to: "process.env.BASE_PATH"
      via: "paths.base = process.env.BASE_PATH ?? ''"
      pattern: "process\\.env\\.BASE_PATH"
    - from: ".github/workflows/deploy.yml"
      to: "BASE_PATH staging value"
      via: "build env"
      pattern: "BASE_PATH:\\s*/michelle_ngo_five"
    - from: "src/routes/+layout.svelte"
      to: "static favicon/og assets"
      via: "{base}/ prefixed hrefs"
      pattern: "\\{base\\}/"
---

<objective>
Stand up a base-path-safe static SvelteKit scaffold ported from the shipped sibling `michelle_ngo_four`, and prove a green deploy to the GitHub Pages staging subpath at https://wolfwdavid.github.io/michelle_ngo_five/.

Purpose: Front-load the two riskiest pitfalls (base-path breakage, SPA 404 fallback) on a trivial placeholder page BEFORE any feature work — the cheapest place to catch them. Everything later in the project compiles against this config and links through `base`.

Output: A buildable, deployable scaffold (configs, app shell, minimal placeholder home, static assets, both deploy workflows) where `pnpm build` exits 0 and every asset/link is base-path-safe.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/research/STACK.md
@.planning/research/ARCHITECTURE.md
@.planning/research/PITFALLS.md

# PORT SOURCE — copy/adapt from this shipped sibling, do NOT hand-write:
# C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/

<interfaces>
<!-- Exact contracts/values the executor must hit. -->

svelte.config.js (port VERBATIM from michelle_ngo_four/svelte.config.js):
  adapter-static({ pages: 'build', assets: 'build', fallback: '404.html', precompress: false, strict: true })
  paths: { base: process.env.BASE_PATH ?? '' }

src/routes/+layout.ts (port VERBATIM from sibling):
  export const prerender = true;
  export const trailingSlash = 'always';   // → directory-shape <route>/index.html on Pages

vite.config.ts (PHASE-1 SUBSET — tailwind + sveltekit ONLY this plan):
  plugins: [tailwindcss(), sveltekit()]
  // NOTE: validateVideosPlugin and the vitest `projects` block are added in Plan 02
  // (which ports the data layer + schema the plugin imports). Do NOT add them here —
  // schema.ts does not exist yet.

Repo-name adaptations vs the sibling (sibling is michelle_ngo_four):
  - Staging URL  = https://wolfwdavid.github.io/michelle_ngo_five/
  - deploy.yml staging build env: BASE_PATH: /${{ github.event.repository.name }}  (resolves to /michelle_ngo_five) — keep the repo-name expression, do NOT hardcode
  - deploy-production.yml: BASE_PATH: '' and the CNAME-assertion step (test -f build/CNAME)
  - static/CNAME content = michellengo.net  (identical to sibling — copy verbatim)
  - package.json "name" = "michelle-ngo-five"
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Port toolchain config + static assets verbatim, rename for five</name>
  <files>package.json, pnpm-lock.yaml, pnpm-workspace.yaml, .npmrc, .nvmrc, .gitignore, .prettierrc, .prettierignore, eslint.config.js, tsconfig.json, svelte.config.js, src/app.html, static/.nojekyll, static/CNAME, static/robots.txt, static/og-image.jpg, static/favicon.ico, static/favicon.png, static/favicon-16.png, static/favicon-32.png, static/favicon-192.png, static/favicon-512.png, static/apple-touch-icon.png</files>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/package.json
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/svelte.config.js
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/tsconfig.json
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/.npmrc
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/eslint.config.js
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/app.html
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/static/ (CNAME, robots.txt, og-image.jpg, favicons, .nojekyll)
  </read_first>
  <action>
    COPY these files from michelle_ngo_four into michelle_ngo_five at the same relative paths (use `cp`, do not retype):
      - svelte.config.js (VERBATIM — already env-driven base path, no edit needed)
      - tsconfig.json, .npmrc, .nvmrc (.nvmrc already = 22), .gitignore, .prettierrc, .prettierignore, eslint.config.js, pnpm-workspace.yaml
      - pnpm-lock.yaml (VERBATIM — keeps the exact validated pin matrix for --frozen-lockfile)
      - src/app.html (VERBATIM)
      - static/.nojekyll, static/CNAME, static/robots.txt, static/og-image.jpg, and ALL favicons:
        favicon.ico, favicon.png, favicon-16.png, favicon-32.png, favicon-192.png, favicon-512.png, apple-touch-icon.png

    Then COPY package.json and edit ONLY two things:
      1. "name": "michelle-ngo-four" → "michelle-ngo-five"
      2. Remove the "test:build-fails"/"test:prerender" scripts that reference scripts/*.mjs not ported in this phase (or copy scripts/ too — your call; simplest is to drop those two script lines for now). Keep "dev", "build", "preview", "check", "test", "test:data", "lint", "format", "prepare".

    Keep the EXACT version pins from the sibling package.json (STACK.md confirms they are current; do NOT bump TypeScript to 6.x). Keep packageManager "pnpm@11.0.9" and engines node ">=22".

    Do NOT run pnpm install yet (the next task lands the build entry points first); install + build is verified in Task 3.
  </action>
  <acceptance_criteria>
    - `test -f svelte.config.js && grep -q "process.env.BASE_PATH" svelte.config.js` (exit 0)
    - `grep -q '"michelle-ngo-five"' package.json` (exit 0)
    - `grep -q '"@sveltejs/adapter-static": "3.0.10"' package.json && grep -q '"svelte": "5.55.5"' package.json && grep -q '"typescript": "5.9.3"' package.json` (exit 0 — pins preserved)
    - `test -f static/.nojekyll` (exit 0)
    - `grep -qx 'michellengo.net' static/CNAME` (exit 0)
    - `test -f static/favicon.ico && test -f static/og-image.jpg && test -f static/apple-touch-icon.png` (exit 0)
    - `test -f pnpm-lock.yaml && test -f tsconfig.json && test -f .npmrc && test -f eslint.config.js` (exit 0)
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && grep -q "process.env.BASE_PATH" svelte.config.js && grep -q '"michelle-ngo-five"' package.json && test -f static/.nojekyll && grep -qx 'michellengo.net' static/CNAME && echo OK</automated>
  </verify>
  <done>All toolchain config + static assets exist in five, package.json renamed, pins preserved, CNAME = michellengo.net, .nojekyll present.</done>
</task>

<task type="auto">
  <name>Task 2: Create base-path-safe app shell + minimal placeholder home (vite subset)</name>
  <files>vite.config.ts, src/app.css, src/routes/+layout.ts, src/routes/+layout.svelte, src/routes/+page.svelte, src/routes/+error.svelte</files>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/vite.config.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/routes/+layout.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/routes/+layout.svelte
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/routes/+error.svelte
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/app.css
  </read_first>
  <action>
    1. Create `vite.config.ts` as a PHASE-1 SUBSET (data plugin lands in Plan 02):
       ```ts
       import { sveltekit } from '@sveltejs/kit/vite';
       import { defineConfig } from 'vite';
       import tailwindcss from '@tailwindcss/vite';
       export default defineConfig({ plugins: [tailwindcss(), sveltekit()] });
       ```
       (Do NOT add validateVideosPlugin or the vitest `projects` block — they import schema.ts which Plan 02 creates.)

    2. Copy `src/routes/+layout.ts` VERBATIM from the sibling (prerender = true; trailingSlash = 'always').

    3. Create `src/app.css` as a MINIMAL placeholder for now: just `@import "tailwindcss";` plus a near-black body default so the placeholder renders dark. (The full dark token system + 8 OKLCH accents + focus ring is Plan 03, which OWNS and replaces this file — keep it tiny here so Plan 03 can overwrite cleanly.)
       ```css
       @import "tailwindcss";
       :root { color-scheme: dark; }
       body { background: oklch(0.16 0 0); color: oklch(0.97 0 0); }
       ```

    4. Create `src/routes/+layout.svelte` as base-path-safe chrome — ADAPT the sibling layout but DROP the TopNav/Footer imports (those leaf components are Phase 2). Keep:
       - `import '../app.css';` and `import { base } from '$app/paths';`
       - `<svelte:head>` with `<meta name="robots" content="noindex, nofollow" />`, `<title>Michelle Ngo</title>`, the full favicon link set (all hrefs MUST be `{base}/favicon*.png` etc.), and the sitewide OG/Twitter tags using `https://michellengo.net{base}/og-image.jpg`.
       - `{@render children()}` for the routed content. No TopNav/Footer this phase.

    5. Create a MINIMAL `src/routes/+page.svelte` placeholder home — a single dark hero-ish section with Michelle's wordmark text and a tagline, plus ONE internal `<a href="{base}/work/">` style link THAT IS base-prefixed (proves base-path link handling end-to-end). Real rails come in Phase 3. Import `{ base }` from `$app/paths`. No data imports.

    6. Copy `src/routes/+error.svelte` VERBATIM from the sibling (base-path-safe error page).

    CRITICAL (FND-02): every internal href and local asset reference in these files MUST be `{base}/...`. No leading-slash absolute local URLs. No hardcoded `https://wolfwdavid.github.io`.
  </action>
  <acceptance_criteria>
    - `test -f vite.config.ts && grep -q "tailwindcss()" vite.config.ts && grep -q "sveltekit()" vite.config.ts` (exit 0)
    - `! grep -q "validateVideosPlugin" vite.config.ts` (exit 0 — data plugin NOT added this phase)
    - `grep -q "prerender = true" src/routes/+layout.ts && grep -q "trailingSlash = 'always'" src/routes/+layout.ts` (exit 0)
    - `grep -q "noindex" src/routes/+layout.svelte && grep -q "\$app/paths" src/routes/+layout.svelte` (exit 0)
    - `grep -q "{base}/" src/routes/+page.svelte` (exit 0 — placeholder home uses a base-prefixed link)
    - `grep -rn "https://wolfwdavid.github.io" src/ ; test $? -ne 0` (exit 0 — NO hardcoded staging host in src)
    - `grep -rnE "href=\"/|src=\"/|url\\(/" src/ ; test $? -ne 0` (exit 0 — NO leading-slash absolute local refs in src)
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && grep -q "trailingSlash = 'always'" src/routes/+layout.ts && grep -q "\$app/paths" src/routes/+layout.svelte && ! grep -rq "https://wolfwdavid.github.io" src/ && echo OK</automated>
  </verify>
  <done>App shell (vite subset, +layout.ts/.svelte, minimal app.css, placeholder +page, +error) exists; all internal refs base-prefixed; no hardcoded host or leading-slash local URLs.</done>
</task>

<task type="auto">
  <name>Task 3: Port deploy workflows + prove green base-path build locally</name>
  <files>.github/workflows/deploy.yml, .github/workflows/deploy-production.yml</files>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/.github/workflows/deploy.yml
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/.github/workflows/deploy-production.yml
  </read_first>
  <action>
    1. Copy `.github/workflows/deploy.yml` from the sibling. It already uses `BASE_PATH: /${{ github.event.repository.name }}` (resolves to /michelle_ngo_five automatically — do NOT hardcode). Verify Node 22, pnpm 11.0.9, `pnpm install --frozen-lockfile`, upload-pages-artifact@v3, deploy-pages@v4, concurrency group pages. No edits expected beyond confirming it's the staging (push-to-main) workflow.

    2. Copy `.github/workflows/deploy-production.yml` from the sibling and ADAPT the comment block: the sibling comment references `BASE_PATH=/michelle_ngo_four` — update any michelle_ngo_four mention in comments to michelle_ngo_five. Keep the actual logic: `on: workflow_dispatch` only, `BASE_PATH: ''`, the "Verify CNAME in build artifact" step (`test -f build/CNAME`), upload + deploy.

    3. Install deps and prove the staging build is green AND base-path-correct:
       - `pnpm install --frozen-lockfile`
       - `BASE_PATH=/michelle_ngo_five pnpm build`
       - Confirm `build/index.html`, `build/404.html`, `build/.nojekyll`, `build/CNAME` all exist.
       - Confirm the emitted HTML references assets under `/michelle_ngo_five/` (base applied), e.g. `grep -rq "/michelle_ngo_five/_app" build/index.html`.

    4. Prove the apex build is green with empty base:
       - `BASE_PATH='' pnpm build`
       - Confirm `build/CNAME` still contains michellengo.net and `build/index.html` references `/_app` WITHOUT a `/michelle_ngo_five` prefix.
  </action>
  <acceptance_criteria>
    - `grep -q "BASE_PATH: /\${{ github.event.repository.name }}" .github/workflows/deploy.yml` (exit 0)
    - `grep -q "workflow_dispatch" .github/workflows/deploy-production.yml && grep -q "test -f build/CNAME" .github/workflows/deploy-production.yml` (exit 0)
    - `! grep -q "michelle_ngo_four" .github/workflows/deploy-production.yml` (exit 0 — sibling name scrubbed from comments)
    - `BASE_PATH=/michelle_ngo_five pnpm build` exits 0
    - `test -f build/index.html && test -f build/404.html && test -f build/.nojekyll && test -f build/CNAME` (exit 0)
    - `grep -q "/michelle_ngo_five/_app" build/index.html` (exit 0 — base path applied to assets)
    - `BASE_PATH='' pnpm build` exits 0 AND `grep -qx 'michellengo.net' build/CNAME` (exit 0)
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && pnpm install --frozen-lockfile && BASE_PATH=/michelle_ngo_five pnpm build && test -f build/index.html && test -f build/404.html && test -f build/.nojekyll && grep -q "/michelle_ngo_five/_app" build/index.html && echo OK</automated>
  </verify>
  <done>Both workflows ported (staging on push, production on dispatch with CNAME assertion, sibling name scrubbed); staging build green with /michelle_ngo_five/ asset prefix; apex build green with empty base + preserved CNAME; 404.html + .nojekyll present.</done>
</task>

</tasks>

<verification>
- `pnpm build` exits 0 under both `BASE_PATH=/michelle_ngo_five` and `BASE_PATH=''` (FND-01).
- Build output contains index.html, 404.html, .nojekyll, CNAME (FND-04, FND-05).
- Staging HTML prefixes assets with /michelle_ngo_five/ ; apex HTML does not (FND-02).
- `grep -rn "https://wolfwdavid.github.io" src/` returns nothing; `grep -rnE 'href="/|src="/|url\(/' src/` returns nothing (FND-02 guard).
- deploy.yml triggers on push to main; deploy-production.yml on workflow_dispatch only with the CNAME assertion (FND-03, FND-05).
</verification>

<success_criteria>
A base-path-safe static SvelteKit scaffold that builds green for both staging (/michelle_ngo_five) and apex ('') targets, with both GitHub Actions workflows present, .nojekyll + 404.html + CNAME in the output, and zero hardcoded/leading-slash local URLs in src/.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-data-reuse-proven-deploy/01-01-SUMMARY.md`.
</output>
