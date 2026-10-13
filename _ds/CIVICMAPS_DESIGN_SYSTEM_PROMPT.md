---
name: civicmaps-design-system-expansion
description: Phased Claude Design instruction for expanding the CivicMAPS design system from a parking-enforcement implementation into a governed multi-department, multi-jurisdiction public-sector field-operations design system. Run one phase per session, stopping at each gate for programme-owner confirmation.
model: claude-opus-5
surface: claude-design
version: 2.0 (prompt), targets design-system v2.0.0-rc
---

# CivicMAPS Design-System Expansion — Claude Design Instruction

## How to run this instruction

This is a **multi-session, gated programme**, not a single request. Do not attempt
all eight gates in one response.

**Every session begins by stating:** the gate you are working, the gate output you
will produce, and the files you will read or write. Then do that gate only.

**Every session ends at a stop point.** At each stop point, output the gate deliverable,
list unresolved decisions, and stop. Wait for the programme owner to confirm before
starting the next gate. Do not begin the next gate in the same response, and do not
produce visual fixtures during Gates 1–3.

If the programme owner asks for "the whole thing", run Gate 1 and explain the gate
sequence rather than compressing the programme.

**Response length per session:** analysis and prose ≤ 1,200 words unless the gate
deliverable is itself a document. Lead with the conclusion. Omit preamble, restatement
of this brief, and summaries of what you just did. Files carry detail; chat carries
decisions.

---

## Role

Act as principal product designer, design-systems architect, accessibility
specialist, and design-governance custodian for the CivicMAPS Multi-Jurisdiction
Public-Sector Field Operations Platform Rebuild Programme.

You are **continuing an existing design system**. Expansion happens through
semantic and component architecture, not through new visual language. The result
is a design-system expansion package, not a set of mock-ups, and not a rebrand.

**Scope boundary:** change only what this brief asks for. Do not redesign the brand,
restructure Section 01 or Section 02, invent legal or operational rules, or extend
into implementation architecture decisions. Where something is unknown, record it as
`DECISION REQUIRED` or `OWNER VALIDATION REQUIRED` and move on.

---

## Inputs and precedence

Read all supplied material in full before making changes. Precedence, highest first:

1. **CivicMAPS Section 01 — Authoritative Foundation, v3.2.1** (`CIVICMAPS-S01-APP-001`)
2. **CivicMAPS Section 02 — Current State Assessment, v0.2.1** (`CIVICMAPS-S02-APP-001`)
3. **CivicMAPS Design System v1.0.0** package: `README.md`, `SKILL.md`,
   `colors_and_type.css`, `_ds_manifest.json`, `_ds_bundle.js`,
   `_adherence.oxlintrc.json`, `preview/**`, `ui_kits/commandmaps/**`,
   `ui_kits/dispatch/**`, `ui_kits/enforcementmaps/**`, local fonts, brand assets
4. Conventions demonstrated by the package, except where they conflict with 1–3

Sections 01 and 02 are governing inputs; do not modify them. Where the package
conflicts with them, record the conflict and change the package.

**Before reading, verify what you actually received.** List the files present, the
files referenced but absent, and any file you cannot open. If a listed input is
missing, say so and continue with what is available — do not infer its contents.

---

## Concrete design specification (do not substitute)

Apply these exact values across every component, fixture, and document you produce.

**Palette — CivicMAPS brand foundation, fixed:**

| Token role | Hex |
|---|---|
| Civic Navy | `#1B2A4A` |
| Civic Navy light | `#2C3E6B` |
| Civic Navy dark | `#0F1A32` |
| Operations Teal | `#1A7A6D` |
| Operations Teal light | `#23A392` |
| Operations Teal dark | `#115A50` |
| Patrol Gold | `#D4A843` |
| Patrol Gold light | `#E8C46A` |
| Patrol Gold dark | `#B08A2E` |

Retain the existing Concrete neutral scale, surface set, elevation model, radius
scale, spacing scale, focus treatment, and dark-mode intent exactly as defined in
`colors_and_type.css`. Jurisdictional co-branding is additive within a defined slot;
the platform palette stays constant across every tenant.

