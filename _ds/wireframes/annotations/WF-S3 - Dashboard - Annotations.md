# CivicMAPS Rebuild — Wireframe Annotation Document
## Sequence 3 — Dashboard

**Document ID:** WF-S3-ANN
**Status:** Draft for owner review
**Companion artefact:** `Wireframes S3 — Dashboard.dc.html`
**Fidelity:** Low-fi (structure only). Hi-fi follows owner sign-off.
**Date:** 2026-08-04
**Source repository:** `CivicMAPS/CivicMaps-preview` @ `main`

---

### How to read this document

Same convention as Sequences 1–2: each numbered marker maps to a row below,
scoped to its screen (`3a.2` = marker 2 on screen 3a).

---

## Screen 3a — Dashboard, default state

**Status:** EXISTING.
**Source:** `civicmaps/commandmaps/src/features/dashboard/DashboardPage.tsx`.

| # | Element | Annotation |
|---|---|---|
| 3a.1 | KPI tile grid | 2×2: Active Zones, Online Officers, Code2 Logged, Unassigned C21. Each tile is a coloured dot + `font-mono` count, values from `/admin/dashboard/snapshot`. Unassigned C21 dot flips `status-pending` (blue) when >0, else greyed `status-inactive`. |
| 3a.2 | Zone assignment row | One row per patrol zone (`PATROL_ZONES` merged with live assignment data). Zone colour dot + name, Online/Offline badge, Code 2 badge when logged. Assigned-and-online rows get a green-tinted background + ring. |
| 3a.3 | Live-location action chip | Per-officer, five states depending on pulse/pin status — see `3d.3` for the full state set. |
| 3a.4 | Recent Code21s list | Address + status badge + SR number, clickable — navigates to `/lookup?tab=service-requests&openCode21={id}` (Sequence 5/Look Up scope). Empty state: "No recent requests". |
| 3a.5 | Map (ZoneMap) | Always full-viewport, rendered underneath the panel via `APIProvider`/`@vis.gl/react-google-maps`. Wrapped in its own `ErrorBoundary` so a Maps auth failure can't tear down the whole dashboard. Full marker/zone/route detail is Sequence 4+ scope. |
| 3a.6 | Right panel container | Fixed max-width (`22rem`/`24rem` responsive), slides via `translate-x` — see `3e` for the collapsed state. Swaps its entire body for `Code21CreateForm` or `MarkUpCreateForm` when the officer's FAB actions are triggered from the map (not shown here — those forms are Sequence 6/7 scope). |

**Not shown:** the KPI/zone/recent-requests body above is replaced wholesale
when `showSRForm`/`showMarkupForm` is true — the panel becomes a single
create-form view, out of scope for this sequence.

---

## Screen 3b — Code 1 emergency banner

**Status:** EXISTING.
**Source:** `civicmaps/commandmaps/src/features/dashboard/Code1Banner.tsx`.

| # | Element | Annotation |
|---|---|---|
| 3b.1 | Active, unacknowledged | Flashing red beacon (`animate-ping`), `CODE 1` label, officer + live address, elapsed `mm:ss` timer (ticks every second from `activatedAt`), `ACKNOWLEDGE` button (posts `/code1/{id}/acknowledge`). |
| 3b.2 | Acknowledged | Beacon becomes a static green check, label switches to `CODE 1 ACK`, button is removed. Banner **stays visible** until the officer clears the signal server-side — acknowledging does not dismiss it. |
| 3b.3 | Width behaviour | One banner per active incident, stacked. Container narrows to leave room for the right panel (`right-0 md:right-[22rem]...`) when the panel is open; goes full-width when collapsed (see `3e`). |

**RBAC:** none — any authenticated non-OFFICER role sees and can acknowledge
active Code 1 incidents; there is no acknowledge-permission gate in this
component.

---

## Screen 3c — Assign / reassign officer modal

**Status:** EXISTING.
**Source:** `DashboardPage.tsx` (`assigningZoneId`, `handleAssign`, `handleEndAssignment`).

| # | Element | Annotation |
|---|---|---|
| 3c.1 | Modal title | Reads "Assign Officer" or "Reassign Officer" depending on whether the zone already has an assignment. |
| 3c.2 | Zone identity | Zone colour dot + name, non-interactive context line. |
| 3c.3 | Officer select | Populated from `/admin/officers`; each option appends the officer's current zone name if already assigned elsewhere, so a dispatcher can see who they're pulling. |
| 3c.4 | Assign / Cancel | Assign disabled until an officer is selected; button label flips to "Assigning..." while the request is in flight. Reassigned zones also expose an "End" action inline in the zone row (`3a.2`), separate from this modal, calling `/admin/assignments/{id}/end` after a `confirm()` — *"End this assignment?"*. |

