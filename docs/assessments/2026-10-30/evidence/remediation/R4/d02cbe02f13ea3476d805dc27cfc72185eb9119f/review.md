# Independent R4 integrated qualification review

- Verdict: **accepted**
- Plan: 1.0.0, Goal R4
- Candidate: `d02cbe02f13ea3476d805dc27cfc72185eb9119f`
- Frozen application baseline: `b168dc0ce2b3d28011588b497e8e6fc459c2aa6a`
- Accepted prerequisite product: `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`
- Checker launch: GPT-6 Astra, reasoning effort low, fresh context (`fork_turns="none"`); report notes separate runtime model attestation was unavailable
- Checkout: `/workspace/work/remediation-2026-10-31/checker-R4`, detached, clean initially/finally; no edits or publication
- Review completed: `2026-10-30T12:10:00Z`

## Integrity and prerequisites

- R4 evidence inventory: **49/49** hashes match; no missing or additional packet files excluding the checksum file itself. Checksum-file SHA-256: `6f51581046dc6ec9f19e7f57e717d34142d0805ac8037b4469eeb711f5d86f26`.
- Product inventory: **573/573** hashes match and the manifest inventory matches the declared tracked paths. Product manifest SHA-256: `de7adfb6af773d9c1059e99e6da30875a2db6eae2e522b7a65f3ca666a27036e`.
- Product diff against accepted R1 is empty, including all paths outside assessment documentation.
- Accepted R0/R1/R2 reports were checked. AUD-001 maps to accepted R1; R2-E01/E02 are resolved; R3 is not applicable. No additional defect or required blocker was found.

## Exact-candidate hosted CI

Both current workflow runs target the exact candidate SHA and completed successfully:

| Workflow | Run | Result |
| --- | ---: | --- |
| Implemented application checks #564 | 41052458962 | success |
| Dependency advisory review #145 | 41052458823 | success |

GitHub Actions checked PR merge commit `c49ff8bc5a689c24b31f9f5d77788fdbd6e7d1da`. Its only parents are frozen base `b168dc0ce2b3d28011588b497e8e6fc459c2aa6a` and candidate `d02cbe02f13ea3476d805dc27cfc72185eb9119f`. Its tree `1d0f8e323088b0ff71db5259e688baf7415cba0b` exactly equals local candidate `HEAD^{tree}`. Hosted CI therefore tested the candidate's complete tree.

Foundation job `124051621318` confirms locked setup, lint, formatting, typechecks/builds, 114 passing integration tests with zero failures/skips, generated-token consistency, Caddy archive verification, both actual ingress checks, Chromium installation, and sequential map/platform/CommandMAPS/activation browser suites all passed. Audit job `124051621650` confirms production and full dependency audits completed with zero vulnerabilities.

## Independent qualification

- Local Node 24.19.0 and npm 11.9.0 pins, locked setup, isolated PostgreSQL 15.18 synthetic database, locked Playwright 1.58.2 Chromium 145.0.7632.6, and CI-matching Caddy v2.10.2 were corroborated. Caddy archive and executable hashes match recorded provenance.
- Local full check evidence reports 114 pass, zero fail, zero skipped. Four browser suites were sequential; both actual Caddy ingress suites passed; production/full advisory scans report zero vulnerabilities; generated tokens match Git.
- Context7 R4 records five library families, installed versions, source IDs/URLs, retrieval timestamp, and exact/non-exact version qualifications. Independent R2 review covered all five; this review freshly queried Vite 6, React and pg and corroborated the recorded contracts.
- Independent local checks passed: Vite manifest guard, actual Caddy ingress contract, current dependency audit; generated-token outputs reproduced byte-for-byte in isolation.
- Source checks corroborate the cited contracts in `services/api/database.mjs:71`, `services/api/app.mjs:238` and `:841`, `apps/commandmaps/src/RequestComposer.tsx:79`, `tests/browser-activation.mjs:51`, and both application Vite configurations.

## Preserved failures and limits

The evidence retains the initial local ingress `listen EPERM`, invalid-JSON audit attempts, Chromium system dependency installation authentication failure, sandbox browser launch failure, provenance-capture errors, and activation fallback-port warning, with successful retries separated. This review did not repeat locked installation, the full PostgreSQL suite, all four browser suites, or ingress-login; it verified hashed local evidence and independently retrieved successful hosted logs for the identical candidate tree.

Public TLS issuance, live provider/billing qualification, production operations, exhaustive accessibility conformance and GIS spatial accuracy remain outside the assessment. Historical Context7 retrieval transcripts are not retained; the recorded retrieval, accepted R2 review and fresh bounded queries support the guidance requirement. No required R4 criterion remains unverified.

This acceptance is limited to R4. R5 handoff remains separate. No merge or deployment is authorised.
