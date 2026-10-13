# Service Request Workflow

> CivicMAPS — Municipal Area Patrol System
> Code21 / Service Request End-to-End Lifecycle
> Version 2.2.0

---

## 1. Overview

A Service Request (SR), also referred to as a Code21, is the primary operational unit in MAPS. It represents a report — typically from a member of the public — of an alleged parking offence. The SR tracks the full lifecycle from initial report through to resolution, whether that results in a Parking Infringement Number (PIN) being issued, a No Report outcome, or administrative closure.

### Terminology

| Term | Definition |
|------|-----------|
| SR | Service Request — the operational record |
| Code21 | Radio/dispatch code used interchangeably with Service Request |
| Code2 | Log entry recorded against an officer during operations |
| PIN | Parking Infringement Number — a formal parking fine issued to a vehicle |
| Alleged Offence | The reported offence type before officer attendance and confirmation |
| Offence Type | The confirmed offence type after a PIN has been issued |
| No Report | Outcome when an officer attends and observes no offence occurring |
| CommandMAPS | The web-based dispatch and administration portal (`commandmaps/`) |
| EnforcementMAPS | The mobile application used by officers in the field (`enforcementmaps/`) |
| Patrol Zone | A defined geographic area assigned to one or more officers for patrol coverage |
| Active SR List | The officer's queue of accepted, in-progress service requests on EnforcementMAPS |
| Trip Routing | Route planning from officer's current location to SR destinations, optimised by transport mode |

### SR Number Generation

SR numbers are **auto-generated server-side** using a Feistel cipher permutation applied to a PostgreSQL sequence counter. There is no manual SR number input at any stage of the workflow.

| Property | Specification |
|---|---|
| Format | Numeric only |
| Length | 7 digits |
| Sequential | No — Feistel cipher permutation produces non-sequential values |
| Repeatable | No — bijective mapping from database sequence guarantees uniqueness |
| Concurrency-safe | Yes — PostgreSQL sequence-backed |
| Editable | No — immutable from the moment of creation, never exposed as an editable field |

The SR number is generated at INSERT time and returned as a read-only property on all subsequent views. It is never included in create or edit request payloads.

---

## 2. Roles & Permissions Summary

Refer to `MAPS-PERMISSIONS-README.md` for the full RBAC specification. The summary below covers SR-specific permissions only.

