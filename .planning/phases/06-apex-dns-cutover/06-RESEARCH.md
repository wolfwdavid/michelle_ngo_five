# Phase 6: Apex DNS Cutover - Research

**Researched:** 2026-06-19
**Domain:** WordPress.com-managed DNS → GitHub Pages apex custom domain (DNS cutover + TLS provisioning + cross-platform verification)
**Confidence:** HIGH

## Summary

The existing `CUTOVER.md` runbook is **substantively correct and sufficient** for the GitHub-side of this cutover: its 9 DNS records, TLS/Enforce-HTTPS ordering, CNAME-persistence design, and 6 cold checks all match current (2025–2026) GitHub Pages behavior. GitHub's published apex `A` (4 IPv4) and `AAAA` (4 IPv6) IPs in the runbook are **verbatim-current** against GitHub Docs. The runbook needs **no correction** to its DNS values or its core sequence.

The single high-value gap the runbook does **not** cover is the **WordPress.com-specific** procedure (the primary reason this research was commissioned, D-02). The authoritative answer: you do **NOT** need to "detach" or "disconnect" the domain from the WordPress.com site for custom apex `A`/`AAAA` records to GitHub's IPs to take effect — provided the domain's **name servers are still pointed at WordPress.com** (which they are, since DNS is edited in WP.com → Domains → DNS). WordPress.com lets you add custom `A`/`AAAA` records that **automatically replace** the default "Handled by WordPress.com" records; no detach, no delete-first, no special domain state required. BUT there are **two WP.com-specific prerequisites the runbook omits** that must become explicit plan steps: (1) **change the "primary site address" to a `.wordpress.com` address first** so the user doesn't lose admin access to the old WP.com site mid-cutover, and (2) **the WP.com↔GitHub TLS-provisioning interaction** — WordPress.com may have auto-issued its own SSL/CAA state for the domain, and a lingering CAA record that does not permit `letsencrypt.org` will silently block GitHub's "Enforce HTTPS" from ever becoming available.

**Primary recommendation:** Execute `CUTOVER.md` as written, but insert a **WP.com addendum** before Step 1 (set primary site address to `*.wordpress.com`; confirm name servers remain WP.com; check/clear any CAA record blocking `letsencrypt.org`) and use the cross-platform verification command pairs in this doc (PowerShell `Resolve-DnsName` + Git Bash `dig`/`curl`) for the 6 cold checks on the Windows executor.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Target host = **GitHub Pages native custom domain**. No Cloudflare or any other DNS proxy/provider is introduced ("gh pages only").
- **D-02:** DNS is controlled at **WordPress.com / Automattic**. Apex `A`/`AAAA` records are edited in WordPress.com → Domains → DNS records. **Researcher must confirm whether the WordPress.com↔site mapping must be detached before custom `A` records to GitHub's IPs take effect** (resolved below — short answer: NO detach required, but set primary site address first).
- **D-03:** Current apex = old WordPress.com site → **full replacement**. Remove stale `@` `A`/`AAAA` WordPress records; add GitHub Pages' 8 apex IPs exactly as listed in `CUTOVER.md` Step 1.
- **D-04:** www points at GitHub Pages (`www` CNAME → `wolfwdavid.github.io`); GitHub auto-redirects `www` → bare apex. **Bare `michellengo.net` is canonical.**
- **D-05:** **Preserve email — do NOT touch `MX` or `TXT` records.** Only apex `A`/`AAAA` and the `www` CNAME may change.
- **D-06:** Go live **ASAP** once plan + production apex deploy are ready. No fixed window; propagation/TLS may take minutes to hours.
- **D-07:** **Runbook default rollback.** Wait for GitHub TLS cert (up to ~24h), tick Enforce HTTPS. On breakage, clear the custom-domain field in Settings → Pages — site stays live at `wolfwdavid.github.io/michelle_ngo_five/`.
- **D-08:** Phase 6 done-gate = `CUTOVER.md` Step 5's **six cold checks** pass (DNS→4 GitHub IPs; cold styled apex load; deep-link hard-refresh via 404 fallback; HTTP→HTTPS redirect; OG/share preview; indexing gate crawlable).

### Claude's Discretion
- How to structure the plan around human-action checkpoints (registrar DNS edit, Settings → Pages custom-domain entry, Enforce-HTTPS toggle are human-only).
- Exact verification command phrasing and ordering.

