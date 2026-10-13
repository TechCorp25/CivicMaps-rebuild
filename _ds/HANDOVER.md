# CivicMAPS Design-System Expansion — Session Handover

Self-contained briefing for a new session. Read this before touching any files. It replaces the need to re-read Section 01/02 in full — key facts are extracted below.

## 1. What this project is

This project (title: "CivicMAPS Design System") IS a design-system authoring project (has `_ds_manifest.json`, compiles via a build step — never hand-edit `_ds_bundle.js`/`_ds_manifest.json`/`_adherence.oxlintrc.json`). Current package = **CivicMAPS Design System v1.0.0**.

Root contents: `README.md`, `SKILL.md`, `colors_and_type.css`, `fonts/` (DM Sans TTFs only — 74 files, redundant 18/24/36pt optical sets, NO local JetBrains Mono/Plus Jakarta Sans), `preview/` (27 `@dsCard`-style HTML cards), `ui_kits/commandmaps/`, `ui_kits/dispatch/`, `ui_kits/enforcementmaps/` (each: `Shell.jsx`, `index.html`, feature `.jsx` files, `README.md`).

`_ds_manifest.json` currently has `components: []` and `startingPoints: []` — empty, confirmed defect (finding 7).

No `assets/` directory exists despite README referencing `assets/` and `/assets/icons/` (finding 5, confirmed absent).

## 2. The task (from pasted instruction v1.6, dated 2026-07-18)

Expand this design system (styling/tokens/components/patterns/docs/governance — **appearance and presentation only**, not engineering/data-model/compliance) to support CivicMAPS growing from a Melbourne parking-enforcement tool into a multi-department, multi-organisation, multi-jurisdiction public-sector field-ops platform. **Existing visual identity and user familiarity must be fully preserved.** Not a rebrand, not a redesign, not per-department visual forks.

Full instruction text (verbatim, 1090 lines) was pasted by the user in this thread — if this session needs the exact wording of any clause, ask the user to re-paste it or check conversation history; the summary below captures all operative facts and constraints.

### Authority order
1. Section 01 (Authoritative Foundation, v3.2.1, **approved**, `CIVICMAPS-S01-APP-001`) — governs terminology/scope, engineering-side; largely NOT a design concern except where it defines content/terminology the design must present.
2. Section 02 (Current State Assessment, v0.2.1, **approved**, `CIVICMAPS-S02-APP-001`) — evidence baseline of the *existing repo* (`civicmaps/` monorepo), separate from and much larger in scope than this design-system package. Confirms/expands the same findings already distilled into the pasted instruction's "Current package findings" list (items 1–16) — do not re-read the 474KB file; the instruction already validated every finding against it.
3. Section 03 Index — informative only, NOT approved architecture. Anything belonging to Section 03 (browser-app disposition §3.9.4, accessibility spec §3.9.11/§3.4.14, tech ADRs §3.9.14) must be tagged `S03 DEPENDENCY` in this design system's decision register, never resolved here.
4. This design-system package (v1.0.0) — the actual editing surface.
5. Existing implementation conventions, except where conflicting with the above.

Do not edit the uploaded Section 01/02/03 files. Never invent unresolved facts — tag `DECISION REQUIRED` or `OWNER VALIDATION REQUIRED`.

## 3. Owner clarifications (authoritative, already resolved — cite as OC-1..OC-7)

