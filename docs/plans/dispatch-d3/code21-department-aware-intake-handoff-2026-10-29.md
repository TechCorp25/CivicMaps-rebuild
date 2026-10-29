# CivicMAPS-rebuild — Code21 department-aware Service Request intake

**Owner-directed implementation handoff | Revision 2, 29 October 2026 | Owner requirements recorded / not implemented**

**Target repository:** `TechCorp25/CivicMaps-rebuild`  
**Existing development branch:** `codex/dispatch-b0-revision-20261028`  
**Observed branch head:** `82ba363395f84504032b6ebc729a5beb74fcc4c2` (verify again immediately before editing).  
**Observed baseline relationship:** branch was 6 commits ahead of and 4 commits behind `main` when checked; it has diverged. Do not reset, rebase or force-push without first identifying concurrent work and preserving the existing branch. No merge or deployment is authorised by this handoff.

## 1. Problem statement — verified against source

The attached screenshot shows the CommandMAPS **New service request** modal with address/map, notes, review controls, and no destination-branch or branch-specific case-detail inputs. The pictured map is visually blank; this image alone cannot diagnose whether it is a provider, configuration, rendering or transient-load failure.

The current branch's `apps/commandmaps/src/RequestComposer.tsx` exposes `RequestDraft` with only `address`, `latitude`, `longitude`, and `notes`. `apps/commandmaps/src/main.tsx` posts that draft to `/api/requests`. `services/api/app.mjs` currently validates exactly those four fields in `POST /api/requests`, and inserts each new request using the authenticated actor's `branch_id`. `services/api/entitlements.mjs` gates the operational `requests.create` capability, and existing API writes use CSRF, transaction-scoped context, idempotency and audit protections. **Therefore UI additions alone cannot implement the requested functionality or persist it.**

The earlier `CivicMAPS/CivicMaps-preview` implementation at `civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx` contains parking-allegation, vehicle and address selection concepts, including `/admin/code21/zone-resolve` returning a resolved service zone and suggested officer with a `manualOfficer` flag to preserve the dispatcher’s choice. It is a **parking-only implementation reference**, not a cross-department permissions, catalogue or persistence authority. Preserve the rebuild architecture and reuse selected interaction patterns, not its obsolete global roles, client-authoritative zones or unapproved offence catalogues.

## 2. Owner requirements (from this task)

- A dispatch operator must be able to choose the **destination branch/department** for a new Service Request (Code21).
- Selecting a branch changes the structured request form and relevant request-type selector; do not display parking-specific requirements for another department.
- Different fields have different requiredness; optional unknown details can be supplied in free-text contextual notes where known.
- **Parking** minimum: verified location, vehicle colour, alleged offence. Vehicle make, model, registration/plate and further characteristics are optional, using appropriate dropdowns or search-select controls where possible.
- **Animal Management** minimum: verified location, reason/request type, animal type. Breed, size, colour and further characteristics are optional.
- **Local Laws**: request-type selector including noise, permits, building-related complaints and other authorised service types; render a distinct form for each type. Noise form includes reported time picker, zone type such as residential/commercial, and selectable noise type.
- **Waste Management & Cleaning**: provide an appropriate branch-specific service-type selector and distinct contextual details rather than reusing the Parking form. Exact service options and mandatory fields beyond common location are to be confirmed against the council's approved service catalogue.
- Both dispatcher-originated and future civilian/community-originated reports should support additional free-text context where optional structured information is unavailable. Public intake must have its **own trust and permission boundary**, not inherit dispatcher access.
- **New explicit owner clarification — automatic field-officer allocation is required by default.** The SR’s confirmed location maps to the receiving department’s authoritative service-area coverage. A field officer **signed on for operational duty** and allocated that area should be automatically assigned, subject to current eligibility and permissions. Application login alone does not constitute sign-on/Code2 availability.
- **Manual assignment and reassignment remain essential.** An authorised dispatcher must be able to replace the automatic allocation where appropriate, for example if the assigned officer has insufficient time because of other allocated duties. Show the proposed/current officer and the area match. Preserve the original allocation and every change as versioned, attributable audit events, with a reason for reassignment. Do not silently overwrite a deliberate manual selection as the map or zone refreshes.
- Where no currently eligible officer can be determined unambiguously, **create and retain the SR unassigned**, clearly flag the dispatch exception, and support deliberate retry/reassignment; do not fabricate availability, assign a signed-off officer, silently cross another branch or choose an arbitrary candidate.

