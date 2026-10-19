# First implementation slice: synthetic council-principal ownership

**Status:** exact design contract for second independent Astra review. No implementation or tests have begun. This slice changes synthetic development identity/session/context ownership only; it adds no council administration powers.

## Source and decision basis

- Signed owner record SHA-256 `63e61d2a0f800b4fa713ed5b5f8041c8e5c43bf10930b95e18d0c412f8f4af30`, 12 pages, original attachment path `/workspace/.codex-attachments/5fa8a430-9b37-4938-8771-47e07dc901c9/893e65ba-127a-4c72-acf6-5e286bf3377d/CivicMAPS_rebuild_owner_decision_runsheet_EXECUTED_SIGNED.pdf`. Q02 requires independent council identities/sessions/status/grants/work; Q03 selects SSO preference with governed MFA fallback. Owner execution remains a document assertion, not independently authenticated.
- Application code pin: `b7d7ec53d2b14259162965ea24861a565a590b95`; integrated main `1bbfa7bb68190278d6adb64bba39527b7a3e7e36`. Governance docs later at `a88d8c5eb227fb2b285b24cd27aaae08c72fb00d`. Existing [D02](../F07-D02-decisions.md), [D03](../F08-D03-decisions.md), [authority matrix](2026-10-19-authority-data-flow-matrix.md), [Astra first review](2026-10-19-q01-q05-astra-review.md), [review assessment](2026-10-19-q01-q05-astra-review-assessment.md) apply.

## Goal and non-goals

Create an immutable council owner for every synthetic principal and enforce it at session issue/authentication, context resolution/routing and context-grant write. Retire the known Alpha principal's cross-council Beta fixture grant with history. Preserve current D02 Alpha-usable and Beta-disabled/no-sessions states and all record attribution.

This slice does not add council staff administration, separate admin permissions, branch delegation, per-context role grants, recovery, structural change execution, Q06 activation, Q09 record-custodian access, duplicate-email login, SSO/MFA provider integration, production topology, or production isolation. It cannot claim full Q02/Q03 completion while `users.role` remains user-level and email remains globally unique.

## Explicit owner map; no production inference

Use a new fixture-only `data/fixtures/council-principal-ownership.json` listing explicit synthetic principal IDs and municipality IDs. For the current synthetic actors: Alpha owns IDs `00000000-0000-4000-8000-000000000001`, `...0002`, `...0003`, and `...0006`; Beta owns `...0004` and `...0005`. Any activated first-admin principal owner is the exact municipality already represented by its `platform_first_admins` row and verified activation binding. Do not derive ownership from email, display name, tenant/organisation/jurisdiction home fields or selected context. This static fixture file is not a customer/production ownership algorithm.

For any non-fixture or future customer identity, migration must require an explicit council-authorized ownership record. Missing, ambiguous or contradictory ownership fails closed for the affected identity and blocks its migration/admission until reconciled. Never guess or auto-split, clone credentials, or issue replacement grants. If a global migration preflight encounters an unknown existing principal, stop the migration before enforcement rather than guess.

### Q02 login and account-enumeration rule

Each principal's session belongs to one immutable council. When duplicate normalized emails exist at multiple councils in a later Q03-compatible auth slice, the authentication request must be scoped to an explicit council audience/municipality and query the email only within that council namespace. Same email at councils A/B is two principal records; it is never one global lookup followed by a context check. Missing/wrong audience, unknown email, wrong password, disabled status or an email present only under another council produce the same generic failure and reveal no account status/existence or list of other councils. A council may use a local username instead of email if its approved identity lifecycle requires it. This first slice retains unique synthetic emails and does not enable duplicates; the follow-on Q03 design must implement audience-scoped lookup before duplicate local identifiers are accepted. Shared SSO authenticates a person but does not merge council principals, grants or sessions.

## Required synthetic compatibility change

The source test fixture proves this mismatch: `shared@alpha.example` (`00000000-0000-4000-8000-000000000006`) has an explicit grant to context `10000000-0000-4000-8000-000000000003`, whose municipality is Beta; `tests/operating-context.test.mjs` expects the same principal to use Alpha and Beta contexts and later creates an Alpha officer's Beta grant. The owner selected Q02 after that test/fixture existed. The old shared-service success expectation is therefore superseded by Q02; it is not a live-data finding.

