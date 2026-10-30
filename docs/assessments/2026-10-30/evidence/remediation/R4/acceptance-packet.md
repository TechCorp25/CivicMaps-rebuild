# R4 integrated qualification packet

Task: CivicMaps-rebuild remediation plan v1.0.0, Goal R4. Qualification date/timezone: 2026-10-30 UTC; Context7 guidance was retrieved on the same date/timezone. This packet supplies reproducible local qualification evidence and the resulting product for an independent assessment. It does not grant acceptance.

## Frozen source and scope

- Accepted prerequisite source: R1 product `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`; R2 accepted at `bfdf6f3fcd7e7d36fd28bde35d2df31986517846`; R3 family is recorded not applicable in the authoritative checkpoint.
- R4 builder checkout started clean at receipt `d793d79fbc8f9e1b522f47b4d93debb29095b1a7`, branch `codex/remediation-r4-builder`.
- The code/product paths were not changed for R4. The exact containing commit for this evidence packet is the candidate commit on this branch; the coordinator handoff supplies its full SHA. The R4 checker must assess the exact coordinator-published candidate and verify the product manifest.
- Product manifest inputs: tracked `apps/`, `services/`, `tests/`, `scripts/`, `infrastructure/`, `geo-data/`, `data/`, `_ds/`, root package manifests, `.node-version`, and both CI workflow files. The manifest file digest is `de7adfb6af773d9c1059e99e6da30875a2db6eae2e522b7a65f3ca666a27036e`; per-file hashes are in `product-tree-manifest.sha256`.
- No hosted CI result is claimed. The coordinator triggers hosted CI only after publishing the candidate.

## Acceptance criteria

R4 requires current installed-version-compatible dependency guidance, `npm run setup`, full `npm run check`, all four browser suites run sequentially, both actual Caddy ingress checks using the CI-matching verified Caddy binary, production and full dependency audits, generated-token consistency against Git, and any additional CI qualification. Tool pins and the isolated synthetic PostgreSQL, Chromium and Caddy must be evidenced. Preserve failures and limitations. Hosted CI must succeed at the published candidate before final R4 acceptance.

## Environment and provenance

- `.node-version`: `24.19.0`; `node -v`: `v24.19.0`; root `packageManager`: `npm@11.9.0`; `npm -v`: `11.9.0`.
- `npm run setup` used the repository script `npm ci --ignore-scripts --bin-links=false --no-audit --no-fund`, installed 238 packages, exit 0. The lockfile tree versions were Express 5.2.1, React/React DOM 19.2.0, pg 8.20.0, Playwright 1.58.2, and Vite 6.4.5.
- PostgreSQL: 15.18; separate container `civicmaps-r4-builder-20261031`, database/role `civicmaps_r4_builder`, synthetic-only and trust-authenticated, bound only to `127.0.0.1:55481`. Test CLI calls use the inspectable wrappers in `pg-client-wrappers/`, which forward into that container. No production or customer database was used.
- Browser suites used Playwright Chromium 145.0.7632.6 downloaded for locked Playwright 1.58.2. Host `/usr/bin/chromium` is 154.0.8037.57. `node ... install --with-deps chromium` could not install OS packages because this container's `su` authentication is unavailable; Chromium itself was acquired with the Playwright installer and all four suites passed. The failure and exit are retained in `execution/browser-setup/`. The first sandbox-only Playwright launch also failed with `Operation not permitted`; an elevated-path launch succeeded and printed the locked browser version. All four suites ran through that permitted browser path and passed.
- Caddy v2.10.2 binary: `/workspace/work/remediation-2026-10-31/tools/caddy/caddy`; CI archive SHA-512 verified as `747df7ee74de188485157a383633a1a963fd9233b71fbb4a69ddcbcc589ce4e2cc82dacf5dbbe136cb51d17e14c59daeb5d9bc92487610b0f3b93680b2646546`. Actual ingress checks passed over local loopback HTTP fixtures. Public certificate issuance/TLS identity were not exercised by those fixtures.
- Current Context7 retrievals, exact library IDs, versions, topic/source references, and version limits are in `context7-guidance-review.md`.

## Commands and results

All listed commands were run in this worktree after the locked setup. Each raw stdout/stderr transcript and exit status is in `execution/`; successful npm audit JSON reports are retained under `execution/audit-success/`.

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run setup` | 0 | 238 locked packages installed with scripts and bin links disabled. |
| `npm run check` | 0 | Manifest guard, lint, format, both typechecks/builds, integration suite; 114 pass, 0 fail, 0 skipped, 0 todo. |
| `node tests/ingress-contract.mjs` with `CIVICMAPS_CADDY_BINARY` | 0 | Actual Caddy host allowlist, authority preservation, secret injection and forwarding-header rejection passed. |
| `node tests/ingress-login.mjs` with `CIVICMAPS_CADDY_BINARY` and isolated DB | 0 | Actual Caddy + Express independent socket/client limits, tenant/platform separation and spoofed/duplicate header overwrite checks passed. |
| `npm run audit:dependencies` (registry-connected retry) | 0 | Production and all-dependency audits each report 0 high/critical, 0 low/moderate and 0 informational vulnerabilities. The first restricted attempt returned invalid JSON and is preserved separately; it is not counted as a pass. |
| `npm run test:map:browser` | 0 | Map readiness, auth-loss cleanup, mode changes, cancelled geocoding and canonical pin tokens passed. |
| `npm run test:platform:browser` | 0 | Platform registration/provisioning, retry/reconcile, crash recovery, scope, malformed response and narrow-layout checks passed. |
| `npm run test:commandmaps:browser` | 0 | CommandMAPS lifecycle, database/audit, scope denial, logout and narrow layout passed. |
| `npm run test:activation:browser` | 0 | First-admin activation, expiry/reissue, one-use activation, sign-in/reload, least privilege and revocation passed. A port 5173 fallback warning was emitted; the runner selected an alternate port and passed. |
| `git diff --exit-code -- apps/commandmaps/src/tokens.css apps/civicmaps-platform/src/tokens.css` | 0 | Generated token files remained identical to Git after checks/builds. |

Browser commands were executed in the exact order shown above after ingress tests; no browser commands overlapped. Full command lines, database environment, logs, and exits are preserved in `execution/commands.md`, `execution/*.log`, and `execution/*.exit`.

## Failures and limits retained

- Initial unprivileged dependency audit attempts did not return valid JSON. A subsequent registry-connected execution returned valid production and full reports and passed; initial outputs are retained under `execution/audit-initial/`.
- Playwright `install --with-deps chromium` exited 1 because system dependency installation attempted `su` and received `Authentication failure`. Playwright’s locked Chromium download succeeded and all four browser suites passed on it. This is a host package-installer limit, not a browser-suite failure.
- Activation emitted the Vite fallback-port warning described above. It exited 0; no app listeners remained after completion.
- No hosted GitHub Actions run is included. Coordinator publication and hosted CI are outstanding. The local green runs do not stand in for hosted CI.
- The first metadata-capture command failed due to SQL quoting and a Docker inspect-template field that was unavailable on the container object. Its log is retained as `execution/provenance-initial.log`; corrected metadata was captured in `execution/provenance.log`. This did not execute or alter product code.

Neutral independent request: “Assess this product against this task and constraints. Determine correctness independently. Inspect the pinned source and reproduce checks where possible. Do not infer intent or rely on builder claims.”
