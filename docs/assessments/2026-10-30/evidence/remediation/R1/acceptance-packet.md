# Neutral independent assessment request — R1

Assess R1 against the authoritative remediation plan and the pinned source SHA recorded in the checkpoint. Determine correctness independently. Inspect the pinned source, lockfile and supplied raw evidence; reproduce checks where possible. Do not rely on builder claims.

## Contract

- Task ID/version: CivicMaps-rebuild remediation plan 1.0.0, R1.
- Baseline source SHA: `9174ac53a5def003b85f508714e458767927531a`.
- Candidate source SHA: `122e56de88923a2eabc075ed677a15299049436c` (R1 product candidate; the following ledger commit changes evidence/checkpoint records only).
- Required outcome: remove the verified Vite 6.4.4 advisory finding with the smallest supported compatible patch, preserve npm 11.9.0 setup semantics, and retain exact dependency and behavior evidence.
- Acceptance: installed and locked Vite agree; vulnerable Vite 6.4.4 is absent; production/full dependency scans have no AUD-001 or new high/critical advisories; remaining advisories are explicitly triaged; locked setup, full check and all four sequential browser suites pass; dev-server behavior is reviewed without claiming an unsupported exploit reproduction.
- Do not infer R2 completion from R1. Context7 is not supplied as satisfied evidence; its status remains explicit.

## Product inventory

- `package.json`, `package-lock.json` — exact Vite patch update.
- `../../../remediation-checkpoint.json` — R0 accepted, R1 review state and exact candidate SHA.
- `report.md` — R1 factual evidence index.
- `advisory.json`, `vite-registry-metadata.json` — raw vendor/registry records.
- `check-final.log`, `dependency-audit/`, four browser logs, plus `vite-fs-smoke.mjs` and `vite-fs-smoke.log` — raw sanitized execution evidence.
- `postgres-client-wrappers/` — temporary test-environment adapter necessitated by missing host utilities; not product code.

## Reproduction

Use the pinned source commit listed in the checkpoint and a unique loopback-only synthetic PostgreSQL 15 runtime. Run `npm run setup`, verify the exact installed and locked Vite versions, execute `npm run audit:dependencies` with reports retained, `npm run check`, then the four browser commands sequentially. Inspect the repository's current Vite configuration and review the supplied narrow smoke limits. The CI workflow installs native PostgreSQL client tools; where those are unavailable, inspect and use the supplied transparent wrappers or an equivalent same-version client setup. Do not use customer/production data or credentials.

## Review report

Create a fresh-context GPT-6 Astra Low report against the exact candidate SHA with source/manifest hashes, commands actually run, evidence-based findings, unverified criteria, limits and verdict. No prior R0 verdict substitutes for R1 review. Preserve the report immutable in the candidate-specific review directory.
