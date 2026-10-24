# M0 — Architecture and executable backlog

Current execution scope: [M1 discovery and F11 G1 authority contract](../next-build-phase.md). Verified main `6761cd6adcd9f922aed939ccafb75f81cf7eba62`; PR37 merged. This bounded phase excludes G2, M2–M7, merge and deployment. Earlier baseline/runtime statements below are historical snapshots.

Status: architecture/backlog assessment passed on `a1a9a9a969d1d2efc9d1630980adcff3ebaf2b60` (tree `72611aaa7ea2094eef65d1a21b3dcd06761d1f8e`); see [final assessment](../evidence/M0-independent-assessment-a1a9a9a.md). PR #35 merged at `a547b50d2bd641470dbe7f8d26a5ef75ee7ba747`. Receipt-only follow-up PR #37 is merged in main `6761cd6adcd9f922aed939ccafb75f81cf7eba62`.

## Goal and work

Inspect current main, applicable AGENTS, Empirical, preview backend/UI and all relevant design annotations. Produce shared/package ownership matrix and dependency graph; pin sources; establish decisions already approved.

## Dependencies and stop conditions

None; no runtime mutation.

Read current decisions/dependencies before starting. Ask only for unresolved policy affecting this contract. Continue a ready independent milestone when blocked, recording the reason. Do not expand scope to hide an unresolved dependency.

## Acceptance

Architecture, contracts and reference matrix reviewed by stronger model; unresolved owner decisions explicitly scoped.

Required targeted scenarios: docs only; sources exist, links/JSON valid, claims trace to inspected evidence.

## Execution sequence

1. Continue on the programme branch; reconcile current references and governance decisions.
2. Finish source inspection and architecture/contract evidence; no application implementation in this planning packet.
3. Stronger-model assessment passed on the candidate identified above; retain applicable policy/wire contracts as pending prerequisites for affected implementation.
4. Validation, publication in PR #35 and its recorded CI receipt are complete. Maintain the evidence and Empirical pointer; follow-up PR #37 is merged.

## Review packet

Goal/result, exact diff/SHA, source trace, shared-service reuse proof, tests/screenshots, migrations/recovery, policy dependencies, residual gaps. Stronger-model approval must be explicit, never inferred from a running review or Luna's self-assessment.
