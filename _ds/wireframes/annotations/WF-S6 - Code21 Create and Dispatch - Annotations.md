# CivicMAPS Rebuild — Wireframe Annotation Document
## Sequence 6 — Code21 Create & Dispatch

**Document ID:** WF-S6-ANN
**Status:** Draft for owner review
**Companion artefact:** `Wireframes S6 — Code21 Create and Dispatch.dc.html`
**Fidelity:** Low-fi (structure only). Hi-fi follows owner sign-off.
**Date:** 2026-08-07
**Source repository:** `CivicMAPS/CivicMaps-preview` @ `main`

This sequence covers the dispatcher-facing Code21 (parking/local-laws service
request) creation workflow: `Code21CreateForm.tsx`. It is the create-form half
of the Code21 feature; the workbench/browse/detail/lifecycle half
(`Code21Page.tsx`) is scheduled as its own sequence per the size-split rule
carried in the handoff doc.

### How to read this document

Same convention as Sequences 1–5: each numbered marker maps to a row below,
scoped to its screen (`6a.2` = marker 2 on screen 6a).

---

## Screen 6a — New Service Request, default state

**Status:** EXISTING. **Source:** `Code21CreateForm.tsx` (`form`, `handleCreate`).

| # | Element | Annotation |
|---|---|---|
| 6a.1 | Address field | Free-text with debounced (300ms) address search; the field alone does not set a location — `latitude`/`longitude` stay `null` until a suggestion is picked. |
| 6a.2 | Service Request Type | `SR_TYPES` fixed list: Parking, Abandoned Vehicle, Noise Complaint, Litter/Dumped Rubbish, Local Laws/Bylaws, Other. Defaults to Parking; maps to `code21Type` on submit. |
| 6a.3 | Offence Type | Searchable against `PARKING_OFFENCE_CODES` by code or description — not a plain dropdown. |
| 6a.4 | Vehicle Description Received | Checkbox toggle; reveals Make/Body Type/Colour/Registration fields only when checked (see 6c). |
| 6a.5 | Assign Officer | Placeholder reads "Auto-assign based on zone" only when no zone/officer has resolved yet; the label itself changes once a zone resolves with no active officer (see 6d). |
| 6a.6 | Dispatch Notes | Free text, optional, maps to `dispatchNotes`. |
| 6a.7 | Cancel / Create | Create is disabled while `!addressLabel \|\| !offenceType` — a narrower check than full form validity (a resolved location is required at submit-time, not disable-time; see 6a.1). |

---

## Screen 6b — Address search & zone/officer resolution states

**Status:** EXISTING. **Source:** `Code21CreateForm.tsx` (`searchAddresses`, `resolveCoordinates`, `AddressSuggestion`).

| # | Element | Annotation |
|---|---|---|
| 6b.1 | Address input | Live value while suggestions are open; the "Location set" confirmation (green check) only appears after a suggestion is picked and coordinates resolve, replacing this open-dropdown state. |
| 6b.2 | Suggestion type badge | Three sources merged into one list: `S` = seeded street lookup (server), `H` = a previous SR's address (server, includes zone if known), `G` = Google Places autocomplete (client-side, 3s race timeout, best-effort). No in-UI legend explains the letters (OQ6-1). |
| 6b.3 | "Resolving zone..." | Shown while `resolvingZone` is true, immediately after a suggestion sets coordinates. |
| 6b.4 | Zone + auto-assigned officer | `POST /admin/code21/zone-resolve` returns the zone and its active officer; the officer is auto-filled into `assignedOfficerUserId` unless the operator has already manually overridden (`manualOfficer`). Falls back to a client-side point-in-polygon check (`resolveZoneClientSide`) if the server call fails. |
| 6b.5 | Zone with no active officer | Shown when a zone resolves but `officer` is null — the operator must assign manually (see 6d). |

---

## Screen 6c — Vehicle description & offence-type lookup

**Status:** EXISTING. **Source:** `Code21CreateForm.tsx` (`AutocompleteInput`, `PARKING_OFFENCE_CODES` search).

