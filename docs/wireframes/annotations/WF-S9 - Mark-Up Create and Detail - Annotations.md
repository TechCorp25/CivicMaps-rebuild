# CivicMAPS Rebuild — Wireframe Annotation Document
## Sequence 9 — EnforcementMAPS Mobile: Mark-Up (Digital Chalking) Create & Detail

**Document ID:** WF-S9-ANN
**Status:** Draft for owner review
**Companion artefact:** `Wireframes S9 - Mark-Up Create and Detail.dc.html`
**Fidelity:** Low-fi (structure only). Hi-fi follows owner sign-off.
**Date:** 2026-08-08
**Source repository:** `CivicMAPS/CivicMaps-preview` @ `main`

This sequence covers the officer-facing (EnforcementMAPS mobile) Mark-Up feature —
tyre-chalking overstay enforcement, in both its physical (chalk mark) and digital
(ANPR live plate-scan) capture modes: `enforcementmaps/components/markup/{MarkUpForm,
ActiveMarkUpList,MarkUpCompletionModal,MarkUpArchive}.tsx`, `enforcementmaps/
components/chalking/{ChalkingScreen,ChalkingCameraView}.tsx`, `enforcementmaps/hooks/
useMarkupTimer.ts`, `shared/contracts/{markup,digital-chalking}.ts`, `shared/markup/
markup-mandatory-capture.ts`. **Out of scope for this pass:** the CommandMAPS admin
Mark-Up view (`MarkUpPage.tsx`, `MarkUpCreateForm.tsx`, `MarkUpArchive.tsx` desktop)
and the EnforcementMAPS **Web** live-capture surface (`LiveCaptureView.tsx`,
`CaptureReviewModal.tsx` — a separate, browser-based capture flow distinct from the
mobile camera screens 9e/9f below) — both flagged in the prior handoff as spanning a
separate sequence; see Next set.

### How to read this document

Same convention as prior sequences: each numbered marker maps to a row below,
scoped to its screen (`9a.2` = marker 2 on screen 9a).

---

## Screen 9a — New Mark-Up: create form

**Status:** EXISTING. **Source:** `MarkUpForm.tsx`.

| # | Element | Annotation |
|---|---|---|
| 9a.1 | Physical / Digital split buttons | There is no single "Save" — the form's two terminal buttons choose the capture workflow that follows. "Physical" keeps today's chalk-and-return behaviour; "Digital" saves the same record and navigates straight into the live ANPR capture screen (out of scope here — see EnforcementMAPS Web note above). **Colour correction:** `MarkUpForm.tsx` hardcodes a raw `#D97706` (not a design-system token) for its header, "Use my location" button, active Side-of-Street button, and both mode buttons. This wireframe paints all five with Civic Navy `#1B2A4A` instead — the token this screen's primary chrome/CTAs should carry per the profile (`--civic-primary`, §5/§7) — rather than reproducing the raw-hex deviation. See OQ9-1.
| 9a.2 | Address type-ahead badges (S/H/G) | Same street/history/geocode badge convention already flagged at OQ6-1 (no on-screen legend), now confirmed present on Mark-Up's own address search too. |
| 9a.3 | Between Streets — mandatory once GPS is known | Enforced by `validateMandatoryCapture` (system policy `MARKUP_BETWEEN_AND_SIDE`): once a GPS fix exists, Between Street A/B and Side of Street cannot be blank at submit — the auto-fill cascade is expected to have already populated them, but a failed auto-fill (outside the seeded CBD grid) still blocks submit with a field-specific message rather than allowing a partial record. |
| 9a.4 | Side of Street | Single-select N/S/E/W, GPS-derived by default via a local street-position helper (falls back to a server between-streets lookup outside the seeded grid) — same editable-after-auto-fill pattern as 9a.3. |
| 9a.5 | GPS footer + accuracy warning | Coordinates shown to 6 decimal places with accuracy in metres; a warning appears above ~30m accuracy suggesting the address may belong to a nearby street — the officer's live GPS is the record of truth submitted to the server and is deliberately never overwritten by a picked address suggestion (that would let the dropdown silently substitute the recorded location). |

**Native-UI conformance:** the form wraps its long field list in a `ScrollView` (per `building-native-ui` guidance) — unlike Sequence 8's deliberately viewport-fit wizard steps, this screen is drawn taller than a real device here purely so the wireframe shows the whole form without cropping.

