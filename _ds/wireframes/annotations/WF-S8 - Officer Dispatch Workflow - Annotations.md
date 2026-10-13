# CivicMAPS Rebuild — Wireframe Annotation Document
## Sequence 8 — EnforcementMAPS Officer Dispatch Workflow

**Document ID:** WF-S8-ANN
**Status:** Draft for owner review
**Companion artefact:** `Wireframes S8 - Officer Dispatch Workflow.dc.html`
**Fidelity:** Low-fi (structure only). Hi-fi follows owner sign-off.
**Date:** 2026-08-07
**Source repository:** `CivicMAPS/CivicMaps-preview` @ `main`

This sequence covers the officer-facing (EnforcementMAPS mobile) counterpart to
Sequence 7's dispatcher workbench: `enforcementmaps/tabs/index.tsx`,
`enforcementmaps/components/dispatch/{ActiveDispatchList,IssueInfringementWorkflow,
NoReportWorkflow,VehicleDetailsForm}.tsx`, `enforcementmaps/services/dispatchService.ts`.
Checked against the `building-native-ui` Expo Router conventions (safe area,
hit targets, sheet/modal patterns) per the queued sub-agent spec — findings
below and in Open Questions.

### How to read this document

Same convention as prior sequences: each numbered marker maps to a row below,
scoped to its screen (`8a.2` = marker 2 on screen 8a).

---

## Screen 8a — Patrol map: active dispatch bottom sheet (Dispatched Active)

**Status:** EXISTING. **Source:** `tabs/index.tsx` (`bottomPanel`), `ActiveDispatchList.tsx`.

| # | Element | Annotation |
|---|---|---|
| 8a.1 | Zone banner | Only rendered while `assignment` is truthy; background is `assignment.zoneColor` when set, falling back to `civic.secondary` — the banner has no "unassigned" state of its own, it simply disappears. |
| 8a.2 | Code 2 / Mark-Up / Archive row | Out of scope for this sequence — Code 2 is documented at screen 1h, Mark-Up create/detail is queued as its own upcoming sequence. Shown dimmed here only to give the dispatch card below correct visual context. |
| 8a.3 | Status badge — Dispatched | `getStatusColor("DISPATCHED_ACTIVE")` → `status.alert` (`#F59E0B`); paired with a `Radio` icon rendered only for this one status and `IN_PROGRESS` (`Navigation` icon) — `ATTENDED`/`PIN_ISSUED` badges carry no icon. |
| 8a.4 | Description | `numberOfLines={2}` — truncates with an ellipsis past two lines; there is no "read more" affordance in this component. |
| 8a.5 | Acknowledge button | Only rendered for `status === "DISPATCHED_ACTIVE"`; calls `onAcknowledge(item.id)` directly with no confirmation step — the highest-consequence-looking button in the card is actually the least destructive one. |
| 8a.6 | Bottom-sheet height | `bottomPanel` is capped at `maxHeight: "40%"` of the screen in the real component; drawn taller here to show a full uncropped card. The real sheet scrolls internally once content exceeds 40%. |

**Native-UI conformance:** the sheet is a plain `View` inside the screen, not an Expo Router `formSheet` (`Stack.Screen options={{ presentation: "formSheet" }}`) or React Native `Modal` — see OQ8-7.

---

## Screen 8b — Dispatch card states & status legend

**Status:** EXISTING. **Source:** `ActiveDispatchList.tsx` (`renderItem`, `getStatusColor`, `statusLabels`).