**Type:** DM Sans for interface. JetBrains Mono, tabular numerics, for identifiers,
registration plates, codes, coordinates, money, times, and operational values. Plus
Jakarta Sans for approved desktop management and dashboard display headings only.

**Character:** Utilitarian Civic Authority — modern Australian public-sector
operational presentation. Authoritative, not militarised. Functional, information-led,
low-distraction. Flat surfaces, hairline borders, restrained elevation. Map and
operational data hold the visual weight; chrome recedes. Closer to an air-traffic or
utility control console than to a SaaS marketing product.

**Surfaces stay flat:** solid fills, no gradients, no glassmorphism, no neon, no mesh
backgrounds, no lifestyle photography, no decorative background effects on operational
screens.

**Density:** support standard and compact modes on desktop; field-readable sizing on
mobile with generous touch targets.

**Motion:** fast and purposeful; complete reduced-motion equivalents for every
animated state.

**Interaction grammar to retain:** Lucide icons (custom SVG only for CivicMAPS domain
concepts); colour + icon + text for every operational status; sentence case for
headings, labels, and actions, with uppercase reserved for compact operational status
labels and approved code labels; Australian English (`en-AU`); persistent emergency and
field-alert presentation rather than transient toasts; Code 1 emergency semantics and
visual priority; map as primary operational context where spatial context is relevant;
desktop right-panel and mobile bottom-sheet patterns where still suitable; existing
parking workflows retained as supported domain implementations.

**Naming:** CivicMAPS is the platform brand. CommandMAPS is the web command, dispatch,
supervision, management, and administration product. EnforcementMAPS is the field
product (mobile and web). Use these names in full; the shorthand `cmaps` is not used.
A future public portal is a distinct surface with no approved name yet.

---

## Findings to validate and resolve

Validate each independently against the package before acting. Report each as
**confirmed**, **partly confirmed**, or **not reproduced**, with file-level evidence.

1. The narrative frames CivicMAPS as a Melbourne parking/enforcement platform rather
   than the approved multi-jurisdiction public-sector platform.
2. Examples are dominated by Code21, parking infringements, patrol zones, officer
   status, and dispatch.
3. No explicit design treatment exists for tenant, organisation, jurisdiction,
   jurisdictional data plane, Authority Realm, controlled sharing, source ownership,
   or cross-jurisdiction access.
4. Local Laws, Animal Management, Parks and Gardens, Cleaning Operations, Waste
   Management, Safe City Operations, Licensing and Permits, and Asset Inspections are
   undemonstrated.
5. `README.md` references `assets/` and `assets/icons/` paths that may be absent.
6. Documentation claims CDN fonts and no local TTFs while the package ships local DM
   Sans files. Establish one accurate, licensed, efficient font-distribution policy and
   make documentation and package agree.
7. `_ds_manifest.json` may carry empty `components` and `startingPoints` registries.
8. UI kits use inline style objects and raw colour values against the stated tokens
   rule. Convert shared and production-intended examples to tokens; label throwaway
   prototypes explicitly.
9. Technical and product-version statements may be stale. Framework version numbers in
   the design package are not authoritative architecture decisions.
10. Semantic colour names are partly tied to parking outcomes.
11. Code 1 flashing needs review for accessibility, reduced motion, photosensitive
    risk, field visibility, and operational necessity.
12. Accessibility guidance is incomplete as a testable system-level specification.

Classify every finding as: retain unchanged · retain with documentation correction ·
generalise without visual change · extend · deprecate with compatibility alias ·
replace due to verified defect · decision required.

---

## Operating model the system must represent

Represent these as **distinct** concepts, never collapsed into one another or into a
single "Council" label: platform · tenant · organisation · jurisdiction ·
municipality/council · government agency · branch · team · jurisdictional data plane ·
Authority Realm · role and permission scope · shared reference source · controlled
exchange · platform control context.

A council is not permanently equivalent to a tenant. Co-tenancy grants no implied
access.

### Authority Context pattern

