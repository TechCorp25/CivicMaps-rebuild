# Initial audit checkpoint — 30 October 2026

Baseline: `b168dc0ce2b3d28011588b497e8e6fc459c2aa6a` (verified current main). This is the beginning of the audit, not a completed or independent assessment.

## Confirmed dependency finding AUD-001

- Goal A2; severity **medium** (npm classification: moderate); confidence high for affected dependency presence.
- Location: `package.json:54`; Vite pinned to `6.4.4`.
- Registry advisory: [GHSA-8g5g-mxqh-grgj](https://github.com/advisories/GHSA-8g5g-mxqh-grgj), “Vite: server.fs.deny bypassed with queries”. Registry identifies the affected range as exactly 6.4.4 and reports 6.4.5 as a non-major fix.
- Impact: development-server file-denial controls may be bypassed. Actual exploitability under this repository's server exposure/configuration has not been reproduced; this is not a claim about deployed production compromise.
- Reproduction: install committed lockfile with `npm run setup`, then `npm run audit:dependencies`; inspect `all.json` at `vulnerabilities.vite`. Production scope reports zero advisories; full scope reports this one moderate advisory. The command exits successfully because its documented blocking threshold is high/critical.
- Proposed remediation: separately scoped lockfile-compatible Vite patch upgrade, then repeat production/full advisory scans, both builds and affected browser tests. Acceptance: affected dependency absent and relevant checks pass. No dependency change made during this audit checkpoint.

## Bootstrap evidence and limits

Node 24.19.0/npm 11.9.0 match pins. Locked setup installed 238 packages. A dedicated PostgreSQL 15.18 cluster on loopback 55450 migrated and seeded successfully. Chromium headless launch passed. The default sandbox denied loopback sockets and proxy connections; supported elevated execution resolved both. An initial sandbox check was terminated after environment-related failures; its log is retained and is not product-failure evidence.

Context7 is unavailable in connected tools and no local configuration was found. The work plan explicitly requires version-aware Context7 retrieval; that requirement remains unfulfilled. Browser suites and deeper A3–A6 review remain pending. The registry advisory is current retrieved evidence, not Context7 evidence.

Reproduction environment: source `/workspace/work/code-audit-2026-10-30/session-env.sh`, run from `/workspace/CivicMaps-rebuild` using the supported execution permissions. Raw logs are in `/workspace/work/code-audit-2026-10-30`.

## Completed baseline

`npm run check` passed: lint, formatting, both application typechecks/builds and **114/114 tests**, zero failures/skips/cancellations. A0 environment preparation is complete; A1 remains in progress pending the four browser suites and CI coverage review. A2 has begun with the advisory finding above. No overall audit pass is asserted.
