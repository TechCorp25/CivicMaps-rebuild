# CivicMAPS Rebuild — Wireframe Annotation Document
## Sequence 17 — Case/Record Intake Queue

**Document ID:** WF-S17-ANN
**Status:** Draft for owner review
**Companion artefact:** `Wireframes S17 - Case Intake Queue.dc.html`
**Fidelity:** Low-fi (structure only). Hi-fi follows owner sign-off.
**Date:** 2026-08-10
**Source repository:** none — net-new, proposed. No Local Laws case/intake model exists in `CivicMAPS/CivicMaps-preview` today; Code21 (Sequences 6–7) covers the parking domain's service-request lifecycle only. This sequence is scoped on the same footing as the Platform Admin screens (Sequences 12–15): owner-directed, illustrative content, built to establish a record shape for Sessions 18–20 to issue into.

### How to read this document

Same convention as prior sequences: each numbered marker maps to a row below, scoped to its screen (`17a.2` = marker 2 on screen 17a).

### Design decisions made for this sequence

- **Record shape:** a generic "case" distinct from Code21's SR — `LL-2026-#####` numbering (prefix per domain pack), category, free-text description, location, reporter (internal officer or public), and a 4-state lifecycle: Received → Assigned → Actioned/Closed. Actioned and Closed are two different terminal states, not one: Actioned records an outcome with a compliance action attached (notice, referral); Closed ends the case with no further action (no breach found, duplicate, withdrawn). This split matters for later reporting — an "Actioned" case can feed into Session 20's infringement/notice issuance; a "Closed" one cannot.
- **Status colour mapping** reuses existing DS tokens rather than inventing new ones: Received = `status-pending` blue (`#2563EB`, same as Code21's RECEIVED/IN PROGRESS), Assigned = `civic-secondary` teal (`#1A7A6D` — DS: "distinguishes dispatch context and in-progress states"), Actioned = `status-issued` purple (`#7C3AED` — DS: "administrative outcome recorded"), Closed = neutral grey (`#6b7280`). No red is used anywhere in this sequence — Code 1 stays the only red per the DS rule.
- **Category tags** (17a.2–17a.5) use a plain Civic Navy tint badge, not a colour-coded system — categories aren't a status and shouldn't visually compete with the status pill.

---

## Screen 17a — Local Laws Intake Queue (list)

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 17a.1 | Status / category filter + search | Mirrors 7a.1's pattern (status enum filter, free-text search against case # or address). Category filter is new relative to 7a since Local Laws cases span multiple breach types where Code21 SRs don't need a second axis. |
| 17a.2 | Row — RECEIVED | Reporter shown as "Public (phone)" rather than a name — see 17b.5 on reporter identity/privacy. Clicking opens 17b. |
| 17a.3 | Row — ASSIGNED | Assignee name replaces reporter in the same slot once assigned, same space-saving convention as 7a.3's officer name. |
| 17a.4 | Row — ACTIONED | "Local Laws — General" category stands in for a real taxonomy that doesn't exist yet — see open questions. |
| 17a.5 | Row — CLOSED | Category "Permits & Licensing" is a deliberate cross-domain example: a busking-without-permit complaint lands in this generic queue even though permit issuance itself is a separate flow (Session 18) — flagged as an open question below, not resolved here. |

---

## Screen 17b — Case Detail: new, unassigned (Received)

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 17b.1 | Header + status pill | Same modal-header convention as 7b/7c (title + × close). |
| 17b.2 | Category / Received | Read-only at this stage — no fields are editable inline on this record type; corrections would go through a note, not a direct edit (unlike Code21's 7b, which allows direct field edits pre-lock). |
| 17b.3 | Description | Full free text, not truncated — this is the primary triage input for the assignee. |
| 17b.4 | Location | "View on map" is a placeholder cross-link, not a rendered map — consistent with keeping this sequence's map surface out of scope (Live Map, Sequence 4, already owns that). |
| 17b.5 | Reporter | Shows reporter type and a "contact on file" note rather than exposing a phone number or name directly in this view — a deliberate privacy-by-default choice, not sourced from any existing pattern. Open question below. |
| 17b.6 | Assign to Officer/Team | Primary action while `Unassigned`; opens 17c. |

---

## Screen 17c — Assign to Officer/Team modal

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 17c.1 | Assign To — Officer/Team toggle | Team assignment (e.g. "Local Laws Team") is included as an option because not every case needs an individual owner immediately — a team can hold a case in a shared queue before someone picks it up. Behaviour of a team-held case (who can action it) is unresolved — see open questions. |
| 17c.2 | Officer/Team picker | Illustrative single option shown; a real picker would filter to officers with Local Laws domain-pack access, following the same domain-pack-scoping model used elsewhere in this project. |
| 17c.3 | Priority | Three-tier Low/Standard/High, new to this sequence — Code21 has no priority concept, only lifecycle status. |
| 17c.4 | Due By | New concept — no equivalent exists on Code21's SR model. |
| 17c.5 | Confirm Assign | Moves case to `ASSIGNED`. |

---

## Screen 17d — Case Detail: assigned, in progress

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 17d.1 | Assigned To + Reassign | Reassign reopens 17c pre-filled — same modal, not a separate flow. |
| 17d.2 | Priority / Due By | Read-only summary of what was set in 17c. |
| 17d.3 | Internal Notes + Add Note | Same notes-thread pattern as 7c.5 (Code21's Additional Notes) — timestamped, append-only, no edit/delete. |
| 17d.4 | Action / Close Case | Opens 17e. Styled in Operations Teal (matches the ASSIGNED status pill) rather than Civic Navy, to visually tie the action back to the in-progress state it's closing out. |

---

## Screen 17e — Action / Close Case modal

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 17e.1 | Outcome dropdown | Five illustrative outcomes shown as helper text beneath the field rather than a full open dropdown, to keep the low-fi option list legible. The outcome choice determines whether the case lands in `ACTIONED` (Notice issued / Voluntary compliance / Referred) or `CLOSED` (No breach found / Duplicate-withdrawn) — this branching isn't visualised as two separate buttons here, but the confirm button's colour and label update to reflect the selected outcome's terminal state (shown here as "Confirm — Actioned", purple, for the "Notice issued" outcome). |
| 17e.2 | Resolution Notes | Required, same disabled-until-filled convention as 7e.2/7f.3. |
| 17e.3 | Confirm — Actioned/Closed | Label and colour are outcome-dependent (see 17e.1) — not pictured here is the alternate "Confirm — Closed" (grey) state for a no-action outcome. |

---

## Screen 17f — Case Detail: actioned/closed, audit trail

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 17f.1 | Outcome banner | Purple, mirrors 7d.1's "Closed — No Report" banner pattern but reused here for any Actioned outcome, not just one specific case. |
| 17f.2 | Resolution Notes card | Persisted verbatim from 17e.2. |
| 17f.3 | Audit Trail toggle | Collapsed by default, same convention as 7g.2. |
| 17f.4 | Final entry | Terminal audit entry always names the actor and the outcome text, not just the raw state change — richer than Code21's fallback-to-raw-action-name behaviour (7g.3), since this is a proposed model with no legacy data constraint forcing a terser log. |

---

## Open questions

- **OQ17-1** — Reporter identity/contact (17b.5) is hidden behind "contact on file" by default in this proposal. Confirm whether officers assigned to a case need to see the reporter's contact details directly (e.g. to arrange a site visit) or whether a "reveal contact" action/permission step is wanted.
- **OQ17-2** — Category taxonomy for Local Laws breach types (17a.2's "Noise", 17a.4's "Local Laws — General") is illustrative only — no backing list exists yet. Needs a real, department-approved category set before this becomes more than a wireframe.
- **OQ17-3** — Cross-domain routing: 17a.5's "Permits & Licensing" example shows a complaint that turns out to relate to a permit (Session 18's domain), closed here as "No breach found" after the officer manually checked. Confirm whether cases like this should instead have a "Refer to Permits" outcome that hands the record to that flow directly, rather than closing it here with no link forward.
- **OQ17-4** — Team-held assignment (17c.1): behaviour when a case is assigned to a team rather than an individual is undefined — who can add notes/action it, and does it need an explicit "claim" step before an individual officer can act on it.
- **OQ17-5** — RBAC scoping for this queue (who can view, assign, and action) is not yet defined. Proposed to follow the Close-SR precedent from Code21 (7c.6: `ADMIN`/`COMPLIANCE_LEAD`/`COMPLIANCE_COORDINATOR`/`DISPATCHER`, scoped additionally to users with Local Laws domain-pack access) but this is a guess, not a confirmed decision.
- **OQ17-6** — No manual case-logging entry point is built here. This queue only shows "submitted" requests per the session scope — how a phone-reported case like 17a.2 actually gets into the queue (staff manually logging it vs. some other intake path) is not designed. Session 22 (public online submission) is a separate, later intake path; a staff-facing manual-log form is not yet scheduled at all.

## Next set — not yet scheduled

Session 18 — Permit issuance workflow (busking permit example): application intake → review → approve/reject → issued permit record. Per OQ17-3, worth revisiting whether this session's queue should link forward into that one for permit-related complaints.
