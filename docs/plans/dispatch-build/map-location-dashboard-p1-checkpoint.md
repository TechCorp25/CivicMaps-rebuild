# Map-centred dispatch dashboard — P1 readiness checkpoint

Status: P1 source/API contract discovery complete; provider direction and a concrete configuration proposal recorded. P1 readiness is **partial**: actual Google project/billing configuration, egress restrictions, owner cost approval, and quality-remediation reconciliation remain pending. Implementation remains blocked.

Plan: [map-location-dashboard-plan.md](map-location-dashboard-plan.md), v1.0.0, pinned at commit `b40ed560f5129483d0e2690bba0ffd5141d2b84a` (SHA-256 is retained in its publication branch and Empirical memory `6adfbb569b18cc7b614948db`).

## Baseline and dependency reconciliation

- Verified remote `main` and local source base: `d34cf9fd692fabc24d17ff1a9657be9b724d620f`. P1 work is isolated from the pre-existing `work` branch in `codex/civicmaps-dispatch-map-location-p1`.
- Separate quality-remediation ledger at this base records Q1 and Q2 accepted; Q3 corrections await fresh independent review; Q4–Q7 are outstanding. PR #43 published assessment/handoff, not completion of the remediation package. Do not copy, rebase, or take over that work. No feature source code is eligible until the combined accepted remediation baseline has been reconciled and the repository's stated gate is met.
- User selected Google Maps as the provider direction, subject to a concrete configuration and cost review. This is not approval to create a key, enable billing, send operational/customer locations, or make live provider calls. Provider configuration is absent in this source baseline. The proposed API/key split and limits below make the review concrete; they are not configured controls.
- D-GIS remains open for licensing/retention terms, permitted disclosure, key restriction design, budgets/quotas, and coverage/precision. Provider-backed acceptance remains blocked until those are resolved. Deterministic synthetic contracts and failure states may proceed after the remediation gate.

## P1 source and API inventory

| Area | Current source evidence | P1 contract consequence |
| --- | --- | --- |
| Intake UI | `apps/commandmaps/src/RequestComposer.tsx` starts coordinates at zero and renders required manual numeric inputs; form preparation reads those inputs. | Replace manual entry with one controlled, nullable, explicitly confirmed location selection. Never submit zero as a fallback. |
| Dashboard and queue | `apps/commandmaps/src/main.tsx` owns the scoped queue/detail flow, status/count/search/cursor loading, and create/retry path. Queue requests use 100-row keyset pages; selection/detail and uncertain-write reconciliation are already present. | Integrate map and panel around these reads. A first page is not a complete map. Do not replace the queue flow or bypass existing selection/retry. |
| Create API | `services/api/app.mjs`, `POST /api/requests`, accepts address/latitude/longitude/notes, checks finite/range-valid values, requires `Idempotency-Key`, binds the authenticated actor/context, and writes an audit event transactionally. | Preserve payload compatibility, scope, audit, and same-key uncertain-write recovery. Keep coordinate validity checks server-side. |
| Persistence | `services/api/migrations/001-foundation.sql` makes latitude/longitude non-null and range-checked. | No schema change is needed for the basic point path. Provenance persistence requires a separately designed additive migration/API contract. |
| GIS domain | `domains/gis-operations/README.md` calls the package a foundation placeholder and prohibits provider/framework/runtime/database/deployment selection before an approved Section 03 ADR. Its package scripts call `scripts/stub-task.mjs`. | Do not represent the GIS domain or its placeholder scripts as an executable adapter. Resolve the applicable ADR before creating provider code. |
| Dispatch domain | `domains/service-requests-dispatch/README.md` says active implementation is in the API and CommandMAPS; it requires scoped identity, lifecycle, versioning, audit, and idempotency preservation. | Use existing ownership seams; no separate dispatch service is present. |
| Configuration | Root `.env.example` has no map/geocoding variables. `apps/commandmaps/package.json` has React, React DOM and Lucide only; no map renderer or Google Maps integration is installed. | No live provider is configured or evidenced in CivicMaps-rebuild. Do not add credential values to examples or browser bundles. |
| Design authority | S3 dashboard annotation specifies full map with collapsible right operations panel and isolated map errors; S4 governs spatial presentation; S6 governs address suggestions and explicit location confirmation; S7 governs detail/lifecycle consistency. | Map is primary, queue is accessible companion. A map failure must leave queue/intake usable. Use canonical tokens and do not display unsupported live/zone/officer claims. |
| Existing spatial contract | `docs/plans/dispatch-build/shared-service-contracts.md` separates address search, coordinate resolution, zone resolution and travel directions; source/freshness and unavailable results belong in adapters. | Keep these operations distinct. Zone/travel routing and live tracking do not follow from address capture. |

## Frozen location interaction and API boundary

Use a shared `LocationSelection` draft with a user-entered address query, selected display label, nullable latitude and longitude, source (`address` or `map`), resolution state, monotonically increasing selection revision, and captured operating-context key. Numeric values do not imply confirmation. Keep provider reference and precision in memory unless an additive persistence contract is approved.

