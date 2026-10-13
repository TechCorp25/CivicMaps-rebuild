# CivicMAPS Rebuild — Wireframe Annotation Document
## Sequence 5 — Directory, Assignments & Look Up

**Document ID:** WF-S5-ANN
**Status:** Draft for owner review
**Companion artefact:** `Wireframes S5 — Directory Assignments and Look Up.dc.html`
**Fidelity:** Low-fi (structure only). Hi-fi follows owner sign-off.
**Date:** 2026-08-05
**Source repository:** `CivicMAPS/CivicMaps-preview` @ `main`

This sequence covers the three admin/dispatcher-facing management pages
referenced by nav pills since Sequence 2 (`Directory`, `Assignments`,
`Look Up`) but never detailed.

### How to read this document

Same convention as Sequences 1–4: each numbered marker maps to a row below,
scoped to its screen (`5a.2` = marker 2 on screen 5a).

---

## Screen 5a — Directory roster list

**Status:** EXISTING. **Source:** `DirectoryPage.tsx` (`groupEntries`, `filtered`, `getRoleBadge`).

| # | Element | Annotation |
|---|---|---|
| 5a.1 | Search field | Free-text filter across display name, officer number, first/last name, email, role, and zone name — client-side `filtered` array, no server round-trip. |
| 5a.2 | + New Employee | Only rendered when `actorCanCreate(user)` — `EMPLOYEE_WRITE_ROLES.has(actor.role)`. Hidden (not disabled) for roles outside that set. |
| 5a.3 | Group headers | Three fixed bands by `roleRank`: Management (≤4), Supervisors (5–7), Officers (≥8) — `groupEntries()`. A band with zero entries doesn't render. |
| 5a.4 | Role badge | 2–3 letter code from `getRoleBadge()` — ADM / CL / CC / DSP / TS / SS / SUP / OFC. Not a Lucide icon — plain text abbreviation. |
| 5a.5 | Zone chip | `zoneName` shown only when the entry has an active assignment; otherwise the row reads "Unassigned" in place of the chip. |

---

## Screen 5b — Employee detail panel

**Status:** EXISTING. **Source:** `DirectoryPage.tsx` (`selectedEntry` view, `actorCanEdit`, `actorCanResetPassword`).

| # | Element | Annotation |
|---|---|---|
| 5b.1 | Header | `OFFICER {officerNumber} / {firstName lastName or displayName}` — always prefixed "OFFICER" regardless of actual role/rank. |
| 5b.2 | Online badge | Only rendered when `isOnline` true; includes a `WifiIcon` + pulsing dot, no "offline" counterpart badge shown. |
| 5b.3 | Detail grid | 12 fields two-up: Email, Officer Number, First/Last Name, Branch, Position, Team, People Manager, Role, Rank, Status, Current Zone, Online, (Last Seen conditional). Empty values render as `—`, not blank. |
| 5b.4 | Read Only badge | Shown only when `actorCanEdit(user, selectedEntry)` is false — a generic lock SVG, not the DS's Lucide-icon disabled-state pattern (see OQ5-3). |
| 5b.5 | Update button | Renders only when `canEditSelected`; opens the same panel in an inline edit form (fields become inputs/selects), not a separate modal. Password reset (5d) surfaces inside this edit mode when `canResetSelected`. |

---

## Screen 5c — New employee onboarding form

**Status:** EXISTING. **Source:** `DirectoryPage.tsx` (`OnboardingForm`, `validateForm`, `handleSubmitOnboarding`).