**Business-rule interpretation:** The listed Parking and Animal Management minima are owner-stated required fields. For Local Laws and Waste/Cleaning, the user provided examples and categories, not a full authoritative requiredness schedule; do not silently turn every proposed attribute into a required field. Use safe initial field definitions pending per-council catalogue ratification.

## 3. Required behaviour and UI

### Composer sequence

1. **Destination branch/department** — labelled selection from server-issued, authorised branch choices. Clearly separate the request's receiving branch from the dispatcher's current operating context. A dispatcher lacking cross-branch creation permission must not be offered unauthorised destinations. Disabled or unsupported branch/service combinations are not selectable.
2. **Request/service type** — choices filtered to the selected branch's supported, enabled service categories. If the branch changes, clear inapplicable form fields, warn if entered values would be discarded, and revalidate. Preserve shared address/location and notes where safe.
3. **Reported location** — retain existing Google Places (New) search and explicit map-pin selection with visible loading, unavailable, retry and confirmed-coordinate states. Do not invent coordinates from typed text or treat a blank map as a valid resolved location. Allow an accessible alternative confirmed-location workflow if the map provider is unavailable and such an option is backed by validated coordinates.
4. **Branch-specific details** — render schema-selected controls with clear labels, `Required`/`Optional` indicators, examples and field-level errors. Dropdown selectors should support accessible keyboard and mobile use, with `Other`/`Unknown` only where allowed by policy. Searchable suggestions must never silently convert a typed but unrecognised value to an official catalogue entry.
5. **Additional details** — common optional multiline free-text context, max length, privacy guidance and no forced duplicative re-entry. Unknown optional data must not block saving. Common location plus required category fields must be provided.
6. **Review** — show destination branch, request type, location/address + coordinates, required and supplied optional fields, and notes; clearly distinguish *reported/alleged* descriptions from verified field outcomes. Also show the **server-derived service area, suggested eligible officer, duty/eligibility freshness and whether the officer is automatically selected or manually chosen**; show a clear `Awaiting assignment` state if no one qualifies. Edit retains data. Preview is informative; the server must re-evaluate area coverage and officer eligibility when committing. A successful automatic allocation transitions the SR using the existing authoritative `RECEIVED` → `DISPATCHED` semantics, without inventing a new lifecycle state. An unallocated SR remains `RECEIVED`.
7. **Reassign / override** — let permitted dispatch roles change the assigned officer from the SR detail, with a reason such as workload/time constraints, shift change, unavailability or another documented explanation. Show only eligible alternatives (or explicit, separately authorised exceptional overrides). Reassignment cannot change the owning council, receiving branch or historic incident details, nor erase the preceding officer/history. Preserve manual selection during non-material zone refresh; if location or branch changes materially, warn and require renewed eligibility/authorisation. Existing live lifecycle transitions currently permit `assign` only from `RECEIVED` or `DISPATCHED`; reassignment after acknowledgement or attendance requires a separately designed and approved handover policy that preserves progress/evidence, not an unreviewed status reset.
8. **Recovery** — keep existing uncertain-write reconciliation, same-payload idempotency replay, CSRF protections, actor/context invalidation, responsive modal, focus and Escape handling. Disable duplicate submission. Branch or form changes after an uncertain submission require explicit reconciliation, never blind replay under a changed payload.

### Field groups

