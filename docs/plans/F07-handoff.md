# F07 handoff — first council-admin activation

Updated 18 October 2026 by Codex (agent). Implementation is review-ready on draft [PR19](https://github.com/TechCorp25/CivicMaps-rebuild/pull/19), implemented source `98ef0a58e83f69d56e13aa73bf9a52b4732020d9`, with later accepted branch head `5098200b3347cd2401645201af93fb2e2445b2c5`. Local69checks, all three browser flows, Caddy checks, hostedCI and final Codex agent review pass. See [F07 evidence](evidence/F07.md) and [API/recovery contract](../development/first-admin-activation.md).

The F06Q prerequisite is complete: merged source3dfb031 is deployed and live accepted; [release closure](evidence/F06Q-release-closure.md) was published in PR #18, now merged into PR #17 at `e34646f`. [D02](F07-D02-decisions.md) was explicitly approved. Neither completed prerequisite needs repeating for local implementation.

F07 implements24-hour hashed single-use invitations, verified operator issue/reissue, atomic password setup, explicit context grants, own-profile-only ADMIN, audit and disable/session revocation. Reissue revokes prior tokens; lost issuance responses require new verified delivery, while lost redemption responses can be recovered by signing in. Registration no longer returns a temporary password. Bootstrap preserves activated/disabled status, credentials, grants, routes, resources, sessions and history.

Owner review/merge order is **#17 into main, then #19**. No agent merge or auto-merge. F07 has not been deployed to AWS; the retained Sydney runtime remains acceptedF06Q3dfb031. A controlled F07 release needs deliberately designated synthetic recipients, preserved data/checkpoints and current-source live acceptance. Retain resources for21October review within the savedUS$50/month allocation.

After F07 dependency/release gates, the next feature is F08 server-enforced pack entitlements and D03 decisions. No personnel management, municipality suspension, new-council infrastructure, production identity/email provider or F11 operational-data connection was added. Preserve Platform/council identity separation and the existing stack/isolation decisions.

Resume corrections on the existing `codex/civicmaps-f07-admin-activation` branch, now stacked on `codex/civicmaps-next-phase-plan`. Do not create a second F07 branch or repeat completed publication. The older F06Q bootstrap sets Provisioning unconditionally; do not run it against an F07-upgraded runtime.