### Deferred Ideas (OUT OF SCOPE)
None. (www-as-primary and apex-only-ignore-www were considered and declined; full live-route + real-device verification belongs to Phase 7.)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **DPLY-02** | DNS cutover to michellengo.net executed per `CUTOVER.md` — CNAME preserved across deploys, base-`''` build served at apex, HTTPS valid | This research confirms the runbook's DNS values + HTTPS ordering are current (HIGH), resolves the D-02 WordPress.com detach question (no detach needed; set primary site address + check CAA first), and supplies Windows-native verification commands for the 6 cold checks. The CNAME-preservation mechanism (`static/CNAME` baked into every artifact + `deploy-production.yml` `Verify CNAME` step) is already implemented and confirmed correct against GitHub's "static generators overwrite CNAME" guidance. |
</phase_requirements>

## Standard Stack

This phase introduces **no new libraries**. The toolchain is the existing repo plus the executor's OS tools.

### Already-built assets this phase consumes (do not re-author)
| Asset | Purpose | Status |
|-------|---------|--------|
| `.github/workflows/deploy-production.yml` | Apex deploy: `workflow_dispatch`, `BASE_PATH=''`, prerender-count guard, `Verify CNAME in build artifact` step, `deploy-pages@v5` | Hardened, ready to dispatch |
| `.github/workflows/deploy.yml` | Staging deploy (`BASE_PATH=/michelle_ngo_five`, push-to-main) — the **rollback fallback** that the apex flip never touches | Untouched, safe |
| `static/CNAME` (= `michellengo.net`) | Persists custom domain into **every** build artifact so a redeploy can't knock the domain off (Pitfall-12 CNAME-loss closure) | Correct |
| `scripts/assert-prerender-count.mjs` | Build-time guard: EXACTLY 56 watch + 8 category + required static pages | Wired into apex workflow |
| `svelte.config.js` §`paths.base` | `BASE_PATH` env gates base path (`''` apex / `/michelle_ngo_five` staging) | Correct |

### Executor OS tools (Windows — PowerShell + Git Bash both available)
| Tool | Where | Use |
|------|-------|-----|
| `Resolve-DnsName` | PowerShell | DNS A/AAAA verification with `-Server` to hit a specific resolver (propagation check) |
| `nslookup` | PowerShell / cmd | Legacy fallback if `Resolve-DnsName` unavailable |
| `dig`, `curl`, `grep` | Git Bash | Matches the runbook's `dig +short` / `curl -s ... | grep` phrasing verbatim |

**Installation:** None. No `npm install`. No new dependencies.

## Architecture Patterns

### The cutover is human-action-gated, not code-authored

The plan should be structured around **three human-only checkpoints** (Claude cannot perform any of them), interleaved with one automated deploy and one automated verification pass:

```
WP.com addendum (HUMAN)  →  set primary site address to *.wordpress.com
                            confirm name servers = WordPress.com
                            check/clear CAA record blocking letsencrypt.org
        │
Step 1 (HUMAN)           →  WP.com → Domains → DNS: replace @ A/AAAA with GitHub's 8 IPs;
                            set www CNAME → wolfwdavid.github.io; LEAVE MX/TXT
        │
Step 2 (AUTOMATED)       →  Actions → "Deploy to GitHub Pages (production / apex)" → Run workflow
                            (workflow_dispatch; builds BASE_PATH='', verifies CNAME, deploys)
        │
Step 3 (HUMAN)           →  repo Settings → Pages → Custom domain = michellengo.net → Save
        │
Step 4 (HUMAN, delayed)  →  wait for cert (up to ~24h) → tick Enforce HTTPS
        │
Step 5 (VERIFY)          →  6 cold checks (this doc gives Windows command pairs)
```

### Pattern 1: Run the apex deploy BEFORE (or concurrently with) the DNS edit

**What:** Trigger `deploy-production.yml` (Step 2) so a base-`''` build with the baked CNAME is already published to the `github-pages` environment **before** GitHub starts verifying the custom domain in Step 3.
**When to use:** Always for this cutover.
**Why:** When the human enters `michellengo.net` in Settings → Pages (Step 3), GitHub immediately checks that the served artifact's `CNAME` matches and that DNS resolves to its IPs, then queues the Let's Encrypt cert. If the published artifact is still the staging `BASE_PATH=/michelle_ngo_five` build, the apex would serve unstyled/base-prefixed assets the moment DNS flips. The runbook already orders Step 2 before Step 3 — preserve that ordering. DNS propagation (Step 1) can run in parallel since it takes minutes-to-hours anyway.

