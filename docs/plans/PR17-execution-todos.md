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

F07 implementation and publication are complete on [PR #19](https://github.com/TechCorp25/CivicMaps-rebuild/pull/19), branch `codex/civicmaps-f07-admin-activation`, accepted feature-branch head `5098200`. Its [CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39068027959), feature-branch evidence and Empirical `6ad3d4bcbeb1d964705ff9ba` record the completed work. Application code is not in this planning snapshot. Do not create a second F07 branch or repeat its publication.

PR #18 is now merged into PR #17 at `e34646f`. Remaining owner/release actions:

- [ ] Owner merge PR #17 into main, then review/merge the existing PR #19 implementation.
- [ ] Qualify a controlled F07 deployment and current-source live acceptance before F08/D03 kickoff. AWS remains accepted F06Q source3dfb031.
