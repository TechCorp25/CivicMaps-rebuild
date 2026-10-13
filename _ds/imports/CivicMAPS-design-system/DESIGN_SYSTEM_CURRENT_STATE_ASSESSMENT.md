# CivicMAPS Design System — Current State Assessment
Status: CANDIDATE — pending owner review · Gate 1 + Gate 2 deliverable · 2026-07-18
Baseline package: CivicMAPS Design System v1.0.0 · Target: 2.0.0-rc.N
Authority order: S01 (CIVICMAPS-S01-APP-001) → S02 (CIVICMAPS-S02-APP-001) → S03 Index (informative only) → this package → existing conventions. Owner clarifications OC-1..OC-7 are authoritative.

## 1. Gate 1 — File inventory

| Path | Class | Disposition notes |
|---|---|---|
| `README.md` | source, present | Stale narrative (F1, F15); references absent `assets/` (F5); CDN-font claims contradict local fonts (F6); framework/version claims deferred to S03 (F9) |
| `SKILL.md` | source, present | Same narrative corrections needed as README |
| `colors_and_type.css` | source, present — canonical token entry point | Retained as compatible entry point; contains verified defect `--status-alert: /* Code 2 */` (F13); parking-bound semantic names (F10); dark block scoped mobile-only (F16) |
| `fonts/` (74 × DM Sans TTF) | source assets, present | Redundant static 18/24/36pt optical sets alongside variable fonts; zero local JetBrains Mono / Plus Jakarta Sans (F6). Pruning = DR-08 |
| `preview/` (27 `@dsCard` HTML) | source, present | Token/type/component specimen cards; not yet paired with compilable components (F7) |
| `ui_kits/commandmaps/` (Shell, LoginPage, Dashboard, Modals, OtherPages, index, README) | source, present | Raw hex/rgba throughout (F8); Code 2 banner styled with `--status-alert` (F17); role-tag raw hex map (F19) |
| `ui_kits/dispatch/` (Shell, Dashboard, Detail, index, README) | source, present | Intentional governed CommandMAPS operating context per OC-2 (F14); `STATUS_META` lifecycle colours embedded in kit file (F20) |
| `ui_kits/enforcementmaps/` (Shell, Patrol, OtherScreens, index, README) | source, present | Raw hex map-canvas literals (F8); hard-coded "Melbourne CBD · Municipal Patrol" (F18) |
| `uploads/CivicMAPS_Section_01…` (×2), `…Section_02…` | reference inputs, present | Read-only; never edited |
| `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` | generated | Never hand-edit. Manifest `components:[]`, `startingPoints:[]` (F7) |
| `assets/`, `/assets/icons/` | MISSING | Referenced by README; does not exist (F5) |
| Local JetBrains Mono / Plus Jakarta Sans files | MISSING | Docs mandate them; CDN-only today (F6) |
| Machine-readable canonical token source | MISSING | Required by expansion architecture L1/L2 |
| `HANDOVER.md` | session artifact | Not part of the design-system package; exclude from release |

## 2. Gate 2 — Findings register

Severity: BLOCKER (safety/semantic defect) · HIGH (blocks expansion goals) · MED · LOW.
Classification taxonomy: retain unchanged · retain + doc correction · generalise (no visual change) · extend · deprecate + alias · replace (verified defect) · decision required.

