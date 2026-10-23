# Next build phase: M1 discovery and F11 G1 authority contract

Version: 1.1.0 · Prepared: 23 October 2026 (UTC) · Repository: TechCorp25/CivicMaps-rebuild · Verified base: `main@d4921eb1c37550d9ca1b53a5615242922abfa4ad` (PR38 merge)
Plan status at publication: version 1.0.0 was published by merged PR #38; this reconciled version 1.1.0 records active implementation and audit status. Check the current programme checkpoint and the versioned P0 handoff for publication, audit, and Empirical readback outcomes.

## Purpose and boundary

GPT-6 Luna Medium completes two bounded goals: shared request discovery (M1) and the council staff-authority contract (F11 G1). GPT-6 Astra Low independently audits the frozen planning product and each completed goal while Luna continues only independent ready work. M0 architecture acceptance is retained; it does not establish functional acceptance.

This phase excludes G2 provisioning implementation, M2–M7, merge and deployment. Owner merge remains required before dependent implementation. No automatic merge or deployment is authorised.

## Reconciled baseline

GitHub API and `git fetch origin main` verified public repository `TechCorp25/CivicMaps-rebuild`, default branch `main`, at exact commit `d4921eb1c37550d9ca1b53a5615242922abfa4ad`, the merged PR #38 plan publication. Its parent history includes the earlier PR37 governance baseline `6761cd6adcd9f922aed939ccafb75f81cf7eba62`; that SHA is historical source provenance, not the current phase base.

PR25 governance work remains separately owned and merged. Consume its current interfaces and approved governance controls; do not duplicate its fixes. M0 architecture/backlog assessment remains accepted at its recorded candidate and is separate from M1 functional acceptance. G1 contract acceptance remains pending.

## Current execution status — 23 October 2026

| Work item | Current state | Evidence and next action |
|---|---|---|
| P0 — plan | Version 1.0.0 is on main via merged PR #38. Version 1.1.0 reconciles the current baseline and goal status; publish the versioned plan and complete its hash, independent audit, and Empirical readback receipt. | See the current P0 status and acceptance receipt in the programme checkpoint; record exact Git permalink and matching Empirical copy/hash. |
| M1 — shared discovery | **accepted** at exact implementation candidate `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b` (tree `9f2950e421c230c03b05efbdcc76a8b4e4fda1da`) by fresh GPT-6 Astra Low reassessment. Draft PR #40 handoff/evidence head is `8c6cce9fcbfc0c813dc916aec18410459c2a2ee4` (tree `2cc566026973ae9688f68b5c99c024d000dd171e`); its additions do not alter the audited implementation. | Functional candidate `ff894d664d4cafe049c47d1e83c79ab421a20831` (tree `7b257e021e662a9cbdd1c96aea2151ba86b26674`) includes the correction from hosted run `39894279378`; docs-corrected implementation candidate is `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b`. Hosted runs `39895161432` and `39895991685` passed app/API, provisioning worker, CommandMAPS, Platform, and activation browser checks with PostgreSQL 15. Fresh report: [M1 independent assessment](evidence/M1-independent-assessment-d905b85.md), SHA-256 `d23a1a9cca4149c322e2790804c1bedc37c57be7237cf9bd2bdf90c3dc9d2123`; raw packet, logs, and screenshots are in [M1 audit evidence](evidence/M1-audit-d905b85/). Local database setup and browser runs failed at environment setup and remain explicit limitations. Owner review/merge of PR #40 is required before dependent implementation; no deployment is authorized. |
| G1 — council staff-authority contract | The first independent audit returned **changes_required** on candidate `0f2bbcb7f233abdb8bb9ef1ba848dcca439ce62d`, tree `5c3ad37a82de4d020d541018fa6a5b9027cc3cd5`, base `d4921eb1c37550d9ca1b53a5615242922abfa4ad`. The corrected v1.3 contract is committed locally as `ee4ea9d5f2155c69e74e5894a3202f7c9eeefc87`, tree `55c3ffbf3bc69d5ef8f6a21a996eb7b7d4f31a90`. | The candidate separates staff administration from operational grants, defines non-authorizing recovery intake, and incorporates the resolved delegation, verifier, invitation-expiry, and SUPERVISOR-grant decisions. Initial authority commissioning remains unresolved: D02's first administrator activation gives no staff-management power and cannot bootstrap the authority that authorizes it. G1 acceptance and G2 remain blocked pending the owner decision; then freeze and independently reassess the contract. |

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

Each goal handoff includes repository URL, branch/base/candidate SHAs, prerequisites, reproduction commands, acceptance status, audit report, remaining blockers and exact next action. Avoid dependence on workspace paths or transient logs.

Commit and push the plan, verify its remote SHA and publish a draft PR. Store the complete versioned plan in Empirical—not a local-file pointer—with content hash, Git permalink and goal dependencies. Store separate goal receipts and the Luna/Astra workflow requirement, tagged `CivicMaps-rebuild`, with explicit authorship. Read back the stored plan to verify completeness.

## Explicit exclusions and status

G2 provisioning implementation, M2–M7, owner merge and deployment are outside this phase. No code or functional acceptance is inferred from this plan. M1 is accepted at audited implementation candidate `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b` after a fresh Astra Low pass; hosted PostgreSQL/database/browser and focused keyboard checks passed, while local database setup failed and remains a limitation. PR #40 remains a draft pending owner review/merge. G1 v1.3 contract corrections are committed locally. Acceptance is blocked on owner resolution of the initial authority-commissioning path, then fresh reassessment. Owner merge remains required before dependent implementation.