---

## Screen 9b — Active Mark-Ups list

**Status:** EXISTING. **Source:** `ActiveMarkUpList.tsx`, `useMarkupTimer.ts`.

| # | Element | Annotation |
|---|---|---|
| 9b.1 | DIGITAL badge + Resume button | Only rendered when `markup.mode === "digital"` — lets the officer jump back into the live ANPR capture screen for that segment without needing to open the create form again. |
| 9b.2 | Timer badge | Ticks down once per second while active; switches to a fixed "EXPIRED" label with a heavier red-amber (2px) border once `timerEndDatetime` passes — a scheduled OS notification (with a "Mark-Up Timer Expired" body and haptic-equivalent Android channel override for Do-Not-Disturb) fires in parallel so the officer is alerted even with the app backgrounded. |
| 9b.3 | Row tap → completion | Tapping ANY row — active or already expired — opens the completion screen (9c); early completion before the timer expires is allowed, the same handler serves both cases. |
| 9b.4 | Empty state | The whole section renders nothing (returns `null`) when there are no active mark-ups — no "No active mark-ups" message, unlike this rebuild's usual empty-state convention elsewhere. |

---

## Screens 9c-i / 9c-ii — Mark-Up Expired: completion (Physical / Digital)

**Status:** EXISTING. **Source:** `MarkUpCompletionModal.tsx`. Same header and detail
card for both modes; the card below it branches structurally on `markup.mode`.

| # | Element | Annotation |
|---|---|---|
| 9c-i.1 | Chalk Mark Evidence card | Fixed to the mark location recorded at creation (9a) — shown as a reminder of exactly which tyre/corner to check for a chalk mark still present on return, not an editable field. |
| 9c-i.2 | Marks Collected | Required integer, validated ≥0 at submit (native alert blocks Complete otherwise); `autoFocus` on mount since this is the only input the officer needs to fill in. |
| 9c-ii.1 | Digital capture summary | Computed client-side from `listSegmentScans`: unique plates (`Set` over scanned plate values), offending count (`overstayed` flag), and total captures. Shows "No scans recorded — no rescan performed yet." when the total is zero rather than a bare 0/0/0. |
| 9c-ii.2 | No manual count field | Digital mode has nothing for the officer to type — Complete still submits `marksCollected: 0` under the hood to satisfy the shared server contract (`CompleteMarkupSchema` requires the integer regardless of mode), a schema shape not yet split by capture mode. |

---

## Screen 9d — Mark-Up Archive: search & results

**Status:** EXISTING. **Source:** `MarkUpArchive.tsx`.

| # | Element | Annotation |
|---|---|---|
| 9d.1 | Zone filter | Populated from the client-side `PATROL_ZONES` constant, not a server-driven reference list — unlike Period, which comes from `fetchReferenceData()`. |
| 9d.3 | Search button | `MarkUpArchive.tsx` also hardcodes the same raw `#D97706` for this button (and its loading spinner). Repainted here as Civic Navy `#1B2A4A`, same correction and rationale as 9a.1. |
| 9d.2 | Marks badge — mode-blind | Rendered whenever `marksCollected != null`; a digital-mode row completed with 0 manual marks (9c-ii.2) reads identically to a physical row that genuinely collected zero marks. The active list (9b.1) carries a DIGITAL badge — the archive list carries no equivalent, so mode is not distinguishable here without opening the record. See OQ9-2. |

---

## Screens 9e / 9f — Digital Chalking: segment screen & live capture (camera)

**Status:** EXISTING. **Source:** `ChalkingScreen.tsx`, `ChalkingCameraView.tsx`,
`digitalChalkingService.ts`, `shared/digital-chalking/frame-aggregator.ts`. Reached
from 9b's Resume button, or directly after saving a Digital mark-up on 9a.

