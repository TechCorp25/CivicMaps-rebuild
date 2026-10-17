# F07 handoff — first council-admin activation

Updated18October2026 by Codex (agent). Implementation is review-ready on draft [PR19](https://github.com/TechCorp25/CivicMaps-rebuild/pull/19), source `98ef0a58e83f69d56e13aa73bf9a52b4732020d9`. Local69checks, all three browser flows, Caddy checks, hostedCI and final Codex agent review pass. See [F07 evidence](evidence/F07.md) and [API/recovery contract](../development/first-admin-activation.md).

The F06Q prerequisite is complete: merged source3dfb031 is deployed and live accepted; [release closure](evidence/F06Q-release-closure.md) is recorded in draftPR18. [D02](F07-D02-decisions.md) was explicitly approved. Neither completed prerequisite needs repeating for local implementation.

F07 implements24-hour hashed single-use invitations, verified operator issue/reissue, atomic password setup, explicit context grants, own-profile-only ADMIN, audit and disable/session revocation. Reissue revokes prior tokens; lost issuance responses require new verified delivery, while lost redemption responses can be recovered by signing in. Registration no longer returns a temporary password. Bootstrap preserves activated/disabled status, credentials, grants, routes, resources, sessions and history.

Owner review/merge order is **#17→#18→#19**. No agent merge or auto-merge. F07 has not been deployed to AWS; the retained Sydney runtime remains acceptedF06Q3dfb031. A controlled F07 release needs deliberately designated synthetic recipients, preserved data/checkpoints and current-source live acceptance. Retain resources for21October review within the savedUS$50/month allocation.

After F07 dependency/release gates, the next feature is F08 server-enforced pack entitlements and D03 decisions. No personnel management, municipality suspension, new-council infrastructure, production identity/email provider or F11 operational-data connection was added. Preserve Platform/council identity separation and the existing stack/isolation decisions.
