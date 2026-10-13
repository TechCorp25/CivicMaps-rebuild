# CivicMAPS Design System — Expansion Architecture
Status: CANDIDATE — pending owner review (built-in checkpoint after this gate) · Gate 3 deliverable · 2026-07-18
Scope: appearance and presentation only. Not a rebrand, not a redesign, not per-department visual forks. Existing visual identity and user familiarity fully preserved. Engineering/data-model/compliance concerns out of scope; S03-owned items tagged in the Decision Register, never resolved here.

## 0. Design intent

CivicMAPS grows from a Melbourne parking-enforcement tool into a multi-department, multi-organisation, multi-jurisdiction public-sector field-operations platform. The expansion is achieved by **layering**, not replacement: brand primitives stay immutable; a semantic token layer decouples meaning from operational codes and parking outcomes; a context layer expresses where/who/which-authority without ever overriding safety-critical semantics; components consume only semantic + context tokens; domain packs extend without forking.

## 1. Layer architecture (6 layers)

### L1 — Brand primitives (immutable, governed)
Civic Navy `#1B2A4A` (`#2C3E6B` light / `#0F1A32` dark), Operations Teal `#1A7A6D`/`#23A392`/`#115A50`, Patrol Gold `#D4A843`/`#E8C46A`/`#B08A2E`, Concrete 50–900; DM Sans / JetBrains Mono / Plus Jakarta Sans; 12–36px scale; 8px/4px spacing; 4/8/12/16/full radius; sm–xl elevation; 120/200/350ms motion `cubic-bezier(0.4,0,0.2,1)`; focus ring; Lucide 24×24/2px icon grammar; product lock-ups (new `assets/` — F5). Primitives are raw values; **components never reference them directly**.

### L2 — Semantic interface tokens
Families: `text` · `surface` · `border` · `action` (primary/secondary/destructive/quiet) · `status` · `priority` (P1–P4) · `presence` (available, active-offline [on duty, connectivity lost — green `-bg`/grey text], inactive [signed off — light-grey `-bg`/dark-grey text], on-duty-unavailable, out-of-vehicle, on-break, arrived; per DR-04 owner amendments Code 2 badge = status-active green, never amber — only the interactive roster-call banner may stay amber) · `connectivity-sync` (online, degraded, offline, pending-sync, synced, sync-conflict) · `evidence-integrity` (captured, sealed, verified, disputed) · `selection` · `read-only` · `controlled-share` · `focus`.

Status family (outcome-neutral, replaces parking-bound names — F10):
`emergency` · `alert` · `success` (≡ active) · `pending` · `inactive` · `blocked` · `completed` · `cancelled` · `revoked` · `informational`.

Rules:
- **No operational-code numbers in token names or comments** (fixes F13). Code→tier→token mapping lives in content configuration (S01-COD-001), never in the token file or components.
- Each status token ships the existing triple: base + `-bg` + `-border`.
- Compat aliases for every v1 token (DR-19): e.g. `--status-issued` → alias of `--semantic-status-completed-domain` slot mapped by the parking pack; `--status-active` → `success`. Full table in the Migration Guide. `colors_and_type.css` remains a generated, compatible entry point.
- SR lifecycle (11 states) maps onto status family — RECEIVED→pending, DISPATCHED_*→informational/pending, IN_PROGRESS/ATTENDED→success-track, PIN_ISSUED→domain outcome slot, NO_REPORT→completed-neutral, COMPLETED→completed, VOIDED/CANCELLED/CLOSED→cancelled/revoked/inactive — promoting `STATUS_META` out of the dispatch kit (F20).

### L3 — Context tokens (may restyle chrome; may NEVER override safety-critical semantic tokens)
- `product-surface`: commandmaps-web / dispatch-context / enforcementmaps-mobile / public-portal.
- `authority-context`: Authority Realm identity slots (name, crest/logo slot, jurisdiction label, timezone) — co-branding without palette change.
- `operating-context`: management (branch supervisor) vs coordination (dispatch, per OC-6) — structurally distinct chrome: coordination keeps the Operations Teal header treatment the dispatch kit already establishes; management keeps Civic Navy. Same components, different context frame + explicit context label; never colour alone.
- `branch-capability`: branch id/name/icon/code. Identity = name + icon + code + breadcrumb first; low-saturation accent only as last resort (DR-09).
- `map-layers`: canvas, road, zone-fill/stroke, marker states — absorbs the raw map hex literals (`#0B1220`, `#1A2940`, `#2C3E6B` — F8).
- `density`: comfortable / compact (desktop queue views).
- `appearance`: light / dark / high-contrast / reduced-motion. Dark becomes a full platform mode (F16, DR-11) — existing mobile low-light values preserved verbatim as that mode's mobile expression; shadow floors ≥0.25 opacity retained.

### L4 — Components
Consume L2/L3 only (lint-enforced via adherence config — fixes F8/F19). Registered as real `.d.ts` + `.jsx` pairs with `@dsCard` thumbnails so the compiler populates `_ds_manifest.json` (F7).

**Core primitives**: Button, IconButton, Input, Select, Textarea, Checkbox/Radio/Switch, Badge/StatusPill, PriorityChip, FilterChip, Tag, Avatar, Tooltip, Modal, Drawer, BottomSheet, Toast (non-safety only), Banner (persistent — safety), Tabs, Table, KPI tile, EmptyState, Skeleton, Pagination, Breadcrumb, DateTime (DD/MM/YYYY + timezone-aware), MonoIdentifier.

