# Governance execution checkpoint

Updated 19 October 2026 (Australia/Melbourne).

## Repository state

- Governance branch: `codex/civicmaps-governance-workstream`; last verified published package head `8ccb7930804ffafd38e31ac22049f58b0ce437d1` (G02 authority evidence and Checkpoint B reassessment).
- Integrated main: `92b3eea8b8ecfd0505afb6d62d60a001903db161`; fetched `origin/main` currently matches.
- PR #24: open and marked ready for review (not draft), no submitted reviews; exact-head run `39129233181` passed. It has not been merged.
- PR #25: open, draft, no submitted reviews; matrix corrections at `993ee2d` passed run `39131572172`; F-011 head `f1ae3a6` passed `39131773353`; checkpoint head `bb3e35c` passed `39132040914`; F-002 code head `22fb3c8` passed `39133034582` and note head `bcf46f5` passed `39133456369`; F-009 candidate `5bcea20` failed only its 503 body expectation in `39133998653`, corrected head `bde643f` passed `39134202266`; F-009 closeout docs at `a8e401a` passed exact-head run `39134550601`, including API/database, ingress, platform, CommandMAPS and first-admin activation browser steps. G02 documentation head `8ccb7930804ffafd38e31ac22049f58b0ce437d1` was pushed, PR body refreshed, and exact-head run `39159642180` passed.
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

## Completed slice: G04 / GOV-10 / F-002

**Goal and outcome:** ensure older active and assigned requests remain discoverable beyond the current 100-row newest-first window, while keeping server-side scope and useful complete authorized counts.

**Source state:** immediately before opening this slice, fetched `origin/main` at `92b3eea8b8ecfd0505afb6d62d60a001903db161`; inspected the incoming merge commit and current endpoint/UI. No new main commits were available; main is an ancestor of governance branch head `bb3e35c0290d19c7e65902f64ce3ef7725433836`.

**Observed behavior:** `GET /api/requests` applies a role predicate and `ORDER BY number DESC LIMIT 100`; CommandMAPS filters the returned 100 client-side and calculates summary counts from that partial page. Thus older active work can be hidden behind newer closed requests. Request `number` is an immutable PostgreSQL `bigint` identity, suitable for a string keyset cursor.

**Likely files:** `services/api/app.mjs`, `apps/commandmaps/src/main.tsx`, `tests/foundation.test.mjs` and focused browser acceptance, plus this checkpoint/workstream status.

**Preserve:** session/context/tenant/jurisdiction/data-plane/organisation/branch RLS and predicates, officer assignment scoping, existing sort semantics, F08 entitlements and ADMIN operational exclusion, request detail/audit visibility, and all mutation/idempotency/version ordering. No migration, unbounded query or client-side expansion of authority.

**Acceptance:** bounded server-side status filtering and stable keyset pagination; authorized aggregate counts independent of page size; invalid filter/cursor requests fail closed; more than 100 mixed-status synthetic requests demonstrate older active work is reachable and counts are complete; inserting newer work between page requests yields no duplicate or skipped cursor rows; direct API assertions retain council/branch/officer scope; CommandMAPS filter, counts and “load more” behavior use server results. Existing tests and exact-head hosted CI pass.

**Unresolved decisions:** no customer-specific legal or retention decision is needed for this read-only queue correction. Preserve the current status categories; do not introduce new workflow states.

**Out of scope:** queue redesign, search/sort changes, export, new roles, public intake, index/schema migration unless measured query needs prove one necessary, and F09 suspension or production architecture policy.

**Implementation in current worktree:** the API returns at most 100 rows plus a `nextCursor`, validates `status` and signed-bigint cursor inputs, applies `active`/`closed` filters in SQL, and returns full actor-authorized aggregate counts. CommandMAPS uses server filters, displays those counts, loads older pages on demand, and refreshes all pages already opened. Added API regressions cover 215 synthetic mixed-state records, older active discovery, complete counts, cursor stability across a newer insertion, invalid inputs and council/officer/scope boundaries. Browser acceptance covers the 100-row page, complete count, loading older active records and switching to the mixed queue.

**Hosted run finding and correction:** run `39132708366` showed the API suite and new queue regression passing, then failed `tests/browser.mjs` because the detail assertion could not find the just-closed request. Server-side `active` filtering correctly removed it from the queue, but the client had also lost its selected detail. The fix switches to `closed` after a successful close from the active filter and retains the returned, authorized row while the closed page reloads. Exact-head run `39133034582` then passed every workflow step, including API/database tests, ingress, worker recovery, platform browser, CommandMAPS overflow/pagination browser, and activation browser. Local lint, formatting, typechecks, builds, syntax checks and diff checks passed. Local PostgreSQL-backed API/browser execution remains unavailable at `127.0.0.1:55432`; CI is the disposable database/browser evidence.

