# Governance execution checkpoint

Updated 19 October 2026 (Australia/Melbourne).

## Repository state

- Governance branch: `codex/civicmaps-governance-workstream`; last pushed head `020349b8c34169983f8f7d0254f83b40cb24946a`. F-002's browser-found close-flow correction and evidence update are in the current worktree and not yet committed.
- Integrated main: `92b3eea8b8ecfd0505afb6d62d60a001903db161`; fetched `origin/main` currently matches.
- PR #24: open, draft, no submitted reviews; exact-head CI passed.
- PR #25: open, draft, no submitted reviews; matrix corrections at `993ee2d` passed exact-head Actions run `39131572172`; F-011 implementation head `f1ae3a6` passed exact-head run `39131773353`; checkpoint head `bb3e35c` passed run `39132040914`. F-002 run `39132708366` passed the full API suite, including the new pagination/scope regression, but failed the CommandMAPS browser at the existing close-flow assertion.
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

## Active slice contract: G04 / GOV-10 / F-002

**Goal and outcome:** ensure older active and assigned requests remain discoverable beyond the current 100-row newest-first window, while keeping server-side scope and useful complete authorized counts.

**Source state:** immediately before opening this slice, fetched `origin/main` at `92b3eea8b8ecfd0505afb6d62d60a001903db161`; inspected the incoming merge commit and current endpoint/UI. No new main commits were available; main is an ancestor of governance branch head `bb3e35c0290d19c7e65902f64ce3ef7725433836`.

**Observed behavior:** `GET /api/requests` applies a role predicate and `ORDER BY number DESC LIMIT 100`; CommandMAPS filters the returned 100 client-side and calculates summary counts from that partial page. Thus older active work can be hidden behind newer closed requests. Request `number` is an immutable PostgreSQL `bigint` identity, suitable for a string keyset cursor.

**Likely files:** `services/api/app.mjs`, `apps/commandmaps/src/main.tsx`, `tests/foundation.test.mjs` and focused browser acceptance, plus this checkpoint/workstream status.

**Preserve:** session/context/tenant/jurisdiction/data-plane/organisation/branch RLS and predicates, officer assignment scoping, existing sort semantics, F08 entitlements and ADMIN operational exclusion, request detail/audit visibility, and all mutation/idempotency/version ordering. No migration, unbounded query or client-side expansion of authority.

**Acceptance:** bounded server-side status filtering and stable keyset pagination; authorized aggregate counts independent of page size; invalid filter/cursor requests fail closed; more than 100 mixed-status synthetic requests demonstrate older active work is reachable and counts are complete; inserting newer work between page requests yields no duplicate or skipped cursor rows; direct API assertions retain council/branch/officer scope; CommandMAPS filter, counts and “load more” behavior use server results. Existing tests and exact-head hosted CI pass.

**Unresolved decisions:** no customer-specific legal or retention decision is needed for this read-only queue correction. Preserve the current status categories; do not introduce new workflow states.

**Out of scope:** queue redesign, search/sort changes, export, new roles, public intake, index/schema migration unless measured query needs prove one necessary, and F09 suspension or production architecture policy.

**Implementation in current worktree:** the API returns at most 100 rows plus a `nextCursor`, validates `status` and signed-bigint cursor inputs, applies `active`/`closed` filters in SQL, and returns full actor-authorized aggregate counts. CommandMAPS uses server filters, displays those counts, loads older pages on demand, and refreshes all pages already opened. Added API regressions cover 215 synthetic mixed-state records, older active discovery, complete counts, cursor stability across a newer insertion, invalid inputs and council/officer/scope boundaries. Browser acceptance covers the 100-row page, complete count, loading older active records and switching to the mixed queue.

**Hosted run finding and correction:** run `39132708366` showed the API suite and new queue regression passing, then failed `tests/browser.mjs` when the detail assertion could not find the just-closed request. Server-side `active` filtering correctly removed it from the queue, but the client had also lost its selected detail. The fix in the current worktree switches to `closed` after a successful close from the active filter and retains the returned, authorized row while the closed page reloads. Exact rerun is pending. Local lint, formatting, typechecks, builds, syntax checks and diff checks pass. Local PostgreSQL-backed API/browser execution is unavailable at `127.0.0.1:55432`; hosted exact-head CI is required.

## Completed acceptance

- Reconciled local main `92b3eea…`, fetched `origin/main`, PR #24, PR #25, CI and review status; no newer main integration was needed.
- Refreshed owner requirements, governance assessment, F09 preparation and F08 completion memories before resuming.
- Confirmed F08 release remains closed; no deployment, migration replay or production change was performed.
- Closed F-029 acceptance at the development boundary on the exact successful hosted head; no live exploit, production change or compliance claim.
- Completed a source-pinned G01 actor/data-flow matrix with local documentation validation; no new law or customer policy was inferred.
