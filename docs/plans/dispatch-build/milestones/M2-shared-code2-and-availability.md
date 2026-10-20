# M2 — Shared Code2 and availability

Status: planned; not implemented.

## Goal and work

Implement approved operational duty transitions separately from authentication; audit/version/replay protect changes; shared dispatcher eligibility reads.

## Dependencies and stop conditions

D-DUTY approved; M0 reviewed.

Read current decisions/dependencies before starting. Ask only for unresolved policy affecting this contract. Continue a ready independent milestone when blocked, recording the reason. Do not expand scope to hide an unresolved dependency.

## Acceptance

Same service works for two package fixtures; refresh restores confirmed state; sign-off and outstanding work follow approved policy.

Required targeted scenarios: login not duty, two devices, conflict/replay, expiry, sign-off/open work, no cross-branch grants.

## Execution sequence

1. Verify clean current main, merged dependencies, applicable AGENTS, Empirical and `_ds` sources. Record exact base.
2. Create fresh `codex/civicmaps-dispatch-m2` branch/worktree; no governance worktree edits.
3. Pin behaviour, exact API changes and compatibility tests before implementation. Keep shared-service/package boundaries explicit.
4. Implement a small vertical slice, add meaningful tests, then complete this contract. No mocked success for unavailable services.
5. Run required repo checks and applicable browser tests; inspect screenshots against annotation markers. Record limits honestly.
6. Update evidence/matrix/checkpoint; obtain required stronger-model gate and fix supported findings.
7. Commit/push, verify remote SHA, draft PR, hosted CI and Codex review; update Empirical. Do not merge/auto-merge.
8. Wait owner merge before dependent implementation. Deployment is a separate pinned authorised action.

## Review packet

Goal/result, exact diff/SHA, source trace, shared-service reuse proof, tests/screenshots, migrations/recovery, policy dependencies, residual gaps. Stronger-model approval must be explicit, never inferred from a running review or Luna's self-assessment.