| Branch | Request type | Required by current owner direction | Optional context / proposed fields |
| --- | --- | --- | --- |
| Parking | Parking complaint / alleged offence | Confirmed location, vehicle colour, alleged offence | Make, model, body type, plate/registration, vehicle characteristics, direction of travel, observation time, notes |
| Animal Management | Reason type (e.g. wandering, injured, aggressive, nuisance — **catalogue to be authorised**) | Confirmed location, reason type, animal type | Breed, size, colour, approximate number, identifying details, observed time, notes |
| Local Laws | Noise | Confirmed location and selected request type; other mandatory inputs **not yet owner-defined** | Time reported/occurred, residential/commercial/mixed/unknown zone classification, noise source/type (music, machinery, construction etc. subject to catalogue), recurrence, notes |
| Local Laws | Permits / building and other categories | Confirmed location and selected request type; subcategory requirements to be approved | Permit reference if known; activity/structure description; observed time; notes; distinct service-type form |
| Waste Management & Cleaning | Illegal dumping, overflowing bin, litter, cleaning and other **illustrative only** types | Confirmed location; other mandatory fields await branch catalogue | Waste/material type, size/quantity, hazard indicator, incident time, access instructions, notes |

Do not turn the illustrative values into a statutory offence schedule, a licence to enforce or a universal council service taxonomy. Vehicle **colour** is mandatory for the owner-stated Parking intake; do not mark make/model/plate as mandatory or require a fictitious registration for unidentified vehicles.

## 4. Backend contract — required to make the feature real

The existing M3 proposal (`docs/plans/dispatch-build/milestones/M3-package-aware-parking-intake.md`) describes an additive server-validated `packageData: { schemaVersion, fields }` payload derived from authenticated entitlements, with immutable captured package metadata. Its then-current rule forbids client-submitted branch identifiers. **The new owner requirement to select a destination branch creates a deliberate contract change that must be reconciled, reviewed and tested, not bypassed by forging context.**

### Proposed API / schema direction (not yet approved wire format)

- Add a read endpoint for **authorised intake destinations**, with each destination's safe display label, authorised service categories, schema/version and capability availability. It must evaluate the authenticated dispatcher and council security grants on the server; do not expose every council branch in a client constant.
- Accept a `destinationBranchId` as a *requested routing destination only* after server-side revalidation of the council, branch, role, effective grants, enabled service package, and permitted service type. Do not accept tenant, council, jurisdiction, operating context or package identity as client-authoritative claims. If route permissions are absent, offer only the current branch. Direct cross-council routing is prohibited.
- Preserve distinct audit provenance for the actor/origin context and receiving branch. For same-council cross-branch intake, determine and implement a reviewed handoff/visibility model consistent with branch-scoped RLS; merely changing `service_requests.branch_id` during a transaction still scoped to the originating branch will not be a complete solution.
- Use a static or reviewed server-controlled registry of department/request-type validators and schema versions; no client-uploaded executable schemas. Validate requiredness, enum membership, Unicode/text limits, time semantics, allowed optional fields and closed-object payloads. The UI is advisory; **server validation is authoritative**.
- Persist receiving branch, source/origin context, captured package/service type/schema version, structured details **and any confirmed initial officer allocation plus its service-area provenance** atomically in a validated creation/assignment operation, with immutable audit events using an additive, versioned migration. Keep existing rows readable with null historical package fields; never backfill fabricated categories. Preserve `RECEIVED`, the existing five-state lifecycle, existing numeric identifiers and all assignment/history semantics.
- Reject unauthorised branch targets (`403` or non-disclosing equivalent), unknown fields (`400`), unsupported/stale schema version (`409`), revoked/disabled package (`403`), duplicate key with changed request payload (`409`), and invalid location coordinates (`400`). Avoid leaking destination details across branches/councils through lookup, error or count endpoints.
- Do not bypass current `requests.create` entitlement, role checks, authentication/session/CSRF, transaction-local RLS, request version, idempotency or established auditing.
- Treat allegation classification and any parking offence codes as jurisdiction- and council-specific catalogues with provenance/version, not a single hard-coded Victorian schedule across all councils. “Alleged offence” is not an officer-confirmed enforcement outcome.

### Automatic allocation, duty and reassignment contract — owner-directed revision