| Capability | Admin | Comp. Lead | Comp. Coord. | Dispatch | Team Sup. | Shift Sup. | Supervisor | Officer |
|---|---|---|---|---|---|---|---|---|
| Create / dispatch SR | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign / reassign officer (global) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign / reassign officer (team-scoped) | — | — | — | — | ✅ | ✅ | ✅ | ❌ |
| Log Code2 entries | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit SR form (global) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit SR form (own assigned SR) | — | — | — | — | ❌ | ❌ | ❌ | ✅ |
| Edit SR form (direct report's SR) | — | — | — | — | ✅ | ✅ | ✅ | ❌ |
| Close SR | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Void / delete SR with PIN (global) | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Void / delete SR with PIN (team-scoped) | ❌ | — | — | ❌ | ✅ | ✅ | ✅ | ❌ |
| Issue a PIN | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Toggle No Report (CommandMAPS) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Toggle No Report (EnforcementMAPS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅* |
| Toggle No Report (either platform) | ❌ | ❌ | ❌ | ❌ | ✅** | ✅** | ✅** | ❌ |
| Reassign SR (dispatch-level) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Accept zone SR (auto-assign) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅*** |

> \* Assigned officer only, on their own SR
> \** People manager of the assigned officer only
> \*** Officer must be assigned to the same patrol zone as the SR

---

## 3. Service Request Lifecycle

### 3.1 Status Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌──────────────┐                                                           │
│  │  SR Received   │ ← Initial save (SR number auto-generated)                │
│  └──────┬───────┘                                                           │
│         │ Officer assigned                                                   │
│         ▼                                                                    │
│  ┌────────────────────────┐                                                 │
│  │  Dispatched Not Active  │ ← Push notification sent, not yet opened        │
│  │  (10-min reminder loop) │                                                 │
│  └──────┬─────────────────┘                                                 │
│         │ Notification/marker opened by officer                              │
│         │ OR zone officer accepts SR                                         │
│         ▼                                                                    │
│  ┌──────────────────┐                                                       │
│  │  Dispatched Active │ ← Officer has accepted, countdown started            │
│  │  (60-min officer)  │                                                      │
│  │  (90-min dispatch) │                                                      │
│  └──────┬───────────┘                                                       │
│         │ SR added to Active SR List + Trip Routing                           │
│         │ Officer en route                                                   │
│         ▼                                                                    │
│  ┌─────────────┐                                                            │
│  │   Attended    │ ← Officer arrives at location                              │
│  └──────┬──────┘   Destination removed from route planner                    │
│         │                                                                    │
│         ├────────────────────────────────┐                                   │
│         ▼                                ▼                                   │
│  ┌──────────────┐                ┌────────────────────┐                     │
│  │  PIN Issued    │                │    No Report        │                     │
│  │  (Header:      │                │    (Evidence req.)  │                     │
│  │  "Offence Type")│                └────────┬───────────┘                     │
│  └──────┬───────┘                           │                                │
│         │                                    ▼                                │
│         ▼                           ┌────────────────────┐                   │
│  ┌────────────┐                     │ Attended, Complete   │                   │
│  │  Complete    │                     └────────────────────┘                   │
│  └────────────┘                                                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────┐                │
│  │  Closed (Administrative — Admin, Dispatch, Compliance)   │                │
│  └─────────────────────────────────────────────────────────┘                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────┐                │
│  │  Voided (PIN SR only — Compliance / Supervisor)          │                │
│  └─────────────────────────────────────────────────────────┘                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Status Definitions

| Status | Description |
|--------|-------------|
| SR Received | SR has been created and saved. SR number auto-generated. No officer assigned yet. |
| Dispatched Not Active | An officer has been assigned. Push notification sent to officer's mobile handset. Location marker placed on the assigned officer's EnforcementMAPS map, the people manager's map UI, and the dispatch CommandMAPS dashboard map. The officer has not yet opened the notification or marker. A 10-minute reminder loop fires until the officer accepts. |
| Dispatched Active | The assigned officer has opened the push notification or location marker on EnforcementMAPS, confirming acceptance. The SR is added to the officer's Active SR List and Trip Routing destination list. Countdown timers begin. |
| Attended | The assigned officer has arrived at the SR location. The destination is removed from the route planner list. The officer begins the report workflow. |
| PIN Issued | The officer has confirmed an offence and issued a Parking Infringement Number. The form header transitions from "Alleged Offence" to "Offence Type". |
| Complete | The SR has been fully resolved with a PIN outcome. All post-PIN fields are locked. |
| Attended, Complete | The officer attended, observed no offence, and submitted a No Report with evidence. |
| Closed | The SR has been administratively closed by an authorised role (Admin, Dispatch, Compliance Lead, Compliance Coordinator). |
| Voided | A previously issued PIN has been voided/deleted by an authorised role. The SR record is marked void. |

---

## 4. Workflow Stages

### 4.1 Stage 1 — Creation (SR Received)

**Trigger:** A member of the public contacts the operations centre to report an alleged parking offence, or a dispatch operator identifies a potential offence through other means.

**Actors:** Admin, Dispatch, Compliance Lead, Compliance Coordinator

**Platform:** CommandMAPS web portal

**Actions:**
1. The authorised user creates a new SR record.
2. The form is populated with initial details:
   - Date and time of report
   - Location / address of the alleged offence
   - Reporter details (if provided)
   - **Alleged Offence** type (selected from offence code list)
   - Vehicle details (if provided)
   - Additional notes
3. The SR is saved for the first time.

**On initial save:**
- The **SR number is auto-generated** server-side via the Feistel cipher over the PostgreSQL sequence. It is returned as a read-only field and displayed on the form. There is no manual SR number input at any point.
- Status is set to **SR Received**.

**Post-creation immutability:**
- The SR number is permanently read-only from the moment of creation. It is never included in create or edit request payloads and is rejected by the API if present.

---

### 4.2 Stage 2 — Officer Assignment & Dispatch

**Trigger:** An SR exists in SR Received status and requires an officer to attend.

**Actors (global — any officer, any branch):** Admin, Dispatch, Compliance Lead, Compliance Coordinator

**Actors (scoped — assigned teams, own branch):** Team Supervisor, Shift Supervisor, Supervisor

#### 4.2.1 Assignment

1. The authorised user selects an available officer from the roster.
   - Global roles can assign any officer from any branch.
   - Team-scoped roles can only assign officers from their own assigned team(s) within their own branch.
2. The officer is linked to the SR record.

#### 4.2.2 Dispatch — Notification & Marker Placement

On assignment, the following actions fire automatically and simultaneously:

| Action | Target | Platform |
|--------|--------|----------|
| Push notification sent | Assigned officer's mobile handset | EnforcementMAPS |
| Location marker placed on map | Assigned officer's map UI | EnforcementMAPS |
| Location marker placed on map | Assigned officer's people manager map UI | EnforcementMAPS / CommandMAPS |
| Location marker placed on map | Dispatch dashboard map UI | CommandMAPS |

**Status transitions based on officer response:**

#### Path A — Dispatched Not Active

The officer has **not** opened the push notification or tapped the location marker.

- Status: **Dispatched Not Active**
- A **10-minute reminder loop** begins:
  - The push notification is refreshed and a reminder is re-sent every 10 minutes.
  - The loop continues until the assigned officer opens the notification or location marker on EnforcementMAPS.
  - There is no automatic timeout or escalation defined at this stage (future specification may add supervisor escalation thresholds).

**The assigned officer cannot decline an SR.** If reassignment is required, it must be performed by:
- **Dispatch** — can manually reassign to any officer from any branch.
- **Another officer assigned to the same patrol zone** — may accept the SR, which triggers automatic system-based reassignment and immediately transitions to Dispatched Active (see Path B).

#### Path B — Dispatched Active

The officer has **opened** the push notification or tapped the location marker on the EnforcementMAPS mobile application.

- Status: **Dispatched Active**
- This status change is triggered exclusively by the assigned officer's interaction on EnforcementMAPS. It cannot be set manually by dispatch or any other role.
- **Exception — Zone officer acceptance:** If an officer assigned to the same patrol zone as the SR accepts the SR, the system automatically reassigns the SR to the accepting officer and sets the status to Dispatched Active.

**On transition to Dispatched Active:**

1. **Active SR List** — The SR is added to the assigned officer's Active SR List on EnforcementMAPS.
2. **Trip Routing** — The SR location is added to the officer's trip routing destination list. This allows the officer to:
   - Plan a route from their current GPS location to the SR destination.
   - Optimise routing based on the transport mode enabled on their handset: **"On Foot"** or **"In Vehicle"**.
3. **Countdown timers are started:**

| Timer | Duration | Starts From | Visible To |
|-------|----------|-------------|------------|
| Officer countdown | **60 minutes** | Time of acceptance (Dispatched Active timestamp) | Assigned officer (EnforcementMAPS) |
| Dispatch / PM countdown | **90 minutes** | Time SR was assigned to patrol zone/area and/or logged-in officer | Dispatch (CommandMAPS), assigned officer's people manager |

- Countdown timers are **preset and non-editable**.
- Timer early warning and expiry behaviour is defined in Section 7.4 and Section 7.6.

---

### 4.3 Stage 3 — Officer Attendance

**Trigger:** The assigned officer arrives at the SR location.

**Actor:** Assigned Officer (via EnforcementMAPS mobile application)

**Actions:**
1. When the officer comes within **25 metres** of the SR location, GPS proximity auto-detection triggers a **confirmation prompt** on EnforcementMAPS. The officer must **explicitly accept** the prompt to register attendance. Silent auto-attendance is not permitted — the officer must consciously confirm arrival.
2. The SR destination is **removed from the trip routing destination list**.
3. Status updates to **Attended**.
4. The officer begins the report workflow.

**At this point, the workflow branches into one of two paths:**
- **Path A — Offence Confirmed → PIN Issuance** (Section 4.4)
- **Path B — No Offence Observed → No Report** (Section 4.5)

---

### 4.4 Stage 4a — PIN Issuance (Offence Confirmed)

**Trigger:** The officer observes a legitimate parking offence at the attended location and issues a formal infringement.

**Actor:** Assigned Officer (via EnforcementMAPS mobile application)

**Legally excluded:** Admin — the Admin account cannot issue a PIN. PIN issuance is a legally accountable action requiring an identifiable, operationally authorised officer.

**Actions:**
1. The officer completes the infringement details on the SR form.
2. The officer enters the **PIN (Parking Infringement Number)** into the SR.
3. On save:
   - The form header **"Alleged Offence"** automatically updates to **"Offence Type"**. This transition is permanent and reflects the confirmation that a legitimate offence has occurred.
   - All fields populated at or after PIN assignment become **permanently read-only** for all roles.
   - Status updates to **PIN Issued**, then to **Complete** once all required fields are finalised.

**Field lock rules post-PIN:**

| Field Category | State |
|----------------|-------|
| SR Number | Read-only (immutable from creation — auto-generated, never editable) |
| Pre-PIN fields (location, reporter, vehicle, alleged offence → offence type) | Remain as they were at time of PIN save |
| PIN and all post-PIN fields | Permanently read-only for all roles |
| Additional Notes | Editable by permitted roles (see Section 5) |

**Header transition detail:**

| Before PIN | After PIN Save |
|------------|---------------|
| "Alleged Offence" | "Offence Type" |

This rename is persisted on the SR record and rendered in all views (CommandMAPS and EnforcementMAPS). It never reverts.

---

### 4.5 Stage 4b — No Report (No Offence Observed)

**Trigger:** The officer attends the location, visually observes the area, and determines that no parking offence is occurring.

**Actors (toggle visibility):**

| Role | Platform | Visibility |
|------|----------|-----------|
| Dispatch | CommandMAPS web portal | ✅ Can see and toggle |
| Assigned Officer | EnforcementMAPS mobile application | ✅ Can see and toggle |
| Assigned Officer's People Manager | Both platforms | ✅ Can see and toggle |
| All other roles | Either platform | ❌ Toggle not rendered |

**Actions:**

1. The authorised user toggles the **"No Report"** button to ON.
2. On toggle activation:
   - All form fields become **read-only** except **Additional Notes**.
   - If the actor is the **assigned officer on EnforcementMAPS mobile**, the **Evidence Capture Workflow** is triggered (see Section 4.5.1).
3. On save:
   - Status automatically changes to **"Attended, Complete"**.
   - The SR is closed. No further edits are permitted except Additional Notes.

**Toggle reversal:** If the No Report toggle is switched OFF before saving, all captured evidence images are discarded and field locks are released. The SR returns to its previous editable state.

#### 4.5.1 Evidence Capture Workflow (EnforcementMAPS Mobile)

When the assigned officer toggles No Report ON within EnforcementMAPS, an evidence capture workflow is activated. The SR **cannot be saved** with a No Report status until the evidence requirements are met.

**Requirements:**
- A minimum of **3 photographs** must be captured using the mobile handset's built-in camera.
- The save button remains **disabled** until the minimum photo count is satisfied.

**Metadata captured per image:**

| Field | Source | Description |
|-------|--------|-------------|
| `sr_number` | Current SR | The SR/Code21 number this evidence relates to |
| `capture_date` | Device clock | Date of capture (ISO 8601) |
| `capture_time` | Device clock | Time of capture (ISO 8601, including timezone) |
| `gps_location` | Device GPS | Latitude and longitude at moment of capture |
| `officer_number` | Authenticated session | Officer Number of the assigned and logged-in officer |

**Constraints:**
- GPS coordinates must be actively acquired at capture time. Cached or stale coordinates are rejected. If GPS is unavailable, the capture is blocked and the officer is prompted to enable location services.
- Metadata is written at capture time and treated as **immutable** — it cannot be edited or overridden after the image is saved.
- Images and metadata are associated with the SR record and persisted to the server on save.

---

### 4.6 Stage 5 — Administrative Closure

**Trigger:** An SR needs to be closed without following the standard PIN or No Report path — for example, duplicate reports, erroneous entries, or operational decisions.

**Actors:** Admin, Dispatch, Compliance Lead, Compliance Coordinator

**Actions:**
1. The authorised user closes the SR.
2. Status updates to **Closed**.
3. The reason for closure should be recorded in Additional Notes.

---

### 4.7 Stage 6 — PIN Void / Deletion

**Trigger:** A previously issued PIN needs to be voided or the SR containing it needs to be deleted. This is the highest-consequence action in the SR lifecycle.

**Actors (global — any branch):** Compliance Lead, Compliance Coordinator

**Actors (scoped — team-level, own branch):** Team Supervisor, Shift Supervisor, Supervisor

**Explicitly excluded:**
- Dispatch — can edit and close SRs but cannot void a PIN.
- Admin — the Admin account is not intended for operational use. PIN issuance and void/delete are legally accountable actions requiring an identifiable, operationally authorised individual for audit purposes. Admin carries no legal accountability and therefore cannot issue, void, or delete a PIN. Admin is intended for managing operational information, accounts, and workflow testing.

**Actions:**
1. The authorised user initiates a void/delete on an SR that contains an issued PIN.
2. The SR is marked as **Voided** or removed from active records.
3. An audit trail must be preserved recording who voided the PIN, when, and the reason.

---

## 5. Field Editability by SR State

### 5.1 Field Lock Progression

Fields lock progressively as the SR advances through its lifecycle. Locks are cumulative — once a field is locked, it remains locked regardless of subsequent status changes. The SR number is auto-generated and **never editable** at any stage.

| SR State | SR Number | Core Fields | PIN & Post-PIN Fields | Additional Notes | No Report Toggle | Countdown Timers |
|----------|-----------|-------------|----------------------|-----------------|-----------------|-----------------|
| SR Received | 🔒 Auto-generated, read-only | ✏️ Editable | — Not yet present | ✏️ Editable | — Not applicable | — Not started |
| Dispatched Not Active | 🔒 Read-only | ✏️ Editable | — Not yet present | ✏️ Editable | — Not applicable | — Not started |
| Dispatched Active | 🔒 Read-only | ✏️ Editable | — Not yet present | ✏️ Editable | — Not yet visible | ⏱️ Running (non-editable) |
| Attended | 🔒 Read-only | ✏️ Editable | — Not yet present | ✏️ Editable | ✏️ Visible to permitted roles | ⏱️ Stopped |
| PIN Issued / Complete | 🔒 Read-only | 🔒 Locked | 🔒 Locked | ✏️ Editable | — Not applicable (PIN path taken) | — Stopped |
| Attended, Complete (No Report) | 🔒 Read-only | 🔒 Locked | — Not applicable | ✏️ Editable | 🔒 Locked ON | — Stopped |
| Closed | 🔒 Read-only | 🔒 Locked | 🔒 Locked (if present) | ✏️ Editable | 🔒 Locked | — Stopped |
| Voided | 🔒 Read-only | 🔒 Locked | 🔒 Locked | ⚠️ Append-only (see below) | 🔒 Locked | — Stopped |

**Voided state — Additional Notes:** Content that existed prior to the void action becomes permanently read-only. New notes may be appended after the void. Each appended note must carry a timestamp (date and time) and is recorded in the audit trail. Previously written content cannot be edited or deleted.

### 5.2 Who Can Edit (by SR state, subject to field locks above)

| Role | SR Received | Dispatched (Not Active / Active) | Attended | PIN Issued / Complete | Attended Complete | Closed | Voided |
|------|-------------|----------------------------------|----------|----------------------|-------------------|--------|--------|
| Admin | ✅ | ✅ | ✅ | Additional Notes only | Additional Notes only | Additional Notes only | Append notes only |
| Compliance Lead | ✅ | ✅ | ✅ | Additional Notes only | Additional Notes only | Additional Notes only | Append notes only |
| Compliance Coordinator | ✅ | ✅ | ✅ | Additional Notes only | Additional Notes only | Additional Notes only | Append notes only |
| Dispatch | ✅ | ✅ | ✅ | Additional Notes only | Additional Notes only | Additional Notes only | Append notes only |
| Assigned Officer | ❌ | ✅ Own SR | ✅ Own SR | Additional Notes only | Additional Notes only | ❌ | ❌ |
| People Manager of Assigned Officer | ❌ | ✅ Direct report's SR | ✅ Direct report's SR | Additional Notes only | Additional Notes only | ❌ | ❌ |
| All others | ❌ | ❌ Read-only | ❌ Read-only | ❌ Read-only | ❌ Read-only | ❌ Read-only | ❌ Read-only |

---

## 6. SR Form Header Behaviour

The offence section header on the SR form changes based on the SR lifecycle:

| Condition | Header Text | Rationale |
|-----------|-------------|-----------|
| No PIN entered or saved | **Alleged Offence** | The reported offence is unconfirmed — it is an allegation from a member of the public |
| PIN entered and form saved | **Offence Type** | The attending officer has visually confirmed and issued a formal infringement, confirming the offence is legitimate |

This transition is:
- **Automatic** — triggered on save when a PIN is present
- **Permanent** — the header never reverts to "Alleged Offence" once changed
- **Persisted** — stored on the SR record, not derived at render time
- **Universal** — rendered consistently in both CommandMAPS and EnforcementMAPS

---

## 7. Dispatch & Notification Mechanics

### 7.1 Push Notification Lifecycle

| Event | Trigger | Target |
|-------|---------|--------|
| Initial notification | Officer assigned to SR | Assigned officer's mobile handset |
| Reminder (recurring) | 10-minute interval while status = Dispatched Not Active | Assigned officer's mobile handset |
| Reminder ceases | Officer opens notification/marker OR SR is reassigned | — |

### 7.2 Map Marker Placement

When an SR transitions from SR Received to Dispatched Not Active, location markers are placed on the following map UIs simultaneously:

| Map UI | Platform | User |
|--------|----------|------|
| Officer map | EnforcementMAPS | Assigned officer |
| People manager map | EnforcementMAPS / CommandMAPS | Assigned officer's people manager |
| Dispatch dashboard map | CommandMAPS | Dispatch |

Markers persist on the map until the SR reaches a terminal state (Complete, Attended Complete, Closed, Voided) or the SR is reassigned (marker moves to new assignee's map).

### 7.3 SR Acceptance & Reassignment

| Mechanism | Actor | Effect |
|-----------|-------|--------|
| Open notification/marker | Assigned officer | Status → Dispatched Active, countdowns start |
| Manual reassignment | Dispatch | SR reassigned to new officer, new notification cycle begins |
| Zone acceptance | Officer in same patrol zone | System auto-reassigns SR, status → Dispatched Active immediately |

**Officers cannot decline an SR.** The only paths away from an assignment are dispatch-initiated reassignment or another zone officer accepting the SR.

### 7.4 Countdown Timers

| Timer | Duration | Starts From | Visible To | Editable |
|-------|----------|-------------|------------|----------|
| Officer countdown | 60 minutes | Time of acceptance (Dispatched Active timestamp) | Assigned officer (EnforcementMAPS) | No |
| Dispatch / PM countdown | 90 minutes | Time SR was assigned to patrol zone/area and/or logged-in officer | Dispatch (CommandMAPS), people manager (CommandMAPS / EnforcementMAPS) | No |

- Both timers are **preset and non-editable** — they cannot be paused, reset, or extended by any role.
- Timers stop when the SR transitions to Attended or any terminal state.
- The 30-minute difference between officer and dispatch/PM timers is an operational buffer accounting for officer unavailability due to driving, ablution breaks, or scheduled crib breaks. Under normal operations, the dispatch/PM timer should not reach expiry without resolution.

#### 7.4.1 Officer Timer Expiry (60 Minutes)

When the officer's 60-minute countdown expires without the SR reaching Attended status, the following escalation fires:

1. **Alert to people manager** — push notification sent to the assigned officer's people manager.
2. **Alert to dispatch** — pop-up alert on the dispatch CommandMAPS dashboard.
3. **SR remains with the assigned officer** — no automatic reassignment.
4. **Dispatch resolves** — after receiving an update from the assigned officer or their people manager, dispatch selects one of three resolution options:

| Option | Action | Countdown Reset |
|--------|--------|-----------------|
| **Reassign to same officer (urgent)** | SR remains with the current officer. Status flagged as **urgent/priority**. | New 30-minute countdown for officer. Dispatch/PM timer resets to 30 minutes. |
| **Assign to new officer** | SR reassigned to a different officer. New notification cycle begins. | New 60-minute countdown for both dispatch and the newly assigned officer. |
| **Close — no reports, no evidence** | SR closed by dispatch. No attendance, no evidence captured. | Timers cleared. |

**Close — no reports, no evidence (dispatch only):** This resolution option is restricted to dispatch. When selected, the system automatically raises a **review flag** on the assigned officer's people manager dashboard. The people manager must review and acknowledge the flag. This closure and flag are recorded in the audit trail.

#### 7.4.2 Dispatch / PM Timer Expiry (90 Minutes)

The dispatch/PM 90-minute timer follows the **same escalation path** as the officer 60-minute timer:

1. Alert to people manager.
2. Alert to dispatch.
3. SR remains with the assigned officer.
4. Dispatch resolves using the same three options defined in Section 7.4.1.

Under normal operations, the officer timer expiry at 60 minutes should trigger resolution before the dispatch/PM timer reaches 90 minutes. The dispatch/PM timer expiry acts as a failsafe for cases where the 60-minute escalation was not resolved within the 30-minute buffer.

### 7.5 Early Warning Thresholds

Before countdown timers reach full expiry, early warning alerts are sent at two thresholds:

#### 50% Elapsed — Officer Warning

| Aspect | Detail |
|--------|--------|
| Trigger | 50% of officer countdown elapsed (30 minutes into a 60-minute timer) |
| Target | Assigned officer only |
| Delivery | Pop-up push notification on officer's mobile handset (EnforcementMAPS) |
| Acknowledgement | **Mandatory** — officer must manually acknowledge the notification |
| Audit | Acknowledgement timestamp and officer recorded in audit trail |

#### 75% Elapsed — Officer + Dispatch Warning

| Aspect | Detail |
|--------|--------|
| Trigger | 75% of officer countdown elapsed (45 minutes into a 60-minute timer) |
| Targets | Assigned officer AND dispatch |
| Officer delivery | Pop-up push notification on officer's mobile handset (EnforcementMAPS) |
| Dispatch delivery | Pop-up alert on dispatch CommandMAPS dashboard |
| Acknowledgement | **Mandatory** — both the officer and dispatch must manually acknowledge their respective alerts |
| Audit | Both acknowledgement timestamps and users recorded in audit trail |

Early warning thresholds are calculated relative to the officer's 60-minute countdown. They do not apply separately to the dispatch/PM 90-minute countdown.

### 7.6 Trip Routing & Active SR List

When an SR reaches Dispatched Active:

1. The SR is added to the officer's **Active SR List** on EnforcementMAPS — a prioritised queue of accepted, in-progress service requests.
2. The SR location is added to the **Trip Routing destination list**, enabling:
   - Route calculation from the officer's current GPS location to the SR destination.
   - Route optimisation based on the officer's active transport mode:
     - **On Foot** — pedestrian routing
     - **In Vehicle** — driving routing
   - Multi-stop optimisation when the officer has multiple active SRs.

When the officer arrives at the SR location (Attended status):
- The destination is **removed from the trip routing list**.
- The SR remains in the Active SR List until it reaches a terminal state.

---

## 8. Enforcement Rules

### 8.1 Server-Side (Authoritative)

All rules documented in this workflow must be enforced server-side. The API must reject any request that violates status transitions, field locks, role permissions, or scope restrictions with an HTTP 403 and structured JSON error.

**SR number enforcement:** The SR number is auto-generated server-side. The API must reject any create or edit payload that includes an `sr_number` field. The SR number is returned as a read-only property in all response payloads.

**Field lock enforcement:** The API must maintain a definitive list of locked fields per SR state. Any payload containing modifications to locked fields must be rejected entirely — partial saves with locked field modifications silently stripped are not acceptable.

**Status transition enforcement:** The API must validate that status transitions follow the lifecycle defined in Section 3. Valid transitions:

| From | To (valid) |
|------|-----------|
| SR Received | Dispatched Not Active, Closed |
| Dispatched Not Active | Dispatched Active, Dispatched Not Active (reassignment), Closed |
| Dispatched Active | Attended, Closed |
| Attended | PIN Issued, Attended Complete (No Report), Closed |
| PIN Issued | Complete, Closed |
| Complete | Voided |
| Attended, Complete | Closed |
| Closed | — (terminal) |
| Voided | — (terminal, append-only notes permitted) |

Any transition not listed above must be rejected.

### 8.2 Client-Side (Supplementary)

Both CommandMAPS and EnforcementMAPS must reflect field locks, permission restrictions, status-appropriate UI states, and countdown timers. These are UX conveniences and must never be the sole point of enforcement.

- Locked fields render as read-only / disabled inputs.
- Buttons and toggles outside the user's permission scope are not rendered.
- Status transitions are reflected in real-time where possible.
- Countdown timers display remaining time with visual urgency indicators as expiry approaches.
- The Active SR List and trip routing update in real-time as SRs are accepted, attended, and completed.

---

## 9. Audit & Traceability

The following events must be captured in an audit trail on every SR:

| Event | Data Captured |
|-------|---------------|
| SR Created | Timestamp, creating user, auto-generated SR number, initial field values |
| Officer Assigned / Reassigned | Timestamp, assigning user, officer assigned, previous officer (if reassignment), assignment method (manual / zone acceptance) |
| Push Notification Sent | Timestamp, target officer, notification type (initial / reminder) |
| Push Notification Opened | Timestamp, officer, status transition triggered |
| SR Dispatched Active | Timestamp, officer, acceptance method (notification opened / zone acceptance), countdown start times |
| 50% Warning Sent | Timestamp, SR number, target officer |
| 50% Warning Acknowledged | Timestamp, officer |
| 75% Warning Sent | Timestamp, SR number, target officer, dispatch user |
| 75% Warning Acknowledged (Officer) | Timestamp, officer |
| 75% Warning Acknowledged (Dispatch) | Timestamp, dispatch user |
| Officer Timer Expired | Timestamp, SR number, assigned officer, escalation alerts sent to (PM, dispatch) |
| Dispatch/PM Timer Expired | Timestamp, SR number, assigned officer, escalation alerts sent to (PM, dispatch) |
| Timer Expiry Resolution | Timestamp, dispatch user, resolution option selected (reassign same/urgent, assign new, close no reports), new countdown values if applicable |
| Close No Reports — PM Review Flag | Timestamp, SR number, flagged people manager, originating dispatch user |
| GPS Proximity Detected | Timestamp, officer, SR number, GPS coordinates, distance from SR location |
| Attendance Confirmed | Timestamp, officer, SR number, GPS coordinates at confirmation |
| Officer Attended | Timestamp, officer, GPS location at attendance |
| PIN Entered & Saved | Timestamp, officer, PIN number, header transition (Alleged Offence → Offence Type) |
| No Report Toggled ON | Timestamp, user, platform (CommandMAPS / EnforcementMAPS) |
| Evidence Image Captured | Timestamp, officer_number, sr_number, gps_location, image reference, TRAINING flag (if applicable) |
| SR Closed | Timestamp, closing user, reason |
| SR Voided | Timestamp, voiding user, reason, original PIN number |
| Field Edited | Timestamp, editing user, field name, previous value, new value |
| Code2 Logged | Timestamp, logging user, officer, entry details |
| Additional Notes Appended (Voided SR) | Timestamp, authoring user, note content |
| Training Mode Entered | Timestamp, user, platform (EnforcementMAPS / CommandMAPS), confirmation acknowledged |
| Training Mode Timer Renewal | Timestamp, dispatch user, renewal acknowledged |
| Training Mode Exited | Timestamp, user, platform, session duration |
| Training Mode Assigned (New Officer) | Timestamp, assigning user (compliance coordinator / people manager), target officer, recorded on employee audit trail |
| Training SR Auto-Deleted | Timestamp, SR number, archived to compliance coordinator audit log |

---

## 10. Platform Context

| Platform | Users | Primary Functions |
|----------|-------|-------------------|
| **CommandMAPS** (Web Portal) | Admin, Compliance Lead, Compliance Coordinator, Dispatch, Team/Shift/Supervisor | SR creation, dispatch, assignment, monitoring, closure, PIN void, Code2 logging, No Report toggle (Dispatch and People Managers), countdown timer monitoring, map-based SR tracking |
| **EnforcementMAPS** (Mobile Application) | Officers, Team/Shift/Supervisor (field use), Dispatch (training mode only) | SR acceptance, attendance, PIN issuance, No Report toggle with evidence capture, Active SR List, trip routing, field data entry |

### People Managers on EnforcementMAPS

People managers (Team Supervisor, Shift Supervisor, Supervisor) retain their elevated authority and permissions when logged into EnforcementMAPS on a mobile handset. While these roles are primarily office-based, operational requirements — including training, staffing shortages, and field coverage — may require people managers to work in the field. EnforcementMAPS must function as a fully operational, separate instance for people managers with all permissions intact.

### Dispatch Training Mode (EnforcementMAPS)

Dispatch has no operational requirement for the EnforcementMAPS mobile application. When a Dispatch account logs into EnforcementMAPS, the application enters **Training Mode**:

- All features and functions are **visible** — Dispatch sees exactly what a field officer sees across all workflows.
- **PIN issuance is disabled** — Dispatch cannot issue a PIN in training mode.
- SRs created by Dispatch in training mode receive a **TRAINING flag**. Training SRs have no legal value and carry no location attendance requirements.
- Training-flagged SRs are **only visible to the Dispatch account** that created them, on both CommandMAPS and EnforcementMAPS. They are invisible to all other users.
- EnforcementMAPS must display a **persistent, prominent banner** confirming the app is in Training Mode.

### Dispatch Training Mode (CommandMAPS)

Dispatch can self-assign training mode via the **CommandMAPS settings panel**:

1. A **pop-up confirmation** must be manually acknowledged, confirming the switch from active operational status to training mode.
2. A **60-minute training timer** begins on the CommandMAPS session.
3. On timer expiry, a **pop-up notification** asks whether training is still active. The user must manually acknowledge to continue training or exit to return to active status.
4. The training mode entry, duration, and exit are recorded in the audit trail.

### Training Mode — Access by Role

| Role | Platform | Access Method |
|------|----------|---------------|
| Dispatch | EnforcementMAPS | **Automatic** on login. Pop-up confirmation required acknowledging switch from active to training. |
| Dispatch | CommandMAPS | **Self-assigned** via settings. Pop-up confirmation required. 60-minute timer with renewal prompt on expiry. |
| New officer (probation/onboarding) | EnforcementMAPS | **Assigned** by branch-specific compliance coordinator or direct people manager. |

#### New Officer Training Mode

- Training mode for new officers during probation or onboarding is assigned by the **branch-specific compliance coordinator** or the officer's **direct people manager**.
- Training mode assignment is **logged on the employee's audit trail** (employee card).
- The employee audit trail is visible only to users with relevant permissions as defined in the RBAC hierarchy.
- New officers in training mode operate under the same TRAINING flag rules as dispatch: no legal value, no location attendance requirements, SRs visible only to the trainee and the assigning manager/coordinator.

### Training SR Lifecycle

| Aspect | Behaviour |
|--------|-----------|
| TRAINING flag | Persisted on the SR record at creation. Cannot be removed. |
| Legal value | None — training SRs carry no legal weight |
| Location attendance | Not required |
| Visibility (active) | Creating user only (Dispatch or trainee officer), on both CommandMAPS and EnforcementMAPS |
| No Report evidence workflow | **Full workflow** — real camera use required. Images are captured with full metadata but flagged as TRAINING. |
| Auto-deletion | Training SRs are **deleted from all normal views** after **7 days** from creation. |
| Permanent archive | After deletion from normal views, the complete SR record **and all associated evidence images** are **permanently archived** in the **branch compliance coordinator's audit archive log**. This archive is accessible for lookup only — records cannot be edited or deleted. |
| Archive visibility | Branch compliance coordinator only |

### Admin — Legal Accountability Boundary

Admin can perform all SR administrative actions (create, dispatch, assign, edit, close) but is **excluded from all legally accountable actions**:

| Action | Admin | Reason |
|--------|-------|--------|
| Issue a PIN | ❌ | Requires an identifiable, legally accountable officer |
| Void / delete a PIN | ❌ | Requires legal accountability for audit trail |

Admin is intended for system administration, account management, and workflow testing — not for legally consequential operational use.

---

## 11. Terminal States

An SR reaches a terminal state when no further status transitions are possible (except Void, which can apply to any PIN-bearing SR by authorised roles).

| Terminal State | How Reached | Locked Fields | Editable Fields |
|----------------|-------------|---------------|-----------------|
| Complete | PIN issued, all fields finalised | All except Additional Notes | Additional Notes (by permitted roles) |
| Attended, Complete | No Report submitted with evidence | All except Additional Notes | Additional Notes (by permitted roles) |
| Closed | Administrative closure | All except Additional Notes | Additional Notes (by permitted roles) |
| Voided | PIN SR voided by authorised role | All fields including pre-void Additional Notes | Additional Notes (append-only — pre-void content is read-only, new entries timestamped and audited) |