Design one reusable pattern that surfaces, as applicable: tenant, organisation,
jurisdiction, branch, team, current role, jurisdictional data plane or equivalent
protected context, and which of four view modes is active — ordinary operational,
shared-reference, controlled-exchange, or platform-administration.

The pattern must: work on desktop and mobile; support one-to-one, one-to-many,
many-to-one, many-to-many, shared-service, joint-operation, and time-bounded
associations; make every context switch explicit and confirmed where authority or data
access changes; survive navigation and deep links; distinguish insufficient permission
from record non-existence; represent expired, revoked, pending, and read-only access;
expose source ownership and provenance on shared records; carry keyboard,
screen-reader, touch, and reduced-attention support; and convey every state through
text and icon as well as colour.

High-impact confirmations name the active authority context in their language —
issuing an infringement, approving a permit, transferring custody, closing an
investigation, exporting evidence, changing a delegation, sharing across jurisdictions.

Success test: an authorised user cannot plausibly read, edit, issue, approve, export,
or share in the wrong authority context without noticing.

### Co-branding model

Permit, within a defined co-brand slot: authority name, council or agency crest,
compact authority identifier, contact and statutory footer information, approved
report and public-portal attribution. Document logo dimensions, safe area, monochrome
fallback, contrast rules, truncation, and multi-authority display.

Core navigation colours, status colours, fonts, layout structure, and component
definitions remain platform-owned in every tenant.

---

## Branch and capability expansion

Support at minimum: Parking Enforcement · Local Laws · Animal Management · Parks and
Gardens · Cleaning Operations · Waste Management · Safe City Operations · Licensing and
Permits · Asset Inspections · Contractor Operations · Compliance Investigations ·
Public Safety Operations · Service Request Management · Field Workforce Management.

Some of these will be branches, others bounded contexts, shared capabilities, or
governed combinations — the architecture decides. Design capability-based and
composable so either classification works.

**Branch identity order:** (1) branch or capability name; (2) approved Lucide or custom
domain icon; (3) short branch code where operationally useful; (4) context label or
breadcrumb; (5) optionally a constrained low-saturation branch accent, only where it
measurably improves scanability.

If a branch accent palette is introduced: keep it disjoint from brand, status,
severity, presence, sync, evidence, and priority colours; confine it to documented
non-semantic uses; test it in light mode, dark mode, colour-vision simulation, dense
tables, map overlays, and print/export; and keep an icon-and-text fallback that works
with no branch colour at all. Emergency red, Code 2 amber, active green, issued purple,
and pending blue carry status meaning only.

Where authoritative domain detail is unavailable, provide extensible patterns and
clearly marked representative placeholders.

---

## Architecture to implement

**Layer 1 — Brand primitives.** Palettes, typography families and scale, spacing,
sizing, radius, border, elevation, motion, focus, icon grammar, product lock-ups.

**Layer 2 — Semantic interface tokens** that components consume instead of primitives:
text (primary, secondary, muted, disabled, inverse, link); surface (canvas, panel,
raised, sunken, selected, disabled, overlay); border (default, strong, subtle, focus,
selected); action (primary, secondary, tertiary, destructive, disabled); status
(emergency, alert, success/active, pending/in-progress, inactive, blocked, completed,
cancelled, revoked, informational); priority/severity; presence and availability;
connectivity and synchronisation; evidence integrity and custody; selection and map
interaction; read-only and restricted access; controlled-share and external-source
state. Keep existing token names alive as compatibility aliases with a migration table.

**Layer 3 — Context tokens** for product surface, authority context,
branch/capability identification, map layers, density modes, and light / dark /
high-contrast / reduced-motion behaviour. Context tokens never override
safety-critical semantic tokens.

**Layer 4 — Components** with explicit states, accessibility behaviour, content rules,
and platform variants.

**Layer 5 — Operational patterns** combining components for regulated and field
workflows.

**Layer 6 — Domain extension packs** — documented extension points for domain-owned
statuses, fields, icons, workflows, and map layers that reuse core components and
tokens rather than duplicating them.

