repo: CivicMAPS/CivicMaps-preview
branch: main
path: civicmaps/

## Last sync

date: 2026-08-09T10:20:00Z

### Updated in this project

- Scoped (not yet built) a new Platform Admin surface — municipality/department onboarding for the multi-tenant model. Searched the full repo for tenant/municipal/council/org/platform-admin source: none exists (1a's `<council>.civicmaps.gov.au` subdomain pattern, marked "new, owner-directed" in Sequence 1, is the only precedent). Split into 4 planned sequences per `handoff.md`'s "Next set" — deferred to a future session per owner request.

## Sync history (previous)

- 2026-08-09T09:15:00Z

### Updated in this project

- Added Sequence 11 — Settings, all three surfaces. Read `commandmaps/src/features/settings/SettingsPage.tsx`, `enforcementmaps-web/src/features/settings/SettingsPage.tsx`, `enforcementmaps/settings.tsx`, `settingsService.ts`, and the `auth`/`officer-status`/`user-preferences` shared contracts directly: Change password and Display theme are byte-for-byte identical components across CommandMAPS and EnforcementMAPS Web; Duty status (Code2/Code26) is gated by `isOfficer` on both web surfaces but is unreachable on CommandMAPS since `AuthGate` denies OFFICER sign-in there (OQ11-4), while genuinely reachable on Web. Mobile adds Location visibility (`ShareLocationToggle`/`LocationVisibilityProvider`) and a separate Background location permission block. Found a real design-system violation reading `enforcementmaps/settings.tsx` against `@/constants/colors`: both of mobile's primary buttons use Patrol Gold (`c.accent` → `#D4A843`) as a button fill, directly against the profile's "never for buttons" rule — flagged OQ11-6. Also flagged OQ11-2/OQ11-3 (Settings' `ShareLocationToggle` usage predates the Task #30 mandatory-share lock-down and drops a documented prop) and OQ11-1/OQ11-5 (role-enum and preferences-endpoint inconsistencies).

## Sync history (previous)

- 2026-08-09T08:35:00Z

### Updated in this project

- Added Sequence 10 — Audit Trail (CommandMAPS only, read-only). Read `Code21Page.tsx`, `DirectoryPage.tsx`, and `MarkUpPage.tsx` directly: all three already carry a real, generic `auditTrail`/`AuditTrailEntry` log with dedicated fetch endpoints (Code21 embedded on the record; Directory via `/admin/officers/:id/audit`; Mark-Up embedded per 9k) — 10a (Directory) and 10c (Code21) are existing behaviour, just re-presented expanded/full-page. Confirmed `AssignmentsPage.tsx`/`shared/contracts/assignments.ts` carry no audit fields (10b is net-new, OQ10-1) and no infringement/PIN record model exists anywhere in the repo (10d is net-new, extends OQ8-13). Confirmed `shared/contracts` has no reporter/complainant identity field on Code21, so 10c's "Related Requests" cross-linking panel is illustrative only (OQ10-2). Also added 9n (per-scan detail drawer with capture-location map, stacked over 9l) and captured-by/click affordance on 9l's rows. Extended 10c with a Location map (Code21 already stores lat/long, styled after 9n) and added 10e, a real address/coordinate-based "SRs at this address" list — a genuine query against existing fields, unlike the reporter-based panel.

**Recommended next session:** no unscheduled all-surface feature area remains. Either a design-fix pass on OQ11-6/OQ11-3, or an Audit follow-up once OQ10-2/OQ10-3 get an owner decision.

## Sync history (previous)

- 2026-08-09T03:08:00Z

### Updated in this project

- Added CommandMAPS's Mark-Up compliance & review surface (9j–9m), resolving the remaining half of OQ9-3. Read `commandmaps/src/features/markup/{MarkUpPage,MarkUpArchive}.tsx` and `shared/roles.ts` directly: `MARKUP_WRITE_ROLES` is `DISPATCHER`-only and `MARKUP_READ_ROLES` already includes every supervisor/compliance rank, confirming the read-only, review-not-capture framing the brief asked for is a reframing of existing access, not a new permission. Team/branch scoping (9j's "Team: Z-MAC") is proposed — `fetchItems()` has no scope filter today despite the generic `actorHasScopeOverObject` helper existing (OQ9-9). Digital Capture Review (9k, 9l) is net-new — no admin-facing scan API exists (OQ9-10). Added a tablet-responsive variant (9m) reusing 2b's existing mobile-drawer breakpoint convention rather than a new pattern. Also added an Expo/React Native build-readiness annotation pass for 9a–9g against the `building-native-ui` skill (tabular-nums, ScrollView insets, native SegmentedControl/DateTimePicker, expo-image, expo-haptics) — implementation notes only, no visual changes.

## Sync history (previous)

- 2026-08-08T10:20:00Z

### Updated in this project

- Added EnforcementMAPS Web — a real fourth surface (`enforcementmaps-web/`, browser companion to the mobile app, same backend/data) — confirmed by reading its README and `src/features/markup/` directly. New screens 9h (Live Capture, `getUserMedia` camera loop) and 9i-i/9i-ii (Capture Review Modal, normal + offending states) resolve the web half of OQ9-3. Read `lib/design-tokens.ts` to confirm this client is fully token-driven (Tailwind `bg-civic-*`/`status-*` classes, no raw hex) — repainted faithfully, no colour correction needed here (contrast with 9a/9d's mobile-side fix). Flagged OQ9-7: the offending-state review card reuses emergency red for a non-Code-1 state, a pre-existing repo convention.

## Sync history (previous)

- 2026-08-08T10:16:00Z

### Updated in this project

- Colour-corrected Sequence 9 (EnforcementMAPS mobile Mark-Up): `MarkUpForm.tsx`/`MarkUpArchive.tsx` hardcode a raw off-palette `#D97706` for primary buttons/header — confirmed by reading both files. 9a/9d repainted to Civic Navy `#1B2A4A` (the correct primary-chrome token) instead of reproducing the raw hex; recommend the same fix land in the two source files. `ActiveMarkUpList.tsx`/`MarkUpCompletionModal.tsx` were already token-correct (`status.alert*`/`civic.secondary`) — left unchanged.

## Sync history (previous)

- 2026-08-08T08:20:00Z

### Updated in this project

- Added 9g — Scanned plates list per segment (proposed): one row per scan with plate image thumbnail, capture date/time, and an editable OCR-extracted plate field, replacing 9e's compact single-line scan rows for this dedicated review screen. No backing screen/route/API exists yet (OQ9-6); correction behaviour undefined (OQ9-5).

## Sync history (previous)

- 2026-08-08T07:52:00Z — New Sequence 9 — EnforcementMAPS mobile Mark-Up (digital chalking): 9a create form (physical/digital split, GPS mandatory-capture rule, address S/H/G type-ahead), 9b active list (timers, DIGITAL badge + Resume, tap-to-complete-early), 9c-i/9c-ii completion (Chalk Mark Evidence + Marks Collected vs. digital capture summary), 9d archive search/results, 9e/9f digital-chalking live plate-scan capture (segment screen + camera viewfinder). Scoped to EnforcementMAPS mobile only — CommandMAPS admin + EnforcementMAPS **Web** live capture (a separate browser implementation) deferred (OQ9-3).

## Sync history

- 2026-08-08T00:00:00Z — Added 8i-i–8i-iv — Issue Infringement, Rangers (Parks & Gardens) department variant: Step 1 swaps Vehicle/Animal Details for Reserve/Site + Party in Control, including a new read-only Permit Status lookup against the Licensing/Permits domain pack (OQ8-20); Steps 2–4 reuse the Parking/Animal Management wizard structure with department content (illustrative offence `PG-021`/$198 — no backing `offence-codes.ts` entries, OQ8-21).
- 2026-08-07T05:05:00Z — Added 8h-i–8h-iv (Animal Management department variant, resolves OQ8-11); rebuilt 8d-iv/8h-iv Review & Issue as icon-free label/value rows; added 8g print-replica (real Code 128/QR); extended sub-agent spec with print-replica guidance; flagged OQ8-16 (missing ScrollView inset handling).
- 2026-08-07T03:40:00Z — Sequence 8 (EnforcementMAPS Officer Dispatch Workflow) recreated; 8d expanded into proposed 4-step wizard; building-native-ui conformance pass.
- 2026-08-07T03:02:00Z — Sequence 7 (Code21 Detail & Lifecycle) recreated; resolved OQ2-3 (`enforcementmaps/tabs/` confirmed live, not dead code).
- 2026-08-07T01:26:00Z — Sequence 6 (Code21 Create & Dispatch) recreated (see prior entry).
- 2026-08-05T10:58:00Z — Sequence 5 (Directory, Assignments, Look Up) recreated (see prior entry).
- 2026-08-04T08:52:00Z — Sequence 4 (Live Map) recreated (see prior entry).

## Screen map

| Screen | Repo files |
|---|---|
| 1a Council entry / tenant landing | none — new, owner-directed |
| 1b CommandMAPS sign-in | civicmaps/commandmaps/src/features/auth/LoginPage.tsx; civicmaps/commandmaps/src/features/auth/auth-context.tsx; civicmaps/shared/contracts/auth.ts |
| 1c CommandMAPS sign-in 403 | civicmaps/server/src/modules/auth/auth.routes.ts; civicmaps/docs/work-reports/global/20260407t2345z-unified-login-24hr-policy-deployment.md |
| 1d Officer sign-in (mobile) | civicmaps/src/features/auth/auth-screen.tsx; civicmaps/src/services/authService.ts |
| 1e Officer sign-in 403 (mobile) | civicmaps/src/features/auth/auth-screen.tsx |
| 1f Account provisioning notice | civicmaps/src/features/auth/auth-screen.tsx; civicmaps/enforcementmaps-web/src/features/auth/LoginPage.tsx |
| 1g Officer sign-in (web) | civicmaps/enforcementmaps-web/src/features/auth/LoginPage.tsx; civicmaps/enforcementmaps-web/src/features/auth/auth-context.tsx |
| 1h Code 2 sign-on | civicmaps/enforcementmaps/components/dispatch/Code2Button.tsx; civicmaps/enforcementmaps-web/src/features/dispatch/Code2Button.tsx; civicmaps/server/src/modules/officer-status/officer.routes.ts; civicmaps/commandmaps/src/features/dashboard/DashboardPage.tsx; civicmaps/docs/work-reports/20260421_000000_task30-and-code2-signon-work-report.md |
| 2a CommandMAPS desktop header nav | civicmaps/commandmaps/src/components/AppShell.tsx; civicmaps/commandmaps/src/components/VersionBadge.tsx |
| 2b CommandMAPS mobile drawer | civicmaps/commandmaps/src/components/AppShell.tsx |
| 2c Post-login role routing | civicmaps/commandmaps/src/app/App.tsx; civicmaps/shared/roles.ts |
| 2d EnforcementMAPS mobile nav chrome | civicmaps/src/features/patrol/screens/PatrolScreen.tsx; civicmaps/src/features/patrol/components/EnforcementFab.tsx; civicmaps/enforcementmaps/_layout.tsx |
| 2e EnforcementMAPS Inbox/Settings modal chrome | civicmaps/enforcementmaps/inbox.tsx; civicmaps/enforcementmaps/settings.tsx |
| 3a Dashboard — default state | civicmaps/commandmaps/src/features/dashboard/DashboardPage.tsx |
| 3b Code 1 emergency banner | civicmaps/commandmaps/src/features/dashboard/Code1Banner.tsx |
| 3c Assign/reassign officer modal | civicmaps/commandmaps/src/features/dashboard/DashboardPage.tsx |
| 3d Location pulse — incoming request & chip states | civicmaps/commandmaps/src/features/dashboard/DashboardPage.tsx |
| 3e Panel collapsed | civicmaps/commandmaps/src/features/dashboard/DashboardPage.tsx |
| 4a Zone polygon & label states | civicmaps/commandmaps/src/components/ZoneMap.tsx |
| 4b Zone info panel | civicmaps/commandmaps/src/components/ZoneMap.tsx |
| 4c Officer marker & Code21/SR pin cluster | civicmaps/commandmaps/src/components/ZoneMap.tsx |
| 4d Code 1 duress beacon & live officer pins | civicmaps/commandmaps/src/components/ZoneMap.tsx |
| 4e Mark-Up pin states | civicmaps/commandmaps/src/components/markupMarkerStyle.ts |
| 4f EnforcementMAPS live map detail | civicmaps/src/features/patrol/components/PatrolMap.tsx; civicmaps/src/features/patrol/components/DuressTrigger.tsx; civicmaps/src/features/patrol/components/Compass.tsx |
| 5a Directory — roster list | civicmaps/commandmaps/src/features/directory/DirectoryPage.tsx; civicmaps/shared/roles.ts |
| 5b Directory — employee detail panel | civicmaps/commandmaps/src/features/directory/DirectoryPage.tsx |
| 5c New employee onboarding form | civicmaps/commandmaps/src/features/directory/DirectoryPage.tsx |
| 5d Onboarding success & password-reset states | civicmaps/commandmaps/src/features/directory/DirectoryPage.tsx |
| 5e Assignments — zone board | civicmaps/commandmaps/src/features/assignments/AssignmentsPage.tsx; civicmaps/shared/contracts/assignments.ts |
| 5f Add officer modal (co-assignment ranking) | civicmaps/commandmaps/src/features/assignments/AssignmentsPage.tsx; civicmaps/shared/co-assignment.ts |
| 5g Look Up — tabbed hub | civicmaps/commandmaps/src/features/lookup/LookUpPage.tsx |
| 6a New Service Request — default state | civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx |
| 6b Address search & zone/officer resolution states | civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx |
| 6c Vehicle description & offence-type lookup | civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx; civicmaps/shared/constants/offence-codes.ts |
| 6d Assign Officer — auto vs. manual override | civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx |
| 6e Review Service Request — pre-dispatch | civicmaps/commandmaps/src/features/code21/Code21CreateForm.tsx; civicmaps/shared/contracts/code21.ts |
| 7a Workbench — filter & status list | civicmaps/commandmaps/src/features/code21/Code21Page.tsx |
| 7b Detail — editable state (unlocked) | civicmaps/commandmaps/src/features/code21/Code21Page.tsx |
| 7c Detail — locked state (PIN recorded) | civicmaps/commandmaps/src/features/code21/Code21Page.tsx |
| 7d Detail — No Report evidence (locked) | civicmaps/commandmaps/src/features/code21/Code21Page.tsx |
| 7e Close Service Request modal | civicmaps/commandmaps/src/features/code21/Code21Page.tsx |
| 7f Void PIN modal (destructive) | civicmaps/commandmaps/src/features/code21/Code21Page.tsx |
| 7g Audit trail (expanded) & closure reason | civicmaps/commandmaps/src/features/code21/Code21Page.tsx |
| 8a Patrol map — active dispatch bottom sheet | civicmaps/enforcementmaps/tabs/index.tsx; civicmaps/enforcementmaps/components/dispatch/ActiveDispatchList.tsx |
| 8b Dispatch card states & status legend | civicmaps/enforcementmaps/components/dispatch/ActiveDispatchList.tsx |
| 8c Vehicle Details form | civicmaps/enforcementmaps/components/dispatch/VehicleDetailsForm.tsx |
| 8d Issue Infringement workflow (4-step, proposed) | civicmaps/enforcementmaps/components/dispatch/IssueInfringementWorkflow.tsx (legacy single-screen basis); civicmaps/shared/constants/offence-codes.ts; civicmaps/shared/contracts/code21.ts — Location/PA/EP-PS lookup and department-filtered offence list are new, no backing source yet |
| 8e No Report — evidence capture | civicmaps/enforcementmaps/components/dispatch/NoReportWorkflow.tsx |
| 8f Native alert dialogs | civicmaps/enforcementmaps/components/dispatch/NoReportWorkflow.tsx; civicmaps/enforcementmaps/components/dispatch/IssueInfringementWorkflow.tsx |
| 8g Printed Infringement Notice (print-replica, PDF-ready) | none in repo — built from uploads/civicmaps-infringement-notice-template.md; uploads/barcode-qr-generation-reference.md (see OQ8-15) |
| 8h-i–8h-iv Issue Infringement (Animal Management variant) | civicmaps/enforcementmaps/components/dispatch/IssueInfringementWorkflow.tsx (legacy single-screen basis, shared with 8d); no Animal Management-specific source exists yet — OQ8-18 |
| 8i-i–8i-iv Issue Infringement (Rangers / Parks & Gardens variant) | civicmaps/enforcementmaps/components/dispatch/IssueInfringementWorkflow.tsx (legacy single-screen basis, shared with 8d/8h); no Parks & Gardens or Permit lookup source exists yet — OQ8-20, OQ8-21 |
| 9a New Mark-Up create form | civicmaps/enforcementmaps/components/markup/MarkUpForm.tsx; civicmaps/shared/markup/markup-mandatory-capture.ts; civicmaps/shared/contracts/markup.ts |
| 9b Active Mark-Ups list | civicmaps/enforcementmaps/components/markup/ActiveMarkUpList.tsx; civicmaps/enforcementmaps/hooks/useMarkupTimer.ts |
| 9c-i/9c-ii Mark-Up Expired completion | civicmaps/enforcementmaps/components/markup/MarkUpCompletionModal.tsx; civicmaps/enforcementmaps/services/digitalChalkingService.ts |
| 9d Mark-Up Archive | civicmaps/enforcementmaps/components/markup/MarkUpArchive.tsx; civicmaps/shared/zones/patrol-zones.ts |
| 9e/9f Digital Chalking segment + camera | civicmaps/enforcementmaps/components/chalking/ChalkingScreen.tsx; civicmaps/enforcementmaps/components/chalking/ChalkingCameraView.tsx |
| 9g Scanned plates list (proposed) | no repo source — proposed, no screen/route/API exists yet (OQ9-6) |
| 9h/9i-i/9i-ii EnforcementMAPS Web live capture | civicmaps/enforcementmaps-web/src/features/markup/LiveCaptureView.tsx; CaptureReviewModal.tsx; chalkingApi.ts; civicmaps/enforcementmaps-web/src/lib/design-tokens.ts |
| 9j CommandMAPS Mark-Ups Team Review | civicmaps/commandmaps/src/features/markup/MarkUpPage.tsx; civicmaps/shared/roles.ts (MARKUP_READ_ROLES, MARKUP_WRITE_ROLES, actorHasScopeOverObject) |
| 9k Mark-Up Detail — Compliance Review | civicmaps/commandmaps/src/features/markup/MarkUpPage.tsx (detail drawer fields, audit trail); Digital Capture Review card has no backing source — proposed (OQ9-10) |
| 9l Digital Capture Review — scan list | no repo source — proposed, no admin scan API exists (OQ9-10, OQ9-11) |
| 9m Tablet-responsive Mark-Up Detail | civicmaps/commandmaps/src/components/AppShell.tsx (2b's mobile-drawer breakpoint pattern, reused) |
| 9e Digital Chalking segment screen | civicmaps/enforcementmaps/components/chalking/ChalkingScreen.tsx; civicmaps/enforcementmaps/tabs/chalking.tsx; civicmaps/shared/contracts/digital-chalking.ts |
| 9f Digital Chalking live capture | civicmaps/enforcementmaps/components/chalking/ChalkingCameraView.tsx; civicmaps/shared/digital-chalking/frame-aggregator.ts; civicmaps/enforcementmaps/services/digitalChalkingService.ts |
| 9n Plate Scan Detail — stacked drawer with map | no repo source — proposed, extends 9l/9k (OQ9-10, OQ9-12) |
| 10a Employee Audit Trail (existing, expanded) | civicmaps/commandmaps/src/features/directory/DirectoryPage.tsx (`EmployeeAuditTrailSection`, `/admin/officers/:id/audit`) |
| 10b Zone Assignment Audit Trail | no repo source — proposed, no audit fields on civicmaps/commandmaps/src/features/assignments/AssignmentsPage.tsx or civicmaps/shared/contracts/assignments.ts (OQ10-1) |
| 10c Code21 Full-Lifecycle Audit | civicmaps/commandmaps/src/features/code21/Code21Page.tsx (`auditTrail`, existing chain); Related Requests panel is proposed, no reporter-identity field (OQ10-2) |
| 10d Infringement Issuance Audit | no repo source — proposed, no infringement/PIN record model exists anywhere (extends OQ8-13); customer withdrawal-request row flagged (OQ10-3) |
| 10e Related SRs — same address/location list | proposed; real query against existing address/coordinate fields, opened from 10c's Location card |
| 11a CommandMAPS Settings — default | civicmaps/commandmaps/src/features/settings/SettingsPage.tsx; civicmaps/shared/contracts/auth.ts (ChangePasswordSchema) |
| 11b CommandMAPS Settings — Duty status (unreachable) | civicmaps/commandmaps/src/features/settings/SettingsPage.tsx (DutyStatusSection, isOfficer); civicmaps/shared/contracts/officer-status.ts |
| 11c EnforcementMAPS Web Settings | civicmaps/enforcementmaps-web/src/features/settings/SettingsPage.tsx |
| 11d/11e/11f EnforcementMAPS mobile Settings | civicmaps/enforcementmaps/settings.tsx; civicmaps/enforcementmaps/services/settingsService.ts; civicmaps/src/features/patrol/components/ShareLocationToggle.tsx; civicmaps/src/features/patrol/state/LocationVisibilityProvider.tsx; civicmaps/src/constants/colors.ts (OQ11-6) |
