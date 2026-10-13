# CivicMAPS Domain-Pack Coverage Matrix
Status: CANDIDATE — Gate 5 deliverable (DR-22 condition) · 2026-07-19
The fourteen approved scope items = eight operational branches (S01 §1.4) + six S01-BRN-005 programme-scope items. Combining is permitted per S01-BRN-005; classification below is presentation-layer only — Section 03 owns the formal branch/context/ownership mapping (S01-BRN-001).

| # | Approved scope item | Covered by | How |
|---|---|---|---|
| 1 | Parking Enforcement | Pack 1 — Parking Enforcement (compatibility pack) | All existing kit flows preserved; outcome slot binds Infringement / No Report / PIN vocabulary |
| 2 | Local Laws | Pack 2 — Local Laws | Domain codes, amenity/obstruction/dumping-investigation fixtures; shared illegal-dumping classification with Pack 6 (S01-BRN-003) |
| 3 | Animal Management | Pack 3 — Animal Management | Complaint/investigation/impound fixtures; welfare outcome vocabulary |
| 4 | Parks and Gardens | Pack 4 — Parks & Gardens | Inspection/defect/hazard fixtures |
| 5 | Cleaning Operations | Pack 5 — Cleaning | Cleaning/graffiti/contractor-coordination fixtures |
| 6 | Waste Management | Pack 6 — Waste | Collection/bin/dumping fixtures; shared dumping model with Pack 2 |
| 7 | Safe City Operations | Pack 7 — Safe City ("Safe City" is display label only, S01-BRN-004) | Patrol/incident/CCTV-request fixtures |
| 8 | Licensing and Permits | Pack 8 — Licensing/Permits | Permit verification/occupancy/event fixtures |
| 9 | Asset Inspections | Pack 9 — Asset Inspections | Inspection scheduling/defect fixtures |
| 10 | Contractor Operations | CORE + Packs 5/6 | Contractor identity renders via core WorkGroupPath + role/tag components; contractor-facing fixtures live in the Cleaning and Waste packs that coordinate contractors |
| 11 | Compliance Investigations | CORE pattern + Packs 2/3/8 | Investigation lifecycle is a core operational pattern (L5); domain vocabulary bound by the investigating pack |
| 12 | Public Safety Operations | CORE + Pack 7 | Officer-safety monitoring, Code 1/14/15 banners, presence — all core (never pack-scoped: safety semantics are global); Safe City pack supplies scenario fixtures |
| 13 | Service Request Management | CORE | SR lifecycle tokens, DispatchQueue, LifecycleTrack, dispatch patterns — shared capability consumed by every pack |
| 14 | Field Workforce Management | CORE | Presence, sign-on/off, DWG assignment, roster patterns — shared capability, all packs |

Verdict: 9 packs + core shared capabilities jointly cover all 14 items with no gaps and no duplicated ownership at the presentation layer. Items 10–14 are deliberately core/combined — giving them their own visual packs would fork shared safety and lifecycle treatments.