| # | Element | Annotation |
|---|---|---|
| 9e.1 | Offending decision banner | Shown after any confirmed scan; when the plate is flagged offending the banner surfaces the auto-generated infringement PIN inline — the officer never manually triggers issuance for a digital catch, unlike the Parking wizard's explicit Issue/Print step (Sequence 8). |
| 9e.2 | Single / Multi mode | Single: the live-capture feed stops after the first confirmed plate and hands the result back to this screen. Multi: the feed keeps running after each confirm, sweeping the whole segment, with a configurable dedup window (shown: 90s) so the same stationary plate isn't re-confirmed every cycle. |
| 9e.3 | Scans on this segment | Refreshes after every confirmed scan; GPS itself is captured once on screen mount and only re-refreshed at confirmation time, not continuously — a deliberate trade-off to avoid flooding the location subsystem while still shipping fresh coordinates per scan. |
| 9e.4 | Config readout | `confirmFrames`/`minConfidence`/`sampleIntervalMs`/`provider` are server-configured (`getChalkingConfig`) with a hardcoded local fallback if that call fails — the officer sees but cannot edit these. |
| 9f.1 | Live status bar | Cycles through "Aligning camera…" → "Locking on {plate} (n/needed)" → "Confirmed {plate}" as the `FrameAggregator` accumulates consecutive matching frames; a low-confidence or non-matching frame resets the streak rather than accumulating toward confirmation. |
| 9f.2 | Viewfinder lock state | Border colour is the only real-time confirmation signal (white idle → amber locking → green confirmed) — paired with the on-box percentage text and the status bar copy, so the state is not colour-only. |
| 9f.3 | Frames / Hits counters + Pause/Resume | Pause halts frame submission (camera preview keeps rendering); Resume restarts the sampling loop at the configured interval. Counters are session-local to this capture screen instance, not a running segment total. |

---

---

## Screen 9g — Scanned plates list, per segment (proposed)

**Status:** PROPOSED. No dedicated screen exists in `ChalkingScreen.tsx` for this —
today's embedded "Scans on this segment" list (9e.3) shows plate + timestamp only,
in a compact single-line row. This full-screen variant is one row per scan with
three fields: the captured plate image, capture date/time, and the OCR-extracted
plate number as an editable field.

| # | Element | Annotation |
|---|---|---|
| 9g.1 | Plate image thumbnail | The frame the ANPR engine matched on, stored per scan — not shown anywhere today. Needed so the officer can visually confirm a plate before relying on it, given known OCR misread pairs (0/O, 1/I, 8/B). |
| 9g.2 | OFFENDING row | Same red treatment as 9e's inline offending row — carried through here so a plate needing a second look is easy to spot in a longer list. |
| 9g.3 (all rows) | OCR plate — editable | Each row's plate number is a corrigible field, not read-only text. A correction should re-run the offending/due-time check against the corrected plate rather than silently keeping the original OCR value against the wrong plate — see OQ9-6. |

## Screens 9h / 9i-i / 9i-ii — EnforcementMAPS Web: Digital Mark-Up Live Capture

**Status:** EXISTING. **Source:** `enforcementmaps-web/src/features/markup/
{LiveCaptureView,CaptureReviewModal}.tsx`, `chalkingApi.ts`. This is a fourth,
real surface — `enforcementmaps-web` — a browser companion to the mobile app,
same backend/data, for in-office officer review on desktop/tablet. Resolves the
web half of OQ9-3.

| # | Element | Annotation |
|---|---|---|
| 9h.1 | Viewfinder guide box | `getUserMedia`-driven equivalent of 9f's native camera loop, same confirm-on-streak `FrameAggregator`. |
| 9h.2 | Done capturing | Every confirmed plate opens 9i for review before it's recorded — unlike 9f's native path, there is no auto-record branch here. |
| 9i-i.1 | Captured plate frame | Still image captured at confirm, editable alongside the fields below — the officer can correct any ANPR misread before submit. |
| 9i-i.2 | Plate field | Plate/State are forced to uppercase on submit; Make/Colour/Sign/Days/Times pre-fill from the ANPR result + parent Mark-Up and are fully editable. |
| 9i-ii.1 | Offending header/button | Switches to `status-emergency` red with copy "Approve & File" when the server's cross-check flags the plate as overstayed. |
| 9i-ii.2 | Soft-cap banner | Warns at 100 captures (hard stop at 500) per this app's own operating brief — a cap that has no equivalent in the native 9e/9f flow. |
| 9i-ii.3 | Approve & File (red) | See OQ9-8 — red used for a non-Code-1 state. |

## Expo / React Native build-readiness (EnforcementMAPS mobile, 9a–9g)

