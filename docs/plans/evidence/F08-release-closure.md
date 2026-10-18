# F08 release closure — deployed, live accepted and final source verified

Prepared 18 October 2026 (Australia/Melbourne) by Codex (agent).

F08 source `b21e764ad1151aa3e4dce6f91f29f24f69b31916` is deployed. HTTPS API acceptance, real concurrency checks, compatible F08 recovery and the supplemental 83-file source check passed. The original deployment, live acceptance/recovery and final source-check SSM receipts were retrieved through the normal approved AWS path and inspected on 18 October 2026 (Australia/Melbourne). No deployment, migration or live test was repeated to obtain them.

## Evidence provenance and current publication boundary

This document reconciles the release handoff with inspected original AWS receipts, GitHub and Empirical. GitHub confirms owner merge of PRs #20/#21 and successful merged-source CI. The previous local release worktree/scratch were absent from the resumed workspace; a clean documentation worktree was recreated without resetting the main workspace. Standard AWS reauthentication subsequently succeeded. Read-only SSM metadata identified the existing final command, and its invocation receipt plus the deployment/live receipts and original final-check parameters were retrieved. The successful outcomes below are now supported by those inspected receipts.

The original local `artifact.json` is still unavailable, so its reconstruction remains explicitly labelled; unknown original fields are not claimed preserved. Original SSM receipts and final-check script parameters are recovered privately under `/workspace/work/f08-release/`. This is a local-artifact provenance limitation, not a pending live-release gate.

Remote main is `c011cc7c0fa12902e5d8626f6365af4d829dc36f`, one commit after the deployed merge source; its only change removes `apps/civicmaps-platform/stc/.gitkeep`. This documentation branch is based on that current main. It does not change the deployed source pin. The recreated local release worktree starts at that verified main on `codex/civicmaps-f08-release-acceptance`. The main workspace remains on its original `work` branch; no unrelated files were changed.

The scoped live-release gate is complete. PR #22 remains a draft for owner review/merge; documentation review/publication/CI are recorded separately from the already completed deployment and live acceptance. No deployment or migration is required to publish these documents.

## Source, artifact and environment pins