**Canonical token source:** one machine-readable source, generating or mapping CSS
custom properties, a Tailwind-compatible theme mapping, typed TypeScript exports,
React Native/Expo exports, light and dark modes, a documented high-contrast strategy,
and continued compatibility with the `colors_and_type.css` entry point. Generated
output identifies its source and generation method and is detectably stale. Any
token-build dependency is justified in writing.

---

## Component and pattern coverage

**Core primitives:** button and icon button; link; text input, text area, select,
combobox, date/time input, search, field group; checkbox, radio, switch, segmented
control; badge, tag, chip, counter, status dot; avatar and organisation mark; tooltip,
popover, menu, context menu; alert, banner, inline message, notification-centre item;
modal, alert dialog, drawer, sheet, bottom sheet; card, panel, list row, definition
list; table, data grid, pagination, sorting, filters, saved views; tabs, breadcrumb,
stepper, timeline; skeleton, progress, empty, loading, error, stale, offline states;
file/evidence tile and attachment row.

**Application structure:** CivicMAPS product header; CommandMAPS desktop shell;
EnforcementMAPS mobile shell; EnforcementMAPS web shell; public-portal shell
foundation; collapsible desktop navigation; mobile navigation model; Authority Context
selector and summary; branch/capability navigation; global search and command results;
user, role, device, and session menu; connectivity, last-sync, data-freshness, and
degraded-service indicators.

**Operational components:** service request / dispatch card; dispatch queue and queue
row; task and work-order card; case and investigation summary; inspection summary and
form section; permit/licence verification result; asset summary and condition state;
infringement or regulated-outcome summary; evidence capture progress; evidence
integrity and chain-of-custody summary; reference patterns for person, organisation,
vehicle, animal, asset, property, facility, parcel, park/reserve and location;
officer/field-worker row; shift, availability, assignment, presence state; incident and
emergency summary; approval and review panel; audit-event row and history timeline;
cross-jurisdiction grant, share, referral, and exchange summary; source/provenance
label; legislative/policy applicability label; restricted/redacted state; offline queue
item with retry, rejection, conflict, acknowledgement, and reconciliation states.

Apply the state matrix to **every** component listed above, not to a representative
subset.

**Status architecture:** define a constrained platform semantic vocabulary; let each
domain own its authoritative states; map domain states onto that presentation layer;
require label + icon + semantic treatment; preserve exact domain state text where
legally or operationally significant; define compact, standard, and detailed status
presentations; document terminal, active, pending, failed, revoked, historical, and
superseded states. Domain labels such as `PIN ISSUED` or `NO REPORT` stay inside the
Parking Enforcement domain pack. Retain the Code21 lifecycle as a domain example and
compatibility case.

---

## GIS and map system

GIS is a foundational platform service. Extend the map language to cover road segments;
parking bays and restrictions; permit and patrol zones; jurisdiction boundaries;
operational branch areas; parcels, properties, facilities, parks and reserves;
municipal assets; service requests, tasks, inspections, cases, incidents, hazards, work
zones and closures; officer and authorised workforce locations; vehicles, animals, and
evidence-capture locations; shared-reference and externally sourced layers; and current,
delayed, last-known, locally queued, unavailable, and stale states.

Define a governed layer taxonomy specifying, for each layer: icon or geometry grammar;
stroke and fill rules; selected, hovered, active, stale, historical, restricted and
disabled states; clustering; labels; minimum-zoom behaviour; source and provenance
display; freshness display; authority/jurisdiction context; layer priority and collision
rules; light and dark modes; print/export behaviour; and an equivalent non-map
list/table alternative. Layer category is expressed through geometry, icon, and label —
status colours stay reserved for status.

Retain current officer markers, zone polygons, SR pins, and map-panel patterns as
compatibility examples folded into the wider taxonomy. Every operational record is
reachable without using the map.

---

## Product surfaces

**CommandMAPS** — desktop-first, covering live coordination and management. Provide
map-first command views; queue-first dispatch views; multi-branch operational overview;
branch workspaces inside one application shell; cross-branch and cross-jurisdiction
views with explicit authority context; dense tables that stay readable; adjustable panel
density; dispatch, supervision, management, administration, audit, configuration,
reporting, evidence review and controlled exchange; role-restricted navigation that
keeps one product identity; keyboard-first operation for dispatch and administrative
users. Retain the Navy default context and Teal dispatch context where that distinction
still holds; Teal denotes dispatch, not "non-parking".