- Keep `...0006` as one Alpha principal and retain its Alpha grant.
- Set the existing `...0006` to Beta-binding grant's `revoked_at` and preserve grant ID/row/context-change history. No Beta user, password hash, session, or new grant is created.
- Preserve Beta historical records and existing actor/capture IDs. They do not become visible to the Alpha-owned principal. Whether to revoke the now-unassigned Beta context binding itself is outside this slice; it may remain as Beta-owned historical/context fixture data only if it grants no cross-council access.
- Keep Alpha's actual first-admin principal active and usable for its approved profile/context. Keep Beta's actual first-admin principal inactive and with no sessions/tokens. D02's disabled Beta admin may retain a `revoked_at IS NULL` context-grant row; verify the principal is inactive and the grant is non-effective. Do not relabel it revoked. These first-admin states are distinct from `shared@alpha`.

## Exact file and migration/API scope

| File | Planned change |
|---|---|
| `services/api/migrations/014-council-principal-ownership.sql` | Add immutable `user_id → municipality_id` owner relation and session owner column; install narrowly scoped DB checks so new active grants match principal owner and only explicit owners can issue sessions. Revoke only known owner-mismatched synthetic grants with preserved history. Replace/wrap D02 redemption DB transition so verified activation municipality/binding creates principal owner and grant in one transaction. Grant no owner-write capability to app roles/runtime; fixed search paths and exact function execute grants. Do not edit historical migration 012 or introduce reactivation/recovery. |
| `services/api/migrate.mjs` | Register migration 014 after 013. Migration/preflight must fail closed on incomplete/ambiguous pre-existing principals; no backfill by email/home fields. |
| `data/fixtures/council-principal-ownership.json` | Explicit synthetic-only ID→municipality map. Document this as fixture source, not production algorithm. |
| `services/api/seed.mjs` | Apply explicit owner rows before grants; remove shared-user Beta assignment; reject conflicting ownership instead of silently ignoring it. Re-seed must not revive revoked grants or disabled principals. |
| `data/fixtures/operating-contexts.json` | Remove `userIds` linking Alpha-owned `...0006` to Beta context. Keep no auto-replacement identity/grant. Retain context only as scoped Beta test/history data, with no Alpha owner access. |
| `services/api/app.mjs` | Login/session issuance reads explicit owner, writes immutable council ID into session; authentication rechecks session owner equals current immutable owner and user remains active. Keep generic auth errors and current synthetic unique email behavior. |
| `services/api/operating-context.mjs` | Filter permitted/selected context by immutable principal/session municipality; missing or mismatched owner denies before setting application scope. Same-council multiple contexts remain grant-dependent. |
| `services/api/routing.mjs` | Routed service municipality must equal authenticated session owner and selected binding municipality. Caller context/header cannot change owner. |
| `services/api/admin-activation.mjs` | Only if required to pass the verified municipality to the new narrow database transition; no new authority or token semantics. Prefer keeping URL/input unchanged and deriving owner inside the existing D02 function. |
| `tests/operating-context.test.mjs` | Replace shared principal success case with Alpha-only grant and Beta denial; assert historical grant revocation. Add same-council positive, separate Alpha/Beta identities/sessions, and dynamic third-council/Gamma owner/context positive. |
| `tests/admin-activation.test.mjs` | Assert activation writes exact council owner atomically; disabled Beta stays disabled/no sessions/tokens and its residual grant row is non-effective; Alpha remains usable. Preserve token requirements. |
| `tests/context-migration.test.mjs` | Upgrade pre-014 synthetic schema with explicit owner mapping; assert no actor/origin/history rewrites and migration idempotence. Unknown/multiple owner preflight fails closed. |
| `tests/context-rls.test.mjs`, `tests/helpers/environment.mjs` and focused migration/test helpers | Update setup for new migration/owner/session shape; assert limited app-role behavior and direct grant denial. Note residual BYPASSRLS boundary. |
| `tests/browser-routing.mjs` only if the ownership/session check changes its routing contract | Preserve existing Alpha/Beta cookie/service isolation checks; add wrong-council-session check only if it is an API/route behavior not covered by integration tests. |

No UI, staff lifecycle endpoint, migration outside this ownership/session/grant scope, admin schema, operational role redesign, retention/records policy, infrastructure, production deployment, or data-resource changes.

## Invariants and implementation order

