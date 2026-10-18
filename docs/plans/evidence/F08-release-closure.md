# F08 release closure — deployed and live accepted; supplemental receipt pending

Prepared 18 October 2026 (Australia/Melbourne) by Codex (agent).

F08 source `b21e764ad1151aa3e4dce6f91f29f24f69b31916` is deployed. HTTPS API acceptance, real concurrency checks and compatible F08 recovery passed according to the release handoff supplied by the owner. The additional final source-check receipt has **not been inspected**. It does not invalidate the independently successful deployment/live acceptance, and it must not be described as passed.

## Evidence provenance and current publication boundary

This document reconciles the owner's release handoff with connected GitHub and Empirical reads. GitHub confirms owner merge of PRs #20/#21 and successful merged-source CI. Empirical already recorded deployment success, but its live-acceptance field was stale at resumption. The resumed workspace contains a clean repository at current main, but the previous release worktree and `/workspace/work/f08-release/` scratch evidence were absent. A new release documentation worktree was created without resetting the main workspace. Git fetch through the normal approved network path confirms current main. The original scratch receipts/manifest are unavailable here. The normal approved AWS identity check now reports an expired session; standard remote login is pending. The live outcomes below are preserved from the explicit handoff, rather than presented as newly executed checks.

Remote main is `c011cc7c0fa12902e5d8626f6365af4d829dc36f`, one commit after the deployed merge source; its only change removes `apps/civicmaps-platform/stc/.gitkeep`. This documentation branch is based on that current main. It does not change the deployed source pin. The recreated local release worktree starts at that verified main on `codex/civicmaps-f08-release-acceptance`. The main workspace remains on its original `work` branch; no unrelated files were changed.

Release closure remains a draft while original receipt reconciliation and supplemental receipt inspection are outstanding. Review and publication outcomes must be recorded separately. No deployment or migration is required to publish these documents.

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
| Deployment SSM command | `93676347-f3fa-4a45-8a81-7ea6df3f69b7` — SUCCESS in handoff and deployment memory |
| Live acceptance SSM command | `7217311c-a814-47ce-8ffc-98486f7b50d0` — SUCCESS in handoff |
| Private backup checkpoint | `/var/lib/pgsql/f06q-backups/20261018T025238Z-b21e764ad115` |
| Previous source directory | `/opt/civicmaps-releases/previous-20261018T025238Z-b21e764ad115` |
| Compatible recovery baseline | `/var/lib/pgsql/f08-compatible-recovery-1792292159439.json` |
| Release worktree / branch | `/workspace/civicmaps-f08-release` / `codex/civicmaps-f08-release-acceptance` |
| Private scratch evidence | `/workspace/work/f08-release/` |

These are artifact/checkpoint identifiers, not instructions to restore or replay the release. Credentials, cookies, activation tokens, database dumps and configuration contents must remain private.

## Deployment and preservation

Migration 013 was applied once, without replaying seed, bootstrap or provisioning. Twenty original table projections, routing ownership and private configuration hashes were preserved, allowing only the documented stable-pack/workload transformations. The private backup/restore checkpoint is retained. Do not infer additional successful cleanup/source assertions from the uninspected supplemental check.

The nine stable IDs include first-class `parking-services`. Existing immutable `parking` contexts resolve to that ID without rewriting captured history or grants. Parking was enabled only for the approved Alpha/Beta synthetic fixtures; Local Laws assignments were preserved.

No new infrastructure, DNS, TLS, council or administrator resources were created during the release. Retain existing resources and private checkpoints through **21 October 2026 (Australia/Melbourne)** under the saved **US$50/month allocation**. A new normal approved identity read reports expired AWS authentication; remote login was started. Resource health, plan state and spend could not be rechecked while authentication is pending. This is a current observation, distinct from the valid authentication at the successful release. It is not evidence of a spend-limit failure.

## Successful live HTTPS acceptance

The handoff records the following outcomes for the live acceptance command above:

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

## Supplemental final source check — result pending

An additional SSM command was submitted successfully before the interruption. The handoff says its command ID was stored privately in:

`/workspace/work/f08-release/final-source-check-command-id`

The associated files are `final-source-check.sh` and `final-source-check-params.json` in the original scratch directory; those original files are absent from this resumed workspace. It checks **83 installed file hashes**, revision, services, migration 013, administrator states, routes, packs, permissions, restore-database cleanup and public TLS health.

