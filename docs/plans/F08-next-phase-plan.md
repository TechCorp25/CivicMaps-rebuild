# Next phase — F07 release acceptance, then F08 entitlements

Prepared 18 October 2026 (Australia/Melbourne), Codex (agent).

## Confirmed starting point

- Owner merged [PR #19](https://github.com/TechCorp25/CivicMaps-rebuild/pull/19) into main at `2b73318a57c97baecb52711beca401ed3a162339`. F07 implementation is complete; do not implement it again or request its merge again.
- Published F07 head `16d543578798c678f2bc24f0ffb9c0f646594de3` passed [PR CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39070082654), [push CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39070079337), and [external Codex review with no findings](https://github.com/TechCorp25/CivicMaps-rebuild/pull/19#issuecomment-6241237807). Evidence covers 69 integration checks, all three disposable browser suites and Caddy isolation.
- [Merged-source CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39070898955) passed for `2b73318`. If a later source is needed, pin and verify that source independently.
- F07 merged source `2b73318` is now deployed and its scoped live gate passed. [Release closure](evidence/F07-release-closure.md) records the exact artifact, preservation, real TLS activation/isolation/revocation and compatible recovery. The [implementation evidence](evidence/F07.md) and older [F06Q release evidence](evidence/F06Q-release-closure.md) retain their original scopes.
- [D02](F07-D02-decisions.md) is approved and implemented. ADMIN keeps own profile/session and explicit context grants only. F08 must not expand those permissions.

This plan now includes an executed F07 release checkpoint. F08 entitlement implementation is underway on `codex/civicmaps-f08-entitlements`, stacked on this planning branch; no new AWS compute, DNS or council resource was created. Existing AWS CLI authorisation, Sydney Region, Medium guidance, resource retention through the 21 October review and the saved US$50/month allocation remain the starting constraints; verify current runtime/spend facts at execution.

## Execution checkpoint — 18 October 2026

F07 is deployed/live accepted on `2b73318`; see [release closure](evidence/F07-release-closure.md). The owner selected existing Alpha/Beta test councils: Alpha's synthetic administrator is retained, Beta's administrator is disabled and its sessions revoked. Preserved-data and compatible F07 recovery checks passed. Earlier [preparation evidence](evidence/F07-release-preparation.md) is historical. The owner has approved [D03](F08-D03-decisions.md); continue the bounded implementation on its fresh feature branch; [implementation evidence](evidence/F08.md). The [shared-map capability baseline](F08-parking-capability-baseline.md) remains pinned to preview `e53ec8c`.

## Owner-confirmed branch sequence and reuse strategy

The owner confirmed **Parking Services Branch** as the first departmental branch feature package. Its source knowledge base is the established `CivicMAPS/CivicMaps-preview` application, not an empty feature brief. The checked-in [feature inventory](../product/civicmapsfeatureinventory.md), [source/sync record](../github.md) and parking/Code21 wireframe annotations provide the starting evidence. Before porting a slice, inspect its actual preview source and pin the relevant revision; distinguish working behaviour, dormant features and documented defects from what has already been verified in this rebuild.

Treat Parking Services Branch as a first-class departmental package within the existing council/context model. The earlier proposal to fold parking into Local Laws is superseded by this owner direction. Exact catalogue ID and migration details remain D03 decisions; the display/package name and parking-first sequence are confirmed.

Parking Services, Local Laws, Animal Management, Waste Management and subsequent branches share the **same operational map interface**. Branch capabilities determine its tools, layers, forms, workflows and field actions, filtered by current entitlements and user/context permissions. A contrasting second branch changes the field feature set within that shared map, while reusing dispatch, management and administration.

Build a capability/reuse matrix from the preview evidence: shared operational map, dispatch, management and administration on one side, parking-specific field operations on the other. Reuse verified contracts and behaviour while retaining current tenant/context isolation and least privilege. This does not import every historical feature into F08 or establish feature parity without acceptance evidence.

The second departmental branch should share **little parking-specific field-operational code**, while reusing substantial dispatch, management and administrative capability. Its identity is not yet selected. Choose it by that criterion after mapping the parking baseline, then give it a separate bounded plan and acceptance cases. Demonstrate reuse of the shared services without copying the parking workflow into a differently named branch; verify branch/council isolation and independent entitlement changes.

## Phase A — completed F07 release procedure (reference only)

1. Refresh main, the [ledger](civicmaps-feature-ledger.json), [activation runbook](../development/first-admin-activation.md) and Empirical `6ad3d4bcbeb1d964705ff9ba`. Use a fresh release-evidence branch from current main, with one implementation feature active at most. Keep historical worktrees at their published heads.
2. Before activation, record the exact existing synthetic municipality, designation, context/binding version, intended recipient and controlled delivery channel. Verify the recipient through the approved D02 operator workflow. Reserve a deliberately approved test designation for the **permanent disable** check; do not consume an intended continuing administrator merely to finish a test. If suitable fixtures or recipient details are missing, complete build/release preparation and obtain those concrete choices before issuing links or changing identity state.
3. Inspect the retained runtime using profile `CivicMAPS` in `ap-southeast-2`: identity, plan/spend status, service health, deployed source, migrations, broker privileges, route ownership, private configuration, capacity and checkpoints. Reuse the existing resources. No reseed, grant authoring, identity reset or replacement environment is part of this release.
4. Build a clean archive of the selected merged source; record commit, archive SHA256 and private object version. Confirm source CI and review. Use the existing release helper only after checking its upgrade/recovery assumptions against migration 012. Verify a private control-data/role checkpoint through an owned disposable restore database, including cleanup on failure.
5. Capture pre-release populated-data, identity/session/grant, route/resource and configuration fingerprints. Apply additive migration 012 and start the pinned application with ingress readiness before routing. Confirm the existing runtime broker has only the intended new function grants, application-role ADMIN denials remain effective, and pending registrations have not been activated implicitly. Do not rerun provisioning/bootstrap as an upgrade shortcut.
6. Exercise real TLS and the selected council route: verified issuance/reissue, old-link rejection, one successful activation with a chosen password, sign-in/reload, explicit-context discovery, own-profile access, and denial of operational/personnel/Platform authority. Check wrong route/council and copied-cookie isolation. Run disable/session revocation only against the reserved approved test designation. Keep tokens/passwords out of logs, screenshots, receipts and Empirical.
7. Recheck existing Platform and council sessions, route freshness/recovery, application health and retained records. Explain every expected data change through attributable activation/audit events. Link disposable evidence for expiry, concurrency and lock-wait cases separately; do not label those cases live-tested unless actually exercised on the deployed source.
8. Rehearse recovery with preserved migration 012, data and audit. Prefer a corrective forward release. After any F07 identity exists, an old-code rollback is **not assumed safe**: first prove compatible ADMIN denial, disable/login behaviour and bootstrap preservation in an isolated populated checkpoint. Otherwise keep affected access closed during repair and recover with compatible F07 code. Never down-migrate or restore over populated live control data as routine rollback.
9. Publish a new F07 release-closure record with exact source/artifact/environment, checks performed, fixture identities without secrets, preservation results, recovery evidence and coverage limits. Update the ledger/handoff and Empirical, push, verify CI, run Codex review, address validated findings and open a draft PR for owner review. Mark the release gate passed only when the required real-runtime checks and recovery have passed; keep gaps explicit.

## Phase B — approved D03 policy (reference)

The owner has confirmed the Parking Services Branch package and first-branch sequence above. The owner has now approved the initial D03 policy and catalogue/migration choices in [F08-D03-decisions.md](F08-D03-decisions.md). The table below retains their planning context; use the approved decision sheet for implementation details, including explicit Alpha/Beta enablement.

| Decision | Proposed initial development policy | Reason / acceptance consequence |
| --- | --- | --- |
| Stable catalogue IDs | Preserve the eight current display labels; introduce immutable IDs `local-laws`, `parks-gardens`, `animal-management`, `cleaning`, `waste`, `safe-city`, `licensing-permits`, `asset-inspections`, with explicit migration from existing labels | Renaming a label must not change access or lose assignments; unknown legacy values must be surfaced for resolution |
| Parking Services Branch | **Owner-confirmed:** first-class first departmental package; do not map parking implicitly into `local-laws`. Stable ID `parking-services` is approved | Preserve existing assignments; explicitly decide migration/default entitlement for parking rather than silently enabling it for every Local Laws assignment |
| Disabled-pack records | Retain records and audit; allow read-only review only to existing operational roles already authorised for those records/context | A disabled pack grants no new review authority; F07 ADMIN remains excluded from operational data |
| In-flight actions | Deny new writes/actions after disable commits; no grandfathered completion exception initially | Writes and disable must have a defined transaction ordering so a stale session/cache cannot authorise a later mutation; actions committed before disable remain valid history |
| Re-enable and recovery | Re-enable via an audited new configuration version, preserving records; configuration rollback also creates a new version | Never reuse a version or bypass checks to recover; previously permitted roles regain only their existing authorised capabilities |

If the owner chooses a completion exception, name each permitted action, actor and state explicitly and add a separate acceptance case before implementation. Do not infer exemptions from an existing open-work counter or a client confirmation dialog.

## Phase C — implement one bounded F08 feature

Parking Services Branch is the first departmental consumer used to ground F08 capabilities. Inventory the established preview baseline before selecting the bounded implemented operations for this feature. The pre-F08 code stores display-label pack assignments in `services/api/platform.mjs` and confirms removal, while CommandMAPS exposes operational APIs independently. F08 makes assignments authoritative for the existing implemented operations; it does not build all eight domain workflows.

1. Inventory implemented routes and map each read/write/action to a stable capability and pack. Include shared endpoints and record-level domain ownership so mixed-pack lists cannot leak disabled or unauthorised records. Document unknown/unmapped behaviour and fail closed for capability access until resolved.
2. Add a lossless catalogue/assignment migration and an authoritative, versioned resolver using effective council/context ownership. Entitlement is an additional check after authentication, role and context authorisation; enabling a pack must not manufacture a role, grant or cross-council access.
3. Enforce the approved policy in server routes and database transitions wherever needed to close races. Resolve current entitlement at the protected operation; a cookie, idempotency receipt, old client cache or stale version must not reopen access. Coordinate pack changes and operational writes under an explicit transaction boundary.
4. Make Platform and CommandMAPS consume the same resolved capabilities/version. Show clear disabled/read-only states and preserve operator confirmation, optimistic version conflicts and attributable history. Keep last-known client state from claiming current access.
5. Verify direct API denial with forged client state, stale sessions/caches, disable versus concurrent writes, idempotent retries, retained-record review, re-enable, version conflicts and Alpha/Beta isolation. Test populated upgrade/replay without loss or implicit enablement. Keep F07 activation, own-profile-only ADMIN and disable/session behaviour intact.
6. Run the relevant focused regressions, then established lint/format, types/builds, integration, Caddy and browser checks. Record source-pinned F08 evidence and limits, push a fresh feature branch, verify hosted CI, update Empirical, run Codex review and address validated findings. Open a draft PR for owner review; no agent merge or auto-merge.

F08 acceptance requires direct server enforcement, no stale-access reopening, approved retained-record/in-flight semantics, and re-enable without recreation. F09 municipality suspension, F11 general operational-data connection, personnel management, public/mobile flows, payments and new infrastructure remain later features. F08's own deployment/live qualification is recorded separately from implementation acceptance.

## Execution ToDos

- [x] Verify PR #19 owner merge and synchronise main to `2b73318`.
- [x] Record current F07 implementation/review evidence and pending live-release boundary.
- [x] Confirm selected merged source CI and build its pinned release artifact; local archive/checks recorded in preparation evidence.
- [x] Owner selected existing Alpha/Beta test councils; exact synthetic designations and outcomes recorded in release closure.
- [x] Inspect AWS runtime/spend; verify private checkpoint, preservation and compatible F07 recovery.
- [x] Deploy F07 and record scoped live acceptance/preservation/recovery in the release-closure evidence published with this update.
- [x] Record owner direction: Parking Services Branch first, then a branch with little shared field code and substantial shared dispatch/management/administration.
- [x] Prepare the source-pinned preview capability/reuse matrix and identify rebuild gaps; [baseline](F08-parking-capability-baseline.md). This inventory does not close later implementation/acceptance gaps.
- [x] Record owner-approved D03 decisions after the F07 release gate; decision receipt in F08-D03-decisions.md.
- [ ] Select the second branch against the confirmed reuse criterion and prepare its separate scope after the parking baseline.
- [x] Implement bounded F08 entitlements; publish [evidence](evidence/F08.md), draft [PR #21](https://github.com/TechCorp25/CivicMaps-rebuild/pull/21) and Empirical checkpoint `6ad42e3dbeb1d96470603a5b`. Require published-head CI and external review completion before owner merge.
- [ ] Owner review/merge of resulting PRs; qualify any later F08 release separately.

## Resumption instruction

Read current main, ledger, this plan and Empirical. PR #19 is merged; do not restart its implementation/review/merge or repeat D02. F07 source `2b73318` is deployed/live accepted with approved Alpha/Beta fixtures; do not repeat activation or permanently disable Alpha. F08 implementation is published in stacked draft PR #21. Use its evidence and published-head checks/review for owner review; do not restart implementation. Keep implementation, deployment, live acceptance and owner merge distinct in every record.
