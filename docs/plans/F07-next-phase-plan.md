# Completed F06Q/F07 implementation plan — historical reference

Updated 18 October 2026 by Codex (agent). The active plan is [F07 release acceptance, then F08 entitlements](F08-next-phase-plan.md).

The workflow originally planned here is complete through F07 implementation and owner merge:

- F06Q PR #16 merged at `3dfb0316fbe7885c55adbb1861ff58d199ca5810`, deployed and live accepted. [Release evidence](evidence/F06Q-release-closure.md) records data/session/configuration preservation, bounded recovery and rollback/return. PR #18 published that evidence, later merged through PR #17 into main.
- Owner-approved [D02](F07-D02-decisions.md) defines own-profile/session and explicit-context ADMIN access, verified synthetic delivery, 24-hour tokens, old-token revocation on reissue and session revocation on disable.
- F07 [PR #19](https://github.com/TechCorp25/CivicMaps-rebuild/pull/19) implements those choices and was owner-merged at `2b73318a57c97baecb52711beca401ed3a162339`. [Implementation evidence](evidence/F07.md) covers local/disposable and hosted CI acceptance; final source `16d5435` passed CI and external Codex review with no findings.
- [PR17 execution ToDos](PR17-execution-todos.md) retain the completed publication and owner-merge receipts.

F07 deployment/live acceptance is now complete for merged source `2b73318`; see [release closure](evidence/F07-release-closure.md). Do not repeat the completed deployment, activation or D02 choices. Use the [new plan](F08-next-phase-plan.md) and [handoff](F07-handoff.md) for remaining D03 decisions and the F08 scope.