Checked against the `building-native-ui` skill (Expo Router + React Native conventions).
Applies to 9a–9g only — 9h/9i-i/9i-ii (EnforcementMAPS **Web**, browser `getUserMedia`)
and 9j–9m (CommandMAPS, React DOM) are not native surfaces and are exempt.

| Screen | Pattern shown | Correct native implementation |
|---|---|---|
| 9a | Long field list, drawn tall to show uncropped | `<ScrollView contentInsetAdjustmentBehavior="automatic">`, not `SafeAreaView` (removed from core RN) — already called out in-file; GPS coordinate readout should be `<Text selectable>` so the officer can copy it. |
| 9b | Countdown timer digits (`01:42:07`) | `fontVariant: 'tabular-nums'` on the timer `<Text>` so digits don't jitter column-width every second tick. |
| 9c-i/9c-ii | Marks Collected numeric input; capture-summary numbers | `<TextInput keyboardType="number-pad">` for entry; summary counts (14/3/17) also want `tabular-nums`. |
| 9d | Date From/Date To fields | Native `@react-native-community/datetimepicker`, not plain text inputs — per `building-native-ui`'s controls reference, this is the correct native date-picker primitive, not a web `<input type="date">` equivalent. |
| 9e | Single/Multi toggle | Native `SegmentedControl` (2 short options) rather than the two custom pill buttons drawn here. |
| 9e/9f | Frames/Hits counters, scan count | `tabular-nums` throughout so the digits don't shift the layout on every frame tick. |
| 9f | Pause/Resume, plate-lock confirm | `expo-haptics` on confirm/pause per the skill's Behavior section — no haptic call is implied anywhere in the current `ChalkingCameraView.tsx` source, worth flagging to engineering. |
| 9g | Plate image thumbnail | `expo-image` `<Image>`, not an `<img>` intrinsic. OCR plate field, once editable, is a plain `<TextInput>`; the pre-edit display value should also be `<Text selectable>`. |

None of this changes what's drawn — these are implementation-primitive notes for the engineering handoff, not visual changes.

## Screens 9j–9m — CommandMAPS: Mark-Up compliance & review surface

**Status:** PROPOSED (reframes existing read access). **Source:** `commandmaps/src/
features/markup/{MarkUpPage,MarkUpArchive}.tsx`, `shared/roles.ts`. Nested under the
Look Up hub's "Mark ups" tab (5g). Resolves the CommandMAPS half of OQ9-3: Team
Supervisor / Compliance Coordinator / Compliance Lead get a team- or branch-scoped,
read-only review of officers' Mark-Ups — active in real time and historically —
without any capture/creation capability, which stays exclusively in EnforcementMAPS
(mobile + web) per the brief.

| # | Element | Annotation |
|---|---|---|
| 9j.1 | + New Mark-Up (disabled) | `MARKUP_WRITE_ROLES` is `DISPATCHER`-only in `shared/roles.ts` — this role structurally cannot create. Shown disabled (opacity .4 + lock icon + "Requires Dispatcher access" caption) per the profile's RBAC-insufficient pattern (§5) rather than omitted, so the role can still see the system's shape. This is the pattern OQ5-3 flagged Directory for getting wrong — done correctly here. |
| 9j.2 | Filter row | Status segmented control mirrors `MarkUpPage.tsx`'s existing `filter.status` enum (`""`/`active`/`completed`) relabelled Active/Completed/All; Team filter and Mode filter (Physical/Digital) are new. |
| 9j.3 | Mode chip + offending tag per row | Extends OQ9-2's fix (mode visibility) to the admin layer — today's `MarkUpPage.tsx` list shows neither mode nor offending count anywhere. |
| 9k.1 | Digital Capture Review card | New section on the existing detail drawer; capture summary numbers reused from 9c-ii for the same record for cross-surface consistency. |
| 9k.2 | Audit Trail defaulted open | Deliberate deviation from the mobile-admin default (collapsed) — traceability is this surface's whole purpose. |
| 9l.1–9l.2 | Read-only OCR field + Flag for follow-up | Corrections stay with the officer (OQ9-6); flagging is a new compliance-only action. |
| 9l.3 | Pagination footer | Explicit Prev/Next + "Showing 4 of 17" rather than infinite scroll, per the profile's anti-pattern list (§8). |
| 9m | Tablet layout | Reuses 2b's existing drawer→full-screen mobile-nav convention at the CommandMAPS responsive breakpoint (profile §5, 1024px desktop-first) rather than inventing a new pattern; 2-column field grid collapses to 1, capture tiles 3→2 per row. |

