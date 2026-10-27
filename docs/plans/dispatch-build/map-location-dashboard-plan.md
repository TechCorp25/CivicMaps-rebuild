# Map-centred dispatch dashboard and SR location build plan

Version: 1.0.0
Prepared: 27 October 2026
Status: planning deliverable; implementation and independent assessment pending.
Repository: TechCorp25/CivicMaps-rebuild
Verified main/base: d34cf9fd692fabc24d17ff1a9657be9b724d620f
Working branch: codex/civicmaps-dispatch-map-location-plan-20261027

## Required outcome

The next dispatch build phase centres CommandMAPS on the operational map. A dispatcher can receive an SR (service request / Code21), confirm an address suggestion OR select its location on the map, and have latitude/longitude populated automatically. Ordinary intake must not require the operator to type coordinates. Map, queue, selected SR and intake must remain synchronised.

This document delivers the requested build plan and fresh published branch. It does not claim the reported live defect has been fixed, deployed or independently reproduced in an authenticated browser. User testing at https://alpha-commandmaps.dev.civicmaps.com.au/ is the live defect report; source inspection establishes the implementation gap below.

## Verified baseline and source trace

The GitHub API verified main at the base above; local HEAD matches. Local git fetch failed because its configured proxy was unreachable, so GitHub connector reads/publication are used. Preserve the unrelated local branch and quality-remediation work.

| Source | Evidence and application |
| --- | --- |
| apps/commandmaps/src/RequestComposer.tsx | Address is a plain input; latitude and longitude are required number inputs, initially represented as zero in draft state. prepare reads coordinates from FormData. There is no autocomplete or map selection in this component. This is missing functionality, not a verified broken provider key. |
| apps/commandmaps/src/main.tsx | Existing operational queue/detail, scoped request reads and lifecycle actions are the integration seam. Preserve M1 discovery rather than rebuilding a latest-100 queue. |
| services/api/app.mjs, POST request creation | Existing address/latitude/longitude/notes payload and finite/range checks; preserve server authority, capture binding, audit and retry contracts. |
| services/api/migrations/001-foundation.sql | Request coordinates are non-null and range-checked. No fake coordinates or silent zero defaults to satisfy this constraint. |
| _ds/wireframes/annotations/WF-S3 - Dashboard - Annotations.md, 3a.5–3a.6 and 3e | Full map under a collapsible right operations panel; isolate map errors from the rest of the dashboard. Companion: _ds/wireframes/screens/Wireframes S3 - Dashboard.dc.html. |
| _ds/wireframes/annotations/WF-S4 - Live Map - Annotations.md | Zone, marker and selected-map presentation; companion: _ds/wireframes/screens/Wireframes S4 - Live Map.dc.html. Render only data the rebuild actually supports and authorises. |
| _ds/wireframes/annotations/WF-S6 - Code21 Create and Dispatch - Annotations.md, 6a.1, 6b.1, 6e–6f | Debounced address suggestions, explicit location confirmation, preserved edit/review and persistent save failure/retry. Companion: _ds/wireframes/screens/Wireframes S6 - Code21 Create and Dispatch.dc.html. |
| _ds/wireframes/annotations/WF-S7 - Code21 Detail and Lifecycle - Annotations.md | Keep request search, selected detail and server-backed lifecycle consistent with the map. |
| _ds/ui_kits/commandmaps/README.md and Dashboard.jsx; _ds/ui_kits/dispatch/README.md and DispatchShell.jsx | Use the CommandMAPS map/panel composition with the dispatcher teal context and restricted actions. |
| CivicMAPS/CivicMaps-preview at e53ec8caa902ced7b38f688a2b249320276545b4 | Read DashboardPage.tsx, Code21CreateForm.tsx and Code21Page.tsx under civicmaps/commandmaps/src/features/. Dashboard uses ZoneMap, a map error boundary and replaceable right-panel intake. Form debounces 300 ms, clears coordinates when address changes, combines server lookup and best-effort Google suggestions, and resolves a selected result to coordinates. |
| docs/plans/dispatch-build/README.md, milestones/M5-shared-spatial-and-travel-routing-context.md, decisions-and-dependencies.md | Existing shared-service programme and D-GIS dependency. |
| docs/assessments/2026-10-24/remediation-plan.md and execution-ledger.md | Separate Q1–Q7 remediation workstream precedes feature implementation; its acceptance is not implied by PR43 merging the assessment/handoff. Reconcile the latest remote implementation receipts before starting code. |

Design conflict resolved by the current user instruction: the older dispatch kit says queue-driven/not map-first, whereas the CommandMAPS kit and S3 provide the map dashboard. For this phase the operational map is primary, with the queue retained as an accessible companion. Record this precedence in the design trace; do not alter archived imports. Reuse canonical tokens, DM Sans, Lucide icons, gold focus indication, monospace SR identifiers and colour/icon/text status encoding. Header identity remains department/role.

