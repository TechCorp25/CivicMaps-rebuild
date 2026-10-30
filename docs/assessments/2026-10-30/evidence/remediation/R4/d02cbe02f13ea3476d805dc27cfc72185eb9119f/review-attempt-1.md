# Independent R4 review — attempt 1

- Verdict: **blocked — required hosted CI still running**
- Plan: 1.0.0, Goal R4
- Candidate: `d02cbe02f13ea3476d805dc27cfc72185eb9119f`
- Accepted product baseline: `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`
- Checker: GPT-6 Astra, reasoning effort low, fresh context (`fork_turns="none"`)
- Checkout: `/workspace/work/remediation-2026-10-31/checker-R4`, detached and clean; no files edited
- Review timestamp: 2026-10-30T12:05:38Z

## Verified evidence

- **49/49** R4 evidence hashes and **573/573** product hashes verified. Manifest inventory exactly matches its declared tracked paths, with no missing or extra files.
- Product manifest SHA-256: `de7adfb6af773d9c1059e99e6da30875a2db6eae2e522b7a65f3ca666a27036e`.
- Evidence checksum-file SHA-256: `6f51581046dc6ec9f19e7f57e717d34142d0805ac8037b4469eeb711f5d86f26`.
- Product diff against accepted R1 is empty, including all paths outside assessment documentation.
- Local evidence supports pinned Node/npm, locked setup, separate synthetic PostgreSQL, locked Chromium, verified CI-matching Caddy, full check (114 passed; zero failures/skips), four sequential browser suites, both Caddy tests, zero-advisory production/full audits, and token consistency.
- Current independent Context7 queries corroborated all five recorded dependency topics and declared version qualifications.
- Independently reproduced the Vite manifest guard and actual Caddy ingress-contract test successfully. Verified Caddy archive SHA-512 against CI.
- Accepted prerequisites map AUD-001 to R1 and R2-E01/E02 to R2. No additional defect or R3 goal identified.

## Outstanding hosted gate

Independent GitHub API queries confirmed both workflows target the exact candidate:

| Workflow | Run | Result at review |
| --- | ---: | --- |
| Dependency advisory review | 41052458823 | Completed successfully |
| Implemented application checks | 41052458962 | In progress |

Application CI had passed setup, full check, token verification, both ingress checks, Chromium installation, map browser and Platform browser. CommandMAPS browser was running; activation browser and final job completion remained pending. This is a blocking acceptance gate, not a confirmed product defect. R4 must remain unaccepted pending successful completion.

## Reproduction

```sh
git rev-parse HEAD
git status --porcelain
sha256sum -c docs/assessments/2026-10-30/evidence/remediation/R4/product-tree-manifest.sha256
node scripts/verify-vite-manifests.mjs
CIVICMAPS_CADDY_BINARY=/workspace/work/remediation-2026-10-31/tools/caddy/caddy \
  node tests/ingress-contract.mjs
```

From the R4 evidence directory: `sha256sum -c evidence-SHA256SUMS.txt`.

Limits: this review inspected local PostgreSQL/browser qualification evidence rather than rerunning those suites. Installer, namespace, registry and metadata-capture failures are retained. Local ingress covers HTTP fixtures, not public TLS identity. Live providers, production operations and GIS spatial accuracy remain outside this assessment.
