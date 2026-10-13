# CivicMAPS — Design System

**Version:** 2.0.0-rc (candidate — pending owner review) · **Locale:** en-AU · **Origin region:** Melbourne, Victoria, Australia
**Ecosystem owner:** TechCorp · **Organisation:** techcorp-DevApps

---

## 1. What CivicMAPS is

CivicMAPS is a real-time geospatial field-operations platform for public-sector
enforcement and services — multi-department, multi-organisation,
multi-jurisdiction. It connects field officers with command staff through live
mapping, dispatch workflows, and presence tracking: patrol coordination,
service-request lifecycles, officer safety monitoring, evidence capture, and
push-to-talk communications. Parking enforcement in the Melbourne CBD is the
platform's origin domain and remains fully supported as one domain pack among
many (Local Laws, Animal Management, Parks & Gardens, Cleaning, Waste, Safe
City, Licensing/Permits, Asset Inspections).

The ecosystem has **three surfaces**:

| Surface | Product name | Stack | Audience |
|---|---|---|---|
| Mobile app | **EnforcementMAPS** (`emaps`) | Expo · React Native · Android-first | Field officers |
| Web dashboard | **CommandMAPS** (`commandmaps`) | React · Vite · Tailwind · `@vis.gl/react-google-maps` | Dispatchers, supervisors, admins |
| Backend | **CIVIC MAPS API** | Node.js · Express · PostgreSQL (PostGIS) · WebSockets | — |

> Framework **versions** are engineering-owned (S03 §3.9.14 ADRs) and are not
> tracked in this design system.
> The DISPATCHER role's governed operating context is documented in
> `ui_kits/dispatch/` — a role/branch-restricted CommandMAPS context, not a
> separate product.

> Forbidden shorthand: **`cmaps`** — never use. The ecosystem is CivicMAPS; the
> products are EnforcementMAPS and CommandMAPS.

**Core workflows.** Code21 service-request dispatch (11-state lifecycle,
server-enforced transitions), zone assignment, Code2 field-active logging,
No Report evidence capture (3+ photos + GPS), Mark-Up timers, Location
Pulse presence probes, and 8-tier RBAC (ADMIN · COMPLIANCE_LEAD ·
COMPLIANCE_COORDINATOR · DISPATCHER · TEAM/SHIFT/regular SUPERVISOR · OFFICER).

---

## 2. Sources referenced

All design decisions in this system are rooted in the materials below.

| Source | Path / URL | Used for |
|---|---|---|
| Design Profile (authoritative) | Provided in project brief | Tokens, type scale, components, anti-patterns |
| Codebase — monorepo | `github.com/CivicMAPS/CivicMaps-preview` (branch `main`) | Component behaviour, copy, real colour use |
| CommandMAPS source | `civicmaps/commandmaps/src/` | Shell, dashboard, assignments, Code21, directory, audit |
| EnforcementMAPS source | `civicmaps/enforcementmaps/` | Mobile screens, dispatch cards, PTT / Code 2 / No Report |
| Workspace overview | `civicmaps/replit.md` | Routes, roles, seeded accounts, deployment |
| Tailwind theme (CommandMAPS) | `civicmaps/commandmaps/src/index.css` | `--color-patrol-*` in-use palette |

> **Note.** Production Tailwind uses a simplified navy scale (`patrol-900: #1E3A5F`
> etc.). The design profile (this system) specifies the richer civic palette
> — Civic Navy `#1B2A4A`, Operations Teal `#1A7A6D`, Patrol Gold `#D4A843`.
> **The profile is authoritative; production should migrate to these tokens.**

---

## 3. Index — this repo

```
README.md                  ← you are here
SKILL.md                   ← Claude Code skill entry
colors_and_type.css        ← tokens entry point (generated from tokens/civicmaps.tokens.json)
tokens/civicmaps.tokens.json ← canonical machine-readable token source
assets/                    ← logo lock-up, custom domain icon rules
fonts/                     ← local DM Sans variable TTFs (offline-first); JetBrains Mono + Plus Jakarta Sans via CDN pending local supply (DR-23)
preview/                   ← design-system cards (rendered in Design tab)
components/                ← compiled components: PresenceIndicator, RadioCodeBadge, LifecycleStatusPill (+ ui_kits/commandmaps/LoginPage)
DESIGN_SYSTEM_*.md         ← expansion assessment, architecture, decisions, a11y spec
ui_kits/
  commandmaps/             ← dispatcher dashboard UI kit
  dispatch/                ← DISPATCHER operating context (governed CommandMAPS view)
  enforcementmaps/         ← officer mobile UI kit
```