| # | Element | Annotation |
|---|---|---|
| 8b.1 | In Progress badge | `status.pending` (`#2563EB`) — a fourth distinct hue alongside alert/active/issued, none of which are shared with any Code21 admin-side status colour from Sequence 7 (those use a separate `statusColors` map keyed to the same enum values but different hex). |
| 8b.2 | Action row (Vehicle / Infringement / No Report) | All three render together for `IN_PROGRESS` and `ATTENDED` whenever their respective `onX` prop is passed — `tabs/index.tsx` always passes all three, so an officer always sees all three regardless of whether a PIN already exists (see OQ8-6). |
| 8b.3 | Vehicle summary chip | Only shown if at least one of make/bodyType/colour/registration is set; fields present are joined with " • ", omitting any that are missing (no placeholder dashes). |
| 8b.4 | PIN badge | Presence of `parkingInfringementNumber` is the only signal in this list view that a record is locked downstream (vehicle form, admin detail) — the card itself gives no other visual lock indicator. |
| 8b.5 | Status colour key | Not a real in-app legend — none exists in the source; compiled here for reference since the four hues (amber/blue/green/purple) have no on-screen key anywhere in the product (extends OQ6-1's "no legend" pattern to this surface). |

---

## Screen 8c — Vehicle Details form

**Status:** EXISTING. **Source:** `VehicleDetailsForm.tsx` (`TypeToFilterField`, `handleSave`, `isLocked`).

| # | Element | Annotation |
|---|---|---|
| 8c.1 | SR# subtitle | Falls back to literal "N/A" if `serviceRequestNumber` is null — same fallback convention as the admin detail view (7b.2). |
| 8c.2 | "No Vehicle Details on Record" banner | Mutually exclusive with the blue "Dispatched Vehicle Details" banner shown when any existing field is set; this component uses raw hex (`#fef3c7`/`#92400e`) rather than the `civic`/`status` theme tokens `ActiveDispatchList.tsx` imports — see OQ8-2. |
| 8c.3 | Make — type-to-filter dropdown | Typing alone does not commit a value — `onChange` only fires when an option row is tapped. Typing "To" and stopping there (no selection) leaves `make` at its previous value, so Save stays disabled even though the field visibly shows "To". |
| 8c.4 | Registration | Forced uppercase on every keystroke (`.toUpperCase()`), `maxLength={7}` — no visible character counter, so the field simply stops accepting input at 7 with no explanation shown to the officer. |
| 8c.5 | Save Vehicle Details (disabled) | Disabled while `!hasChanges \|\| saving \|\| isLocked` — `hasChanges` compares all four fields against their original values, so any single committed change (not just typing) re-enables it. |
| 8c.6 | Locked-state banner | Rendered whenever `dispatch.parkingInfringementNumber` is truthy; replaces nothing else on the form — the fields are still visible and still show their (initial) values, just non-interactive and Save is disabled regardless of `hasChanges`. |

**Native-UI conformance:** the custom dropdown re-implements a picker with `TextInput` + absolutely-positioned option list rather than the platform `Picker`/`DateTimePicker`-style native controls the `building-native-ui` guide recommends for structured pick-one input — reasonable given the type-to-filter requirement (not a plain enum picker), but worth confirming intentional.

---

## Screens 8d-i–8d-iv — Issue Infringement: proposed multi-step workflow

**Status:** PROPOSED — not in current source. Owner-directed expansion of the single-screen
`IssueInfringementWorkflow.tsx` into a 4-step wizard (Location & Vehicle → Evidence & Officer
Notes → Offence & Time → Review & Issue), scoped to Parking Enforcement only for this pass.
Animal Management / Rangers use the same step shape with a department-specific step 1
(vehicle fields swap for animal/owner details) — deferred, not screened here. Every step is
sized to fit the phone viewport with no scroll, per the accuracy/speed requirement for
in-field entry; where a combined step didn't fit, it would be split further (in this design,
all four combined groups fit).

