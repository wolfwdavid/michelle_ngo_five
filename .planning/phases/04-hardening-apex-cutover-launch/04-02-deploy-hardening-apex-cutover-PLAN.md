---
phase: 04-hardening-apex-cutover-launch
plan: 02
type: execute
wave: 2
depends_on: ["04-01"]
files_modified:
  - .github/workflows/deploy.yml
  - .github/workflows/deploy-production.yml
  - scripts/assert-prerender-count.mjs
  - package.json
  - .planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md
autonomous: false
requirements: [QUAL-01, QUAL-02, QUAL-03, QUAL-04]

must_haves:
  truths:
    - "Neither workflow references a deprecated Node-20 action major; all actions are bumped to current Node-24-compatible majors"
    - "deploy.yml runs a prerender-count guard that fails the build if the route count drifts from ~70 (56 watch + 8 category + static pages)"
    - "A production (apex) build with BASE_PATH='' exits 0 and build/CNAME == michellengo.net with relative (non-base-prefixed) assets"
    - "CUTOVER.md gives the EXACT registrar DNS records (4 GitHub Pages apex A IPs, AAAA, www CNAME) plus the post-DNS repo steps and verification"
    - "The actual DNS change + final apex HTTPS verification is a human-action checkpoint (Claude cannot touch the registrar)"
  artifacts:
    - path: "scripts/assert-prerender-count.mjs"
      provides: "CI guard counting prerendered watch/category/static HTML in build/"
      contains: "watch"
    - path: ".github/workflows/deploy.yml"
      provides: "Staging workflow with bumped actions + prerender-count step"
      contains: "assert-prerender-count"
    - path: ".github/workflows/deploy-production.yml"
      provides: "Apex workflow with bumped actions; BASE_PATH='' + CNAME verify"
      contains: "BASE_PATH"
    - path: ".planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md"
      provides: "Apex DNS + cutover runbook with exact records"
      contains: "185.199.108.153"
  key_links:
    - from: ".github/workflows/deploy.yml"
      to: "scripts/assert-prerender-count.mjs"
      via: "a Build step runs the guard after pnpm build, before upload-pages-artifact"
      pattern: "assert-prerender-count"
    - from: "CUTOVER.md"
      to: "GitHub Pages apex DNS (185.199.108-111.153 / AAAA 2606:50c0:8000::153 / www CNAME → wolfwdavid.github.io)"
      via: "exact A/AAAA/CNAME record table the user sets at the registrar"
      pattern: "2606:50c0:8000::153"
---

<objective>
Harden the two deploy workflows for launch and produce the apex-cutover runbook. Bump every deprecated Node-20-era GitHub Action to its current Node-24-compatible major in BOTH workflows; add a CI prerender-count guard to deploy.yml so a future content change can't silently drop routes; verify a production (apex) build is green and base-path-correct (BASE_PATH='' → relative assets, build/CNAME preserved as michellengo.net, sitemap already on the apex host); and write a CUTOVER.md runbook with the EXACT registrar DNS records and post-DNS steps. The actual DNS flip + final apex HTTPS verification is a human-action checkpoint — Claude does everything it can up to the registrar boundary.

Purpose: This is the launch gate. The workflows currently pin actions at Node-20 majors (checkout@v4, setup-node@v4, upload-pages-artifact@v3, deploy-pages@v4, pnpm/action-setup@v4) that GitHub is deprecating; an un-bumped action can fail a launch-day deploy. There is no guard against a content edit silently dropping a watch/category route (Pitfall 3). And the apex cutover (Pitfall 12) is the single highest-risk step in the whole project — it needs a verified base-'' build and an exact, foolproof DNS runbook.

Output: Two updated workflows, a `scripts/assert-prerender-count.mjs` guard wired into deploy.yml, a verified apex build, a `CUTOVER.md` runbook, and a human-action checkpoint for the DNS change.

Depends on 04-01 (wave 2) so deploy hardening lands after the quality gates are green — the launch artifact should already be a11y/perf-verified before the cutover runbook is handed over.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/research/PITFALLS.md

