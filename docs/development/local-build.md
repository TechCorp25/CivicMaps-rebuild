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

| Account                    | Access                                                    |
| -------------------------- | --------------------------------------------------------- |
| `dispatch@alpha.example`   | Create, assign and close in Alpha's parking context       |
| `officer@alpha.example`    | Read assigned requests, acknowledge and record attendance |
| `supervisor@alpha.example` | Read-only review in Alpha's parking context               |
| `dispatch@beta.example`    | Separate Beta context                                     |
| `officer@beta.example`     | Separate Beta officer                                     |

These are development credentials, not an identity-provider integration. The isolated local database uses loopback trust authentication and must contain synthetic data only.

## Filesystem and configuration

The ChromeOS USB filesystem does not preserve the permissions required by PostgreSQL or the esbuild executable. Database files therefore live under `~/.local/share/civicmaps-local/postgres`, outside the source tree and across process restarts. `CIVICMAPS_DATA_DIR` can choose another Linux filesystem directory; `CIVICMAPS_PG_BIN` chooses PostgreSQL binaries. `CIVICMAPS_PG_PORT` changes the database port; also change `CIVICMAPS_DATABASE_URL` to match.

Installation uses `npm ci` and the committed root lockfile. It disables bin links and package install scripts. The pinned Rollup backend uses WebAssembly. The Vite wrapper copies the pinned esbuild binary into a private temporary Linux directory and gives it executable permissions. Source, lockfile, assets and build output stay on the USB drive. This wrapper currently targets Linux x64.

`CIVICMAPS_DATABASE_URL` overrides the isolated database connection. Migration and seed commands are explicit writes to that destination; use only the dedicated local development database. A fresh empty database can run the migration step without a profile. A populated database upgrading the synthetic fixture must explicitly set `CIVICMAPS_MIGRATION_PROFILE=synthetic-fixture` for `npm run db:migrate`; migrations abort on populated databases without this selector, and the selector does not authorize or map customer data. `CIVICMAPS_API_PORT` changes the API port (also update the Vite proxy). `CIVICMAPS_ORIGINS` lists allowed browser mutation origins; the default allows localhost/127.0.0.1 on ports 5173 and 5174.

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

| Method and path                  | Behaviour                                                                                                                                                                                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET `/api/health`                | Database readiness                                                                                                                                                                                                                                              |
| POST `/api/auth/login`           | Email/password login, opaque session cookie                                                                                                                                                                                                                     |
| GET `/api/auth/session`          | Current actor and CSRF token                                                                                                                                                                                                                                    |
| POST `/api/auth/logout`          | Revoke session                                                                                                                                                                                                                                                  |
| GET `/api/officers`              | Officers in the actor's permitted context                                                                                                                                                                                                                       |
| GET `/api/requests`              | Scoped 100-row page with status and keyset cursor; optional case-insensitive literal `q` search for request number/address (max 250 characters); first-page counts cover the authorised search scope before status/paging. Officers see only assigned requests. |
| GET `/api/requests/:id`          | Independently read one scoped request, including when it is outside the loaded queue pages; inaccessible requests return 404                                                                                                                                    |
| GET `/api/intake-destinations`   | Receiving contexts granted to the dispatcher in the same council, filtered by enabled request capability and supported intake schema                                                                                                                            |
| POST `/api/requests`             | Create from confirmed address/coordinates, notes, a server-authorised destination context and a versioned department payload                                                                                                                                    |
| POST `/api/requests/:id/actions` | Assign, acknowledge, attend or close with current version                                                                                                                                                                                                       |
| GET `/api/requests/:id/audit`    | Read-only scoped audit events, tied to the independently selected request/context                                                                                                                                                                               |

Authenticated mutations require `x-csrf-token`; operational writes also require `Idempotency-Key`. Reusing a key with a different operation returns 409. Stale versions return 409. Out-of-scope object access returns 404. Unknown fields, client-issued numbers and client-selected ownership are rejected.

Department-aware request creation records source/destination provenance and preserves historical untyped rows. Automatic assignment is not available until authoritative area and signed-on duty eligibility sources are configured; new department requests remain visibly unassigned. See the [D3 implementation status](../plans/dispatch-d3/implementation-status-2026-10-29.md).

## Continuous integration

`.github/workflows/ci.yml` uses the committed Node version and npm 11.9.0, installs with `npm ci`, and runs `npm run check` against a pinned disposable PostgreSQL 15 service. It verifies generated token files remain unchanged, then runs the CommandMAPS, Platform, and first-admin activation browser suites sequentially. The CommandMAPS browser entry executes the shared-discovery checks. A separate [dependency advisory workflow](../security/dependency-audits.md) audits both the production-only and complete lockfile trees on pull requests, pushes, weekly, and on demand. Browser artifacts include desktop and narrow screenshots. Scaffold applications are excluded; native-device checks remain separate acceptance work.

