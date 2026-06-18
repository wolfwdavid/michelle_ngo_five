# michellengo.net Apex Cutover Runbook

**Goal:** Take the staging site (`https://wolfwdavid.github.io/michelle_ngo_five/`) live on the
apex domain **`michellengo.net`** over verified HTTPS, without 404ing routes, losing the custom
domain on redeploy, or serving base-prefixed (unstyled) assets.

This runbook pre-empts every failure mode in **Pitfall 12** (apex cutover: CNAME loss, wrong base,
trailing-slash 404s, HTTPS/redirect). Follow the steps **in order**. Steps 1, 3, and 4 are
**human-only** (registrar + repo Pages UI) — Claude cannot perform them.

---

## Pre-flight — already done (listed for confidence)

These are complete and committed before you touch the registrar:

- **Quality gates green (04-01):** axe a11y (serious/critical) and mobile Lighthouse budgets pass
  (home LCP 2.05s / CLS 0 / perf 98). Real-device QA is its own human-verify checkpoint.
- **Actions bumped + prerender guard (04-02 T1):** both workflows pin current Node-24-compatible
  action majors (`checkout@v6`, `setup-node@v6`, `action-setup@v6`, `upload-pages-artifact@v5`,
  `deploy-pages@v5`); `deploy.yml` runs `scripts/assert-prerender-count.mjs` on every push to main,
  failing CI if the route count drifts from 56 watch + 8 category + static pages.
- **Apex build verified base-`''` (04-02 T2):** a local `BASE_PATH='' pnpm build` exits 0 with:
  - `build/CNAME` == `michellengo.net` (so the domain survives every deploy — `static/CNAME`
    persists it into the artifact),
  - root-relative assets (no `/michelle_ngo_five/` prefix in `build/index.html`),
  - `build/sitemap.xml` on the apex host (`https://michellengo.net/...`),
  - full prerender count (56 watch + 8 category + all static pages).
- **Indexing gate (SEO-04):** noindex meta + robots.txt are environment-gated on BASE_PATH — staging stays blocked, the apex build is crawlable (verified on staging before cutover).

The production workflow `Deploy to GitHub Pages (production / apex)` builds with `BASE_PATH=''` and
verifies `build/CNAME` before upload.

---

## Step 1 — Set DNS at the registrar (HUMAN-ONLY)

At your domain registrar's DNS panel for **michellengo.net**, set EXACTLY these 9 records
(copy verbatim). These are GitHub Pages' published, stable apex IPs.

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

Notes:
- **Remove any pre-existing `A`/`AAAA` records for `@`** that point at the old host — leftover apex
  records will fight GitHub's and serve the old site intermittently.
- **Leave `MX` and `TXT` records untouched** (email / domain verification must keep working).
- `www` is a `CNAME` to the **user** Pages host `wolfwdavid.github.io` (not a project subpath).
- DNS propagation can take minutes to a few hours; the rest of the steps can wait for it.

---

## Step 2 — Trigger the production (apex) deploy

In the GitHub repo: **Actions → "Deploy to GitHub Pages (production / apex)" → Run workflow**
(this is `workflow_dispatch`-only; it does not fire on push).

This builds with `BASE_PATH=''`, verifies `build/CNAME`, and ships `build/` (including the CNAME).
Wait for the run to go green.

---

## Step 3 — Point the repo's Pages custom domain (HUMAN-ONLY)

GitHub repo → **Settings → Pages → Custom domain** → enter `michellengo.net` → **Save**.

GitHub then verifies the DNS records from Step 1 and begins provisioning a TLS certificate
(can take minutes to hours). Because `static/CNAME` persists `michellengo.net` into **every**
build artifact, the custom domain survives future deploys — you should only ever need to enter
it once (Pitfall 12 CNAME-loss closure).

---

## Step 4 — Enforce HTTPS (HUMAN-ONLY)

Once GitHub reports the certificate is provisioned: **Settings → Pages → tick "Enforce HTTPS"**.
This makes `http://` requests redirect to `https://`. The checkbox is greyed out until the cert
is ready — wait for it rather than forcing it.