| # | Element | Annotation |
|---|---|---|
| 8d-i.1 | GPS auto-fill badge | Location fields (Street Segment, Between Streets, Side of Street, Parking Area, EP/PS number) are proposed to auto-populate from handset GPS cross-referenced against a municipal parking-area/EP-PS lookup — all remain user-editable, since GPS/lookup accuracy at a specific kerb segment can't be guaranteed. |
| 8d-i.2 | Between / And streets | Two independent fields ("Between" = first cross street, "And" = second), not a single combined value — lets the officer correct just one side in the field without retyping both; both lists are filtered to the chosen Street Segment only. |
| 8d-i.3 | Side of Street | Compass-based single-select (N/E/S/W/Centre) rather than free text — determines which side's PA/EP-PS number applies. |
| 8d-i.4 | Parking Area / EP-PS grid | PA number is derived from segment + between-streets; EP (Easy Park) vs PS (PayStay) numbering is municipality-specific — which scheme applies is a per-council configuration, not an officer choice. |
| 8d-i.5 | Vehicle Details | Same four fields as the existing `VehicleDetailsForm.tsx` (Make/Body Type/Colour/Registration), folded into the wizard rather than a separate post-hoc edit screen — for other departments this section is replaced entirely (e.g. Animal Management → animal details + owner/person-in-control details). |
| 8d-ii.1 | Evidence thumbnails | Minimum 3 photos, shown met here (3/3, green check tiles) — a compact thumbnail grid replaces the No Report flow's full-width photo-card list (8e) purely for space; same underlying capture mechanism. |
| 8d-ii.2 | Evidence override toggle | New: when fewer than 3 photos can be captured, a manual override switch reveals a required reason field (not pictured toggled-on) — replaces the current hard block used in the No Report flow (8e.4) with an auditable exception path. |
| 8d-ii.3 | Officer Notes | Auto-populated from a department + offence-type template, remains fully editable pre-issuance. |
| 8d-ii.4 | Post-issuance immutability | New rule: after the PIN is issued, notes and evidence may only be appended, never edited or removed — existing entries become permanently locked, mirroring the admin-side PIN lock pattern from Sequence 7 (7c.4). |
| 8d-iii.1 | Selected offence chip | Offence selection collapses to a single summary chip with a "Change" link once made, instead of leaving the full ~100-row scrollable list on screen — reachable only by tapping Change (reopens 8d list, not pictured). Which offences are selectable is proposed to be filtered by the officer's department + Designated Work Group. |
| 8d-iii.2 | Offence detail grid | Unchanged from the current ID/Penalty/Offence Date/Due Date fields (8d.2 in the prior single-screen design). |
| 8d-iii.3 | Time From (locked) | New: system-captured and injected, not editable for offences that are "instant-on" at detection (e.g. loading-zone overstay) — distinct from the current single `offenceTime` field's editability rule keyed to `editableOffenceTime`. |
| 8d-iii.4 | Time To (always editable) | New: captured at the moment of offence-type selection, but — unlike Time From — remains editable across every offence type, not just the ~3 codes that unlock time editing today. |
| 8d-iii.5 | Issuance Time (locked, pending) | New: not populated until the moment of print/issue; shown as a placeholder ("— captured at print") throughout the wizard. |
| 8d-iv.1 | Time summary row | Surfaces all three time values together for the first time — makes explicit to the officer which values are locked vs. editable before they commit. |
| 8d-iv.2 | Confirm checkbox | New explicit accuracy confirmation gate before issuance — the current single-screen flow has no equivalent affirmative step, going straight from "Save / Print" to the success alert. |
| 8d-iv.3 | Issue / Print | This is the point the PIN is generated and the record locks (triggers the post-issuance immutability rule at 8d-ii.4); "Print" was previously vestigial copy on a button that only called the API (see legacy note below) — under this design Review is the last editable moment, so committing here should be the one place print is genuinely wired up. |

**Legacy behaviour being replaced:** the current `IssueInfringementWorkflow.tsx` is a single
scrolling form with one `offenceTime` field, a "Save / Print" button whose handler never
actually prints, and no review/confirm step — see prior findings folded into 8d-iii/8d-iv above.

**Native-UI conformance (checked against `building-native-ui`):** all four steps are plain
`View` compositions inside the tab screen (same pattern flagged at OQ8-7), not an Expo Router
`formSheet` — a 4-step wizard with Back/Next is exactly the dynamic-sheet case the guide's
`presentation: "formSheet"` + `sheetAllowedDetents` pattern targets. Safe-area handling isn't
shown as a manual `Platform.OS` constant here (unlike 8e/OQ8-8), but no step wraps its content
in a `ScrollView contentInsetAdjustmentBehavior="automatic"` either — the guide's default
recommendation for any routed screen. Back/Next buttons measure ~44px tall in this layout,
meeting the ≥44px hit-target minimum. See OQ8-16.

---

## Screen 8e — No Report: evidence capture

**Status:** EXISTING. **Source:** `NoReportWorkflow.tsx` (`capturePhoto`, `handleSubmit`, `MIN_PHOTOS`).

