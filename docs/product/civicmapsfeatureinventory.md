# CivicMAPS — Platform Feature & Function Inventory

Every operational feature built across the backend API, the officer mobile app, its browser companion, the dispatcher dashboard, and the shared platform layer — surveyed from source and independently re-verified line by line.

**Repo:** CivicMAPS/CivicMaps-preview
**Scope:** civicmaps/ monorepo — 92 commits on main
**Reviewed:** 25 Jul 2026
**Method:** 5 domain surveys + 5 independent verification passes

Status tags used throughout: `[LIVE]` `[DORMANT]` `[BUG]` `[SECURITY]` `[NOTE]` — plus a small number of one-off descriptive tags (e.g. `[Shipped defect]`, `[Vestigial]`) carried over verbatim from the source review where a standard tag didn't fit.

---

## Contents

1. [Key findings](#key-findings)
2. [Backend server — CIVIC MAPS API](#backend-server--civic-maps-api)
3. [Mobile app — EnforcementMAPS](#mobile-app--enforcementmaps)
4. [Web companion — EnforcementMAPS Web](#web-companion--enforcementmaps-web)
5. [CommandMAPS — dispatcher dashboard](#commandmaps--dispatcher-dashboard)
6. [Shared platform layer](#shared-platform-layer)
7. [Methodology](#methodology)

---

## Key findings

The most consequential things the verification passes turned up — worth reading before the module-by-module inventory below.

1. **Zello push-to-talk is entirely unbuilt.** No source, no dependency, no config plugin — only a 15-file design spec under `docs/dev/zello/` and a matching skill. A `release-checklist.md` line references a `src/features/zello/` path that doesn't exist.
2. **The mobile "second workflow" tree is live, contradicting the repo's own hand-off doc.** `HANDOFF.md` states `enforcementmaps/tabs/` (dispatch, mark-up, digital chalking) is unreachable from the shipped app. A later commit (`f09c03d`) added `EnforcementFab.tsx`, mounted unconditionally on the home map, which bridges straight into it. The stale route bug the hand-off describes is also already fixed.
3. **Web No Report photos are silently dropped.** `NoReportPanel` converts each evidence photo to base64 client-side, but `dispatchService.submitNoReport` only transmits metadata (filename, GPS, capture time) — `imageBase64` never reaches the server. Officers believe they've filed photo evidence; none is stored.
4. **Two independent, disagreeing password-reset policies exist.** `shared/roles.ts`'s `canResetPassword` is what production actually calls; a second implementation in `shared/password-reset-permissions.ts` reaches an opposite answer on several cases (ADMIN-resets-ADMIN, null-branch handling, which supervisor tiers qualify) and is exercised only by its own test file, never by a route.
5. **CommandMAPS's No Report toggle is broader than the design implies.** It's shown to any People Manager on any service request that has some assigned officer — there is no check that the officer actually reports to that manager. The shared, narrower `canToggleNoReport()` helper exists but isn't imported.
6. **The digital-chalking single/double confirmation tone only exists on web.** Mobile's camera capture calls `Vibration.vibrate()` only — no audio, no distinction between a clean scan and an overstay — and because the app ships Android-only, the one iOS-gated haptic branch never runs on a real device either.
7. **CommandMAPS's dashboard quick-assign bypasses the co-assignment rule the Assignments page enforces.** The dashboard's inline assign/reassign modal lists every officer unfiltered; only the dedicated Assignments page runs the shared team-eligibility check.
8. **A shipped dead-end on mobile:** the home screen's `ZoneInfoModal` discards the close handler it's given — once opened from the map, there is no way to dismiss it.
9. **Scattered dead code across every layer** — unused constants (`NO_REPORT_ROLES`, `MARKUP_ARCHIVE_ROLES`, `requireMaxRank`), an unused React Query client on mobile (all data fetching is hand-rolled), an unreferenced `shared/contracts.ts` legacy schema file, six-plus JSON data files in `data/` with zero importers, and a Google-Maps style override (`DISPATCH_MAP_STYLES`) defined in CommandMAPS but never applied.

---

## Backend server — CIVIC MAPS API

**Location:** `civicmaps/server` — Express 5 · PostgreSQL/PostGIS · WebSocket

The REST + WebSocket API every client talks to. Raw SQL over `pg` (no ORM), JWT auth over dual transports, and an in-process pub/sub layer for live updates.

### Bootstrap & process lifecycle

- **App entry — `src/index.ts`** `[LIVE]` — Wires Express, credentialed CORS, a 1MB JSON body limit, cache-control/request-id/logging middleware, mounts every module router under `/api/*`, and starts the HTTP + WebSocket server together. Sets `trust proxy` in production/Railway. Exits the process if migrations fail on boot.
  *Interacts with:* every module router, the migration runner, the WebSocket server.
- **Aliased route mounts** — Two routers are intentionally double-mounted for API-shape compatibility: presence routes answer at both `/api/presence` and `/api/devices`; location-pulse routes answer at both `/api/location-pulse` and the spec-alias `/api/location-tokens`.
- **GET /api/health** `[LIVE]` — Auth-free liveness probe — status, timestamp, current WebSocket connection count.
- **Nightly mark-up archival** — `scheduleNightlyArchival()` computes ms until next midnight AEST and self-reschedules a call to `archiveCompletedMarkups()` forever — a cron-like job with no cron dependency, started from the `server.listen` callback.
- **Boot sequence** — Migrations → idempotent zone-geometry sync from the shared seed → in-memory standby-timer recovery for location-pulse → listen → schedule archival.
- **Scaffolding stubs** `[DORMANT — Dead code]` — `src/routes/index.ts`, `src/auth/index.ts`, `src/observability/index.ts`, `src/storage/index.ts`, `src/db/schema.ts` — empty placeholder exports, never wired in.

### Authentication

- **JWT signing & secret hardening** — 24h HS256 tokens. Boot refuses to start in production against an empty secret or one matching a two-entry blocklist (a leaked repo secret and the `.env.example` placeholder); non-production falls back to a marked dev-only secret.
- **Dual-transport auth** — Prefers `Authorization: Bearer` for mobile, falls back to an HttpOnly `patrol_token` cookie for browsers (Secure + SameSite=None over HTTPS, Lax over plain HTTP). A companion non-HttpOnly `patrol_token_present` cookie lets client JS detect login state without reading the token.
- **authMiddleware** — Re-fetches the user row from `users` on *every* request (401 if missing or inactive) and attaches role, rank, branch, manager flags to `req.user`.
- **POST /api/auth/login** — Identifier is email if it contains `@`, else a badge number. Timing-safe uniform failure (bcrypt always runs, against a real or dummy hash). Badge login requires an email login within the prior 24h. Dual rate limiting: 20/15min per IP, 10/15min per identifier.
- **POST /api/auth/logout · /ws-ticket · GET /me · POST /change-password** — Logout clears both cookies unauthenticated. `/ws-ticket` mints a single-use 30s WebSocket ticket (browsers can't read the HttpOnly cookie for a `?token=` query param). `/me` returns the current user plus `passwordMustChange`. Change-password verifies the current password, rejects an unchanged one, bcrypt cost 12, writes a distinct `PASSWORD_CHANGE` audit row.
- **Temp password generator** — 16-char password with guaranteed upper/lower/digit/special classes via rejection-sampled random bytes and a Fisher–Yates shuffle, bcrypt cost 12.
- **requireMaxRank / requireEmployeeWriteAccess** `[DORMANT — Dead code]` — Exported RBAC helpers used by zero routes.

### RBAC role model — `shared/roles.ts`

> 8-tier hierarchy, rank 1 = highest authority: ADMIN → COMPLIANCE_LEAD → COMPLIANCE_COORDINATOR → DISPATCHER → TEAM_SUPERVISOR → SHIFT_SUPERVISOR → SUPERVISOR → OFFICER.

- **POSITION_ROLE_MAP** — 20 HR "position" strings map to a role, driving auto-role-assignment on employee create/edit. The branch list and per-branch position catalogue actually live hardcoded in `officers.routes.ts`, not here.
- **canResetPassword** `[SECURITY — Security-relevant]` — Self-reset always denied. ADMIN is global. COMPLIANCE_LEAD and COMPLIANCE_COORDINATOR are both branch-gated plus position-scoped downward. TEAM_SUPERVISOR needs matching branch, matching supervised team, and strictly lower rank. This is the version production actually calls.
- **A second, orphaned canResetPassword** `[SECURITY — Security-relevant]` `[DORMANT — Orphaned]` — `shared/password-reset-permissions.ts` disagrees with the live version on real cases: it denies ADMIN resetting another ADMIN (the live version allows it), additionally permits SHIFT_SUPERVISOR/SUPERVISOR, and treats a null branch as a pass where the live version treats it as a fail. Its only importer is its own test file — production never calls it — but that test does run in CI.
- **canWriteEmployee / canAssignPin / canVoidPin / canToggleNoReport** — Employee edits require the actor to outrank the target and (for non-global roles) share a non-null branch. Only OFFICER may ever hold a PIN. Void-PIN excludes ADMIN and DISPATCHER by design — though the code21 route feeds it the SR's zone id in place of a team id, so the "own team" branch effectively only clears for team-less supervisors. No Report may be toggled by DISPATCHER, the assigned officer, or that officer's direct manager.
- **actorHasScopeOverObject / buildObjectScopeSql** — The object-level row-security primitive reused across assignments, code21, attachments, audit and the dashboard. ADMIN/COMPLIANCE_LEAD/DISPATCHER are global; OFFICER is denied outright (checked before self-scope); everyone else needs branch match, with TEAM_SUPERVISOR additionally needing team match or being the manager. `buildObjectScopeSql` emits the equivalent SQL `WHERE` fragment so scope pushes into the query.
- **canCoAssignToZone — `shared/co-assignment.ts`** — Zone co-assignment eligibility: duplicate officer blocks; an empty zone always allows; presence of any non-OFFICER rank or any "shift"-named team member allows a mismatch; otherwise every officer on the zone must share one non-empty team name (an all-team-less zone is blocked, not allowed).
- **Unused role sets** `[DORMANT — Dead code]` — `NO_REPORT_ROLES` and `MARKUP_ARCHIVE_ROLES` are exported but referenced by no live route.

### Admin — employee & dashboard

- **GET /api/admin/dashboard/snapshot** — One-shot payload: zone counts, per-zone assignments enriched with online/Code2 status, officer counts, today's Code2 tally, unassigned/active Code21 counts, active SRs plus the 15 most recent. Every record scoped through `buildObjectScopeSql` so a branch-scoped viewer can't harvest cross-branch coordinates.
- **GET /api/admin/officers · /metadata · /:id/audit** — Directory listing with presence and every active zone assignment JSON-aggregated per officer. `/metadata` supplies branch-scoped manager lists and a position catalogue filtered to positions the actor outranks. `/:id/audit` is the per-employee change trail.
- **POST /api/admin/officers — onboarding** — Validates officer number, `.gov.au` email, name format and uniqueness; derives role from position; the server always generates the temp password server-side (a client-supplied one is ignored) with a 24h expiry and forced change; returns the plaintext temp password exactly once.
- **PATCH /api/admin/officers/:id — password reset** `[SECURITY — Security-relevant]` — Rate-limited to 5 successful resets/actor/hour; a transactional row lock plus an in-transaction re-check of `canResetPassword` closes a TOCTOU race; the new password is generated only after authorization passes, so a denied request can't be used to burn CPU.
- **PATCH /api/admin/officers/:id — general update** — Writes to team name, manager, "is manager" flag, and supervised-team id are additionally restricted to ADMIN/COMPLIANCE_LEAD/COMPLIANCE_COORDINATOR — closing a team-takeover escalation a lower-tier supervisor could otherwise reach through a normal employee edit.

### Assignments, attachments & audit

- **GET /active · POST / · POST /:id/end** — Lists active many-per-zone assignments; assigning enforces zone/officer validity, scope, and the co-assignment team rule with a 409 on refusal or a duplicate. Ending an assignment is DISPATCHER-any-officer-globally, or same-branch-lower-rank for everyone else.
- **autoEndExpiredAssignments** — Force-ends any assignment older than 8h25m, an implicit shift cap. Runs on the active-list and end-assignment routes only, not from the dashboard.
- **Attachment presign / confirm / download** `[NOTE — Asymmetric scope check]` — 5-attachment-per-SR cap, 10MB image / 20MB PDF limits, sanitized filenames, 10-min presigned S3 upload URLs. The download route is object-scope-checked and mints a 5-min `GetObject` URL — closing a prior High-severity finding where any authenticated user could download evidence by guessing an id. The presign and confirm steps have no equivalent scope check.
- **GET /api/admin/audit** — Paginated, entity-type-filterable audit log. Global roles see everything; others see their own actions plus scope-passing USER/CODE21/ZONE_ASSIGNMENT rows.

### Code21 — service request lifecycle

> 11 statuses: RECEIVED → DISPATCHED_NOT_ACTIVE → DISPATCHED_ACTIVE → IN_PROGRESS → ATTENDED → PIN_ISSUED → COMPLETED → VOIDED | ATTENDED_COMPLETE | CLOSED | CANCELLED.

- **Field-lock engine** — Always locks the SR number. A PIN or PIN-adjacent status locks address/offence/notes/vehicle/PIN. A confirmed No Report or ATTENDED_COMPLETE locks the same set plus the No Report flag. Any terminal state re-applies the lock. Violations return 409 with the offending field list.
- **GET /address-search · /zone-resolve · /officers** — Autocomplete over canonical street names plus haversine-sorted historical addresses; zone resolution by PostGIS `ST_Contains` with the currently-assigned officer(s); the officer picker for manual assignment.
- **POST / · PATCH /:id · /reassign** — Creation auto-resolves zone and officer, generates a scrambled SR number, fires a push. Update is the central handler for status transitions, PIN assignment, No Report toggling, field locks and vehicle-description diffing into a human-readable audit trail. *The ≥3-photo evidence requirement for No Report lives only on the officer-facing route — this admin PATCH accepts an empty evidence array.* Reassignment re-checks scope against the new target officer too, closing a scope-laundering path.
- **POST /:id/close · /void · /notify** — Administrative close requires a reason and is gated to ADMIN/COMPLIANCE_LEAD/COMPLIANCE_COORDINATOR/DISPATCHER. Voiding a PIN requires a reason, an existing PIN, and excludes ADMIN and DISPATCHER by design. Notify manually re-fires the assigned-officer push.
- **Scrambled SR / PIN numbers** — A Postgres sequence value run through a 4-round Feistel cipher produces a non-sequential 7-digit number in the range 1000000–1999999 — one recipe feeding both the SR-number and PIN-number sequences.

### Digital chalking / ANPR

> The whole router requires only authentication — no role gate. Any signed-in user, including an officer, can scan plates, run recognition, and read vehicle profiles.

- **POST /scan → DigitalChalkingService.recordScan** — Normalizes the plate, cross-checks it against prior scans on the same street segment, persists the scan under offence code `701 - PERIOD LONGER` when overstayed, updates the vehicle's parking-footprint profile, and auto-fires a Code21 infringement when the cross-check rules the vehicle offending.
  *Auto-fired SRs land unassigned* — `zone_id` and `assigned_officer_user_id` are both null; only `created_by_user_id` records the scanning officer.
- **crossCheckScan — `shared/digital-chalking/cross-check.ts`** — Pure decision engine. First sighting on a segment starts the clock. A later matching scan is a revisit: offending once `now ≥ earliest-prior-scan + min(both periods)`, otherwise a non-offending repeat. Tracks image-hash corroboration. OCR-confusable-character tolerance exists as an opt-in flag the server never actually passes — live matching is exact.
- **POST /recognise — ANPR provider abstraction** — Four interchangeable providers behind one `RecognitionResult` shape: a deterministic no-network `stub`; `anthropic` (Claude vision, default model `claude-haiku-4-5`); a generic self-hosted `http` provider; and `carmen` (Adaptive Recognition Carmen Cloud, region as a URL path segment). Auto-selects Anthropic when an API key is set and no provider is forced, else falls back to the stub.
- **plate-lookup.service.ts** — Optional on-disk JSON plate/vehicle registry loaded into memory; a missing file degrades to a no-op rather than an error. Advisory-only — an officer can still edit the recognised make/colour.
- **GET /config · /scans · /vehicle/:plate** — Runtime-tunable scan parameters (sample interval, confirm-frame count, confidence floor, dedup window) for the on-device scanner; segment/mark-up-scoped scan history; per-plate parking-history profile.

### Mark-ups

- **GET /reference · /address-search · /streets/\*** — Period and mark-location lookup tables; address and cross-street type-ahead (own-authored only for officers); a compact ETag'd street snapshot cached client-side for offline autocomplete.
- **POST / · GET / · PATCH /:id · /complete** — Creation auto-resolves the zone, computes the timer end from the period, and records `mode` (physical or digital). Only the author, dispatch, or an officer currently assigned to the mark-up's zone may edit or complete it, and only while status is `active`. Every write logs both a mark-up-scoped and a global audit row.
- **archiveCompletedMarkups()** — The nightly-cron target: bulk-transitions every completed mark-up to archived in one transaction.

### CODE 1 duress, peer-share & location-pulse

- **CODE 1 activate / clear / acknowledge** `[NOTE — No role gate on read/clear]` — Officer-only activation auto-clears any prior incident and pushes a duress confirmation. `POST /clear` and `GET /active` require only authentication — any signed-in user can list all active incidents, and a supervisor calling `clear` with no id clears *every* active incident system-wide. Acknowledgement is gated to ADMIN/SUPERVISOR/DISPATCHER/TEAM_SUPERVISOR/SHIFT_SUPERVISOR (compliance roles are excluded). Every event fans out to `admin:dashboard` plus every currently-online user, not just officers.
- **Peer-share (direct, non-duress)** — Every route is officer-only. Start/stop sharing live location with chosen colleagues; branch-officer directory; incoming/outgoing share status with live-position enrichment.
- **Location-pulse consent workflow** — State machine PENDING → APPROVED/STANDBY/DECLINED/EXPIRED. One in-flight request per target within a 5-minute window; one active token per requester-target pair. Standby extends a 15-minute retry envelope with two reminder pushes and a final "removed" prompt before a 60-second grace auto-decline. `restoreStandbyTimers()` re-derives every in-flight timer from the database at boot so a restart never silently drops a pending auto-decline.

### Officer status, presence, notifications & realtime

- **live-positions.ts** — A pure in-memory TTL store of GPS pings — deliberately never persisted — default 5-minute TTL, configurable and clamped 10s–1h.
- **officer.routes.ts — the officer-facing surface** — Assignment and active-SR views; acknowledge/no-report/vehicle-update/issue-infringement on a Code21; duty-status logging (Code2/Code26/off-duty); the location broadcast endpoint, which fans out along four independently-privacy-scoped paths (own channel, public/zone broadcast, pulse-token holders, peer-share recipients); and a per-viewer privacy gate on every returned position (`self` / `duress` / `token` / `hidden`).
- **Issue-infringement clock enforcement** — Only 5 of the 111 catalogue offence codes allow an officer-edited offence time; every other code is forced to the server clock (adjusted into the client's timezone) with a 5-minute skew tolerance, closing a client-side time-tampering path. The final PIN write is a race-safe conditional update — a losing concurrent submit gets a clean 409.
- **push.service.ts / web-push.service.ts** — Expo push wrapper with a delivery-audit trail (written only by the Code21 notifier — location-pulse and CODE1 senders don't log delivery rows). Approved-location coordinates are deliberately excluded from every push payload. VAPID-based Web Push covers browser clients in parallel, auto-deactivating on a dead subscription.
- **WebSocket infrastructure** — Ticket-or-JWT auth on upgrade, re-validated against the current DB role on every connect (not the JWT claim, so a role downgrade takes effect immediately). Channels: `user:<id>`, `admin:dashboard`, `zone:<id>`. `admin:dashboard` subscription is restricted to ADMIN/DISPATCHER/SUPERVISOR — compliance and team/shift-supervisor roles never receive dashboard pushes even though the equivalent REST endpoint is open to them. 30s heartbeat sweep; 25 distinct event types.

### Database layer

- **migrate.ts** — ~150 individually-idempotent raw SQL statements re-run on every boot inside one transaction, plus a post-transaction pass for statements that can't run inside it. A small metadata-guard table lets three historical unguarded one-off statements skip re-execution once already applied.
- **seed.ts / sync-patrol-zones.ts** — Standalone dev CLI seeding a realistic demo org chart and 23 patrol zones. `sync-patrol-zones.ts` re-runs on every boot (not just seed) to keep zone geometry in lockstep with the shared source of truth.

**Verification notes — backend**
- Several endpoints were mis-attributed to `/api/admin/*` in the first-pass draft; corrected to their real mount at `/api/admin/code21/*`.
- Confirmed the No Report ≥3-photo rule lives only on the officer route, not the admin PATCH.
- Confirmed CODE1 `GET /active` and `POST /clear` carry no role gate, and that a role-less `clear` call clears every active incident.
- Confirmed two independent, disagreeing `canResetPassword` implementations exist; documented the exact behavioural divergence.
- Corrected `canVoidPin`'s team check — the code21 void route passes the SR's zone id, not a team id, into the comparison.

---

## Mobile app — EnforcementMAPS

**Location:** `civicmaps/src` + `civicmaps/enforcementmaps` — Expo SDK 55 · React Native · Android-only

> The officer app ships **two map screens**: the home route (`src/features/patrol/screens/PatrolScreen.tsx`) carrying duress, peer-share and Code-21 routing; and `/tabs` (`enforcementmaps/tabs/index.tsx`), carrying dispatch, mark-up and digital-chalking workflows. They're bridged by **`EnforcementFab`**, a four-button stack mounted unconditionally on the home map (Code 21 · Mark-Up · Infringement · Settings). This makes the entire `enforcementmaps/tabs/` subtree live and one tap away — despite the repo's own `HANDOFF.md` asserting it's unreachable. That document predates the fix.

### Authentication

- **AuthProvider / useAuth** `[LIVE]` — JWT held in Expo SecureStore; decodes role from the payload. Login is email-or-badge, but the server can demand email specifically on the day's first login (`EMAIL_LOGIN_REQUIRED`) before accepting a badge number.
- **Two parallel auth service modules** — `src/services/authService.ts` serves the login screen; `enforcementmaps/services/authService.ts` serves everything under `/tabs`, settings, and the location-pulse inbox. A token bridge keeps the legacy fetch wrapper's Authorization header in sync with SecureStore on cold boot.

### Patrol map, zone detection & assignment

- **Zone detection** `[LIVE]` — Point-in-polygon ray-casting with a bounding-box pre-filter, "sticky" to the previous zone so a boundary doesn't flicker. The only patrol domain module with dedicated tests.
- **Two independent zone-assignment mechanisms** — `useAssignedZone` is an officer self-declared, AsyncStorage-only preference with no server call. `useAssignment` is the server-authoritative dispatcher-assigned zone shown on the `/tabs` banner. They are not the same thing and don't reconcile.
- **ZoneInfoModal (home)** `[BUG — Shipped defect]` — The version wired into the home screen discards the `onClose` callback it's given and renders no close affordance — once opened from the map, it cannot be dismissed. A fuller, working implementation exists at `src/components/ZoneInfoModal.tsx` but is shadowed and unused; a third, also-working copy is live on `/tabs`.
- **Compass (home)** `[LIVE — degraded]` — Renders unstyled "Heading: N" text where the app positions it as an 80pt overlay dial. A fully animated SVG compass exists at `src/components/Compass.tsx` but is unused.
- **EnforcementFab** `[LIVE — the bridge]` — The four-button stack that makes `/tabs` reachable (see above). Requests a font weight, `RobotoMono_700Bold`, that is never registered in `_layout.tsx` — the glyphs silently fall back to the system font.

### Location tracking, sharing & location-pulse

- **useLocationTracking / useLocationBroadcast** `[LIVE]` — Foreground GPS watch at `Accuracy.BestForNavigation`, 2s/3m interval. A separate 20-second broadcaster posts position while sharing is enabled, backed by an `expo-task-manager` background location task (looser accuracy, 25m interval) so duress broadcasting survives backgrounding.
- **ShareLocationToggle** — Status-only, non-interactive lock badge for officers (mandatory-share, server-enforced); fully interactive for non-officer roles.
- **Inbox & pulse handling** — Incoming/outgoing tabs with an in-app peer-picker; foreground push handler with a WebSocket fallback; a lightweight module-level toast. `presenceService.connect/heartbeat/disconnect` are exported but never called — the only live path is device-token registration.

### CODE 1 duress & peer sharing

- **DuressTrigger / Code1EmergencyModal / useCode1** `[LIVE]` — Pulsing activate/clear control with a full-screen confirm modal, live elapsed timer, and map beacons for every other officer's active incident, refreshed by WebSocket.
- **PeerShareDirectory / ShareStopwatch / usePeerShare** `[LIVE]` — Checkbox multi-select of branch colleagues to share position with, and a floating stopwatch while sharing is active.

### Code 21 dispatch, routing & infringement

- **ActiveDispatchList / NoReportWorkflow / VehicleDetailsForm / IssueInfringementWorkflow** `[LIVE — on /tabs]` — Card list with Acknowledge; ≥3 GPS-tagged evidence photos for No Report; type-to-filter vehicle pickers locking once a PIN exists; offence search plus PIN receipt.
- **useCode21Route** `[LIVE]` — Optimises a visiting order across outstanding SRs and active mark-ups (urgency-first for soon-expiring mark-ups, then nearest-neighbour), fetching real turn-by-turn geometry from an OSRM routing server with a haversine straight-line fallback. The default routing host, when the env var is unset, is the public OSRM demo server — worth setting explicitly before fleet-scale production use.

### Digital chalking / mark-up

- **MarkUpForm / ActiveMarkUpList / MarkUpCompletionModal / MarkUpArchive** `[LIVE]` — GPS auto-fill of address, cross-streets and side-of-street; separate Physical and Digital creation paths; completion branches on mode (marks-collected count vs. digital scan summary).
- **useMarkupTimers** `[LIVE]` — Schedules exactly one native notification per active mark-up on a dedicated max-importance, DND-bypassing channel; hydrates from already-queued OS notifications on cold start so a killed app doesn't lose the alarm; reconciles on edits and completion.
- **ChalkingCameraView** `[LIVE]` `[NOTE — Audio gap]` — Live camera feed sampled on an interval, fed into the shared frame-consensus engine to confirm a plate only after N consecutive matching, confident reads. On confirm: a flat 150ms vibration only — there is no audio library in the mobile app, so the single/double confirmation tone the design calls for (and that ships on web) doesn't exist here, and the one iOS-gated haptic branch never fires because the product is Android-only.

### Settings, duty status & realtime infra

- **Settings screen** `[LIVE]` — Change password, theme selection, Code 2/Code 26 duty toggles (auto-signs-on Code 2 first when needed), the share-location toggle, and a background-location permission status row.
- **mobileWsClient** `[LIVE]` — Reconnecting WebSocket with backoff from 3s to 30s and replayed channel subscriptions on every reconnect.
- **React Query client** `[DORMANT — Vestigial]` — A `QueryClientProvider` is mounted app-wide, but zero `useQuery`/`useMutation` calls exist anywhere — every data path is hand-rolled fetch plus `setInterval` polling.

### Zello push-to-talk

- **Not built** `[DORMANT — Documentation only]` — No source file, no dependency, no config plugin anywhere in the repo. What exists is a 15-document design spec at `docs/dev/zello/` and a matching authoring skill — planning artifacts, not code. A release-checklist line references a `src/features/zello/` path that was never created.

**Verification notes — mobile**
- Independently re-confirmed the `EnforcementFab → /tabs` reachability chain by reading `PatrolScreen.tsx`, `EnforcementFab.tsx` and `_layout.tsx` directly, rather than trusting the first-pass claim.
- Corrected `src/constants/parkingZones.ts` from "live" to dormant — zero references found; the live parking lookup is the shared module instead.
- Added a second, previously-missed auth service file.
- Upgraded the home-screen `ZoneInfoModal` from "stub" to a shipped, un-dismissable defect after tracing the discarded `onClose` prop.
- Independently re-grepped for Zello case-insensitively across the whole repo; confirmed zero source hits.

---

## Web companion — EnforcementMAPS Web

**Location:** `civicmaps/enforcementmaps-web` — Vite · React 18 · browser-API shims for the same officer workflows

A parallel browser build of the officer app on the same backend and JWT — every native Expo capability (GPS, camera, storage, notifications) is replaced with a browser equivalent.

### Shell, auth & patrol map

- **AppShell / PatrolMapView** `[LIVE]` — Map-first chrome over Google Maps: dark operational styling, zone polygons, officer/dispatch/mark-up pins, a CODE 1 duress trigger and modal, a peer-share directory and stopwatch, a street/parking HUD, and a compass indicator — feature-equivalent to the mobile home screen, built independently rather than shared.
- **Live-position broadcast toggle** `[BUG — No UI control]` — The broadcast hook is mounted and functional, but its enabled/disabled state is never surfaced to the officer — the status badge component that would show it exists but is never rendered. In practice broadcasting stays off unless the underlying localStorage key is set by hand.
- **Service worker** `[LIVE]` — Handles push delivery for location-pulse events, notification-click focus/open, and re-subscription when the browser rotates a Web Push subscription.

### Dispatch

- **DispatchPage / Code2Button / VehicleDetailsPanel** `[LIVE]` — Drawer list of active SRs with acknowledge, add/edit vehicle, and screen-reader live-region announcements for new dispatches.
- **NoReportPanel** `[BUG — Images not transmitted]` — Captures ≥3 photos via `<input capture="environment">` with a per-photo GPS fix and converts each to base64 client-side — but the submit call sends only metadata (filename, size, capture time, GPS, officer number). The base64 image data is computed and then discarded; no photo evidence reaches the server from this surface.
- **IssueInfringementPanel / Receipt** `[LIVE]` — Filter box over the 111-code offence catalogue; live-ticking issue time; offence time editable only for the 5 catalogue codes flagged as such; printable PIN receipt with the action bar hidden from the print layout.

### Mark-up & digital chalking

- **MarkupForm / MarkupPage / TimerAlertsProvider** `[LIVE]` — GPS auto-capture converging to ≤12m accuracy, cross-street autocomplete (server-first, Google Places fallback), mandatory-capture validation, and separate Physical/Digital submit paths. A global watcher fires a once-per-mark-up 5-minute warning and expiry alert via browser notification and a synthesized Web Audio siren.
- **LiveCaptureView — the ANPR scan loop** `[LIVE]` — `getUserMedia` camera feed sampled to a hidden canvas, sent to the server ANPR provider, and fed through the shared frame-consensus engine before a confirmed plate opens the review modal. On approval, the server's overstay decision drives a single or double confirmation tone via synthesized Web Audio (880Hz siren / 1200Hz confirm tone) — the audio cue this workflow calls for, present here but not on mobile. Soft-caps at 100 captures with a warning, hard-stops at 500.
- **CaptureReviewModal** `[NOTE — Red state unreachable]` — Its red "Offending — Period Exceeded" styling keys off a flag that `LiveCaptureView` never sets before approval, since overstay is only known from the server's response *after* the officer approves. The modal therefore always renders its amber "Review Capture" variant in current use — the red path is latent, not live behaviour.
- **Digital-chalking offence auto-fire (server-side)** — The web client never runs the cross-check itself — it happens server-side inside `DigitalChalkingService.recordScan`, which also auto-fires an infringement under offence code `701 - PERIOD LONGER` and returns the resulting infringement id on the scan response.

### Address lookup, location requests, settings

- **AddressLookup / useStreetName** `[LIVE]` — Debounced type-ahead with abort-on-restale, GPS-ranked history; street/cross-street/side resolution shared across Patrol, Dispatch and Mark-Up.
- **LocationRequestsPage / PulseRequestsProvider** `[LIVE]` — Incoming/outgoing pulse-request inbox with WebSocket push, an 8-second poll fallback, and a VAPID Web Push subscription for delivery to a closed tab.
- **Settings — password, theme, duty status** `[LIVE]` — Feature-equivalent to mobile settings, synced to the same server-side theme preference endpoint.
- **presenceService** `[DORMANT — Unused]` — Defined but has no importers anywhere in the web app — dead code.

**Native-to-web shim table**

| Native capability | Web replacement |
|---|---|
| expo-location watch | `navigator.geolocation.watchPosition` |
| react-native-maps | `@vis.gl/react-google-maps` |
| expo-image-picker (photo capture) | `<input capture="environment">` |
| expo-camera (live ANPR video) | `getUserMedia` + hidden `<canvas>` sampling |
| AsyncStorage | `localStorage` |
| expo-notifications | browser `Notification` + Web Audio + Service Worker Push |

**Verification notes — web companion**
- Corrected the offence catalogue count from ~59 to the actual 111 entries.
- Traced the No Report photo path line-by-line and confirmed `imageBase64` is computed but never included in the request body — a real data-loss bug, not a description error.
- Confirmed `CaptureReviewModal`'s overstay styling is currently unreachable by tracing exactly when `decision.overstayed` becomes known relative to when the modal renders.
- Confirmed the ANPR provider factory's auto-select behaviour (Anthropic when a key is present and no provider is forced) directly from the factory source.

---

## CommandMAPS — dispatcher dashboard

**Location:** `civicmaps/commandmaps` — Vite · React 18 · Tailwind — dispatcher / supervisor / admin only

Officers cannot sign in here — `AuthGate` shows an in-place "use the mobile app" message rather than a redirect for the OFFICER role.

### Dashboard

- **DashboardPage / ZoneMap** `[LIVE]` — Full-viewport live map with a collapsible stat panel (active zones, online officers, Code2 count, unassigned SRs), zone rosters, incoming location-pulse requests, and the 15 most recent SRs. Refreshes on mount, on any WebSocket message, and every 30 seconds, keeping the last good snapshot on screen if a refresh fails.
- **Dashboard zone assign/reassign/end** `[SECURITY — Bypasses co-assignment rule]` — The inline quick-assign modal on the dashboard applies no team-eligibility check at all — it lists every officer from the directory unfiltered. Only the dedicated Assignments page runs the shared `canCoAssignToZone` rule.
- **CODE 1 banner & map beacons** `[NOTE — Load-time gap]` — A dark alert bar per active incident with an elapsed timer and Acknowledge action, mirrored as a pulsing map beacon. The incident list is fetched only on a WebSocket event or after acknowledging — not on page mount and not in the 30-second poll — so loading the dashboard mid-incident shows nothing until the next event arrives.
- **Live officer pin layer** `[LIVE]` — Three pin types on one map: duress (always visible), consent-token (reverse-geocoded street, live countdown, dropped client-side the instant it expires), and the viewer's own position.
- **SR marker clustering & detail sheet** `[LIVE]` — Same-location SRs cluster into a single pin; opening one gives a full inline-edit detail sheet — a narrower editable field set than the dedicated Lookup page's detail modal.

### Zone assignment management

- **AssignmentsPage — full roster + eligibility** `[LIVE]` — Every patrol zone with its full many-to-many roster. The add-officer modal disables ineligible candidates with the human-readable reason from `canCoAssignToZone` and blocks submit on a disallowed pick — the one surface in CommandMAPS that actually enforces the shared team rule client-side. "Candidate ranking" in the code is a misnomer; no sorting occurs, only annotation.

### Officer directory / employee HR

- **DirectoryPage — onboarding, edit, password reset** `[LIVE]` — Grouped rail (Management / Supervisors / Officers) with search; regex-validated onboarding form; server-generated temp passwords shown once; a two-step password-reset confirm flow nested inside edit mode, so edit rights are a de-facto prerequisite for resetting a password.
- **Role-access matrix** `[SECURITY — Security-relevant]` — The only place in CommandMAPS that imports `shared/roles.ts`. Employee-edit permission fails on a branch mismatch only when *both* sides have a non-null branch (a null branch passes); password-reset permission is the opposite — a null branch fails the check.

### Service request (Code21) lookup

- **Code21Page — list, detail, lock model** `[LIVE]` — Status/text filtering, dynamic "Alleged Offence" vs "Offence Type" header, and a lock model that — corrected from the first-pass draft — includes every terminal status (COMPLETED/ATTENDED_COMPLETE/CLOSED/VOIDED), not just PIN and No-Report states.
- **No Report toggle** `[SECURITY — Broader than intended]` — Shown to DISPATCHER, or to *any* People Manager viewing *any* SR that has some assigned officer — there is no check that the assigned officer actually reports to that manager. The shared, narrower `canToggleNoReport()` helper exists but is not imported here.
- **Close / Void SR workflows** `[NOTE — Local, not shared, role logic]` — Both role sets are hardcoded local arrays in `Code21Page.tsx` rather than the shared constants. Close status eligibility is a fixed allow-list that *includes* the terminal ATTENDED_COMPLETE state and *excludes* COMPLETED — the reverse of "non-terminal only." Void requires status exactly COMPLETED plus an existing PIN; the shared `canVoidPin()`'s extra team-scoping for supervisor tiers isn't applied client-side, so the UI relies entirely on the server to enforce it.
- **Code21CreateForm** `[LIVE]` — Address search racing a server lookup against Google Places (3-second cap), zone resolution with an on-duty auto-assigned officer and manual override, a client-side point-in-polygon fallback when the server zone-resolve call fails, and a review screen before dispatch.

### Mark-ups & audit

- **MarkUpPage / MarkUpCreateForm / MarkUpArchive** `[LIVE]` — Dispatcher-only creation and completion, the same 12-metre GPS convergence and cross-street resolution as the officer apps, and the same synthesized-siren expiry alarm. The archive is a component swap inside the mark-up page, not a separate route. Gating throughout is a hardcoded `role === "DISPATCHER"` check rather than the shared role-set constant, though the membership is identical today.
- **AuditPage** `[LIVE]` — Entity-type-filterable global audit trail — the one list page in CommandMAPS with no WebSocket subscription, refreshing only when the filter changes.
- **Look Up hub** `[LIVE]` — Consolidates Code21, Mark-Up and Audit into one tabbed route with state carried in the URL query string, so deep links (like the dashboard's "open this SR" link) work.

### Realtime & shared infrastructure usage

- **wsClient — wildcard-only subscription** — `subscribe(channel)` exists on the client but is never called; every page (Dashboard, Assignments, Directory, Code21, Mark-Up) listens on the `"*"` wildcard exclusively and filters by event-name prefix inside its own handler.
- **Shared RBAC actually imported** `[NOTE — Narrower than assumed]` — CommandMAPS imports exactly two shared rule modules in practice — six symbols from `roles.ts` (Directory page) and `canCoAssignToZone` (Assignments page). Everywhere else — No Report, Close, Void, Mark-Up write access — the equivalent shared constant exists but the UI re-declares its own local, sometimes-diverging copy instead of importing it.
- **Dead code** `[DORMANT — Confirmed]` — `DISPATCH_MAP_STYLES` is defined in `ZoneMap.tsx` but never passed to the map component — the operational dark styling actually comes from a Google Maps cloud `mapId` instead.

**Verification notes — CommandMAPS**
- Re-derived the exact No Report gate condition from source rather than trusting the summary description — confirmed it is broader (any manager, any assigned SR) than a reporting-line-scoped rule would be.
- Re-derived Close/Void role sets and status gates directly from `Code21Page.tsx` and confirmed they are locally hardcoded, with the Close status list including a terminal state.
- Confirmed the dashboard's assign modal applies no co-assignment check by reading its handler directly, in contrast to the Assignments page.
- Confirmed `wsClient.subscribe()` has zero call sites — every consumer uses the wildcard handler.

---

## Shared platform layer

**Location:** `civicmaps/shared, data, design-system, scripts, docs, tests` — consumed by every app above

### Contracts & RBAC

- **12 domain contract modules** `[LIVE]` — Zod schemas for auth, assignments, attachments, audit, code21, dashboard, digital-chalking, mark-up, officer-status, presence, realtime and user-preferences — the single source of validation truth shared across server, mobile, web and CommandMAPS. `realtime.ts`'s `WsEventName` is the most-imported single contract in the repo.
- **shared/index.ts barrel** `[DORMANT — Unused]` — Re-exports most of the package, but nothing in the repo actually imports the barrel itself — every consumer deep-imports the individual module it needs instead.
- **shared/contracts.ts (legacy, top-level)** `[DORMANT — Dead code, confirmed]` — A separate, out-of-sync file (distinct from the `contracts/` folder) with minimal login/register/code21 schemas. Zero import sites anywhere in the repo by either path or symbol name — fully superseded.
- **roles.ts — the live RBAC engine** — See the Backend section above for the gate functions themselves; this is their single source across every app.

### System policy & mandatory capture

- **system-policy.ts** `[LIVE]` — Documents the platform's deliberate "no globally mandatory location share" stance — the mandatory-share role list is empty by design — alongside a small registry of capture rules that *are* mandatory at specific routes: the CODE1 duress override, evidence geotagging, and mark-up between-streets-and-side.
- **validateMandatoryCapture** `[LIVE]` — Enforces the mark-up between-streets/side rule at submit time on both mobile and web, deferring to the upstream GPS-required guard when GPS itself is unavailable rather than double-erroring.

### Digital-chalking engine (pure logic)

- **frame-aggregator.ts / plate-normalize.ts / segment-id.ts / time-rules.ts / vehicle-profile.ts** `[LIVE]` — The consensus engine that turns noisy ANPR frame reads into a confirmed plate; plate normalization with opt-in OCR-confusable folding (O↔0, I↔1, B↔8, S↔5, Z↔2 — not applied by default); a direction-agnostic street-segment identifier so patrolling either way hits the same record; a parser for parking-sign time strings (`1P`, `15M`, `LZ15`, etc.); and the per-plate parking-footprint merge logic.

### Zone & street geo data

- **PATROL_ZONES / PATROL_ZONE_DETAILS** `[LIVE]` — 23 Melbourne patrol zones (CBD grid, Carlton, and five outer-municipal zones) with full boundary/laneway/internal-street detail — the heaviest-used shared module in the repo, and the seed the server syncs into `patrol_zones` on every boot.
- **street-lookup.ts / street-segments.ts / parking-area-lookup.ts** `[LIVE]` — Local-then-remote cross-street resolution (City of Melbourne Open Data fallback), the CBD street-grid segment resolver behind side-of-street derivation, and the Council parking-area/EasyPark number lookup shown on the patrol HUD.
- **Superseded / unused street modules** `[DORMANT — Dead code]` — `shared/streets/streetNumbers.ts` (2,646 lines) has zero importers — its function was superseded by a smaller, differently-sourced module in the mobile app's own constants folder, not simply relocated.

### Constants, data files & design system

- **offence-codes.ts / parking-zones.ts** `[LIVE]` — 111 parking-offence codes, 46 vehicle makes, 14 body types, 25 colours; a 491-entry street-to-parking-zone-number lookup, generated by a companion Python script against City of Melbourne open data.
- **Unconsumed data files** `[DORMANT — No importers]` — `data/CoM-area-assets.json`, `vic_schedule6_parking_infringements_quicklookup.json`, and several placeholder-sized `zones.json`/`street-numbers.json`/`parking-zones.json` files carry zero code references — legacy or scratch inputs superseded by the live shared modules.
- **Design system** `[LIVE — reference]` — A documented brand profile (Civic Navy / Operations Teal / Patrol Gold, DM Sans / JetBrains Mono / Plus Jakarta Sans, Lucide-only icons, no colour-only status) with a completed 46-finding compliance audit and remediation pass across all three apps, plus click-through UI-kit recreations of each surface for design review.

### Scripts, docs & tests

- **release-preflight.mjs / openapi-spec-check.sh** `[LIVE]` — Pre-release configuration gate and a three-stage OpenAPI contract CI check (one stage silently no-ops — its structural-checker script isn't present in this repo).
- **Docs — Zello guide, naming pack, performance runbook, release checklist** — 15-document Zello PTT integration spec (planning only — see Mobile section); the canonical CIVIC MAPS / EnforcementMAPS / CommandMAPS naming standard; a battery/CPU/memory baseline runbook for Pixel 6a and iPhone SE reference devices (templates in place, real hardware numbers still *TBD*); a release checklist enforced by both a PR template and a CI bot comment.
- **Cross-cutting test suites** — Unit coverage for the digital-chalking engine, RBAC, co-assignment, mark-up timers and mandatory capture; live-GPS and location-pulse contract tests; a documented but only-partially-present security suite (only the "low" severity tier exists on disk — critical/high/medium suites are specified in the test index but the files themselves are absent from this repo).

**Verification notes — shared & platform**
- Corrected the patrol-zone count from 22 to the confirmed 23; corrected offence/vehicle-catalogue counts against the actual arrays.
- Verified the `shared/contracts.ts` dead-code claim by grepping every app directory for both the bare path and each exported symbol name — zero hits.
- Verified `shared/index.ts` itself has zero importers, a finding the first pass missed entirely.
- Confirmed the documented critical/high/medium security test suites are specified in the test index but the actual files do not exist in this repo — stronger than "excluded from the default run."

---

## Methodology

Five parallel research passes surveyed the backend server, the mobile app, the web companion, CommandMAPS, and the shared/data/design/docs/test layer directly from source. Each resulting draft was then independently re-verified — cross-checked claim by claim against the real files, with import sites re-grepped rather than trusted, live/dormant status re-traced through actual navigation code, and RBAC logic re-derived from the gate functions themselves — by a second pass running on Claude's Opus model at the highest available reasoning effort. Every correction surfaced by that verification pass is folded into the inventory above; the "Verification notes" panel under each section lists what changed and why.

Note: the requested review model, "Opus-4.8," is not a model available in this environment. The verification passes ran on the current Opus model (Opus 5) at maximum reasoning effort, which is the closest and most capable equivalent on offer.
