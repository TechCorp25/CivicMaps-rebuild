# CivicMAPS Wireframes — Handoff

**Fidelity:** Low-fi (structure only), hand-drawn style. Hi-fi pending owner sign-off.
**Source:** `CivicMAPS/CivicMaps-preview` @ `main` (see `github.md` for sync state).
Each sequence has a companion `.dc.html` wireframe file and a `docs/WF-Sn ... - Annotations.md` doc (numbered markers trace every element to source).

## Completed

### Sequence 1 — Entry & Authentication
`Wireframes S1 - Entry and Authentication.dc.html` · `docs/WF-S1 ... - Annotations.md`
- 1a Council entry / tenant landing (new, owner-directed)
- 1b CommandMAPS sign-in
- 1c CommandMAPS sign-in 403
- 1d Officer sign-in (mobile)
- 1e Officer sign-in 403 (mobile)
- 1f Account provisioning notice
- 1g Officer sign-in (web)
- 1h Code 2 sign-on

### Sequence 2 — Shell & Navigation
`Wireframes S2 - Shell and Navigation.dc.html` · `docs/WF-S2 ... - Annotations.md`
- 2a CommandMAPS shell — desktop header nav
- 2b CommandMAPS shell — mobile drawer
- 2c Post-login role routing (web auth gate)
- 2d EnforcementMAPS mobile nav chrome
- 2e EnforcementMAPS Inbox/Settings modal chrome

### Sequence 3 — Dashboard
`Wireframes S3 - Dashboard.dc.html` · `docs/WF-S3 - Dashboard - Annotations.md`
- 3a Dashboard — default state (KPIs, zone panel, map)
- 3b Code 1 emergency banner (active + acknowledged)
- 3c Assign/reassign officer modal
- 3d Location pulse — incoming request & chip states
- 3e Panel collapsed

