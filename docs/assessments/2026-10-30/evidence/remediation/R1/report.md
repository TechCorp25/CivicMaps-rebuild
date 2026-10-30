# R1 builder evidence report

Goal: R1 — remove confirmed finding AUD-001. Initial source/base: `9174ac53a5def003b85f508714e458767927531a` (R0 candidate, independently accepted). Product delta is the exact Vite patch from 6.4.4 to 6.4.5 in `package.json` and `package-lock.json`; no application source or configuration changed. Candidate SHA is recorded in the remediation checkpoint after the local commit.

## Advisory revalidation and patch choice

- Official GitHub Security Advisory API response is preserved as `advisory.json`; retrieved 2026-10-30 UTC from `https://api.github.com/advisories/GHSA-8g5g-mxqh-grgj`.
- GHSA-8g5g-mxqh-grgj remains medium, `withdrawn_at` is null, Vite affected range is exactly `= 6.4.4`, first patched version is `6.4.5`; API `updated_at` is 2026-10-29T16:39:59Z. The API response is registry/advisory evidence, not Context7.
- `vite-registry-metadata.json` records npm registry metadata for 6.4.5 and its Node engine range. `.node-version` pins Node 24.19.0, which satisfies the published range.
- The lockfile integrity and exact resolved tarball entry were updated for Vite 6.4.5. `npm ls vite --all` showed only root `vite@6.4.5`; `node -p "require('vite/package.json').version"` returned `6.4.5`. The lock contains no Vite 6.4.4 entry. No other manifest/lock dependency changed.

## Executed acceptance checks

- `npm run setup` — exit 0; `npm ci --ignore-scripts --bin-links=false --no-audit --no-fund`, 238 packages installed.
- `npm run check` — the first run is preserved in `initial-check.log`. Lint, formatting, typechecks/builds and 112 of 114 integration tests passed; two backup/restore tests could not start because host `pg_dump` was absent. No test failed on an application assertion in that first run.
- Full rerun: `npm run check` with the documented task-local PostgreSQL client wrapper path and dedicated synthetic DB — exit 0; 114/114 tests passed, zero failures, skips, or cancellations; lint, format check, both typechecks/builds passed. Complete log is `check-final.log`. The two affected backup/restore tests were also rerun directly with `node --test tests/release-backup.test.mjs tests/routing-release.test.mjs`; both passed (see `backup-focused-final.log`).
- Browser suites ran sequentially with Playwright 1.58.2 and its installed Chromium 145.0.7632.6: map (`test:map:browser`), Platform (`test:platform:browser`), CommandMAPS (`test:commandmaps:browser`), and activation (`test:activation:browser`) all exited 0. Individual logs are included. The activation harness found port 5173 occupied and selected another port; the suite passed.
- `npm run audit:dependencies` — exit 0. Production and full lockfile reports each show zero high/critical, low/moderate, or informational advisories. `AUD-001` is absent and no other advisory remains to triage. Exact JSON reports are under `dependency-audit/`.
- A synthetic loopback Vite 6.4.5 dev-server smoke served an ordinary page and module with status 200. With `fs.strict: true`, `fs.allow` set to the fixture root and `fs.deny: ['.env']`, requests for a synthetic `.env` marker at `/@fs/.../.env`, `?import`, and `?raw` each returned 403 without the marker in the response. This is a narrow post-patch behavior smoke only: it does not establish exploitability of the prior package, reproduce the GHSA against 6.4.4, or prove every bypass variant.

## Environment and limits

- Database used: the unique builder-owned `postgres:15.18-bookworm` container `civicmaps-r0-builder-20261031`, bound only to `127.0.0.1:55461`, synthetic database/user `civicmaps_builder`; no production/customer data. R0 independently checked this runtime. `npm run check` uses its base URL only to create/drop uniquely named disposable test databases.
- The host lacks PostgreSQL 15 client executables. Initial full-check evidence preserves that environment failure. `apt-get update && apt-get install -y postgresql-client-15` could not proceed because `/var/lib/apt/lists/partial` is unavailable/permission-denied. Transparent task-only wrappers are included in `postgres-client-wrappers/`; they route `pg_dump`, `pg_restore`, `createdb`, `dropdb`, and `psql` into the same PostgreSQL 15.18 container, copying only synthetic backup archives through test temporary paths. They contain no credentials and are not product code. The full suite passed with the wrappers active. The independent checker should inspect the wrappers and may rerun with equivalent PostgreSQL 15 client binaries if available.
- Chromium was installed at `/tmp/civicmaps-r1-builder-browsers` to avoid writing to the home directory. The first R0 Chromium attempt under the restricted sandbox was blocked; R0 records the approved successful launch. R1 browser checks used the Playwright-matched installation.
- Caddy ingress checks are not an R1 criterion. The coordinator has since prepared the CI-pinned Caddy v2.10.2 binary for the later R4 ingress checks; no Caddy check was run as part of R1. The original R0 observation that Caddy was unavailable remains unchanged.
- Context7 remains unavailable in the connected tool inventory. No Context7 retrieval is claimed. This does not block the scoped Vite patch evidence, but the plan's R2/R4 external requirement remains open.
- No application exploit against Vite 6.4.4 was attempted or claimed. No production dev-server exposure was tested.