When using an already running dedicated PostgreSQL instance, set `CIVICMAPS_DATABASE_URL` before `npm run check`; skip `db:start`. The test login needs permission to create/drop only its uniquely named disposable databases. Never point these commands at production. A writable npm cache can be selected with `npm_config_cache` in restricted workspaces.

## Code quality gates (F02Q)

`npm run check` runs lint (zero warnings), formatting verification, both app typechecks/builds and the API suite. CI invokes the same command followed by the CommandMAPS, Platform and activation browser suites. Run `npm run format` to apply formatting; `npm run format:check` is read-only.

ESLint flat configuration covers implemented CommandMAPS/Platform TypeScript, API JavaScript, active scripts and tests. Recommended JavaScript/TypeScript rules and both runtime React Hooks rules are enabled; React Compiler-specific rules and type-aware linting are not enabled. TypeScript compilation remains a separate gate. Prettier handles layout separately, using two spaces, single quotes and a 100-column target. No conflicting stylistic lint preset is installed.

Formatting scope is explicit in the root scripts. Archives, scaffold applications, generated tokens, build output and GIS data/tools are excluded. New implemented files must be added to these scopes when needed. Tool entry points use `node node_modules/...` because setup deliberately disables executable links.

The shared test environment in `tests/helpers/environment.mjs` creates one unique disposable database per process, starts its API and closes resources on setup failure and teardown. Do not create a second environment in the same process: the API database module caches its pool. Separate test files run in isolated Node test processes. Never use the configured base database for fixture writes.

## Request database and password work budgets (Q2)

The request PostgreSQL pool allows ten clients, waits at most 1,000 ms to acquire
one, uses a 1,000 ms lock timeout and a 5,000 ms server-side statement timeout.
Migrations and seeding use a separate two-client maintenance pool with 10,000 ms
acquisition, 30,000 ms lock and 120,000 ms statement budgets; these longer DDL
allowances do not consume request pool connections. On the synthetic local
workload, 50 read-only indexed counts at concurrency ten had a maximum of
23.5 ms. The one-second checkout/lock budget is about 42 times that maximum and
the five-second statement budget is over 200 times it. These are local test
budgets, not a production latency or throughput guarantee. Transient database
timeouts and unavailable connections return a generic retryable 503 with
`Retry-After: 1`.

The request error mapper also recognizes the pinned `pg-pool` message
`Connection terminated due to connection timeout` (a socket that accepts TCP but
does not finish the PostgreSQL startup handshake) and the `pg` client message
`Client has encountered a connection error and is not queryable` after a checked
out backend dies. The handshake fixture checks 503 plus `Retry-After: 1`; the
backend fixture verifies the exact non-queryable error is transient and the
shared pool recovers after discarding the client. The handshake fixture uses a
stalled loopback TCP socket only; it does not simulate a production database or
network.

Password derivation and verification use asynchronous Scrypt with a shared
two-operation admission limit, leaving two workers of Node's default four
libuv workers available to unrelated work. Saturation returns a generic
retryable 503 instead of queueing unbounded work. Existing hashes remain
`32-hex-salt:128-hex-derived-key`; damaged stored values fail as generic login
errors and emit only a fixed integrity log message. The synthetic 12-request
login burst measured the lightweight health endpoint at 20.3 ms, within the
250 ms test budget. Reproduce database and async password measurements with
`node scripts/measure-q2-baseline.mjs` against an already seeded synthetic
database. Raw Q2 checks and workload outputs are retained in
`docs/assessments/2026-10-24/evidence/`.

## Municipality context binding (F03)

Migration 004 and the synthetic seed establish explicit municipality bindings and user grants. The principal-ownership slice binds each synthetic principal to one council; `shared@alpha.example` remains one Alpha principal, and its old synthetic Beta grant is retired only by the explicitly selected, canonical-fixture migration path. Read the [context contract](operating-context.md) before testing expiry, revocation, upgrade or retry behaviour.

## Durable synthetic provisioning (F04)

New registrations enqueue durable jobs. Start the separate worker with `npm run worker:provisioning`; use `-- --once` for a single eligible step. Jobs remain queued while the worker is paused. Read the [job/recovery contract](provisioning-jobs.md) for leases, retry/reconcile, synthetic limitations and rollback. `npm run test:provisioning` is included in the full integration suite and CI.

F05 resource configuration, cloud acceptance and retention/rollback are documented in [data resources](data-resources.md). `npm run test:commandmaps:browser` creates a disposable control database and starts its own Vite/API harness; run it sequentially with the Platform browser check.