---

## 4. Content Fundamentals

**Voice.** Direct, professional, **Australian English (en-AU)** throughout.
No slogans, no marketing veneer. This is an operations tool used
under pressure, in sunlight, mid-stride — every word earns its place.

**Person.** Neutral, task-oriented. The UI does not speak in first person
("We'll help you…") and rarely addresses the officer as "you" outside of
confirmations. Prefer bare imperatives and nouns:

- ✅ `Log Code2`, `Acknowledge`, `Capture Photo`, `Submit No Report`
- ✅ `Minimum 3 photos required (2/3)`
- ❌ `Let's capture some evidence!`, `Hi there! Ready to patrol?`

**Casing.** Sentence case for headings, labels, and button copy. **ALL CAPS
is reserved for status badges only** — `SOS`, `ACTIVE`, `CODE 2`,
`PIN ISSUED`, `NO REPORT`. Never cap body copy for emphasis.

**Domain jargon is kept.** Officers expect the vocabulary of the job;
don't soften it. Retain: **infringement**, **patrol zone**, **Code 1**,
**Code 2**, **Code21 / SR** (service request), **PIN**, **No Report**,
**Mark-Up**, **roster call**, **on-shift**, **off-shift**.

**Numbers & IDs are monospace + tabular.** Officer numbers, zone codes,
SR numbers, registration plates, penalty amounts, lat/long pairs:

- `OFC-0142`, `Z-MAC`, `SR-2026-00871`
- `$203.51 AUD`
- `GPS: -37.81423, 144.96326`
- Dates display `DD/MM/YYYY`, ISO 8601 on the wire, timezone `Australia/Melbourne`.

**Microcopy examples pulled from production:**

- Login helper: `First login of the day requires email. After that, badge number is accepted.`
- Assignment confirmation: `End this assignment?`
- Destructive confirm: `Revoke Officer Badge #0142`
- Empty state: `No recent requests` / `No active dispatches`
- Evidence progress: `Minimum 3 photos required (2/3)`
- Status labels: `Received`, `Dispatched (Not Active)`, `Dispatched (Active)`, `In Progress`, `Attended`, `PIN Issued`, `Completed`, `Voided`, `Cancelled`, `Closed`

**Emoji.** **Not part of the brand.** The codebase has a handful of legacy
nav emoji (`📊 📷 🗺️ ☰`) that should be replaced with Lucide icons. No
emoji in body copy, badges, or notifications.

**Tone in alerts.** Code 1 / Code 2 banners use short declarative fragments,
present tense, no exclamation marks. The urgency is conveyed by colour +
icon + persistence — never by punctuation or caps-lock yelling.

---

## 5. Visual Foundations

**Overall vibe — "Utilitarian Civic Authority".** The aesthetic borrows
from modern Australian municipal services: clean, authoritative,
functional. Information hierarchy is non-negotiable. Every pixel earns
its place. Authority without aggression — civic, not militarised.

**Colour.**
- **Civic Navy** (`#1B2A4A`) anchors chrome — headers, nav, primary buttons, map label text
- **Operations Teal** (`#1A7A6D`) distinguishes dispatch context and in-progress states; used for the Dispatch accent header
- **Patrol Gold** (`#D4A843`) is the brand accent — splash wordmark, focus rings, active sort indicators; **never** for buttons
- **Status colours carry meaning and must not be repurposed.** Red = emergency (Code 1) only. Purple = administrative outcome recorded (domain packs bind the vocabulary). Green = operational / available. **Amber = interaction-required alert only** (e.g. roster-call banner) — never a passive presence badge; signed-on/available badges are green (DR-04).
- Colour is never the sole indicator of status — triple encoding (**colour + icon + text**) is mandatory.

