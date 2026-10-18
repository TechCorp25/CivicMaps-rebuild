# F09 — Municipality suspension and resumption plan

Prepared 18 October 2026 (Australia/Melbourne) by Codex (agent). **Status: planning only; implementation paused by the owner-required governance gate. Suspension policy choices are not approved.**

## Current owner governance gate — 18 October 2026

PR #22 is owner-merged at `0aba5e025f08e1f6dd8aefe00dc899b38cc94975`. The owner has since required the broader [governance, council administration and isolation gate](governance-and-production-readiness-gate.md) before deeper implementation. Read the [current 65-finding assessment](evidence/2026-10-18-governance-review.md). F09 is blocked; its authority/access/session proposals must be reconciled with that outcome before implementation. F08 remains deployed/live accepted; no release or migration replay is needed. References below to PR22 awaiting owner merge describe the earlier preparation checkpoint and do not reopen it.

## Goal and starting point

An authenticated Platform operator can suspend an existing synthetic municipality without deleting its records, and resume it only after current resource/routing readiness is verified. Scope is the [roadmap F09 card](civicmaps-platform-assessment-and-autonomous-plan.md#f09--municipality-suspension-and-resumption): audited status transition, access/session enforcement and UI state.

F08 is owner-merged, deployed and live accepted on source `b21e764ad1151aa3e4dce6f91f29f24f69b31916`, as verified by original inspected SSM receipts in the [release closure](evidence/F08-release-closure.md). Its supplemental 83-file source check also passed and is reconciled; only the original local manifest remains unavailable, explicitly disclosed as a provenance limitation. Do not redeploy F08 or replay migration 013 to start planning. Do not mark F09 implemented or acceptance-passed merely because this plan is published.

Current main at reconciliation is `c011cc7c0fa12902e5d8626f6365af4d829dc36f`; its only change after the F08 merge removes a placeholder `.gitkeep`. Refresh the ledger, main and applicable AGENTS.md before implementation. Keep one implementation feature active. Closure review/publication, implementation, deployment and owner merge are distinct.

## Dependencies and preserved constraints

| Dependency | Existing evidence / required treatment |
| --- | --- |
| F06/F06Q routing | Preserve explicit route ownership, context/resource binding, trusted ingress, bounded recovery and readiness freshness. Use [routing runbook](../development/service-routing.md) and historical release evidence |
| F07 identity | Preserve own-profile/session/context-only ADMIN authority, usable Alpha administrator and disabled/inactive/zero-session Beta administrator. [F07 release closure](evidence/F07-release-closure.md) |
| F08 entitlements | Suspension is an additional municipality-level gate. Resume cannot enable a disabled pack, expand a role/grant or bypass retained-review policy. [D03](F08-D03-decisions.md), [implementation evidence](evidence/F08.md) and [release closure](evidence/F08-release-closure.md) |
| Release reconciliation | Original deployment/live/recovery/supplemental receipts are inspected and passed; preserve reconstructed-manifest provenance. PR #22 remains draft for owner review/merge; refresh its current head/CI rather than restarting F08 |
| Concrete suspension policy | Resolve the choices below before implementing policy-dependent behaviour or changing live municipality state |
| Test fixture/readiness definition | Choose disposable fixtures for destructive session/suspension tests. Define which current readiness checks permit resume, including freshness and failure behaviour |

Parking Services remains the first departmental feature package. Branches share the operational map and vary tools/workflows by capability. Choosing a later contrasting branch remains open and non-blocking for F09. F09 does not port parking field features, implement general GIS/data connection, expand personnel administration or select a new provider.

Retain the existing Sydney resources/checkpoints through 21 October 2026 under the saved US$50/month allocation. Do not suspend a retained live council or consume an intended continuing administrator just to complete a test without concrete fixture authorisation. Disposable/local tests should establish the policy first.

## Proposed bounded scope

Inventory implemented authentication, own-profile/context, operational requests/actions/audit, personnel/resource lookup, provisioning/routing workers and Platform management endpoints. Trace every municipality-bound entry point and durable mutation path. Record which paths are currently executable and which public/mobile/payment entry points remain scaffolds.

Add one authoritative suspension lifecycle with optimistic version checks, actor/reason/time audit, idempotent retries and explicit allowed source states. Enforce it on the server and relevant durable transitions, including existing sessions, stale client caches and idempotency replays. Keep Platform recovery authority distinct from council data authority.

Platform should expose current state, attributable history, conflicts and why resume is unavailable. Council clients should receive a truthful unavailable/suspended state using the approved access matrix, without exposing another municipality or claiming stale readiness is current. A UI label alone does not enforce suspension.

Resume must recheck the selected resource/routing readiness evidence within an agreed freshness window. Preserve records, audit, routes/ownership, bindings, grants and pack configuration. Use an audited transition; failure leaves the municipality safely suspended and makes recovery visible.

## Decisions to obtain before policy-dependent implementation

The roadmap does not specify these choices, and F08 pack-disable approval does not silently decide them for whole-municipality suspension. The following are **recommendations for owner review**, not adopted policy:

| ID | Proposed initial choice | Decision still required |
| --- | --- | --- |
| F09-P01 access matrix | Deny council operational reads/writes, directory/resource access and new council sign-ins while suspended; retain bounded Platform status/recovery management without council record access | Whether own-profile/logout/context discovery and any already-authorised request/audit review remain available; list each permitted actor/action explicitly |
| F09-P02 in-flight ordering | A protected mutation commits before suspension or is denied after suspension commits; no grandfathered completion exception | Confirm ordering and whether any explicitly named action has an exception; include worker/external side effects in the inventory |
| F09-P03 sessions | Revoke municipality-bound council sessions on suspension; require fresh sign-in after resume, with no resurrection of revoked sessions | Confirm revocation versus temporary denial, treatment of multi-context sessions and whether sign-in/activation/profile endpoints remain usable |
| F09-P04 resume readiness | Require current healthy, correctly owned resources/routes and compatible installed source/migrations; failure or stale evidence blocks resume | Select concrete checks, freshness window, failure/retry behaviour and operator authority; do not invent D06 SLOs |
| F09-P05 state/authority | Permit versioned suspend from an agreed ready state and resume from Suspended; require an operator reason and attributable audit | Confirm allowed source states, permission granularity and whether provisioning/degraded states have separate handling |
| F09-P06 public/future consumers | Fail closed for municipality-bound public intake and future payment/field consumers, while preserving trusted provider evidence for reconciliation when those features exist | Specify any public/status/reconciliation exceptions when those consumers are implemented; do not claim unavailable scaffold flows are tested |

Owner choices may replace the recommendations. Record the exact approval source and accepted matrix in a separate decision section/sheet before implementation. Apply the owner-required governance gate above. Preserve approved D03 behaviour; resolve concrete F09 choices against the resulting authority model before dependent implementation. Selecting a second branch is not one of those blockers.

## Acceptance criteria

1. **Transition authority and audit:** authorised Platform operators perform versioned suspend/resume with actor, reason, previous/new state and time. Council/ADMIN callers and wrong-context requests cannot administer suspension. Missing CSRF, stale version and conflicting concurrent transitions fail without partial state.
2. **Authoritative access matrix:** direct requests across every currently implemented municipality-bound endpoint enforce the approved matrix, independent of UI controls, stale cookies/caches and pack version. Platform authority does not grant council record access.
3. **Real transaction ordering:** tests hold actual locks and exercise both suspension/write orderings, as well as replay after suspension. No mutation commits after suspension contrary to the approved rule. Include applicable worker transitions and stale requests.
4. **Session behaviour:** approved revocation/denial applies immediately to existing and newly attempted sessions, including multi-context behaviour. Resume does not resurrect disabled users, revoked sessions or grants; Beta administrator remains disabled and zero-session.
5. **Readiness-gated resume:** stopped, stale, mismatched-owner, unavailable and incompatible resource/routing evidence prevents resume. Failure/retry is observable and idempotent; only accepted current readiness permits an audited resume.
6. **Preservation and isolation:** Alpha/Beta disposable fixtures demonstrate that suspending one leaves the other unaffected. Existing records/audit, immutable capture, bindings, route ownership, administrator state, pack IDs/versions and grants are preserved except for explicitly audited suspension/session changes.
7. **Entitlement composition:** after resume a disabled pack is still disabled; retained review and ADMIN exclusion follow D03. Resume never recreates records, implicitly enables parking or expands authority.
8. **UI and ingress:** browser cases cover confirmation, conflict, suspended access, stale open-client refresh, failed resume/retry and narrow layouts; actual Caddy tests cover route/context/cookie isolation. Describe screenshots by their actual environment.
9. **Migration/recovery:** populated F08 upgrade/replay and fresh setup both preserve intended state. Recovery uses compatible code and audited transitions, with no permissive F07 fallback or bootstrap/seed replay on retained resources.
10. **Coverage truth:** inventory existing staff/public entry points. Mark absent public/mobile/payment consumers as future coverage obligations; mock/scaffold tests do not prove live consumer behaviour. A later feature must extend the suspension contract/tests before release.
11. **Qualification/publication:** run relevant regressions, lint/format, types/builds, integration, actual Caddy and established browser suites. Record exact source/environment/results and limitations; Codex review findings must be validated/fixed. Verify published SHA, hosted CI, Empirical and draft PR. Owner merge and any later live release remain separate.

## Execution TODOs

- [x] Read merged roadmap F09 goal/dependencies and current F08 handoff; prepare this bounded plan.
- [x] Finish F08 original AWS receipt reconciliation, including successful supplemental source verification; retain the missing-original-local-manifest limitation. PR #22 remains for owner review/merge.
- [ ] Refresh main, applicable instructions, ledger and project-scoped Empirical; inspect actual Git/worktree state and preserve unrelated work.
- [ ] Inspect current status schema, route/context/session guards, worker mutations and affected module READMEs; publish an endpoint/action coverage matrix.
- [ ] Obtain and record concrete F09-P01–P06 decisions as needed, and select disposable fixtures plus the resume readiness contract. No policy approval is inferred from this plan.
- [ ] Create one fresh `codex/civicmaps-f09-<slug>` implementation worktree/branch from current reviewed integration state. If explicitly stacked on unmerged closure documentation, record the dependency and target it correctly.
- [ ] Capture meaningful failing cases for the approved access matrix, sessions, write ordering, stale replay and resume readiness.
- [ ] Implement only the audited suspension lifecycle, server/durable enforcement and UI contract.
- [ ] Verify populated upgrade/replay, fresh setup, preservation, Alpha/Beta isolation and compatible recovery; preserve F07/F08 constraints.
- [ ] Run appropriate integration/browser/ingress/quality checks and record source-pinned evidence in `docs/plans/evidence/F09.md`; keep future consumers and live deployment scope explicit.
- [ ] Review with Codex, validate/fix findings, commit/push, verify remote SHA and CI, open a draft PR and update Empirical with exact state.
- [ ] Owner review/merge; qualify any later live F09 release separately. Do not merge or enable auto-merge.

## Resumption instruction

Continue from the current ledger and F08 closure record. F08 deployment, live acceptance, recovery and supplemental source verification passed and are reconciled with original inspected AWS receipts. Do not repeat those completed prerequisites; retain the disclosed original-local-manifest limitation. F09 remains planning only and blocked by the owner-required [governance gate](governance-and-production-readiness-gate.md). Do not resume dependent implementation until that gate is explicitly released and F09-P01–P06 are reconciled with the approved authority model. Retain existing identity/entitlement boundaries and never present the proposed suspension policy as owner-approved.
