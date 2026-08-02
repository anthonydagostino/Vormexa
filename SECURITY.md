# Security

Vormexa's security model is unusually simple because of one architectural fact:

> **There is no backend. Every file is processed entirely in your browser and
> never leaves your device.**

That single property removes the biggest category of risk that other "online
converter" tools carry — a server holding your files that can be breached.
Vormexa has no such server, no user database, and no file storage. This document
explains what that means and the controls that back it up.

## Threat model

| Classic risk | Does it apply to Vormexa? |
| --- | --- |
| Server data breach (files/DB leaked from our servers) | **No** — there is no server and no database. Files exist only in your browser's memory and are gone when the tab closes. |
| Files uploaded to a third party | **No** — nothing is uploaded. The only outbound request is license validation (see below), which sends *only* a license key. |
| Account takeover / password leak | **No** — there are no accounts and no passwords. |
| Cross-site scripting (XSS) | Mitigated in depth — see controls below. |
| Clickjacking | Blocked (`frame-ancestors 'none'` + `X-Frame-Options: DENY`). |
| Malicious/compromised dependency exfiltrating files | Mitigated by a strict `connect-src` allowlist in the CSP — a script cannot open a network connection to anywhere except our own origin and the license API. |
| Supply-chain vuln in a dependency | Monitored via `pnpm audit` (clean; see below). |

## What actually leaves the device

Exactly one thing: when a user activates Pro, the app calls **Lemon Squeezy's
public license API** (`api.lemonsqueezy.com`) to activate/validate the license
key. The request body contains **only the license key and an instance name** —
never any file, filename, or file content. Payments themselves are handled
entirely by Lemon Squeezy (the merchant of record); Vormexa never sees card data.

Everything else — video/audio transcoding (ffmpeg.wasm), image processing
(Canvas), PDF operations (pdf-lib / pdf.js) — runs 100% locally.

## Controls

### Content-Security-Policy (defense in depth)

A strict CSP is served on every response (`vercel.json`, `public/_headers`; the
`pnpm preview` server mirrors it minus the https-only
`upgrade-insecure-requests`). The key directives:

- `connect-src 'self' blob: data: https://api.lemonsqueezy.com` — **this is the
  anti-exfiltration control.** Even if malicious markup were somehow injected, it
  could not send data to any attacker-controlled host.
- `script-src 'self' 'wasm-unsafe-eval' blob:` — no inline/remote scripts; only
  our own bundle. `'wasm-unsafe-eval'` + `blob:` are the minimum needed for
  ffmpeg.wasm and the pdf.js worker (verified by an e2e test that runs a real
  ffmpeg encode and asserts zero CSP violations).
- `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`,
  `form-action 'self'` — lock down plugins, base-tag hijacking, framing, and
  form exfiltration.

### Other security headers

- `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy:
  require-corp` — cross-origin isolation (also required for ffmpeg's fast
  multi-thread core). This blocks the app from embedding cross-origin resources.
- `Strict-Transport-Security` (2-year, `includeSubDomains; preload`) — enforce
  https.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera,
  microphone, geolocation, USB, payment, and FLoC.

### Application code

- **No dangerous DOM sinks.** The codebase contains no `innerHTML`,
  `dangerouslySetInnerHTML`, `eval`, `new Function`, or `document.write`. React's
  default auto-escaping handles all rendering.
- **External links** all use `rel="noopener noreferrer"`.
- **Filenames are sanitized** before being used as download names or inside the
  ffmpeg virtual filesystem, so a crafted filename can't inject a path separator
  or traversal (unit-tested).
- **Self-hosted assets only** — fonts, the ffmpeg core, and the pdf.js worker are
  all served from our own origin; there are no third-party CDNs or trackers whose
  compromise could affect users.

### Dependencies

`pnpm audit --prod` is part of the release checklist and currently reports **no
actionable vulnerabilities**. React Router is pinned to a patched release
(`>=7.18.2`), which fixes the open-redirect / redirect-XSS advisories.

One advisory is explicitly ignored in `package.json`
(`pnpm.auditConfig.ignoreGhsas`): **GHSA-qwww-vcr4-c8h2** ("React Router RSC Mode
CSRF Bypass"). It only affects React Router's **React Server Components /
server-action mode**, which requires a server runtime. Vormexa is a static,
100% client-side SPA (`BrowserRouter`, no loaders, no actions, no SSR/RSC), so
the vulnerable code path does not exist in this app. The only published fix is
React Router v8, which requires React 19; that upgrade is tracked separately and
is not warranted to patch a code path we don't use.

### The license gate is intentionally "soft"

Pro gating is enforced client-side (a license key validated against Lemon
Squeezy and cached in `localStorage`). This is **soft DRM by design** — a
determined user could bypass it. That's an accepted trade-off for a private,
offline, client-side tool: we sell convenience and support, not un-crackable
access, and we never hold user data hostage to do it.

### Desktop app

The Tauri desktop build relies on Tauri's process isolation and a minimal
capability set (only the `opener` plugin, used to open checkout/support links in
the user's real browser). It ships no broad filesystem or shell capabilities.

## Testing

Security-relevant behavior is covered by automated tests:

- **Unit/integration (Vitest, 100 tests):** filename/path sanitization, the
  paywall gate, license activation/validation error paths, and config invariants.
- **End-to-end (Playwright, 5 tests):** the real production build is driven in a
  headless browser under the production CSP, including a full **ffmpeg.wasm audio
  encode that asserts zero CSP violations**, plus the Canvas and PDF pipelines
  and the Pro paywall.

Run them with `pnpm test` and `pnpm test:e2e`.

## Reporting a vulnerability

If you find a security issue, please email **security@getvormexa.com** (or
support@getvormexa.com) with details and steps to reproduce. Because Vormexa
holds no user data, most issues are client-side hardening matters, but we take
all reports seriously and will respond promptly.
