# Decisions and dependencies

Owner-approved: full staged build; Luna Medium with stronger-model gates; shared services across all branches; Parking first consumer; core dispatch first; `_ds` design authority; department/role headers; no blanket governance hold.

| ID | Decision/dependency | Required before | Safe independent work |
|---|---|---|---|
| D-DUTY | Code2 states, availability semantics, sign-off with open assignments, concurrent devices/session expiry, who can override | M2 operational transitions; M4 duty enforcement | Contract inspection, queue and intake |
| D-INTAKE | Parking field requirements and authoritative catalogue; vehicle validation across jurisdictions | M3 enforcing new business rules | Typed common/package contract and synthetic fixtures are prepared; no parking fields, requiredness, catalogue, or vehicle rule is selected |
| D-ROUTING | Cross-branch eligibility, manual override authority, any automatic assignment policy | M4 expanded authority | Preserve existing grants; recommendations never auto-commit |
| D-GIS | Provider/licence/budget, approved address/zone data, travel-mode choices, disclosure scope | M5 live-provider acceptance | Deterministic local adapters and failure UI |
| D-SAFETY | SOS recipients, escalation/acknowledgement authority, delivery guarantees, offline handling, retention/response ownership | Operational SOS/comms | Shared dependency design only |
| D-LIFECYCLE | Extra state meaning, role transitions, evidence and outcome obligations | Extending current five states | Existing lifecycle tracking/recovery |
| GOV-F002 | Queue completeness remains assigned to governance. PR #25 is still OPEN/DRAFT, unmerged, at `ac4bb265ad978641d0308ec284aaf3f3b4415678` against main `313d9a3fc5b2f66819bfaa52019600c3e167eda7` (checked 21 October 2026); its implementation is not available on main. | M1 final integration | M3 preparation; no duplicate fix without handover. Reconcile the reviewed F-002 contract after the governance PR is owner-merged. |
| GOV-F009/F011/F029 | Shared capacity, pool recovery, audit validation/rendering | Affected acceptance | Reconcile current governance/main state; consume reviewed interfaces |
| RELEASE | PR30 evidence still separate; source already deployed | New release reconciliation | Do not redeploy or replay migration013 |

Decision owner is project owner for product/policy/provider choices; governance supplies applicable approved constraints. Do not infer approval from a draft document. Read current signed decision integration before asking: only request decisions not already settled. Log exact decision source/date and affected acceptance tests. One unresolved row blocks affected work only, not the programme.

## Migration and release boundaries

New schema requires additive/versioned migration and populated historical-data tests. No seed/bootstrap replay. Explicitly establish app/schema rollback compatibility before release; never restore F07 after migration013. Preserve Alpha usable administrator, Beta disabled administrator, request/audit records and grants. Existing retention through 21 October is not authority to delete or silently extend resources; resolve retention separately if needed. No new hosting/provider spend implied by programme approval.