The previous get-command-invocation attempt was not executed because automatic approval review could not run due to a platform usage limit. That was a quota failure, not an unsafe-action rejection, AWS login expiry or AWS spend-limit result. This resumption reached the normal approved AWS path and found an expired session; remote login is pending. No approval mechanism has been bypassed.

To finish receipt reconciliation:

1. Local instructions and Git/worktree state have been inspected, main fetched and a clean release worktree recreated. Recover original scratch receipts/manifest when available, without resetting either worktree or discarding unrelated work.
2. Finish standard AWS login, recover the saved command ID and retrieve that existing command through the normal approved AWS CLI path. If the original local ID remains unavailable, use read-only SSM command metadata for the retained instance to identify the existing final-source-check command before retrieving its receipt; do not print command parameters that could contain private contents. Use `/workspace/aws-toolkit/bin/aws`, profile `CivicMAPS`, region `ap-southeast-2`, `AWS_CONFIG_FILE=/workspace/aws-toolkit/config/aws-config` and `AWS_LOGIN_CACHE_DIRECTORY=/workspace/aws-toolkit/config/login-cache`. Do not resubmit a deployment, migration or supplemental check merely to obtain a receipt.
3. Inspect status, response code and sanitised output. Record success, failure or continued unavailability accurately; a submitted ID alone proves no check passed. Investigate a failed assertion before closing its item.
4. A reconstructed scratch `artifact.json` records the known source/artifact/deployment/live acceptance/recovery facts and explicitly marks its original manifest/receipts unavailable and supplemental verification pending. Reconcile it with the original manifest if recovered, preserving original fields rather than silently replacing unknown content. Keep secrets out of any published receipt.
5. Amend this record and the ledger with inspected receipt provenance and remaining publication/review outcomes. Publish a follow-up documentation commit; do not alter the deployed source pin.

## Qualification and publication

[Implementation evidence](F08.md) retains the original disposable/local and hosted scope, including 75 integration tests, lint/format, both typechecks/builds, actual Caddy and three Chromium suites. [Merged-source CI 39091194915](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39091194915) passed for `b21e764`; final feature [PR CI 39090955491](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39090955491) and [push CI 39090951795](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39090951795) passed for `a21ef7c`.

Live evidence is HTTPS API, concurrency and compatible recovery testing. **No new live-browser screenshots are claimed.** The screenshot in F08 implementation evidence belongs to its prior qualified browser suite.

Codex documentation review identified stale root ledger pointers still naming F07/current and a future F08 deployment. The finding was validated and corrected: both root and F08 entry now pin deployed source `b21e764` and the F08 closure, with only receipt/publication follow-ups pending. Focused re-review found no remaining findings. Commit/remote SHA, draft PR and CI outcomes must be checked on the published closure branch; historical implementation CI does not establish new closure-head CI. The [ledger](../civicmaps-feature-ledger.json) and Empirical `6ad42e3dbeb1d96470603a5b` track implementation and closure separately. Owner merge remains outstanding for this closure update; no agent merge or auto-merge is authorised.

Local documentation checks passed for seven changed documents, 86 relative links/anchors, all 30 ledger cards/statuses/evidence paths, deployed-source/manifest consistency and Git whitespace. Node/npm match the repository pins (24.19.0/11.9.0). The installed snapshot lacks the Prettier executable, so an attempted direct formatter invocation could not run; no formatter pass is claimed. Application code is unchanged; full hosted CI will be checked on the closure branch.

## Remaining TODOs

- [x] Inspect current main/Git state and recreate the absent release worktree without unrelated changes.
- [ ] Recover/reconcile original scratch receipts and manifest; record their availability accurately.
- [ ] Retrieve and inspect the existing supplemental final-source-check receipt through normal approval.
- [x] Reconstruct scratch `artifact.json` with successful acceptance/recovery from the handoff, accurate supplemental pending state and explicit missing-original provenance.
- [x] Record Codex documentation review, correct the validated stale root-ledger pointer finding and complete focused re-review with no remaining findings.
- [ ] Publish/verify the closure branch SHA and draft PR; inspect its CI and update Empirical with exact publication state.
- [ ] Owner review/merge of the closure PR.
- [x] Prepare [F09 scope, dependencies, acceptance criteria and TODOs](../F09-next-phase-plan.md); implementation and new policy approval remain separate.