> **Note on GitHub's "add domain in Settings first" guidance.** GitHub Docs recommend adding the custom domain in repo Settings *before* configuring DNS, to prevent a takeover window where someone else could claim a subdomain pointed at Pages. The runbook does DNS (Step 1) → Settings (Step 3). For an **apex you already own and whose name servers you control at WP.com**, the takeover risk is negligible (you are not delegating a dangling subdomain to a third party), and the runbook's order is fine. If you want belt-and-suspenders, the human MAY enter the domain in Settings → Pages first (Step 3 before Step 1); GitHub will show "DNS check unsuccessful" until Step 1 propagates, which is harmless. Either order works; do not block on this.

### Pattern 2: CNAME file complements (does not conflict with) the Settings field

**What:** `static/CNAME` → baked into `build/CNAME` → published in the artifact. The Settings → Pages custom-domain field is the same value entered once in the UI.
**Why it's safe:** GitHub Docs explicitly state the `CNAME` file and the Settings field **complement** each other — the file is how the domain *persists* across deploys; the Settings entry is the one-time UI registration that triggers verification + cert. Because every `deploy-production.yml` run re-publishes `build/CNAME` (and the workflow's `Verify CNAME in build artifact` step fails the deploy if it's missing), the documented failure mode ("static generators force-push and overwrite CNAME, knocking the domain off") **cannot occur here**. The human enters the domain in Settings exactly once.

### Anti-Patterns to Avoid
- **Touching `MX`/`TXT` records (D-05):** Email and domain-verification records are sacred. Only `@` `A`/`AAAA` and `www` CNAME change.
- **Introducing Cloudflare / any proxy (D-01):** Not only out of scope — a proxied (orange-cloud) record would *block* GitHub's Let's Encrypt cert. "GitHub Pages only" is also the HTTPS-safe choice.
- **Leaving stale WordPress `@` A/AAAA records alongside GitHub's:** Mixed apex records make the apex intermittently serve the old WP.com site (Pitfall-12). Replace, don't append.
- **Forcing / waiting-incorrectly on Enforce HTTPS:** The checkbox is greyed out until the cert provisions. Do not treat greyed-out as broken before ~1–24h have passed (see Pitfall 3).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Persisting the custom domain across deploys | A workflow step that re-types the domain in Settings via API | `static/CNAME` baked into the artifact (already done) | GitHub natively reads `CNAME` from the published artifact; the file is the supported mechanism |
| Guarding against a base-`''`/`/michelle_ngo_five` build mixup at the apex | A manual visual check only | `deploy-production.yml` already sets `BASE_PATH=''` + `assert-prerender-count.mjs` + `Verify CNAME` | The workflow is the guard; trust it, then cold-verify |
| TLS certificate | Anything | GitHub's automatic Let's Encrypt provisioning | Free, automatic, the only supported path for Pages custom domains |
| DNS propagation polling | A custom script | `Resolve-DnsName -Server` / `dig @resolver` against multiple resolvers | One-liners already exist cross-platform |

**Key insight:** Every mechanical risk in this cutover is already closed by existing repo automation. The genuine work is **human DNS/registrar actions + WP.com-specific sequencing + cold verification** — not code.

## Runtime State Inventory