The address flow debounces suggestions, exposes loading/no-match/unavailable/retry states, resolves a selected suggestion, and atomically sets the display label and point. Any address edit invalidates confirmation and coordinates. A street-centre or ambiguous result requires explicit map confirmation. The map flow has an explicit selection mode, candidate point, confirm/cancel controls, and keyboard-accessible equivalent; ordinary panning cannot change intake. Reverse lookup may add a label but must not move the selected point. If reverse lookup fails, an explicit user description may accompany the confirmed map point.

Every async operation captures revision and authorised context. Abort superseded work and ignore late results after newer input, map selection, cancellation, unmount, logout, or context change. Clear context-dependent suggestions on context change. Do not use browser GPS as the reported incident location. Use named WGS84 latitude/longitude internally and explicitly convert GeoJSON longitude/latitude at the adapter boundary. Preserve valid zero components; reject null, non-finite, and out-of-range values server-side.

Continue the current `POST /api/requests` payload for basic creation. A new map query/viewport endpoint, if needed to show more than currently loaded queue items plus selected detail, must be separately scoped server-side and return explicit cap/truncation metadata and count semantics. Viewport bounds are never an authorisation boundary. Use the existing idempotency-key reconciliation on uncertain saves.

## Google Maps configuration and cost review

Provider direction: Google Maps, selected by the user for this phase, conditional on the review below. Read-only inspection of CivicMAPS/CivicMaps-preview at `e53ec8caa902ced7b38f688a2b249320276545b4` found this non-secret integration shape:

- `civicmaps/commandmaps/.env.example` names `VITE_GOOGLE_MAPS_API_KEY` with an empty value. `civicmaps/commandmaps/vite.config.ts` injects only that explicitly browser-scoped variable and warns that a separate `GOOGLE_API_KEY` must never fall through into the public bundle. Reuse the variable name and separation rule. The user authorised reuse of the existing preview key via protected runtime configuration; never copy or print its value into source, Git, public environment examples, logs, or Empirical.
- `civicmaps/commandmaps/package.json` declares `@vis.gl/react-google-maps` as `^1.8.1`; `DashboardPage.tsx` wraps the dashboard with `APIProvider` and requests the `places` and `geocoding` libraries. `ZoneMap.tsx` uses the Maps JavaScript Geocoder for reverse lookup and contains public map ID `aadaf0ce47fb616839a32e81`. No explicit Maps API version override was found; the loader uses the provider default. Reuse the library/API shape as a migration reference, but only reuse the map ID after confirming that it belongs to the intended Google project and is suitable for the rebuild.
- `Code21CreateForm.tsx` uses legacy Maps JavaScript `AutocompleteService` predictions and `Geocoder` place-ID resolution. Preserve the user's plan improvements (revision/context fencing, atomic confirmation, exact map point, bounded failure) rather than copying its async behaviour or assuming Places Autocomplete (New) pricing.
- The user explicitly confirmed that the existing preview Maps key remains usable and approved for this rebuild when delivered through protected runtime configuration. This authorises reuse of that specific key subject to verified origin/API restrictions and the pending cost/configuration review. When eligible, provision it through protected runtime configuration; never copy or print its value into CivicMaps-rebuild source, Git, public environment examples, logs, or Empirical. Preview source mentions referrer restrictions and key separation but does not establish the live key's actual API/referrer restrictions, Google project owner, billing state, API version, or quota settings.

Proposed rebuild configuration, pending restriction verification: retain the `VITE_GOOGLE_MAPS_API_KEY` name and `@vis.gl/react-google-maps` loader pattern; deliver the user-approved existing key through protected runtime configuration only. Verify that its browser restrictions allow exactly `https://alpha-commandmaps.dev.civicmaps.com.au/*` and `http://127.0.0.1:5173/*`, and that its API restrictions enable Maps JavaScript API plus only the exact Places/Geocoding services required by the accepted interaction. Add localhost only if the supported local app is actually configured to use it. Do not add server-side provider credentials or endpoints unless the accepted privacy/configuration review calls for them; any later server key must be separate, server-only, and restricted to verified egress IPs. Reuse preview's map ID only after confirming it belongs to the intended Google project and is suitable for the rebuild.

Recommended initial operating thresholds: 50 map initialisations/day, 200 autocomplete requests/day, 50 forward geocode resolutions/day, and 25 reverse geocode requests/day. At 31 days, autocomplete would be 6,200 requests and forward plus reverse geocoding 2,325 requests, below each 10,000 monthly allowance. With preview's direct browser integration, daily application thresholds cannot be enforced project-wide unless calls are mediated by a new scoped backend; record them as telemetry alerts, keep one map instance per dashboard session, and configure the lowest suitable Google per-minute quotas if available. Do not describe telemetry alerts as hard spend caps. Review synthetic usage and approve any server proxy before adding it; stop provider calls at the approved cost/usage threshold.

No Google project, billing profile, key restriction, quota, egress IP, or customer data access was inspected or changed in this P1 checkpoint. The user-authorised key has not been installed in this task's protected runtime configuration, and no live call was made. Treat all cost figures as estimates based on the published [Google Maps Platform pricing](https://developers.google.com/maps/billing-and-pricing/pricing) and [Places session pricing](https://developers.google.com/maps/documentation/places/web-service/session-pricing), retrieved 27 October 2026; recheck before any billing or key action.