**Typography.**
- **DM Sans** — UI default. High x-height for outdoor readability; excellent at small sizes.
- **JetBrains Mono** — all identifiable codes (`OFC-…`, `Z-…`, `SR-…`, plates, amounts, lat/long). Tabular numerics for column alignment.
- **Plus Jakarta Sans** — admin dashboard section headers only (dispatcher/supervisor views).
- **No Inter, no Roboto, no system default** as primary.

**Spacing.** 8 px base with 4 px half-step. Nothing smaller. Page-level gutters are 16 px on mobile and 32–64 px on admin.

**Radius.** `4 · 8 · 12 · 16 · 9999`. Cards and buttons use 8 px. Pills (badges, avatars, status dots) use full. No rounded-everything — square corners on data tables, form cells, map legends.

**Elevation.** Four discrete steps — `sm · md · lg · xl`. Rest state for cards is `sm`; hover on admin cards steps to `md`. Modals and bottom sheets use `xl`. Dark mode shadows floor at 0.25 opacity so they survive against dark surfaces.

**Backgrounds.** Flat surfaces only. **No decorative gradients, no mesh blurs, no glassmorphism on operational screens.** The only permitted gradient is a subtle map-legend protection gradient when labels sit over aerial imagery. Map tiles themselves are muted so officer markers / zones / routes dominate.

**Imagery.** Cool, desaturated. Map is the primary "hero" across both products — there are no decorative photos of city streets, stock officers, or lifestyle imagery. When a product screenshot appears in marketing or onboarding, it's a map at Melbourne CBD zoom 15.

**Borders.** Default 1 px, `--civic-neutral-200`. Tables and form inputs share this rule. Dashed strokes are reserved for split/shared zone boundaries on the map (a physical-map convention).

**Shadows.** `sm` on cards at rest, `md` on hover/raised state, `lg` on popovers, `xl` on modals + bottom sheets. No inset shadows. No long coloured drop shadows.

**Animation.** Minimal, purposeful, fast.
- Hover / focus micro-interactions: `120 ms` with `cubic-bezier(0.4, 0, 0.2, 1)`
- Toggles, state changes: `200 ms`
- Sheet slides, page transitions: `350 ms`
- PTT transmit and Location Pulse confirmed: **1 Hz pulse**, CSS `@keyframes`, spring easing
- Code 1 alert banner: **no easing delay — instant snap to visible**
- `prefers-reduced-motion` disables pulse + slide; essential status transitions remain

**Hover & press states.**
- **Hover on admin:** background lightens one step (`neutral-50 → neutral-100` on rows; `primary → primary-light` on primary buttons); shadow steps from `sm` to `md` on cards.
- **Press on mobile:** 0.96 scale + darken one step (`bg-patrol-600 → bg-patrol-700`). Haptic feedback on PTT press/release and Code 1 SOS.
- **Disabled (RBAC-insufficient):** opacity 0.4 + lock icon + tooltip reading "Requires Manager access" — **never hidden**, so officers can see system structure.

**Transparency & blur.** Sparingly.
- Modal backdrop: `rgba(0,0,0,0.40)` plain, no blur.
- Zone polygons on map: 12 % fill, bumping to 25 % when selected.
- Map overlay pill legend: 92 % opacity over tile for readability.
- No `backdrop-filter: blur()` on operational screens; acceptable only in splash.

**Cards.** White surface · 1 px `neutral-200` border · 8 px radius · 16 px padding mobile / 24 px admin · `shadow-sm` rest → `shadow-md` hover. No coloured left-border accent cards (banned — reads as AI-template aesthetic).

**Layout rules.**
- CommandMAPS is desktop-first, min width 1024 px, sidebar 240 px (collapses to 64 px icon-only).
- EnforcementMAPS is portrait-only, `SafeAreaView` respected, status bar translucent over `--civic-primary-dark`.
- Map is always the background layer on both products. Data panels overlay — right-side collapsible panel on CommandMAPS, bottom sheet on EnforcementMAPS.
- Dispatch (split-authority) views swap the header accent from Civic Navy to Operations Teal so the context is unmistakable.