## Open questions carried forward

- **OQ9-1** — `MarkUpForm.tsx` and `MarkUpArchive.tsx` hardcode a raw `#D97706` (not a token, not in the design profile's palette at all) for their primary buttons/header — confirmed by reading both files directly. `ActiveMarkUpList.tsx` and `MarkUpCompletionModal.tsx`, by contrast, correctly reference `status.alertDark`/`status.alert`/`civic.secondary` tokens throughout. Same class of raw-hex-vs-token inconsistency already flagged at OQ8-2, now confirmed present (and more severe — an off-palette colour, not just an unrouted token) in two of the four Mark-Up components. This wireframe (9a, 9d) paints the corrected Civic Navy in place of the raw hex; recommend the same fix land in the two source files.
- **OQ9-2** — Archive rows give no visual signal of capture mode (9d.2); a digital mark-up completed with 0 scans and a physical mark-up that genuinely collected 0 marks render an identical "0 marks" badge — worth a mode chip in the archive list to match the active list's DIGITAL badge.
- ~~OQ9-3~~ — **resolved**: EnforcementMAPS Web (9h, 9i-i, 9i-ii) and CommandMAPS's compliance-review surface (9j–9m) are both now screened, closing out this pass across all four surfaces.
- **OQ9-4** — `CompleteMarkupSchema` requires `marksCollected` as a plain integer for both capture modes (9c-ii.2); a digital completion has nothing meaningful to report there and always sends `0` — worth confirming whether the contract should branch on `mode` before more surfaces are built against it.
- **OQ9-5** — 9f's Frames/Hits counters reset on every camera-view mount and are never persisted — there is no running per-segment or per-shift capture-volume metric anywhere in the app.
- **OQ9-6** — 9g proposes an editable OCR-plate field per scan; no defined behaviour yet for what a correction should trigger (re-check offending status/due time against the corrected plate? re-open an already-fired infringement if the original OCR plate was wrong and already auto-issued per 9e's note?). Needs a decision before this becomes more than a reference mock.
- **OQ9-7** — No screen, route, or API contract exists yet for 9g (per-scan image + correction) — raised alongside OQ9-6 as the two open items blocking this screen moving past proposed.
- **OQ9-8** — 9i-ii's offending-state header/Approve button use emergency red (`status-emergency`) for a plate that exceeded its Mark-Up period — not a Code 1 SOS. The design profile reserves red for Code 1 only (§5, §7); this is a pre-existing repo convention (`CaptureReviewModal.tsx`), not something introduced by this wireframe pass, but worth flagging alongside OQ9-1/OQ9-2 as the same family of status-colour-repurposing issue in the Mark-Up feature specifically.
- **OQ9-9** — 9j's "Team: Z-MAC" scope is aspirational: `MarkUpPage.tsx`'s `fetchItems()` calls `/markups` with only a status filter, no team/branch scope, even though the generic `actorHasScopeOverObject`/`buildObjectScopeSql` helpers already exist in `shared/roles.ts` and are wired into other admin surfaces (assignments, audit per that file's own comments). Needs backend work to wire markup list/detail queries through the same scoping helper before this framing is accurate.
- **OQ9-10** — Digital capture summary and per-scan data (unique plates, offending, per-scan plate image + OCR) have no admin-facing API today — the `Markup` interface in `MarkUpPage.tsx` has no scan/capture fields at all. 9k's capture card and 9l's scan list are proposed and need a backing endpoint (extends OQ9-7, which flagged the same gap mobile-side).
- **OQ9-11** — "Flag for follow-up" on captures (9l) is a new compliance action with no backing data model or endpoint — needs a decision on whether flags are per-scan notes, a status field, or a separate compliance-review record before this becomes more than a reference mock.

## Next set — not yet scheduled

All four Mark-Up surfaces (EnforcementMAPS mobile + Web, CommandMAPS) are now covered.
Settings (CommandMAPS + EnforcementMAPS Web + EnforcementMAPS mobile), Audit —
each its own large feature file and sequence.
