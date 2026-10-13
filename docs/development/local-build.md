# CivicMAPS local foundation build

Started 13 October 2026. The user's current instruction removes historical governance documentation and ADR approval gates from this development/build. The design system remains the visual reference; workflow documents supply behaviour, with implementation gaps recorded explicitly.

## Run locally

From the project root, with the Node version in `.node-version`, npm 11.9.0 and PostgreSQL 15 binaries installed (the manifest minimum remains Node 20.19):

```bash
npm run setup
npm run db:start
npm run db:migrate
npm run db:seed
npm run dev
```

Open CommandMAPS at http://127.0.0.1:5173 and Platform at http://127.0.0.1:5174. The API listens on 127.0.0.1:4100. All bind to loopback. `npm run dev:platform` runs only Platform and the API. Stop the application with Ctrl+C; stop the isolated database with `npm run db:stop`.

Synthetic accounts use `CivicMAPS-local-2026!` unless `CIVICMAPS_DEMO_PASSWORD` was set before the first seed. Seeding again preserves existing users/passwords and operational records:

| Account | Access |
| --- | --- |
| `dispatch@alpha.example` | Create, assign and close in Alpha's parking context |
| `officer@alpha.example` | Read assigned requests, acknowledge and record attendance |
| `supervisor@alpha.example` | Read-only review in Alpha's parking context |
| `dispatch@beta.example` | Separate Beta context |
| `officer@beta.example` | Separate Beta officer |

These are development credentials, not an identity-provider integration. The isolated local database uses loopback trust authentication and must contain synthetic data only.

## Filesystem and configuration

The ChromeOS USB filesystem does not preserve the permissions required by PostgreSQL or the esbuild executable. Database files therefore live under `~/.local/share/civicmaps-local/postgres`, outside the source tree and across process restarts. `CIVICMAPS_DATA_DIR` can choose another Linux filesystem directory; `CIVICMAPS_PG_BIN` chooses PostgreSQL binaries. `CIVICMAPS_PG_PORT` changes the database port; also change `CIVICMAPS_DATABASE_URL` to match.

Installation uses `npm ci` and the committed root lockfile. It disables bin links and package install scripts. The pinned Rollup backend uses WebAssembly. The Vite wrapper copies the pinned esbuild binary into a private temporary Linux directory and gives it executable permissions. Source, lockfile, assets and build output stay on the USB drive. This wrapper currently targets Linux x64.

`CIVICMAPS_DATABASE_URL` overrides the isolated database connection. Migration and seed commands are explicit writes to that destination; use only the dedicated local development database. `CIVICMAPS_API_PORT` changes the API port (also update the Vite proxy). `CIVICMAPS_ORIGINS` lists allowed browser mutation origins; the default allows localhost/127.0.0.1 on ports 5173 and 5174.

## Implemented unit

React/TypeScript/Vite CommandMAPS shell and Express/PostgreSQL API, generated canonical colour tokens and local DM Sans, opaque HttpOnly sessions, CSRF protection, scoped users/requests/audit, immutable server-issued request identifiers, transactional audit, idempotent writes and version conflict checks. The local foundation lifecycle is Received → Dispatched → Acknowledged → Attended, with administrative closure. A supervisor fixture has read-only access; this does not implement the complete supervisor/RBAC matrix.

This is the first Goal 2 foundation slice. Goal 2 remains open for native mobile, the complete role model and broader isolation/accessibility coverage. Goal 3 remains open for evidence/outcomes, canonical GIS/provider maps, realtime dispatch/presence, durable offline storage/synchronisation and device demonstration. Request numbers are sequential development identifiers, not the historical seven-digit permutation scheme. No infringement issuance or penalty catalogue is implemented. Other application/domain manifests remain historical placeholders and are excluded from the root build.

## Validation commands

```bash
npm run check
npm run test:browser
```

`check` typechecks/builds CommandMAPS and Platform and runs API integration tests. Integration tests create and remove only a uniquely named disposable database on the configured PostgreSQL instance; they never reset the development database. Browser checks require `npm run dev`, a seeded development database and the matching Playwright Chromium build. If missing, install it with `node node_modules/playwright/cli.js install chromium`.

Browser exercise records remain labelled synthetic and closed in the development database. Screenshots are written to `test-results/`. Validation results and limitations are recorded separately after execution.

## API surface

| Method and path | Behaviour |
| --- | --- |
| GET `/api/health` | Database readiness |
| POST `/api/auth/login` | Email/password login, opaque session cookie |
| GET `/api/auth/session` | Current actor and CSRF token |
| POST `/api/auth/logout` | Revoke session |
| GET `/api/officers` | Officers in the actor's permitted context |
| GET `/api/requests` | Most recent 100 scoped requests; officers see their assignments |
| POST `/api/requests` | Create from address, coordinates and notes |
| POST `/api/requests/:id/actions` | Assign, acknowledge, attend or close with current version |
| GET `/api/requests/:id/audit` | Read-only scoped audit events |

Authenticated mutations require `x-csrf-token`; operational writes also require `Idempotency-Key`. Reusing a key with a different operation returns 409. Stale versions return 409. Out-of-scope object access returns 404. Unknown fields, client-issued numbers and client-selected ownership are rejected.

## Continuous integration

`.github/workflows/ci.yml` uses the committed Node version and npm 11.9.0, installs with `npm ci`, and runs `npm run check` against a pinned disposable PostgreSQL 15 service. It verifies generated token files remain unchanged. This covers CommandMAPS, Platform and the current API suite; scaffold applications are excluded. Browser and native-device checks are separate acceptance work.

When using an already running dedicated PostgreSQL instance, set `CIVICMAPS_DATABASE_URL` before `npm run check`; skip `db:start`. The test login needs permission to create/drop only its uniquely named disposable databases. Never point these commands at production. A writable npm cache can be selected with `npm_config_cache` in restricted workspaces.

## Code quality gates (F02Q)

`npm run check` runs lint (zero warnings), formatting verification, both app typechecks/builds and the API suite. CI invokes the same command, followed by the platform browser check. Run `npm run format` to apply formatting; `npm run format:check` is read-only.

ESLint flat configuration covers implemented CommandMAPS/Platform TypeScript, API JavaScript, active scripts and tests. Recommended JavaScript/TypeScript rules and both runtime React Hooks rules are enabled; React Compiler-specific rules and type-aware linting are not enabled. TypeScript compilation remains a separate gate. Prettier handles layout separately, using two spaces, single quotes and a 100-column target. No conflicting stylistic lint preset is installed.

Formatting scope is explicit in the root scripts. Archives, scaffold applications, generated tokens, build output and GIS data/tools are excluded. New implemented files must be added to these scopes when needed. Tool entry points use `node node_modules/...` because setup deliberately disables executable links.

The shared test environment in `tests/helpers/environment.mjs` creates one unique disposable database per process, starts its API and closes resources on setup failure and teardown. Do not create a second environment in the same process: the API database module caches its pool. Separate test files run in isolated Node test processes. Never use the configured base database for fixture writes.

## Municipality context binding (F03)

Migration 004 and the synthetic seed establish explicit municipality bindings and user grants. Existing Alpha/Beta accounts each retain one default context. `shared@alpha.example` is an API shared-service fixture with two contexts and requires `X-CivicMAPS-Context`; the web client does not yet provide a context chooser. Read the [context contract](operating-context.md) before testing expiry, revocation, upgrade or retry behaviour.
