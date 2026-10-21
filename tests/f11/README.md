# F11 persistent test inventory

Status: planned coverage; these executable suites must be built during implementation. This inventory is not a claim that tests exist or pass.

| Planned file | Required behaviour | Execution integration |
| --- | --- | --- |
| `staff-authority.test.mjs` | Approved actor/action pairs; self-elevation and cross-council/context denials; ADMIN operational exclusion | Node integration suite included in root check and CI |
| `staff-lifecycle.test.mjs` | Invite/activate/expiry/replay/reissue; grant/revoke/disable; stale sessions; immutable audit and retry/concurrency atomicity | Node integration suite included in root check and CI |
| `staff-migration.test.mjs` | Fresh and populated synthetic schema upgrades; invalid mapping fail-closed and transaction rollback; compatibility and preserved history; reuse PR25 ownership coverage without duplication | Disposable PostgreSQL integration suite |
| `browser-council-dispatch.mjs` | Two newly provisioned councils; admin provision then create/assign/acknowledge/attend/close; wrong-council reads/mutations; pack changes; uncertain response, reload, keyboard and narrow viewport | Explicit browser npm script and CI stage; sequential shared ports |
| `release-smoke.mjs` | Deployed version/health, routing/login and council isolation with designated synthetic accounts; bounded cleanup | Explicit release command against established target, never default live mutation |

Shared fixtures/helpers go under `tests/helpers/` or `tests/f11/helpers/`; create as needed. Save raw execution artifacts and screenshots in the configured test-results location and link them from release evidence. Never store credentials. Existing root regressions remain required. The current root glob does not discover this directory: update test discovery/scripts and CI with the first executable suite, and verify actual test counts. Test code is part of the product presented for independent assessment.
