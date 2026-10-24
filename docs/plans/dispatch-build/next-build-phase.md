# Next build phase: M1 discovery and F11 G1 authority contract

Version: 1.1.3 · Prepared: 24 October 2026 (UTC) · Repository: TechCorp25/CivicMaps-rebuild · Verified base: `main@c92667e8bd9b12055f2714bac16e6d97008c0d70` (PR40 merge)
Plan status: P0 v1.1.1 was independently accepted at its recorded candidate. This v1.1.3 amendment incorporates PR42 commissioning review corrections and updates G1 to v1.6; the prior P0 acceptance does not cover this amendment or the v1.6 contract. Fresh independent reassessment is pending. G1 remains blocked on the owner decisions below.

## Purpose and boundary

GPT-6 Luna Medium completes two bounded goals: shared request discovery (M1) and the council staff-authority contract (F11 G1). GPT-6 Astra Low independently audits the frozen planning product and each completed goal while Luna continues only independent ready work. M0 architecture acceptance is retained; it does not establish functional acceptance.

This phase excludes G2 provisioning implementation, M2–M7, merge and deployment. Owner merge remains required before dependent implementation. No automatic merge or deployment is authorised.

## Reconciled baseline

GitHub API and `git fetch origin main` verified public repository `TechCorp25/CivicMaps-rebuild`, default branch `main`, at exact commit `d4921eb1c37550d9ca1b53a5615242922abfa4ad`, the merged PR #38 plan publication. Its parent history includes the earlier PR37 governance baseline `6761cd6adcd9f922aed939ccafb75f81cf7eba62`; that SHA is historical source provenance, not the current phase base.

PR25 governance work remains separately owned and merged. Consume its current interfaces and approved governance controls; do not duplicate its fixes. M0 architecture/backlog assessment remains accepted at its recorded candidate and is separate from M1 functional acceptance. G1 contract acceptance remains pending.

## Execution status — 24 October 2026

| Work item | Current state | Evidence and next action |
|---|---|---|
| P0 — plan | Version 1.1.3 is a current amendment; P0 v1.1.1 remains accepted only for its recorded candidate. | Publish with the review candidate; obtain fresh independent reassessment and store/read back the complete versioned plan. |
| M1 — shared discovery | **accepted** at exact implementation candidate `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b` (tree `9f2950e421c230c03b05efbdcc76a8b4e4fda1da`) by fresh GPT-6 Astra Low reassessment. Draft PR #40 handoff/evidence head is `8c6cce9fcbfc0c813dc916aec18410459c2a2ee4` (tree `2cc566026973ae9688f68b5c99c024d000dd171e`); its additions do not alter the audited implementation. | Functional candidate `ff894d664d4cafe049c47d1e83c79ab421a20831` (tree `7b257e021e662a9cbdd1c96aea2151ba86b26674`) includes the correction from hosted run `39894279378`; docs-corrected implementation candidate is `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b`. Hosted runs `39895161432` and `39895991685` passed app/API, provisioning worker, CommandMAPS, Platform, and activation browser checks with PostgreSQL 15. Fresh report: [M1 independent assessment](evidence/M1-independent-assessment-d905b85.md), SHA-256 `d23a1a9cca4149c322e2790804c1bedc37c57be7237cf9bd2bdf90c3dc9d2123`; raw packet, logs, and screenshots are in [M1 audit evidence](evidence/M1-audit-d905b85/). Local database setup and browser runs failed at environment setup and remain explicit limitations. Owner review/merge of PR #40 is required before dependent implementation; no deployment is authorized. |
| G1 — council staff-authority contract | The most recently published contract was v1.5 at candidate `717885cf684a5c856367c9965575fb32054497a8`; its audit found the initial approver path incomplete. Contract v1.6 adds explicit approver admission, scoped proofing, exact-payload approval, and revalidation; its reassessment is pending. | The setup-only commissioning proposal uses externally admitted council trust records and grants no authority during setup. The owner has not approved the commissioning authority, external trust-record source/admission procedure, initial council decision-maker evidence, or approver authentication method. The 24 October receipt records authentication direction only. G1 acceptance and G2 remain blocked pending these decisions and fresh reassessment. |

Local baseline runtime: Node `v24.19.0`, npm `11.9.0`, lock-matched dependencies. The repository launcher cannot start PostgreSQL because `/usr/lib/postgresql/15/bin/initdb` is absent; the configured test endpoint refuses connections. The hosted CI run provisioned PostgreSQL 15 and passed all integration/browser steps. Direct `git push` under the active `techcorp-dev` credential returned HTTP 403. The connected TechCorp25 GitHub account was used to publish the M1 same-tree mirror and draft PR #40; publication does not imply acceptance.

## Goals and acceptance

| Goal | Deliverable | Acceptance |
|---|---|---|
| P0 — Portable execution plan | Reconciled baseline, goal contracts, checkpoints and developer instructions in Git and Empirical | Verified remote baseline; stale PR37 references corrected; matching plan version and content hash retrievable from both destinations |
| M1 — Shared discovery | Server-backed request search, filters, counts, pagination and independent detail retrieval | Older active requests beyond 100 records are discoverable; counts reflect authorised scope; paging, selection and audit history remain correct through refresh and failures |
| G1 — Council staff-authority contract | Versioned actor/action/context matrix, proposed API and schema/migration contract, decision provenance and acceptance inventory | Every staff-management action has explicit authority, scope, revocation, audit and retry semantics; unresolved policy is identified without inventing permissions |

### M1 implementation contract