| # | Element | Annotation |
|---|---|---|
| 8e.1 | Header border | `borderBottomColor: status.issued` (purple `#7C3AED`) on a `civic.primaryDark` header — no evident semantic tie between "issued" (PIN colour) and the No-Report flow, which explicitly does *not* issue a PIN; likely copy-pasted from a PIN-related screen. |
| 8e.2 | Remove-photo button | 28×28px circular hit target — below the DS's own 44px minimum mobile hit-target guidance; the only way to remove a captured photo. |
| 8e.3 | Progress dots | Purely decorative — 3 dots track `MIN_PHOTOS`, with extra dots appended (different colour) for photos beyond the minimum; dots do not respond to tap. |
| 8e.4 | Submit No Report (disabled) | Gated on `photos.length >= MIN_PHOTOS` (hardcoded to 3); tapping while disabled does nothing silently, since the `disabled` prop blocks `onPress` — there is no inline message on the button itself explaining why it's disabled (the count in the header subtitle is the only cue). |
| 8e.5 | Header padding | `paddingTop: Platform.OS === "ios" ? 50 : 16` — a manual `Platform.OS` safe-area constant instead of `react-native-safe-area-context` insets, so the hardcoded 50px will misalign on notchless/Dynamic-Island/foldable devices outside whatever device this was tuned on. Flags against the `building-native-ui` safe-area guidance. |

**Native-UI conformance:** confirms/extends 8e.5 — this is the only screen in the dispatch workflow with a custom safe-area hack rather than relying on the screen's natural inset handling.

---

## Screen 8f — Native alert dialogs (Alert.alert)

**Status:** EXISTING. **Source:** `NoReportWorkflow.tsx`, `IssueInfringementWorkflow.tsx` (all via `Alert.alert`).

| # | Element | Annotation |
|---|---|---|
| 8f.1 | "PIN Issued" success alert | Single "Done" action calls `onComplete` directly — this is the *only* confirmation the officer sees that the infringement was issued; there is no persistent success state drawn in the app itself once the alert is dismissed. |
| 8f.2 | "Confirm No Report" destructive alert | Two-step confirm: the in-form Submit button first checks the 3-photo minimum, then this native alert gates the actual submit — a second native alert also exists for "Discard Evidence?" if the officer cancels with photos already captured (not pictured; same two-button pattern). |
| 8f.3 | "Location Required" permission alert | Single "OK" action calls `onCancel` — functionally identical to a hard stop, not a dismiss: tapping the only button on the dialog exits the entire No-Report workflow rather than letting the officer retry after granting permission. |

**Native-UI conformance:** `Alert.alert` is itself a correct native primitive per platform conventions, but every terminal/destructive decision in this workflow (submit, discard, insufficient evidence, camera permission denied, location permission denied) routes through it rather than any in-app sheet or inline state — extends OQ3-1 (web `alert()`) to the mobile surface; see OQ8-4.

---

## Screen 8j — Native alerts → toast / inline banner (Session 16b)

**Status:** PROPOSED — applies OQ3-1's Session 16 decision to OQ8-4's mobile `Alert.alert` dialogs.

| # | Element | Annotation |
|---|---|---|
| 8j.1 | "PIN Issued" → toast | 8f.1 is a fire-and-forget success notice with a single "Done" — the "one-off confirmation" half of OQ3-1's split, so it becomes a transient toast. |
| 8j.2 | "Location Required" → inline banner | 8f.3 functions as a hard stop, not a dismiss (per its own annotation) — closer to a blocking validation failure than a one-off notice, so it becomes a persistent inline banner with a Retry action the officer can act on without leaving the screen. |
| — | "Confirm No Report" — deliberately not redrawn | 8f.2 is a two-choice destructive decision, not a notification; neither half of OQ3-1's toast/banner split applies. Stays a native dialog for now — its replacement (a styled in-app confirm) is OQ5-2's territory, not this sweep's. |

**OQ8-4 status:** partially resolved by this screen (informational alerts only); the destructive-confirm half is re-scoped into OQ5-2 rather than closed here.

---

## Screens 8h-i–8h-iv — Issue Infringement: Animal Management department variant

**Status:** PROPOSED — resolves OQ8-11. Same 4-step wizard shape as 8d-i–8d-iv
(Parking Enforcement); Step 1 swaps Vehicle Details for Animal + Owner/Person-in-Control
details, per the department-variant note at 8d-i.5. Steps 2–3 are structurally identical to
8d-ii/8d-iii (evidence/notes and offence/time rules are department-agnostic) — drawn again
here only where content differs, not to pad the sequence.

