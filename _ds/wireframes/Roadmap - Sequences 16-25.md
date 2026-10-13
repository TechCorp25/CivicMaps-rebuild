# CivicMAPS Wireframes — Roadmap (Sequences 16–25)

This session produced no new screens — index + forward plan only, per owner direction (assess scope before continuing).

## Index — completed (Sequences 1–15)

| Seq | Scope | Screens | Status |
|---|---|---|---|
| 1 | Entry & Authentication | 8 | Complete |
| 2 | Shell & Navigation | 5 | Complete |
| 3 | Dashboard | 5 | Complete |
| 4 | Live Map | 6 | Complete |
| 5 | Directory, Assignments & Look Up | 7 | Complete |
| 6 | Code21 Create & Dispatch | 5 | Complete |
| 7 | Code21 Detail & Lifecycle | 7 | Complete |
| 8 | Officer Dispatch Workflow (+ Animal Mgmt & Rangers infringement variants) | 20 | Complete |
| 9 | Mark-Up Create & Detail (mobile, web, CommandMAPS) | 19 | Complete |
| 10 | Audit Trail | 5 | Complete |
| 11 | Settings | 9 | Complete |
| 12–15 | Platform Admin (Shell/Directory, Onboarding, Domain-pack/Sandbox, Health Dashboard) | 13 | Complete |
| 16b | `alert()` → toast/banner sweep (S3, S5, S6, S8) | 4 | Complete |
| 17 | Case/Record Intake Queue (Local Laws) | 6 | Complete |
| 18 | Permit Issuance Workflow (busking permit) + admin/management layer + dispatch/mobile lookup | 14 | Complete |

Full screen-by-screen detail and the full open-questions log: `handoff.md`.

## Phase 0 — Owner decisions

**Session 16 — OQ Resolution — done.**
Decisions logged in `docs/OQ Resolution - Session 16 Decision Sheet.md` and `handoff.md`. OQ12-2/12-3/13-1/14-1/15-1/3-1 resolved; OQ12-1 left open by owner request. Slug-immutability copy patched into 13a. Owner supplied target-architecture docs (Section 01-03) — logged as background context in `handoff.md`, not yet adopted into the wireframes.

**Session 16b — `alert()` → toast/banner sweep — done.**
Applied across S3 (new 3f, toast), S5 (new 5h, banner), S6 (new 6f, banner), S8 (new 8j, toast + banner split). S11 checked — already compliant (source already uses a banner, not `alert()`). S8's "Confirm No Report" two-choice dialog re-scoped to OQ5-2 (styled confirm modal, still open) since a toast/banner split doesn't apply to a decision gate. Details in `handoff.md` and each sequence's annotations doc.

## Phase 1 — Internal council department management

One flow per session, ordered so the intake queue (which every issuance flow feeds into) lands first.

**Session 17 — Case/record intake queue — done.**
Built as `Wireframes S17 - Case Intake Queue.dc.html` (17a–17f): intake list, case detail (unassigned/assigned/actioned), assign-to-officer/team modal, action/close modal with an outcome-dependent Actioned/Closed split. Six open questions logged (OQ17-1–6) in `handoff.md`, including a flagged link-forward gap into Session 18 (OQ17-3).

**Session 18 — Permit issuance workflow — done.**
Built as `Wireframes S18 - Permit Issuance Workflow.dc.html` (18a–18f): application queue, application detail (submitted/approved/rejected), review & decision modal, and a separate issued-permit record card. Extended with a CommandMAPS admin/management layer (18g–18k: Permit Registry, Reviewer Workload, Reporting, Permit-Type Configuration, Expiring Soon, now on full desktop chrome), a dispatch Look Up tab (18l, incl. temporary permits), and EnforcementMAPS mobile lookup screens for field officers (18m–18n). Ten open questions logged (OQ18-1–10) in `handoff.md`.

**Session 19 — Move-on order / notice issuance**
Field-issued notice, likely EnforcementMAPS mobile, parallel to Session 8's infringement-issuance pattern.

**Session 20 — Infringement issuance (Local Laws variant)**
Extends Session 8's 8d/8h/8i step pattern to the Local Laws domain pack.

**Session 21 — Department/team org structure & permissions**
Council-level org chart and permissions, scoped inside a single council's ADMIN role — distinct from Platform Admin's cross-council view (S12–15). Placed last in this phase since it's config, not a live workflow.

## Phase 2 — Citizen-facing surfaces

**Session 22 — Service request submission (public)**
Per-domain public submission form — the entry point Session 17's queue receives from.

**Session 23 — Status tracking / notifications**
Citizen-facing tracking for a submitted request (permit, service request, or infringement review).

**Session 24 — Internal review / appeal request**
Resolves OQ10-3 (no citizen-facing surface for an infringement-withdrawal/appeal request).

**Session 25 — Payment portal**
Pay an infringement or permit fee.

## Session ritual (every future session)

1. Build one `.dc.html` sequence + companion `docs/WF-Sn … - Annotations.md`.
2. Update `handoff.md`: move the sequence from this roadmap into Completed, log any new open questions.
3. Update this roadmap: mark the session done, re-sequence what's left if scope shifted.

## Sequencing notes

- Granularity is one task per session by design (owner preference) — expect ~10 sessions to clear Phases 1–2, plus Session 16.
- Fidelity stays low-fi throughout; hi-fi remains deferred pending owner sign-off (unchanged from existing handoff.md note).
- Order is a proposal, not fixed — flag if a different sequence (e.g. citizen intake before internal queue) suits better.