---

## 6. Iconography

**Primary set: Lucide.** `lucide-react` on CommandMAPS, `lucide-react-native`
on EnforcementMAPS. Sizes and strokes:

| Context | Size | Stroke |
|---|---|---|
| Inline with text | 16 px | 2 |
| Navigation / toolbar | 20 px | 2 |
| Action button | 24 px | 1.75 |
| Feature / empty state | 48 px | 1.5 |
| Map marker inner glyph | 20 px | 2 |

In this design system, Lucide is linked **from CDN** (esm.sh) in the preview
HTML and UI-kit HTML — no local icon bundles are copied. When building
production surfaces, use the `lucide-react*` packages directly.

**Custom domain icons.** When a glyph doesn't exist in Lucide (parking
meter, infringement book, patrol-zone boundary, Code21 badge), author a
custom SVG following the Lucide grammar: **24×24 viewBox, 2 px stroke,
`currentColor`, rounded caps + joins**. Store as `kebab-case.svg` in
`/assets/icons/`. Expose via a central `Icons.ts` barrel.

**No emoji as UI.** The legacy emoji glyphs in `AppShell.tsx` (`📊 👥
🗺️ 🔎`) are a known deviation from this system and should be replaced with
Lucide equivalents (`LayoutDashboard`, `Users`, `Map`, `Search`).

**No unicode character icons.** ASCII arrows (`←`, `→`), checkmarks (`✓`),
or dingbats are not substitutes for Lucide glyphs.

**No PNG icons.** Bitmap is forbidden for UI glyphs. Raster is permitted
only for the app launcher icon (delivered by Expo build) and third-party
logos where vector isn't available.

**Map markers.** Officer markers are a heading-aware directional
arrowhead SVG (32×32 bounding box) filled `--status-active` with a 2 px
`--civic-surface` stroke. Officer number labelled below in
`--font-mono` at `--text-xs`. This is a custom domain icon and lives
in the `OfficerMarker` component, not the icon library.

---

## 7. Colour reference — the why

| Token | Use | Why |
|---|---|---|
| `--civic-primary` `#1B2A4A` | App chrome, primary CTAs, map label text | Civic authority without militarisation; WCAG AAA on white |
| `--civic-secondary` `#1A7A6D` | Dispatch context, in-progress indicators, zone polygon fills | Distinct from primary to signal split-authority views |
| `--civic-accent` `#D4A843` | Splash wordmark, focus rings, active sort carets | High-visibility accent, not used for buttons to preserve signal |
| `--status-emergency` `#DC2626` | **Code 1 SOS only** | Never used decoratively — preserves the alarm signal |
| `--status-alert` `#F59E0B` | **Interaction-required alerts only** (roster-call banner) | Amber demands a response step; never a passive presence badge (DR-04) |
| `--presence-available` green · `--presence-active-offline` grey-on-green · `--presence-inactive` grey | Presence badges | Available = green; on duty with lost connectivity = "Active offline"; signed off = "Inactive offline" |
| `--status-active` `#16A34A` | On patrol, submit success | Green = operational, healthy |
| `--status-issued` `#7C3AED` | Administrative outcome recorded (parking pack: Infringement / No Report) | Purple = administrative outcome state |
| `--status-pending` `#2563EB` | In progress, Received | Blue = neutral-active, not alarming |

---

## 8. Anti-patterns (hard blockers)

From section 12 of the profile — these will be rejected in review:

- Generic AI-aesthetic purple gradients or neon accent colours
- Inter / Roboto / system-default as primary font
- Rounded-everything pill buttons outside badge/chip contexts
- Decorative background gradients, mesh blurs, glassmorphism on ops screens
- Skeleton loaders that don't match real content layout
- Infinite scroll on data tables (use pagination — 25 default)
- Toast notifications for Code 1 / Code 2 (persistent banner only)
- Colour as the sole status indicator (always pair with icon + text)
- Inline `styles` prop on Google Maps (Cloud Console Map ID only)
- Raw hex in component code (always reference tokens)

---

*This profile is the single source of truth for CivicMAPS visual identity.
Deviations require documented justification and a version bump.*
