# M3 — Package-aware parking intake

Status: planned; not implemented.

## Goal and work

Build common location/review/submit/recovery flow plus allowlisted Parking payload; optional vehicle and approved catalogue/classification. Historical records remain readable.

## Dependencies and stop conditions

M0 reviewed; D-INTAKE for affected mandatory rules. Independent of queue fix for contract work.

Read current decisions/dependencies before starting. Ask only for unresolved policy affecting this contract. Continue a ready independent milestone when blocked, recording the reason. Do not expand scope to hide an unresolved dependency.

## Acceptance

Review/edit/retry retains input; one confirmed request; contrasting package requires no parking fields; persisted detail reloads accurately.

Required targeted scenarios: invalid/unknown fields, disabled package, two councils/packages, duplicate/lost response, old rows, keyboard/narrow.

## Execution sequence

1. Verify clean current main, merged dependencies, applicable AGENTS, Empirical and `_ds` sources. Record exact base.
2. Create fresh `codex/civicmaps-dispatch-m3` branch/worktree; no governance worktree edits.
3. Pin behaviour, exact API changes and compatibility tests before implementation. Keep shared-service/package boundaries explicit.
4. Implement a small vertical slice, add meaningful tests, then complete this contract. No mocked success for unavailable services.
5. Run required repo checks and applicable browser tests; inspect screenshots against annotation markers. Record limits honestly.
6. Update evidence/matrix/checkpoint; obtain required stronger-model gate and fix supported findings.
7. Commit/push, verify remote SHA, draft PR, hosted CI and Codex review; update Empirical. Do not merge/auto-merge.
8. Wait owner merge before dependent implementation. Deployment is a separate pinned authorised action.

## Review packet

Goal/result, exact diff/SHA, source trace, shared-service reuse proof, tests/screenshots, migrations/recovery, policy dependencies, residual gaps. Stronger-model approval must be explicit, never inferred from a running review or Luna's self-assessment.