| # | Element | Annotation |
|---|---|---|
| 8h-i.1 | GPS auto-fill badge | Same GPS-editable pattern as 8d-i.1, reworded without the location-pin icon (see icon removal below). |
| 8h-i.2 | Location Description | Replaces Street Segment / Between / And / Side of Street / PA / EP-PS (8d-i.2–4) entirely with one free-text field — those four fields are parking-kerb-specific and don't apply to a park/reserve incident. Auto-filled from GPS reverse-geocode, still editable. |
| 8h-i.3 | Animal Reg. No. | Municipal animal-registration/microchip number — the department's equivalent of Registration (8d-i.5) as the record's lookup key, but unlike a vehicle plate it doesn't resolve an owner by itself, hence Owner section below is mandatory input, not a lookup result. |
| 8h-i.4 | Owner / Person in Control | New section with no Parking equivalent — required because an animal infringement is issued against a person, not a plate; no automated identity-resolution path exists (unlike VicRoads-style rego lookup), so all three fields are direct officer entry. |
| 8h-ii.1 | Officer Notes example | Department + offence-type template text differs from Parking's; evidence minimum/override (8d-ii.1/.2) and the post-issuance append-only rule (8d-ii.4) are unchanged. |
| 8h-iii.1 | Offence chip / grid | `AM-014` / `$92` are illustrative placeholders in the same style as 8d-iii's `701`/`$117` — no Animal Management rows exist in `shared/constants/offence-codes.ts` yet, extending OQ8-10. |
| 8h-iv.1 | Review rows | Icon-free label/value list (per owner direction on 8d-iv) — Animal + Owner rows replace the Vehicle row; no other structural change from 8d-iv. |

**Icon removal (applies retroactively to 8d-iv too):** owner direction — this is an official
government-use application; picture-based icons/emoji are not acceptable anywhere in the
review/confirm surface, and the review layout must read as a fast, unambiguous label/value
scan for an in-field officer, not prose with decorative glyphs. 8d-iv and 8h-iv were rebuilt
as plain label/value rows. The GPS-badge pin emoji at 8d-i.1 / 8h-i.1 and the folder/photo/note
emoji used elsewhere in this sequence (8b.3 🚗, 8e capture-photo 📷, native alerts) were left
as-is since the direction was scoped to the review screen — flagged as OQ8-19 if a full
emoji sweep across Sequence 8 is wanted.

---

## Screens 8i-i–8i-iv — Issue Infringement: Rangers (Parks & Gardens) department variant

**Status:** PROPOSED — third department variant, following the same shape as 8d-i–8d-iv
(Parking) and 8h-i–8h-iv (Animal Management). Scenario pictured: illegal camping in a
reserve without a permit. Steps 2–3 are structurally identical to 8d-ii/8d-iii (evidence/notes
and offence/time rules are department-agnostic); drawn again only where content differs.

| # | Element | Annotation |
|---|---|---|
| 8i-i.1 | GPS auto-fill badge | Same GPS-editable pattern as 8d-i.1/8h-i.1. |
| 8i-i.2 | Location Description | Same free-text pattern as 8h-i.2 — a reserve/park incident doesn't sit on a kerb segment, so no Street Segment/PA/EP-PS fields. |
| 8i-i.3 | Reserve / Site + Permit Status | New: Permit Status is a live read-only lookup against the Licensing/Permits domain pack, shown inline so the officer can see at a glance whether a valid permit is on file before proceeding to Evidence — no equivalent exists in Parking (plate lookup) or Animal Management (registration-tag lookup), since those departments don't gate on a permit record. See OQ8-20. |
| 8i-i.4 | Party in Control | Same purpose as Animal Management's Owner section (8h-i.4) — the infringement is issued against a person — but ID Type/No. is direct officer entry against sighted ID, since no reserve-permit lookup resolves a person's identity by itself (no automated ID-resolution path exists for this department either — extends OQ8-17). |
| 8i-ii.1 | Officer Notes example | Department + offence-type template text differs; evidence minimum/override (8d-ii.1/.2) and the post-issuance append-only rule (8d-ii.4) are unchanged. |
| 8i-iii.1 | Offence chip / grid | `PG-021` / `$198` are illustrative placeholders in the same style as 8d-iii/8h-iii — no Parks & Gardens rows exist in `shared/constants/offence-codes.ts` yet. See OQ8-21. |
| 8i-iv.1 | Review rows | Icon-free label/value list, consistent with 8d-iv/8h-iv. Reserve/Site and Party rows replace Vehicle / Animal+Owner; no structural change otherwise. |

---

## Screen 8g — Printed Infringement Notice (print-replica, PDF-ready)