| # | Element | Annotation |
|---|---|---|
| 5c.1 | Officer Number | Regex-validated `^\d{2,6}$`, digits-only input (non-digits stripped live), max 6 chars. |
| 5c.2 | Email | Regex-validated to end in `.gov.au`. |
| 5c.3 | Branch | Drives cascading Position options (`metadata.positions[branch]`) and filters the People Manager list to the same branch; changing branch resets Position/Manager/Team. |
| 5c.4 | People Manager checkbox | Reveals a free-text "Supervised team ID" input when checked — no team picker, just an ID string. |
| 5c.5 | Temp-password notice | Comment in source (Medium #1 fix) is explicit: the temporary password is server-generated on POST and returned once in the response — the client never sets or sees a password before submit. |
| 5c.6 | Display-name preview | Computed client-side as `Officer_{officerNumber}` and shown live once a number is entered — applies to every role, not just OFFICER rank (see OQ5-1). |
| 5c.7 | Create Employee | Disabled/spinner-labelled ("Creating...") while `submitting`; server validation errors surface as a banner above the form. |

---

## Screen 5h — Onboarding, server validation error (Session 16b)

**Status:** EXISTING, drawn for the first time. **Source:** same banner referenced at 5c.7 — previously described only in annotation text, never rendered as its own screen.

| # | Element | Annotation |
|---|---|---|
| 5h.1 | Error banner | Inline, persistent above the form fields — matches OQ3-1's Session 16 decision (banner, not toast, for anything requiring a response). Message text ("Email already registered to another employee") is representative of a server-side uniqueness check; source doesn't pin an exact string. |
| 5h.2 | Affected field | Email's border tints red to pair the banner with the specific field at fault, consistent with 11g's password-mismatch treatment elsewhere in the system. |

---

## Screen 5d — Onboarding success & password-reset states

**Status:** EXISTING. **Source:** `DirectoryPage.tsx` (`submitSuccess`, `showResetConfirm`, `resetResult`, `handlePasswordReset`).

| # | Element | Annotation |
|---|---|---|
| 5d.1 | Success check | Green circular check icon + "Employee Created" + the new display name, replacing the form entirely (not a toast). |
| 5d.2 | Temp password box | Amber box, `select-all` monospace value, "Share securely. Employee must change on first login." — identical visual treatment reused for the reset-result box in 5d.5 (see OQ5-4). |
| 5d.3 | Done | Closes onboarding and returns to the roster list — the temp password is not shown again after this. |
| 5d.4 | Reset confirmation | Red/emergency-toned box, copy pulled verbatim from source: "Confirm Password Reset" — a two-step confirm, not a native `confirm()` dialog like Assignments' "End" action. |
| 5d.5 | Reset result | Shown inline in the (still-open) employee edit panel, not a new screen — includes `expiresAt` and a dismiss (×) control; also re-fetches that employee's audit trail on success. |

---

## Screen 5e — Assignments zone board

**Status:** EXISTING. **Source:** `AssignmentsPage.tsx`.

| # | Element | Annotation |
|---|---|---|
| 5e.1 | Zone card header | One card per zone (not per officer) — dot in `zone.color`, name, and a live count ("Unassigned" or "N officers"). |
| 5e.2 | Officer row | Wifi icon (online/offline), name, officer number, `teamName` chip, and a role chip only when `role !== "OFFICER"`. |
| 5e.3 | Code 2 badge | Amber, `AlertTriangleIcon` + "Code 2" — only when `hasCode2` true, sourced from `lastCode2At`. |
| 5e.4 | End | Native `confirm("Remove this officer from the zone?")` before calling `/admin/assignments/{id}/end` — no styled confirm modal (contrast with 5d.4's Directory pattern; see OQ5-1 carried convention note). |
| 5e.5 | Unassigned state | Text "No officers assigned" rendered in `text-status-alert` (amber) — a passive empty-state label, not an alert requiring action; potential DR-04 tension (amber reserved for interaction-required alerts) — flagged as OQ5-2. |

---

## Screen 5f — Add officer modal (co-assignment ranking)

**Status:** EXISTING. **Source:** `AssignmentsPage.tsx` (`candidateRanking`, `canCoAssignToZone` from `shared/co-assignment.ts`).

| # | Element | Annotation |
|---|---|---|
| 5f.1 | Currently assigned caption | Lists existing officers + team name for context before picking a new one. |
| 5f.2 | Officer select | Every option is annotated inline: team suffix, "also in {other zones}" suffix, and — when blocked — the `ruling.message` reason appended to the option text itself; blocked options are `disabled`, not hidden. |
| 5f.3 | Ruling message | Repeated below the select in `status-active` green (allowed) or `status-alert` amber (blocked) once an officer is selected — same co-assignment rule surfaced twice (in-option and standalone). |
| 5f.4 | Add officer | Disabled unless the selected officer's ruling is `allowed`. |

---

## Screen 5g — Look Up tabbed hub

**Status:** EXISTING. **Source:** `LookUpPage.tsx`.

| # | Element | Annotation |
|---|---|---|
| 5g.1 | Tabs | Three: Service Requests / Mark ups / Audit — state lives in the `?tab=` URL query param via `useSearchParams`, not component state, so the tab survives a refresh/deep link. |
| 5g.2 | Active tab render | `LookUpPage` has no content of its own — it mounts `Code21Page`, `MarkUpPage`, or `AuditPage` wholesale per tab. Full detail deferred (see "Next set" in `handoff.md`). |
| 5g.3 | Default tab | `service-requests` — `normalizeTab()` falls back to it for any unrecognised/missing `?tab=` value. |

---

## Open questions raised in this sequence

- **OQ5-1** — Directory's onboarding display-name rule (`Officer_{number}`) and its inline-edit-panel pattern apply uniformly across all ranks (Admin, Compliance Lead, etc.), not just OFFICER — confirm this is intended before hi-fi, since the badge/label vocabulary elsewhere treats "Officer" as one specific rank.
- **OQ5-2** — Assignments' "No officers assigned" empty state and Directory's password-reset confirm use two different confirmation patterns for destructive/attention-needing actions (native `confirm()` vs. a styled two-step panel) — worth standardising (echoes OQ3-1).
- **OQ5-3** — Directory's "Read Only" RBAC badge is a generic inline SVG lock, not the DS's documented disabled-state pattern (opacity 0.4 + lock icon + "Requires Manager access" tooltip) — the two convey the same intent differently; reconcile at hi-fi.
- **OQ5-4** — Temp-password display (onboarding success and password-reset result) both use the amber "alert" treatment, but the profile reserves amber for actions still requiring a response — this is informational, already-completed data. Consider a neutral/success treatment instead.
