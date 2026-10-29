# Dispatch CI repair — 29 October 2026

## Cause and correction

The failed Foundation checks (runs [40871578449](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/40871578449) and [40871569830](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/40871569830)) exposed three related issues:

- Migration `016-department-aware-intake.sql` was present but absent from the production migration sequence. Requests then failed against the missing `origin_binding_id` column. The migrator now applies and records migration 016.
- A few existing API test fixtures still used the old request payload and omitted `destinationContextId` and `packageData`. Those fixtures now use the current intake contract.
- Migration-ledger assertions now account for all 16 registered migrations.

## Verification

`npm run lint`, `npm run format:check`, `git diff --check`, typechecking and both production builds pass locally. The full local `npm run check` cannot complete its PostgreSQL-backed suites because the configured local PostgreSQL endpoint is unavailable. Exact-head hosted CI is required to verify database migrations and integration tests.