| # | Finding | Severity | Evidence | Classification |
|---|---|---|---|---|
| F1 | Narrative frames CivicMAPS as Melbourne-parking-only | HIGH | README.md; kit READMEs; S02 baseline | retain + doc correction (multi-department, multi-organisation, multi-jurisdiction framing; identity unchanged) |
| F2 | Examples dominated by Code 21 / parking / patrol zones | MED | All three UI kits, preview cards | extend — parking examples move to EnforcementMAPS parking-compatibility pack, never deleted; add multi-domain fixtures |
| F3 | No tenant / organisation / jurisdiction / Authority-Realm / data-plane / cross-jurisdiction design treatment | HIGH | Absent across package | extend — context-token layer + Authority Context selector, work-group path components (OC-5/OC-6) |
| F4 | No treatment for Local Laws, Animal Mgmt, Parks & Gardens, Cleaning, Waste, Safe City, Licensing/Permits, Asset Inspections | HIGH | Absent across package | extend — domain extension packs (layer 6), no core duplication |
| F5 | `assets/` referenced but absent | MED | README refs vs file tree | replace (verified defect) — create `assets/` with logo/icon lock-ups at Gate 4, or correct refs |
| F6 | Font distribution contradictory: docs say CDN-only; package ships 74 local DM Sans TTFs, zero local JetBrains Mono / Plus Jakarta Sans; offline-first conflict | HIGH | `fonts/` listing vs README | extend — add local mono + display fonts, unify `@font-face` strategy; static-set pruning is DR-08 (decision required) |
| F7 | `_ds_manifest.json` components/startingPoints empty | HIGH | Manifest inspection | extend — author real `.d.ts` + `.jsx` components with `@dsCard` thumbnails; compiler populates manifest |
| F8 | UI kits use raw hex / rgba despite tokens-only rule | HIGH | e.g. `Dashboard.jsx:24` `#2C3E6B` roads; `Patrol.jsx:29-32` `#0B1220`, `#1A2940`; `index.html` `#0F1A32`; `OtherPages.jsx:14` `#B45309`, `#EDE9FE`-class role hexes; pervasive `rgba()` overlays | replace (verified defect) — map to semantic + map-layer context tokens with a literal-by-literal migration table |
| F9 | Possibly-stale framework/version claims in README | LOW | README | decision required → tag S03 DEPENDENCY (§3.9.14 ADRs); not resolved here |
| F10 | Semantic colour names bound to parking outcomes (`--status-issued` "Infringement/No Report") | HIGH | `colors_and_type.css` | deprecate + alias — new outcome-neutral semantic tokens; every v1 token keeps a compat alias (migration table) |
| F11 | Code 1 flash 900ms/~1.1Hz with `prefers-reduced-motion` fallback | MED | index.html banners; motion tokens | retain unchanged + formally verify/document against WCAG 2.3.1 and field-safety at Gate 7 (DR-12) — not a presumed defect |
| F12 | Accessibility guidance incomplete / not testable as a system spec | HIGH | README a11y section | extend — testable spec at Gate 4; S03-owned portions (§3.9.11/§3.4.14) tagged S03 DEPENDENCY (DR-06) |
| F13 | `--status-alert: /* Code 2 */` token comment binds amber alert semantics to sign-on/available state | BLOCKER | `colors_and_type.css`; OC-1 | replace (verified defect) — alert semantics must never bind to presence/availability; codes never hard-coded in token names/comments. Owner amendment 2026-07-19 (DR-04): Code 2 status BADGE = status-active green; on-duty-but-disconnected = "Active offline" (green bg / grey text); signed-off = "Inactive offline" (light-grey bg / dark-grey text) |
| F14 | `ui_kits/dispatch/` ambiguous status | MED | Kit README ("Why a separate kit?") | retain + doc correction — formalise per OC-2 as governed, role/branch-restricted CommandMAPS operating context for Dispatch + Security branch leads/management; not a peer product; never merged away |
| F15 | "Municipal Area Patrol System" expansion stale vs multi-jurisdiction identity | MED | README | decision required — OWNER VALIDATION REQUIRED (DR-03); do not invent a replacement; do not carry into new docs |
| F16 | Dark mode is a mobile low-light override only, not a full platform mode | HIGH | `colors_and_type.css` dark block scoping | extend — complete to full platform light/dark/high-contrast; existing mobile behaviour preserved |
| F17 | CommandMAPS Code 2 roster-call banner rendered with `--status-alert` (amber, `#78350F` text) | BLOCKER → downgraded MED per owner ruling | Owner amendment 2026-07-19 (DR-04c): the interactive roster-call BANNER may remain amber — it requires an interaction step. Defect now scoped to passive presence badges only (see F13); banner keeps amber but should reference an interaction-required token, not `--status-alert` semantics |
| F18 | Jurisdiction hard-coded in kit UI ("Melbourne CBD · Municipal Patrol") | MED | `ui_kits/enforcementmaps/Patrol.jsx:12` | generalise (no visual change) — string becomes Authority-Realm-scoped content slot |
| F19 | Role-tag colours as raw per-role hex pairs (`COMPLIANCE_LEAD`, `SUPERVISOR`, `OFFICER`, `DISPATCH`) | MED | `ui_kits/commandmaps/OtherPages.jsx:14` | replace — back with semantic tokens; text label retained (triple-encoding satisfied) |
| F20 | 11-state SR lifecycle colour+icon+label triples defined inside kit file (`STATUS_META`), not the token layer | HIGH | `ui_kits/dispatch/Dashboard.jsx`; kit README | extend — promote lifecycle states into semantic status tokens (pending/active/blocked/completed/cancelled/voided…) with compat mapping; kit consumes tokens |
| F21 | No design treatment for the full radio-code catalogue (OC-7): tiers, Code 100 operational-directive broadcast, Code 14/15 urgent-assistance, technical-assistance exchange (OC-6) | HIGH | OC-3/OC-6/OC-7 vs package | extend — semantic-tier presentation model; codes remain configurable content per S01-COD-001, never hard-coded in components |
| F22 | No audit read-only design rule stated anywhere in package | HIGH | OC-4 vs kit audit page | extend — audit-event row and all audit views strictly read-only for every role incl. admins; every action pattern shows it writes an audit entry |

## 3. Baseline to preserve unchanged (verified present and healthy)

Civic Navy / Operations Teal / Patrol Gold palettes with light/dark variants; Concrete neutral scale 50–900; DM Sans / JetBrains Mono / Plus Jakarta Sans roles; 12–36px type scale; 8px/4px spacing; 4/8/12/16/full radius; sm–xl shadows; 120/200/350ms motion with `cubic-bezier(0.4,0,0.2,1)`; en-AU sentence-case voice; Lucide 24×24/2px icon grammar; triple-encoding rule; mono + tabular numerics for identifiers; `DD/MM/YYYY` display / ISO 8601 wire; persistent-banner (never toast) treatment for Code 1; all documented anti-pattern blockers.

## 4. Gate 2 exit

All 16 instruction findings confirmed against package evidence; 6 new findings (F17–F22) added. Two BLOCKERs (F13, F17) are the same defect at token and component level. No finding requires brand change. Proceed to Gate 3.
