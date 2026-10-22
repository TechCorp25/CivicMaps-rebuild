# Next build phase: M1 discovery and F11 G1 authority contract

Version: 1.0.0  
Prepared: 22 October 2026 (Australia/Melbourne)  
Repository: TechCorp25/CivicMaps-rebuild  
Verified base: `main@6761cd6adcd9f922aed939ccafb75f81cf7eba62` (PR37 merge)  
Plan status: published for review; implementation and independent goal audits have not started.

## Purpose and boundary

GPT-6 Luna Medium completes two bounded goals: shared request discovery (M1) and the council staff-authority contract (F11 G1). GPT-6 Astra Low independently audits the frozen planning product and each completed goal while Luna continues only independent ready work. M0 architecture acceptance is retained; it does not establish functional acceptance.

This phase excludes G2 provisioning implementation, M2–M7, merge and deployment. Owner merge remains required before dependent implementation. No automatic merge or deployment is authorised.

## Reconciled baseline

GitHub API verified public repository `TechCorp25/CivicMaps-rebuild`, connected TechCorp25 account permission `admin` and `push`, default branch `main`, at exact commit `6761cd6adcd9f922aed939ccafb75f81cf7eba62`. The commit is the PR37 merge. Local checkout/runtime verification was unavailable when this plan was prepared; no local tests or runtime claims are made.

PR25 governance work remains separately owned and merged. Consume its current interfaces and approved governance controls; do not duplicate its fixes. M0 architecture/backlog assessment remains accepted at its recorded candidate. This does not establish M1 functional acceptance or F11 G1 contract acceptance.

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

1. Luna verifies remote main, dependencies and supported local runtime; records exact baseline and current limitations.
2. Publish P0, then begin M1 while Astra audits the frozen planning product.
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

G2 provisioning implementation, M2–M7, owner merge and deployment are outside this phase. No code or functional acceptance is inferred from this plan. The verified remote baseline is available through GitHub; local execution environment access remains to be restored before implementation evidence can be produced.
