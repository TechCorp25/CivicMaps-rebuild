# CivicMAPS Platform

Web-based ecosystem management for platform operators, derived from wireframes S12–S15. This is the first local development slice, built with the existing React/TypeScript/Vite and Express/PostgreSQL stack.

## Run

From the repository root, with Node.js 20.19+ and PostgreSQL installed:

```bash
npm run setup
npm run db:start
npm run db:migrate
npm run db:seed
npm run dev:platform
```

Open http://127.0.0.1:5174. The shared API runs on port 4100. `npm run dev` starts both CommandMAPS (5173) and Platform (5174). The platform app uses the dependencies installed at the repository root.

Synthetic operator: `operator@platform.example`, password `CivicMAPS-local-2026!` (or `CIVICMAPS_DEMO_PASSWORD` at first seed). Re-seeding preserves existing passwords and configuration. These accounts and the loopback-only database are for synthetic local development.

For PostgreSQL installations outside `/usr/lib/postgresql/15/bin`, set `CIVICMAPS_PG_BIN`. `CIVICMAPS_DATA_DIR` selects a writable Linux data directory. See [local build instructions](../../docs/development/local-build.md) for database configuration.

## Implemented

| Wireframe | First slice |
| --- | --- |
| S12 | Operator sign-in; global shell; searchable, status-filtered municipality directory; council overview |
| S13 | Four-step onboarding: identity, eight domain packs, first admin, review; server-side slug availability and uniqueness; immutable slug; one-response temporary password |
| S14 | Persisted pack assignment; removal confirmation; retained records; configuration audit; target sandbox-boundary explainer |
| S15 | Sortable cross-council usage/health table; calculated network totals; degraded signal drill-in; explicitly synthetic metric snapshots |

Platform identities and session cookies are separate from council identities. The platform database role can access control-plane tables but cannot read operational service requests. Council roles receive no access to platform tables. Mutations require CSRF verification, have idempotency receipts, and write transactional audit records. Pack changes use optimistic version checks. Temporary passwords are hashed; plaintext is excluded from audit and retry receipts and is not returned again on replay.

## Current boundaries

Onboarding registers configuration and a pending first-admin record. New municipalities remain **Provisioning**. Dedicated tenant schemas, file storage, subdomain routing, council admin activation, credential recovery, and live infrastructure provisioning are not implemented. The review action therefore says **Register municipality**, rather than claiming a live sandbox was provisioned.

Pack changes persist configuration; enforcement in CommandMAPS and EnforcementMAPS remains to be integrated. Health and open-workload data come from labelled synthetic fixtures, not live telemetry or operational queries. Unknown workloads are shown as unknown. Crest uploads and council organisation/team editing remain future work. The municipality registry is not a replacement for the broader tenant/organisation/jurisdiction/authority-realm model.

The wireframes propose a platform entry domain but the handoff leaves that hosting decision unresolved; local port 5174 does not settle the deployment boundary.

## API

All endpoints are under `/api/platform`:

| Method | Path | Behaviour |
| --- | --- | --- |
| POST | `/auth/login` | Platform operator authentication |
| GET | `/auth/session` | Restore operator session |
| POST | `/auth/logout` | Revoke session |
| GET | `/municipalities` | Directory, pack catalogue and metric snapshots |
| GET | `/slug-availability?slug=…` | Validate and check slug availability |
| GET | `/municipalities/:id` | Overview, workload snapshots and configuration audit |
| POST | `/municipalities` | Register onboarding and pending first admin |
| POST | `/municipalities/:id/packs` | Enable/disable a pack with current version |

## Validation and references

`npm run typecheck` and `npm run build` cover both web apps. `npm test` runs foundation and platform API acceptance cases against disposable databases. `npm run test:platform:browser` creates its own disposable database and ephemeral API/Vite servers, then verifies registration, reload, pack confirmation/cancellation, audit, error recovery, health, keyboard use and narrow layout in Chromium. It needs a running dedicated PostgreSQL instance and the matching Playwright Chromium installation. Screenshots are saved under `test-results/`; the database is removed after the run. CI runs both suites.

- [S12 — Shell and municipality directory](../../docs/wireframes/screens/Wireframes%20S12%20-%20Platform%20Admin%20Shell%20and%20Municipality%20Directory.dc.html)
- [S13 — Onboarding wizard](../../docs/wireframes/screens/Wireframes%20S13%20-%20Onboarding%20Wizard.dc.html)
- [S14 — Domain packs and sandbox model](../../docs/wireframes/screens/Wireframes%20S14%20-%20Domain%20Pack%20Assignment%20and%20Sandbox%20Model.dc.html)
- [S15 — Usage and health](../../docs/wireframes/screens/Wireframes%20S15%20-%20Cross-council%20Usage%20and%20Health%20Dashboard.dc.html)
- [Wireframe decisions and open questions](../../docs/handoff.md)

The README referenced in the original request was absent from this checkout; this implementation README was created from S12–S15 with the user's confirmation.


F03 adds explicit effective operating-context bindings and user grants between the registry and council operations. See the [context contract](../../docs/development/operating-context.md). Registry onboarding does not automatically grant operational access; provisioning and admin activation remain separate planned features.

F04 atomically enqueues a durable synthetic job during registration. Municipality detail shows steps, attempts and recovery controls; the separate worker resumes expired leases and reconciles saved effects. Simulation success leaves real provisioning/admin activation pending. See the [job contract](../../docs/development/provisioning-jobs.md).
