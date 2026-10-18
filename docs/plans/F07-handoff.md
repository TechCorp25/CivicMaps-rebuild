# F07 handoff — merged and live accepted

Updated 18 October 2026 by Codex (agent). Owner-merged PR #19 source `2b73318a57c97baecb52711beca401ed3a162339` is deployed and its scoped live-release gate passed. [Release closure](evidence/F07-release-closure.md) records the artifact, original-data/configuration preservation, real TLS activation/isolation/revocation and compatible recovery. [Implementation evidence](evidence/F07.md) retains local/disposable and hosted CI proof.

Owner-approved existing Alpha/Beta test subdomains were reused. `admin@alpha.synthetic.example` remains activated and usable with own-profile/session/context access only. `admin@beta.synthetic.example` is permanently disabled and its sessions revoked; the Beta council service and resources remain healthy. Do not repeat activation, disable Alpha or reset these identities. Credentials remain private on the retained runtime.

[D02](F07-D02-decisions.md) is implemented. Next obtain the remaining [D03 decisions](F08-D03-decisions.md), then follow the [F08 plan](F08-next-phase-plan.md) on a fresh implementation branch. Parking Services Branch is first; all branches share the operational map while feature sets vary. Use the [preview capability baseline](F08-parking-capability-baseline.md), retaining role/context isolation and F07 ADMIN's restricted authority.

Keep migration012, data and audit during recovery; the tested recovery uses compatible F07 code. Older F06Q rollback compatibility after activation is unproven. Existing Sydney resources/checkpoints remain retained for the 21 October review under the saved US$50/month allocation. F09, F11, personnel management and production identity/email remain separate.