### Sequence 4 — Live Map
`Wireframes S4 - Live Map.dc.html` · `docs/WF-S4 - Live Map - Annotations.md`
- 4a Zone polygon & label states (web)
- 4b Zone info panel — boundaries / streets (web)
- 4c Officer marker & Code21/SR pin cluster (web)
- 4d Code 1 duress beacon & live officer pins (web)
- 4e Mark-Up pin states (web)
- 4f EnforcementMAPS live map detail (mobile — corrects 2d's placeholder)

### Sequence 5 — Directory, Assignments & Look Up
`Wireframes S5 - Directory Assignments and Look Up.dc.html` · `docs/WF-S5 - Directory Assignments and Look Up - Annotations.md`
- 5a Directory — roster list (grouped, search)
- 5b Directory — employee detail panel
- 5c New employee onboarding form
- 5d Onboarding success & password-reset states
- 5e Assignments — zone board
- 5f Add officer modal (co-assignment ranking)
- 5g Look Up — tabbed hub

### Sequence 6 — Code21 Create & Dispatch
`Wireframes S6 - Code21 Create and Dispatch.dc.html` · `docs/WF-S6 - Code21 Create and Dispatch - Annotations.md`
- 6a New Service Request — default state
- 6b Address search & zone/officer resolution states
- 6c Vehicle description & offence-type lookup
- 6d Assign Officer — auto vs. manual override
- 6e Review Service Request — pre-dispatch

### Sequence 7 — Code21 Detail & Lifecycle
`Wireframes S7 - Code21 Detail and Lifecycle.dc.html` · `docs/WF-S7 - Code21 Detail and Lifecycle - Annotations.md`
- 7a Workbench — filter & status list
- 7b Detail — editable state (unlocked)
- 7c Detail — locked state (PIN recorded)
- 7d Detail — No Report evidence (locked)
- 7e Close Service Request modal
- 7f Void PIN modal (destructive)
- 7g Audit trail (expanded) & closure reason

### Sequence 8 — EnforcementMAPS Officer Dispatch Workflow
`Wireframes S8 - Officer Dispatch Workflow.dc.html` · `docs/WF-S8 - Officer Dispatch Workflow - Annotations.md`
- 8a Patrol map — active dispatch bottom sheet (Dispatched Active)
- 8b Dispatch card states & status legend
- 8c Vehicle Details form
- 8d-i Issue Infringement — Step 1: Location & Vehicle (proposed)
- 8d-ii Issue Infringement — Step 2: Evidence & Officer Notes (proposed)
- 8d-iii Issue Infringement — Step 3: Offence & Time (proposed)
- 8d-iv Issue Infringement — Step 4: Review & Issue (proposed)
- 8e No Report — evidence capture
- 8f Native alert dialogs (Alert.alert)
- 8g Printed Infringement Notice — print-replica, real Code128/QR, PDF-ready (own `doc_page` file)
- 8h-i–8h-iv Issue Infringement — Animal Management department variant (Location & Animal/Owner, Evidence & Officer Notes, Offence & Time, Review & Issue)
- 8i-i–8i-iv Issue Infringement — Rangers (Parks & Gardens) department variant (Location & Party Details, Evidence & Officer Notes, Offence & Time, Review & Issue)

### Sequence 9 — EnforcementMAPS Mobile: Mark-Up (Digital Chalking) Create & Detail
`Wireframes S9 - Mark-Up Create and Detail.dc.html` · `docs/WF-S9 - Mark-Up Create and Detail - Annotations.md`
- 9a New Mark-Up — create form (physical/digital split)
- 9b Active Mark-Ups list (timers, DIGITAL badge + Resume)
- 9c-i Mark-Up Expired — completion (Physical, Chalk Mark Evidence + Marks Collected)
- 9c-ii Mark-Up Expired — completion (Digital, capture summary)
- 9d Mark-Up Archive — search & results
- 9e Digital Chalking — segment screen (mode select, scan list, offending decision banner)
- 9f Digital Chalking — live capture (camera viewfinder, lock progress, frame/hit counters)
- 9g Scanned plates list, per segment (proposed — plate image + editable OCR plate)
- 9h EnforcementMAPS Web — Digital Mark-Up Live Capture (browser companion, `getUserMedia`)
- 9i-i/9i-ii EnforcementMAPS Web — Capture Review Modal (normal / offending)
- 9j CommandMAPS — Mark-Ups: Team Review (read-only, team/branch-scoped list)
- 9k Mark-Up Detail — Compliance Review (read-only drawer, digital capture summary)
- 9l Digital Capture Review — per-scan list (proposed, read-only OCR + flag-for-follow-up)
- 9m Tablet-responsive Mark-Up Detail (field use, CommandMAPS)
- Scope: all four Mark-Up surfaces now covered — EnforcementMAPS mobile, EnforcementMAPS Web, and CommandMAPS (OQ9-3 resolved).

### Sequence 10 — Audit Trail
`Wireframes S10 - Audit Trail.dc.html`
- 10a Employee Audit Trail — Directory detail (existing, expanded; badge/RBAC changes logged through the same feed)
- 10b Zone Assignment Audit Trail (proposed — no backing data today)
- 10c Code21 Full-Lifecycle Audit — dedicated view (existing chain from SR generation through closure; adds a Location map like 9n's, plus a net-new "Related Requests" cross-linking panel)
- 10d Infringement Issuance Audit (proposed — no infringement record model exists; includes a flagged customer-withdrawal-request row)
- 10e Related SRs — same address/location list (proposed; a real query against existing address/coordinate fields, opened from 10c's Location card)

### Session 16b — `alert()` → toast/banner sweep
Applied OQ3-1's Session 16 decision (one-off notifications → transient toast; anything requiring a response → inline/persistent banner) across every screen using native `alert()`/`Alert.alert()`:
- `Wireframes S3 - Dashboard.dc.html` — new 3f: pulse-declined + no-GPS-fix notices → toast.
- `Wireframes S5 - Directory Assignments and Look Up.dc.html` — new 5h: onboarding server-validation failure → banner (was already banner in source, drawn visually for the first time).
- `Wireframes S6 - Code21 Create and Dispatch.dc.html` — new 6f: dispatch-failure → banner (same note as 5h — already banner in source).
- `Wireframes S8 - Officer Dispatch Workflow.dc.html` — new 8j: "PIN Issued" → toast, "Location Required" → banner. "Confirm No Report" (two-choice decision, not a notification) intentionally left native — re-scoped under OQ5-2, not this sweep.
- `Wireframes S11 - Settings.dc.html` — checked, no change needed: 11g/11i already show the real source behaviour (banner, not `alert()`).
- Code 1/Code 2 messaging is untouched — stays banned from toast per the design system, regardless of this sweep.

### Sequence 11 — Settings
`Wireframes S11 - Settings.dc.html`
- 11a CommandMAPS Settings — default (non-officer): Change password, Display theme
- 11b CommandMAPS Settings — Duty status section (mixed-role state, unreachable today)
- 11c EnforcementMAPS Web Settings — full page (officer): password, theme, duty status
- 11d EnforcementMAPS mobile Settings — top (password, theme, duty status)
- 11e EnforcementMAPS mobile Settings — bottom (location sharing, granted)
- 11f EnforcementMAPS mobile Settings — location sharing warning states (GPS revoked, background not granted)
- 11g Change password — validation error
- 11h Change password — success
- 11i Duty status — update failed

### Sequence 17 — Case/Record Intake Queue (Local Laws)
`Wireframes S17 - Case Intake Queue.dc.html` · `docs/WF-S17 - Case Intake Queue - Annotations.md`
Net-new, proposed (no repo source) — establishes the record shape Sessions 18–20 issue into.
- 17a Local Laws — Intake Queue (list, status/category filter)
- 17b Case Detail — new, unassigned (Received)
- 17c Assign to Officer/Team modal (officer/team toggle, priority, due-by)
- 17d Case Detail — assigned, in progress (internal notes thread)
- 17e Action / Close Case modal (outcome-dependent Actioned/Closed split)
- 17f Case Detail — actioned/closed, audit trail

### Sequence 18 — Permit Issuance Workflow
`Wireframes S18 - Permit Issuance Workflow.dc.html` · `docs/WF-S18 - Permit Issuance Workflow - Annotations.md`
Net-new, proposed (no repo source). Busking Permit worked example.
- 18a Application Queue (list, status/permit type filter)
- 18b Application Detail — new, Submitted
- 18c Review & Decision modal (Approve/Reject branch, Approve pictured)
- 18d Application Detail — Approved (permit issued)
- 18e Application Detail — Rejected
- 18f Issued Permit — record card (distinct citable artefact from the application detail view)
- 18g-k CommandMAPS admin/management layer (Permit Registry w/ revoke, Reviewer Workload, Reporting, Permit-Type Configuration, Expiring Soon) — full desktop chrome (browser frame + shellbar + folder tabs), scoped to council ADMIN and team supervisors/people leaders
- 18l Dispatch Look Up — new "Permits & Licences" tab (search, incl. temporary permits) alongside Service Requests/Mark-Ups/Audit
- 18m-n EnforcementMAPS mobile — Permit Look Up entry point + results, for field-officer compliance checks

## Open questions carried forward
OQ2-1 (role label vs raw enum), OQ2-2 (dark map surface on EnforcementMAPS), OQ2-4 (OFFICER web-denial styling), OQ3-1 (`alert()` used for pulse-declined + form errors — standardise on a toast/banner?), OQ3-2 (KPI tiles have no drill-through), OQ4-1 (dashed zone-boundary convention is table-only, not a real map line style), OQ4-2 (zone fill-opacity code vs tokens mismatch), OQ4-3 (heading-aware officer marker is mobile-only, web uses a static pin), OQ4-4 (SR marker red for CANCELLED vs Code-1-only red rule), OQ4-5 (`Compass.tsx` looks like dead code), OQ5-1 (onboarding display-name rule applies to all ranks, not just OFFICER), OQ5-2 (two different destructive-action confirm patterns — native `confirm()` vs styled panel), OQ5-3 (Directory "Read Only" badge vs DS's documented disabled-state pattern), OQ5-4 (temp-password shown in amber "alert" styling though it's informational, not action-required), OQ6-1 (address suggestion S/H/G badges have no in-UI legend), OQ6-2 (`travelMode` hardcoded to FOOT, no UI control despite contract supporting VEHICLE), OQ6-3 (SR date/time silently stamped from client clock at create-time, not editable/backfillable), OQ6-4 (manual-officer-select default option text is the only signal distinguishing "no zone yet" from "zone resolved, no active officer"), OQ7-1 (Close-SR vs Void-PIN role lists are asymmetric with no overlap), OQ7-2 (`canVoid` requires status exactly COMPLETED, not reachable once CLOSED), OQ7-3 (VOIDED/CANCELLED confirmed to use Code-1 red `#DC2626` per Tailwind config — extends OQ4-4), OQ7-5 (no reassignment control on the admin detail view despite `ReassignCode21Schema` existing), OQ8-1 (No Report location-permission denial exits the workflow with no retry path), OQ8-2 (VehicleDetailsForm/IssueInfringementWorkflow use raw hex instead of theme tokens), OQ8-3 (No Report header border uses the "issued" purple token with no semantic link), OQ8-4 (every destructive/terminal action on mobile routes through native Alert.alert — extends OQ3-1), OQ8-6 (Edit Vehicle button stays visible/tappable after PIN lock instead of hiding), OQ8-7 (dispatch/Mark-Up sheets are plain View/Modal, not Expo Router formSheet — checked against building-native-ui), OQ8-8 (No Report header uses a hardcoded Platform.OS safe-area constant instead of safe-area-context), OQ8-9 (remove-photo hit target is 28×28px, under the 44px minimum), OQ8-10 (proposed 4-step Issue Infringement redesign has no backing data source/API for location lookup, department offence filtering, or evidence override), OQ8-11 (Animal Management/Rangers department variants referenced but not yet screened), OQ8-12 (post-issuance append-only enforcement point not yet confirmed).

OQ8-13 (barcode notice-number format vs. app's alphanumeric PIN format), OQ8-14 (printed penalty amount is illustrative, needs real indexed penalty-unit value), OQ8-15 (no print/PDF backend endpoint exists yet — 8g built from owner-provided reference docs, not repo source), OQ8-16 (8d-i–8d-iv steps skip `ScrollView contentInsetAdjustmentBehavior` per building-native-ui, though hit targets clear 44px), OQ8-17 (no automated owner-ID lookup for Animal Management, unlike plate lookup), OQ8-18 (Animal Management offence codes/penalties are illustrative placeholders, no backing constants), OQ8-19 (icon-removal direction scoped to Review screens only — confirm if a full emoji sweep is wanted), OQ8-20 (Rangers Permit Status lookup has no backing API/contract), OQ8-21 (Parks & Gardens offence codes are illustrative placeholders, no backing constants), OQ9-1 (MarkUpForm/MarkUpArchive hardcode an off-palette raw hex, corrected to Civic Navy in this wireframe), OQ9-2 (archive marks badge doesn't distinguish digital-zero from physical-zero), OQ9-4 (complete-markup contract isn't split by capture mode), OQ9-5 (frame/hit counters not persisted), OQ9-6 (no defined behaviour for an OCR-plate correction), OQ9-7 (9g has no backing screen/route/API), OQ9-8 (web Capture Review reuses emergency red for a non-Code-1 offending state), OQ9-9 (CommandMAPS team/branch scoping for markups not wired server-side yet), OQ9-10 (no admin-facing digital-capture/scan API), OQ9-11 ("Flag for follow-up" has no backing data model). OQ9-12 (per-scan GPS vs. Mark-Up GPS consistency check has no backing proximity logic — proposed in 9n). OQ10-1 (does compliance want a Zone Assignment audit trail at all, given assignment changes already surface on the officer's own audit trail). OQ10-2 (Code21 has no reporter/complainant identity field, blocking same-individual/geographic-clustering audit linking). OQ11-1 (auth.ts's UserResponseSchema role enum is narrower than the full 8-tier RBAC in shared/schema/enums.ts — Settings' role badge/isOfficer check both read from the narrower type), OQ11-2 (ShareLocationToggle's own Task #30 comment says location-sharing is mandatory/locked for officers, no onToggle — but settings.tsx still wires an interactive onToggle in), OQ11-3 (settings.tsx omits ShareLocationToggle's hasBackgroundPermission prop, so its own warning text never fires; a separate hand-rolled Background location block duplicates the check instead), OQ11-4 (CommandMAPS's isOfficer/DutyStatusSection branch is unreachable — AuthGate denies OFFICER sign-in to CommandMAPS entirely), OQ11-5 (settingsService.ts's real getPreferences/updatePreferences pair is unused by any of the three Settings screens — ThemeSection goes through a separate useTheme() context instead), OQ11-6 (mobile settings.tsx's two primary buttons use Patrol Gold as a button fill with dark text — a direct hit against the design system's "never for buttons" rule; both web Settings pages correctly use civic-primary navy + white text for the same CTA).

OQ10-3 (no citizen-facing surface exists for a customer-initiated infringement withdrawal request to originate from).

OQ17-1 (reporter contact hidden by default on case detail — reveal path undefined), OQ17-2 (Local Laws breach category taxonomy is illustrative, no backing list), OQ17-3 (no "Refer to Permits" outcome linking a closed case forward into Session 18's flow), OQ17-4 (team-held case assignment — claim step and note/action permissions undefined), OQ17-5 (RBAC scoping for the queue is a guess, not confirmed), OQ17-6 (no manual case-logging entry point built — how a phone-reported case enters the queue is undesigned).

OQ18-1 (permit rejection reason taxonomy is illustrative, no backing list), OQ18-2 (application record shape drawn for busking only — unconfirmed whether other permit types share it), OQ18-3 (fee has no payment-status tracking), OQ18-4 (single claim-and-decide modal vs. Sequence 17's two-step assign/action pattern — confirm intentional), OQ18-5 (public permit verification link/QR has no backing endpoint or citizen-facing host), OQ18-6 (OQ17-3's cross-domain routing between Local Laws and Permits still unresolved from this side too), OQ18-7 (registry Revoke action has no confirm-step modelled), OQ18-8 (ADMIN vs. supervisor/people-leader permission split within the management layer undefined), OQ18-9 ("Permits Admin" top-level nav entry not confirmed), OQ18-10 (mobile Look Up icon placement/RBAC-hidden-vs-disabled behaviour undefined).

~~OQ8-11~~ (Animal Management department variant not yet screened) — **resolved**: built as 8h-i–8h-iv above.

~~OQ2-3~~ (`enforcementmaps/tabs/` likely dead code) — **resolved/withdrawn**: confirmed live in Sequence 7 research as the officer-side PIN-issuance/No-Report workflow, now built out as Sequence 8 above.

~~OQ9-3~~ (CommandMAPS admin Mark-Up view not yet screened) — **resolved**: built as 9j–9m, a read-only team/branch-scoped compliance review surface (9j–9m above).

## Sequence 12-15 — Platform Admin (complete)

New surface, no repo source — every screen is net-new, owner-directed, same footing as 1a's tenant-landing screen. Scoping: a new platform-operator role sits above all 8 council-scoped roles; hidden top-level area inside CommandMAPS (not a separate tool); "departments" covers both meanings (domain-pack access per council, and literal org-chart teams).

### Sequence 12 — Shell & Municipality Directory
`Wireframes S12 - Platform Admin Shell and Municipality Directory.dc.html`
- 12a Platform Admin shell — global chrome (slate + Patrol Gold signal rule, icon-only rail)
- 12b Municipality directory — list (status pills, search, + Add municipality)
- 12c Single municipality — overview (sandbox-boundary explainer, domain-pack chips, first-admin account)
- 12d Platform Admin entry point (proposed root-domain sign-in — resolves OQ12-1)

### Sequence 13 — Onboarding Wizard
`Wireframes S13 - Onboarding Wizard.dc.html`
- 13a Step 1 — Council identity (name, subdomain slug, crest placeholder)
- 13b Step 2 — Domain-pack selection (8 packs, checkbox grid)
- 13c Step 3 — Seed first council admin (reuses 5c/5d's temp-password pattern)
- 13d Step 4 — Review & provision
- 13e Provisioned — success state

### Sequence 14 — Domain-pack Assignment & Sandbox Model
`Wireframes S14 - Domain Pack Assignment and Sandbox Model.dc.html`
- 14a Domain packs — live council (toggle list)
- 14b Remove pack — destructive confirm (open-record impact warning)
- 14c Sandbox boundary — explainer diagram (isolated vs. shared, informational only)

Literal org-chart/team structure kept out of scope per OQ12-2, not built here.

### Sequence 15 — Cross-council Usage/Health Dashboard
`Wireframes S15 - Cross-council Usage and Health Dashboard.dc.html`
- 15a Cross-council dashboard — default (KPIs, sortable council table, Degraded row)
- 15b Single-council health drill-in (degraded signal detail)

### Open questions — Platform Admin
OQ12-1 (platform-admin sign-in can't route through any council's `<council>.civicmaps.gov.au` subdomain per 1a's own model — 12d proposes a separate root domain). **Left unresolved by owner request (Session 16)** — no candidate confirmed; carries forward.

~~OQ12-2~~ (platform operator's hand in council org-chart) — **resolved (S16)**: platform operator gets full edit access to a council's org-chart/team structure, not domain-pack-only. Note: the owner-supplied target-state architecture (S01-TEN-006) requires platform administration not bypass tenant isolation implicitly — any future build of this must route edits through an audited action, not a silent override. Not yet built (still queued as Session 21).

~~OQ12-3~~ (municipality status set) — **resolved (S16)**: Active/Provisioning/Suspended confirmed as-is, no screen change needed.

~~OQ13-1~~ (subdomain slug uniqueness) — **resolved (S16)**: globally unique, immutable after provisioning. Patched into 13a's helper text.

~~OQ14-1~~ (open-record count per pack) — **resolved (S16)**: flagged as a real backend query to build; wireframe keeps the illustrative placeholder meanwhile. No screen change.

~~OQ15-1~~ (health-check criteria & usage metrics) — **resolved (S16)**: stays illustrative. Owner-supplied target-state architecture confirms no SLI/SLO/availability target exists anywhere in the current or target platform spec yet — nothing to bind the wireframe to. Revisit once that architecture work defines it.

### Open questions — general
~~OQ3-1~~ (`alert()` used for pulse-declined + form errors) — **resolved (S16), applied (S16b)**: split by kind — one-off confirmations (e.g. pulse-declined) become a transient toast; form-validation errors become an inline/persistent banner near the field, not a toast. Native `alert()` stays banned per the design system's Code 1/Code 2 rule regardless. Applied across S3 (3f), S5 (5h), S6 (6f), S8 (8j); S11 already compliant. OQ8-4's destructive-confirm half re-scoped to OQ5-2 (still open).

## Owner-supplied architecture context (Session 16)
Three docs uploaded (`uploads/arch_docs-*.md`): Section 01 (Authoritative Foundation), Section 02 (Current-State Assessment), Section 03 (Target-State Architecture — index/scaffold only, content not yet approved). These describe a much larger multi-tenant/multi-jurisdiction target architecture (Tenant/Organisation/Jurisdiction/Authority Realm model) than the wireframes' current "municipality" model. Useful as background for Platform Admin and future sessions; not adopted wholesale since Section 03 itself is unapproved scaffolding. Flag for the owner: worth a dedicated pass once the org-chart (Session 21) and cross-council (S12-15) surfaces need finer-grained tenancy concepts.

## Next set — not yet scheduled

Session 18 (Permit Issuance Workflow) closed. Forward plan for Sessions 19-25 (internal council department management, citizen-facing surfaces): see `docs/Roadmap - Sequences 16-25.md`.