1. **Owner source.** Populate the owner map from the explicit synthetic fixture and the existing verified D02 principal→municipality relationship only. For non-fixture data, require a separate council-authorized manifest. No field-derived ownership.
2. **Migration preflight.** Before constraints take effect, enumerate users, owners, sessions and context grants. If any owner is missing/ambiguous, or an unclassified council relationship exists, abort before mutation. For listed owner mismatch, stage the exact mismatch report; only the reviewed known synthetic Alpha→Beta grant is revoked. Do not auto-revoke arbitrary unknown/customer grants.
3. **Owner/session enforcement.** Add owner and session-council records; current login makes one session for that owner. Existing sessions can be attached only from an explicit owner row; otherwise revoke session, keep principal state/history, and require ordinary sign-in. Never infer from its last context. Auth verifies owner/session equality every request; route and context verify owner equality before scope settings.
4. **Grant enforcement.** Database trigger/constraint checks every new non-revoked grant against authoritative owner and target binding municipality, including seed and direct API/runtime writer paths. Existing incompatible grant is revoked, not deleted; any later regrant needs explicit owner-authorized council principal and new grant. Revocation remains allowed and immutable history records it.
5. **D02 activation.** New activation owner equals the municipality and exact context binding already verified by the designated D02 transaction. User insert, owner insert and context grant insert are atomic. Owner cannot be caller-selected, changed, or inferred from email. Preserve 24-hour single-use hash, pending-only reissue, exact binding, no plaintext receipt replay and disable token/session invalidation.
6. **Fail closed.** Missing/ambiguous owner, mismatched council session, grant or route denies before an operational transaction. Identical generic sign-in failure for unknown/wrong-council account; no cross-council existence disclosure. No fallback to home fields.

## Acceptance cases

The second Astra review supports this synthetic slice subject to the binding corrections in the supplement below; implementation verification remains pending.

- **Positive within one council:** Alpha principal successfully uses each explicitly granted Alpha context; no ungranted same-council context is added. Same-council operational behavior/data isolation and idempotency remain.
- **Positive two councils:** independent Alpha and Beta principal IDs/credentials have separate owner/session records; each only sees its own grants/contexts; Alpha disable does not alter Beta session/status and vice versa. A cookie from one cannot be used with the other's context or routed service.
- **Positive >2 councils:** add isolated synthetic Gamma plus at least one context; Alpha, Beta, Gamma principal/session/context resolution all succeed in their own scope. Proves data-driven ownership, not Alpha/Beta hard-coding.
- **Known synthetic mismatch:** `shared@alpha.example` retains Alpha and cannot use Beta binding `...0003` on `/auth/contexts`, route, request, audit, officer or direct resolver path. Existing Beta grant row remains with `revoked_at` and audit history; no cloned Beta identity/credential/grant. An attempt to add an Alpha officer's Beta grant is denied at database write boundary.
- **First-admin preservation:** Alpha initial admin stays active and usable for approved context/profile. Beta initial admin remains inactive, has no sessions/tokens, and cannot login/resolve scope; inspect any `revoked_at IS NULL` grant row and prove it is non-effective, not falsely revoked. D02 reissue/redeem/disable constraints remain.
- **Session spoofing:** mismatched/missing owner on session, reused Alpha cookie against Beta context/route, owner tampering, disabled principal, and stale pre-migration session are denied before application scope. Generic error does not reveal whether another council holds the identifier.
- **Migration/seed:** exact known synthetic mapping is deterministic and idempotent; rerun does not recreate revoked Beta fixture grant or user; historical actor IDs, request origins, audit, receipts and binding IDs do not change. Missing/ambiguous/non-fixture owner fails before guessed mutation/admission.
- **Direct grant/owner writes:** same-council grant accepted through authorized seed/D02 paths; app/runtime grant insert remains denied; cross-council grant rejected at the database boundary; runtime/app cannot alter/delete principal ownership. Grant revoke of pre-existing known mismatch allowed and audited. Owner assignment for D02 activation is performed only by the verified municipality-bound function.
- **Concurrent races:** login vs disable, owner mismatch vs seed, grant write vs revoke, repeated migration, and request vs context-grant revoke cannot produce a cross-council session or active grant. Repeated effect cannot duplicate authority.
- **Authentication duplicates (deferred contract):** current globally unique email column is case-sensitive in storage while login normalizes its input; do not claim a normalized unique constraint. Before enabling duplicates, test exact council-audience lookup for same email in Alpha/Beta; wrong or missing audience and wrong password return indistinguishable generic failures, never a council list/status, and local username names remain scoped. Do not claim this first slice implements that later behavior.
- **Residual path:** state what restricted application-role/API tests show. Explicitly record that compromised `civicmaps_f06_runtime` with `BYPASSRLS`, database owner/superuser, migration credentials, trigger/DDL control and deployment host remain trusted/bypass paths; do not assert protection against them.

## Rollback and recovery constraint

This migration is forward-only for authority: owner records and grant-revocation history cannot be removed or reversed by seed rerun. Old application code must not be admitted after enforcement because it does not check session council; added schema does not technically prevent old reads. If rollout fails, keep API operation/admission closed until a compatible forward repair preserves owner and revocation state; no rollback to pre-014 permissive behavior. A whole-database restore from before a revocation cannot be proven safe by this slice; require authoritative immutable revocation reconciliation before service is reopened. Do not claim a restore mechanism exists.

