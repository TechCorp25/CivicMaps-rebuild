# Next phase — merged F06Q release acceptance, then F07 activation

Prepared 17 October 2026 (Australia/Melbourne), Codex (agent).

## Execution update —18October2026

The F06Q release gate is [complete](evidence/F06Q-release-closure.md), [D02 choices](F07-D02-decisions.md) are approved and F07 is [implemented/review-ready](evidence/F07.md) in draftPR19. [Tracked ToDos](PR17-execution-todos.md) record completion and owner handoff. F07 itself is not deployed. The sections below preserve the original plan and starting-point evidence; use the execution records to avoid repeating completed work.

**Existing F07 implementation — 18 October 2026:** [PR #19](https://github.com/TechCorp25/CivicMaps-rebuild/pull/19), branch `codex/civicmaps-f07-admin-activation`, is review-ready at `5098200b3347cd2401645201af93fb2e2445b2c5`. Its [acceptance evidence](https://github.com/TechCorp25/CivicMaps-rebuild/blob/5098200b3347cd2401645201af93fb2e2445b2c5/docs/plans/evidence/F07.md) and [CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39068027959) belong to that feature branch; the F07 application code and local evidence are on this feature branch, not main. Resume review of PR #19, not a new implementation branch. PR #18 was merged into PR #17; the owner has now merged PR #17 into main at `99b12b9`. PR #19 remains for owner review/merge. F07 is not deployed.

## Current release and decision checkpoint — 18 October 2026

The F06Q merged-source release gate is **complete**. Source `3dfb0316fbe7885c55adbb1861ff58d199ca5810` is deployed and live accepted, including both PR #16 review corrections. [Release-closure evidence](evidence/F06Q-release-closure.md) records the artifact/checkpoint, data/session/configuration preservation, live recovery and rollback/return checks. `8e91622` is the prior release, not the current deployed source.

The owner approved [F07 D02 choices](F07-D02-decisions.md). Use the [ledger](civicmaps-feature-ledger.json) and [F07 handoff](F07-handoff.md) for the current implementation/publication state. Do not repeat the completed F06Q deployment or re-request approved D02 choices. A future F07 deployment and its live acceptance remain separate. The release procedure below is an execution record/reference, not the next action to run.

## Verified source and review history

- Assessment PR #15 is merged at `3ebee8e726ddd92f6ef4f40886339042be8c8242`.
- F06Q PR #16 is merged at `3dfb0316fbe7885c55adbb1861ff58d199ca5810`; its published head is `b279d4f1a2e6905ce799d953c34fae7b6d0ebe2a`.
- That head passed 67 integration tests, lint/format, both builds/typechecks, Caddy ingress and both browser suites. Its final Codex audit reported no additional findings; both validated review conversations have written responses and are resolved.
- Current accepted deployed source is `3dfb0316fbe7885c55adbb1861ff58d199ca5810`. The previous `8e916226571fb72f8ed15c2932b86be0a859f284` release was retained and exercised during rollback/return; both merged review corrections are now covered by current-source live acceptance.

F06Q release closure and the F07 D02 prerequisite are satisfied. Keep one implementation feature active and follow its current ledger state. F07 implementation already exists in PR #19; continue its review rather than creating another branch. The application code is on this feature branch; its deployment remains separate.

## 1. Completed F06Q release procedure — reference only

1. Refresh main, the ledger and Empirical. Select the exact merged source containing both review corrections, starting from `3dfb031`; confirm its CI and build the release from a clean checkout. Record source SHA, archive SHA256 and private object version. Do not label a newer source verified using the old release's evidence.
2. Inspect the existing Sydney runtime through the configured CivicMAPS AWS profile. Confirm selected Region, project, plan/spend status, current source, migrations, service health, free disk, route ownership and retained resources. Reuse the existing runtime and private bucket within the saved allocation.
3. Stage and verify the artifact before maintenance. Use `infrastructure/f06/release-runtime.sh` with its new `verify-backup.sh` helper. Preserve private configuration and populated databases; create and verify the private checkpoint. Confirm the disposable restore database is removed and that verification failure restores prior services. No reseeding or bootstrap reset is part of release alignment.
4. Deploy the pinned source and record source fingerprints, service state and migrations. Exercise Alpha/Beta/Platform TLS, readiness, authenticated sessions, route/context/origin isolation and bounded routing recovery. Preserve withdrawal and lease/version fencing. Existing local regressions prove legacy counters and backup-helper failure paths; live results must describe what was actually exercised.
5. Verify the documented rollback/return path to the prior recorded release with data, sessions, ownership and audit history preserved. Keep the prior archive and checkpoint until the agreed retention review. Do not restore a backup over populated control data as a routine code rollback.
6. Record commands/results, artifact identities, data-preservation comparisons and remaining limits in F06Q evidence and Empirical. Update deployed-source and acceptance fields only after current-source live checks pass. Publish documentation through a fresh branch/PR; owner merge remains separate.

Completion gate **passed**: both review corrections are present on the runtime, current-source live acceptance and recovery checks passed, and preservation checks found no unexplained owned-data/configuration changes. These steps describe the executed release; a future release needs its own pinned source and acceptance record.

Use the [release/recovery runbook](../development/service-routing.md#f06q-reliability-update) and [historical F06Q evidence](evidence/F06Q.md). Retain the existing development resources and private checkpoints for the 21 October review under the saved US$50/month allocation; confirm actual spend before executing. Planning does not authorise an expanded resource footprint.

## 2. Approved F07 D02 policy

Owner approval is recorded in [F07-D02-decisions.md](F07-D02-decisions.md), Empirical `6ad3601cbeb1d964705f3bc6`.

| Decision | Approved initial development scope | Boundary |
| --- | --- | --- |
| Council ADMIN authority | Own authenticated session/profile and explicitly granted council context | No operational requests, personnel directory, dispatch/officer management or Platform rights |
| Activation delivery | Authenticated Platform operator verifies the designated recipient and manually delivers a synthetic activation link | No email provider or production identity-proof procedure selected |
| Token expiry | 24-hour, hashed, single-use token bound to designated administrator, municipality and exact context version | Expired/used/revoked links cannot activate |
| Reissue and recovery | Repeat recipient verification, revoke prior tokens on reissue; lost redemption response recovers through sign-in with the chosen password | Disable revokes sessions/outstanding tokens; reactivation and general user management remain outside this slice |

Retain Platform/council identity separation. Do not infer operational privileges from an ADMIN label, broaden identity database permissions or select a production identity/email provider implicitly. These approved F07 choices do not decide later organisation/team administration.

## 3. F07 implementation criteria — completed on PR #19

The criteria below describe the existing implementation on `codex/civicmaps-f07-admin-activation`, not work to restart. Read the [F07 handoff](F07-handoff.md), PR #19 evidence and review conversations; assess any new findings on that branch. Use the local F07 evidence for this feature branch; deployment/live acceptance remain separate.

1. Add durable activation state with hashed, expiring, single-use tokens scoped to the designated administrator, municipality and operating context. Define explicit grants from D02. Preserve pending registry data and audit history during migration/replay.
2. Implement authorised issue/reissue, atomic redemption and credential setup. Concurrent redemption must allow one success; failed or lost responses must have safe recovery without replaying plaintext credentials or tokens from idempotency receipts.
3. Connect the activation and recovery UI to the API with clear pending/expired/used states. Show the authorised council context after activation. Keep Platform operator capabilities outside council sessions.
4. Implement disable/revocation and audit issue, redemption, expiry, reissue and failure without secret payloads. Reconcile the fixture/bootstrap path so repeat setup cannot demote an activated municipality or replace existing identities, grants, routes or resources.
5. Prove single-use/concurrent redemption, expiry/replay rejection, wrong council/context, copied cookies/tokens, least privilege, operator-versus-council isolation, disabled-session rejection and repeated bootstrap preservation. Cover the complete browser flow and migration/replay on disposable data.
6. Run required application and browser checks, verify CI for the published commit, record scoped live acceptance where applicable, update the ledger/evidence/Empirical, and open a draft PR for owner review. No merge or auto-merge by the agent.

F07 is complete when the first administrator can activate, sign in and perform only the agreed D02 operations, with audited recovery and revocation and all isolation/upgrade checks passing. F08 entitlements, F09 suspension, F11 general operational-data connection, new-council infrastructure, public/mobile portals and payments remain separate features.

## Resumption instruction

> Read current main, the ledger, F07 handoff and Empirical. The F06Q merged-source release gate is complete for deployed source3dfb031 and F07 D02 is approved; do not repeat that deployment or those decisions. Resume review of existing PR #19 on codex/civicmaps-f07-admin-activation; do not create a second F07 implementation. Use its feature-branch evidence, keeping publication, deployment, live acceptance and owner merge separate. Qualify any future F07 release against its own source before F08/D03 kickoff; do not infer F07 live acceptance from F06Q evidence.
