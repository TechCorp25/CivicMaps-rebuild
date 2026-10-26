# Dependency advisory checks

`npm run audit:dependencies` queries the npm advisory database for the exact
committed lockfile in two scopes: production dependencies (`npm audit --omit=dev`)
and the complete dependency tree (`npm audit`). Both reports are retained as JSON
under `test-results/dependency-audit/` by default. Set
`CIVICMAPS_AUDIT_OUTPUT_DIR` to retain reports in another directory. CI treats high and critical findings as blocking. Low and moderate findings are
non-blocking but are reported in the job log and must be reviewed from the retained
JSON reports. Each report records package severity, directness, affected range and
resolved lockfile paths. The production-only report identifies runtime reachability
separately from development tooling.

The advisory workflow also runs weekly and on demand. Its artifact preserves both
lockfile-matched reports for review. The workflow does not update dependencies or
rewrite the lockfile.

## Reviewed false-positive procedure

Do not add an ignore list, lower the severity threshold, or commit a `npm audit
fix` result that changes the lockfile without review. If a report appears incorrect,
record its advisory identifier, package and locked version, affected range, both
production and full-tree report outcomes, the vendor or upstream evidence, and a
reproduction or reachability analysis. A maintainer other than the change author
must review and approve the disposition. Correct the dependency graph where
possible, then rerun both scopes against the committed lockfile. If the advisory is
formally withdrawn or its affected range is corrected upstream, preserve the
relevant vendor notice and report in the review record. Until that evidence is
available, the CI finding remains blocking; do not suppress it as an exception.