> This phase changes live external service state (DNS at WordPress.com, GitHub Pages domain registration). A repo grep finds none of it. Each category is answered explicitly.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | None in-repo. The "stored state" is **external**: the apex `A`/`AAAA` records currently in the WordPress.com DNS zone point at WordPress.com (verified live at discussion time: `Host-Header: WordPress.com`, `wp-json`, `X-ac: _atomic_dca`). | **Data migration (external, human):** in WP.com → Domains → DNS, replace the `@` `A`/`AAAA` records with GitHub's 8 IPs; set `www` CNAME → `wolfwdavid.github.io`. Leave `MX`/`TXT`. |
| **Live service config** | (a) **WordPress.com site mapping:** the domain is the primary site address of the old WP.com site. (b) **WordPress.com SSL/CAA state:** WP.com auto-manages SSL for connected domains and may have set a CAA record. (c) **GitHub Pages custom-domain field:** currently empty (apex never registered; site live only at the project staging URL). | (a) **Set primary site address → `*.wordpress.com`** so admin access survives (WP.com addendum, human). No detach required. (b) **Check for a CAA record** that omits `letsencrypt.org`; if present it will block GitHub's cert — clear/adjust it (human). (c) **Enter `michellengo.net` once** in repo Settings → Pages (Step 3, human). |
| **OS-registered state** | None. No Windows Task Scheduler / launchd / systemd / pm2 registrations reference this domain. The executor's Windows box only runs verification commands. | None — verified: this phase registers nothing at the OS level. |
| **Secrets/env vars** | None. `BASE_PATH` is the only relevant env var and it's set inside the workflows (`''` apex / `/michelle_ngo_five` staging), not a secret. No registrar/API tokens are used — all WP.com + GitHub Settings actions are manual UI. | None — verified: no secret or env var rename/rotation in this phase. |
| **Build artifacts** | `static/CNAME` (= `michellengo.net`) is committed and baked into `build/CNAME` by every deploy. No stale artifact carries an old/wrong domain. | None — verified: `static/CNAME` is correct and the `Verify CNAME` workflow step enforces it. |

**Canonical question — "after the repo is updated, what runtime systems still hold old state?"** Answer: only the **WordPress.com DNS zone** (old apex A/AAAA → WP.com) and the **WordPress.com SSL/CAA + primary-site-address** state. Both are external, human-edited, and addressed by the WP.com addendum + Step 1. The repo itself holds no stale state.

## Common Pitfalls

### Pitfall 1: Assuming the domain must be "detached" from the WordPress.com site (THE D-02 question)
**What goes wrong:** Planner assumes the apex `A` records to GitHub won't take effect until the domain is disconnected from the WP.com site, and bakes a risky/unnecessary "detach domain" step into the plan — which could de-list the domain or interrupt management.
**Resolution (HIGH confidence, official WP.com docs):** **No detach is required.** As long as the domain's **name servers remain pointed at WordPress.com** (they do — that's why DNS is edited in WP.com → Domains → DNS), you can add custom apex `A`/`AAAA` records and they **automatically replace** the default "Handled by WordPress.com" records. WordPress.com's official "Point a domain name to an external IP address" guide states verbatim: *"The default A records will show as 'Handled by WordPress.com.' It is not possible nor necessary to remove this because the new A records will replace them automatically."* The domain stays "connected" for management/billing; only where it *resolves* changes.
**The one real prerequisite:** WP.com's guide does instruct, before redirecting to an external host: *"you should change the primary site address so that you can continue to access the admin dashboard of your WordPress.com website without issue."* So **set the primary site address to a `*.wordpress.com` (or `*.wpcomstaging.com`) address first** — otherwise, once the apex resolves to GitHub, the old WP.com admin URL is unreachable. This is the addendum step the runbook lacks.
**Warning signs of getting this wrong:** Plan contains a "Detach/Delete domain from WP.com site" task (unnecessary and risky — `Delete` *removes the domain connection permanently*). The correct verb is **edit DNS records** + **change primary site address**, never "detach/delete."

### Pitfall 2: WordPress.com SSL / CAA record silently blocks GitHub's Let's Encrypt cert
**What goes wrong:** DNS resolves to GitHub, the apex loads over HTTP, but "Enforce HTTPS" never becomes available and `https://` shows a cert error — for hours, with no obvious cause.
**Why it happens:** GitHub provisions TLS via **Let's Encrypt**. GitHub Docs: *"at least one CAA record must exist with the value `letsencrypt.org`"* (or **no** CAA record at all, which also permits any CA). WordPress.com auto-manages SSL for connected domains and **may have published a CAA record** scoped to its own/another CA — which would forbid Let's Encrypt and silently block GitHub's cert. A leftover/conflicting SSL cert at the domain level is a documented cause of "Enforce HTTPS unavailable."
**How to avoid:** As part of the WP.com addendum, in WP.com → Domains → DNS, **check for a `CAA` record.** If one exists and does **not** include `letsencrypt.org`, either delete it (no CAA = any CA allowed) or add a `CAA` record `0 issue "letsencrypt.org"`. **Do not confuse this with `MX`/`TXT` — CAA is a distinct type and adjusting it does not affect email.** (D-05 protects `MX`/`TXT` only.)
**Warning signs:** "Enforce HTTPS — Unavailable for your site because your domain is not properly configured to support HTTPS," persisting well past 1 hour after DNS verifies green.