**Review of slice diff:** changed only request-list API behavior, CommandMAPS queue handling, the focused API/browser regressions, and governance evidence. No schema migration or role/grant/authority change. Transaction and mutation ordering, F08 entitlement checks, RLS/council scope, officer assignment filtering and request/audit content are preserved. The queue page query stays capped at 100 rows; summary counts aggregate only rows visible under the active scoped session. No live or production testing was performed.

## Completed slice: G04 / GOV-10 / F-009

**Goal and user-visible/security outcome:** bound simultaneous `/api/resources/status` provider checks so slow authorized checks cannot consume the shared control PostgreSQL pool without a limit; return a prompt temporary-capacity response to excess status requests and avoid the unnecessary STS/S3 credential call on this DB-readiness-only path.

**Observed source path:** `services/api/app.mjs` authenticates session/route, rejects council ADMIN, resolves operating context, checks `resources.read`, and invokes `withMunicipalityResource` inside a shared-pool transaction. `services/api/data-resources.mjs` revalidates context and enabled/succeeded resource binding/registry ownership, then retrieves runtime secret metadata/value, opens the municipality DB connection, and currently assumes an S3 role even though status only probes `council.resource_records`. PostgreSQL pool max is 10. Context revocation serialization is transaction-bound and must remain intact.

**Likely files/interfaces:** `services/api/app.mjs`, a small in-process admission helper, `services/api/data-resources.mjs`, `tests/data-resources.test.mjs`, focused admission/API acceptance, and this checkpoint/workstream evidence.

**Preserve:** current authentication, route binding, non-ADMIN exclusion, resolved context, `resources.read` entitlement, revocation lock/transaction boundary, enabled succeeded resource and exact registry ownership checks before provider calls; runtime DB TLS connection closure; default storage behavior for existing direct/cloud helper callers. Leave existing F08, RLS and F09 policy behavior unchanged.

**Dependencies/decisions:** none for this scoped development fix. Admission cap is per Node API process and only limits this status operation; it does not prove cluster-wide isolation or production capacity. No production threshold/budget is inferred.

**Acceptance:** deterministic no-queue admission test proves one in-flight status permit, prompt rejection at capacity, and permit release after both success/failure; disposable/synthetic delayed-provider integration proves unrelated API DB work proceeds while one status operation is delayed; status does not request storage credentials; disabled resource, revoked/unbound context, and tampered registry binding deny before provider access; existing helper callers retain default storage behavior; exact-head hosted DB/API tests and relevant local static checks pass. No live cloud, saturation, fault or load test.

**Candidate review disposition:** a separate GPT-6 Luna read-only review found no concrete regression in helper defaults, connection cleanup, or status route auth/context/entitlement ordering. It confirmed the gate is one permit per API process and noted `/api/resources/status` is not the only provider readiness path: CommandMAPS routing middleware also opens a resource connection and probes `council.resource_records`, outside this status-specific gate; direct helper/runtime callers likewise do not use it. This slice intentionally bounds the reported status endpoint only and does not claim all provider probes or multiple API processes are globally serialized. Reassess the routing middleware path separately if evidence shows it contributes material shared-pool pressure; no measured impact or live test is available.

**Out of scope:** moving provider work outside the transaction, cross-process/global capacity coordination, production pool/budget changes, broad provider redesign, changing council grants, new architecture/retention policy, F09 suspension semantics, deployment or migration.

**Acceptance result:** the exact source head `bde643f8da5a9cb394d9b351abda02da78338719` passed hosted run `39134202266`; the initial body assertion mismatch and correction are retained above. The one-per-process gate limits only `/api/resources/status`. CommandMAPS routing middleware still has a separate resource readiness probe and multiple API processes are not globally coordinated. No evidence here establishes live outage thresholds or cluster-wide capacity.

**Implementation:** `services/api/admission.mjs` adds a non-queuing process-local permit gate; `/api/resources/status` acquires one permit before opening its shared-pool transaction and returns the normal generic 503 response when busy, releasing in `finally`. The endpoint opts out of the helper's storage credential object; existing helper callers still include it by default. The test app can inject a synthetic delayed status operation and gate; helper tests use synthetic connection/credential adapters and transactionally exercise disabled and revoked states, plus the existing altered-registry test covers tampered registry binding.