**Status:** PROPOSED — new. **Source:** no repo source (`dispatchService.ts` has no print/PDF
endpoint yet — see OQ8-15); grounded instead in two owner-provided dev-reference docs,
`uploads/civicmaps-infringement-notice-template.md` (notice layout) and
`uploads/barcode-qr-generation-reference.md` (Code 128 / QR generation math).
**Companion artefact:** `Infringement Notice - Print Replica.dc.html` (own file, own
`doc_page` shell — deliberately not the hand-drawn wireframe style of the rest of this
sequence, since its job is to replicate real thermal-print output, not annotate a UI).

| # | Element | Annotation |
|---|---|---|
| 8g.1 | Linear barcode | Real Code 128 Subset C symbol, rendered client-side via the JsBarcode CDN library from the actual notice number — not artwork. Modulo-103 check character computed per ISO/IEC 15417, same formula as the reference doc's worked example: for this notice (padded to `0202600341`, Start C = 105), Σ = 105 + 1·2 + 2·2 + 3·60 + 4·3 + 5·41 = 508, 508 mod 103 = 96 — matches what JsBarcode computes internally. |
| 8g.2 | QR code | Model 2, EC level Q (~25% recovery, recommended for exposed/weather-affected field use per the reference doc), payload `https://{{platform_domain}}/n/{{notice_number}}`. Rendered via the `qrcode` CDN library, not artwork. `platform_domain` shown as `pay.macquariecouncil.example` — an obviously non-production placeholder, not a real council domain. |
| 8g.3 | Statute / rule number | Left as an explicit unresolved gap ("Rule — (not yet mapped)") rather than a fabricated rule number — the reference doc's only worked example (offence 720) doesn't cover offence 701, and no offence-code→rule-number crosswalk exists in `shared/constants/offence-codes.ts` today. |
| 8g.4 | Penalty amount | Shown as `$117` (matching 8d-iii's existing display value) but explicitly labelled "illustrative" — the reference doc requires this to be a computed `fee_units × current indexed penalty-unit value` (Monetary Units Act 2004 annual indexation), not a hardcoded dollar figure. |
| 8g.5 | Notice number format | The barcode reference assumes a clean 9-digit numeric string for Subset C, but Subset C requires an *even*-length digit string (two digits per symbol) — 9 is odd. Rendered here as `0202600341` (leading-zero-padded to 10) while displaying `202600341`; also unresolved: the app's existing PIN format is alphanumeric (`PIN-2026-00341`, from 8b.4/8f.1), not the clean numeric ID the barcode symbology assumes. See OQ8-13. |

---

## Open questions carried forward

- **OQ8-1** — `NoReportWorkflow`'s location-permission gate (8f.3) exits the whole workflow with no retry path if the officer initially denies and then enables location in Settings; they must re-enter the workflow from scratch.
- **OQ8-2** — `VehicleDetailsForm.tsx` and `IssueInfringementWorkflow.tsx` use raw ad-hoc hex literals (`#f9fafb`, `#2563eb`, `#111827`, etc.) instead of the `civic`/`status` theme tokens that `ActiveDispatchList.tsx` and `NoReportWorkflow.tsx` import from `../../theme` — inconsistent token discipline within the same feature folder.
- **OQ8-3** — `NoReportWorkflow`'s header uses the purple "issued" token as a border colour with no apparent semantic link to No-Report (8e.1) — possible copy-paste leftover.
- **OQ8-4** — Every destructive/terminal action in this workflow (submit No Report, discard evidence, insufficient-evidence, camera/location permission denials) is a native `Alert.alert`, confirmed here as the mobile-side counterpart to OQ3-1's web `alert()` finding — worth a single design decision covering both surfaces.
- **OQ8-5** — *Superseded by the 8d-i–8d-iv redesign*: the prior single-screen editable-offence-time discoverability gap no longer applies once Time From/To/Issuance are surfaced as three explicit, always-visible fields (8d-iii).
- **OQ8-6** — `ActiveDispatchList` always renders "Edit/Add Vehicle" + "Issue Infringement" + "No Report" together for `IN_PROGRESS`/`ATTENDED`; `VehicleDetailsForm` locks once a PIN exists, but the "Edit Vehicle" button itself stays visible and tappable post-lock (leads only to a locked form, never hidden or disabled at the list level).
- **OQ8-7** — The Mark-Up form and (by the same pattern) this dispatch workflow's screens are plain `View`/`Modal` compositions inside the tab screen rather than Expo Router `formSheet` presentations — the `building-native-ui` guide's recommended pattern for dynamic sheets. Given the app predates this convention, confirming whether a migration is in scope for the rebuild.
- **OQ8-8** — `NoReportWorkflow`'s header padding is a hardcoded `Platform.OS === "ios" ? 50 : 16` (8e.5) instead of `react-native-safe-area-context` insets — will misalign on devices with different safe-area geometry (Dynamic Island, foldables) than whatever this was tuned against.
- **OQ8-9** — The remove-photo button in `NoReportWorkflow` (8e.2) is a 28×28px circular hit target, under the 44px minimum mobile hit-target guidance used elsewhere in this rebuild.
- **OQ8-10** — The 8d-i–8d-iv flow is a proposed design with no backing source: the Street Segment / Between Streets / Parking Area / EP-PS lookup, the department→offence-list filtering by Designated Work Group, and the evidence-override reason capture all need a real data source and API confirmed before build (none exist in `dispatchService.ts` today).
- **OQ8-11** — Animal Management / Rangers department variants (swap Vehicle Details for animal + owner/person-in-control details in step 1) are referenced in the brief but not yet screened — flagged as a follow-up sub-sequence once Parking Enforcement's flow is validated.
- **OQ8-12** — The post-issuance append-only rule (8d-ii.4) has no confirmed enforcement point identified yet (client-side lock vs. server-side immutability) — worth confirming against whichever backend ends up serving this flow.
- **OQ8-13** — The barcode reference's "9-digit numeric, Subset C" notice-number spec is internally inconsistent (Subset C needs an even digit count) and doesn't match the app's existing alphanumeric PIN format (`PIN-YYYY-NNNNN`) — needs a real decision on the issued record's canonical ID shape before this becomes more than a reference mock (8g.5).
- **OQ8-14** — Penalty amount on the printed notice is a hardcoded `$117` labelled illustrative; production needs the real fee-unit count per offence code and the currently indexed penalty-unit dollar value (Monetary Units Act 2004) wired in, not a literal (8g.4).
- **OQ8-15** — No print/PDF-generation endpoint exists in `dispatchService.ts` today; 8g is a client-rendered reference built from the owner-provided template/barcode docs, not from repo source — needs a real backend decision (server-rendered PDF vs. client-rendered + thermal-printer SDK) before build.
- **OQ8-16** — Extends OQ8-7: none of 8d-i–8d-iv wrap their content in `ScrollView contentInsetAdjustmentBehavior="automatic"` per `building-native-ui` guidance, though measured hit targets on Back/Next already clear the 44px minimum.
- **OQ8-17** — 8h-i has no automated owner-identification path (no vehicle-plate-style lookup exists for an animal registration tag) — worth confirming whether a registration-tag → owner-record lookup is planned, or officer entry is always manual.
- **OQ8-18** — Animal Management offence codes/penalties (`AM-014`/$92 at 8h-iii) are invented-but-plausible placeholders with no backing `offence-codes.ts` entries — same gap as OQ8-10, called out separately since it blocks 8h specifically.
- **OQ8-19** — The icon-removal direction (government-use app, no picture-based icons) was applied to 8d-iv/8h-iv only; other emoji in this sequence (GPS-pin badge at 8d-i.1/8h-i.1, 8b.3 vehicle emoji, 8e's camera emoji, native-alert copy) weren't touched — confirm whether a full sweep is wanted across Sequence 8 (and retroactively, prior sequences).
- **OQ8-20** — 8i-i's Permit Status lookup (a Licensing/Permits domain pack cross-reference) has no confirmed API or data contract — needs a real permit-record lookup service before this becomes more than a reference mock, same class of gap as OQ8-10.
- **OQ8-21** — Parks & Gardens offence codes/penalties (`PG-021`/$198 at 8i-iii) are invented-but-plausible placeholders with no backing `offence-codes.ts` entries — same gap as OQ8-10/OQ8-18, called out separately since it blocks 8i specifically.

## Next set — not yet scheduled

Mark-Up create/detail (own create-form + detail/lifecycle sequences — spans
CommandMAPS, EnforcementMAPS Web, and EnforcementMAPS mobile surfaces),
Settings (CommandMAPS + EnforcementMAPS Web + EnforcementMAPS mobile), Audit
— each is its own large feature file and warrants its own sequence.
