# M5 — Shared spatial and travel-routing context

Status: planned; not implemented.

## Goal and work

Link request/map/zone selection using shared adapters; distinguish address, zone and travel routing; server-authoritative versioned zones; provider failures leave queue usable.

## Dependencies and stop conditions

M0/M3 contracts; D-GIS before live provider.

Read current decisions/dependencies before starting. Ask only for unresolved policy affecting this contract. Continue a ready independent milestone when blocked, recording the reason. Do not expand scope to hide an unresolved dependency.

## Acceptance

Two package fixtures reuse spatial contracts; scope holds; stale/unavailable source is visible; real provider evidence separately qualified.

Required targeted scenarios: unresolved/changed coordinates, no zone/overlap, stale provider responses, outage, cross-council geometry, narrow/keyboard.

## Execution sequence

1. Verify clean current main, merged dependencies, applicable AGENTS, Empirical and `_ds` sources. Record exact base.
2. Create fresh `codex/civicmaps-dispatch-m5` branch/worktree; no governance worktree edits.
3. Pin behaviour, exact API changes and compatibility tests before implementation. Keep shared-service/package boundaries explicit.
4. Implement a small vertical slice, add meaningful tests, then complete this contract. No mocked success for unavailable services.
5. Run required repo checks and applicable browser tests; inspect screenshots against annotation markers. Record limits honestly.
6. Update evidence/matrix/checkpoint; obtain required stronger-model gate and fix supported findings.
7. Commit/push, verify remote SHA, draft PR, hosted CI and Codex review; update Empirical. Do not merge/auto-merge.
8. Wait owner merge before dependent implementation. Deployment is a separate pinned authorised action.

## Review packet

Goal/result, exact diff/SHA, source trace, shared-service reuse proof, tests/screenshots, migrations/recovery, policy dependencies, residual gaps. Stronger-model approval must be explicit, never inferred from a running review or Luna's self-assessment.
