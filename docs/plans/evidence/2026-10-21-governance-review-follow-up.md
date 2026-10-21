# Governance PR25 review follow-up — 21 October 2026

The three Codex findings against `c4d99da` are valid and already corrected in
`ce73e3231ed5ebeb50fee5fbaf613541633f6dc5`:

- Legacy NULL-owned sessions are consolidated before ownership backfill, retaining
  the longest-lived session (token hash breaks ties). Existing owned sessions take
  precedence. `tests/council-principal-ownership-migration.test.mjs` covers the upgrade.
- Scheduled refreshes skip an active cursor walk; the active count is released in
  `finally`. `tests/browser/queue-refresh.mjs`, invoked by CommandMAPS acceptance,
  checks a page delayed beyond the refresh interval and a late-page record.
- Complete actor-scoped counts run only on the first page. The foundation API suite
  checks counts are omitted on subsequent active/all cursor pages.

The exact-head PR run 39559328495 passed, but push run 39559323757 failed in
admin activation setup: concurrent migrations attempted to create the shared
`civicmaps_platform_app` PostgreSQL role (`23505`, `pg_authid_rolname_index`).
Database-local advisory locks cannot serialise role creation across databases.

The follow-up makes all three migration role-creation blocks tolerate a competing
creator only when the intended role now exists. Other failures still propagate;
existing roles and grants are not broadened. The regression in
`tests/migrations/role-creation.test.mjs` holds an uncommitted synthetic role,
observes the competing CREATE waiting on a lock, commits the winner, and verifies
successful recovery, rerun and role attributes. It uses unique disposable role
names and leaves application roles untouched. Root test discovery now includes
nested suites, also covering CI through `npm run check`.

Local lint, formatting, both TypeScript checks, both production builds and diff
whitespace checks passed. PostgreSQL is absent locally and package installation
is unavailable to this environment user; database and browser validation are
therefore delegated to the new exact-head hosted runs. Their final results are
recorded on PR25. This follow-up does not merge or deploy the branch.
