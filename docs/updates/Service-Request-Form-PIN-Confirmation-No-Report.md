## 6 — Service Request Form: PIN Confirmation & No Report Workflow

### 6a — Alleged Offence → Offence Type Header Transition

When an officer enters a PIN (Parking Infringement Number) into the service request form and saves:

- The form header **"Alleged Offence"** must automatically update to **"Offence Type"**.
- This transition is permanent for the lifecycle of the SR — once a PIN is saved, the header never reverts.
- The rename must be applied both in the persisted SR record and in all rendered views (web portal and mobile app).

**Business rationale:** A service request originates from a member of the public reporting an alleged offence. When an officer attends in person, visually observes the location, and issues a PIN, they are confirming that a legitimate offence has occurred. The header change reflects this transition from allegation to confirmed offence.

### 6b — No Report Toggle

Add a toggle button to the service request form: **"No Report"** (boolean, default OFF).

#### Visibility Restrictions

The No Report toggle is **only visible** to the following roles and contexts:

| Role | Context |
|------|---------|
| Dispatch | CommandMAPS web portal only |
| Assigned Officer | eMAPS mobile application only |
| Assigned Officer's People Manager | Both web portal and mobile application |

All other roles and contexts: the toggle must not be rendered in the UI. The server must reject any No Report toggle submission from an unauthorised role.

#### No Report Activation Behaviour

When the No Report toggle is switched ON:

1. **Field locking** — All form fields become read-only **except** "Additional Notes", which remains editable.
2. **Evidence workflow triggered** (assigned officer on eMAPS mobile only — see Section 6c).
3. **On save:**
   - The SR status automatically changes to **"Attended, Complete"**.
   - The SR is closed.
   - No further edits are permitted to any field except Additional Notes.

**Business rationale:** The assigned officer has attended the Code21 / SR location, visually observed that no offence is occurring, and is reporting a "No Report" outcome. The evidence workflow (Section 6c) captures photographic proof of attendance and observation.

### 6c — No Report Evidence Capture Workflow (eMAPS Mobile)

When the assigned officer toggles No Report ON within the eMAPS mobile application, an evidence capture workflow is activated **before** the SR can be saved.

#### Requirements

- The officer must capture a **minimum of 3 photographs** using the mobile handset's built-in camera at the attending location.
- The save button must remain disabled until the minimum photo count is met.
- Each captured image must have the following metadata embedded and persisted alongside the image:

| Metadata Field | Source | Description |
|----------------|--------|-------------|
| `sr_number` | Current service request | The SR/Code21 number this evidence relates to |
| `capture_date` | Device clock | Date of capture (ISO 8601) |
| `capture_time` | Device clock | Time of capture (ISO 8601, including timezone) |
| `gps_location` | Device GPS | Latitude and longitude at the moment of capture |
| `officer_number` | Authenticated session | The Officer Number of the assigned and currently logged-in officer |

#### Constraints

- GPS must be actively acquired at capture time — cached or stale coordinates are not acceptable. If GPS is unavailable, block the capture and prompt the officer to enable location services.
- Metadata must be written at capture time and treated as immutable — it cannot be edited or overridden after the image is saved.
- Images and their metadata must be associated with the SR record and persisted to the server on save.
- If the officer toggles No Report OFF before saving, any captured evidence images are discarded and the field locks are released.