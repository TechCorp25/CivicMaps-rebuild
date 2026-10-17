# PR17 execution ToDos — 17 October 2026

- [x] Confirm PR15/16 merges, PR17 plan and merged-source CI.
- [x] Refresh Empirical; confirm AWS identity, selected Region, plan, spend, runtime health and retained resources.
- [x] Record owner-approved D02 policy (own session/profile, explicit context grants, controlled verified synthetic delivery, 24-hour expiry, revoke old tokens on reissue and sessions on disable; no personnel management).
- [x] Build/check clean merged source3dfb031 and stage its private archive with checksum/object version.
- [x] Verify checkpoint restore/cleanup, deploy and compare populated data/configuration.
- [x] Exercise TLS/session/context/origin isolation, bounded recovery and rollback/return.
- [x] Publish release evidence/ledger on fresh release branch and draft PR; verify CI and Codex review; update Empirical.
- [x] Start fresh F07 branch only after release acceptance; implement/test activation, recovery, disable and bootstrap preservation.
- [ ] Publish F07 evidence/CI/review and update Empirical; leave merge to owner.

Execution update18October2026: F06Q gate/evidence complete in draftPR18 at22c15fc; bothCI and Codex review passed. F07 implemented locally with69tests/all three browser flows/Caddy checks. F07 publication/finalreview/CI remains the last task; owner merge is separate.
