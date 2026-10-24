# P0 independent assessment assignment — next-build plan v1.1.0

Assess the published portable planning product only. Use a new, isolated GPT-6 Astra Low context (`fork_turns=none`). Repository: `TechCorp25/CivicMaps-rebuild`. Verified phase baseline: `d4921eb1c37550d9ca1b53a5615242922abfa4ad`. Remote draft PR #41 head: `3736b6c08b189a0567ebb7cf35ad81c88ee0bf5a`, tree `12738412b57590ae20c1596e6e73719b7a5ec58f`. Local same-tree commit: `dfde2e461c530c25d1beff1902c9c7ece057e022`, tree must be verified. The versioned plan content is `docs/plans/dispatch-build/next-build-phase.md`, version `1.1.0`, SHA-256 `44e6bb15b003c668cd5a8d71c618b4071694a2121f5eb12f8c98161b46ed4f29`; immutable content permalink is in `docs/plans/dispatch-build/plan-manifest.json`.

Acceptance criteria:
1. Verified exact main baseline and candidate identity; plan hash file and manifest agree with the exact plan bytes and immutable Git permalink.
2. Full portable plan contains reconciled scope/boundaries, M1 and G1 contracts/acceptance, checkpoints, implementation instructions, verification instructions, handoff requirements, and dependencies. It excludes G2 implementation, M2–M7, merge, and deployment.
3. README/programme entrypoint and execution/F11 checkpoints/feature ledger link to v1.1.0 and agree on current statuses. Historical evidence remains distinguishable from current state; old PR #37/6761 references must not be represented as the current base.
4. M1 is reported accepted only for the exact candidate supported by the fresh independent M1 report and raw evidence. Its local DB setup failure is stated as a limitation and not a pass. Owner merge remains required.
5. G1's corrected v1.3 contract, resolved owner choices, unresolved initial authority commissioning blocker, and blocked G2 status are represented consistently without inventing the missing authority.
6. Handoffs are portable: repository URL, branch/base/candidate SHAs, prerequisites, commands, acceptance, audit report/evidence, blockers, and exact next action are recoverable without transient workspace paths.

Inputs to inspect: the exact plan, `README.md`, `execution-checkpoint.md`, `plan-manifest.json`, `next-build-phase.sha256`, `docs/plans/F11-execution-checkpoint.json`, `docs/plans/civicmaps-feature-ledger.json`, G1 v1.3 contract and its source decision receipt, M1 handoff/report and committed raw evidence. Use the existing independent-product-audit protocol only as process guidance. Do not inspect builder conversation, operational narrations outside the frozen product, or treat successful publication as acceptance.

Return PASS, CHANGES_REQUIRED, or BLOCKED with concrete evidence and severity. Save a portable report under `/workspace/audit-evidence/p0-v1.1.0/`, include exact candidate/base/tree and product SHA-256 values, and record raw commands and evidence. Do not edit product files. No merge/deployment recommendation is requested.