For the selected preview-compatible legacy path, the reviewed first-tier allowance is 10,000 monthly billable events each for Dynamic Maps, Autocomplete Requests, and Geocoding. Published first-tier rates are respectively USD $7, $2.83, and $5 per 1,000 events beyond each SKU allowance. Autocomplete and Geocoding are per-request for this estimate; do not apply Places Autocomplete (New) session discounts or Place Details Essentials pricing to the selected flow.

Illustrative usage, excluding tax, foreign exchange, other project use, and SKUs/features not listed:

| Monthly billable events | Estimated listed usage |
| --- | ---: |
| 20,000 Dynamic Maps loads | 10,000 × $7 / 1,000 = $70.00 |
| 40,000 Autocomplete requests | 30,000 × $2.83 / 1,000 = $84.90 |
| 10,000 forward place-ID Geocoding requests plus 5,000 reverse Geocoding requests | 15,000 total; 5,000 × $5 / 1,000 = $25.00 |
| **Total** | **$179.90 USD/month** |

At 2,000 map loads, 8,000 autocomplete requests, and 3,000 total forward/reverse geocoding requests, the listed-SKU estimate is $0 assuming no other usage consumes those per-SKU allowances. This is not a free-tier guarantee: allowances are per billing account/project as applicable and all usage must be checked against actual project usage and current terms.

Before live calls, record the user-approved existing key's intended project/billing owner, exact APIs, verified referrer restrictions, whether preview's map ID is reusable, field/session behaviour, retention/licensing and permitted disclosure, geographic coverage/precision, monthly request assumptions, available per-SKU quotas, application rate limits, budget alerts, and stop procedure. Budget alerts do not enforce a hard spend cap. Google Cloud's actual project restrictions, quota controls, and billing usage must be inspected by the project owner; they were not available in source and remain unknown. The user's key approval does not approve provider disclosure of real personal/customer location data. Never place private credentials in `.env.example`, source, client bundles, logs, or audit evidence.

## Readiness decisions and immediate next actions

Ready now: source/API trace, recovered preview configuration shape (with credential values explicitly excluded), explicit user approval to use the existing key through protected runtime configuration, proposed origins/usage ceilings, cost scenarios, deterministic adapter contract design, nullable confirmed-location state design, map failure isolation design, and synthetic-only test planning. Not ready: code implementation before the remediation gate; live Maps API use before key restrictions/cost review; key installation or billing changes; actual Google project/key restrictions or quota verification; customer-location disclosure; persistent provider provenance; zones/travel routes/live officer markers. P1 remains partial until the project owner reviews actual billing/project settings and verifies the key configuration and cost ceiling.

Next sequence:

1. Reconcile exact current remote remediation receipts and accepted Q1–Q7 state with its owner before feature implementation. The recorded ledger is only a baseline snapshot.
2. Have the project owner complete Google configuration and cost review against actual intended usage, project settings, restrictions, quotas, and current pricing. The proposed browser origins and API split above are the review baseline; actual key/billing changes remain separate from this P1 contract.
3. After the remediation gate, implement deterministic adapter/failure contracts first; then add an approved renderer/provider path and the address-to-pin-to-saved-SR slice.
4. Freeze the implementation candidate and raw checks for a fresh GPT-6 Astra Low assessment. This P1 checkpoint does not constitute feature acceptance or provider-backed acceptance.

## Independent audit packet

Audit only the frozen P1 product and its stated source inputs. Do not use builder conversation or unpublished reasoning.

- Requirements: `docs/plans/dispatch-build/map-location-dashboard-plan.md` at `b40ed560f5129483d0e2690bba0ffd5141d2b84a`.
- Resulting product: `docs/plans/dispatch-build/map-location-dashboard-p1-checkpoint.md` at the candidate commit for this branch.
- Remediation dependency source: `docs/assessments/2026-10-24/execution-ledger.md` at base `d34cf9fd692fabc24d17ff1a9657be9b724d620f`.
- Provider configuration/dependency sources: `domains/gis-operations/README.md`, `domains/service-requests-dispatch/README.md`, `apps/commandmaps/src/RequestComposer.tsx`, `apps/commandmaps/src/main.tsx`, `services/api/app.mjs`, `services/api/migrations/001-foundation.sql`, `docs/plans/dispatch-build/shared-service-contracts.md`, and preview files pinned to `e53ec8caa902ced7b38f688a2b249320276545b4`: `civicmaps/commandmaps/.env.example`, `civicmaps/commandmaps/vite.config.ts`, `civicmaps/commandmaps/package.json`, `civicmaps/commandmaps/src/features/dashboard/DashboardPage.tsx`, `civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx`, `civicmaps/commandmaps/src/components/ZoneMap.tsx`, plus the two linked Google pricing documents as retrieved 27 October 2026. Preview credential values are intentionally excluded.

Documentation change only; no application tests or live provider calls were run.
