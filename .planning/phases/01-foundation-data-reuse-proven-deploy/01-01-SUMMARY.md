---
phase: 01-foundation-data-reuse-proven-deploy
plan: 01
subsystem: scaffold-config-proven-deploy
tags: [sveltekit, adapter-static, github-pages, base-path, deploy, tailwind]
requires: []
provides:
  - base-path-safe static SvelteKit scaffold (svelte.config.js env-driven BASE_PATH)
  - app shell (+layout.ts/.svelte, +page, +error, minimal app.css)
  - staging + production GitHub Actions deploy workflows
  - .nojekyll + 404.html SPA fallback + CNAME in build output
affects:
  - all later plans compile against this config and link through $app/paths base
tech-stack:
  added:
    - "@sveltejs/kit 2.59.1"
    - "svelte 5.55.5"
    - "@sveltejs/adapter-static 3.0.10"
    - "@tailwindcss/vite 4.3.0 + tailwindcss 4.3.0"
    - "vite 8.0.7"
    - "typescript 5.9.3"
    - "zod 4.4.3"
  patterns:
    - "paths.base = process.env.BASE_PATH ?? '' (env-driven base for staging vs apex)"
    - "trailingSlash='always' for directory-shape <route>/index.html on Pages"
    - "all local asset/link refs go through {base} from $app/paths (FND-02)"
    - "rel=external to keep a base-prefixed link out of the strict prerender crawl"
key-files:
  created:
    - package.json
    - pnpm-lock.yaml
    - svelte.config.js
    - vite.config.ts
    - tsconfig.json
    - eslint.config.js
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
  modified: []
decisions:
  - "Ported ~all toolchain config verbatim from shipped sibling michelle_ngo_four (lockfile included for --frozen-lockfile parity)"
  - "Placeholder home keeps a base-prefixed /work/ link as the FND-02 proof; rel=external stops the strict prerenderer 404ing on a Phase-3 route"
metrics:
  duration_min: 6
  tasks: 3
  files: 25
  completed: "2026-06-14T18:23:41Z"
---

# Phase 1 Plan 01: Scaffold + Config + Proven Deploy Summary

Base-path-safe static SvelteKit scaffold ported from the shipped sibling `michelle_ngo_four`, proving a green prerendered build for both the GitHub Pages staging subpath (`/michelle_ngo_five`) and the apex domain (`''`/michellengo.net), with both deploy workflows and a 404 SPA fallback in place.

## What Was Built

- **Toolchain config (Task 1):** Verbatim port of `svelte.config.js` (env-driven `paths.base`), `tsconfig.json`, `eslint.config.js`, `.prettierrc/.prettierignore`, `.npmrc`, `.nvmrc` (=22), `pnpm-workspace.yaml`, and `pnpm-lock.yaml` (for `--frozen-lockfile` parity). `package.json` renamed to `michelle-ngo-five`, dropping the two unported `test:build-fails`/`test:prerender` scripts. All STACK.md-validated version pins preserved (adapter-static 3.0.10, svelte 5.55.5, typescript 5.9.3). Static assets copied: `.nojekyll`, `CNAME` (michellengo.net), `robots.txt`, `og-image.jpg`, full favicon set.
- **App shell (Task 2):** `vite.config.ts` as a Phase-1 subset (`tailwindcss()` + `sveltekit()` only — the data-validation plugin + vitest projects block land in Plan 02). `+layout.ts` (prerender + `trailingSlash='always'`). Minimal `app.css` placeholder (Plan 03 owns/replaces the full token system). `+layout.svelte` with base-prefixed favicon/OG head and `noindex`, TopNav/Footer intentionally omitted (Phase 2). Placeholder `+page.svelte` home (dark hero + wordmark + one base-prefixed `/work/` link). Base-path-safe `+error.svelte`.
- **Deploy + build proof (Task 3):** `deploy.yml` (staging on push-to-main, `BASE_PATH=/${{ github.event.repository.name }}`) and `deploy-production.yml` (manual dispatch, `BASE_PATH=''`, `test -f build/CNAME` assertion, sibling name scrubbed from comments). Both builds proven green locally.

