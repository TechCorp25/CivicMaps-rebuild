# Pre-build quality remediation plan

Version: 1.0.0. Date: 24 October 2026. Status: proposed work, not implemented.
Baseline: `main@346dfd2d74cdd52d88bf9e4b7bd046a500a4c390`.
Assessment: [report](assessment.md); complete issue index: [findings.json](findings.json).

## Objective and boundaries

Address all 18 validated issues before the next feature build, starting with the
affected production dependency. This is engineering quality assurance and adds no
governance block. Keep the accepted M1 behaviour and current council/operator
authority intact. Do not use this work to invent G1/G2 commissioning policy,
implement deferred product features, alter live data, or deploy infrastructure.
Read current main and the existing phase contracts again when implementation starts;
the baseline above identifies the review, not permission to ignore later changes.

Use one work package in progress at a time. Each package gets a fresh focused branch,
a failing acceptance case where meaningful, implementation, relevant tests, updated
documentation/Empirical, verified publication, and an independent product assessment.
Follow the repository's assigned builder/auditor roles for the applicable build
phase. The independent auditor receives frozen requirements, exact base/candidate
SHAs, product and raw evidence with fresh context. Publication is not acceptance;
merge and deployment follow existing owner authority and release procedures.

## Ordered work packages

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

### Q2 — Bound server work and preserve safe authentication

Covers QA02, QA03 and QA17. Dependencies: Q1 accepted for the baseline used.

1. Define explicit pool-acquisition, statement and lock budgets from local workloads
   and infrastructure constraints. Separate migration/provider maintenance budgets
   from request budgets where necessary. Use server-side cancellation where work
   must actually stop; a rejected JavaScript promise alone is insufficient.
2. Map transient database unavailability/timeouts to safe retryable responses;
   verify rollback and client reuse/destruction after timeout. Preserve shared-lock
   revocation ordering, transaction-local role/context settings and receipt atomicity.
3. Convert password derivation/verification to asynchronous operations with bounded
   admission and safe overload responses. Keep dummy verification for unknown users,
   current hash compatibility, identity/client throttling and the under-lock recheck.
4. Validate stored credential format before comparison. Damaged hashes must reject
   safely and produce a sanitised integrity signal without leaking hash material.

Acceptance: synthetic tests hold pool clients/row locks and confirm bounded failure,
cleanup and healthy subsequent work; cancellation cannot commit half an operation.
Concurrent auth load must leave an unrelated lightweight endpoint responsive within
a documented measured budget. Valid and invalid credentials, unknown users,
malformed stored hashes, disable/revocation races and existing hashes remain correct.
Rerun existing resource-admission and database-pool tests plus the full gate.

Rollback: retain old hash readability. Do not deploy format-incompatible credentials
or remove concurrency protections to recover performance. No destructive migration
is expected.

### Q3 — Make browser recovery and acceptance deterministic

Covers QA04, QA08 and QA09. Dependencies: Q2 response contract agreed.

1. Instrument the intermittent M1 case by exact selected request ID, operation and
   generation. Control periodic/focus scheduling and response gates. Keep denial
   active through the intended assertion. Identify whether any residual failure is
   in product state handling or the test, and fix the demonstrated cause.
2. Extract a small shared transport primitive, or parallel explicit helpers with the
   same tested response contract, while retaining separate API prefixes/auth policy.
   Preserve HTTP status for JSON, malformed JSON, HTML, empty bodies and network
   errors. Never display raw upstream HTML.
3. Give queue/detail/history/directory/login/activation/mutation calls bounded
   lifetimes and cancellation. Ignore stale outcomes after selection, context or
   session changes. Retain retry keys and reconciliation for uncertain writes.

Acceptance: deterministic delayed/out-of-order/denied-detail cases, HTML 401/403/503,
empty/malformed bodies, timeout, cancellation, offline retry and server-committed
lost-response tests. Assert spinner/button recovery and no stale actionable detail.
Run the focused race cases repeatedly with controlled schedules, then all browser
suites without masking failures through retries. A passing rerun alone does not close
QA04. New executable tests belong under the appropriate `tests/` directory and must
be invoked locally and in CI.

Rollback: preserve existing API shape and idempotency semantics. Revert transport
extraction independently if necessary; retain reproductions and safe error handling.

### Q4 — Restore reliable GIS ingestion and reproducibility

Covers QA05, QA10, QA11 and QA12. Dependencies: no product-policy decision; sequence
after Q3 to maintain one work package in progress. No external regeneration required.

1. Declare supported Python and dependency versions using the repository's chosen
   reproducible dependency mechanism. Add an explicit isolated Ruff configuration.
   Correct the three baseline diagnostics; assess stricter rules separately.
2. Require street-name/approved-alias agreement. Put unmatched addresses into a
   review/unassigned collection with their source street and reason.
3. Replace vertex averaging with a documented geometry rule. Cover ring closure,
   resampling, concavity, holes, multipolygons, zone edges and overlap ties. Document
   how roads spanning more than one zone are represented.
