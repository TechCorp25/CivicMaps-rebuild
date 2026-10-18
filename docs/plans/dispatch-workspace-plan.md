# Dispatch workspace and workflow fidelity

Owner-selected functional phase, 19 October 2026 (Australia/Melbourne). Branch: `codex/civicmaps-dispatch-workspace`; base: `92b3eea8b8ecfd0505afb6d62d60a001903db161`. Governance runs in its own session/branch; this phase has no blanket governance dependency.

## Goal and boundaries

Make the existing dispatcher request lifecycle usable through the supplied design system: teal dispatch header, filterable tabular queue, right-hand detail, and keyboard-accessible create/review/confirm flow. Preserve existing API, capabilities, context, version/idempotency checks and retained-review behaviour. Do not expand role grants or implement suspension, personnel provisioning, GIS/address services, offence catalogues, infringement outcomes, communications or the remaining lifecycle states.

This is a bounded functional precursor to F11, not completion of F09–F12. The governance session owns G04 API fixes, including F-002 queue completeness. This UI must disclose the current latest-100 limit, scope filters/counts to loaded records and use 25-row pagination. No claim of a complete council queue until the API work lands.

## Design trace and acceptance

| Source | Required application |
| --- | --- |
| `_ds/SKILL.md`, `_ds/README.md`, `_ds/colors_and_type.css` and canonical tokens | Reuse supplied token entry point, local DM Sans, display/mono stacks, gold focus rings, Lucide glyphs, semantic colour/icon/text status and standard surfaces; no copied raw colours |
| `_ds/DESIGN_SYSTEM_DECISION_REGISTER.md` DR-14/16/17/26/28/31 | Distinct coordination context; no management authority; read-only audit; uppercase visual post-auth entry; department/role header identity; accurate lifecycle labels |
| `_ds/ui_kits/dispatch/DispatchShell.jsx` and README | Teal dispatch header and queue-first home; show only implemented navigation and truthful refresh mechanism, not demo channel/WS/SOS data |
| `_ds/ui_kits/dispatch/DispatchDashboard.jsx` | Table, filter chips, selected record, mono SR identifiers, 25-row pagination; omit priority/zone/type/ETA when no authoritative data exists |
| `_ds/ui_kits/dispatch/Detail.jsx` | Right-side detail and modal creation with constrained actions; do not copy its demo auto-advance or decorative border-left (README anti-pattern takes precedence) |
| `_ds/wireframes/screens/Wireframes S6 - Code21 Create and Dispatch.dc.html` and matching S6 annotation 6e/6f | Read-only pre-submit recap, Edit preserves values, save failure stays on review with persistent error/retry; only fields actually supported by the current API |
| `_ds/wireframes/screens/Wireframes S7 - Code21 Detail and Lifecycle.dc.html` and matching S7 annotation 7a/7b | Address/SR search, status filtering, actionable detail, server-backed status and read-only history |
| `_ds/components/LifecycleStatusPill.jsx` | Reuse canonical component: legacy DISPATCHED maps to DISPATCHED_NOT_ACTIVE, ACKNOWLEDGED to DISPATCHED_ACTIVE; remaining current states map directly. This does not add server states or claim push transport exists |

Acceptance: successful create/edit/review/confirm and failed-save retry retain inputs; cancel/Escape and modal focus restoration work; search/filter/pagination and selected details work; refresh/assignment/officer acknowledge/attend/close and council isolation remain qualified; disabled-pack review and ADMIN exclusion remain intact. Verify desktop/narrow screenshots, keyboard access, contrast, token references, lint/format/types/build/integration and appropriate browser suites. Record environment and limitations honestly. Mono/display fonts still have the supplied DR-23 local-file gap; do not fabricate font files.

## Checkpoint

Design sources inspected. Implementation in progress; no acceptance claim, application deployment or infrastructure change.

## Functional preview reference

Owner authorised review of `CivicMAPS/CivicMaps-preview`. Inspected a separate read-only reference checkout at `e53ec8caa902ced7b38f688a2b249320276545b4`, specifically `civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx`, `Code21Page.tsx` and `components/AppShell.tsx`.

Confirmed form/review submission, status/address/SR search and record detail patterns. Do not transplant the single parking branch's `/admin/code21` API, offence catalogue, vehicle schema, zone/officer assumptions, role model or hardcoded FOOT travel mode into the multi-context rebuild. The current preview's failed submission sets `showReview(false)`, unlike S6 annotation 6e.5/6f; this phase follows the supplied annotation's persistent review/retry behaviour. Preview source is behavioural evidence, not proof of compatibility or current design authority.
