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

## Completed slice: G01 / GOV-01 / GOV-02 / GOV-06

**Outcome:** create a source-pinned current-state actor/workflow/data-flow matrix for implemented and planned CivicMAPS workflows, record classes, primary and secondary locations, relevant obligation categories and accountable decisions.

**Work contract:**

- Likely files: a new evidence matrix under `docs/plans/evidence/`, with concise pointers from this checkpoint and the governance workstream if useful. Trace current code/schema and infrastructure documentation before asserting a flow.
- Preserve: distinguish council records from operator service/diagnostic data; distinguish observed implementation from planned workflow and proposal; retain all record classes named by the owner; no claim that scope authorises collection.
- Acceptance: each mapped workflow names actors, data classes, source/API, observed storage/processing or explicit unknowns, known secondary copies, authority/privacy/records/security questions, applicable obligation source category, and accountable decision owner/status. Map each Australian jurisdiction using the existing national register without asserting universal legal applicability. Include staff identity, requests, infringements, receipts, evidence/media, locations, sensitive/health data, operations and audit.
- Out of scope: legal advice or customer-specific applicability approval, invented retention/notification periods, new collection, production architecture choice, new grants, migration, or deployment.

**Evidence:** [current-state matrix](2026-10-19-authority-data-flow-matrix.md) pins deployed application source `b21e764…`, current main `92b3eea…`, F-029 governance code `9b3afc2…`, and the 18 October read-only infrastructure observations. It distinguishes implementation from planned classes, maps all eight jurisdictions and external territories to the initial official-source register, identifies shared control-DB storage versus separate synthetic resource fixtures, and marks customer, contract, provider-copy, logging and retention unknowns explicitly.

**Validation:** 27 local relative links resolve; jurisdiction/data-class coverage assertions and `git diff --check` passed. This is documentation/evidence work and adds no legal opinion or new application behavior.

## Advanced-model Checkpoint A — reassessed; source corrections applied

The review request pinned branch head `40a0efd440ca4233d1790ef4e76e2606298bd09f`, main `92b3eea8b8ecfd0505afb6d62d60a001903db161`, and F-029 code head `9b3afc2cbeb9c9e4f8db1c3032043c696caf44bf`. The GPT-6 Astra reviewer returned findings; they were checked against source and the supported documentation findings are recorded below. The source corrections in this checkpoint's working tree are documentation-only.

**Reviewer findings and disposition (19 October 2026, Australia/Melbourne):**

- Supported: existing platform operator authority includes municipality-scoped route `retry` and `withdraw`, version checks, and actor-attributed `service_route_events`. Source review also confirms only a recently checked `ready` route passes middleware and sessions bind to route ID/version. The matrix now describes these service availability/session effects and separates them from the unapproved F09 municipality-suspension policy.
- Supported: request creation audit records status only; transition audit records `from`, `to`, reason and officer ID. Full request responses, including coordinates, are saved in mutation receipts. The matrix now distinguishes audit from receipt copies.
- Supported: free-text action/closure reasons can contain sensitive information and are retained in audit details; the sensitive-data row now includes this path.
- No actionable F-029 implementation finding. The reviewer found common pre-mutation reason validation and defensive display consistent with preserved auth, entitlement/context, CSRF, idempotency, version, transition and transactional audit behavior.
- Reviewer limitation: source/document review only, not independent CI/browser/live execution or legal certification. Existing exact-head hosted CI evidence remains the execution evidence; the reviewer did not independently revalidate legislation. The new regression does not exhaustively cross every action/type combination or boundary length.

**Evidence references:** route actions in `services/api/platform.mjs` and `services/api/routing.mjs`; request audit/receipt behavior in `services/api/app.mjs`; branch/main/code pins above; F-029 hosted run `39130614555` on `9b3afc2` and checkpoint-only run `39130875787` on `82efe6e` passed. Matrix corrections must receive exact-head hosted CI before publication status is updated.

**Specific reviewer questions:**

1. Does the current-state matrix correctly distinguish the operational control database from per-municipality F05 RDS/S3 fixtures, and are any actor/action or secondary-copy paths missing from the inspected source/evidence?
2. Is the F-029 validation boundary complete for all dispatch actions, including null/omitted/overlength values, while preserving existing close semantics, transaction order, idempotency, entitlement/context checks and historical audit?
3. Are any legal/applicability statements broader than the cited national register supports, especially the eight-jurisdiction and operator-versus-council distinctions?
4. Is the evidence sufficient to begin the next bounded corrective slice without first choosing production isolation, support, retention or identity policies?

**Recommended next action:** publish the source-corrected matrix/checkpoint, verify its CI, then fetch and inspect `origin/main` before beginning one F-011 bounded slice. Do not choose production isolation/key/support or retention policies as part of F-011.

## Completed acceptance

- Reconciled local main `92b3eea…`, fetched `origin/main`, PR #24, PR #25, CI and review status; no newer main integration was needed.
- Refreshed owner requirements, governance assessment, F09 preparation and F08 completion memories before resuming.
- Confirmed F08 release remains closed; no deployment, migration replay or production change was performed.
- Closed F-029 acceptance at the development boundary on the exact successful hosted head; no live exploit, production change or compliance claim.
- Completed a source-pinned G01 actor/data-flow matrix with local documentation validation; no new law or customer policy was inferred.
