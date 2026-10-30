# R1 corrective validation commands

Source candidate: `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`.
Runtime: Node v24.19.0, npm 11.9.0, Playwright 1.58.2, Chromium 145.0.7632.6; dedicated synthetic PG15 at `127.0.0.1:55461`, database `civicmaps_builder`, with inspected wrappers from `builder-work/R1` used for `pg_dump`, `pg_restore`, `createdb`, `dropdb`, and `psql`. No credential/password is used. Browser binaries were reused from `/tmp/civicmaps-r1-builder-browsers`.

- `npm run setup` — passed, 238 packages installed.
- `npm run verify:vite-manifests` — passed, 27 package manifests scanned; every direct Vite declaration is 6.4.5.
- `npm ls vite --all` — passed, single installed Vite 6.4.5.
- `npm run check` — passed, actual shell exit 0; 114 tests passed, 0 failed/cancelled/skipped/todo.
- `npm run audit:dependencies` with `CIVICMAPS_AUDIT_OUTPUT_DIR` set to scratch — passed; production/full each zero vulnerabilities.
- Sequential browser commands `npm run test:map:browser`, `npm run test:platform:browser`, `npm run test:commandmaps:browser`, `npm run test:activation:browser` — each exited 0.
- `node docs/assessments/2026-10-30/evidence/remediation/R1/vite-fs-smoke.mjs` — passed; ordinary page/module 200, `.env`, `?import`, `?raw` 403, marker absent. This is a deny-path compatibility smoke, not exploit reproduction.

The earlier unprivileged and overlapping attempts are preserved in `attempts.md` and `ambiguous-earlier-check-attempt.log`; they are not acceptance evidence. The definitive run is the clean check log included here.