This subsection supersedes the earlier "assignment only after creation" and "no auto-assignment" scope language. The owner has now explicitly directed **automatic location/service-area-based allocation with manual reassignment**. The older M4 plan currently says *recommend rather than automatically dispatch*; reconcile that plan and its D-ROUTING/D-DUTY approvals before shipping, rather than treating the historical M4 wording as permanent authority to refuse this new requirement.

1. **Authoritative location-to-area resolution.** Resolve the validated SR point to a receiving-branch service-area identifier and active, versioned coverage geometry **server-side**. Support deterministic boundary and overlap handling; when out of coverage, ambiguous or data unavailable, do not silently fall back to an unrelated area. Do not treat a browser polygon, preview `PATROL_ZONES` or Google geocoder as a trusted operational assignment policy.
2. **Duty eligibility.** Read the shared server-managed Code2/duty registry: an officer must be signed on for duty, active, explicitly allocated that service area and authorised to perform this branch/service type. Check current unavailability, session/roster validity and any approved duty state. **Being logged in, appearing in an officer list or owning an account is not sufficient.** A missing/unimplemented signed-on feed is an explicit blocker to *live* automatic assignment, not permission to simulate it.
3. **Selection.** Where exactly one eligible officer matches, automatically allocate that officer. Where multiple officers match, apply only a separately approved and deterministic priority/workload policy; absent one, present eligible officers for authorised dispatcher selection without random assignment. Where none match, keep the SR as `RECEIVED` and `Unassigned / needs dispatch review`, preserve it in the queue and provide a retry/reallocation route.
4. **Commit-time validation.** Never trust a UI-supplied `officerId`, zone ID or cached recommendation as proof of eligibility. In a concurrency-safe transaction, revalidate source request/location, branch scope, duty, service area, grants, officer activity and assignment policy. Create the request and its initial assignment consistently with the existing five statuses, optimistic versioning, idempotency key and immutable audit. If eligibility changes between preview and submit, do not announce that the request was assigned. Preserve the request safely in an authorised unassigned state and surface the exception, subject to transaction/error-recovery design.
5. **Manual reassignment.** Expose an explicit `Change assigned officer` action to authorised dispatch users. Provide a server-validated eligible-recipient list, current officer, request status, area/coverage context and a **required reason** for replacing an existing officer. Common reasons include competing assigned duties or insufficient time to complete the SR. Successful reassignment records from-officer/to-officer, actor, time, reason, area and decision basis, preserving the previous assignee in immutable history. Enforce version/precondition checks and prevent simultaneous dispatchers overwriting one another. Normal reassignment chooses another officer eligible for the request; any out-of-area or cross-branch exception requires independently approved elevated authority and explicit justification. Cross-council reassignment is prohibited.
6. **Assignment vs lifecycle.** Existing `domains/service-requests-dispatch/lifecycle.mjs` permits `assign` only from `RECEIVED`/`DISPATCHED` and returns `DISPATCHED`. Do not treat assignment as acknowledgement or attendance. If the request is already `ACKNOWLEDGED` or `ATTENDED`, a separately authorised transfer/handover mechanism must preserve in-progress work and officer acknowledgements. Do not silently reset it to `DISPATCHED` or discard records. This is a bounded unresolved follow-up, not an excuse to block creation/initial allocation.
7. **Availability drift.** On sign-off, leave, revoked area, loss of availability or capacity constraints, surface cases awaiting attention and a controlled reassignment path. Do not auto-steal active work or silently move an officer's SRs merely because their presence changes; approved duty/sign-off policy must resolve who is responsible for outstanding work. Support explicit refresh/retry and visible pending/failed outcomes.
8. **Reused preview concepts, not preview trust.** The old `Code21CreateForm.tsx` calls `/admin/code21/zone-resolve` and receives a `zone`, `officer` and `availableOfficers`; its `manualOfficer` flag avoids overwriting the operator’s selection. Reuse the behavioural intent, but build on server-authenticated area/eligibility contracts, not its client fallback or hard-coded city geography.


### Community/customer submissions

