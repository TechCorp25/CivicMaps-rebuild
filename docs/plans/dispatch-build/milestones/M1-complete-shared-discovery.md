# M1 — Complete shared discovery

Status: planned; not implemented.

## Goal and work

Consume governance F-002 from reviewed main. Wire server search/filter/counts and stable pagination, independent detail retrieval and selection recovery.

## Dependencies and stop conditions

Governance F-002 or explicit ownership handover; accepted M0 packet and owner merge.

Read current decisions/dependencies before starting. Ask only for unresolved policy affecting this contract. Continue a ready independent milestone when blocked, recording the reason. Do not expand scope to hide an unresolved dependency.

## Acceptance

Older active work beyond 100 records discoverable; counts match scoped dataset; stale selections/history cannot cross records.

Required targeted scenarios: over-100 fixture, concurrent inserts/paging, denied scope, filters/counts, inaccessible selected detail.

## Execution sequence

1. Verify clean current main, merged dependencies, applicable AGENTS, Empirical and `_ds` sources. Record exact base.
2. Create fresh `codex/civicmaps-dispatch-m1` branch/worktree; no governance worktree edits.
3. Pin behaviour, exact API changes and compatibility tests before implementation. Keep shared-service/package boundaries explicit.
4. Implement a small vertical slice, add meaningful tests, then complete this contract. No mocked success for unavailable services.
5. Run required repo checks and applicable browser tests; inspect screenshots against annotation markers. Record limits honestly.
6. Update evidence/matrix/checkpoint; obtain required stronger-model gate and fix supported findings.
7. Commit/push, verify remote SHA, draft PR, hosted CI and Codex review; update Empirical. Do not merge/auto-merge.
8. Wait owner merge before dependent implementation. Deployment is a separate pinned authorised action.

## Review packet

Goal/result, exact diff/SHA, source trace, shared-service reuse proof, tests/screenshots, migrations/recovery, policy dependencies, residual gaps. Stronger-model approval must be explicit, never inferred from a running review or Luna's self-assessment.
