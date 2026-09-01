# SAST findings — the awell-extensions register

The method for remediating Aikido SAST findings lives in the `sast-remediation` skill
(`awell-security` plugin, `awell-health/skills`). This file is what the skill cannot carry: what is
specific to **this** repository. Read it before starting a pass; update it in the same change
whenever you suppress, ignore, or defer a finding.

## This repo in Aikido

- **Repo name:** `awell-extensions`.
- **Group id: `6344`** — *not* the `5732` group that holds the GitLab repos. This matters: an
  unfiltered `aikido_issues_list` returns one group, so this repo is **absent** from a sweep scoped
  to the other one, not empty. A remediation pass in 2026-09 reported "all repositories triaged"
  having never queried this group. Always scope by `repo_name`.
- **Suppression preference: code over dashboard.** Findings left open carry a
  `// nosemgrep: <RULE_ID>` on the line directly above, with the reasoning in the comment block
  above that.

## Ignore register

### Suppressed in code with `// nosemgrep`

| Findings | Where | Fix that shipped | Why it still flags |
| --- | --- | --- | --- |
| 430082566, 78568634, 78568638, 78568636, 423170869 — group **3578098** | `external-server/v1/actions/mtls.ts`, `external-extension.ts`, `landingAi/lib/api/client.ts` (×2), `metriport/actions/webhookBundle/fetchBundle.ts` | Every request now goes through a `request-filtering-agent` agent. See below. | `AIK_js_ssrf` is a sink detector: it flags `axios.get`/`post` with any non-literal URL, whatever guards it. **Verified by scanning a control** — a byte-identical copy without the comment flags; the suppressed file is clean. |

## SSRF protection: `request-filtering-agent`

Several extensions fetch a URL that arrives as *data*, from a process running inside the cluster:

| Site | Where the URL comes from |
| --- | --- |
| `external-server` `mtls` / `externalServer` | `settings.url`, destructured from the event payload by `PayloadSchema.parse(payload)` and validated only as `z.string()` |
| `landingAi` | `input.body.pdf` / `input.body.image` — care-flow data |
| `metriport` `fetchBundle` | a pre-signed URL from a webhook payload |

A URL naming `169.254.169.254`, `10.x`, or `127.0.0.1` turns "call my server" into "call something
only the cluster can reach". **A domain allowlist is not available** — the whole point of these
actions is calling a server the customer names — so we block destinations instead, which is the
mitigation Aikido's own remediation text points at.

The protection is [`request-filtering-agent`](https://github.com/azu/request-filtering-agent), an
http/https `Agent` that refuses private, loopback, link-local and reserved addresses. Passing
`useAgent(url)` as both `httpAgent` and `httpsAgent` is the whole integration.

**Why a library and not our own guard.** An earlier version of this fix hand-rolled the IP range
checks. The library is strictly stronger on the two limits that guard could not reach:

- **It validates after DNS resolution**, so `http://internal.example.com` pointing at `10.0.0.5` is
  refused — and so is a rebinding name like `127.0.0.1.nip.io`. Measured locally; not covered by
  the repo test, which stays offline so CI does not depend on a third-party resolver.
- **It validates every connection the agent makes**, so a permitted host that 302s to
  `169.254.169.254` is refused on the redirect hop.

**Pinned to the 2.x line on purpose.** 3.x is ESM-only (`"type": "module"`) and this repo's jest
runs CommonJS — importing 3.x fails every suite that touches it with `Cannot use import statement
outside a module`. 2.0.1 is CommonJS and is **not** affected by GHSA-pw25-c82r-75mm (HTTPS-to-
127.0.0.1 bypass), which was fixed in 2.0.0. Behaviour was measured as identical to 3.2.1 across
loopback, rebinding, link-local, IPv4-mapped IPv6 and RFC1918. Moving to 3.x means configuring jest
for ESM first.

`src/utils/ssrfProtection/ssrfProtection.test.ts` is a **contract test for the dependency**, not for
our code: it pins the behaviours we rely on so an upgrade cannot quietly weaken them.

### The mTLS action composes two agents

`extensions/external-server/v1/actions/mtls.ts` cannot just pass `useAgent(url)`: `helpers.httpsAgent()`
is built by the host and carries the tenant's mTLS client certificate, and axios accepts only one
https agent. The filtering agent is therefore constructed from the mTLS agent's own TLS options:

```ts
const mtlsAgent = helpers.httpsAgent()
httpsAgent: new RequestFilteringHttpsAgent({ ...mtlsAgent?.options })
```

**This is lossless only because both host implementations return a plain `https.Agent`** —
`cli/src/helpers.ts` (`new https.Agent(opts)`) and `awell-extension-server`
`src/helpers/helpers.ts` (`new https.Agent({ ...opts, key: TLS.KEY, cert: TLS.CERT })`). If a host
ever returns an `https.Agent` *subclass* with overridden behaviour, copying `.options` would silently
drop it and break mTLS. Re-check both implementations before touching this.

## Repo-specific traps

**`external-server` ships.** Its description says "used for prototyping" and its README is a stub,
but `ExternalServer` is registered in `extensions/index.ts`, so it is a published extension like any
other. Do not treat it as dev-only when assessing reachability.

**A `nosemgrep` must sit above the line the finding *anchors* to, which is not always the call.**
For `AIK_js_ssrf` on an `axios.post<{...}>(...)` whose generic parameter spans several lines, the
finding anchors on the **URL argument**, not on the `await axios.post` line. A comment above the
statement does nothing; it has to go directly above the URL expression — which sometimes means
breaking the arguments onto their own lines. Both external-server actions needed this. Confirm with
`aikido_full_scan` rather than assuming placement worked.

**Run jest through yarn, not npx.** `npx jest` resolves a fresh jest that cannot read
`jest.config.js` (`Cannot find module` on its first require). `yarn jest <path>` works.

**Workflow permissions are set per job, not per workflow** — see `.github/workflows/create-release.yml`.
Five workflows still set none at all and inherit the repository default; each needs a different
scope (`auto-assign-ai-actions` needs issues/pull-requests write, `pre-release` pushes with
`VERSION_BUMP_TOKEN`, the rest only check out). That is unfinished work, not an oversight.