A public-facing submission path is future-compatible with the same validated request-type schema but **must use separate authenticated/anonymous admission policy, rate limits and abuse controls, privacy/consent rules, identity handling, status disclosure, and safe triage**, never `/api/requests` with the privileges of a signed-in dispatcher. No public endpoint or external notification is authorised merely by this feature brief.

## 5. Required implementation work packages

**A. Current branch preservation.** Inspect `git status`, current remote head, branch ancestry, in-progress changes, and applicable `_ds`, `AGENTS.md`, D1/B0 and M3/M4 plans. Work in the existing checkout/branch as directed by its live owner; do not create a worktree or reset parallel Codex work unnecessarily. Treat the currently diverged `main` as a reconciliation task, not grounds to overwrite either side.

**B. Contract and governance reconciliation.** Pin effective owner input rules. Update *proposed* M3 intake and branch-routing contract to explicitly resolve `destinationBranchId` authority and source-vs-destination provenance. Honour Q1/Q2 council identity and cross-branch grants, existing G1/pack entitlements and server-scoped RLS. Do not claim the user has approved unspecified catalogues, public intake, permissions or live routing.

**C. Backend vertical slice.** Introduce validated Parking and Animal Management payload types behind server-enabled synthetic department fixtures, additive persistence, server-derived branch targeting, authoritative zone/duty eligibility resolution, safe automatic initial allocation and audit provenance. Reconcile the M2 Code2 dependency before treating live sign-on availability as implemented. Keep legacy client compatibility only under a deliberately documented window; do not allow legacy mode to bypass new mandatory fields once introduced.

**D. Frontend vertical slice.** Make `RequestComposer.tsx` present server-authorised destination choices, dynamic type/field sections, structured review, the recommended/confirmed officer or unassigned exception, and safe draft recovery. Provide a permission-gated manual assignment/reassignment control, with reason and audit history, in the authorised SR detail. Extend caller types, selected detail and read-only history to display stored typed fields without losing current queue/map behaviour. Keep responsive modal and accessible labelling/focus states aligned with `_ds`.

**E. Additional types.** Add Local Laws (at least Noise, Permits, Building categories with distinct form definitions) and Waste Management/Cleaning options using versioned branch-level catalogues. Where mandatory field decisions are not yet approved, support optional information and do not fabricate statutory enforcement classifications.

**F. Synthetic qualification.** Tests must cover both frontend and backend, at least the matrix below. Use dedicated disposable local PostgreSQL; do not reseed or migrate live resources or use production credentials.

## 6. Acceptance and regression matrix

