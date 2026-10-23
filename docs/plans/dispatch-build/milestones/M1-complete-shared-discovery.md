# M1 — Complete shared discovery

Status: implementation complete; acceptance blocked pending required database-backed and browser verification.

The audited functional candidate `600eca9cec38d65d605965842f540e8c9045379a` (tree `f3a169da01ab70639dcaead315c5a7d062fb0dde`), based on verified main `d4921eb1c37550d9ca1b53a5615242922abfa4ad`, received an independent Astra source review. Static gates passed; local runtime verification was blocked because the disposable PostgreSQL service and PostgreSQL 15 server binaries are unavailable. The assessor found no blocking source defect but could not execute required integration/browser, screenshots, or keyboard checks. The first hosted workflow (`39894279378`) passed setup, application/API, ingress, and Platform browser stages, then failed a CommandMAPS failure-path assertion; the finding and correction are recorded in [hosted CI evidence](../evidence/M1-hosted-ci-39894279378.md). A deterministic test correction is in progress and awaits rerun. See the [independent source report](../evidence/M1-independent-audit-600eca9.md) and [candidate handoff](../evidence/M1-handoff-600eca9.md). M1 remains unaccepted; PR #40 is draft.

## Goal and work

Consume the merged governance F-002 status/filter/count/keyset-pagination endpoint. The client loads the first 100 authorized requests, offers explicit Load more, resets pagination on search/filter/context changes, and rejects stale pages. The API supports optional parameterized literal request-number/address search (trimmed, case-insensitive, maximum 250 characters); first-page counts cover the authorized search set before status/pagination. Selected detail is fetched independently of loaded pages and remains bound to request/context through refresh/failure. No schema migration was required.

## Dependencies and stop conditions

Governance F-002 or explicit ownership handover; accepted M0 packet and owner merge.

Read current decisions/dependencies before starting. Ask only for unresolved policy affecting this contract. Continue a ready independent milestone when blocked, recording the reason. Do not expand scope to hide an unresolved dependency.

## Acceptance

Older active work beyond 100 records discoverable through search and explicit cursor loading; counts match authorized search results; paging retries, stale responses, selected inaccessible detail, and refresh-bound audit history remain correct.

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


## Candidate implementation and checks

The 100-row API page is a page size, not the discoverable queue limit. Search and “Load more” reach older active requests without automatic full-dataset loading. The current candidate's static checks, runtime limitations, acceptance state, and next action are recorded in its linked audit and handoff receipt above.