---

## Step 5 — Verify (cold, after DNS + cert)

Run these checks; all must pass before declaring the cutover done:

1. **DNS resolves to GitHub:**
   `dig michellengo.net +short` → shows the four IPs `185.199.108.153`–`185.199.111.153`.
2. **Cold apex load is styled:** open `https://michellengo.net/` in a fresh **incognito** window —
   the dark home renders with full styling (NOT unstyled / base-prefixed-broken).
3. **Deep-link hard-refresh survives:** open `https://michellengo.net/watch/264677021` and
   **hard-refresh** it — the SPA app serves (the `404.html` fallback routes it), NOT a bare 404.
4. **HTTP → HTTPS redirect:** `http://michellengo.net/` redirects to `https://michellengo.net/`.
5. **Share preview renders:** paste a watch link (e.g. `https://michellengo.net/watch/264677021`)
   into a social sharing/OG debugger and confirm the title + OG image render.
6. **Indexing gate took effect (SEO-04):** the production (apex) build is crawlable.
   - `curl -s https://michellengo.net/robots.txt` shows `User-agent: *` + `Allow: /` + `Sitemap: https://michellengo.net/sitemap.xml` (NOT `Disallow: /`).
   - `curl -s https://michellengo.net/ | grep -i noindex` returns NOTHING (the home page carries no `noindex` robots meta).
   If either still shows the staging block (`Disallow: /` or a `noindex` meta), the apex was built with the wrong `BASE_PATH` — confirm the production workflow built with `BASE_PATH=''` and re-run it.

When all six pass, **reply "live"** to resume — or describe the failure (registrar + symptom)
and consult the troubleshooting table below.

---

## Rollback

If the apex breaks and you need the site back fast:

1. **Settings → Pages → Custom domain → clear the field → Save.** The site stays live at the
   staging URL `https://wolfwdavid.github.io/michelle_ngo_five/` (served by `deploy.yml`, unaffected
   by the apex workflow).
2. Diagnose using the troubleshooting table, fix, then re-run Steps 2–4.

The staging deploy is never touched by the apex cutover, so it is always a safe fallback.

---

## Troubleshooting (Pitfall 12 symptom → fix)

| Symptom                                                       | Cause                                                            | Fix                                                                                                       |
| ------------------------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Custom-domain field empties in Settings → Pages on redeploy  | A deploy that dropped the `CNAME` file from the artifact          | `static/CNAME` already persists `michellengo.net` into every build — re-enter the domain once; future deploys keep it. |
| Apex serves **unstyled** / assets 404 with `/michelle_ngo_five/` | The build used the staging base path instead of `''`             | Confirm the production workflow's build step sets `BASE_PATH: ''` (it does); re-run it. Never hardcode `/michelle_ngo_five/` paths. |
| `/work` 404s but `/work/` works (or vice-versa)              | Trailing-slash mismatch vs Pages' directory serving             | adapter-static emits `<route>/index.html` directories — always link with `base`-aware, directory-style hrefs (already the convention). |
| `http://` does not redirect to `https://`                    | "Enforce HTTPS" not enabled (or cert not yet provisioned)        | Wait for the cert, then tick **Settings → Pages → Enforce HTTPS** (Step 4).                               |
| Apex intermittently shows the **old** site                   | Stale `A`/`AAAA` apex records pointing at the old host           | Remove every non-GitHub apex `A`/`AAAA` record (Step 1 note); keep only the 8 GitHub IPs.                 |
| GitHub won't verify the domain                               | DNS not propagated yet, or `www` CNAME wrong                     | Wait for propagation; confirm `www` CNAME → `wolfwdavid.github.io` and the four `A` records resolve.      |

---

## Reference — apex DNS values (GitHub Pages, stable)

- A (apex `@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- AAAA (apex `@`): `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
- CNAME (`www`): `wolfwdavid.github.io`
- Pages host for the apex: user subdomain `wolfwdavid.github.io` (repo owner is GitHub user `wolfwdavid`).