1. Parking request with valid confirmed location, colour and alleged offence succeeds; empty make, model and plate are accepted. Missing colour or alleged offence is rejected by both form and API. Free-text notes do not bypass required fields.
2. Animal Management with location, reason type and animal type succeeds; breed/size/colour empty accepted; missing reason or animal type rejected.
3. Noise type renders time picker, zone-type and noise-type selectors; switching to permits changes form and removes stale noise values from submission. A missing optional time is handled explicitly and must not be populated with current time by default.
4. Waste/Cleaning uses its own request type and safe optional form; parking/animal fields never leak into it.
5. Changing destination branch recomputes allowed types and validation and warns before discarding branch-specific work. Keyboard, focus, screen reader and narrow/mobile views pass.
6. Dispatcher with only one authorised branch can select only that branch. Server rejects forged cross-branch `destinationBranchId` and all cross-council submissions. A council-authorised cross-branch target is auditable, saved in the destination's scope and cannot leak reads to the origin branch without an explicit continuing permission.
7. Expired/revoked grant, disabled package, changed context or stale schema causes a truthful error, not a misleading created notification.
8. Old records with no structured package fields remain readable. Captured classifications survive later branch catalogue updates. Assignment, status and audit remain intact.
9. Duplicate-submit and lost-response/retry create exactly one Service Request; same idempotency key with a changed branch, form or notes fails safely. Cancellation, logout and context switching invalidate pending work.
10. Location search/map failure shows an actionable state and does not manufacture coordinates. Main dashboard queue retains its independent unavailable/retry behaviour. No production Places qualification is inferred from synthetic browser tests.
11. API rejects unknown package fields, invalid/oversize text, unsupported enum/options, stale versions and attempts to submit caller-controlled ownership or package grants.
12. With one signed-on and area-allocated, service-authorised officer, a valid request automatically assigns that officer and records `DISPATCHED`, selected area, officer identity and audit evidence. Logging in without signing on to duty must **not** qualify an officer. Wrong service area, branch, suspended/revoked grants and signed-off staff do not qualify.
13. Multiple valid officers are resolved only by an approved deterministic policy; absent a policy, show alternatives for dispatch choice. An area miss, boundary ambiguity, stale geometry, missing duty feed or no eligible officer leaves the request safely `RECEIVED`/unassigned with an actionable queue exception; creation is not lost and a fictitious assignment is never shown.
14. Dispatcher may change the assigned officer to a separately eligible replacement due to time constraints/competing workload. The action requires appropriate entitlement and a reason, rejects stale request version or changed recipient eligibility, keeps the same SR identifier and prior assignment history, and shows the new server-confirmed assignee. No unauthorised out-of-area, branch or council crossing.
15. Manual selection is not reset by harmless map/zone refresh; material location/branch change invalidates stale assignment and requires explicit review. If the officer signs off, their work is not silently redistributed; a separately approved outstanding-work escalation policy is enforced or the request is flagged.
16. Competing dispatchers and a simultaneous duty/area change cannot both commit conflicting assignments. Retried creation or reassignment with the same idempotency key and payload does not duplicate the request or audit allocation. Server response uncertainty demands reconciliation, not a blind new assignment.
17. Existing five-state lifecycle remains authoritative. `ACKNOWLEDGED`/`ATTENDED` transfers are blocked until a preserving-handover design and policy are independently approved; they must never lose completed officer activity.
18. Execute `npm run check`, relevant Node integration tests and Playwright browser checks on the exact frozen candidate, record counts, screenshots and any environment limitations. Independent review must evaluate a pinned SHA; no merge/deploy until the applicable separate authority gate.

## 7. Non-goals / scope controls

No blanket expansion to public portal production, **unapproved new officer duty states or work-stealing/capacity algorithm**, cross-council identity sharing, infringement issuance, statutory offence findings, new eleven-state lifecycle, field-app notifications, GIS licence/billing acceptance or production deployment. **Automatic initial assignment based on signed-on duty and authoritative service area, plus authorised manual reassignment, are now explicit in-scope requirements**; their prerequisites must be implemented and policy-qualified rather than simulated. Do not add mocked backend success under a finished-looking UI.

## 8. Evidence and reference paths

- `apps/commandmaps/src/RequestComposer.tsx`
- `apps/commandmaps/src/main.tsx`
- `apps/commandmaps/src/GoogleLocationPicker.tsx`
- `services/api/app.mjs`
- `services/api/entitlements.mjs`
- `docs/plans/dispatch-build/shared-service-contracts.md`
- `docs/plans/dispatch-build/milestones/M3-package-aware-parking-intake.md`
- `docs/plans/dispatch-build/milestones/M2-shared-code2-and-availability.md`
- `docs/plans/dispatch-build/milestones/M4-shared-assignment-and-dispatch-routing.md`
- `domains/service-requests-dispatch/lifecycle.mjs`
- `docs/plans/dispatch-b0/reconciliation.md`
- `docs/plans/dispatch-d1/baseline.md`
- `_ds/` authoritative design system and accessible interaction patterns
- Preview reference: `CivicMAPS/CivicMaps-preview/civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx`

**Delivery expectation:** source, server validation, additive migration, authoritative area/duty eligibility and auto-allocation, explicit manual reassignment and audited handovers within authorised status boundaries, integration/browser tests, exact commit SHA, permission/isolation evidence, desktop/narrow screenshots, documented unresolved catalogue, duty and routing decisions, and a draft PR for owner/independent review. Do not present a static UI mock or a proposed data model as a working Code21 system.