<interfaces>
<!-- Exact current state + exact target values. No exploration required. -->

Current .github/workflows/deploy.yml (staging) uses:
  actions/checkout@v4, actions/setup-node@v4 (node 22), pnpm/action-setup@v4 (version 11.0.9 standalone),
  actions/upload-pages-artifact@v3, actions/deploy-pages@v4. Build step sets BASE_PATH=/${{ github.event.repository.name }} and runs `pnpm build`.

Current .github/workflows/deploy-production.yml (apex, workflow_dispatch only) uses the SAME action majors, sets BASE_PATH='' , and already has a "Verify CNAME in build artifact" step (`test -f build/CNAME`).

EXACT target action majors (verified current, Node-24-compatible):
  actions/checkout@v6
  actions/setup-node@v6
  pnpm/action-setup@v6
  actions/upload-pages-artifact@v5
  actions/deploy-pages@v5
(Keep node-version: 22 in setup-node — the project targets Node 22 per .nvmrc; the ACTION bump is about the action runtime, not the Node it installs.)

Route inventory for the prerender-count guard (build/ after `pnpm build`, adapter-static shape `<dir>/index.html`):
  - build/watch/<id>/index.html  → 56 (one per video; entries() in src/routes/watch/[id]/+page.ts)
  - build/work/<slug>/index.html → 8 (one per category; 8 slugs derived in src/lib/data/categories.ts)
  - build/work/index.html → 1
  - build/pbs-american-portrait/index.html → 1
  - build/about/index.html, build/press/index.html, build/contact/index.html → 3
  - build/index.html (home) → 1
  Total directory-routes ≈ 70. The guard's load-bearing assertions are watch===56 and categories===8.
  Sibling reference (proven count script): C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_three/scripts/test-prerender-coverage.mjs

CNAME: static/CNAME contains `michellengo.net`. adapter-static copies static/ → build/, so build/CNAME is michellengo.net for BOTH builds (the production workflow already verifies it). Base path comes from `process.env.BASE_PATH ?? ''` in svelte.config.js, so an apex build with BASE_PATH unset/'' emits root-relative assets.

Sitemap (src/routes/sitemap.xml/+server.ts) already emits absolute `https://michellengo.net/...` URLs — apex-correct, no change needed.

GitHub Pages apex DNS (well-known, stable GitHub-published values):
  A    @  185.199.108.153
  A    @  185.199.109.153
  A    @  185.199.110.153
  A    @  185.199.111.153
  AAAA @  2606:50c0:8000::153
  AAAA @  2606:50c0:8001::153
  AAAA @  2606:50c0:8002::153
  AAAA @  2606:50c0:8003::153
  CNAME www  wolfwdavid.github.io
