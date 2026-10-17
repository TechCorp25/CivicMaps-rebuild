# F07 handoff — first council-admin activation

Prepared 17 October 2026 by Codex (agent). **Execution update: merged source3dfb031 passed the F06Q release gate; see [closure evidence](evidence/F06Q-release-closure.md). Owner approved [D02](F07-D02-decisions.md).** PR #16 is merged at `3dfb0316fbe7885c55adbb1861ff58d199ca5810`. Historical live acceptance applies to `8e91622`; the merged retry-budget and backup-cleanup corrections still require controlled deployment and current-source live acceptance. Follow the [next-phase plan](F07-next-phase-plan.md) for that release gate and the subsequent activation work. This does not implement F07 activation.

Retain the existing stack, Sydney resources, domain, budget, isolation and Medium guidance decisions. Resolve only D02 at kickoff:

- Minimum council ADMIN permissions: identify the explicit council operations allowed in the initial slice and whether it may manage dispatch/officer users. Keep platform operator rights entirely separate. F08 entitlement enforcement, F09 suspension and F11 general new-council request lifecycle remain separate.
- Activation delivery and recovery: select the approved delivery channel or controlled synthetic delivery procedure, token lifetime and reissue authority, and account-disable/session revocation policy. No email provider, production identity service or recovery identity proof is selected by this handoff.

Use single-use expiring **hashed** activation tokens, immutable council/context bindings and explicit context grants. Audit issue, redemption, expiry/replay rejection, recovery/reissue and revocation without plaintext credentials/tokens. Reissue must safely handle a lost initial response and revoke the superseded token. Test simultaneous redemption, wrong council, expired/replayed token, copied context/cookie, operator-versus-council separation and disabled-user access. Council ADMIN must never acquire Platform rights.

Repeat bootstrap must preserve activated status and existing identities, synthetic/history records, route/resource ownership and data. Current F06 fixture bootstrap unconditionally sets Provisioning; fix that concrete interaction in F07. Keep one implementation feature in progress, publish a fresh draft PR and verify exact-head CI; owner merge stays separate.