4. Add JS fetch deadlines, shape checks, counted rejection reasons and atomic output
   writes. Preserve the existing good output on fetch/parse/validation failure.
   Python's existing HTTP deadlines must remain.

Acceptance: a fresh environment installs declared GIS dependencies; real geometry
fixtures reproduce then prevent the two observed assignment defects. Delayed/invalid
provider fixtures produce bounded failures and useful rejection totals without
overwriting existing output. Tests run offline in ordinary CI. Any later live-data
regeneration is a separately reviewed data change with provenance, counts, coordinate
bounds and representative street/zone comparisons; do not silently rewrite committed
datasets during these code corrections.

### Q5 — Extend checks to active code and remove misleading setup surfaces

Covers QA06, QA13, QA14 and QA18's Python/infrastructure portions. Dependencies: Q4's
Python contract established.

1. Enumerate active first-party imports, including the domain lifecycle and the
   imported design-system component. Extend ESLint/format scope precisely; keep
   archive imports, generated tokens and output datasets outside blanket rewrites.
2. Make scaffold manifests explicitly unimplemented or supply real commands when
   the package is implemented. Remove absent GIS package entry points unless a real
   module is provided. Do not create zero-test/no-op passes.
3. Replace obsolete `.env.example` variables with implemented settings and document
   how they are loaded. Validate an isolated custom port/database configuration;
   no real credentials belong in the example.
4. Add pinned offline Python lint, shell/Python syntax and regional cfn-lint checks
   to CI. Review the existing CloudFormation Guard rules for inclusion using a
   pinned executable. If a check remains unavailable, record it as incomplete;
   JSON parsing alone must not be described as Guard validation.

Acceptance: root checks apply real rules to every explicitly active source; all
new scopes pass. A clean documented bootstrap works without inherited environment
variables. Every documented implemented package command points to an existing
entry point. CI runs the added non-mutating checks and preserves test discovery,
token-drift checks, Caddy checks and three browser suites. No AWS resources are
created by PR validation.

### Q6 — Correct presentation and browser hardening

Covers QA15 and QA16. Dependencies: Q3 transport/recovery contract preserved.

1. Return/display authoritative service destinations, including reserved/long slug
   mappings; clearly label destinations not yet provisioned. Derive avatar initials
   and environment mode. Establish one explicit timezone display policy and label
   it, preserving actual epoch-based freshness calculations.
2. Define CSP and framing policy for built apps, backed by the actual asset/connect
   inventory. Validate a report-only policy before enforcement if needed. Preserve
   HSTS, nosniff, referrer policy, no-store, host authority and secure cookie controls.

Acceptance: reserved, `id-*`, short and long slug UI/API naming agreement; multiple
operator names; local/ingress mode truth; two browser timezone cases. Verify CSP
does not break fonts, activation, API calls or existing browser recovery. Verify
the intended framing decision using a controlled local parent page. No XSS or
clickjacking exploit claim is required to close a documented hardening gap.

### Q7 — Reduce the measured complexity without changing authority

Covers QA07. Dependencies: Q1–Q6 provide a stable tested baseline.

Extract queue loading/selection/recovery state from CommandMAPS rendering, split
Platform page composition, and separate API route modules from composition. Extract
small validation/transport helpers only when their policy is truly shared. Centralise
duplicated TypeScript configuration where it remains useful. Preserve historical
migration files; simplify orchestration through tested helpers rather than rewriting
applied migrations. Keep this in small independently reviewable commits, not a
single architecture rewrite.

Acceptance: remeasure the same functions with the same diagnostic rules; demonstrate
smaller responsibility-owned functions and no new complex extraction hotspot.
Agree modest project thresholds and document exceptions rather than forcing every
function below arbitrary 20/150 values. Preserve exact API contracts, RLS/session
boundaries, count/search/page behaviour, stale-response protection, worker fencing,
revocation ordering and lost-response recovery. Full regression/browser/Caddy checks
must pass on each relevant frozen candidate. Update module/readme ownership and
why-comments where they aid future review.

## Completion and next feature build

Keep `assessment-checkpoint.json` and the issue register current during remediation.
Close an issue only with its exact implementation commit, executable acceptance
evidence and independently reviewed disposition. An explicit evidence-backed
reclassification may replace a fix; it must not be a silent deferral. For grouped
QA16, account for all four presentation subissues. For QA18, account for advisory,
Python and infrastructure checks separately.

Before the next feature build, verify every QA01–QA18 item is resolved or explicitly
reclassified with supporting evidence, rerun the complete gate on the combined
candidate, update docs and Empirical, and publish a next-phase plan against verified
main. Continue product planning in parallel only where it does not imply completing
or overriding this quality work. Existing independent authority decisions remain
separate product dependencies; this plan creates no new governance approval body.

Retain evidence and populated development resources. Workspace-only assessment
databases can be stopped after review; no AWS resource cleanup is implied or authorised
by this plan. There is no deployment or merge step in the current assessment task.