(Repo owner is GitHub user `wolfwdavid`; the Pages host for an apex is the user subdomain wolfwdavid.github.io.)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Bump deprecated actions in both workflows and add the prerender-count CI guard</name>
  <read_first>
    - .github/workflows/deploy.yml (current action pins + build step)
    - .github/workflows/deploy-production.yml (current pins + existing CNAME verify)
    - src/lib/data/categories.ts (8 category slugs — confirms the category count)
    - src/routes/watch/[id]/+page.ts (entries() → 56 watch pages)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_three/scripts/test-prerender-coverage.mjs (proven count-script pattern to port)
  </read_first>
  <action>
    1. In BOTH `.github/workflows/deploy.yml` and `.github/workflows/deploy-production.yml`, bump the action majors to the EXACT versions in <interfaces>:
       - `actions/checkout@v4` → `actions/checkout@v6`
       - `actions/setup-node@v4` → `actions/setup-node@v6` (keep `node-version: 22`)
       - `pnpm/action-setup@v4` → `pnpm/action-setup@v6` (keep `version: 11.0.9`, `standalone: true`)
       - `actions/upload-pages-artifact@v3` → `actions/upload-pages-artifact@v5`
       - `actions/deploy-pages@v4` → `actions/deploy-pages@v5`
       Change ONLY the version tags; leave every other line (env, with:, concurrency, permissions) untouched.
    2. Create `scripts/assert-prerender-count.mjs` by porting the sibling's coverage-count pattern. It must:
       - Resolve `build/` relative to the repo root; if missing, `console.error` and `process.exit(2)` ("run pnpm build first").
       - Count `build/watch/<id>/index.html` (expect EXACTLY 56), `build/work/<slug>/index.html` (expect EXACTLY 8, excluding the bare `build/work/index.html`), and assert presence of `build/work/index.html`, `build/pbs-american-portrait/index.html`, `build/about/index.html`, `build/press/index.html`, `build/contact/index.html`, `build/index.html`.
       - Print a table of actual vs expected counts.
       - `process.exit(1)` with a clear message if watch !== 56 OR categories !== 8 OR any required static page is missing; `process.exit(0)` otherwise. (Exact equality on watch/category — a content change that adds OR drops a route should trip the guard for review.)
    3. Add a package.json script: `"verify:prerender": "node scripts/assert-prerender-count.mjs"`.
    4. In `.github/workflows/deploy.yml` ONLY, add a step AFTER the `Build` step and BEFORE `Upload artifact`:
       ```
       - name: Assert prerender route count
         run: node scripts/assert-prerender-count.mjs
       ```
       (Staging is the push-to-main workflow, so the guard runs on every content change. Do NOT add it to the production workflow's critical path — though it may optionally be added there too; the load-bearing requirement is deploy.yml.)
    5. Locally prove the guard: `pnpm build && node scripts/assert-prerender-count.mjs` exits 0 against the real build.
  </action>
  <verify>
    <automated>pnpm build && node scripts/assert-prerender-count.mjs</automated>
  </verify>
  <acceptance_criteria>
    - Neither workflow contains a deprecated major: `! grep -Eq 'checkout@v4|setup-node@v4|action-setup@v4|upload-pages-artifact@v3|deploy-pages@v4' .github/workflows/deploy.yml .github/workflows/deploy-production.yml`
    - Both workflows contain the bumped majors: `grep -q 'checkout@v6' .github/workflows/deploy.yml` and same for setup-node@v6 / action-setup@v6 / upload-pages-artifact@v5 / deploy-pages@v5 in both files
    - `scripts/assert-prerender-count.mjs` exists and references `watch` and `56`: `grep -q '56' scripts/assert-prerender-count.mjs`
    - `grep -q 'assert-prerender-count' .github/workflows/deploy.yml` (guard wired into staging)
    - `pnpm build && node scripts/assert-prerender-count.mjs` exits 0
  </acceptance_criteria>
  <done>Both workflows pin only current Node-24-compatible action majors; deploy.yml runs the prerender-count guard after build; the guard passes locally against the real 56-watch/8-category/static build and fails on drift.</done>
</task>

<task type="auto">
  <name>Task 2: Verify the apex production build and write the CUTOVER.md runbook</name>
  <read_first>
    - .github/workflows/deploy-production.yml (BASE_PATH='' build + CNAME verify — the production path being documented)
    - static/CNAME (michellengo.net — what must survive into build/)
    - svelte.config.js (base: process.env.BASE_PATH ?? '')
    - src/routes/sitemap.xml/+server.ts (already absolute https://michellengo.net — confirm apex-correct)
    - .planning/research/PITFALLS.md Pitfall 12 (apex cutover failure modes — the runbook must pre-empt these)
  </read_first>
  <action>
    1. Run a LOCAL apex build to prove base-'' correctness (mirrors the production workflow):
       - `BASE_PATH='' pnpm build` (on Windows PowerShell: `$env:BASE_PATH=''; pnpm build`; the executor should use the cross-platform form that works in this shell). It must exit 0.
       - Assert `build/CNAME` exists and its content is exactly `michellengo.net` (`test "$(cat build/CNAME)" = "michellengo.net"`).
       - Assert the home HTML uses ROOT-relative assets (no `/michelle_ngo_five/` prefix): `! grep -q 'michelle_ngo_five' build/index.html` (the apex build must not leak the staging base path).
       - Assert the sitemap is apex-host: `grep -q 'https://michellengo.net/' build/sitemap.xml`.
       - Re-run the prerender-count guard against this apex build too: `node scripts/assert-prerender-count.mjs` exits 0.
    2. Write `.planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md` — the launch runbook. It MUST contain, in order:
       a. **Pre-flight (already done, listed for confidence):** quality gates green (04-01), actions bumped + prerender guard (04-02 T1), apex build verified base-'' + CNAME=michellengo.net (04-02 T2).
       b. **Step 1 — Set DNS at the registrar** (the HUMAN-ONLY step). An exact records table the user copies verbatim:
          ```
          Type   Host  Value                    TTL
          A      @     185.199.108.153          3600
          A      @     185.199.109.153          3600
          A      @     185.199.110.153          3600
          A      @     185.199.111.153          3600
          AAAA   @     2606:50c0:8000::153      3600
          AAAA   @     2606:50c0:8001::153      3600
          AAAA   @     2606:50c0:8002::153      3600
          AAAA   @     2606:50c0:8003::153      3600
          CNAME  www   wolfwdavid.github.io     3600
          ```
          Note: remove any pre-existing A/AAAA records for `@` that point elsewhere (old host); keep MX/TXT (email) untouched.
       c. **Step 2 — Trigger the production deploy:** Actions → "Deploy to GitHub Pages (production / apex)" → Run workflow (workflow_dispatch). This builds BASE_PATH='' and ships build/ (with CNAME).
       d. **Step 3 — Point the repo's Pages custom domain:** GitHub repo → Settings → Pages → Custom domain → enter `michellengo.net` → Save. GitHub verifies the DNS (can take minutes–hours). Because static/CNAME persists michellengo.net into every artifact, the domain survives future deploys (Pitfall 12).
       e. **Step 4 — Enforce HTTPS:** once the cert is provisioned, tick Settings → Pages → "Enforce HTTPS".
       f. **Step 5 — Verify (cold):** `dig michellengo.net +short` shows the 4 GitHub IPs; open `https://michellengo.net/` cold (incognito) — styled, not unprefixed-broken; hard-refresh a DEEP link `https://michellengo.net/watch/264677021` (404.html fallback must serve the app, not GitHub's 404); confirm `http://` redirects to `https://`; paste a watch link into a sharing debugger and confirm the OG image renders.
       g. **Rollback:** if the apex breaks, revert the Pages custom domain to blank (site stays live at wolfwdavid.github.io/michelle_ngo_five/ via deploy.yml); fix; redeploy.
       h. **Troubleshooting** table mapping Pitfall-12 symptoms → fix (custom-domain field empties on redeploy → CNAME persisted in static/, re-enter once; apex serves unstyled → wrong BASE_PATH, confirm production workflow uses ''; /work 404 but /work/ works → trailing-slash, adapter emits index.html dirs).
    3. Do NOT change DNS or repo settings — those are the human's job in Task 3.
  </action>
  <verify>
    <automated>node scripts/assert-prerender-count.mjs && grep -q 'michellengo.net' build/CNAME && grep -q '185.199.108.153' .planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md</automated>
  </verify>
  <acceptance_criteria>
    - Apex build is base-'' correct: after `BASE_PATH='' pnpm build`, `cat build/CNAME` == `michellengo.net` AND `! grep -q 'michelle_ngo_five' build/index.html` AND `grep -q 'https://michellengo.net/' build/sitemap.xml`
    - `CUTOVER.md` exists and contains all 4 apex A IPs: `grep -q '185.199.108.153' CUTOVER.md && grep -q '185.199.111.153' CUTOVER.md`
    - `CUTOVER.md` contains the AAAA + www CNAME records: `grep -q '2606:50c0:8000::153' CUTOVER.md && grep -q 'wolfwdavid.github.io' CUTOVER.md`
    - `CUTOVER.md` documents the post-DNS steps: contains "Enforce HTTPS" and "Custom domain" and a deep-link hard-refresh verification
  </acceptance_criteria>
  <done>A base-'' apex build is proven green with build/CNAME=michellengo.net, root-relative assets, apex-host sitemap, and full prerender count; CUTOVER.md is a copy-paste-ready runbook with the exact registrar records and post-DNS repo/HTTPS/verification steps.</done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 3: Flip the apex DNS and verify michellengo.net live over HTTPS</name>
  <action>Checkpoint — pause for the human to change DNS at the registrar and toggle repo Pages settings, following CUTOVER.md (steps in how-to-verify below). Claude cannot access the registrar or the Pages UI; resume on the signal.</action>
  <verify>Human follows CUTOVER.md; https://michellengo.net/ serves the styled site over HTTPS and the deep-link hard-refresh works.</verify>
  <done>michellengo.net is live over verified HTTPS, deep links survive a cold hard-refresh, and http redirects to https.</done>
  <what-built>
    Everything up to the registrar is done: workflows hardened (current actions + prerender guard), the apex (BASE_PATH='') build verified green with CNAME=michellengo.net and root-relative assets, and CUTOVER.md written with the exact DNS records and post-DNS steps. The ONLY remaining work is changing DNS at the domain registrar and toggling repo Pages settings — Claude cannot access the registrar or the repo's Pages UI, so this is a genuine human action.
  </what-built>
  <how-to-verify>
    Follow `.planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md` end to end:
    1. At your domain registrar for michellengo.net, set the 9 records in CUTOVER.md Step 1 (4×A, 4×AAAA, 1×www CNAME). Remove old apex A/AAAA records pointing elsewhere; leave MX/TXT alone.
    2. Run the production workflow (Actions → "Deploy to GitHub Pages (production / apex)" → Run workflow).
    3. In repo Settings → Pages, set Custom domain = michellengo.net and Save; wait for GitHub to verify DNS and provision the cert.
    4. Enable "Enforce HTTPS".
    5. Verify per CUTOVER.md Step 5: cold-load https://michellengo.net/ (styled), hard-refresh https://michellengo.net/watch/264677021 (app, not 404), http→https redirect works, and a watch-link share preview renders.
  </how-to-verify>
  <resume-signal>Type "live" once https://michellengo.net/ serves the styled site over HTTPS and the deep-link hard-refresh works — or describe the failure (registrar + symptom) and consult the CUTOVER.md troubleshooting table.</resume-signal>
</task>

</tasks>

<verification>
- `! grep -Eq 'checkout@v4|setup-node@v4|action-setup@v4|upload-pages-artifact@v3|deploy-pages@v4' .github/workflows/*.yml` — no deprecated majors remain.
- `pnpm build && node scripts/assert-prerender-count.mjs` exits 0; the guard is wired into deploy.yml.
- A `BASE_PATH='' pnpm build` produces build/CNAME=michellengo.net with root-relative assets and apex-host sitemap.
- CUTOVER.md contains the exact apex A/AAAA/www records and post-DNS steps.
- Apex goes live over HTTPS (Task 3 human-action).
</verification>

<success_criteria>
- Both workflows bumped to current Node-24-compatible action majors (checkout@v6, setup-node@v6, action-setup@v6, upload-pages-artifact@v5, deploy-pages@v5).
- deploy.yml enforces a prerender-count guard (56 watch + 8 category + static) so route drift fails CI (QUAL-02 / Pitfall 3 closure).
- Apex production build verified: BASE_PATH='' → root-relative assets, build/CNAME preserved, sitemap on apex host.
- CUTOVER.md runbook with exact DNS records + post-DNS repo/HTTPS/verification steps.
- The DNS flip + final apex verification is a human-action checkpoint; everything else is automated.
</success_criteria>

<output>
After completion, create `.planning/phases/04-hardening-apex-cutover-launch/04-02-SUMMARY.md` noting the bumped action versions, the prerender guard counts, the apex-build verification results, and that CUTOVER.md is ready for the human DNS flip.
</output>