## Explicit residual limitations

1. **No full Q02 claim:** user-level role remains global across a principal's same-council contexts. Per-context roles/grants are later work; this slice adds no differing roles between contexts.
2. **No duplicate-email implementation:** current global email uniqueness remains. Council-audience local lookup, same-email multi-council principals and possible council-local usernames are Q03 follow-up; adding duplicate emails before that implementation is prohibited.
3. **No customer production migration:** synthetic fixture manifest is not a real ownership decision. Unknown existing non-fixture principals fail closed pending explicit council-approved ownership; no email/home-context inference or auto-splitting.
4. **No broker/host isolation:** runtime `BYPASSRLS`, broad control-table access and privileged helper paths remain; database owner/superuser, DDL/trigger deployment, migration credentials and host can exceed app checks. Q08 dedicated council runtime/data credentials and support boundary is separate.
5. **D03 preserved-read rule:** disabled feature still permits retained request/audit reads for already authorized in-scope operational users; denies disabled-feature writes and active lookups. Q06 ceiling restore cannot silently reactivate council feature state. This first slice preserves but does not implement Q06.
6. **No admin/recovery/structural features:** Q01/Q04/Q05 workflows stay disabled/unimplemented until separately designed/reviewed.

## Approval gate

The second Astra review is complete and supports the synthetic first slice subject to the binding corrections above. Its disposition is design support, not implementation validation or authority for customer migration, deployment, production changes, or broad Q01–Q05 workflows.

## Second Astra disposition and binding corrections

A second independent Astra review found this synthetic slice implementable without further owner policy decisions, subject to the corrections below. See [full second review](2026-10-19-q01-q05-astra-second-review.md). Implementation will be pinned to a separately hashed work contract before code changes; this document's original reviewed hash is recorded in that report.

These statements supersede any contradictory detail above:

- Migration 014 stages nullable ownership/session data. The migration runner loads and validates the explicit fixture manifest in the same advisory-locked transaction, then migration 015 enforces it. Close API admission for migration because the advisory lock does not stop application writes. Fresh install migrates before seed; seed order is municipalities, users, owners, bindings/grants. Pre-004 tests create explicit municipality prerequisites. Unknown, ambiguous, duplicate or conflicting owner/grant relationships abort the whole migration before enforcement. Never infer or auto-revoke customer data.
- D02 disable deletes sessions and marks outstanding activation tokens revoked, retaining token/event rows. Acceptance is zero sessions and zero usable outstanding tokens. Grant history is the composite `(user_id,binding_id)` row plus `operating_context_changes`; there is no grant ID or grant replacement in this scope. The inactive Beta first-admin's unrevoked grant remains non-effective.
- Existing session rows may remain only when explicitly mapped, valid, active, and route-consistent. Deny/revoke unbound, mismatched, expired, disabled, or wrong-route sessions; `shared@alpha` must not use any Beta session/context path. Wrong-council login has the same generic failure as wrong credentials/unknown user. Do not let replacing one council session delete another principal's session; integration tests use separate council cookie jars.
- Existing global email uniqueness is case-sensitive in storage, while current login normalizes inputs. Do not claim a normalized unique constraint or enable duplicate identifiers. Future same-email principals require explicit council audience lookup and generic failure without cross-council enumeration. Missing-audience handling is deferred until that API exists.
- Keep session `(user_id, municipality)` immutable and preserve 009/012 lock ordering. Maintain/strengthen `valid_operating_context()` for DB-authoritative owner checks. App roles cannot write grants; same-council positive grant tests use authorized seed/D02 paths, while app-role grant insert stays denied. Direct checks do not defeat compromised `BYPASSRLS` broker identity.
- Add historical upgrade tests for pack entitlements, admin activation and service routing; explicitly map test-only legacy IDs, including `...0099`. Split mapped pre-004 success from unknown-owner preflight failure and update migration count to 15. Fresh seed does not fabricate a historical Beta grant.
- Keep the generic independent approver out of recovery; only the separately designated custodian can authorize recovery. Recovery is outside this implementation.
- Old code must not be admitted after schema enforcement; schema changes do not technically prevent old reads. On failure, keep admission closed for forward repair. A pre-revocation whole-database restore requires external authoritative revocation reconciliation, not supplied by this slice.

The exact implementation work contract is tracked at `/workspace/work/council-principal-ownership-implementation-contract.md` (SHA-256 `092c571acb6be63cc2d9f340180fca951b8bdb88964d4bfe077f60e8b9e03716`). It authorizes synthetic/test implementation only and does not authorize customer migration, deployment, AWS actions or production changes.
