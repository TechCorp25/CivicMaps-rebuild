# R4 synthetic PostgreSQL client wrappers

The R4 host has no PostgreSQL CLI binaries. These inspectable wrappers forward the CLI calls used by tests to the dedicated container `civicmaps-r4-builder-20261031`, running PostgreSQL 15.18 with synthetic-only fixtures. The container is bound only to `127.0.0.1:55481`, uses trust authentication, and has no customer or production data. A `docker` CLI is required.

For test commands, put this directory first on `PATH` and set `PGUSER=civicmaps_r4_builder`, `PGDATABASE=civicmaps_r4_builder`, and `CIVICMAPS_DATABASE_URL=postgres://civicmaps_r4_builder@127.0.0.1:55481/civicmaps_r4_builder`.
