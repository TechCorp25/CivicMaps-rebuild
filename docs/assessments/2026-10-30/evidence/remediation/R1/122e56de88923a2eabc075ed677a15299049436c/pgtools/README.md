# Task-local PostgreSQL client wrappers

These scripts are test-environment adapters, not product code. They exist because this host has no PostgreSQL client tools and apt cannot install them. They forward CLI calls into the builder's dedicated PostgreSQL 15.18 synthetic container `civicmaps-r1-checker-122e56de`; `pg_dump` streams an archive to the test's local temporary file, and `pg_restore` copies that temporary archive into the container before restoring. Database connections are rewritten to the container's loopback port 5432. They contain no credentials; the container uses loopback-only trust authentication with synthetic fixtures.

For an equivalent reproduction, copy this directory to a temporary directory and place it first in `PATH`. Run from the repository root with the unique base connection below:

```sh
npm run setup
PATH=/tmp/civicmaps-r1-pgtools:$PATH CIVICMAPS_DATABASE_URL=postgres://civicmaps_checker@127.0.0.1:55461/civicmaps_checker PLAYWRIGHT_BROWSERS_PATH=/tmp/civicmaps-r1-builder-browsers npm run check
```

The checkout tests create and remove uniquely named disposable databases through the supplied base connection. The wrapper sources are included so an auditor can inspect the adapter and reproduce the environment. The synthetic Vite deny-path smoke can be rerun with `node docs/assessments/2026-10-30/evidence/remediation/R1/vite-fs-smoke.mjs`. Native PostgreSQL 15 client binaries may be used instead.
