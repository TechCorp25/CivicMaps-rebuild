# PR46 authentication-loss and map-readiness follow-up

27 October 2026 · Author: Codex · Reviewed base: `a2bb2bcccb7bec80c22376b79dbbb3fbb7369a39`

Both unresolved Codex review findings were validated against the reviewed code.

- Authentication loss: queue refresh, audit loading/retry, and mutation 401 handlers cleared the actor without consistently clearing the confirmed workspace-map draft and composer. Every actor-clear path now clears both states, including explicit sign-out. This prevents a later session from inheriting a confirmed incident location.
- Map readiness: entering composer map-selection mode before map setup completed changed state without installing the click listener. The entry button is now disabled until the map is ready, with a matching handler guard before changing the confirmed point or cancellation snapshot.

The existing CI-wired `npm run test:map:browser` suite now also delays SDK setup and verifies selection works after readiness. A new harness mounts the actual CommandMAPS app with synthetic API responses, opens a composer from a confirmed workspace-map point, returns 401 on a focus refresh, signs in a different dispatcher/council, and verifies the composer stays closed and a new request has no inherited address or coordinates.

Validation passed: `CIVICMAPS_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:map:browser`, `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run build`, and `git diff --check`. The first browser attempt was blocked by the sandbox's local-port restriction; the authorised rerun used the local Vite server and system Chromium. An initial test run used the wrong new-request button label; correcting the test selector produced the passing run.

These are browser/component and static/build checks. The database integration suite and live Google provider calls were not run for these client-only fixes. No merge or deployment was performed.

## Subsequent Escape review finding

Validated comment 4387040322: Escape on an open autocomplete popup also cancelled the native composer dialog. The picker now prevents the default Escape action only while suggestions are open. The actual-app browser regression verifies the popup closes while unsaved dispatch notes remain, and a subsequent Escape closes the composer normally. System Chromium map browser regressions, lint, typechecks, targeted formatting and diff checks passed. The initial popup assertion also counted dashboard filter options; it was corrected to scope to the composer.