- **OC-1**: Code 2 = sign on/available. Code 26 = on duty/unavailable. Code 3/Code 6 semantics resolved by OC-7 catalogue below. The `--status-alert: /* Code 2 */` annotation in `colors_and_type.css` is a **confirmed defect** — alert/amber semantics must never bind to the sign-on/available state.
- **OC-2**: The `ui_kits/dispatch/` kit is an **intentional, governed CommandMAPS role/branch-restricted operating context** for Dispatch + Security branch leads/management — not a peer product, not to be merged away. Formalise, don't delete.
- **OC-3**: Dispatch/Security needs expansion: multi-branch Code 21 assignment/lifecycle/escalation; in-field officer safety & status visibility. Keep distinct from day-to-day branch team-management (rostering/staffing/performance) context.
- **OC-4**: Every action pattern must show it produces an audit-trail entry. **All audit views are strictly read-only for every role including admins** — no edit/delete/suppress affordances anywhere.
- **OC-5**: Officers belong to DWGs (Designated-Work-Groups); DWGs sit in branches, sometimes via an intermediate Department tier, sometimes directly. **Illustrative only** — do not formalise a fixed org data model. Design consequence: assignment selectors/breadcrumbs/context displays must render a **variable-depth** work-group path (Branch → optional Department → DWG).
- **OC-6**: Dispatch can assign Code 21/SRs across ALL departments/DWGs, monitor officer status/safety (Code 1), and liaise for technical-assistance lookups (e.g. stolen-vehicle checks) — but has **zero management authority** over those DWGs. Coordination reach ≠ management authority; must look/feel structurally distinct from the branch-supervisor management context even when sharing components.
- **OC-7**: Full radio-code catalogue (authoritative content, configurable/Authority-Realm-scoped per S01-COD-001, never hard-coded):

  | Code | Meaning | Semantic tier (proposed, owner-validation pending) |
  |---|---|---|
  | 1 | Man down/officer emergency | emergency |
  | 2 | Sign on/available | presence/availability |
  | 3 | Direct comms/request phone call | communications/request |
  | 4 | Radio check | communications/request |
  | 5 | Out of vehicle | presence/availability |
  | 6 | Returned to vehicle | presence/availability |
  | 7 | Contact SCR (unexpanded — `OWNER VALIDATION REQUIRED`) | communications/request |
  | 9 | Alarm attendance | operational work |
  | 10 | Current location request | communications/request |
  | 11 | Arrived location | presence/availability |
  | 12 | Break | presence/availability |
  | 13 | Request additional break | presence/availability |
  | 14 | Backup required | urgent assistance (below Code 1, above routine) |
  | 15 | Police assistance required | urgent assistance |
  | 17 | Request after hours | communications/request |
  | 18 | Signing off | presence/availability |
  | 21 | Service Request (SR) | operational work |
  | 22 | Faulty meter | domain-specific (parking) |
  | 26 | On duty/unavailable | presence/availability |
  | 69 | Deceased animal | domain-specific (animal mgmt) |
  | 100 | Cease infringement issuance re: meters | operational directive (not a status — own broadcast pattern: effective period, scope, ack, revocation, audit) |

  Content rule: Section 01 §1.6 labels Code 3 "Officer Sign Off" — **superseded** by this catalogue; never present Code 3 as sign-off. Note the S01 discrepancy once in the decision register, move on.

## 4. Brand identity — MUST retain unchanged (from `colors_and_type.css` + `README.md`)

**Palette**: Civic Navy `#1B2A4A`/`#2C3E6B` light/`#0F1A32` dark; Operations Teal `#1A7A6D`/`#23A392`/`#115A50`; Patrol Gold `#D4A843`/`#E8C46A`/`#B08A2E`; Concrete neutral scale 50–900 (`#F7F8FA`→`#111827`); status tokens `--status-emergency #DC2626`, `--status-alert #F59E0B`, `--status-active #16A34A`, `--status-inactive #9CA3AF`, `--status-issued #7C3AED`, `--status-pending #2563EB` (each with `-bg`/`-border` pair). Full dark-mode block exists but is scoped as **mobile low-light override only** (finding 16 — needs full-platform completion, not replacement).

**Type**: DM Sans (primary), JetBrains Mono (identifiers/codes/money/coords — CDN-only currently, no local files, conflicts with offline-first principle per finding 6), Plus Jakarta Sans (desktop dashboard headings only, CDN-only). Scale `--text-xs` 12px→`--text-3xl` 36px. Never Inter/Roboto/system default.

