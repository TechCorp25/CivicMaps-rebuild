# Governance main integration — 21 October 2026

Recorded 12:37 AEDT (Australia/Melbourne). Branch: `codex/civicmaps-governance-workstream`; draft PR #25.

## Work contract and result

Goal: consume reviewed main while preserving the existing G02/G03 principal ownership implementation and G04 corrective controls. Scope is branch integration and G06 source/evidence reconciliation. No new behaviour, migration execution, deployment or resource changes are included.

- Clean starting local head: `254423e103f86b30c94bd45cd518f1563d388d82`.
- Actual published governance head discovered: `ac4bb265ad978641d0308ec284aaf3f3b4415678`. The local branch was fast-forwarded to preserve ten published follow-up commits, including authentication/seed compatibility fixes and passing CI evidence.
- Latest integrated main: `1e658fd8b7f725148640d6ed68e81e3f9b2eaed3` (PR #30), incorporating PR #28 F11 preparation and PR #29 proprietary licence.
- Normal merge result: `d474e3784fb484cb157632e3ff3d14cff0659cc5`; no conflicts. Main is an ancestor.
- No dirty paths existed before integration. This evidence and the workstream pointer are the only follow-up edits.

The configured fetch refspec tracks only main. Fetching a governance branch name updated FETCH_HEAD but left its remote-tracking ref stale at `04b7189`. Direct GitHub refs and PR #25 confirmed `ac4bb26`; an explicit source:destination fetch refreshed that ref before the fast-forward. No force update or shared Git configuration change was used.

## Validation

The merge imports documentation, licence, ledger/checkpoint and historical release evidence only. Executable application/API source, migrations, existing tests, package manifests and workflow configuration are identical to `ac4bb26`; incoming `tests/f11/README.md` is a test inventory, not executable coverage. No runtime test was rerun for this documentation-only integration.

The feature ledger, F11 execution checkpoint and dispatch browser-results JSON parse successfully. `git diff --check` reports two existing Markdown hard-break spaces and an EOF blank line in main's superseded `F11-principal-ownership-contract.md`; these were preserved as incoming historical content. There are no merge conflict markers or unresolved index entries.

Prior exact-head hosted governance runs [39357311798](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39357311798) and [39357306534](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39357306534) passed on `ac4bb26`. They are prior-source evidence; CI for the published sync must be checked separately. No independent implementation reassessment is claimed by this sync.

## Reconciled scope and next action

Main's F11 handoff correction explicitly leaves synthetic principal ownership in governance PR25 and restores the separate functional council-to-CommandMAPS outcome. Its functional merge/deploy lifecycle does not authorize governance PR25 merge or deployment. The superseded F11 ownership candidate is historical, not a replacement for this branch's committed requirements.

Main records accepted dispatch deployment at `313d9a3`; this supersedes older current-deployment pointers while retaining F08 as historical acceptance. It does not deploy governance migrations 014/015. The scratch-contract hash discrepancy remains a historical provenance limitation, not a request for renewed owner approval; use the committed requirements and actual implementation product.

Active governance outcome remains G02/G03 principal ownership assurance. Implementation and hosted synthetic positive/negative/preservation tests are published. Next action: freeze the integrated source and approved committed requirements into the Checkpoint C review package, obtain actual advanced-model findings, and resolve supported findings before any dependent expansion. Customer migration, production architecture, statutory schedules and final production acceptance remain outside this sync. Functional development continues separately.
