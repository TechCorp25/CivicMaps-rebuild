# R4 command transcript index

Working directory: `/workspace/work/remediation-2026-10-31/builder-R4`. Node v24.19.0/npm 11.9.0. The database URL was `postgres://civicmaps_r4_builder@127.0.0.1:55481/civicmaps_r4_builder`; `PGUSER=civicmaps_r4_builder`, `PGDATABASE=civicmaps_r4_builder`. `PATH` included `docs/assessments/2026-10-30/evidence/remediation/R4/pg-client-wrappers` first for PostgreSQL CLI calls. `CIVICMAPS_CADDY_BINARY=/workspace/work/remediation-2026-10-31/tools/caddy/caddy` was set for the two ingress commands.

Commands ran in this order:

1. `npm run setup` — `setup.log`, `setup.exit`.
2. `node node_modules/playwright/cli.js install --with-deps chromium` — first attempt stopped with `su: Authentication failure`; see `browser-setup/install-with-deps-limitation.log` and `.exit`.
3. `node node_modules/playwright/cli.js install chromium` — locked Chromium 145.0.7632.6 download succeeded; see `browser-setup/playwright-install.log` and `.exit`. A later invocation confirmed it was already installed.
4. `npm run check` — `check.log`, `check.exit`.
5. `CIVICMAPS_CADDY_BINARY=... node tests/ingress-contract.mjs` — `ingress-contract.log`, `.exit`.
6. `CIVICMAPS_CADDY_BINARY=... node tests/ingress-login.mjs` — `ingress-login.log`, `.exit`.
7. `npm run audit:dependencies` without network permission — initial failure preserved in `audit-initial.log`, `audit-initial.exit`, `audit-initial/{production,all}.json`.
8. `npm run audit:dependencies` with registry connectivity — successful reports in `audit-success.log`, `audit-success.exit`, `audit-success/{production,all}.json`.
9. `npm run test:map:browser` — `map-browser.log`, `.exit`.
10. `npm run test:platform:browser` — `platform-browser.log`, `.exit`.
11. `npm run test:commandmaps:browser` — `commandmaps-browser.log`, `.exit`.
12. `npm run test:activation:browser` — `activation-browser.log`, `.exit`.
13. `git diff --exit-code -- apps/commandmaps/src/tokens.css apps/civicmaps-platform/src/tokens.css` — `token-consistency.log`, `.exit`.
14. Playwright Chromium, system Chromium, Caddy, Node/npm, installed package and PostgreSQL versions were recorded in `provenance.log`.

The two ingress checks and all database integration/browser commands used only the named isolated synthetic R4 database/container. No hosted workflow was run here.
15. A sandbox-only Playwright launch failed with a host namespace restriction; the captured failure is `browser-setup/browser-launch-unprivileged-failure.log`. The permitted-path launch (`node --input-type=module -e "import { chromium } from '@playwright/test'; const b=await chromium.launch({headless:true}); console.log('Playwright Chromium version', await b.version()); await b.close();"`) passed, with version and exit in `browser-setup/browser-launch-passed.{log,exit}`. The exact `install --with-deps` privilege limitation is in `browser-setup/install-with-deps-limitation.{log,exit}`.