---

## Screen 3d — Location pulse: incoming request &amp; status chips

**Status:** EXISTING.
**Source:** `DashboardPage.tsx` (`respondToIncoming`, `requestLivePulse`, `pulseStatusByOfficer`).

| # | Element | Annotation |
|---|---|---|
| 3d.1 | Incoming request card | Shown only when another CommandMAPS user has requested *this* dispatcher's location (inbox parity with the officer mobile inbox, `2e`). Requester name + timestamp. |
| 3d.2 | Accept / Standby / Decline | Accept requires a one-shot browser geolocation fix (`navigator.geolocation.getCurrentPosition`); if the browser refuses or has no fix, an alert directs the user to Standby or Decline instead — Accept does **not** start a persistent broadcast. |
| 3d.3 | Per-officer chip states | Five mutually exclusive states rendered next to each zone's assigned officer: no request yet → `Request loc` button; sent → `Pending...`; officer chose Standby → countdown to `standbyReminderAt`; approved → `Live` countdown to token `expiresAt`; officer declined → `Re-request` button. A duress broadcast (Code 1 active) overrides all of these with a plain "Live (broadcast)" tag, not shown here (see `3b`). |

**Behavioural note:** the moment a status flips to `DECLINED`, a one-time
alert fires reading *"officer_{number} location is not currently
viewable"* — verbatim spec text, not a toast (per the design system's
anti-pattern list, this really should move to a proper banner/toast
component in the rebuild — flagged as OQ3-1 below).

---

## Screen 3e — Panel collapsed

**Status:** EXISTING.
**Source:** `DashboardPage.tsx` (`isPanelOpen`, pull-tab button).

| # | Element | Annotation |
|---|---|---|
| 3e.1 | Pull tab | Fixed to the panel's left edge, vertically centred, persists regardless of open/closed state; icon flips chevron direction. |
| 3e.2 | Full-width reflow | With the panel translated fully off-screen, both the map and the Code 1 banner stack expand to the full viewport width — the banner's conditional width class (`3b.3`) is what drives this. |

---

## Screen 3f — Pulse notifications, toast (Session 16b)

**Status:** PROPOSED — resolves OQ3-1 for this sequence's two `alert()` call sites.

| # | Element | Annotation |
|---|---|---|
| 3f.1 | Toast stack | Bottom-right of the dashboard viewport, matching the "one-off confirmation → transient toast" half of OQ3-1's Session 16 decision. Auto-dismiss ~4s, manual × also available; stacks if both fire together. |
| 3f.2 | Pulse-declined toast | Replaces the bare `alert()` fired the moment a status flips to `DECLINED` (`3d`'s behavioural note) — verbatim copy retained. |
| 3f.3 | No-GPS-fix toast | Replaces the `alert()` fired when the dispatcher's own browser geolocation fix fails on Accept (`3d.2`). |

Does not touch Code 1/Code 2 messaging — those stay on the persistent banner (`3b`), never toast, per the design system's anti-pattern rule; unchanged by this sweep.

---

## Open questions requiring owner decision

| ID | Question | Blocks |
|---|---|---|
| ~~OQ3-1~~ | ~~The pulse-declined notice (`3d`) fires as a bare `alert()`, and Code21/CODE1 messaging elsewhere uses `alert()` for form errors too — worth standardising on a proper toast/banner component in the rebuild?~~ **Resolved (Session 16, applied Session 16b):** one-off notifications → transient toast, drawn as `3f`. | `3d` — resolved |
| OQ3-2 | Dashboard KPI tiles have no drill-through (e.g. clicking "Unassigned C21" doesn't filter the zone list or jump to Look Up) — intentional, or a gap worth closing in the rebuild? | `3a` |

---

## Sequence 3 screen register

| ID | Screen | Surface | Status |
|---|---|---|---|
| 3a | Dashboard — default state | Web | EXISTING |
| 3b | Code 1 emergency banner | Web | EXISTING |
| 3c | Assign / reassign officer modal | Web | EXISTING |
| 3d | Location pulse — incoming request &amp; chip states | Web | EXISTING |
| 3e | Panel collapsed | Web | EXISTING |

Nothing in this sequence has been invented. Every element is traced to
`DashboardPage.tsx` / `Code1Banner.tsx` as cited above.
