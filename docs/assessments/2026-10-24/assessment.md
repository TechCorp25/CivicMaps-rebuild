# Current-main code-quality assessment — 24 October 2026

Version: 1.0.0. Assessor: Codex. Repository: `TechCorp25/CivicMaps-rebuild`.
Baseline: `346dfd2d74cdd52d88bf9e4b7bd046a500a4c390`, tree
`adeb4903db4d07633c99d7fd10f140f6a244af8b` (owner-merged PR42).
Branch: `codex/civicmaps-code-quality-assessment-2026-10-24`.

## Outcome

The implemented application passes its established quality checks and 94 integration
tests. Platform, activation and CommandMAPS browser flows passed, including a final
PostgreSQL 15 run. One earlier CommandMAPS run failed in an overlapping-detail-response
assertion; both that failure and subsequent passes are retained. This is not a clean
first-attempt browser result.

There is one high-severity dependency advisory requiring prompt attention:
`express@5.2.1` resolves to `body-parser@2.3.0`, affected by
[GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828), published
23 October 2026. The affected middleware configuration is present. A bounded local
probe did not reproduce process termination; exploit reproduction is not claimed.

The review records **18 actionable findings**: one high-severity affected dependency,
five medium-priority engineering concerns, and twelve low-priority defects or
quality gaps. Priority includes maintainability and test quality; it is not a CVSS
rating for every item. The [remediation plan](remediation-plan.md) assigns every
finding to a work package and acceptance criteria. The [register](findings.json)
provides a machine-readable index.

This is a pre-build quality-assurance step. It introduces no governance hold and
does not change G1 policy, G2 authorisation, feature acceptance, or existing owner
decisions. No application, dependency, schema, infrastructure, or test implementation
was changed. No merge, deployment, cloud mutation, or customer-data operation was
performed. This report proposes the work to perform before the next feature build.

## Baseline and environment

The starting `work` checkout was clean at `2a20b81`; its cached remote-tracking
reference was older still. A supported network-enabled `git fetch origin main`
resolved current main to `346dfd2`; the assessment branch was created from that
commit before repository changes. The initial default-sandbox proxy failure was
an execution-permission problem, not proof of unavailable GitHub access.

- Node `24.19.0`, npm `11.9.0`, matching `.node-version` and `packageManager`.
- `npm run setup` installed the committed lockfile with install scripts and bin
  links disabled: 238 packages installed successfully. The lockfile was unchanged.
- A fresh, synthetic-only PostgreSQL 17.11 instance was created on loopback port
  55439. PostgreSQL 15.19 was then extracted into workspace-owned tooling and a
  second fresh instance created on 55440 to match the documented major version.
  Existing databases were not reset. Test helpers created/dropped their own databases.
- Matching Playwright Chromium was available in the saved environment tools.
- Caddy 2.10.2 was downloaded and verified against the same SHA-512 pinned in CI.
- Separate workspace tooling supplied `cfn-lint 1.58.0`, `ruff 0.17.2`, and Python
  GIS dependencies. These tool installations do not declare project dependencies.
- AWS template checks used `ap-southeast-2`. No AWS API calls or resources were needed.
  AWS-specific `retrieve_skill` tooling was not exposed in this session.

See [reproduction and environment notes](reproduction.md). Exact local tool paths are
execution receipts, not portable prerequisites for other machines.

## Scope and method

Inventory: 997 tracked files, including 121 files with `.mjs`, `.ts`, `.tsx`, `.py`,
`.sql`, `.sh`, or `.css` extensions. This is a file inventory, not a claim that every
archive, design file, or data row was reviewed semantically.

| Surface | Work performed | Limit |
| --- | --- | --- |
| Express API/authentication | Source review of authentication, CSRF, cookies, input validation, scoped reads/writes, receipts, error handling and resource admission | No public-service attack or distributed-load test |
| PostgreSQL/migrations | Reviewed migrations 001–015, ownership/context/RLS controls and migration orchestration; ran existing isolation, upgrade, concurrency and recovery suites | Tests use privileged synthetic harness setup; no new live-role acceptance |
| Provisioning/routing/resources | Reviewed claim/fencing/retry, provider calls, ownership checks, TLS, CLI error sanitisation and release scripts; real Caddy loopback checks | No AWS provider call, public TLS issuance, or live-deployment drift inventory |
| React applications | Source review of data loading, detail selection, cancellation, errors, forms, recovery, rendering and composition; existing desktop/narrow browser suites; selected screenshots inspected | No full assistive-technology or WCAG conformance audit |
| Tooling/CI/dependencies | Clean locked install, native quality gates, dependency audit, diagnostic complexity measurement, lint-scope inspection and CI review | No third-party source-code audit or supply-chain attestation |
| GIS/Python | Reviewed both GIS scripts; syntax checks; explicit Ruff baseline; offline tests of original functions with real Shapely/Rtree | No external dataset download, regeneration or frequency estimate for existing errors |
| Scaffolds/design archives | Manifest/entry-point inventory; active imports traced into `_ds` | Archived previews are not presented as deployed application code |
| Credentials | Three current-tree key/token pattern checks, filenames/locations only | No generic secret-detector guarantee or Git-history scan |