## Build Results

| Build target | Command | Result |
|---|---|---|
| Staging | `BASE_PATH=/michelle_ngo_five pnpm build` | exit 0 |
| Apex | `BASE_PATH='' pnpm build` | exit 0 |

Staging `build/` contains `index.html`, `404.html`, `.nojekyll`, `CNAME`. The SPA fallback `404.html` prefixes assets with `/michelle_ngo_five/_app` (base applied); the root `index.html` uses relative `./_app/...` refs (also base-safe) and embeds the `/michelle_ngo_five` base for runtime routing. Apex `404.html` uses `/_app` with no base prefix and `CNAME` still reads `michellengo.net`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] MSYS path-mangling rewrote BASE_PATH under Git Bash**
- **Found during:** Task 3 (local build proof on Windows)
- **Issue:** `BASE_PATH=/michelle_ngo_five` was rewritten by MSYS to `C:/Program Files/Git/michelle_ngo_five` before reaching Node, which SvelteKit rejected (`paths.base` must be root-relative). This is a Git-Bash-on-Windows artifact; CI runs on ubuntu-latest where it does not occur.
- **Fix:** Prefixed the local build invocations with `MSYS_NO_PATHCONV=1`. No source/config change — the workflows are unaffected (Linux runners).
- **Commit:** n/a (environment-only; build proof in 1927202)

**2. [Rule 3 - Blocking] Strict prerender 404'd on the placeholder /work/ link**
- **Found during:** Task 3 (staging build)
- **Issue:** The plan asks the placeholder home to carry a base-prefixed `{base}/work/` link as the FND-02 base-path proof, but `/work/` lands in Phase 3. With `adapter-static` `strict: true`, the prerender crawler followed the link, hit a 404, and failed the build.
- **Fix:** Added `rel="external"` to that single anchor so the crawler skips it while the link stays base-prefixed and visible in the HTML (FND-02 proof intact). A comment marks it to drop once `/work/` exists in Phase 3.
- **Files modified:** `src/routes/+page.svelte`
- **Commit:** 1927202

### Note on acceptance criterion `grep "/michelle_ngo_five/_app" build/index.html`

The plan's Task-3 criterion expected the absolute base prefix in the root `index.html`. SvelteKit's adapter-static idiomatically emits **relative** asset paths (`./_app/...`) in a prerendered page's `index.html`, and puts the **absolute** `/michelle_ngo_five/_app/...` paths in the SPA-fallback `404.html` (which must resolve from arbitrary deep URLs). The FND-02 intent — base correctly applied to assets — is fully satisfied: `404.html` carries the absolute base prefix and `index.html` embeds the `/michelle_ngo_five` base var. Verified by `grep -q "/michelle_ngo_five/_app" build/404.html` (exit 0).

## Tasks

| Task | Name | Commit | Key files |
|---|---|---|---|
| 1 | Port toolchain config + static assets | dafae6f | package.json, svelte.config.js, static/* |
| 2 | Base-path-safe app shell + placeholder home | 98319c6 | vite.config.ts, src/routes/+layout.{ts,svelte}, +page, +error, app.css |
| 3 | Deploy workflows + green base-path build | 1927202 | .github/workflows/deploy.yml, deploy-production.yml, +page.svelte (rel=external) |

## Known Stubs

- `src/app.css` is an intentional minimal placeholder (dark body default only). The full dark token system + 8 OKLCH per-category accents is owned by **Plan 03**, which will overwrite this file. Documented in the plan; not blocking.
- `src/routes/+page.svelte` is an intentional placeholder home. The real YouTube-style category rails + producer-reel hero land in **Phase 3**. The `/work/` link is `rel="external"` until that route exists.

## Self-Check: PASSED

All 12 key files verified on disk; all 3 task commits (dafae6f, 98319c6, 1927202) verified in git log.
