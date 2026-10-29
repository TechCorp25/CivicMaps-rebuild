# R0 reproducible execution evidence

Date: 2026-10-31 UTC. Goal: R0. Scope is execution-environment qualification only; this is not application test or security evidence.

## Source and isolation

- Checkout: `/workspace/work/remediation-2026-10-31/builder`
- Branch at start: `codex/remediation-builder`
- Source at start: `700d3f0e3334f64461d9576cc6f784eba572138a`
- Initial working tree: clean.
- npm setup was run in this isolated builder worktree. The coordinator owns publication; this evidence does not modify its checkout.
- No historical test result was reused or represented as a fresh result.

## Pins and locked install

- `.node-version`: `24.19.0`; `node --version`: `v24.19.0`.
- `package.json` `packageManager`: `npm@11.9.0`; `npm --version`: `11.9.0`.
- Command: `npm run setup`.
- Result: exit 0; `npm ci --ignore-scripts --bin-links=false --no-audit --no-fund` added 238 packages. No package scripts or executable links were enabled. An initial sandbox-only attempt stalled under restricted network; a single approved execution completed. The earlier incomplete attempt was not counted as a successful install.

## Dedicated synthetic PostgreSQL

- Image: `postgres:15.18-bookworm`, pulled for this run; image digest `sha256:e8db9bd3e9e1751eb639fb17be53cc6d1b62a322adf75b99e791767a7a16ce69`.
- Dedicated container: `civicmaps-r0-builder-20261031`, bound only to `127.0.0.1:55461`; synthetic database and owner: `civicmaps_builder` / `civicmaps_builder`. Container uses trust auth on the loopback-only published port and contains synthetic data only. It is separate from the coordinator/checker worktree and any historical database/runtime.
- The repository launcher was also checked with `CIVICMAPS_DATA_DIR=/tmp/civicmaps-r0-builder-20261031 CIVICMAPS_PG_PORT=55461 npm run db:start`; it could not run because `/usr/lib/postgresql/15/bin/initdb` is absent. The Docker instance supplies the isolated PostgreSQL runtime instead.
- Migration command: `CIVICMAPS_DATABASE_URL=postgres://civicmaps_builder@127.0.0.1:55461/civicmaps_builder npm run db:migrate` — exit 0, “Foundation migrations applied or already present”.
- Seed command: same URL with `npm run db:seed` — exit 0, six synthetic users and platform operator/municipalities/metric snapshots seeded.
- Identity check: `docker exec civicmaps-r0-builder-20261031 psql -U civicmaps_builder -d civicmaps_builder -Atc "SELECT current_database(), current_user, inet_server_port();"` — returned `civicmaps_builder|civicmaps_builder|`; database and role verified. The SQL runs inside the container, so `inet_server_port()` is null for its Unix-socket connection; the published TCP port is verified by the container port configuration.
- No application/browser suite was run in this goal.

## Browser and Caddy availability

- System Chromium: `/usr/bin/chromium`; Playwright package version pinned at `1.58.2` by the locked manifest. Command: `node --input-type=module -e "import {chromium} from '@playwright/test'; const b=await chromium.launch({headless:true, executablePath:'/usr/bin/chromium'}); console.log('Chromium launch passed', await b.version()); await b.close()"` — exit 0 through the approved execution path; reported Chromium `154.0.8037.57`.
- The same launch was blocked by sandbox restrictions on its first attempt (`setsockopt: Operation not permitted`, Chromium exited SIGTRAP). This was an environment restriction, not a product failure; the approved execution path passed.
- Caddy availability: `command -v caddy` returned no path; `CIVICMAPS_CADDY_BINARY` was not configured. The actual ingress checks requiring Caddy are therefore not runnable in this environment as currently configured. This is recorded as a limitation, not a pass.

## Context7 discovery

- Connected tool inventory query filtered for `Context7`: zero matches.
- Repository/config search found historical textual references only; no callable Context7 configuration or retrieval was available in this execution context. No library ID, current retrieval date, or retrieved source is claimed. This is an explicit open external requirement for later guidance-dependent goals.

## R0 status and limits

The source and tool pins, locked npm setup, isolated synthetic database/runtime, migration/seed, and Chromium launch have fresh evidence. Caddy is unavailable in this environment, and Context7 is unavailable from the tool inventory. These constraints are explicit for independent review. This packet does not report a product test, AUD-001 revalidation, R1 implementation, R2 audit, or acceptance by an independent checker. R1 and R2 remain pending.
