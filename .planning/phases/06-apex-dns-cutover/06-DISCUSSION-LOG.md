# Phase 6: Apex DNS Cutover - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-19
**Phase:** 6-apex-dns-cutover
**Areas discussed:** Registrar & DNS access, www subdomain policy, Go-live timing & email safety, Rollback / abort criteria

---

## Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Registrar & DNS access | Which host controls DNS; access status | ✓ |
| www subdomain policy | Behavior of www.michellengo.net | ✓ |
| Go-live timing & email safety | When to flip; preserve MX/TXT | ✓ |
| Rollback / abort criteria | Cert-wait tolerance, rollback trigger | ✓ |

**User's choice:** All four.

---

## Registrar & DNS access

| Option | Description | Selected |
|--------|-------------|----------|
| Cloudflare | DNS via Cloudflare, proxy must be off | |
| Namecheap | Namecheap Advanced DNS | |
| GoDaddy | GoDaddy DNS Management | |
| Other / not sure | Identify registrar first | (intent) ✓ |

**User's choice (registrar):** "I will keep it on gh pages for now please" / "please only use gh pages."
**User's choice (access):** "please only use gh pages."
**User's choice (old site):** Already on GitHub Pages.

**Notes:** A live diagnostic (`curl -sI https://michellengo.net/`) contradicted the "already on
GitHub Pages" belief — response headers showed `Host-Header: WordPress.com`, `wp-json`, and
`X-ac: _atomic_dca`, proving the apex is still served by WordPress.com. Surfaced to the user. The
"gh pages only" phrasing was interpreted as: target host = GitHub Pages native custom domain, no
other provider/proxy. A follow-up clarified intent and DNS control (below).

---

## Cutover intent (follow-up after WordPress.com finding)

| Option | Description | Selected |
|--------|-------------|----------|
| Plan the full flip now | Produce a plan for the real DNS cutover | ✓ |
| Defer the flip, keep WordPress live | Pause Phase 6 | |
| Prep only, don't flip yet | Stage reversible work, stop before registrar change | |

**User's choice:** Plan the full flip now.

| Option (DNS control) | Description | Selected |
|--------|-------------|----------|
| WordPress.com / Automattic | DNS managed in WordPress.com domain settings | ✓ |
| Separate registrar, NS → WordPress | Registered elsewhere, NS delegated | |
| Not sure — need to check | Identify via WHOIS first | |

**User's choice:** WordPress.com / Automattic.

---

## www subdomain policy

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect www → apex | www CNAME → wolfwdavid.github.io; GitHub auto-redirects to bare apex | ✓ (interpreted) |
| www as primary | Make www canonical | |
| Apex only, ignore www | Don't configure www | |

**User's choice:** "make it for the gh pages only please" — interpreted as the runbook default:
www points at GitHub Pages and redirects to the canonical bare apex.

---

## Email safety

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve email — don't touch MX/TXT | Only change apex A/AAAA + www | ✓ |
| No email on this domain | Ignore MX/TXT | |
| Not sure | Treat as preserve | |

**User's choice:** Preserve email — don't touch MX/TXT.

---

## Go-live timing

| Option | Description | Selected |
|--------|-------------|----------|
| ASAP once plan is ready | Flip immediately when ready | ✓ |
| Give me steps, I'll pick the moment | No fixed window | |
| Specific low-traffic window | Overnight/weekend | |

**User's choice:** ASAP once plan is ready.

---

## Rollback / abort criteria

| Option | Description | Selected |
|--------|-------------|----------|
| Runbook default | Wait for cert (~24h), rollback = clear custom domain → staging | ✓ |
| Bail fast | Roll back quickly if not serving | |
| I'll decide live | No preset threshold | |

**User's choice:** Runbook default.

---

## Claude's Discretion

- Plan structure / breakdown of human-action checkpoints.
- Exact verification command phrasing and ordering.

## Deferred Ideas

None — discussion stayed within phase scope.
