# R1 environment setup attempts

These attempts are preserved to distinguish missing host utilities from product failures.

## First `npm run check`

Command environment: `CIVICMAPS_DATABASE_URL=postgres://civicmaps_builder@127.0.0.1:55461/civicmaps_builder`, `PLAYWRIGHT_BROWSERS_PATH=/tmp/civicmaps-r1-builder-browsers`, no PostgreSQL client wrapper directory in `PATH`; command `npm run check`; exit 1. The saved `initial-check.log` shows 112/114 tests passing and these two failures:

- `tests/release-backup.test.mjs`: spawned `pg_dump` yielded status `null`, expected 0.
- `tests/routing-release.test.mjs`: private control backup `pg_dump` yielded status `null`, expected 0.

Neither assertion reports a product mismatch; the host had no `pg_dump`, `pg_restore`, `createdb`, `dropdb` or `psql` on `PATH`.

## Package-manager attempt

Command: `apt-get update && apt-get install -y postgresql-client-15`; exit 100. It could not update the host package index: `E: List directory /var/lib/apt/lists/partial is missing. - Acquire (13: Permission denied)`. PostgreSQL 15 client binaries from the dedicated database container were used through the transparent wrappers included in this packet instead.

## Task-local wrapper checks

The supplied wrappers were inspected and used only for tests against `civicmaps-r0-builder-20261031`, the unique PostgreSQL 15.18 loopback-only synthetic container. `pg_dump` writes a local temporary test archive from container stdout; `pg_restore` copies a local temporary archive into the container; database utility calls execute inside the container. No wrapper points to a non-synthetic or remote target. The final full check and focused backup/restore rerun passed with the wrappers active. The first failed run remains preserved above.
