# Next phase — merged F06Q release acceptance, then F07 activation

Prepared 17 October 2026 (Australia/Melbourne), Codex (agent).

## Verified starting point

- Assessment PR #15 is merged at `3ebee8e726ddd92f6ef4f40886339042be8c8242`.
- F06Q PR #16 is merged at `3dfb0316fbe7885c55adbb1861ff58d199ca5810`; its published head is `b279d4f1a2e6905ce799d953c34fae7b6d0ebe2a`.
- That head passed 67 integration tests, lint/format, both builds/typechecks, Caddy ingress and both browser suites. Its final Codex audit reported no additional findings; both validated review conversations have written responses and are resolved.
- Last recorded deployed source is `8e916226571fb72f8ed15c2932b86be0a859f284`. The later legacy retry-budget and disposable restore-cleanup corrections are merged but have no recorded deployment or live acceptance. Recheck the actual runtime before execution.

The next operational task is F06Q release closure. The next product feature is F07. Keep one implementation feature active; F07 remains planned until the release gate and D02 decisions below are satisfied. This document plans the work; it does not execute a deployment or activation.

## 1. Close F06Q release alignment

1. Refresh main, the ledger and Empirical. Select the exact merged source containing both review corrections, starting from `3dfb031`; confirm its CI and build the release from a clean checkout. Record source SHA, archive SHA256 and private object version. Do not label a newer source verified using the old release's evidence.
2. Inspect the existing Sydney runtime through the configured CivicMAPS AWS profile. Confirm selected Region, project, plan/spend status, current source, migrations, service health, free disk, route ownership and retained resources. Reuse the existing runtime and private bucket within the saved allocation.
3. Stage and verify the artifact before maintenance. Use `infrastructure/f06/release-runtime.sh` with its new `verify-backup.sh` helper. Preserve private configuration and populated databases; create and verify the private checkpoint. Confirm the disposable restore database is removed and that verification failure restores prior services. No reseeding or bootstrap reset is part of release alignment.
4. Deploy the pinned source and record source fingerprints, service state and migrations. Exercise Alpha/Beta/Platform TLS, readiness, authenticated sessions, route/context/origin isolation and bounded routing recovery. Preserve withdrawal and lease/version fencing. Existing local regressions prove legacy counters and backup-helper failure paths; live results must describe what was actually exercised.
5. Verify the documented rollback/return path to the prior recorded release with data, sessions, ownership and audit history preserved. Keep the prior archive and checkpoint until the agreed retention review. Do not restore a backup over populated control data as a routine code rollback.
6. Record commands/results, artifact identities, data-preservation comparisons and remaining limits in F06Q evidence and Empirical. Update deployed-source and acceptance fields only after current-source live checks pass. Publish documentation through a fresh branch/PR; owner merge remains separate.

Completion gate: both review corrections are present on the runtime, current-source live acceptance passes, recovery evidence is recorded, and no unexplained changes to owned data or configuration remain. If release verification fails, recover the existing service, record the blocker and keep F07 gated.

Use the [release/recovery runbook](../development/service-routing.md#f06q-reliability-update) and [historical F06Q evidence](evidence/F06Q.md). Retain the existing development resources and private checkpoints for the 21 October review under the saved US$50/month allocation; confirm actual spend before executing. Planning does not authorise an expanded resource footprint.

## 2. Settle D02 at F07 kickoff

These are proposed starting choices for owner decision, not established product policy:

| Decision | Proposed initial development scope | Must be explicit before implementation |
| --- | --- | --- |
| Council ADMIN authority | Activate the designated first administrator, allow its own authenticated session/profile access, and require explicit context grants | The exact permitted council operations; whether management of dispatch/officer users belongs in this slice |
| Activation delivery | Controlled synthetic delivery through an authenticated Platform operator for the existing development councils | Approved delivery procedure and recipient verification; any email provider requires a separate concrete choice |
| Token expiry | A 24-hour activation window | Final lifetime and how expiration is communicated |
| Reissue and recovery | Authenticated Platform operator reissues after verifying the intended administrator; prior tokens are revoked | Who may reissue, lost-response handling, verification procedure and account-disable/session-revocation rules |

Retain Platform/council identity separation. Do not infer operational privileges from an ADMIN label, broaden identity database permissions or select a production identity/email provider implicitly.

## 3. Implement one F07 feature

Start a fresh feature branch from current main after the release gate. Read the [F07 handoff](F07-handoff.md), identity/context contracts and current registration/bootstrap code before designing migrations.

1. Add durable activation state with hashed, expiring, single-use tokens scoped to the designated administrator, municipality and operating context. Define explicit grants from D02. Preserve pending registry data and audit history during migration/replay.
2. Implement authorised issue/reissue, atomic redemption and credential setup. Concurrent redemption must allow one success; failed or lost responses must have safe recovery without replaying plaintext credentials or tokens from idempotency receipts.
3. Connect the activation and recovery UI to the API with clear pending/expired/used states. Show the authorised council context after activation. Keep Platform operator capabilities outside council sessions.
4. Implement disable/revocation and audit issue, redemption, expiry, reissue and failure without secret payloads. Reconcile the fixture/bootstrap path so repeat setup cannot demote an activated municipality or replace existing identities, grants, routes or resources.
5. Prove single-use/concurrent redemption, expiry/replay rejection, wrong council/context, copied cookies/tokens, least privilege, operator-versus-council isolation, disabled-session rejection and repeated bootstrap preservation. Cover the complete browser flow and migration/replay on disposable data.
6. Run required application and browser checks, verify CI for the published commit, record scoped live acceptance where applicable, update the ledger/evidence/Empirical, and open a draft PR for owner review. No merge or auto-merge by the agent.

F07 is complete when the first administrator can activate, sign in and perform only the agreed D02 operations, with audited recovery and revocation and all isolation/upgrade checks passing. F08 entitlements, F09 suspension, F11 general operational-data connection, new-council infrastructure, public/mobile portals and payments remain separate features.

## Resumption instruction

> Confirm PRs #15/#16 and current main, then complete the F06Q merged-source release gate using the retained development runtime and recorded recovery path. Preserve populated data and record exact source/artifact/live evidence. Once that gate passes, settle only D02 permissions/delivery/expiry/recovery and implement F07 on a fresh branch. Keep publication, deployment, acceptance and owner merge as separate states. Do not start F08 or mark F07 ready while its release or D02 prerequisites remain open.
