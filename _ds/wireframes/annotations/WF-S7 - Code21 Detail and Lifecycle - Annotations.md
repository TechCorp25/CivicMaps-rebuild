# CivicMAPS Rebuild — Wireframe Annotation Document
## Sequence 7 — Code21 Detail & Lifecycle

**Document ID:** WF-S7-ANN
**Status:** Draft for owner review
**Companion artefact:** `Wireframes S7 - Code21 Detail and Lifecycle.dc.html`
**Fidelity:** Low-fi (structure only). Hi-fi follows owner sign-off.
**Date:** 2026-08-07
**Source repository:** `CivicMAPS/CivicMaps-preview` @ `main`

This sequence covers the dispatcher-facing Code21 workbench/browse and
detail/lifecycle workflow: `Code21Page.tsx` (CommandMAPS web). It is the
detail/lifecycle half of the Code21 feature; Sequence 6 covered the
create-form half. The officer-side mobile PIN-issuance / No-Report
workflow (`enforcementmaps/components/dispatch/*`, `enforcementmaps/tabs/index.tsx`)
is a distinct surface and is scheduled as its own sequence — see "Next set."

### How to read this document

Same convention as Sequences 1–6: each numbered marker maps to a row below,
scoped to its screen (`7a.2` = marker 2 on screen 7a).

---

## Screen 7a — Workbench: filter & status list

**Status:** EXISTING. **Source:** `Code21Page.tsx` (`fetchItems`, `filter`, `items.map`).

