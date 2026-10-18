# PR17 execution ToDos — 17 October 2026

- [x] Confirm PR15/16 merges, PR17 plan and merged-source CI.
- [x] Refresh Empirical; confirm AWS identity, selected Region, plan, spend, runtime health and retained resources.
- [x] Record owner-approved D02 policy (own session/profile, explicit context grants, controlled verified synthetic delivery, 24-hour expiry, revoke old tokens on reissue and sessions on disable; no personnel management).
- [x] Build/check clean merged source3dfb031 and stage its private archive with checksum/object version.
- [x] Verify checkpoint restore/cleanup, deploy and compare populated data/configuration.
- [x] Exercise TLS/session/context/origin isolation, bounded recovery and rollback/return.
- [x] Publish release evidence/ledger on fresh release branch and draft PR; verify CI and Codex review; update Empirical.
- [x] Implement/test activation, recovery, disable and bootstrap preservation on the existing F07 branch in PR #19.
- [x] Publish F07 evidence/CI/review and update Empirical in PR #19; leave merge to owner.

Release publication completed: [PR #18](https://github.com/TechCorp25/CivicMaps-rebuild/pull/18) publishes the evidence and ledger. Head `b88f01e` passed [PR CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39067631717) and [push CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39067626435); review fixes and verification are recorded in the review conversations and Empirical `6ad2fb1ebeb1d964705ecb18`. The original release-evidence head `22c15fc` also passed CI and re-review. Do not repeat this completed publication workflow.

F07 implementation and publication are complete on [PR #19](https://github.com/TechCorp25/CivicMaps-rebuild/pull/19), branch `codex/civicmaps-f07-admin-activation`, final published head `16d5435`. Its [CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39070082654), feature-branch evidence and Empirical `6ad3d4bcbeb1d964705ff9ba` record the completed work. Application code and [F07 evidence](evidence/F07.md) are now merged into main at `2b73318` through owner-merged PR #19. Do not create a second F07 branch or repeat its publication.

PR #18 was merged into PR #17 at `e34646f`; the owner then merged PR #17 into main at `99b12b9`. Remaining owner/release actions:

- [x] Owner merged PR #17 into main at `99b12b9`.
- [x] Owner merged PR #19 into main at `2b73318`.
- [x] F07 `2b73318` deployed/live accepted; [release closure](evidence/F07-release-closure.md). Continue the [next-phase plan](F08-next-phase-plan.md) with remaining D03 decisions, then F08.
