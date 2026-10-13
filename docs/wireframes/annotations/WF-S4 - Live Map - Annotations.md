# CivicMAPS Rebuild — Wireframe Annotation Document
## Sequence 4 — Live Map (ZoneMap & PatrolMap)

**Document ID:** WF-S4-ANN
**Status:** Draft for owner review
**Companion artefact:** `Wireframes S4 — Live Map.dc.html`
**Fidelity:** Low-fi (structure only). Hi-fi follows owner sign-off.
**Date:** 2026-08-04
**Source repository:** `CivicMAPS/CivicMaps-preview` @ `main`

This sequence fills the map detail deferred twice already — `2d.3`
(EnforcementMAPS map chrome) and `3a.5` (Dashboard map) both called out
full marker/zone/route rendering as "Sequence 4+ scope."

---

### How to read this document

Same convention as Sequences 1–3: each numbered marker maps to a row below,
scoped to its screen (`4a.2` = marker 2 on screen 4a).

---

## Screen 4a — Zone polygon & label states (web)

**Status:** EXISTING. **Source:** `ZoneMap.tsx` (`ZonePolygons`, `ZoneLabels`).

| # | Element | Annotation |
|---|---|---|
| 4a.1 | Unassigned polygon | `fillOpacity 0.1 / strokeOpacity 0.55 / strokeWeight 1.5` — the resting state for every zone with no officer assigned. |
| 4a.2 | Assigned + online polygon | `0.28 / 0.95 / 2.5` — the visually strongest non-selected state; distinguishes a live, staffed zone at a glance. |
| 4a.3 | Selected polygon + label | `0.35 / 1.0 / 3.0`. Clicking either the polygon or its label pill selects the zone and opens 4b; the label itself flips from an outline pill to a filled, colour-matched pill with a coloured shadow. |
| 4a.4 | Zone colour source | Each zone's polygon/stroke/label colour is `zone.color` from the `PATROL_ZONES` seed data — a per-zone value, not a shared design token. Operations Teal is used here only because it matches Z-MAC's dot colour already established in Sequences 2–3. |

---

## Screen 4b — Zone info panel (click-through)

**Status:** EXISTING. **Source:** `ZoneMap.tsx` (`ZoneInfoPanel`, `BoundaryTableRow`, `getZoneDetail`).

| # | Element | Annotation |
|---|---|---|
| 4b.1 | Header | Filled with the zone's own colour; shows zone name + one-line description. |
| 4b.2 | Assigned officer chip | Presence dot (green online / grey offline) + officer name + a `C2` tag appended when the officer has an active Code 2. Reads "Unassigned" in italic when the zone has no assignment. |
| 4b.3 | Boundaries / Streets tabs | "Streets & Lanes" tab only renders when the zone has internal streets or laneways in `getZoneDetail`; some zones show boundaries only. |
| 4b.4 | Included / Excluded boundary lists | Each row: a compass-direction badge (N/S/E/W) in the zone colour, street name, and the "between" cross-streets. Excluded (not part of the patrol zone) rows get a red left-accent and, where the source boundary line is a broken kerb line, a "dashed" text label. |

---

## Screen 4c — Officer marker & Code21/SR pin cluster (web)

**Status:** EXISTING. **Source:** `ZoneMap.tsx` (`OfficerMarkers`, `SRMarkerIcon`, `SRPopup`, `clusterByLocation`).

| # | Element | Annotation |
|---|---|---|
| 4c.1 | Officer marker | A standard map pin (not the heading-arrowhead style described in the design profile — see OQ4-3), coloured green when online, grey offline. Offset slightly from the zone centroid so it doesn't sit under the zone label. |
| 4c.2 | SR cluster marker | Every Code21 at the same rounded lat/lng (5 decimal places) clusters into one marker. Colour comes from the *first* item's status; a red count badge appears only on hover. Hover also scales the marker 1.2× and adds a soft ring. |
| 4c.3 | Popup card | Opens on click, anchored above the marker with a speech-bubble tail. Lists every item in the cluster — address, status badge, SR number, timestamp, assigned officer. |
| 4c.4 | Row click → full detail | Each popup row opens the full `SRDetailSheet` modal (edit form, audit trail, PIN lock) — out of scope for this sequence, called out here only as the click target. |

---

## Screen 4d — Code 1 duress beacon & live officer pins (web map)

**Status:** EXISTING. **Source:** `ZoneMap.tsx` (`Code1BeaconMarkers`, live-pin block ~L2820, `useCountdown`).

| # | Element | Annotation |
|---|---|---|
| 4d.1 | Code 1 beacon | Two concentric rings animate outward (`code1-ping`, 1.1s ease-out, second ring delayed 0.2s) around a solid red core. Label reads `CODE 1 — {officer}{ — address}`. This is the map-layer counterpart to the banner in `3b`; both read from the same active-incident feed. |
| 4d.2 | Self pin (blue) | An officer's own broadcast position while on-shift. No officer-number tag — the dispatcher is looking at their own team, identity is implicit. |
| 4d.3 | Duress pin (yellow) | Tagged `Officer #{number}` — the one pin state that always carries an identity label, since a duress broadcast can appear for an officer outside the dispatcher's normal zone view. |
| 4d.4 | Token pin (green) | A time-limited "live location" grant from `3d`'s pulse flow. Carries a live countdown to `expiresAt`. |