| # | Element | Annotation |
|---|---|---|
| 7a.1 | Status filter / search | `filter.status` (exact enum match, server-side) and `filter.search` (address or SR# substring) both re-trigger `fetchItems` on change; list also refetches on any websocket event (`wsClient.on("*")`), not just ones scoped to Code21. |
| 7a.2 | List row — RECEIVED | Row is clickable (`openDetail`); SR# only renders if `serviceRequestNumber` is non-null. Status pill triple-encodes colour + icon (`InboxIcon`) + `statusLabels` text — labels are always upper case by convention, never sentence case. |
| 7a.3 | List row — PIN ISSUED | Officer name only renders if assigned. Status colour for `PIN_ISSUED` is `status-issued` (`#7C3AED`, purple) — distinct from the amber "Locked — PIN recorded" banner shown inside the detail view for the same record (see 7c.1); the two are independent visual systems (list status vs. detail lock state). |
| 7a.4 | List row — VOIDED | `status-emergency` (`#DC2626`, the same red as Code 1 duress) is used for both `VOIDED` and `CANCELLED`. This conflicts with the DS convention that red is reserved for Code 1 — carried forward from OQ4-4, now confirmed against the Tailwind config (`status.emergency: "#DC2626"`) rather than assumed. |

---

## Screen 7b — Detail: editable state (unlocked)

**Status:** EXISTING. **Source:** `Code21Page.tsx` (`editForm`, `handleSave`, `isLocked`).

| # | Element | Annotation |
|---|---|---|
| 7b.1 | SR#/Status header | Status pill uses the same `statusColors`/`statusLabels` maps as the list. Shown regardless of lock state. |
| 7b.2 | Assigned Officer | Falls back to literal "N/A" — read-only always, no reassignment control on this page (reassignment is not implemented here despite `ReassignCode21Schema` existing in the shared contract). |
| 7b.3 | Alleged Offence field | Label is conditional: "Offence Type" if `offenceHeaderType === "OFFENCE_TYPE"`, otherwise "Alleged Offence" (default) — same field, different legal framing depending on how the SR was created. |
| 7b.4 | Vehicle Details grid | Make / Body Type / Colour are suggestion-only text inputs against `VEHICLE_MAKES`/`VEHICLE_BODY_TYPES`/`VEHICLE_COLOURS` — any text is accepted, not enforced. On save, the whole `vehicleDescription` object is omitted entirely unless at least one sub-field is truthy. |
| 7b.5 | PIN input + warning | Entering a PIN here does not call the officer-side issue-infringement endpoint — it is a direct admin edit. Saving with a non-empty PIN permanently locks the record (`isPinLocked`) with no unlock path in this UI. |
| 7b.6 | No Report banner | Only rendered when `canSeeNoReportToggle` is true: role `DISPATCHER`, OR (`user.isManager` AND the record has an assigned officer) — AND only while the PIN field is still empty. Confirming sets `noReport: true` via PATCH, which also locks the record. |
| 7b.7 | Save Changes | Disabled while `saving`; on success the form re-syncs from the server response (not just the local edit) and the list re-fetches. |

---

## Screen 7c — Detail: locked state (PIN recorded)

**Status:** EXISTING. **Source:** `Code21Page.tsx` (`isPinLocked`, `isLocked` read-only branch, `handleSaveNote`).

| # | Element | Annotation |
|---|---|---|
| 7c.1 | "Locked — PIN recorded" banner | Shown only when `isPinLocked` and status is not `CLOSED`/`VOIDED` (those get their own banners instead, see 7g and the Void flow). Amber (`status-alert`), independent of whatever colour the status pill itself is showing. |
| 7c.2 | Offence Type (read-only) | Same conditional label as 7b.3, now rendered via `ReadField` instead of an editable input. |
| 7c.3 | Vehicle Details (read-only) | Each sub-field (`make`/`bodyType`/`colour`/`registration`) renders only if present — a partially-filled vehicle description shows only the fields that were actually captured, not empty placeholders. |
| 7c.4 | PIN (read-only, mono) | Once locked, the PIN itself has no edit or clear affordance anywhere in this UI — the only way to remove it is the separate Void flow (7f), which is role-gated and requires status `COMPLETED`. |
| 7c.5 | Additional Notes + Add Note | Notes list is always visible; the textarea + "Add Note" button only render when `isLocked` — an unlocked record (7b) cannot receive additional notes, only its primary fields can be edited directly. |
| 7c.6 | Close SR | Visible only if `user.role` is in `[ADMIN, COMPLIANCE_LEAD, COMPLIANCE_COORDINATOR, DISPATCHER]` AND status is in the closeable set (`RECEIVED` through `ATTENDED_COMPLETE`, i.e. anything short of already `CLOSED`/`VOIDED`). |

---

## Screen 7d — Detail: No Report evidence (locked)

**Status:** EXISTING. **Source:** `Code21Page.tsx` (`isNoReportLocked`, `selected.noReportEvidence`, `lightbox`).

| # | Element | Annotation |
|---|---|---|
| 7d.1 | "Closed — No Report (Attended Complete)" banner | Purple (`status-issued`), shown when `noReport === true` and status is not `CLOSED`. Independent of and can co-occur with a `PIN_ISSUED`-style lock in the codebase's boolean logic, though in practice a record is normally one or the other. |
| 7d.2 | Evidence count header | Only rendered if `noReportEvidence` is non-empty; count is literal `.length`, not a fixed number. |
| 7d.3 | Evidence card | Each item carries `captureDate`/`captureTime`/GPS lat-lon/officer number captured client-side at the time the officer took the photo (mobile-side, not this admin page) — this page only displays it. GPS coordinates are shown to 5 decimal places (`.toFixed(5)`). |
| 7d.4 | Close SR | `ATTENDED_COMPLETE` is included in `CLOSEABLE_STATUSES`, so Close SR can still appear here even though the record is already effectively terminal from a reporting standpoint — closing is a distinct, further administrative step. |

Not pictured: tapping a photo opens a full-screen lightbox (`setLightbox`) with the same caption info; a photo with no `dataUrl` falls back to an "Image unavailable" placeholder rather than a broken image.

---

## Screen 7e — Close Service Request modal

**Status:** EXISTING. **Source:** `Code21Page.tsx` (`showCloseModal`, `handleClose`).

| # | Element | Annotation |
|---|---|---|
| 7e.1 | Modal copy | Fixed literal string from source, not paraphrased. |
| 7e.2 | Reason textarea | Required — Confirm Close stays disabled while empty/whitespace-only (`.trim()`). |
| 7e.3 | Cancel | Resets both the modal-open flag and the typed reason; does not call the API. |
| 7e.4 | Confirm Close | `POST /admin/code21/:id/close`; button reads "Closing..." while in flight; a failure surfaces inline (`saveError`) without closing the modal. |

---

## Screen 7f — Void PIN modal (destructive)

**Status:** EXISTING. **Source:** `Code21Page.tsx` (`showVoidModal`, `handleVoid`, `canVoid`).

| # | Element | Annotation |
|---|---|---|
| 7f.1 | Title + destructive styling | Only reachable if `user.role` is in `[COMPLIANCE_LEAD, COMPLIANCE_COORDINATOR, TEAM_SUPERVISOR, SHIFT_SUPERVISOR, SUPERVISOR]` — notably excludes `DISPATCHER` and `ADMIN`, the opposite asymmetry from Close SR (7c.6), which includes `DISPATCHER`/`ADMIN` but not the supervisor ranks. |
| 7f.2 | Warning copy | `canVoid` additionally requires a PIN to exist AND status to be exactly `COMPLETED` — not `PIN_ISSUED` or `ATTENDED_COMPLETE`. The action is only reachable in a narrow window of the lifecycle. |
| 7f.3 | Reason textarea | Required, same disabled-until-filled pattern as Close. |
| 7f.4 | Confirm Void | `POST /admin/code21/:id/void`; this is the only path in the admin UI that can remove a recorded PIN. Uses `status-emergency` red — the same colour/DS-tension noted in 7a.4. |

---

## Screen 7g — Audit trail (expanded) & closure reason

**Status:** EXISTING. **Source:** `Code21Page.tsx` → `AuditTrailSection` component; `selected.closureReason`.

| # | Element | Annotation |
|---|---|---|
| 7g.1 | Closure Reason banner | Renders only if `selected.closureReason` is truthy — mirrored by a red "Void Reason" banner (not pictured separately here; same pattern, `status-emergency` colour) if `voidReason` is set instead. The two are mutually exclusive in real data. |
| 7g.2 | Audit Trail toggle | Collapsed by default (`useState(false)`) even when entries exist — the count is visible but entries require an explicit click to reveal. |
| 7g.3 | Entry description | Prefers `entry.details.changeDescriptions` (an array, joined with ", ") when present; falls back to `entry.action.toLowerCase()` otherwise — so some entries show human-readable field-level diffs and others show only the raw action name, depending on what the server recorded for that action. |

---

## Open questions carried forward

- **OQ7-1** — Close-SR and Void-PIN role lists are asymmetric with no visible overlap: `DISPATCHER`/`ADMIN` can close but not void; the supervisor/compliance ranks can void but not close. Worth confirming this is intentional separation-of-duties rather than an oversight.
- **OQ7-2** — `canVoid` requires status to be exactly `COMPLETED` — a record that has moved on to `CLOSED` can no longer have its PIN voided through this UI, even though `CLOSED` is reachable from `COMPLETED`.
- **OQ7-3** — Confirms/extends OQ4-4: `VOIDED` and `CANCELLED` both render in `status-emergency` red (`#DC2626`), the same hex used for Code 1 duress, contradicting the DS's "red is Code-1-only" rule. Now grounded in the actual Tailwind token rather than inferred.
- **OQ7-4** — `enforcementmaps/tabs/index.tsx`, previously flagged as likely dead code (OQ2-3), is confirmed live: it hosts `IssueInfringementWorkflow`, `NoReportWorkflow`, and `ActiveDispatchList` — the officer-side counterpart to this sequence's PIN/No-Report locking. OQ2-3 should be considered resolved/withdrawn.
- **OQ7-5** — No reassignment control exists on this admin detail view despite `ReassignCode21Schema` (target zone / target officer) existing in the shared contract — reassignment may be mobile-only, API-only, or not yet wired up anywhere.

## Next set — not yet scheduled

EnforcementMAPS officer-side Code21 dispatch workflow (`enforcementmaps/components/dispatch/ActiveDispatchList.tsx`, `IssueInfringementWorkflow.tsx`, `NoReportWorkflow.tsx`, `VehicleDetailsForm.tsx`, `enforcementmaps/tabs/index.tsx`, `dispatchService.ts`) — the mobile counterpart to this sequence: active-dispatch list, issue-infringement form (offence code/date/time capture, `IssueInfringementSchema`), No-Report photo-evidence capture, vehicle details entry. Own sequence per the surface-split precedent (mobile vs. web). After that: Mark-Up create/detail, Settings, Audit — as previously queued.
