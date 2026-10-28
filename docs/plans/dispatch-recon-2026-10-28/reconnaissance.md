# Dispatch dashboard reconnaissance

28 October 2026 · source-based assessment and execution preparation.

The rebuild provides request processing and map/location foundations. It does not yet provide the operational dispatch workspace described by the preview and `_ds`. Completing it requires shared operational services and real field-facing interactions as well as layout work.

## Baselines and evidence

| Source | Pin and status |
|---|---|
| CivicMAPS/CivicMaps-preview | `e53ec8caa902ced7b38f688a2b249320276545b4`; complete GitHub path inventory and 90 selected files retrieved, covering CommandMAPS features/components, server handlers, native/web officer dispatch, shared enums and co-assignment. |
| TechCorp25/CivicMaps-rebuild | Remote main `681ac555e2c24ff6a85af3d216872c8e0f0f4b10`, independently fetched into an isolated worktree. PR46 is merged, head `1050d90f92bdecb4f34700c31b01506cff683d87`; main also includes merged PR47. |
| Original workspace | `/workspace/CivicMaps-rebuild`, branch `work`, `d34cf9fd692fabc24d17ff1a9657be9b724d620f`; left unchanged. |
| Empirical | Active CivicMAPS-rebuild workspace. Policy, owner requirements, dispatch programme, map work, governance and environment gotchas reviewed. Memory supplies context; current Git and owner instructions determine present status. |
| Design | `_ds/SKILL.md`, README, decision register, accessibility spec, components, CommandMAPS/dispatch kits, S3–S8 annotations and screen structure inspected. Proposed screens are distinguished from existing preview features. S9 receives detailed contract review at its implementation goal. |

This is source reconnaissance, supplemented by rebuild synthetic browser/build checks. It does not certify preview deployment, live Google behaviour, native device execution, production readiness or field service reliability. See [source trace](preview-source-recon.md), [workplan](workplan.md) and [bootstrap receipt](bootstrap.md).

## Required operational layout

S3 3a/3e and S4 describe a map filling the operational viewport, a collapsible right panel (22/24rem in preview), persistent pull tab, and emergency banners that reflow when the panel closes. The panel contains a 2×2 KPI group, zone coverage/officer state, location requests and recent SRs. Intake replaces panel content. Map selection connects zones, request clusters, authorised officer locations, mark-ups and emergency signals to the same request detail/history.

Current rebuild `main.tsx:1169` renders `dashboard-stack`, then open `details.operations-panel`, with queue/detail below the map. `styles.css:262` defines that grid; `:296` gives a 360px minimum map height. Navigation at `main.tsx:1004` has one Service requests entry. The teal dispatch header, role/department identity and scope are already implemented and should be retained. The missing workspace behaviour is not fixed by increasing map height alone.

## Gap and reuse matrix

