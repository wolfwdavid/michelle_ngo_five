# Phase 6: Apex DNS Cutover - Context

**Gathered:** 2026-06-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Execute the existing `CUTOVER.md` runbook to flip **michellengo.net** from the current
WordPress.com site to the v5 **base-`''`** GitHub Pages build: the apex serves the root-relative
production build over valid HTTPS, the CNAME persists across deploys, and the SEO-04 indexing gate
takes effect (apex crawlable). Target host is **GitHub Pages native custom domain only**.

**Verified at discussion time:** the apex is still served by WordPress.com (live response headers:
`Host-Header: WordPress.com`, `wp-json`, `X-ac: _atomic_dca`). The v5 site is currently live only at
the staging URL `https://wolfwdavid.github.io/michelle_ngo_five/`. This phase is therefore the **real
DNS flip**, not a redeploy.

**Out of scope (Phase 7):** full live-route sweep and real-device iPhone/Android browse+watch
verification. Phase 6's done-gate is the six cold checks in `CUTOVER.md` Step 5.

</domain>

<decisions>
## Implementation Decisions

### DNS & hosting target
- **D-01:** Target host = **GitHub Pages native custom domain**. No Cloudflare or any other DNS
  proxy/provider is introduced ("gh pages only", stated repeatedly by the user).
- **D-02:** DNS is controlled at **WordPress.com / Automattic** — the domain is managed there. The
  apex `A`/`AAAA` records are edited in WordPress.com → Domains → DNS records. Researcher must confirm
  whether the WordPress.com↔site mapping must be detached before custom `A` records to GitHub's IPs
  take effect (known WordPress.com gotcha).
- **D-03:** Current apex = the old WordPress.com site → **full replacement**. Remove stale `@`
  `A`/`AAAA` WordPress records; add GitHub Pages' 8 apex IPs exactly as listed in `CUTOVER.md` Step 1.

### www subdomain
- **D-04:** www points at GitHub Pages (`www` CNAME → `wolfwdavid.github.io`); GitHub Pages
  auto-redirects `www` → bare apex. **Bare `michellengo.net` is canonical** ("gh pages only" — runbook
  default). www-as-primary and "ignore www" were both declined.

### Email safety
- **D-05:** **Preserve email — do NOT touch `MX` or `TXT` records.** Only the apex `A`/`AAAA` and the
  `www` CNAME may change. Applies whether or not email is currently active (matches runbook warning).

### Timing
- **D-06:** Go live **ASAP** once the plan and production apex deploy are ready. No fixed window baked
  in; DNS propagation and TLS provisioning may still take minutes to hours.

### Rollback / abort
- **D-07:** **Runbook default.** Wait for GitHub to provision the TLS cert (can take up to ~24h),
  then tick Enforce HTTPS. On breakage, roll back by clearing the custom-domain field in
  Settings → Pages — the site stays live at the staging URL `wolfwdavid.github.io/michelle_ngo_five/`
  (untouched by the apex workflow).

### Done-gate
- **D-08:** Phase 6 is done when `CUTOVER.md` Step 5's **six cold checks** pass: (1) DNS resolves to
  the four GitHub IPs, (2) cold incognito apex load is fully styled, (3) deep-link hard-refresh
  (`/watch/264677021`) survives via the 404 fallback, (4) HTTP→HTTPS redirect works, (5) share/OG
  preview renders, (6) indexing gate confirmed crawlable (`robots.txt` shows `Allow: /` +
  `Sitemap: https://michellengo.net/sitemap.xml`; home page carries no `noindex`).

### Claude's Discretion
- How to structure the plan around human-action checkpoints (the registrar DNS edit, the
  Settings → Pages custom-domain entry, and the Enforce-HTTPS toggle are human-only).
- Exact verification command phrasing and ordering.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The runbook (primary spec)
- `.planning/phases/04-hardening-apex-cutover-launch/CUTOVER.md` — THE step-by-step cutover runbook:
  exact 9 DNS records, human-only steps (registrar, Pages custom domain, Enforce HTTPS), the
  workflow_dispatch deploy, the 6 cold verification checks, rollback, and the Pitfall-12 troubleshooting table.

### Pitfall background
- `.planning/research/PITFALLS.md` — Pitfall 12 (apex cutover: CNAME loss, wrong base path,
  trailing-slash 404s, HTTPS/redirect) that the runbook pre-empts.

### Deploy mechanics
- `.github/workflows/deploy-production.yml` — production/apex deploy (`workflow_dispatch` only;
  builds `BASE_PATH=''`, runs `assert-prerender-count.mjs`, verifies `build/CNAME`, deploys).
- `.github/workflows/deploy.yml` — staging deploy (push-to-main, `BASE_PATH=/michelle_ngo_five`) —
  the untouched rollback fallback.
- `static/CNAME` — contains `michellengo.net`; persists the custom domain into every build artifact
  (Pitfall-12 CNAME-loss closure).
- `scripts/assert-prerender-count.mjs` — prerender route-count guard (56 watch + 8 category + static).
- `svelte.config.js` §paths.base — `BASE_PATH` env gates the base path (`''` apex / `/michelle_ngo_five` staging).

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — **DPLY-02** (this phase's sole requirement).
- `.planning/ROADMAP.md` §"Phase 6: Apex DNS Cutover" — goal + 3 success criteria.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `deploy-production.yml`: the apex deploy is already written and hardened — Phase 6 dispatches it,
  it does not need to be authored.
- `static/CNAME`: domain persistence is already solved — no per-deploy CNAME re-entry needed.
- `assert-prerender-count.mjs`: build-time guard that fails the deploy if the route count drifts.

### Established Patterns
- `BASE_PATH` env var selects the base path in `svelte.config.js` (`''` for apex, `/michelle_ngo_five`
  for staging). The apex build is base-`''`.
- The SEO-04 indexing gate is environment-gated on `BASE_PATH`: staging stays `Disallow: /` +
  `noindex`, the apex build is crawlable. Verified on staging before this phase.

### Integration Points (human-only)
- GitHub repo → Settings → Pages → Custom domain (enter `michellengo.net`, Enforce HTTPS).
- WordPress.com → Domains → DNS records (edit apex `A`/`AAAA`, set `www` CNAME, leave `MX`/`TXT`).

</code_context>

<specifics>
## Specific Ideas

- User repeatedly emphasized "GitHub Pages only" — no Cloudflare, no other host/proxy. The whole
  apex must resolve to and be served by GitHub Pages.
- Treat the WordPress.com setup as fully retired post-flip; only email-related records (`MX`/`TXT`)
  are sacred.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (www-as-primary and apex-only-ignore-www were
considered and declined; full live-route + real-device verification belongs to Phase 7.)

</deferred>

---

*Phase: 06-apex-dns-cutover*
*Context gathered: 2026-06-19*
