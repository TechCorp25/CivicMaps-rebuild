# Governance execution checkpoint

Updated 19 October 2026 (Australia/Melbourne).

## Repository state

- Governance branch: `codex/civicmaps-governance-workstream`, implementation head `9b3afc2cbeb9c9e4f8db1c3032043c696caf44bf` (remote verified before this checkpoint update).
- Integrated main: `92b3eea8b8ecfd0505afb6d62d60a001903db161`; fetched `origin/main` currently matches.
- PR #24: open, draft, no submitted reviews; exact-head CI passed.
- PR #25: open, draft, no submitted reviews; exact-head Actions run `39130614555` passed on `9b3afc2`.
- Worktree was absent from the resumed environment and has been attached at `/workspace/civicmaps-governance-workstream`. No other worktree was changed.

## Completed slice: G04 / GOV-10 / F-029

**Outcome:** reject malformed audit `reason` values before a dispatch mutation and render legacy audit values defensively without rewriting stored history.

**Work contract:**

- Likely files: `services/api/app.mjs`, `apps/commandmaps/src/main.tsx`, `tests/foundation.test.mjs`, and a focused browser regression if available.
- Preserve: F08 entitlements, council/context scope, D03 action permissions, CSRF, idempotency, optimistic version checks, transaction ordering, and append-only historical audit.
- Semantics: `close` continues to require a non-empty string of at most 1000 characters. Other actions accept an omitted/null reason or a string of at most 1000 characters; reject all other JSON types before mutation. Historical non-string values are omitted from display, never modified in storage.
- Acceptance: disposable API regressions prove malformed values return 400 without changing request version/status or appending audit; valid omitted/null/string cases remain correct; defensive rendering handles legacy malformed values; council scope and retained audit are unchanged.
- Out of scope: broader authority, identity, database isolation, retention/destruction, F09 suspension policy, live exploit tests, production policy or architecture decisions.

**Implementation status:** the API rejects non-null reasons unless they are strings of at most 1000 characters, before entering the mutation transaction. Existing closure validation still requires non-empty text. CommandMAPS renders only string-valued historical reasons. Added a disposable API regression for malformed type/length rejection, unchanged status/version/audit, and accepted null/string values; added a browser response fixture that injects a legacy object value and checks it is not rendered.

**Validation:** npm lockfile install, lint, format check, both app typechecks/builds, browser-test syntax check and `git diff --check` passed locally. Local database tests were unavailable because PostgreSQL tools/listener are absent (`initdb` ENOENT). Hosted PR Actions run `39130614555` passed on `9b3afc2`, including `npm run check`, the API regression suite, the CommandMAPS browser test with the malformed-history response fixture, and existing platform/activation browser suites. This verifies the implemented development path only; it is not production or legal acceptance.

## Active slice: G01 / GOV-01 / GOV-02 / GOV-06

**Outcome:** create a source-pinned current-state actor/workflow/data-flow matrix for implemented and planned CivicMAPS workflows, record classes, primary and secondary locations, relevant obligation categories and accountable decisions.

**Work contract:**

- Likely files: a new evidence matrix under `docs/plans/evidence/`, with concise pointers from this checkpoint and the governance workstream if useful. Trace current code/schema and infrastructure documentation before asserting a flow.
- Preserve: distinguish council records from operator service/diagnostic data; distinguish observed implementation from planned workflow and proposal; retain all record classes named by the owner; no claim that scope authorises collection.
- Acceptance: each mapped workflow names actors, data classes, source/API, observed storage/processing or explicit unknowns, known secondary copies, authority/privacy/records/security questions, applicable obligation source category, and accountable decision owner/status. Map each Australian jurisdiction using the existing national register without asserting universal legal applicability. Include staff identity, requests, infringements, receipts, evidence/media, locations, sensitive/health data, operations and audit.
- Out of scope: legal advice or customer-specific applicability approval, invented retention/notification periods, new collection, production architecture choice, new grants, migration, or deployment.

**Dependencies and next action:** no policy decision blocks source tracing. Inspect implemented schemas/routes, planned workflow surfaces, runtime/storage/support and backup/export paths; mark unverified provider, customer or production details as unknown. Advanced-model Checkpoint A remains pending until this matrix and the F-029 corrective evidence are both review-ready.

## Completed acceptance

- Reconciled local main `92b3eea…`, fetched `origin/main`, PR #24, PR #25, CI and review status; no newer main integration was needed.
- Refreshed owner requirements, governance assessment, F09 preparation and F08 completion memories before resuming.
- Confirmed F08 release remains closed; no deployment, migration replay or production change was performed.
- Closed F-029 acceptance at the development boundary on the exact successful hosted head; no live exploit, production change or compliance claim.