**Validation:** `npm run lint`, `npm run format:check`, both app typechecks and builds, syntax checks and `git diff --check` pass. `node --test tests/admission.test.mjs` passes (1/1). Targeted DB-backed tests could not initialize locally because PostgreSQL is unavailable at `127.0.0.1:55432` (`ECONNREFUSED`). Hosted run `39133998653` on candidate `5bcea2020068d12ab20c42e32e4bd12843a583f2` failed only because the test expected a detailed 503 body while the API masks 5xx bodies generically. The handler now returns the generic busy response directly. Exact-head rerun `39134202266` passed on `bde643f8da5a9cb394d9b351abda02da78338719`: the disposable API/database check passed all 81 tests, including admission, delayed status/unrelated API, helper credential-skip and revoked/disabled checks; ingress, recovery, platform browser, CommandMAPS browser and activation browser steps also passed. This is development/test-fixture evidence, not production load or availability measurement.

## Completed acceptance

- Reconciled local main `92b3eea…`, fetched `origin/main`, PR #24, PR #25, CI and review status; no newer main integration was needed.
- Refreshed owner requirements, governance assessment, F09 preparation and F08 completion memories before resuming.
- Confirmed F08 release remains closed; no deployment, migration replay or production change was performed.
- Closed F-029 acceptance at the development boundary on the exact successful hosted head; no live exploit, production change or compliance claim.
- Closed F-002 and F-009 acceptance at the development boundary on exact successful hosted heads; F-002 run `39133034582`, F-009 run `39134202266`. F-009's first hosted assertion mismatch was corrected; the rerun passed all 81 tests and browser checks.
- F-009 closeout evidence at `a8e401a` passed exact-head hosted run `39134550601`; no live load/production availability claim is made.
- Completed a source-pinned G01 actor/data-flow matrix with local documentation validation; no new law or customer policy was inferred.

## Next active outcome

Prepare source-backed G02 actor/action and council self-administration evidence. The matrix extension below is under documentation validation and advanced Checkpoint B review. Do not introduce new grants or dependent council administration behavior until authority choices are explicit and Checkpoint B findings are available. Continue any independently validated bounded implementation; G02 policy dependencies do not become a blanket development gate.

## Active slice contract: G02 / GOV-02 / GOV-03 / Checkpoint B preparation

- **Goal and outcome:** extend the existing authority/data-flow matrix with source-pinned implemented actions, actual access boundaries and the missing council self-administration decisions, ready for advanced review before any cross-cutting authority implementation.
- **Requirements:** G02, GOV-02 (actor/action authority), GOV-03 (council administration design), and Checkpoint B. This slice is evidence and decision preparation; it does not implement council identity or permissions.
- **Source pins:** latest integrated `origin/main` `92b3eea8b8ecfd0505afb6d62d60a001903db161`; current governance branch at slice start `a8e401a0d4c1a3524e0492e67872a7fbdfef7c67`.
- **Likely files:** existing `docs/plans/evidence/2026-10-19-authority-data-flow-matrix.md`, this checkpoint, and a concise pointer in `docs/plans/governance-workstream.md` if needed. No application/schema files expected.
- **Preserve:** F08 Alpha usable administrator and Beta disabled administrator/no sessions; council/context/entitlement checks; existing `ADMIN` operational exclusion and direct API/RLS negatives; operator audit/idempotency/CSRF and route/version controls; current pack entitlement ceiling and route semantics.
- **Unresolved decisions:** who may invite/disable council staff, assign operational roles, administer branches/contexts/settings, and activate licensed packs within an operator-controlled entitlement ceiling; admin cardinality and delegated approval; MFA/SSO; emergency recovery; and any support/operator access to council records. Do not infer these choices from the first-admin activation flow or F09 policy.
- **Acceptance:** map each actor to observed routes/actions and denied scope with source/test evidence; distinguish platform app SQL grants from runtime/broker/database/infrastructure powers; state unknowns and limits; present bounded decision options and consequences with accountable decision owners; request independent assessment before boundary design/implementation. Validate document links and whitespace. No code, migration, grant, identity, product-policy or production changes.
- **Current result:** matrix extension is source-backed by main `92b3eea…`, Platform and activation source, migrations and direct API/SQL negative assertions. Two advanced GPT-6 Astra read-only reviews found the corrected evidence source-accurate and ready for owner decision preparation. Exact-head CI `39159642180` passed on package head `8ccb793…`. No code or authority changed.
- **Out of scope:** new identities/roles/grants, staff lifecycle endpoints, pack activation semantics, IdP/domain selection, database/key/support architecture, destructive records behavior, F09 suspension policy, and production acceptance.

## Advanced-model Checkpoint B — initial reassessment findings and correction record

