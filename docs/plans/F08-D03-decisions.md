# F08 D03 — catalogue and entitlement policy decisions

Prepared 18 October 2026 by Codex (agent). **Status: owner approved in chat on 18 October 2026.** F07 [live-release gate](evidence/F07-release-closure.md) passed. Parking Services Branch first and a shared operational map with branch-dependent features are already owner-confirmed; those choices are not being reopened.

The owner approved the following initial development policy before F08 implementation:

| Area | Proposed decision |
| --- | --- |
| Catalogue | First-class `parking-services` (Parking Services Branch), plus the eight existing packs: `local-laws`, `parks-gardens`, `animal-management`, `cleaning`, `waste`, `safe-city`, `licensing-permits`, `asset-inspections`. Preserve display labels and existing assignments through explicit ID migration. Renaming a label never changes access |
| Existing parking context | Map the existing immutable context `branch_id=parking` to `parking-services` in entitlement resolution; retain binding IDs, versions, grants, ownership and request history. Do not equate parking with Local Laws |
| Development migration | Explicitly enable Parking Services for the two approved synthetic Alpha/Beta councils. They currently carry only Local Laws in the registry. Preserve that assignment; do not silently enable parking for other Local Laws councils or unknown branches. New councils require explicit pack assignment |
| Disabled pack | Retain records and audit. Existing operational roles may read only retained requests and their audit within their already-authorised context/record scope. Officer assignment restrictions remain. Deny field actions, request writes and active operational resource/personnel lookups for the disabled capability. Own-profile/session/context access remains governed by F07; ADMIN gets no operational review access |
| In-flight ordering | No completion exception initially. A write must commit before disable commits or be denied; serialize entitlement checks and disable with a defined transaction boundary. Deny stale/replayed write requests after disable, even if a prior idempotency receipt exists. Completed history is retained |
| Re-enable / recovery | Audited new configuration version restores only previously authorised capability access without recreating records. A configuration rollback also creates a new version; no version reuse, permissive bypass or role/grant expansion |

Unknown catalogue values or unmapped contexts are surfaced for explicit resolution and fail closed for capability access. Shared map presentation consumes the same resolved capabilities/version, while server routes and durable writes enforce them independently of client visibility or caches.

The bounded F08 feature covers existing implemented requests/audit, officer/resource lookups and pack controls. It defines the branch capability contract for the shared map without claiming to implement missing GIS/realtime or all preview parking workflows. The source-pinned [capability baseline](F08-parking-capability-baseline.md) records those gaps. F09 suspension, F11 general operational-data connection, personnel management and selecting/implementing a second branch remain later scopes.

Approval receipt: the owner answered **“Approve these initial D03 choices”** to the request linking this decision sheet at PR #20 source `a4a57c8`. Empirical decision `6ad42b2cbeb1d96470603894` records that approval. Later exceptions require an explicit actor/action/state and corresponding acceptance cases.