---

## Screen 4e — Mark-Up pin states (web)

**Status:** EXISTING. **Source:** `markupMarkerStyle.ts` (`classifyMarkupMarker`).

| # | Element | Annotation |
|---|---|---|
| 4e.1 | Completed marker | Green `MU` bubble + stem. |
| 4e.2 | Active-timer marker | Amber `MU` bubble + stem — the only other state; the web map does not distinguish "urgent" or "overdue" the way the mobile map does. |

---

## Screen 4f — EnforcementMAPS live map detail (mobile)

**Status:** EXISTING — **corrects** the placeholder shown at `2d.3`. **Source:** `PatrolMap.tsx`, `DuressTrigger.tsx`.

| # | Element | Annotation |
|---|---|---|
| 4f.1 | Assigned zone fill | Brighter fill + thicker, lightened stroke (colour lightened ×1.35) versus an unassigned zone the officer is merely standing inside, which gets a thin outline and light fill instead. |
| 4f.2 | User position marker | A solid dot with a directional wedge, rotated live to device heading (`rotation={heading}`, `flat` so it rotates with the map bearing, not the screen). A translucent accuracy circle (radius capped at 60m) sits underneath — not pictured at this scale. |
| 4f.3 | Code21 pin | Purple bubble, numbered by planned stop order when a route exists (falls back to a plain "21" glyph otherwise); pending/unacknowledged pins render grey instead of purple. |
| 4f.4 | Mark-Up pin | Teal by default, flips amber when urgent (near timer expiry) or red when the return timer has lapsed — three states, versus the web map's two (4e). |
| 4f.5 | Code 1 ring marker | A static red ring + solid core — no ping animation on mobile; the officer sees this only for *other* officers' active incidents, not their own. |
| 4f.6 | Route polyline | Two stacked strokes — a soft navy underlay (9px) and a gold overlay (5px) — connecting planned stops in order. |
| 4f.7 | Duress trigger | **Correction to `2d`:** the earlier wireframe showed a static gold "SOS" badge. The real `DuressTrigger` component is a solid red "DURESS" button with a shield glyph; tapping it opens the Code 1 emergency modal (out of scope here). Once Code 1 is active, the same control becomes a pulsing dark-red "CODE 1 ACTIVE — TAP TO CLEAR" state. |
| 4f.8 | — | See correction note above; recommend `2d` be updated to match on the next pass through Sequence 2. |

---

## Open questions requiring owner decision

| ID | Question | Blocks |
|---|---|---|
| OQ4-1 | The design profile states dashed strokes are reserved for split/shared zone-boundary lines on the map. The coded `ZonePolygons` never renders a dashed stroke — "dashed" only appears as a text label inside the zone info panel's boundary table (`4b.4`), not as an actual line style on the polygon itself. Is a real dashed-boundary rendering still planned, or should the profile note be corrected to describe the table-only treatment? | `4a`, `4b` |
| OQ4-2 | Zone polygon fill opacities in code (`0.10 / 0.18 / 0.28 / 0.35`, `4a`) don't match the design-token pair (`zone-fill-opacity: 0.12`, `zone-fill-opacity-selected: 0.25`). Similar to the navy-scale note already on record for CommandMAPS' Tailwind theme — which value is authoritative for the rebuild? | `4a` |
| OQ4-3 | The design profile describes officer map markers as a heading-aware directional arrowhead (32×32, custom `OfficerMarker` component). The shipped `OfficerMarkers` in `ZoneMap.tsx` renders a plain static Pin with no heading and no arrowhead — heading-aware rendering exists only on the mobile map (`4f.2`), not on the web dashboard. Confirm the web map should gain the same treatment, or that it's mobile-only by design. | `4c` |
| OQ4-4 | SR marker colours (`SR_STATUS_COLORS`) are raw hex distinct from the app's semantic-status tokens — e.g. `CANCELLED` renders `#ef4444`, close to but not `--status-emergency` (`#DC2626`), reusing a near-red for a routine administrative outcome. Worth reconciling against the "red is Code 1 only" rule, or is proximity-but-not-identity acceptable here? | `4c` |
| OQ4-5 | `Compass.tsx` accepts `heading`/`size` props but renders only debug text (`Heading: {n}`) — it isn't a visual compass and isn't referenced from `PatrolMap.tsx`. Looks like a stub. Confirm it's dead code before the rebuild drops it. | `4f` |

---

## Sequence 4 screen register

| ID | Screen | Surface | Status |
|---|---|---|---|
| 4a | Zone polygon & label states | Web | EXISTING |
| 4b | Zone info panel | Web | EXISTING |
| 4c | Officer marker & Code21/SR pin cluster | Web | EXISTING |
| 4d | Code 1 duress beacon & live officer pins | Web | EXISTING |
| 4e | Mark-Up pin states | Web | EXISTING |
| 4f | EnforcementMAPS live map detail | Mobile | EXISTING (corrects 2d) |

Nothing in this sequence has been invented. Every element is traced to
`ZoneMap.tsx` / `markupMarkerStyle.ts` / `PatrolMap.tsx` / `DuressTrigger.tsx`
as cited above.