- Consume the existing F-002 status/count/keyset-pagination implementation; preserve governance ownership and current authorisation.
- Replace automatic full-dataset loading with first-page loading and explicit “Load more”. Reset pagination when search, filter or operating context changes; reject stale responses and deduplicate by request ID.
- Add optional server-side `q` search for request number and address: trimmed, case-insensitive literal matching, maximum 250 characters, parameterised SQL. Empty search preserves existing behaviour.
- Preserve `status`, `before`, `requests`, `nextCursor` and first-page `counts`. Counts cover the authorised search result before status filtering and pagination; subsequent pages omit counts.
- Fetch selected detail independently of loaded queue pages. Keep detail and audit keyed to request and context; inaccessible detail clears actionable content and displays truthful recovery feedback.
- Preserve current lifecycle, retained-review rules, ADMIN exclusion, officer assignment scope and F11E recovery behaviour. No schema migration is planned.

### G1 contract

Use signed Q01–Q12 decisions and current merged governance controls as authority. Specify create/invite/activate/read/grant/revoke/disable actions, allowed roles, council/context ownership, approval provenance, expiry/replay, reissue, session invalidation and transaction/audit atomicity.

Define proposed endpoint inputs, outputs and errors, additive migration compatibility, populated-data verification and the G2 test matrix. Keep council administration separate from operational CommandMAPS and platform-operator authority.

Resolve only genuinely missing product choices with the owner. An unresolved required choice blocks G1 acceptance and dependent G2 work, while M1 may continue. Do not infer policy from preview behaviour or prior incomplete contracts.

The current G1 blocker is initial authority commissioning. An owner-authenticated session does not identify the first council approver or establish customer appointment authority. The contract may describe a restricted setup-only commissioning proposal based on externally admitted council trust records, but the record source/admission procedure and authority to designate the initial approver require explicit owner decisions. Keep the council disabled until the independent council decision and Q07 two-operator actions can be validated and an activation verification inventory is complete. The 24 October authentication receipt is not approval of those matters.

## Execution and concurrent audit

1. Luna verifies remote main, dependencies and supported local runtime; records exact baseline and current limitations. Complete P0 plan reconciliation and fresh independent audit while ready M1/G1 work proceeds.
2. Publish the reconciled P0 plan and retain exact remote SHA and content hash in Empirical.
3. On M1 completion, freeze its commit and neutral audit packet. Start a fresh Astra audit while Luna prepares G1 on a separate branch from verified main.
4. On G1 completion, start another fresh Astra audit. Luna addresses returned M1 findings or prepares portable handoff material while that audit runs.
5. Fix findings on the relevant branch, rerun affected checks and obtain reassessment. Finish only when both goals pass or a concrete blocker is recorded.

Use one Luna implementation worker. Every Astra assessment uses `fork_turns="none"`, `model="gpt-6-astra"` and `reasoning_effort="low"` in an isolated checkout. Supply frozen requirements, authoritative constraints, exact candidate/base SHAs, product files and raw evidence—never builder conversation, reasoning or self-review conclusions.

Track `implemented`, `audit_pending`, `changes_required`, `blocked` and `accepted` separately. Candidate publication does not imply acceptance. Owner merge remains required before dependent implementation; no automatic merge or deployment.

## Verification

Run `npm run check` and existing CommandMAPS, Platform and activation browser suites; sequence suites where ports collide. Commit M1 integration/browser tests under `tests/`, wire browser discovery into local commands and CI, and verify non-zero execution.

Cover more than 100 requests, older active work, concurrent inserts, search/filter/count agreement, paging retry, stale responses and inaccessible selected detail. Exercise council/context isolation, officer restrictions, ADMIN exclusion, disabled-pack review, session loss and existing uncertain-response recovery.

Inspect desktop and narrow-view screenshots and keyboard operation against current design annotations. Validate G1 action coverage, decision provenance, API/schema consistency and migration/test specifications. Contract acceptance must not claim provisioning implementation.

Record exact candidate SHAs, commands, counts, failures and limitations. Setup failures and skipped tests are not passes.

## Git and Empirical handoff

Canonical plan: `docs/plans/dispatch-build/next-build-phase.md`. Link it from the programme entrypoint and reconcile the execution checkpoint, feature ledger and F11 checkpoint without erasing historical evidence.

Each goal handoff includes repository URL, branch/base/candidate SHAs, prerequisites, reproduction commands, acceptance status, audit report or explicit pending/unavailable status, remaining blockers and exact next action. The G1 candidate and source decision receipt are included in this published tree and PR #42; its fresh report remains pending owner resolution. Avoid dependence on workspace paths or transient logs.

Commit and push the plan, verify its remote SHA and publish a draft PR. Store the complete versioned plan in Empirical—not a local-file pointer—with content hash, Git permalink and goal dependencies. Store separate goal receipts and the Luna/Astra workflow requirement, tagged `CivicMaps-rebuild`, with explicit authorship. Read back the stored plan to verify completeness.

## Explicit exclusions and status

G2 provisioning implementation, M2–M7, owner merge and deployment are outside this phase. No code or functional acceptance is inferred from this plan. M1 is accepted at audited implementation candidate `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b` after a fresh Astra Low pass; hosted PostgreSQL/database/browser and focused keyboard checks passed, while local database setup failed and remains a limitation. G1 v1.6 remains proposed and unaccepted. Owner decisions are required for setup-only commissioning authority, the external council trust-record source/admission procedure, initial approver evidence, and approver authentication method; fresh reassessment is pending. Owner merge remains required before dependent implementation.
