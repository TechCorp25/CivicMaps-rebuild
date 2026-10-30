# Independent R1 assessment

Verdict: **pass** for R1 at the exact candidate below. No R2 or final integrated acceptance is implied.

Task: CivicMaps-rebuild remediation plan 1.0.0, R1. Review date: 2026-10-31 UTC.
Checker assignment: GPT-6 Astra, low reasoning effort, fresh context (`fork_turns=none`). No inherited builder conversation, reasoning, diary, self-evaluation or broad Empirical history was consulted. The supplied favourable report and environment narrative were excluded from content review. The authoritative task/acceptance contract, resulting source and raw evidence were used. The prior R0 verdict did not substitute for any R1 check.

Candidate: `122e56de88923a2eabc075ed677a15299049436c`.
Base: `9174ac53a5def003b85f508714e458767927531a`.
Detached checkout: `/workspace/work/remediation-2026-10-31/checker`; HEAD verified, initial and final tracked/untracked Git status clean. No source edits or publication performed.

## Provenance

Permitted-input manifest: `input-manifest.sha256`, SHA-256 `dd5a1ba9ea6cdb7e082f4d935181816ded392c511c54edd1ba380378a523e248`. It inventories the acceptance contract, source, relevant executable tests/configuration and supplied raw evidence. Hash verification of the supplied evidence manifest passed all 28 entries from its intended directory; hashing excluded narratives for integrity did not treat their contents as evidence. The manifest also covers the resulting application source, tests and scripts inspected/executed.

- `package.json`: `3ec3a6ea43a81dbd62a353e09028ee7b8844b7fbf0b4bec51cbf7cc956315104`.
- `package-lock.json`: `6e43a6d4df2435ad77b905c4b8231e3db827cbfc1d407e0105122ec3eab34d41`.

The product diff changes only Vite 6.4.4 to 6.4.5 in these two files, including resolved tarball and integrity; remaining changed files are assessment evidence/checkpoint material. Node v24.19.0 and npm 11.9.0 match repository pins. Setup still uses `npm ci --ignore-scripts --bin-links=false --no-audit --no-fund`.

## Independent results

Exact commands and environment selectors are in `commands.txt`; first failures are retained in `attempts.log`, `audit.log`, `audit/`, and `supplied-checksums.log`.

| Check | Result |
| --- | --- |
| `npm run setup` | Exit 0; 238 packages installed from committed lock |
| Installed/locked Vite | Both 6.4.5; `npm ls vite --all` shows a single Vite; locked package entries contain no Vite 6.4.4 |
| `npm run check` | Exit 0; lint, format, both typechecks/builds; 114 tests passed, 0 failed/cancelled/skipped/todo |
| `npm run audit:dependencies` | Retry exit 0; production and full scans each zero vulnerabilities, including zero high/critical and no AUD-001; no remaining advisory requiring triage |
| `npm run test:map:browser` | Exit 0 |
| `npm run test:platform:browser` | Exit 0 |
| `npm run test:commandmaps:browser` | Exit 0 |
| `npm run test:activation:browser` | Exit 0 |
| Bounded Vite smoke | Exit 0; ordinary page/module 200; `.env` direct, `?import`, `?raw` requests 403; marker absent |
| Supplied evidence checksums | All 28 verified |

Four browser commands ran sequentially. Tests created separate disposable synthetic databases via checker base `127.0.0.1:55472/civicmaps_checker`, using dedicated container `civicmaps-r1-checker-122e56de` and PostgreSQL 15.18. Docker image digest: `sha256:6eb0add3b77c081df18aa518ce43df58fdcc40f2e6d868a6fd08038dc7acd425`. Container publication is loopback-only. Existing Playwright Chromium binaries were reused read-only; browser processes, database and test runtime were independent. Activation reported occupied port 5173 and successfully selected another port; it did not attach to the occupying service.

Missing host PostgreSQL clients were addressed with inspected copies of the transparent supplied wrappers, changed only to checker container/user. They execute real PostgreSQL 15 tools, redirect connections to container loopback, stream pg_dump output and copy temporary restore archives. This is an environment adapter, not a mock or product modification. Backup tests passed through it. Native host-client execution was not independently repeated.

## Advisory and behaviour assessment

Fresh public GitHub advisory retrieval still identifies GHSA-8g5g-mxqh-grgj / CVE-2026-118662, affected range exactly 6.4.4, first patched 6.4.5, not withdrawn. Fresh npm metadata agrees with locked version/integrity and supports the pinned Node version. Thus 6.4.5 is the smallest compatible patch supported by this evidence.

The linked upstream commit `91e40d7bf9777057bbd31c3eb036a54c9465697e` adds access checking on `cleanUrl(id)` alongside the original id for raw/url/inline/svg transforms. That logic is present in installed `node_modules/vite/dist/node/chunks/dep-CkSfqg8D.js:37438`. Both app Vite configurations allow the repository parent tree and do not explicitly expose a network host. The narrow synthetic smoke uses explicit loopback, strict allow/deny settings and temporary synthetic data. Its printed Vite version is hardcoded, so installed/locked version evidence was verified independently. This is behaviour compatibility/deny-path evidence, not a vulnerable-version exploit reproduction or exhaustive query-bypass proof.

## Findings and limitations

No blocking R1 product defect found. One nonblocking evidence wording discrepancy: `acceptance-packet.md` says CI installs native PostgreSQL client tools; `.github/workflows/ci.yml` has no explicit client installation step. Reproduction: inspect that workflow's steps. This does not invalidate the independently passing wrapper-backed suite, but the statement should say CI uses its runner's available tools unless installation is added or runner inventory evidenced.

Initial sandbox Docker/proxy restrictions caused environmental failures; approved escalation allowed the same local daemon and configured proxy. The initial checksum command used the wrong directory and was corrected. Initial npm view was interrupted while stalled (exit 130); fresh retrieval succeeded. These attempts are preserved, not relabelled as successes.

No callable Context7 tool was discovered; no Context7 evidence is claimed. Its explicit external requirement remains open for R2/final overall completion per the plan. No hosted CI, actual Caddy ingress, live provider qualification, customer data, production rollout, R2 coverage or exhaustive security assurance is claimed. The R1 full check and all four browser suites were freshly reproduced successfully at the candidate.