| Capability | Reference | Rebuild status and required result |
|---|---|---|
| Shell/layout | AppShell/DashboardPage; S2/S3 | Stacked map/queue exists. Build full operational map and collapsible right panel, preserving scope, header and keyboard access; role-appropriate navigation only. |
| Overview | Snapshot handler; S3 3a.1–4 | No zone/duty snapshot. Add scoped active zones, online officers, Code2 and unassigned SR counters, definitions, timestamps and failure states. |
| Discovery | Code21Page/LookUpPage; S7 7a | Preserve real search/count/cursor reads, 100-row server pages, 25-row presentation, selected-item fetch and history. Do not regress to filtering the first loaded page. |
| Map layers | ZoneMap; S4 | Google map and loaded-request pins exist. Zones, staffing, clusters and authorised location/mark-up/emergency overlays remain. The map truthfully labels loaded requests; broader scope needs a bounded authorised query. |
| Location selection | Code21CreateForm; S6 | Places API (New), map pick, confirmation, automatic coordinates and revision/context protection exist. Preserve auth-loss cleanup and readiness checks. Live provider qualification remains separate. |
| Intake/review | S6 6a–6f | API accepts address, latitude, longitude, notes. Add package-aware type/offence, optional vehicle, zone/officer selection and review with retry; authoritative catalogue/requiredness need reconciliation. |
| Duty/presence | Code2/26/off-duty; DR-04/24 | Active directory account is not duty or connectivity. Implement shared duty states, real field action and eligibility; Available, Active offline and Inactive offline remain distinct. |
| Assignments | AssignmentsPage/server; S3 3c/S5 | Request assignment exists; zone staffing does not. Add scoped assignment/co-assignment/reassign/end and conflict feedback. Preview team rules are reference, not approved rebuild policy. |
| Field dispatch | Officer service/native/web | Preserve assign→acknowledge→attend→close. Complete real field receipt and shared updates. Rebuild EnforcementMAPS packages remain scaffolds and cannot prove field usability. |
| Lifecycle/evidence | S7/S8 | Five-state foundation only. Specify richer transitions, authority, outcome/evidence, locks, notes, close/void reasons; implement server rules and migrations, not demo next-state buttons. |
| Location requests | Pulse handlers/inbox; S3 3d | Missing. Request/pending/standby/approved/declined/expiry, recipient response and time-limited location visibility need shared backend and field consumer. |
| Emergency | Code1Banner/router; S3 3b | Missing. Multiple persistent incidents, server acknowledgement, officer clear, map coupling, scoped delivery and failure/reconnect behaviour. Acknowledge must not dismiss an active incident. |
| Mark-up | Create/Page/Archive; S9 | Missing. Timed work needs persisted create/edit/complete/archive, map/list convergence and real field completion. |
| Refresh/recovery | Preview events/poll; rebuild timer | Preserve 10-second refresh, idempotency/version, uncertainty reconciliation, drafts and selection. Add scoped events/reconnect; never show fake WS-LIVE. |
| Communications | Kit channel/PTT/radio controls | Not proven by dashboard source. Require a separate actual transport/delivery integration before presenting operational controls as working. |

## Dispatch-to-field operation

1. Officer signs on and has an eligible zone/team assignment. Duty, authentication and connectivity are separate facts.
2. Dispatch confirms the reported point, resolves operating area, reviews package data and selects an eligible officer. Server commits request, assignment and audit, then delivers scoped field work.
3. Officer receives, acknowledges and attends; permitted vehicle/evidence/outcome updates become committed shared state. Dashboard reconciles missed events and shows freshness.
4. Dispatch opens the same record from map, queue or lookup, reads authorised evidence/history and performs permitted reasoned close/void actions.
5. Location requests use consent and expiry. Emergency activation, dispatcher acknowledgement and officer clearance are separate actions; failure is visible.

Important source differences: native preview acknowledgement changes DISPATCHED_ACTIVE to IN_PROGRESS; rebuild changes DISPATCHED to ACKNOWLEDGED. Preview dashboard active pins omit ATTENDED/PIN_ISSUED that remain in the officer list. The planned transition/migration matrix must preserve meaning, not just rename labels. No Report metadata persistence does not itself prove binary photo storage; PIN generation does not prove print/PDF.

## Design and behaviour conflicts

- **Map versus queue:** later owner map-centred direction overrides the queue-first dispatch-kit README. Combine shared map layout and dispatch context components.
- **Tokens versus examples:** DR-04 overrides passive amber Code2 examples; DR-28 overrides personal-name headers. Use canonical tokens, triple encoding and emergency-only red, not raw preview colours or demo colour misuse.
- **Location truth:** zone centroid markers are not live GPS. Heading-aware marker design needs actual heading/provenance; missing positions remain unavailable. Canonical zone opacity differs from preview rendering and needs an explicit trace decision.
- **Radio labels:** accessibility B2 requires paired code/label, while RadioCodeBadge's owner-ruling comment uses progressive disclosure. Reconcile owner ruling and accessible naming in the contract; do not claim all `_ds` sources are internally consistent.
- **S6 behaviour:** annotation POST zone-resolve conflicts with preview GET; review-preserving retry conflicts with preview returning to form. Specify and test the rebuild API and intended annotation behaviour.
- **S8 scope:** four-step infringement review and print replica are proposed designs. Preview single-screen issuance is not evidence of those workflows or authoritative nationwide penalties.
- **Authority:** preview Directory/Audit/Settings navigation does not grant dispatch management powers. Retain current scoped request history and council grants. Shared services support multiple branch packs; Parking is the first consumer.

## Completion rule

The workplan closes the gaps as independently assessed goals. Database-backed dispatch/field journeys, visual comparison against identified annotation markers, recovery/isolation tests and a final integrated assessment are required. A stub or simulated safety workflow cannot close an operational goal. This session changes documentation only; implementation, merge and deployment are not performed.