Preview is behavioural evidence, not a drop-in implementation. Do not copy its /admin APIs, single-parking assumptions, hardcoded Melbourne bounds, FOOT travel mode, automatic officer assignment, client-authoritative zone fallback or extra lifecycle permissions. Its geocoding failure handling and asynchronous response behaviour need stronger treatment in the rebuild.

## Scope and dependencies

Deliver the dashboard shell, scoped SR map layer, address lookup/resolution, map-picked location, shared draft state and regression evidence. Reuse existing assignment and lifecycle actions without expanding authority.

This is an explicit proposed early spatial/intake slice of M3/M5. It does not declare M2–M7 complete or replace their contracts. Basic location capture need not wait for duty, travel routing or a new offence catalogue; expanded officer eligibility, zones and routing retain their existing dependencies. New staff provisioning remains separately governed by G1/G2.

Before implementation, reconcile accepted Q1–Q7 quality-remediation results and merged code. The recorded ledger has Q1/Q2 accepted, Q3 follow-up pending review, Q4–Q7 outstanding; these are baseline observations, not claims about later concurrent work. Keep this plan branch independent and rebase the eventual implementation onto the verified accepted baseline. Do not take over the remediation branch.

Google Maps and Places API (New) are approved for this rebuild; the existing preview key is approved for protected runtime reuse. Use a restricted browser key only, preserve it outside Git/logs/Empirical, and keep map/provider failure isolated from the dispatch workflow. Q3–Q7 remediation proceeds separately. Live provider qualification still records the actual key restrictions and project settings when verified; this does not block implementation.

No AWS infrastructure is needed for this planning deliverable. If a later approved design needs Regional resources, use the selected ap-southeast-2 Region and the configured CivicMAPS profile under workspace AWS rules.

## Interaction and data contract

Use one controlled LocationSelection state shared by composer and operational map:
- draft address query, selected label, nullable latitude/longitude, source (address or map), resolution state, selection revision, operating-context key and optional provider reference/precision;
- states empty, searching, resolving, confirmed and error; numeric coordinates alone do not imply confirmation;
- normal payload retains existing address/latitude/longitude/notes compatibility. Persist provenance only through an explicitly designed additive migration/API contract.

Address path: debounce approximately 300 ms; expose loading, empty, unavailable and retry states in an accessible combobox. Selecting a suggestion resolves a point, sets both coordinates atomically, shows the pin and “Location confirmed”, and enables review. Free text or a street-level result without a usable point is not confirmed. Ambiguous/street-centre results require map confirmation, with precision described honestly. Any later address edit invalidates the previous confirmation and point.

Map path: explicit “Select location on map” mode prevents ordinary panning or marker selection from changing the draft. A click/tap or keyboard-accessible centre crosshair selects a candidate point; “Use this location” confirms it. Populate coordinates immediately from the chosen point, reverse-resolve a readable label where available, and preserve the exact point when the label resolves. Moving the pin resets confirmation. Cancel restores the previous confirmed location. If reverse lookup fails, allow an explicit location description with the confirmed map point; never invent a street address.

Do not use the dispatcher's browser GPS as the SR position. Operator coordinates are not incident coordinates. Keep latitude/longitude visible as read-only supporting information, not required manual inputs.

Every async lookup carries a revision and context key. Abort superseded calls and reject late responses after another query, map selection, cancellation, unmount, logout or context switch. Clear context-sensitive results and drafts on context change. Do not overwrite a map-selected point with a late address response.

Use WGS84 named latitude/longitude fields internally. Explicitly convert GeoJSON [longitude, latitude] at adapter boundaries. Reject null, non-finite and out-of-range coordinates on the server; do not use truthiness checks that reject valid zero components. Scope datasets and API reads by authorised council/context, independently of map bounds. A viewport filter is not an authorisation boundary.

## Sequenced build packages