| # | Element | Annotation |
|---|---|---|
| 6c.1 | Vehicle Description Received (checked) | Reveals the four-field grid below; unchecking omits `vehicleDescription` from the POST body entirely rather than sending empty strings. |
| 6c.2 | Make / Body Type / Colour / Registration | Make, Body Type, Colour are each a free-text input with a filtered suggestion list (`VEHICLE_MAKES`, `VEHICLE_BODY_TYPES`, `VEHICLE_COLOURS` — not enforced, any text is accepted). Registration is upper-cased live, max 7 characters, no format validation beyond length. |
| 6c.3 | Offence Type input | Filters `PARKING_OFFENCE_CODES` by substring match on code or description as the operator types. |
| 6c.4 | Dropdown list | Real catalogue entries shown here (621, 701, 702, 793) are the actual seeded offence codes and descriptions, not placeholder copy. |
| 6c.5 | Selected row highlight | The currently-selected `offenceCode` is highlighted in the list; selecting sets both `offenceCode` and the combined `"{code} - {description}"` display string used everywhere else in the form. |

---

## Screen 6d — Assign Officer: auto vs. manual override

**Status:** EXISTING. **Source:** `Code21CreateForm.tsx` (`resolvedOfficer`, `manualOfficer`, `allOfficers`).

| # | Element | Annotation |
|---|---|---|
| 6d.1 | Auto-assigned state + Change | Shown whenever an officer has auto-resolved and the operator hasn't clicked Change; the tinted box is not editable directly. |
| 6d.2 | Manual select — default option | Clicking Change swaps in a `<select>`; its default option text is conditional — "No active officer — select manually" if a zone resolved with nobody active, otherwise "Auto-assign based on zone". |
| 6d.3 | "Officers in {zone}" optgroup | Populated from `availableOfficers` returned by the zone-resolve call — other officers currently active in the same zone. |
| 6d.4 | "All Officers" optgroup | Full roster (`GET /admin/code21/officers`) as a manual-assignment fallback; each entry is suffixed with its current zone name or "(Unassigned)". |
| 6d.5 | Selecting from either optgroup | Sets `assignedOfficerUserId` directly and also flips `manualOfficer` to true, so a later zone re-resolve will not silently overwrite the operator's manual pick. |

---

## Screen 6e — Review Service Request, pre-dispatch

**Status:** EXISTING. **Source:** `Code21CreateForm.tsx` (`showReview`, `reviewData`, `handleDispatch`).

| # | Element | Annotation |
|---|---|---|
| 6e.1 | Address / SR Type / Offence | Read-only recap of the three required fields; the SR Type label shown here is the human label (`SR_TYPES` lookup), not the raw `serviceRequestType` value. |
| 6e.2 | Vehicle Description grid | Rendered only if `vehicleToggle` was checked; omitted entirely otherwise (not shown as empty fields). |
| 6e.3 | Zone / Assigned Officer | Falls back to literal copy "No zone matched" / "Unassigned" when either is absent — this is real fallback text from source, not a placeholder. |
| 6e.4 | SR Date / SR Time | Computed once, client-side, at the moment "Create" was pressed (`new Date()` → ISO date + `HH:mm`) — not editable, and not the same moment as the eventual dispatch POST if the operator lingers on this screen. |
| 6e.5 | Edit / Dispatch | Edit returns to the form (6a-6d) without discarding entered data. Dispatch is disabled and reads "Dispatching..." while the POST is in flight; a failure re-opens this same review screen with an error banner rather than returning to the form. |

---

## Screen 6f — Dispatch failed, error banner (Session 16b)

**Status:** EXISTING, drawn for the first time. **Source:** same `handleDispatch` failure path referenced at 6e.5 — previously described only in annotation text, never rendered as its own screen.

| # | Element | Annotation |
|---|---|---|
| 6f.1 | Error banner | Inline, persistent (not a toast) above the recap fields — a form-validation-adjacent failure the operator must act on, matching OQ3-1's Session 16 decision (banner, not toast, for anything requiring a response rather than a one-off notice). Message text is representative; source doesn't pin an exact string. |
| 6f.2 | Dispatch | Re-enabled, back to its default label — the failed POST does not lock the form, so the operator can retry immediately or Edit to change details first. |

---

## Open questions carried forward

- **OQ6-1** — Address suggestion badges (S/H/G) have no legend or tooltip anywhere in the form; the letters are effectively an internal type enum leaking into the UI.
- **OQ6-2** — `travelMode` is hardcoded to `"FOOT"` on submit (`handleDispatch`) even though the shared contract supports `FOOT`/`VEHICLE` and the form has no control for it.
- **OQ6-3** — SR Date/Time are silently stamped from the client clock at "Create" time, with no way to correct them for a request being logged after the fact (e.g. backfilling from a phone call).
- **OQ6-4** — The manual-assign select's default option text is the only signal distinguishing "no zone resolved yet" from "zone resolved, nobody active in it" — easy to miss at a glance (see 6d.2).