Official Express, React and node-postgres guidance was retrieved through Context7;
the [reference map](references.md) connects those principles to this code. Passing
linters or using a library does not establish universal “best in class” adherence.

The Codex Security plugin exposes no `start_codex_security_deep_scan` coordinator in
this session. Its [Deep Security Scan skill](skill://Plugin_1e648473be9c8191a91ac3947151af55/deep-security-scan/SKILL.md)
states: “If the tool is unavailable, stop and explain that Deep Security Scan requires
the Codex Security plugin server.” That plugin scan was therefore not run. This
document is the broader code-quality/source/dependency assessment, not a fabricated
Codex Security scan report. Independent deep-scan coverage and token measurements
are unavailable; no zero-vulnerability or exhaustive-security claim is made.

## Verification results

| Check | Result | Evidence |
| --- | --- | --- |
| Committed-lockfile setup | PASS | [setup.log](evidence/setup.log) |
| Initial `npm run check`, PostgreSQL 17 | Lint/format/types/build passed; 92 tests passed, 2 failed because `pg_dump` was absent from PATH | [check.log](evidence/check.log) |
| `npm test`, corrected PostgreSQL 17 PATH | PASS: 94/94, zero failures/skips/cancellations | [tests.log](evidence/tests.log) |
| Full `npm run check`, PostgreSQL 15 | PASS: lint with zero warnings, formatting, both typechecks/builds, 94/94 tests | [check-pg15.log](evidence/check-pg15.log) |
| Platform browser, PostgreSQL 17 and 15 | PASS | [17](evidence/platform-browser.log), [15](evidence/platform-browser-pg15.log) |
| Activation browser, PostgreSQL 17 and 15 | PASS | [17](evidence/activation-browser.log), [15](evidence/activation-browser-pg15.log) |
| CommandMAPS browser | Initial PostgreSQL 17 failure; PostgreSQL 17 rerun and PostgreSQL 15 run passed | [failure](evidence/commandmaps-browser.log), [rerun](evidence/commandmaps-browser-rerun.log), [15](evidence/commandmaps-browser-pg15.log) |
| Real Caddy authority and login/client isolation | PASS, loopback HTTP fixtures | [authority](evidence/ingress-contract.log), [login](evidence/ingress-login.log) |
| Caddy configuration | PASS; redundant-header warnings retained | [validation](evidence/caddy-validation.log) |
| Both CloudFormation templates | PASS, cfn-lint in selected Region; empty diagnostic array | [cfn-lint.json](evidence/cfn-lint.json) |
| Infrastructure shell/Python/JSON syntax | PASS | [syntax](evidence/infrastructure-syntax.log) |
| npm audit | FAIL: one high, no other severities | [audit](evidence/npm-audit.json), [advisory](evidence/body-parser-advisory.json) |
| Explicit Ruff baseline `E4,E7,E9,F` | FAIL: 3 findings across 2 files, outside current CI scope | [Ruff](evidence/ruff-baseline.json) |
| Excluded active-domain/GIS Prettier check | FAIL: both checked files need formatting | [format](evidence/excluded-format.log) |
| Narrow credential-pattern inventory | No matches for the three checked formats | [inventory and limits](evidence/static-inventory.json) |

The first Python lint invocation inherited environment configuration and produced
58 advisory diagnostics. It is retained as [ruff.json](evidence/ruff.json), but the
assessment uses the explicit isolated 3-diagnostic baseline, not the inherited count.
Expected negative-case API messages in passing test logs are not additional failures.

## Findings

### QA01 — High: vulnerable production body-parser dependency

`package-lock.json` installs `body-parser@2.3.0` beneath Express 5.2.1. Express accepts
`^2.2.1`, so patched 2.4.0 is compatible with that dependency range. At
`services/api/app.mjs:227`, global `express.json({ limit: '32kb' })` retains default
decompression before authentication and route handlers. The advisory describes an
uncaught decompressor error/process exit after trailing compressed-body bytes.
Authentication throttling is downstream of parsing and does not remove this path.

Affected version and configuration are confirmed by the lock/install tree and
official advisory. Three isolated local gzip/deflate/Brotli requests did **not**
terminate the process; see [bounded probe](evidence/compressed-body-probe.json).
Do not describe those negative probes as an independently reproduced exploit.
Refresh the lockfile to a patched compatible release, or explicitly disable
compression if the product does not require it, and verify malformed/compressed
bodies cannot kill an isolated server process. No fix was applied in this review.

### QA02 — Medium: shared control-database waits have no application deadline

`services/api/database.mjs:4` configures only `connectionString` and `max: 10`.
Pool acquisition, statements, queries and lock waits therefore have no configured
application timeout. Authenticated reads deliberately take revocation locks;
mutations take advisory and row locks. A stalled database/lock holder can retain
clients and queue unrelated work without a bounded failure response. An idle-client
error listener exists and is tested; this is a different remaining concern.

The [pool probe](evidence/pool-wait-probe.json) borrowed ten clients; an eleventh
remained queued until a client was explicitly released. This demonstrates waiting,
not a new external denial-of-service exploit. Define measured transaction/lock and
acquisition budgets, safe HTTP error mapping, rollback and connection recovery.
Preserve the revocation ordering guarantees rather than removing locks.

### QA03 — Medium: password work blocks the shared event loop

`services/api/passwords.mjs:4` and `:8` use `scryptSync`. Successful council sign-in
verifies twice, including a recheck under the login-user lock. Activation and
registration also hash synchronously. Ten sequential verifications occupied about
538 ms, delaying a zero-delay timer to about 574 ms on this executor; see
[measurement](evidence/local-contract-probes.json). These are local measurements,
not service throughput guarantees or a demonstrated distributed attack.

Use asynchronous password derivation with bounded admission; preserve dummy-hash
behaviour, comparison safety, throttling and the post-lock credential recheck.
Simply moving unlimited work to the libuv pool would create a different queue.

### QA04 — Medium: overlapping-detail browser test is intermittent

The first CommandMAPS suite failed at `tests/browser/m1-discovery.mjs:168`, waiting
for “Selected request unavailable”. The unchanged code then passed on PostgreSQL
17 and 15. The interception counts all matching detail reads and denies only read
two (`:155`); later reads are allowed while the UI also has periodic/focus refreshes.
That is a plausible ordering sensitivity, not a proven root cause.

The validated issue is inconsistent acceptance evidence. Retain the failing trace,
instrument exact request IDs/generations, control scheduling, and keep the intended
denial in force for the scenario. If deterministic reproduction identifies a
product bug, correct it with its own regression case. Do not weaken the assertion
or rely on automatic retries to label this resolved.

### QA05 — Medium: GIS fallback changes the street of an address

`geo-data/generate_melbourne_cbd_street_blocks.py:389` falls back to any nearby street
when name-matched candidates are absent. `:583` writes the number under `seg.street`.
An offline execution of the original module with real Shapely/Rtree selected
“Wrong Street” for “Requested Street”, only 1.11 m away, passing the default 60 m
distance guard. See [geometry probe](evidence/geo-real-geometry-probe.json).

Preserve the source street, use explicit approved aliases if needed, and otherwise
record an unassigned/review reason. Existing output error frequency is unmeasured;
there is no claim that dispatch currently consumes these outputs.

### QA06 — Low: active imported code is outside semantic lint/format gates

`domains/service-requests-dispatch/lifecycle.mjs` executes in the API but receives
zero configured ESLint rules. The active `_ds/components/LifecycleStatusPill` import
also crosses a globally ignored tree. GIS JavaScript is excluded too. Both the
lifecycle file and GIS JavaScript fail an explicit Prettier check. See
[scope](evidence/lint-scope.json) and [format](evidence/excluded-format.log).
Add explicit active-file scope while keeping archives/generated assets excluded.
Passing the root lint command currently does not cover all executed first-party code.

### QA07 — Medium: major components combine too much control flow

Diagnostic ESLint rules, without changing the gate, measured:

| Function | Cyclomatic complexity | Nonblank/noncomment lines |
| --- | ---: | ---: |
| CommandMAPS `App`, `main.tsx:113` | 93 | 1203 |
| CommandMAPS queue-loading callback, `:171` | 55 | 177 |
| Platform `App`, `main.tsx:49` | 56 | 840 |
| `routingMiddleware`, `routing.mjs:42` | 31 | — |
| `stagePrincipalOwnership`, `migrate.mjs:132` | 30 | — |
| API `createApp`, `app.mjs:218` | — | 454 |
| `platformRouter`, `platform.mjs:150` | — | 300 |

[Full diagnostics](evidence/complexity.json) use exploratory thresholds 20 and 150;
these are review aids, not universal best-practice limits. State orchestration,
rendering and request recovery in large functions raise change/review cost. Similar
API-client/input/receipt helpers and app TypeScript configuration are duplicated.
Extract behaviour-owned modules in small steps, preserving distinct Platform/council
authority and historical migration semantics. Line count alone proves no vulnerability.

### QA08 — Low: non-JSON failures lose HTTP status and recovery meaning

Both API helpers parse JSON before checking `response.ok`
(`apps/civicmaps-platform/src/api.ts:82`, `apps/commandmaps/src/main.tsx:103`).
An actual transpiled Platform helper given an HTML 503 throws `SyntaxError`, with no
HTTP status; see [probe](evidence/api-error-probe.json). This breaks status-specific
recovery for non-JSON ingress failures. Activation has the same parsing assumption.
Preserve the HTTP status, handle empty/malformed/non-JSON bodies safely, and show
safe user feedback without rendering raw proxy content.

### QA09 — Low: most browser requests lack a bounded lifetime

The common fetch helpers set no default timeout. Platform detail polling correctly
combines cancellation with a 10-second timeout, but login, directory loading,
mutations, CommandMAPS queue/detail/history and activation lack an equivalent shared
budget. A fetch that never settles can leave a busy form or refresh pending until
the browser/network eventually fails. This is source-confirmed missing recovery,
not a measured incident. Use cancellation and typed timeout outcomes; preserve
idempotency keys and uncertain-write reconciliation when the server may have committed.

### QA10 — Low: polygon assignment depends on vertex sampling

`geo-data/fetch-com-roads.mjs:60` averages all vertices, including repeated closure
vertices, rings and holes. The same square produces `[4,4]` or approximately
`[4.643,1.429]` after resampling one edge, while its area centroid remains `[5,5]`.
See [probe](evidence/centroid-probe.json). The function feeds zone assignment at
`:149`. Select and document a real geometry rule (representative point or measured
overlap, including holes/multipolygons), then test boundaries. Error frequency in
the stored Melbourne dataset remains unknown.

### QA11 — Low: GIS ingestion can hang or discard input without diagnostics

The JavaScript fetch at `geo-data/fetch-com-roads.mjs:135` has no explicit deadline.
The Python JSONL reader at `generate_melbourne_cbd_street_blocks.py:180` silently
continues on parse failures; missing-field skips also lack a quality summary.
Python HTTP calls do have timeouts (120/300 seconds), contrary to older broad claims.
Add bounded JS retrieval, response-shape checks, counted rejection reasons and
atomic output publication. Do not silently replace a previous good dataset with
an empty or partially parsed result. No external dataset was regenerated here.

### QA12 — Low: Python dependencies and quality checks are not reproducible

The GIS module imports orjson, requests, Shapely, Rtree and tqdm, but the repository
has no Python requirements/pyproject/lock declaration. None was available in the
initial base interpreter; an isolated tool environment was needed for this review.
The explicit Ruff baseline reports an unused `nearest_points` import and two
compressed-statement/import issues in the infrastructure Python helper.
Declare supported Python/dependency versions and a deliberate lint scope; validate
fresh setup and synthetic geometry fixtures. These three diagnostics are not three
security vulnerabilities.

### QA13 — Low: scaffold package commands and GIS entry points do not exist

23 scaffold manifests invoke missing `scripts/stub-task.mjs`; the private GIS package
declares missing `index.ts` for both `main` and `types`. The
[inventory](evidence/static-inventory.json) lists the affected manifests. Root commands
correctly exclude scaffolds, so the implemented build is not broken by this fact.
Make scaffold status executable and unambiguous, remove fictional entry points, or
provide real commands when a package is implemented. Do not create successful no-op
tests or include every scaffold in the root quality gate.

### QA14 — Low: the environment template documents a different runtime

`.env.example:29` advertises `API_PORT=3000` and generic `DATABASE_*` settings, whereas
the implemented code uses `CIVICMAPS_API_PORT` defaulting to 4100 and
`CIVICMAPS_DATABASE_URL`. It references a missing deployment validator. The Node
launch commands also do not automatically load `.env`, despite the copy-to-`.env`
instruction. Replace the template with implemented variable names and an explicit
loading/export procedure; retain names/placeholders only for credentials. The local
build guide is more accurate and should remain consistent with the template.

### QA15 — Low: browser defence headers are incomplete

The shipped API/Caddy configuration sets no CSP, `frame-ancestors`, or X-Frame-Options.
Caddy does set HSTS, nosniff and a referrer policy; the API sets no-store and nosniff.
This is confirmed hardening work, not evidence of XSS or successful authenticated
clickjacking. Strict SameSite cookies constrain cross-site framing. Define tested
asset/connect/frame policies for built apps, introduce CSP in report-only mode if
needed, then enforce after browser verification. Keep development tooling policies
separate from deployed built assets.

### QA16 — Low: several displayed values are disconnected from authority

The onboarding success screen constructs `${slug}-commandmaps...`, while the naming
module maps `alpha`, `beta`, `id-*` and long slugs to immutable-ID tokens. The
[naming probe](evidence/local-contract-probes.json) demonstrates three mismatches.
Show an authoritative returned destination, or clearly label a not-yet-assigned one.
The Platform header also hard-codes `SI` initials (`main.tsx:348`); the directory API
hard-codes `mode: 'local-synthetic'` even in ingress mode (`platform.mjs:267`); and
route/job timestamps use browser local time while shared formatters use Melbourne.
Derive identity/mode values and use an explicit consistent timezone policy. These
are presentation defects, not authentication bypasses or live telemetry failures.

### QA17 — Low: malformed stored password hashes throw instead of rejecting

`services/api/passwords.mjs:8` assumes a valid salt and digest length. The original
helper throws `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` for `salt:ab`; see
[probe](evidence/local-contract-probes.json). HTTP callers cannot directly supply
stored hashes, and shipped writers generate valid hashes, so this is a defensive
correctness issue under damaged/imported data. Validate the stored format and fail
authentication safely; record a sanitised integrity signal without hash material.

### QA18 — Low: CI does not exercise several first-party quality surfaces

The existing workflow runs the application gates, actual Caddy tests and three
browser suites, but no dependency-advisory audit, Python lint, or CloudFormation
lint/guard checks. The high advisory and explicit Python diagnostics can coexist
with green CI. Add read-only deterministic checks with pinned tools and explicit
scopes. Avoid placing chargeable/provider-mutating cloud acceptance in ordinary PR
CI. Consider scheduled advisory review because advisories can appear after a commit.

## Historical findings and controls that should be preserved

The 18 October register is historical evidence at `0aba5e0`, not a current finding
list. Source and passing regression tests confirm these material corrections:

- F-002: status/search/keyset pagination and first-page authorised counts are present;
  M1 browser/integration coverage exercises more than 100 records.
- F-009: resource-status admission is limited to one active call, releases in `finally`,
  and skips unnecessary storage credential acquisition. Existing admission tests pass.
- F-011: idle database errors have a sanitised listener and a recovery regression.
- F-029: action reasons are bounded strings/null and the UI rejects malformed legacy
  reason rendering; API/browser cases exist. Do not reopen the old stored-reader failure.
- F-001/F-003: trusted overwritten ingress-client addresses and separate identity/client
  limits are covered by real Caddy tests. Generic `trust proxy = true` would weaken
  this deliberate authority design.
- F-037/F-039: update releases preserve registry/admin state and do not rerun seeds;
  first-admin activation supersedes temporary-password delivery.

The implementation also uses parameterised request SQL, validates interpolated
resource identifiers, binds sessions to exact service-route versions in ingress,
uses HttpOnly/Strict cookies and secure cookies in ingress, enforces CSRF on
authenticated mutations, commits audit with writes, fences worker checkpoints,
checks council ownership/context/entitlements, and preserves idempotency/version
conflict handling. Existing tests supply meaningful negative evidence for these
controls; they do not prove every possible attack is excluded.

## Remaining investigations and limits

Older concerns about SECURITY DEFINER search paths, CLI argument exposure, predictable
build-tool staging directories, broad trusted broker SQL privileges and worker-scale
capacity still require their specific threat/deployment assumptions. They are not
newly validated remote vulnerabilities. No source path was established here for
ordinary users to inject SQL, obtain credentials or cross a council boundary.
Do not remove locking/RLS, alter council authority, rewrite historical migrations,
or discard failed provisioning ownership to simplify this backlog.

Single-instance synthetic infrastructure, one-day backup retention, fixed fixture
hostnames/project identifiers and the two-resource provisioning cap are deliberate
development constraints. Production HA/retention/identity policy is outside this QA
scope. Resource review tags do not authorise deletion. Public live-service state,
paid-plan/spend status and installed source drift were not inspected or changed.

Next action: execute [the complete remediation plan](remediation-plan.md) as focused
work, with tests/docs/Empirical and independently assessed frozen changes under the
existing lifecycle. This assessment does not authorise feature implementation,
merge or deployment by itself.