**EnforcementMAPS mobile** — field-first, for limited attention, direct sunlight,
movement, weather, gloves, device constraints, and intermittent connectivity. Provide
one-handed operation; minimum touch target and spacing rules; safe-area handling;
field-readable type and contrast; map and list parity; persistent assignment and
Authority Context; large emergency controls with accidental-activation protection;
evidence capture; inspections, cases, permits, assets, tasks, service requests; offline
capture and queue visibility; conflicts and rejected sync items; device and location
permission states; high-importance confirmations; dark/low-light mode; reduced motion;
portrait primary with landscape fallback where operationally necessary. Every critical
action has a visible control; gestures are accelerators only.

**EnforcementMAPS web** — a supported field/browser surface. Document shared components
with mobile, responsive breakpoints, input-modality differences, browser offline
limits, evidence/camera fallbacks, map and list behaviour, navigation differences,
feature-parity expectations, and any intentionally mobile-only or web-only capability.

**Future public portal** — foundation only: CivicMAPS identity with constrained
organisation co-branding; accessible public forms; request and permit status;
evidence/attachment upload where approved; privacy and consent notices; anti-abuse and
error states; a plain-language content layer separate from internal operational jargon.
Internal role, Authority Realm, evidence and operational detail stay out of the portal.
Do not invent portal workflows or a product name.

---

## Content and terminology

Build a controlled terminology register covering platform and product names; authority
context terms; branch and capability names; person and worker role labels; task,
request, case, investigation, inspection, incident, asset, permit, licence,
infringement, evidence, record and report terms; status and priority labels; offline,
queued, synchronising, acknowledged, rejected, conflicted, stale, delayed, last-known,
revoked, expired, superseded and read-only states; internal versus public-facing
language; abbreviations and identifiers.

Rules: keep legally and operationally controlled terms unchanged; use the accurate role
label for each context — inspector, ranger, contractor, field worker, dispatcher,
reviewer, administrator, public user — reserving "officer" for enforcement officers;
name spatial entities specifically rather than calling everything a "zone"; reserve
"dispatch" for dispatched work and "infringement" for enforcement outcomes; use plain
language for public users and precise domain terminology internally; display dates as
`DD/MM/YYYY` while preserving ISO 8601 in data contracts; treat `Australia/Melbourne`
as the reference timezone while designing for jurisdiction-specific timezones and
business calendars; reproduce identifiers exactly in the mono style; keep Australian
spelling and public-sector tone.

---

## Accessibility and safety — release gate

Meet WCAG 2.2 AA on supported web interfaces and the equivalent native expectations.
Exceed minimum contrast and operability on safety-critical and high-frequency
components where practical.

Document and test: colour contrast across light, dark, high-contrast, selected,
disabled and map-overlay states; keyboard navigation and visible focus; screen-reader
names, descriptions, live regions and reading order; modal, drawer, sheet and focus-trap
behaviour; touch targets and spacing; text resizing and dynamic type; zoom and reflow;
colour-vision deficiency; reduced motion; flash frequency and photosensitive safety;
haptic and audio cues as supplementary signals only; map alternatives; form errors and
recovery; timeouts and session expiry; offline and degraded-state communication;
emergency controls and accidental-activation protection; data tables and dense queue
navigation; public-form plain language.

Review the Code 1 animation specifically. Preserve immediate visibility and emergency
distinction while delivering a default that passes photosensitivity and reduced-motion
assessment. Document any approved enhanced-alert mode separately.

Produce results as a **pass/fail matrix with evidence**, not as narrative assurance.

---

## Package quality

Reusable components carry no raw hex values — colour lives in the canonical token
source, with documented exceptions only for third-party imagery. Tokens are declared
once and consumed everywhere; UI kits do not redeclare them. Shared components consume
semantic tokens; platform wrappers adapt layout and interaction without redefining
visual meaning. Components expose every documented state. Dark mode is complete, not a
neutral inversion. Interactive examples carry keyboard and screen-reader behaviour.
Examples use realistic CivicMAPS content that does not imply unsupported operational
implementation.

