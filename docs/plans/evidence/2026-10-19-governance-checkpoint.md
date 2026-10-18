# Governance execution checkpoint

Updated 19 October 2026 (Australia/Melbourne).

## Repository state

- Governance branch: `codex/civicmaps-governance-workstream`; F-011 implementation head `f1ae3a62b55e64355f9a8e0acb6ca3d32e22e980` is pushed. This checkpoint update is documentation-only and follows that code head.
- Integrated main: `92b3eea8b8ecfd0505afb6d62d60a001903db161`; fetched `origin/main` currently matches.
- PR #24: open, draft, no submitted reviews; exact-head CI passed.
- PR #25: open, draft, no submitted reviews; matrix corrections at `993ee2d` passed exact-head Actions run `39131572172`; F-011 implementation head `f1ae3a6` passed exact-head run `39131773353`. The checkpoint-only head `3dfe43c` has run `39131878773` in progress at last check.
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

**Evidence references:** route actions in `services/api/platform.mjs` and `services/api/routing.mjs`; request audit/receipt behavior in `services/api/app.mjs`; branch/main/code pins above; F-029 hosted run `39130614555` on `9b3afc2` and checkpoint-only run `39130875787` on `82efe6e` passed. The corrected matrix/checkpoint at `993ee2d` passed exact-head hosted run `39131572172`, including application/API checks, ingress, CommandMAPS browser, platform browser and activation browser suites.

**Specific reviewer questions:**

1. Does the current-state matrix correctly distinguish the operational control database from per-municipality F05 RDS/S3 fixtures, and are any actor/action or secondary-copy paths missing from the inspected source/evidence?
2. Is the F-029 validation boundary complete for all dispatch actions, including null/omitted/overlength values, while preserving existing close semantics, transaction order, idempotency, entitlement/context checks and historical audit?
3. Are any legal/applicability statements broader than the cited national register supports, especially the eight-jurisdiction and operator-versus-council distinctions?
4. Is the evidence sufficient to begin the next bounded corrective slice without first choosing production isolation, support, retention or identity policies?

**Recommended next action:** publish the source-corrected matrix/checkpoint, verify its CI, then fetch and inspect `origin/main` before beginning one F-011 bounded slice. Do not choose production isolation/key/support or retention policies as part of F-011.

## Completed slice: G04 / GOV-10 / F-011

**Goal and outcome:** prevent an idle PostgreSQL client error from terminating the API or worker process, and demonstrate that the shared pool can serve a later query after the bad idle client is removed.

**Source/state:** fetched `origin/main` at `92b3eea8b8ecfd0505afb6d62d60a001903db161`; no incoming changes. It is an ancestor of governance head `993ee2d7c271fe8222d520c8ba3297578aa05d0d`. Current `services/api/database.mjs` constructs the shared `pg.Pool` without an `error` listener; API, provisioning and route workers import this singleton. `/api/health` performs `SELECT 1`.

**Likely files:** `services/api/database.mjs`; a focused disposable PostgreSQL integration test; this checkpoint and governance sync/evidence notes.

**Preserve:** F08 entitlement and council/context scope, transaction begin/commit/rollback ordering, idempotency and worker lease recovery. Do not replay writes after pool failure. Do not alter pool size, retry policy, schema, deployed configuration or production resources.

**Acceptance:** listener handles idle-client errors without logging credentials or SQL; isolated regression terminates a released test connection, observes the pool error without process termination, then proves a subsequent `SELECT 1` succeeds through the same pool. Existing test suite and hosted CI pass. If local disposable PostgreSQL is unavailable, record that limitation and rely on exact-head hosted CI only for executed DB evidence.

**Out of scope:** live/fault/load tests against retained resources; blanket database retry; custom health/readiness policy; capacity tuning; provider/tenant isolation or support decisions; any F09 suspension behavior.

**Implementation and local validation:** `services/api/database.mjs` now handles idle-client errors and logs only a validated five-character SQLSTATE or `unknown`, never the error message. `tests/database-pool.test.mjs` releases a test client, terminates only its disposable backend, waits for the pool error, then issues `SELECT 1` through the same pool. Lint, formatting, both app typechecks, both production builds, syntax checks and `git diff --check` passed. `npm test` could not execute its database-backed cases because the configured local PostgreSQL endpoint `127.0.0.1:55432` refuses connections; this includes the new test. Hosted exact-head run `39131773353` passed all foundation workflow steps, including application/API checks, ingress, worker restart recovery, platform browser, CommandMAPS browser, council-admin activation browser and the full test suite with the disposable PostgreSQL regression. No production or live infrastructure test was performed.

**Review of slice diff:** only the shared pool's idle-client error listener, the focused disposable recovery test, and governance status/evidence were changed. Pool size, transaction sequencing, writes/retries, schema, worker leases, F08 entitlements and production resources were not changed.

## Completed acceptance

- Reconciled local main `92b3eea…`, fetched `origin/main`, PR #24, PR #25, CI and review status; no newer main integration was needed.
- Refreshed owner requirements, governance assessment, F09 preparation and F08 completion memories before resuming.
- Confirmed F08 release remains closed; no deployment, migration replay or production change was performed.
- Closed F-029 acceptance at the development boundary on the exact successful hosted head; no live exploit, production change or compliance claim.
- Completed a source-pinned G01 actor/data-flow matrix with local documentation validation; no new law or customer policy was inferred.
