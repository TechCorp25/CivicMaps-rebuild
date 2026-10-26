Q1 task contract v1.0.0

### Q1 — Remove the known vulnerable parser and add advisory visibility

Covers QA01 and QA18's dependency-audit portion. Start here. Dependencies: none.

1. Refresh the committed lockfile to resolve compatible `body-parser >=2.4.0`, verify
   the actual installed Express tree, and keep unrelated dependency changes out.
   If compressed JSON is not required, consider explicitly rejecting it as additional
   defence; do not silently change a supported request format.
2. Add a child-process HTTP regression under `tests/` for malformed and compressed
   input. Assert the intended HTTP result, process survival and a subsequent healthy
   request. Run it through the existing nested test discovery. Keep all requests on
   the disposable harness, with bounded duration and no live-service probing.
3. Add read-only advisory checks to CI and a scheduled advisory review. Define an
   explicit reviewed-exception procedure for future false positives, rather than
   muting audit failures. Use lockfile-matched data and distinguish production from
   development reachability in reports.

Acceptance: clean `npm run setup`; patched dependency tree; relevant audit finding
absent; compressed-input regression passes; full `npm run check`, three browser
suites and Caddy checks pass. Persist the advisory, exact lockfile diff and audit
output. Current negative crash probes do not replace the new regression requirement.

Rollback: revert the isolated dependency change if it causes regression, but retain
the advisory and choose a tested safe parser configuration before any release.


Authoritative constraints: preserve tenant/session authority, revocation ordering, idempotency, lost-response recovery, token drift and nested test discovery. Use synthetic disposable databases and loopback HTTP only. No live dataset regeneration, AWS mutation, merge or deploy. Baseline: ea76b23f15b0d13feada592a88b14b587f8b12de. All newly added tests belong under tests/. Historical bounded parser probes did not reproduce a crash. Assess source/tests/product docs independently; product docs are not proof of correctness.

Required report: task/version, actual model/effort, fresh context mechanism, base/candidate SHA, manifest/hashes, checks actually run and results, severity/location/reproduction findings, unverified requirements, limitations, timestamp and verdict pass/changes_required/blocked. No hidden reasoning requested.
