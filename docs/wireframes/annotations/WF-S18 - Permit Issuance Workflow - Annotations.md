# CivicMAPS Rebuild — Wireframe Annotation Document
## Sequence 18 — Permit Issuance Workflow

**Document ID:** WF-S18-ANN
**Status:** Draft for owner review
**Companion artefact:** `Wireframes S18 - Permit Issuance Workflow.dc.html`
**Fidelity:** Low-fi (structure only). Hi-fi follows owner sign-off.
**Date:** 2026-08-11
**Source repository:** none — net-new, proposed, same footing as Sequence 17. No permits/licensing model exists in `CivicMAPS/CivicMaps-preview` today. Busking Permit used as the worked example per the roadmap; the record shape generalises to other Permits & Licensing permit types.

### How to read this document

Same convention as prior sequences: each numbered marker maps to a row below, scoped to its screen (`18a.2` = marker 2 on screen 18a).

### Design decisions made for this sequence

- **CommandMAPS chrome convention:** 18g–18l are full desktop pages, not modals — they use the same browser-frame + navy `shellbar` + folder-tab pattern as 15a/S9's 9j (820px card, `app.commandmaps.civicmaps.gov.au/...` URL bar, CommandMAPS wordmark + top nav, J. Nguyen user label). Earlier drafts of 18g–18k were sized as bare ~400px cards, which read as isolated widgets rather than CommandMAPS screens — corrected here. 18a–18f stay as narrower cards deliberately: they represent modals/detail panels (same convention as Sequence 17's 17a–17f), not full pages.
- **New "Permits Admin" top-level nav entry** (18g–18k's shellbar) is proposed, not confirmed — no equivalent department-admin nav item exists elsewhere in the project yet. Visibility would need to be scoped to users with Local Laws/Permits domain-pack access and the ADMIN/supervisor tiers — see OQ18-9.
- **Permits & Licences added as a fourth Look Up tab** (18l), alongside the existing Service Requests / Mark-Ups / Audit tabs from 5g/9j — read-only search for dispatchers, not the management actions in 18g–18k. Includes a temporary-permit example (a short-dated trading permit) to confirm the lookup covers time-bound permits, not just long-validity ones like the busking example.
- **EnforcementMAPS mobile equivalent** (18m/18n) is new: no "Look Up" affordance exists today on the officer mobile map chrome (S2d's floating controls are Inbox/Settings/SOS only). Proposes a new floating magnifier icon opening a search-by-name/location result list, styled consistent with S8's phone-frame conventions. Framed as a compliance-check tool (confirm a permit is valid before issuing an infringement), not a general directory.
- **Record shape:** two distinct numbers, not one — `PL-2026-#####` is the *application*, `PL-PERMIT-2026-#####` is the *issued permit* record created only on approval (18d/18f). Keeping them distinct lets a rejected application (no permit ever exists) and an approved one (application + permit both exist) coexist cleanly, and gives 18f a citable identifier independent of the review workflow that produced it.
- **Lifecycle:** 4 states — Submitted → Under Review → Approved/Rejected. Approved and Rejected are terminal and mutually exclusive (unlike Sequence 17's Actioned/Closed, both of which can follow further internal action) — a permit decision doesn't reopen.
- **Status colour mapping** reuses the same tokens as Sequence 17 for consistency across department flows: Submitted = `status-pending` blue, Under Review = `civic-secondary` teal, Approved = `status-issued` purple (DS: "administrative outcome recorded" — issuing a permit is exactly that outcome), Rejected = neutral grey (terminal, no further action, same as Sequence 17's Closed). No red used.
- **Single-step review, no separate assignment step:** unlike Sequence 17 (which splits Assign and Action into two modals because a case is dispatched to a field officer), this flow has one reviewer who both claims and decides in one modal (18c) — administrative desk review doesn't need a field-handover step. Flagged as a divergence from the Sequence 17 pattern, not an oversight — see OQ18-4.
- **Approve/Reject branch shown as one modal, one pictured state:** same low-fi convention as 17e — only the Approve branch is drawn (18c); Reject is described in the open questions rather than duplicated as a second full screen.
- **18f (issued permit record) is a deliberately separate artefact from 18d (the application detail view).** 18d is the internal reviewer-facing case record; 18f is the citable/verifiable permit itself — the kind of thing that could be looked up publicly or printed. Modelled after the print-replica precedent in Sequence 8 (8g) but drawn here as an in-product card rather than a separate print document, since no citizen-facing surface exists yet to host it (Session 22/23).

---

## Screen 18a — Application Queue (list)

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18a.1 | Status / permit type filter + search | Same filter pattern as 17a.1/7a.1. Permit type filter stands in for Sequence 17's category filter — same purpose, different vocabulary for this department. |
| 18a.2 | Row — SUBMITTED | New, unclaimed application. Clicking opens 18b. |
| 18a.3 | Row — UNDER REVIEW | Reviewer name shown in place of a queue-wide label, same space-saving convention as 17a.3. |
| 18a.4 | Row — APPROVED | Terminal, permit exists — see 18f. |
| 18a.5 | Row — REJECTED | Terminal, no permit issued — "A-Frame Sign Permit" included to show the queue spans more than one permit type, not just busking. |

---

## Screen 18b — Application Detail: new, Submitted

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18b.1 | Header + status pill | Same modal-header convention as 17b/7b. |
| 18b.2 | Permit Type / Submitted | Read-only. |
| 18b.3 | Applicant | Includes the performing/trading name alongside the legal name — a Permits & Licensing-specific need Sequence 17 doesn't have. |
| 18b.4 | Performance Type / Requested Location | Fields specific to the busking permit type; a different permit type (e.g. A-Frame Sign) would show different fields here — this record shape is not fully generic across permit types yet, see OQ18-2. |
| 18b.5 | Requested Dates | Applicant's requested validity window — becomes the default in 18c's editable Permit Validity fields, distinct from Sequence 17 which has no equivalent date-range concept. |
| 18b.6 | Supporting Documents | Read-only checklist of what the applicant attached at submission — no upload/view-document interaction is drawn (would need a document viewer, out of scope here). |
| 18b.7 | Review Application | Opens 18c directly — no separate assign step (see design decisions above). |

---

## Screen 18c — Review & Decision modal

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18c.1 | Decision — Approve/Reject toggle | Same segmented-control pattern as 17c.1's Officer/Team toggle, repurposed here for a binary outcome. Reject branch (not pictured) would swap the fields below for a Rejection Reason dropdown + Notes field, mirroring 18e's read-only fields. |
| 18c.2 | Permit Validity — From/To | Pre-filled from 18b.5's requested dates but editable — a reviewer can shorten or adjust the granted window independent of what was requested. |
| 18c.3 | Conditions | Optional free text, persists to both 18d and 18f verbatim. |
| 18c.4 | Fee | Shown as a fixed illustrative amount, not editable here — assumed to be a permit-type-level constant, not a per-application input. See OQ18-3 on whether fee payment status needs to be tracked. |
| 18c.5 | Confirm — Approve & Issue | Label/colour are decision-dependent, same convention as 17e.3 — the Reject branch would show "Confirm — Reject" in grey. Confirming creates the permit record (18f) and transitions the application to Approved. |

---

## Screen 18d — Application Detail: Approved (permit issued)

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18d.1 | Outcome banner | Purple, same convention as 17f.1. |
| 18d.2 | Permit Number / Validity | The permit number here is the same identifier shown on 18f's record card — this view is the reviewer-facing pointer to that record, not a duplicate of it. |
| 18d.3 | Conditions | Persisted verbatim from 18c.3. |
| 18d.4 | Reviewed By | Actor + timestamp. |
| 18d.5 | Audit Trail toggle | Collapsed by default, same convention as 17f.3 — not expanded here to avoid redrawing an identical pattern; assume the same entry style (timestamp, actor, action) as 17f's expanded trail. |

---

## Screen 18e — Application Detail: Rejected

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18e.1 | Outcome banner | Grey, terminal, no permit created. |
| 18e.2 | Rejection Reason | Illustrative single reason shown; a real build would need a defined reason taxonomy (insurance, location conflict, incomplete documentation, other) — see OQ18-1. |
| 18e.3 | Reviewer Notes | Free text, required alongside the reason dropdown per the same "notes required before confirm" convention used across this project (7e.2, 17e.2). |
| 18e.4 | Reviewed By | Actor + timestamp. |
| 18e.5 | Audit Trail toggle | Same collapsed convention as 18d.5. |

---

## Screen 18f — Issued Permit — record card

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18f.1 | Header — council name + permit number | Illustrative council name ("City of Yarra") stands in for whatever the active council's actual name is — this card is council-branded, not CivicMAPS-branded, since it's meant to be presented by the holder (e.g. to a Local Laws officer checking compliance on the street) as proof of a valid permit. |
| 18f.2 | Holder / Performing As | Public-facing identity fields — deliberately omits the applicant's private contact details (phone/email), unlike the internal 18b view. |
| 18f.3 | Location / Valid dates | The scope of the permit — what it authorises and where. |
| 18f.4 | Conditions | Same text as 18c.3/18d.3 — the holder needs to see their own conditions, not just staff. |
| 18f.5 | Verify link + QR placeholder | Proposes a public verification lookup (e.g. for a Local Laws officer or member of the public to confirm a permit is genuinely valid) — no backing endpoint or citizen-facing surface exists yet. See OQ18-5. |

---

## Screen 18g — Admin/Management: Permit Registry

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18g.1 | Management tab bar | New nav pattern for this sequence — five tabs (Registry, Workload, Reporting, Permit Types, Expiring Soon) frame this as one management area, not five separate screens. Scoped to council ADMIN and team supervisors/people leaders (not general reviewers) — see role note below. |
| 18g.2 | Filter/search | Same list-filter convention as 18a.1, but scoped to issued permits (all types, all statuses) rather than open applications. |
| 18g.3 | Active permit row | Green `status-active` — reuses the "operational/available" token, distinct from 18d's purple "administrative outcome recorded" (that token marks the decision event, not the permit's ongoing state). |
| 18g.4 | Revoke action | Text-only red link, not a filled danger button — a deliberate low-emphasis treatment since revoke is rare and destructive; a real build should route this through a confirm step (same pattern as 14b's destructive confirm), not fire directly. Not drawn here — see OQ18-7. |
| 18g.5 | Expired / Revoked rows | Same grey terminal token for both, differentiated by label text only ("Expired" vs "Revoked — noise breach") per the DS's colour+icon+text triple-encoding rule — text carries the distinction here since both are neutral-grey. |

## Screen 18h — Admin/Management: Reviewer Workload

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18h.1 | Tab bar (Workload active) | — |
| 18h.2 | Reviewer row — normal load | Open count + average turnaround, illustrative metrics. |
| 18h.3 | Reviewer row — overdue | Amber "1 Overdue" badge — amber used deliberately here per the DS rule ("interaction-required alert only", DR-04): an overdue application needs a response, so amber is the correct token, not a decorative severity colour. |
| 18h.4 | Reassign action | Opens a picker (not drawn) — would move an application from one reviewer's queue to another's, distinct from 17c's initial assign since this is a workload-balancing move on an already-assigned item. |
| 18h.5 | Team-lead row | Included to show the requesting audience (supervisors/people leaders) appear in this same view, with an oversight-only "0 open" row rather than a separate leaderboard — they see the same table their reports do. |

## Screen 18i — Admin/Management: Reporting

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18i.1 | Tab bar (Reporting active) + date range | — |
| 18i.2 | KPI tiles | Four illustrative metrics, numerals in `--font-mono` per the DS's numbers-are-monospace rule. Kept to four — no chart/sparkline drawn, per this project's minimalism and anti-SVG-imagery guidance; a real build might add one, but that's a hi-fi decision, not a wireframe one. |
| 18i.3 | Breakdown-by-type table | Plain numeric table rather than a chart, same reasoning as 18i.2. |

## Screen 18j — Admin/Management: Permit-Type Configuration

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18j.1 | Tab bar (Permit Types active) | — |
| 18j.2 | Permit type row — fee/docs/conditions | This is the config source for 18c's fee amount, 18b's required-documents checklist, and 18c's default conditions text — those screens read from here rather than each application having independently-set values. Retrofits an implicit assumption from Screens 18b/18c/18d into an explicit config surface. |
| 18j.3 | Edit action | Opens an edit form (not drawn) — same list-with-inline-edit convention as 14a's domain-pack toggle list. |
| 18j.4 | + Add Permit Type | Extensibility affordance — new permit types (beyond the three illustrated) get added here, not hardcoded. |

## Screen 18k — Admin/Management: Expiring Soon

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18k.1 | Tab bar (Expiring Soon active) | — |
| 18k.2 | Row within threshold — amber badge | "9 days left" uses amber for the same DR-04 reason as 18h.3 — a permit about to lapse needs someone to act (renew, follow up), so it qualifies as an interaction-required alert, not a passive status. |
| 18k.3 | Rows outside the near-term band | Grey "22/28 days left" — still surfaced in the list (within the 30-day window) but not urgent enough for amber; a threshold judgement call, not a DS rule — flagged as illustrative. |
| 18k.4 | Send Reminder action | Sends a renewal notice to the holder — no backing notification channel/template is modelled. |
| 18k.5 | Threshold selector | "Expiring within: 30 days" is adjustable, illustrative default. |

### Role scoping for 18g–18k

Per owner direction, this management layer is for council ADMIN **and** team supervisors/people leaders — not the general reviewer pool that uses 18a–18f's queue. Both tiers see the same five screens; no split view is drawn between what an ADMIN vs. a supervisor can see or do (e.g. whether a supervisor can revoke a permit or only reassign workload) — see OQ18-8.

## Screen 18l — Dispatch Look Up: Permits & Licences tab

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18l.1 | New Look Up tab | Extends 5g/9j's tabbed hub with a fourth tab. Positioned as read-only lookup for dispatch/triage use — e.g. confirming whether a location already has an active permit before logging a Sequence 17 complaint against it (a concrete answer to OQ17-3/OQ18-6's cross-domain gap, at least for the lookup side, not the routing side). |
| 18l.2 | Search by location/holder + type filter | Same pattern as 18a/18g's search, scoped for a dispatcher's typical query (an address or a name, not a permit number they wouldn't have on hand). |
| 18l.3 | Result — revoked permit | Shown first deliberately: revoked/expired permits matter as much to a dispatcher as active ones (e.g. confirming a busker at Bourke St Mall no longer holds a valid permit). |
| 18l.4 | Result — temporary permit | A short-dated (2-day) trading permit, included per this session's ask to make sure temporary permits are covered, not just long-validity ones like the busking example. Uses the same record shape as 18f's permit, with a tighter validity window. |

## Screen 18m — EnforcementMAPS mobile: Permit Look Up entry point

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18m.1 | New floating Look Up icon | Added to the map chrome's existing floating-control convention (S2d/S8's Inbox/Settings/SOS icons) — a magnifier icon opens the search screen (18n). No such affordance exists in the current mobile chrome; this is net-new. |

## Screen 18n — EnforcementMAPS mobile: Permit Look Up results

**Status:** PROPOSED.

| # | Element | Annotation |
|---|---|---|
| 18n.1 | Back + title | Standard mobile modal header, consistent with other EnforcementMAPS full-screen views. |
| 18n.2 | Search field | Search by holder name (illustrated) or location — same underlying data as 18l, mobile-optimised result density. |
| 18n.3 | Result card — active permit + conditions | Shows exactly what an officer needs on-site: status, validity window, and conditions — enough to judge compliance without opening the full CommandMAPS record. Framed for a specific use case: confirming a permit before issuing an infringement (links conceptually to Sequence 8/20's infringement-issuance flow), not general browsing. |

## Open questions

- **OQ18-1** — Rejection reason taxonomy (18e.2) is illustrative only, same gap as Sequence 17's OQ17-2 for breach categories. Needs a real, department-approved reason set.
- **OQ18-2** — The application record shape (18b.4's Performance Type/Requested Location fields) is drawn specifically for a busking permit. Confirm whether other Permits & Licensing types (A-Frame Sign, Footpath Trading) share this shape with different field labels, or need genuinely different intake forms — this sequence only builds the busking example.
- **OQ18-3** — Fee (18c.4) is shown as a flat amount with no payment-status tracking (paid/unpaid, payment method). Confirm whether fee collection happens in this workflow at all, or is a separate step/system (relevant to Session 25's payment portal).
- **OQ18-4** — This sequence deliberately diverges from Sequence 17's two-step Assign-then-Action pattern in favour of a single claim-and-decide modal (18c). Confirm this is the right call for a desk-review workflow, or whether Permits & Licensing also wants an explicit "claim"/assignment step for load-balancing across reviewers (relevant if application volume is high).
- **OQ18-5** — 18f's public verification link/QR has no backing endpoint, and no citizen-facing surface exists yet to serve it from. Session 22/23 (citizen submission/status tracking) may be the right place to build this out, or it may need its own dedicated public verification page.
- **OQ18-6** — No explicit link back to Sequence 17's intake queue is built here, even though OQ17-3 flagged that a Local Laws complaint can turn out to be permit-related. This session does not resolve OQ17-3 — that cross-domain routing question remains open on both sides.
- **OQ18-7** — 18g's Revoke action is drawn as a direct link with no confirm step. Given Revoke is destructive and irreversible (unlike anything in the base 18a–18f flow), it should almost certainly route through a styled confirm modal (same open pattern gap as OQ5-2/14b) — not built here.
- **OQ18-8** — 18g–18k are shown as one undifferentiated view for both council ADMIN and team supervisors/people leaders. Confirm whether any action here (Revoke, Reassign, Edit permit type, Add permit type) should be ADMIN-only rather than available to both tiers.
- **OQ18-9** — 18g–18k's "Permits Admin" top-level nav entry is proposed with no confirmed placement, label, or visibility rule — needs owner sign-off before it's treated as a real nav item alongside Dashboard/Directory/Assignments/Look Up.
- **OQ18-10** — 18m's floating Look Up icon has no confirmed placement among the existing Inbox/Settings/SOS controls, and no defined behaviour for officers without Local Laws/Permits domain-pack access (hide the icon vs. show a disabled state per the DS's RBAC-disabled convention).

## Next set — not yet scheduled

Session 19 — Move-on order / notice issuance (field-issued, EnforcementMAPS mobile, parallel to Sequence 8's infringement pattern).
