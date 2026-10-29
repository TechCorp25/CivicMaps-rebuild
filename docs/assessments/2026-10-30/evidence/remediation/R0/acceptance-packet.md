# Neutral independent assessment request — R0

Assess R0 against the following acceptance criteria and resulting product/evidence. Determine correctness independently. Inspect the pinned source and reproduce checks where possible. Do not infer intent or rely on builder claims.

## Contract

- Task ID/version: CivicMaps-rebuild remediation plan 1.0.0, R0.
- Baseline source SHA: `700d3f0e3334f64461d9576cc6f784eba572138a`.
- Required outcome: reproducible verification of checkout/branch, clean starting source, Node/npm pins, locked setup, isolated synthetic PostgreSQL instance/database/runtime, browser and Caddy availability; record limitations and unresolved Context7 requirement. Do not reuse historical pass results.
- Acceptance criteria: tool versions and commands are reproducible; database is isolated; scope and unresolved Context7 requirement are explicit; no old results are relabelled as fresh.
- R1 and R2 must remain pending until their own work and checks. This R0 packet does not assess them.

## Product inventory

- `docs/assessments/2026-10-30/evidence/remediation/R0/environment.md` — R0 commands, observed results and limits.
- `docs/assessments/2026-10-30/remediation-checkpoint.json` — machine-readable goal state.
- `docs/assessments/2026-10-30/remediation-plan.md` — authoritative goal contract.
- `docs/plans/independent-product-audit-protocol.md` — independence and report protocol.

## Reproduction

Use a fresh worktree at the candidate SHA and a separate disposable loopback-only PostgreSQL 15.18 instance/container on a unique port and synthetic database/runtime. Check `.node-version`, `packageManager`, run `npm run setup`, run migrations and synthetic seeds against only that database, launch Chromium using the configured system executable, and inspect Caddy binary/configuration availability. Search the connected tool inventory for Context7; do not treat historical references as retrieval. Compare all observations to `environment.md` and report commands/results, findings, limitations, and verdict. Do not use credentials or customer data.

## Input integrity

The packet is frozen by the candidate commit SHA. The coordinator should supply SHA-256 values for this file and the environment evidence in the review manifest. No scratch notes, private reasoning, builder conversation, or historical test reports are part of the permitted inputs.