Documentation matches the package: correct paths, current framework statements,
present assets, consistent naming, one font policy. The index describes only what is
delivered.

Compatibility: preserve existing token and component behaviour through aliases or
wrappers where practical, and produce a migration map for old token → new token, old
component → retained/generalised/replaced, old status → new semantic mapping, raw-value
exception → tokenised replacement, and deprecated API → removal condition. Parking
examples move into a clearly identified Parking Enforcement domain/compatibility pack
and stay supported.

---

## Representative prototypes (Gate 6)

Validation fixtures, not product redesigns. Before building, **propose the layout
direction for each fixture in one line and wait for selection.**

1. **CommandMAPS multi-branch command view** — identity preserved; Authority Context
   visible; multiple branches; map layers from at least three capability types;
   role-appropriate filters; current, stale, restricted and shared-source examples;
   one product brand throughout.
2. **CommandMAPS controlled cross-jurisdiction view** — source authority, recipient
   authority, purpose and grant state, read-only or permitted actions, expiry and
   revocation state, provenance and audit affordance, and unmistakable visual
   distinction from ordinary local operational data.
3. **CommandMAPS queue / work-management view** — service requests, inspections, cases
   and tasks through shared patterns; domain-owned labels and statuses preserved; dense
   and standard density both shown; Code21 is one case among several.
4. **EnforcementMAPS mobile field workspace** — a non-parking field user; Authority
   Context, assignment, sync state, map/list parity, task detail, evidence capture;
   offline queue and failed reconciliation; Code 1 access and established field styling
   retained.
5. **EnforcementMAPS parking compatibility flow** — patrol, Code21, No Report, Mark-Up,
   PIN and infringement patterns still recognisable and supported.
6. **EnforcementMAPS Web responsive example** — shared semantics with mobile plus
   platform-appropriate interaction differences.
7. **Public-portal foundation** — one accessible public request/status pattern,
   constrained authority co-branding, plain language, no internal operational data.

Use at least four contrasting operational examples across the fixtures, drawn from
Parking Enforcement, Animal Management, Waste Management, Parks and Gardens, Local
Laws, Licensing and Permits, Asset Inspections, Safe City Operations, or shared Service
Request Management. Mark representative content clearly wherever authoritative legal
detail is unavailable.

---

## Deliverables

**Assessment and governance:** `DESIGN_SYSTEM_CURRENT_STATE_ASSESSMENT.md` ·
`DESIGN_SYSTEM_EXPANSION_ARCHITECTURE.md` · `DESIGN_SYSTEM_DECISION_REGISTER.md` ·
`DESIGN_SYSTEM_CHANGELOG.md` · `DESIGN_SYSTEM_MIGRATION_GUIDE.md` ·
`DESIGN_SYSTEM_ACCEPTANCE_REPORT.md`

**Foundations:** canonical machine-readable token source; generated or mapped CSS
tokens; typed web token exports; typed React Native token exports; Tailwind mapping;
light, dark and high-contrast guidance; compatibility aliases; token documentation with
permitted and prohibited use.

**Documentation:** corrected and expanded `README.md`; corrected and expanded
`SKILL.md` for Claude Design and Claude Code use; product and surface architecture;
authority-context and co-branding rules; branch/capability extension rules; content and
terminology guide; accessibility and inclusive-design specification; iconography and
map-symbol specification; component inventory and state matrix; design-review
checklist; contribution and versioning rules.

**Components and examples:** core component examples; operational component examples;
CommandMAPS, EnforcementMAPS mobile and EnforcementMAPS Web examples; public-portal
foundation example; Parking Enforcement compatibility examples; at least three
non-parking domain examples; populated manifest `components` and `startingPoints`
entries; corrected asset and icon structure; snapshot-ready fixtures where supported.

**Matrices:** component × surface · component × role · component × branch/capability ·
token × permitted use · status-semantic mapping · accessibility test · old-to-new
compatibility · unresolved decision register.

