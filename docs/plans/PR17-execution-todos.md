# PR17 execution ToDos — 17 October 2026

- [x] Confirm PR15/16 merges, PR17 plan and merged-source CI.
- [x] Refresh Empirical; confirm AWS identity, selected Region, plan, spend, runtime health and retained resources.
- [x] Record owner-approved D02 policy (own session/profile, explicit context grants, controlled verified synthetic delivery, 24-hour expiry, revoke old tokens on reissue and sessions on disable; no personnel management).
- [x] Build/check clean merged source3dfb031 and stage its private archive with checksum/object version.
- [x] Verify checkpoint restore/cleanup, deploy and compare populated data/configuration.
- [x] Exercise TLS/session/context/origin isolation, bounded recovery and rollback/return.
- [x] Publish release evidence/ledger on fresh release branch and draft PR; verify CI and Codex review; update Empirical.
- [x] Start fresh F07 branch only after release acceptance; implement/test activation, recovery, disable and bootstrap preservation.
- [x] Publish F07 evidence/CI/review and update Empirical; leave merge to owner.

Execution update18October2026: F06Q gate/evidence complete in draftPR18 at22c15fc; CI and Codex review passed. F07 implemented and pushed98ef0a5 in draftPR19;69tests, all three browser flows, Caddy checks, hostedCI39065104069/39065070396 and final Codex review pass. Empirical checkpoint `6ad3d4bcbeb1d964705ff9ba` records the handoff.

Owner handoff: review/merge #17→#18→#19. F07 is not deployed; AWS remains acceptedF06Q3dfb031. A controlled F07 release with deliberately designated recipients/current-source live acceptance remains separate before F08/D03 kickoff. No merge/auto-merge performed.

Release publication completed: [PR #18](https://github.com/TechCorp25/CivicMaps-rebuild/pull/18) publishes the evidence and ledger. Head `b88f01e` passed [PR CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39067631717) and [push CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39067626435); review fixes and verification are recorded in the review conversations and Empirical `6ad2fb1ebeb1d964705ecb18`. The original release-evidence head `22c15fc` also passed CI and re-review. Do not repeat this completed publication workflow.