**Review pins:** GPT-6 Astra reviewed the current governance branch head `a8e401a0d4c1a3524e0492e67872a7fbdfef7c67`, integrated main `92b3eea8b8ecfd0505afb6d62d60a001903db161`, and the initial uncommitted G02 matrix/checkpoint draft. The governance source code did not change. The review was read-only; it did not run tests, validate legal claims or inspect live infrastructure.

**Supported findings checked against source and incorporated into the matrix:**

- First-admin flow is initial bootstrap, pending-token reissue and disable—not general recovery. Approved D02 excludes reactivation/general user management; issuance requires the designated identity remain pending. The operator receives a raw bearer URL; recipient verification is an operator assertion/email equality check and redemption proves token possession, not independent mailbox/IdP control. New staff grants attached to this bootstrap principal would expand trust and require an explicit decision.
- Platform wrapper claims now cover business control-plane routes only. Login/logout use separate handling; logout is not an idempotent/audited business mutation. Business audit and specialized council-admin/route-event streams are distinguished.
- Enabled operational packs grant all operational roles scoped officer-directory and resource-status reads; D03 retains already-authorized request/audit review after pack disable. Officer assignment scope and supervisor mutation denials remain explicit.
- Runtime evidence is stronger than the narrower application-role grants: `civicmaps_f06_runtime` has `BYPASSRLS`, `SELECT` on all control tables and membership in both local and platform app roles. It is recorded as cross-council technical read/control-plane capability, a G03 boundary, not an alleged access event. Provisioning and routing workers are separated; routing worker and API share the development OS identity/environment.
- Direct API/SQL negative evidence is scoped to the tested actor/context/app role and is not proof against forged settings or a compromised BYPASSRLS broker. The matrix now links the existing cross-plane, provisioning, officer/supervisor and context/cross-council negatives.
- The decision set now includes global-vs-council-vs-context role scope, self/peer elevation and approval, immutable grant revocation/regrant and rehire, target/approver attribution, retained-record custody after staff/assignment/context/pack/route changes, and restore/recovery behavior.

**Review recommendation:** the reviewer said this evidence is suitable as Checkpoint B preparation after corrections, but it does not approve a council-admin or isolation architecture. Independent bounded development may continue. The reviewer identified essential owner decisions before dependent implementation:

1. Which council principals can administer staff, operational roles or administration itself, at what scope, and may they approve their own elevation?
2. Is council identity authoritative in CivicMAPS, a customer IdP, or a defined combination; how do first-admin verification, extra admins, lockout recovery and IdP failure work?
3. Who creates/replaces branches and contexts, regrants revoked access, and retains historical record access after staff/organisation changes?
4. How are operator commercial entitlement and council feature activation represented separately, including disable/re-enable, concurrent writes and retained-record review?
5. Is the provider boundary controlled privileged access or provider inability to obtain plaintext; which runtime, deployment, DB, key and support actors are trusted?
6. Who are the named decision owners and records custodians for preservation, restore and exit?

**Limitations and disposition:** no production isolation, independent identity assurance, complete support inventory, customer approval or legal certification is established. The first-admin design remains within already-approved synthetic D02; its limitation is documented, not changed. Existing Alpha-usable/Beta-disabled state and F08/D03 preserved-record behavior remain constraints. The corrections are documentation-only and do not change grants, identity, pack behavior, data access or deployment.

**Follow-up questions for the advanced reviewer:** confirm each source correction is accurate; flag any remaining misleading authority or preservation claim; assess whether the unresolved decision set is sufficient to defer G02-dependent behavior without stopping independent development; and confirm whether the corrected evidence package is reviewable for an owner decision. No cross-cutting identity, council administration, DB isolation, key or privileged-support boundary may be implemented until its necessary owner decisions are explicit and reassessed.

**Corrected-package follow-up (GPT-6 Astra):** read-only source review against the same governance source baseline `a8e401a…` and main `92b3eea…` found the substantive corrections supported and no remaining material mismatch. The reviewer identified that “Business actions append” could imply reads are audited; this was corrected to “Business mutations append.” The corrected documentation package was published at head `8ccb7930804ffafd38e31ac22049f58b0ce437d1`; exact-head hosted run `39159642180` passed. The reviewer recommends the evidence is ready for owner decision preparation. It did not independently validate CI, deployed configuration, legislation or customer approval and is not legal/production certification. No files or tests were changed/run by the reviewer.

**Checkpoint B disposition:** preparation and reassessment are complete for source-backed authority evidence. The next dependent implementation remains blocked only on the specific owner/customer decisions listed above, not on governance generally. Continue independent bounded corrective and functional work. Before a new cross-cutting authority boundary is implemented, pin its chosen actor/action semantics and obtain the required reassessment.