**App structure**: AppHeader (per product-surface), AuthorityContextSelector (org/jurisdiction switch with explicit confirmation of context change), WorkGroupPath (variable-depth Branch → optional Department → DWG breadcrumb — OC-5), DWGAssignmentSelector, ContextBar (operating-context label), NavRail/TabBar, ConnectivityIndicator.

**Operational**: RadioCodeBadge (tier-driven styling; code+label always paired — DR-04), PresenceIndicator (Code 2/26/5/6/11/12/18 render via presence tokens, F13/F17 fix), EmergencyBanner (Code 1 — persistent, 900ms flash + reduced-motion fallback, never toast), UrgentAssistBanner (Code 14/15 tier), OperationalDirectiveBanner (Code 100 — effective period, scope, acknowledgement, revocation state, audit link — DR-18), DispatchQueue + DispatchCard, LifecycleTrack, OfficerRow, AuditEventRow (**strictly read-only, every role** — OC-4/F22; no edit/delete/suppress affordances, ever), AuditTrailNotice ("this action is recorded" affordance on every action pattern), TechAssistExchange (request/response thread for lookups, e.g. stolen-vehicle checks — OC-6), MapMarker set, ZoneOverlay, PTTControl, SOSControl.

### L5 — Operational patterns
Composed, regulated workflows documented as pattern pages: sign-on/sign-off (Code 2/18/26), dispatch lifecycle (receive→route→monitor→close, void/cancel rules), officer-safety monitoring (Code 1 acknowledgement flow), directive broadcast (Code 100), cross-DWG assignment (coordination context, zero management authority), technical-assistance exchange, evidence capture states, offline/sync degradation, context switching (Authority Realm and operating context), controlled sharing.

### L6 — Domain extension packs
Per-branch packs extend content, terminology, and outcome-slot mappings via documented extension points — never duplicate or fork core components. Initial packs: **Parking Enforcement (compatibility pack — receives all existing parking examples; nothing deleted)**, then Local Laws, Animal Management, Parks & Gardens, Cleaning, Waste, Safe City, Licensing/Permits, Asset Inspections. Each pack declares: domain codes (e.g. 22, 69), outcome vocabulary, icons (Lucide grammar), fixture content.

## 2. Canonical token source
One machine-readable source (`tokens/civicmaps.tokens.json`) generating: CSS custom properties (light/dark/high-contrast; `colors_and_type.css` preserved as compatible generated entry point), Tailwind mapping, typed TS exports, RN/Expo exports. Raw hex allowed only in this file.

## 3. Typography & assets plan (Gate 4)
- Add local JetBrains Mono + Plus Jakarta Sans (offline-first — F6); unified local-first `@font-face` with CDN fallback documented.
- DM Sans consolidates on the two variable TTFs; static-set pruning pending DR-08.
- Create `assets/` (logo lock-ups, icon guidance) fixing F5.

## 4. Accessibility spec plan (Gate 4)
Testable criteria: contrast (AA minimum, AAA for status text on `-bg` pairs), focus order/visibility, target sizes (≥44px mobile), triple-encoding audit, flash-rate verification for Code 1 (DR-12), reduced-motion coverage, screen-reader announcements for banners (`role="alert"`, `aria-live`), high-contrast mode behaviour. S03-owned platform conformance tagged S03 DEPENDENCY (DR-06).

## 5. Fixture plan (Gate 6 — 7 required)
1. CommandMAPS multi-branch operations view
2. Cross-jurisdiction / Authority-Realm switching view
3. Queue/work-management view incl. dispatch/security coordination demo (OC-2/OC-3/OC-6)
4. EnforcementMAPS mobile field workspace (multi-domain)
5. EnforcementMAPS parking-compatibility flow (existing look preserved)
6. EnforcementMAPS web responsive — conditional, labelled §3.9.4-pending (DR-05)
7. Public-portal foundation

## 6. Disposition summary
- **Retain unchanged**: all L1 primitives, voice, icon grammar, motion, anti-pattern blockers, Code 1 banner behaviour (pending DR-12 verification).
- **Retain + doc correction**: README/SKILL narrative (F1), dispatch kit status (F14).
- **Generalise, no visual change**: jurisdiction strings → content slots (F18), parking examples → compatibility pack (F2).
- **Extend**: context layer (F3/F4), manifest components (F7), dark mode (F16), a11y spec (F12), lifecycle tokens (F20), radio-code catalogue treatment (F21), audit rules (F22), fonts (F6).
- **Deprecate + alias**: parking-bound token names (F10) — aliases permanent through 2.x.
- **Replace (verified defects)**: `--status-alert` Code 2 binding (F13/F17), raw hex in kits (F8/F19), absent `assets/` (F5).
- **Decision required / deferred**: DR-02, DR-03, DR-05..DR-08 per register.

## 7. Gate plan forward
Gate 3 APPROVED by owner 2026-07-19 with three recorded conditions (DR-19 semantics-correctable aliases; DR-22 parking pack tokenised, coverage matrix due Gate 5; DR-11 Gate 7 contrast validation outranks dark-value preservation). Gate 4 foundations → Gate 5 components/patterns → Gate 6 fixtures → Gate 7 validation → Gate 8 `2.0.0-rc.1` (changelog, migration guide, acceptance report).