### Pitfall 3: Treating a greyed-out "Enforce HTTPS" as failure too early
**What goes wrong:** Human sees Enforce HTTPS greyed out minutes after Step 3 and assumes the cutover failed; triggers a premature rollback.
**Why it happens:** GitHub queues the Let's Encrypt request only after its DNS check passes, then provisioning takes time. GitHub Docs: HTTPS *"can take up to 24 hours"* to become available (commonly within ~1 hour).
**How to avoid:** Per D-07, **wait** — the checkbox enabling itself is the signal. If it's still greyed out after the wait *and* DNS verifies green *and* no blocking CAA exists, the documented fix is to **remove and re-add the custom domain** in Settings → Pages to re-trigger cert issuance. Build this "wait, then re-add if needed" branch into the plan rather than an immediate rollback.
**Warning signs:** Impatience at minute 10. (It's normal.)

### Pitfall 4: Stale WordPress apex records left alongside GitHub's (intermittent old site)
**What goes wrong:** The apex sometimes serves the new v5 site and sometimes the old WordPress site.
**Why it happens:** Old `@` `A`/`AAAA` records pointing at WP.com were *added to* rather than *replaced* — resolvers round-robin across all apex records (Pitfall-12 / runbook Step 1 note).
**How to avoid:** **Remove every non-GitHub `@` `A`/`AAAA` record**; the apex must resolve to *exactly* the 4 GitHub IPv4 + 4 GitHub IPv6, nothing else. Verify with the all-records check in Code Examples below.
**Warning signs:** Cold incognito loads alternate between the two sites; `Resolve-DnsName -Type A` returns more than the 4 GitHub IPs.

### Pitfall 5: Email collateral damage
**What goes wrong:** Editing DNS knocks out Michelle's email.
**Why it happens:** Touching `MX`/`TXT` while replacing apex records.
**How to avoid (D-05):** Only edit the `@` `A`/`AAAA` and the `www` CNAME (and possibly a single CAA per Pitfall 2). **Never** edit/delete `MX` or `TXT`. Before/after, confirm `MX`/`TXT` are unchanged (verification command below).
**Warning signs:** `MX` records missing after the edit.

## Code Examples

Cross-platform verification for the **6 cold checks (D-08)**. The runbook phrases them in `dig`/`curl` (Git Bash works verbatim); these add the **PowerShell-native** equivalents for the Windows executor.

### Check 1 — DNS resolves to the 4 GitHub IPv4 (and the 4 IPv6)
```powershell
# PowerShell (Windows-native)
Resolve-DnsName michellengo.net -Type A      # expect ONLY 185.199.108–111.153
Resolve-DnsName michellengo.net -Type AAAA   # expect ONLY 2606:50c0:8000–8003::153
# Check against a public resolver to gauge propagation (compare to your ISP resolver):
Resolve-DnsName michellengo.net -Type A -Server 8.8.8.8
Resolve-DnsName michellengo.net -Type A -Server 1.1.1.1
```
```bash
# Git Bash (matches runbook verbatim)
dig michellengo.net +short            # → the four 185.199.10x.153 IPs
dig michellengo.net AAAA +short       # → the four 2606:50c0:800x::153 IPs
dig @8.8.8.8 michellengo.net +short   # propagation cross-check
```
*Source: GitHub Docs (apex IP/AAAA values); WordPress.com supports both A and AAAA in its DNS editor — the IPv6-not-supported caveat applies only to pointing AT WP.com hosting, not to an external host like GitHub.*

### Check 2 — Cold apex load is fully styled (manual)
Open `https://michellengo.net/` in a **fresh incognito** window → dark home renders fully styled (not base-prefixed/unstyled). Confirms the served artifact is the `BASE_PATH=''` build.

### Check 3 — Deep-link hard-refresh survives the 404 fallback (manual + scripted)
```powershell
# PowerShell: the page should return 200 and contain app HTML (served via 404.html fallback routing)
(Invoke-WebRequest -Uri "https://michellengo.net/watch/264677021" -UseBasicParsing).StatusCode
```
Then in a browser, hard-refresh `https://michellengo.net/watch/264677021` → the SPA app serves, not a bare GitHub 404.

### Check 4 — HTTP → HTTPS redirect (after Enforce HTTPS)
```powershell
# PowerShell: expect a 301/302 to the https:// URL
$r = Invoke-WebRequest -Uri "http://michellengo.net/" -MaximumRedirection 0 -UseBasicParsing -ErrorAction SilentlyContinue
$r.StatusCode; $r.Headers.Location
```
```bash
# Git Bash: -I shows the redirect chain; expect Location: https://michellengo.net/
curl -sI http://michellengo.net/ | grep -i -E 'HTTP/|location'
```

### Check 5 — Share / OG preview (manual)
Paste a watch link (`https://michellengo.net/watch/264677021`) into an OG/social debugger → title + OG image render (OG URLs are absolute production URLs, already wired in Phase 2/5).

### Check 6 — Indexing gate took effect (SEO-04) — the apex build is crawlable
```bash
# Git Bash (runbook-verbatim)
curl -s https://michellengo.net/robots.txt
#  expect:  User-agent: *  /  Allow: /  /  Sitemap: https://michellengo.net/sitemap.xml
#  must NOT be:  Disallow: /
curl -s https://michellengo.net/ | grep -i noindex   # expect: NOTHING
```
```powershell
# PowerShell equivalents
(Invoke-WebRequest https://michellengo.net/robots.txt -UseBasicParsing).Content
(Invoke-WebRequest https://michellengo.net/ -UseBasicParsing).Content -match 'noindex'  # expect: False
```
*If robots.txt still shows `Disallow: /` or a `noindex` meta appears, the apex was built with the wrong `BASE_PATH` — confirm `deploy-production.yml` built with `BASE_PATH=''` and re-run it (runbook Step 6 note).*

### Bonus — confirm MX/TXT untouched (D-05 safety, before and after the edit)
```powershell
Resolve-DnsName michellengo.net -Type MX
Resolve-DnsName michellengo.net -Type TXT
```
```bash
dig michellengo.net MX +short
dig michellengo.net TXT +short
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| "You must detach a WordPress.com domain to point it elsewhere" (folk wisdom) | Add custom A/AAAA records that auto-replace WP.com defaults while NS stay at WP.com; only change the **primary site address** so admin access survives | Current WP.com docs (2025–2026) | No risky detach/delete step in the plan |
| GitHub Pages apex via a single A record / no IPv6 | 4 IPv4 `A` + 4 IPv6 `AAAA` (`2606:50c0:8000–8003::153`) | IPs stable for years; AAAA published and current | Runbook's 9 records are correct and complete |
| Re-enter custom domain in Settings after each deploy | `CNAME` file in the artifact persists the domain automatically | Long-standing GitHub behavior | `static/CNAME` + workflow guard already implement this — domain entered once |

**Deprecated/outdated:** Nothing in the runbook is outdated. The GitHub IPs, AAAA values, TLS-up-to-24h timing, and Enforce-HTTPS-greyed-until-cert behavior all match current docs.

## Open Questions

1. **Does michellengo.net currently have a CAA record (and does it exclude letsencrypt.org)?**
   - What we know: WordPress.com auto-manages SSL for connected domains and *can* publish a CAA record; a CAA without `letsencrypt.org` will block GitHub's cert (Pitfall 2). GitHub permits cert issuance when there is **no** CAA or a CAA that includes `letsencrypt.org`.
   - What's unclear: Whether a blocking CAA is actually present right now (only the live zone, viewable in WP.com → Domains → DNS, or via `Resolve-DnsName michellengo.net -Type CAA` after NS resolve, can confirm).
   - Recommendation: Add a plan step to **inspect the CAA record during the WP.com addendum** and clear/adjust it if it excludes `letsencrypt.org`. Cheap insurance against a multi-hour HTTPS stall.

2. **Are `MX`/`TXT` records currently present (is email live)?**
   - What we know: D-05 mandates preserving them whether or not email is active.
   - What's unclear: Whether email is actually configured.
   - Recommendation: Snapshot `MX`/`TXT` (command above) **before** editing and re-confirm **after** — regardless of whether email is in use. No action needed beyond "don't touch + verify unchanged."

3. **Exact propagation time for this registrar/zone.**
   - What we know: WP.com TTLs in the runbook are `3600`; propagation is minutes-to-hours (D-06 accepts this).
   - What's unclear: Real-world timing for this specific zone.
   - Recommendation: Treat Step 5 as a **poll-until-green** loop (multi-resolver `Resolve-DnsName -Server`), not a one-shot check. No fixed window (D-06).

## Sources

### Primary (HIGH confidence)
- [GitHub Docs — Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) — apex `A` (185.199.108–111.153) + `AAAA` (2606:50c0:8000–8003::153) values; order of operations; Enforce-HTTPS up-to-24h
- [GitHub Docs — Troubleshooting custom domains and GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages) — CNAME file complements Settings field; static generators overwriting CNAME; CAA must include `letsencrypt.org`; HTTPS up-to-1h then remove/re-add to re-trigger
- [WordPress.com — Point a domain name to an external IP address](https://wordpress.com/support/domains/setting-custom-a-records/) — **D-02 answer:** no detach; custom A records auto-replace "Handled by WordPress.com" defaults; change primary site address first
- [WordPress.com — Edit or Delete DNS Records](https://wordpress.com/support/domains/custom-dns/edit-or-delete-dns-records/) — DNS edit path (Upgrades → Domains → domain → DNS records → Manage); requires NS pointed at WordPress.com
- [WordPress.com — Add a new DNS record](https://wordpress.com/support/domains/custom-dns/add-a-new-dns-record/) — A/AAAA/CAA/etc. all addable; AAAA limitation applies only to WP.com-hosted targets, not external hosts

### Secondary (MEDIUM confidence — verified against the official docs above)
- [WordPress.com — Detach a domain from a site](https://wordpress.com/support/domains/disconnect-a-domain-from-a-site/) — confirms "detach/delete" removes the connection permanently (why the plan must NOT use it)
- [GitHub community — "Enforce HTTPS Unavailable… not properly configured" (#157027)](https://github.com/orgs/community/discussions/157027) — corroborates CAA/conflicting-SSL as the cause; remove/re-add fix
- [PowerShell `Resolve-DnsName` reference (4sysops)](https://4sysops.com/archives/resolve-dnsname-nslookup-for-powershell/) — `-Type`/`-Server` for cross-resolver propagation checks on Windows

### Tertiary (LOW confidence)
- None relied upon; all load-bearing claims are backed by GitHub or WordPress.com official docs.

## Metadata

**Confidence breakdown:**
- D-02 WordPress.com detach question: **HIGH** — answered verbatim by official WP.com "external IP address" + "edit DNS records" docs.
- GitHub apex IPs / AAAA / TLS ordering vs. runbook: **HIGH** — verbatim match to current GitHub Docs; runbook needs no value changes.
- WP.com SSL/CAA blocking GitHub's cert (Pitfall 2): **MEDIUM-HIGH** — GitHub's `letsencrypt.org` CAA requirement is documented HIGH; whether a blocking CAA is *currently present* on this zone is unconfirmed (Open Question 1).
- Cross-platform verification commands: **HIGH** — standard `Resolve-DnsName`/`dig`/`curl` usage.
- CNAME-persistence mechanism: **HIGH** — implemented in-repo and matches GitHub's documented behavior.

**Where the runbook is sufficient vs. where it needs a WP.com addendum:**
- **Sufficient as-is:** Steps 1 (DNS values), 2 (apex deploy), 3 (Settings entry), 4 (Enforce HTTPS timing/greyed-out), 5 (6 cold checks), Rollback, the Pitfall-12 troubleshooting table, and CNAME persistence. No corrections needed.
- **Needs a WP.com addendum (new, before Step 1):** (a) set **primary site address → `*.wordpress.com`** so old-site admin survives; (b) confirm **name servers remain WordPress.com** (required for the DNS editor to control the zone); (c) inspect and, if needed, clear/adjust a **CAA record** so it permits `letsencrypt.org`; (d) phrase the WP.com edit as **"edit/replace DNS records," never "detach/delete the domain."**

**Research date:** 2026-06-19
**Valid until:** 2026-07-19 (30 days — stable domain/DNS/Pages behavior; GitHub IPs have been stable for years)
