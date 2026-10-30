# Independent R1 corrective assessment

Verdict: **pass** for R1 only.

Checker: GPT-6 Astra (`gpt-6-astra`), low reasoning effort, fresh context (`fork_turns=none`). No builder conversation, reasoning, diary, self-evaluation or broad Empirical history was used. Prior reviews were copied only as part of the frozen checksum inventory, not read or relied on as candidate proof.

Task: CivicMaps-rebuild remediation plan 1.0.0, R1. Candidate: `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`. Corrective base: `122e56de88923a2eabc075ed677a15299049436c`; original R1 baseline in the packet: `9174ac53a5def003b85f508714e458767927531a`. Evidence-only descendant: `b88c7345d41f9b267e4bede3429521f35146cb80`. Initial detached checkout was clean and exactly at candidate; final status remains clean at that SHA. No source changes, commits, push or PR update were made.

Runtime clock observed 2026-10-30T00:47:13Z through 00:50:04Z; the plan/evidence directory uses 2026-10-31. These labels are retained without implying a different execution date.

## Inputs and integrity

Read the authoritative R1 criteria, neutral acceptance packet at candidate and its updated frozen descendant version, exact package/source diff, all repository package manifests, lockfile, manifest guard, Vite configs, dependency audit script, supplied PostgreSQL wrappers, advisory and bounded smoke source. The candidate packet predates the correction; the descendant packet and this task identify the corrected source explicitly.

`input-manifest.sha256` hashes the repository package manifests, lockfile, guard and authoritative plan; its SHA-256 is `3cbdf83c538814751562ccbc845da10a473b0ad422f431bc2c0ec3b6e4efa5db`. All four requested candidate hashes independently matched:

- package.json: `a53fe39e94374401b37c4d1fd7e0da53020292c05cd26ea60d7ea89b5ee69c8f`
- package-lock.json: `6e43a6d4df2435ad77b905c4b8231e3db827cbfc1d407e0105122ec3eab34d41`
- apps/commandmaps/package.json: `b015fa32fb184c8c15976904e702514337d38bdd6b795d9f1869ef2b5c9e1d48`
- scripts/verify-vite-manifests.mjs: `1de8422040bb26584934f9c8e8e23b630323dbcfdb22370547477771699fd9a9`

Frozen R1 aggregate `sha256sum -c SHA256SUMS`, executed from the extracted R1 evidence directory, exited 0; every listed file passed (`supplied-checksums.log`). The source manifest was separately checked from the repository root. Descendant diff inventory contained assessment evidence/checkpoint files, not product changes.

## Independent reproduction

Node 24.19.0 and npm 11.9.0 match the pins. PostgreSQL 15.18 ran in unique container `civicmaps-r1-recheck-20261031`, published only at 127.0.0.1:55473, with synthetic role/database `civicmaps_recheck`. Inspected client wrappers were copied into this report directory and changed only to target that container and role/database. They forward to same-version PostgreSQL tools and stream/copy temporary backup archives. Browser binaries were reused from the installed Playwright cache; databases and browser executions were separate. `run.sh` records exact runtime variables and command order.

Actual process exit statuses (not inferred from test summaries):

| Command | Exit | Evidence |
| --- | --- | --- |
| npm run setup | 0 | setup.log; 238 packages, committed lockfile, ignore-scripts and bin-links=false preserved |
| npm run verify:vite-manifests | 0 | manifests.log; 27 manifests |
| npm ls vite | 0 | installed.log; Vite 6.4.5 |
| npm run audit:dependencies | 0 | audit.log and audit/*.json; zero advisories in production and full scans |
| npm run check | 0 | check.log; guard, lint, format, types, both builds, 114 tests passed, zero failures/skips |
| npm run test:map:browser | 0 | map-browser.log |
| npm run test:platform:browser | 0 | platform-browser.log |
| npm run test:commandmaps:browser | 0 | commandmaps-browser.log |
| npm run test:activation:browser | 0 | activation-browser.log |
| node docs/assessments/2026-10-30/evidence/remediation/R1/vite-fs-smoke.mjs | 0 | vite-smoke.log |

The four browser commands ran sequentially after full check. All required product commands passed on their first execution in this recheck. Initial sandbox Docker access and advisory HTTP access failed, then succeeded with approved execution permissions; absent host psql was handled by the inspected wrappers. These observations are retained in initial-environment-failures.log. An incidental final `tail` display command had invalid option ordering; it was not a product check or evidence of test failure.

## Findings and acceptance

No blocking R1 findings.

The correction changes CommandMAPS' direct Vite pin from 6.4.4 to 6.4.5 and adds a repository traversal guard at the start of `npm run check`. Root manifest, installed package and lock all agree on 6.4.5. Independent tracked-manifest inspection found only root and CommandMAPS Vite declarations, both fixed. No 6.4.4 direct declaration remains. The guard traverses nested directories excluding .git and node_modules and checks dependencies, devDependencies and optionalDependencies. Isolated copies of the guard rejected nested 6.4.4 declarations in all three fields with exit 1 and accepted 6.4.5 with exit 0 (`guard-negative.log`). It does not validate peer dependency compatibility ranges; no current repository peer Vite declaration exists.

Fresh official GitHub advisory retrieval confirms GHSA-8g5g-mxqh-grgj affects exactly 6.4.4 and first patches at 6.4.5 (`advisory-current.json`). This remains the smallest compatible patch. Production and full current npm scans contain neither AUD-001 nor any high/critical advisory. There are no remaining reported advisories requiring triage.

Both application development scripts bind to loopback and their Vite configs allow the repository root. The smoke uses a synthetic temporary root and explicit .env deny pattern: ordinary page/module return 200; plain, ?import and ?raw .env paths return 403 without marker disclosure. This establishes only the recorded bounded deny behaviour. It does not reproduce the vulnerable version, test every query combination, or qualify network-exposed deployment security.

## Limitations and unverified work

No callable Context7 tool was available; no retrieval is claimed. This external requirement remains open for R2/final overall acceptance as specified in the plan. R1 dependency remediation is supported by the official advisory, installed/locked inspection and fresh checks. This verdict does not accept R2, integrated R4, hosted CI, ingress qualification, live providers or production deployment. R0 acceptance remains a coordinator dependency; this report independently verified the required R1 runtime rather than substituting a prior verdict. No customer data or customer credentials were used.