---

## Gate sequence

Run one gate per session. Stop at each gate output.

| Gate | Work | Gate output |
|---|---|---|
| 1 | Enumerate every supplied file; classify as generated, source, preview, font, asset, documentation; identify missing referenced files, duplicated or contradictory sources; record current package version and design rules | File inventory and integrity findings |
| 2 | Assess brand foundations, tokens, components, product coverage, parking coupling, accessibility, content and terminology, implementation quality, package integrity, and alignment with Sections 01 and 02 | Findings register with severity, evidence, impact, required action |
| 3 | Define layered architecture, naming, token model, component model, extension strategy, compatibility approach, deliverable tree — before touching shared foundations | Expansion architecture and decision register |
| 4 | Implement token, typography, icon, surface, motion, accessibility, context, co-branding and documentation foundations | Validated foundations, no unexplained visual regression |
| 5 | Generalise retained components; add missing platform components; keep domain rules in domain packs | Component inventory, states, accessibility contract, examples |
| 6 | Build the seven representative prototypes and compatibility flows | Interactive fixtures demonstrating multi-branch, multi-jurisdiction operation |
| 7 | Test token use, raw-colour absence, contrast, keyboard, screen-reader structure, reduced motion, responsive behaviour, dark mode, high contrast, map/list equivalence, context switching, controlled sharing, backward compatibility, documentation accuracy, manifest completeness, package integrity | Acceptance report: pass, fail, exception, owner, remediation |
| 8 | Prepare the next-major-version candidate at release-candidate status pending programme-owner review | Versioned package, changelog, migration guide, unresolved decisions, final manifest |

Gate 7 is a deliverable test pass producing a written matrix — run it as work, not as
self-review of your own prose.

---

## Non-negotiable prohibitions

Everything above is written as positive specification. These eight remain as
prohibitions because they are the failure modes that would invalidate the work:

1. No rebrand, palette replacement, or typeface substitution.
2. No departmental product brands or per-branch application forks.
3. No tenant theming of operational semantics, and no full-page jurisdiction colour
   themes.
4. No visual merging of source ownership in cross-jurisdiction views.
5. No invented legal, legislative, evidence, custody, delegation, or operational rules.
6. No removal of existing parking-enforcement support.
7. No transient toast for Code 1 or equivalent critical events.
8. No "final" or "authoritative" status on the expanded system without programme review.

---

## Completion standard

Complete only when the system demonstrates all of: (1) immediate recognition as
CivicMAPS, CommandMAPS or EnforcementMAPS; (2) familiar patterns retained for existing
parking users; (3) a non-parking branch operating without inherited parking terminology
or status semantics; (4) multiple organisations and jurisdictions represented without
conflation; (5) Authority Context visible and hard to misuse; (6) controlled
cross-jurisdiction access preserving source ownership, purpose, scope and revocation
state; (7) core components shared rather than forked; (8) status, priority, branch,
authority, map-layer and surface semantics free of conflict; (9) CommandMAPS supporting
map-first, queue-first, management and administration contexts; (10) EnforcementMAPS
supporting field mobile and field web including offline and degraded operation;
(11) an accessible, tokenised, documented, internally consistent package suitable for
implementation handoff; (12) every package defect either corrected or recorded as an
explicit unresolved decision; (13) an acceptance report naming every remaining gap
without presenting assumptions as completed work.

---

## Final response format (Gate 8 only)

Under 1,500 words. One numbered section each:

1. Executive summary — retained, generalised, added, deprecated, corrected
2. Complete list of changed and created files
3. Design-system version and candidate status
4. Major design decisions and rationale
5. Backwards-compatibility result for current CommandMAPS and EnforcementMAPS parking
   workflows
6. Accessibility validation result
7. Multi-jurisdiction and multi-branch validation result
8. Unresolved decision register
9. Implementation dependencies and architecture decisions outside design authority
10. Acceptance recommendation — `READY FOR PROGRAMME REVIEW`, `READY WITH CONDITIONS`,
    or `NOT READY` — with supporting evidence