| Item | Identity |
| --- | --- |
| Repository | `TechCorp25/CivicMaps-rebuild` |
| Owner-merged planning PR | [#20](https://github.com/TechCorp25/CivicMaps-rebuild/pull/20), merge `26a49e03e08d0ce61767c4b2cc8b7c8e1741320a` |
| Owner-merged implementation PR | [#21](https://github.com/TechCorp25/CivicMaps-rebuild/pull/21) |
| Final feature head | `a21ef7c6ec2f2f139a328b1a9c7726a10c0eebbc` |
| Deployed merged source | `b21e764ad1151aa3e4dce6f91f29f24f69b31916` |
| Archive SHA256 | `2ed52d3465b6c13434c6ebc19eb260bb6a2fb99314fc47767fd2d548258c9b1e` |
| Existing S3 bucket | `civicmaps-f05-development-storage-iq7jtwcoip2y` |
| Object key | `f06/releases/b21e764ad1151aa3e4dce6f91f29f24f69b31916.tar.gz` |
| Object version | `f_SLd8uMM2KHwbIrwviTLXizSzuMrz6i` |
| AWS identity / region | `597663815195` / `ap-southeast-2`, profile `CivicMAPS` |
| Retained instance | `i-0bbfbcd2d870cce97` |
| Deployment SSM command | `93676347-f3fa-4a45-8a81-7ea6df3f69b7` — SUCCESS, response code 0, original receipt inspected |
| Live acceptance SSM command | `7217311c-a814-47ce-8ffc-98486f7b50d0` — SUCCESS, response code 0, original receipt inspected |
| Supplemental final source-check SSM command | `321b8ad1-bab7-468e-9c4d-08652c0207ed` — SUCCESS, response code 0, no stderr, original receipt inspected |
| Private backup checkpoint | `/var/lib/pgsql/f06q-backups/20261018T025238Z-b21e764ad115` |
| Previous source directory | `/opt/civicmaps-releases/previous-20261018T025238Z-b21e764ad115` |
| Compatible recovery baseline | `/var/lib/pgsql/f08-compatible-recovery-1792292159439.json` |
| Release worktree / branch | `/workspace/civicmaps-f08-release` / `codex/civicmaps-f08-release-acceptance` |
| Private scratch evidence | `/workspace/work/f08-release/` |

These are artifact/checkpoint identifiers, not instructions to restore or replay the release. Credentials, cookies, activation tokens, database dumps and configuration contents must remain private.

## Deployment and preservation

Migration 013 was applied once, without replaying seed, bootstrap or provisioning. Twenty original table projections, routing ownership and private configuration hashes were preserved, allowing only the documented stable-pack/workload transformations. The private backup/restore checkpoint is retained. The supplemental receipt confirms the installed-file match and reports zero temporary `f06q_restore_%` databases.

The nine stable IDs include first-class `parking-services`. Existing immutable `parking` contexts resolve to that ID without rewriting captured history or grants. Parking was enabled only for the approved Alpha/Beta synthetic fixtures; Local Laws assignments were preserved.

No new infrastructure, DNS, TLS, council or administrator resources were created during the release. Retain existing resources and private checkpoints through **21 October 2026 (Australia/Melbourne)** under the saved **US$50/month allocation**. After standard sign-in, STS verified project `597663815195`; the current project plan is **FREE / ACTIVE**. The retained instance is **running**, with both EC2 instance/system status checks **OK**. These are current read-only observations, distinct from the original service/TLS checks below. Current charges and remaining credits were not recalculated; the saved allocation/retention decision is unchanged.

## Successful live HTTPS acceptance

The original live acceptance/recovery receipt and handoff record the following outcomes for the command above:

- Nine stable pack IDs and the parking-to-parking-services mapping were verified, together with enabled operational access.
- Real concurrent write/disable ordering passed in both directions: an authorised earlier write completes before disable, or a write observes the committed disable and is denied.
- Disabled writes, stale/replayed writes, directory access and resource access were denied. Retained request/audit review continued only for already-authorised roles with council/record isolation; ADMIN remained excluded.
- Re-enable restored previously authorised access through audited new configuration versions, without recreating records or expanding grants.
- Two synthetic requests were retained and closed through normal APIs. Four audited pack-version advances were recorded and the original pack configuration restored.
- Alpha's administrator remained usable. Beta's administrator remained disabled, inactive and had zero sessions.

The [approved D03 policy](../F08-D03-decisions.md) remains authoritative. These checks do not approve municipality-wide suspension behaviour for F09.

## Compatible F08 recovery

Compatible F08 restart/recovery passed with existing sessions. Twenty-five table projections, routing ownership and private configuration hashes were preserved against the private recovery baseline above.

**Do not roll back to F07 application code after migration 013.** It bypasses F08 entitlement enforcement. Preserve schema, records, audit and grants; recover with compatible F08 code or a reviewed forward fix. Configuration recovery/re-enable must append an audited new version. Never down-migrate, recreate identities or resurrect revoked grants as a recovery shortcut.

Preserve the usable Alpha administrator and disabled/inactive/zero-session Beta administrator. The previous-source directory and private checkpoints are retained evidence, not permission to execute an incompatible rollback.

## Supplemental final source check — passed and inspected

The existing command `321b8ad1-bab7-468e-9c4d-08652c0207ed` was identified by its SSM comment, **F08 final source identity and live release state verification**, and original submitted parameters. It executed on **18 October 2026 at 13:56:49 AEDT (02:56:49 UTC)**. Its inspected invocation status is **Success**, response code **0**, with no stderr. Retrieval after standard reauthentication did not submit another SSM command.

| Inspected result | Observed value |
| --- | --- |
| Installed source | `PASS 83 installed runtime/test/maintenance/build files match pinned F08 source archive` |
| Services | PostgreSQL, API, ingress and routing all `active` |
| Migration | `013-pack-entitlements` present |
| Alpha administrator | Activated, active, three existing sessions; preserved usable |
| Beta administrator | Disabled, inactive, zero sessions |
| Routes | Alpha CommandMAPS, Beta CommandMAPS and Platform all `ready`; receipt versions 14, 2 and 5 respectively |
| Temporary restore database cleanup | Count of `f06q_restore_%` databases is 0 |
| Packs | Original council assignments retained; only approved Alpha/Beta fixtures have `parking-services` alongside Local Laws; Alpha pack version 5, Beta version 1 |
| Function permissions | Runtime may execute `civicmaps_entitlement_state()`; application role may execute `civicmaps_pack_access(boolean)`; application role cannot execute privileged `civicmaps_redeem_admin(uuid,uuid,text,text,uuid)` |
| Public TLS health | All three HTTPS health routes returned `ready`, ingress mode, synthetic data |

The original deployment receipt independently pins revision `b21e764ad1151aa3e4dce6f91f29f24f69b31916`, archive SHA256 and private checkpoint paths. The original live receipt pins the same revision and records both lock-wait orderings, retained requests, restored configuration, audited advances and compatible recovery.

The saved command-ID file has been restored from verified AWS metadata. Original invocation JSON and recovered submitted final-check parameters/script are held privately in the scratch directory. The reconstructed `artifact.json` now records all three successful inspected receipts and retains its missing-original-manifest provenance.

The earlier retrieval interruption was an automatic-approval-review platform usage limit, not an unsafe-action rejection or an AWS spend-limit failure. A later resumed session had expired and required standard AWS sign-in. Both access blockers are now resolved; no approval mechanism was bypassed.

## Qualification and publication

[Implementation evidence](F08.md) retains the original disposable/local and hosted scope, including 75 integration tests, lint/format, both typechecks/builds, actual Caddy and three Chromium suites. [Merged-source CI 39091194915](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39091194915) passed for `b21e764`; final feature [PR CI 39090955491](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39090955491) and [push CI 39090951795](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39090951795) passed for `a21ef7c`.

Live evidence is HTTPS API, concurrency and compatible recovery testing. **No new live-browser screenshots are claimed.** The screenshot in F08 implementation evidence belongs to its prior qualified browser suite.

Codex documentation review identified stale root ledger pointers still naming F07/current and a future F08 deployment. The finding was validated and corrected: both root and F08 entry now pin deployed source `b21e764` and the F08 closure, with the successful supplemental receipt now reconciled. Focused re-review found no remaining findings. The subsequent receipt reconciliation was reviewed against all three original SSM invocations, with no findings. Commit/remote SHA, draft PR and CI outcomes must be checked on the published closure branch; historical implementation CI does not establish new closure-head CI. The [ledger](../civicmaps-feature-ledger.json) and Empirical `6ad42e3dbeb1d96470603a5b` track implementation and closure separately. Owner merge remains outstanding for this closure update; no agent merge or auto-merge is authorised.

Local documentation checks passed for seven changed documents, 85 relative links/anchors, all 30 ledger cards/statuses/evidence paths, deployed-source/manifest consistency and Git whitespace. Node/npm match the repository pins (24.19.0/11.9.0). The installed snapshot lacks the Prettier executable, so an attempted direct formatter invocation could not run; no formatter pass is claimed. Application code is unchanged. Hosted CI on publication head `de0c3ef05f66617b3108b6e2bfdb51316e90441d` passed both [PR run 39109919024](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39109919024) and [push run 39109916184](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39109916184), including application/quality, actual Caddy and all three browser suites. Current-head CI after this receipt-only update is recorded in PR #22 and Empirical; the historical source pins above remain unchanged.

## Publication receipt

Draft [PR #22](https://github.com/TechCorp25/CivicMaps-rebuild/pull/22) targets current main. Content commit `2121b3372d4863addc1f0ec9b444bbb5e95bfa3c` was pushed and its remote SHA explicitly verified. A follow-up documentation commit records this publication receipt; inspect the PR current head and its CI rather than treating the content-commit pin as an unchanging branch head. Empirical `6ad42e3dbeb1d96470603a5b` records successful deployment/live acceptance/recovery and inspected supplemental verification; publication-head CI has passed, and current-head SHA/CI state is maintained there and in the PR after inspection.

## Remaining TODOs

- [x] Inspect current main/Git state and recreate the absent release worktree without unrelated changes.
- [x] Recover and inspect original AWS receipts/parameters; preserve the explicit missing-original-local-manifest limitation.
- [x] Retrieve and inspect the existing supplemental final-source-check receipt through normal approval; status Success, response code 0.
- [x] Reconcile reconstructed scratch `artifact.json` with original inspected AWS receipts, successful supplemental state and explicit missing-original-local-manifest provenance.
- [x] Record Codex documentation review, correct the validated stale root-ledger pointer finding and complete focused re-review with no remaining findings.
- [x] Publish/verify the closure content commit and open draft PR #22.
- [x] Inspect publication-head PR/push CI; record current-head SHA/CI and final publication state in PR #22 and Empirical after the receipt-only update.
- [ ] Owner review/merge of the closure PR.
- [x] Prepare [F09 scope, dependencies, acceptance criteria and TODOs](../F09-next-phase-plan.md); implementation and new policy approval remain separate.