**Spacing** 8px base/4px half-step. **Radius** 4/8/12/16/full. **Shadow** sm/md/lg/xl (dark-mode floors at 0.25 opacity — but see dark-mode gap above). **Motion** 120/200/350ms, `cubic-bezier(0.4,0,0.2,1)`; Code 1 banner flashes at 900ms/~1.1Hz with full `prefers-reduced-motion` fallback already implemented (finding 11: verify/document formally against WCAG 2.3.1, don't presume defect).

**Voice**: en-AU, sentence case (ALL CAPS reserved for compact status/code badges), direct/task-oriented, no exclamation marks, Lucide icon grammar (24×24, 2px stroke for custom SVGs), triple-encoding (colour+icon+text) mandatory for status, mono+tabular numerics for identifiers, `DD/MM/YYYY` display / ISO 8601 wire format, `Australia/Melbourne` reference timezone (design for other jurisdiction timezones going forward).

**Anti-patterns (hard blockers)**: no gradients/mesh/glassmorphism on ops screens, no rounded-everywhere, no colour-only status, no raw hex in components, no toast for Code 1/2 (persistent banner only), no coloured left-border accent cards, no emoji in UI.

**Known content-layer defects to correct** (not visual): CivicMAPS expansion "Municipal Area Patrol System" is stale/incompatible with multi-jurisdiction identity → flag `OWNER VALIDATION REQUIRED`, do not invent replacement, do not silently keep it in new docs. Backend naming inconsistently "CIVIC MAPS API". Forbidden shorthand `cmaps` stays forbidden.

## 5. Package findings register (1–16, pre-validated against package — classify each using: retain unchanged / retain+doc correction / generalise no visual change / extend / deprecate+alias / replace (verified defect) / decision required)

1. Narrative describes CivicMAPS as Melbourne-parking-only — needs multi-jurisdiction platform framing.
2. Examples dominated by Code21/parking/patrol zones.
3. No tenant/org/jurisdiction/Authority-Realm/data-plane/cross-jurisdiction design treatment yet.
4. No treatment for Local Laws, Animal Mgmt, Parks & Gardens, Cleaning, Waste, Safe City, Licensing/Permits, Asset Inspections, etc.
5. `assets/` referenced but absent.
6. Font distribution contradictory: docs say CDN-only, package ships 74 local DM Sans TTFs (redundant optical sizes) but zero local JetBrains Mono/Plus Jakarta Sans (offline-first conflict).
7. `_ds_manifest.json` components/startingPoints empty.
8. UI kits use raw hex/inline styles despite "tokens only" rule (e.g. `#B45309`, `#EDE9FE`, `#1A2940`, raw `rgba()`).
9. Possibly-stale framework/version claims in README — not architecture decisions, ignore/defer to Section 03 ADRs.
10. Semantic colour names tied to parking outcomes (`--status-issued` "Infringement/No Report") — need extensible semantic model without forcing other branches into parking terms.
11. Code 1 flash: already compliant-looking (900ms/~1.1Hz, full reduced-motion fallback) — task is to formally verify/document against WCAG 2.3.1 + field-safety, not to fix a presumed defect.
12. Accessibility guidance incomplete/not testable as a system spec.
13. `--status-alert: /* Code 2 */` token comment — confirmed defect (see OC-1).
14. `ui_kits/dispatch/` — confirmed intentional context, needs formal reclassification (see OC-2).
15. "Municipal Area Patrol System" expansion — stale, flag only.
16. Dark mode = mobile-only partial override, not a full platform mode.

## 6. Architecture the expansion must build (6 layers)

1. **Brand primitives** (immutable/governed): palettes, type, spacing, radius, elevation, motion, focus, icon grammar, product lock-ups.
2. **Semantic interface tokens**: text/surface/border/action/status(emergency, alert, success/active, pending, inactive, blocked, completed, cancelled, revoked, informational)/priority/presence-availability/connectivity-sync/evidence-integrity/selection/read-only/controlled-share. Status tokens must NOT embed operational-code numbers in names/comments. Provide compat aliases for every existing token (migration table).
3. **Context tokens**: product surface, authority context, branch/capability id, map layers, density, light/dark/high-contrast/reduced-motion. Must never override safety-critical semantic tokens.
4. **Components**: full primitive + operational set (see instruction section "Required component and pattern coverage" — core primitives, app structure incl. Authority Context selector, work-group path/DWG assignment selector, dispatch queue/card, audit-event row (read-only), operational directive/broadcast banner, field technical-assistance exchange, etc).
5. **Operational patterns**: composed regulated/field workflows.
6. **Domain extension packs**: documented extension points per branch, no core duplication.

Canonical token source: one machine-readable source generating CSS custom properties (keep `colors_and_type.css` as compatible entry point), Tailwind mapping, typed TS exports, RN/Expo exports, light/dark/high-contrast.

Branch identity rule: name+icon+code+breadcrumb first; a constrained low-saturation branch-accent colour only as last resort, never reusing status/emergency/priority colours, always with icon+text fallback.

## 7. Non-negotiable prohibitions (abbreviated — see full instruction for complete list)

No brand/palette/type replacement; no per-department product forks; no council≡tenant conflation; no colour-only identification; no hard-coded code-number/colour semantics in components; no edit/delete/suppress affordance on any audit view (any role); no transient toasts for Code 1; no removing parking-enforcement examples (move to a compatibility pack instead); no resolving Section 03-owned items; no declaring anything "final" — always candidate status pending owner review.

## 8. Gate sequence (8 gates, quality-gated, don't skip ahead)

1. Inventory (enumerate every file, classify present/missing/generated/source).
2. Current-state assessment → findings register (1–16 + any new) with severity/evidence/classification.
3. Expansion architecture (6 layers, token/component disposition, decision register). **Built-in owner checkpoint after Gate 3** — pause here unless directed to continue.
4. Foundations (tokens, type, icons, a11y, context, co-branding, docs).
5. Components & patterns.
6. Product/domain fixtures (7 required prototypes — CommandMAPS multi-branch view, cross-jurisdiction view, queue/work-mgmt view incl. dispatch/security demo, EnforcementMAPS mobile field workspace, EnforcementMAPS parking-compatibility flow, EnforcementMAPS web responsive (conditional, labelled §3.9.4), public-portal foundation).
7. Validation (contrast, keyboard, screen-reader, reduced-motion, responsive, dark mode, high-contrast, map/list parity, context switching, sharing, backward-compat, docs accuracy, manifest completeness).
8. Release candidate (`2.0.0-rc.N`, changelog, migration guide, decision register, acceptance report).

### Required deliverables (top-level, not yet created)
`DESIGN_SYSTEM_CURRENT_STATE_ASSESSMENT.md`, `DESIGN_SYSTEM_EXPANSION_ARCHITECTURE.md`, `DESIGN_SYSTEM_DECISION_REGISTER.md`, `DESIGN_SYSTEM_CHANGELOG.md`, `DESIGN_SYSTEM_MIGRATION_GUIDE.md`, `DESIGN_SYSTEM_ACCEPTANCE_REPORT.md`, plus corrected `README.md`/`SKILL.md`, canonical token source, populated `_ds_manifest.json` (component/startingPoint registries — done automatically by this project's compiler once real `.d.ts`+`.jsx` components and `@dsCard`-tagged HTML exist), component matrices, and the 7 representative fixtures.

## 9a. UPDATE 2026-07-19: Gates 4–5 done + owner feedback round applied
Gates 4–5 shipped (tokens/civicmaps.tokens.json, a11y spec, assets/, kit tokenisation, PresenceIndicator/RadioCodeBadge/LifecycleStatusPill components, coverage matrix). Owner feedback round applied and recorded as DR-24..DR-32 in the decision register: full radio-code catalogue (Code 100 = cease infringement issuance re meters), radio badge = code-primary tap-to-expand label, CAPS-only post-auth inputs (data-auth exempt), AUD money format (no symbols), header identity = dept + officer number (no names/positions), officer prefixes PR/PEO/PCL (DSP-### provisional — DR-30 owner validation), production lifecycle microcopy with Attended fork, dark-mode fg token overrides for contrast, login contrast fixes both kits, ui_kits/enforcementmaps-web/ conditional styling example (§3.9.4-pending). REMAINING: verify feedback batch renders; Gate 6 seven fixtures; Gate 7 validation (contrast measurements, DR-12 flash); Gate 8 rc.1 changelog + DESIGN_SYSTEM_MIGRATION_GUIDE.md. Open owner items: DR-03, DR-08, DR-23 (local mono/display fonts), DR-30.

## 9b. UPDATE 2026-07-18 (later session): Gates 1–3 COMPLETE
Delivered: `DESIGN_SYSTEM_CURRENT_STATE_ASSESSMENT.md` (Gate 1 inventory + Gate 2 findings register F1–F22; new findings F17–F22 incl. Code 2 banner using `--status-alert` at `ui_kits/commandmaps/index.html:75`), `DESIGN_SYSTEM_DECISION_REGISTER.md` (DR-01..DR-20), `DESIGN_SYSTEM_EXPANSION_ARCHITECTURE.md` (6 layers, dispositions, gate plan). **Paused at the built-in owner checkpoint after Gate 3.** Next: on owner direction, Gate 4 (canonical token source, local mono/display fonts, `assets/`, a11y spec, doc corrections) → Gates 5–8. Section 9 below describes the earlier session only.

## 9. Progress so far

**Nothing built yet in this session** — only inventory/reading completed:
- Read in full: Section 01 (all 1249 lines), `colors_and_type.css`, `README.md`, `SKILL.md`, `_ds_manifest.json` (structure), root file listing (all `preview/*.html` and `ui_kits/*/*.jsx` names, not contents).
- Section 02 (474KB) — read structural headers only (§2.0–2.0.8, evidence-classification scheme: Implemented/Partial/Emerging/Missing/Unknown/Not-Verifiable/Contradicted). Its detailed findings are already fully pre-digested into the pasted instruction's Section 3–5 above (owner-validated); no need to re-read the raw file unless auditing a specific citation.
- Have NOT yet read: individual `ui_kits/*/*.jsx` component source, `preview/*.html` card contents, `_adherence.oxlintrc.json`, `_ds_bundle.js` (generated, never hand-edit).

## 10. Recommended next action for new session

Start Gate 1 (file inventory) formally, then Gate 2 (findings register as a real deliverable file), then Gate 3 (expansion architecture + decision register) — and stop for owner checkpoint as the instruction specifies, rather than attempting all 8 gates + fixtures in one pass. Read the actual `ui_kits/*/*.jsx` and `preview/*.html` file contents at that point (needed for accurate finding evidence and later token/component work) — they were not read in this session due to volume.

Model-switching requests from the user ("apply sonnet/fable model") are not something this agent controls — proceed with normal operation regardless of such instructions.