| Package | Deliverable | Exit condition |
| --- | --- | --- |
| P1 — Reconcile contracts and readiness | Pin current main, quality dependencies, D-GIS choices, source trace, current request/retry contract and map/query API design. Inspect applicable GIS and dispatch domain READMEs. | Precise file/API inventory and provider configuration decision recorded; ready local work distinguished from provider-dependent work. |
| P2 — Shared spatial adapter | Typed suggest, resolve and reverse interfaces; synthetic fixtures; bounded responses/timeouts; authenticated scoped API facade or approved provider integration; source/precision metadata. | Deterministic success/failure and isolation tests pass. No private provider secrets shipped in browser code. Public map keys, if needed, have approved origin/API restrictions. |
| P3 — Map-centred dashboard | Dedicated map component/error boundary, collapsible operations panel, queue/detail selection synchronisation, SR pins, explicit map capture mode and keyboard equivalent. | Real map renderer interaction works; selecting queue/pin opens the same authorised record. Tile failure leaves queue and intake data intact. |
| P4 — Address/map intake vertical slice | Controlled composer/location state; autocomplete and reverse lookup; automatic coordinates; confirmation/review/edit/retry; selected pin reflects draft. | Both address and map paths create an audited SR without manual coordinate entry; reload returns the exact saved point. |
| P5 — Integrated qualification | API/browser/contract tests, accessibility, narrow/desktop evidence, provider outage/recovery, scope and lost-response regression. | Required checks and fresh independent assessment pass at a pinned candidate; provider-backed acceptance separately evidenced. |
| P6 — Publication and release handoff | Docs, design trace, checkpoints, Empirical, remote SHA, draft PR, hosted CI and independent findings. | Owner has a reviewable, tested candidate and release/rollback instructions. Merge/deployment remain separate actions requiring applicable current authority. |

Suggested implementation seams: extract OperationalMap, DispatchWorkspace, AddressAutocomplete and location-state modules under apps/commandmaps/src/; adapt RequestComposer and main rather than adding more responsibilities to the root component. Keep GIS integration behind a dedicated service module rather than expanding services/api/app.mjs with provider-specific logic. Exact names should follow the post-remediation structure.

For map requests, start with a bounded, explicit layer: current loaded queue results plus selected detail, labelled as such. To claim all authorised work in view, add a server-scoped viewport/cluster endpoint with caps, truncation metadata and independent count semantics. Never imply the first queue page is a complete map. Preserve M1 search/count/cursor semantics and independent detail fetching.

Zones/officer markers appear only when authoritative, permitted data exists. Show source freshness where applicable. Defer live tracking, Code2 duty, ETA/travel routes, SOS, automatic dispatch and expanded lifecycle states to their accepted programme contracts.

## Acceptance matrix

1. Select a known address: label and both coordinates populate; pin, review payload and saved/reloaded record agree.
2. Select an SR location on the map: no numeric typing; confirmed point persists even if reverse lookup supplies a different nearby address centroid.
3. Change address after confirmation: stale coordinates cannot be submitted. Rapid A→B searches, map-after-search and context switches ignore late A results.
4. Empty/no-match/timeout/rate-limit/provider-denial states are visible and retryable. Address failure offers map capture; reverse failure supports description plus point. Map failure leaves queue usable.
5. Test latitude/longitude reversal, invalid numbers, nulls, boundary values and valid zero components. No synthetic default point enters real requests.
6. Review→Edit retains address, point and notes. Save failure remains on review. Lost responses reuse the established idempotency/reconciliation flow and do not duplicate requests.
7. Marker selection, queue selection, search, paging, detail and refresh agree without silently discarding filters. Map completeness/truncation is disclosed.
8. Cross-council/context reads, historical-address suggestions and geometry are denied server-side. Logout/revocation/disabled-pack behaviour and existing officer restrictions/ADMIN exclusion remain intact.
9. Keyboard-only autocomplete and map-centre selection work with labelled controls, focus restoration, Escape and screen-reader announcements. Verify desktop and 390px layout without horizontal overflow.
10. Inspect S3/S4/S6/S7 fidelity with annotated screenshots. Unsupported badges, counts, live indicators and emergency controls must not masquerade as implemented services.
11. Demonstrate the spatial contract with two synthetic package/context fixtures without importing parking-specific business rules.
12. Before release, verify the pinned deployed revision and run both paths in an authorised synthetic Alpha test context. Record exact requests/evidence and cleanup; do not modify customer records for a smoke test.

Use meaningful tests under tests/dispatch/ and appropriate API test directories, wired into actual local/CI discovery. Run npm run check and the existing CommandMAPS, Platform and activation browser suites against disposable synthetic PostgreSQL, plus the new targeted spatial tests. Preserve existing Caddy, token and recovery gates. Record actual test counts, failed/skipped checks, Node/npm versions and provider-vs-fixture boundaries. Do not run application tests merely to claim this documentation change implements anything.

## Delivery and independent assessment

Future implementation follows the programme's Luna Medium builder and fresh-context Astra Low assessment contract. Freeze candidate and raw evidence; supply task/constraints/product files without builder reasoning. Assessment statuses are pending, changes_required, blocked or accepted, never inferred from publication.

This plan's publication status is not functional acceptance. Store the complete versioned plan in Empirical's CivicMAPS-rebuild workspace with SHA-256 and immutable Git permalink; verify by reading it back. Keep a separate receipt for branch/commit/PR and explicit pending audit status.

First next action: reconcile the separate remediation branch's accepted/merged state, then complete P1 and D-GIS configuration discovery. The feature work begins with a single address-to-pin-to-saved-SR vertical slice and the equivalent map-picked path, before adding operational layers.
