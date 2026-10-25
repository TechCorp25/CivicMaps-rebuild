# Code-quality remediation execution ledger

Plan: v1.0.0, SHA-256
`1ce4e1a3000c5148eb98d161d2d941f2e85009249cb6ddc9dd6c61dd36578cea`.
Assessment baseline: `346dfd2d74cdd52d88bf9e4b7bd046a500a4c390`.
Implementation package base: `ea76b23f15b0d13feada592a88b14b587f8b12de` on
`codex/civicmaps-quality-q1`, stacked on the published PR #43 assessment candidate.
No merge or deployment is in scope.

## Checkpoint state

| Goal | Status | Implementation | Independent acceptance |
| --- | --- | --- | --- |
| Q1 | Accepted | `1cb963d8eee9e12e62de39fa106d439d0af61ea0` | PASS on `1cb963d8eee9e12e62de39fa106d439d0af61ea0` |
| Q2 | Accepted | `9ab2dbf2e587ad790d5bdb26ad26d32540ec34f7` | Full fresh Astra PASS |
| Q3 | Local validation passed; independent review pending | Candidate commit pending | Q2 dependency satisfied |
| Q4 | Not started | — | Pending |
| Q5 | Not started | — | Pending Python contract from Q4 |
| Q6 | Not started | — | Pending |
| Q7 | Not started | — | Depends on stable Q1–Q6 baseline |

Q1 covers QA01 and only the advisory portion of QA18. Q1 was independently
accepted at exact product `1cb963d8eee9e12e62de39fa106d439d0af61ea0`; QA18's
Python and infrastructure checks remain open for Q5. Q2 implements QA02, QA03
and QA17. The published Q2 candidate received a `changes_required` independent
verdict on QA02 transient database error classification; the follow-up below
addresses both reported paths. Q2 remains open pending local validation and a
fresh review of the fixed candidate.

## QA01–QA18 dispositions

| Finding | Current disposition |
| --- | --- |
| QA01 | Accepted in Q1 at `1cb963d8eee9e12e62de39fa106d439d0af61ea0` |
| QA02 | Accepted in Q2 at `9ab2dbf2e587ad790d5bdb26ad26d32540ec34f7` |
| QA03 | Accepted in Q2 at `9ab2dbf2e587ad790d5bdb26ad26d32540ec34f7` |
| QA04, QA08, QA09 | Implemented and locally validated in Q3; fresh review pending |
| QA05–QA07, QA10–QA16 | Open; assigned to their planned Q packages |
| QA17 | Accepted in Q2 at `9ab2dbf2e587ad790d5bdb26ad26d32540ec34f7` |
| QA18 advisory | Accepted in Q1 at `1cb963d8eee9e12e62de39fa106d439d0af61ea0` |
| QA18 Python and infrastructure | Open; assigned to Q5 |

## Q1 implementation and evidence

The lockfile now resolves `body-parser@2.4.0` under Express 5.2.1, with only the
compatible parser's required lockfile transitive changes. The committed package
manifest does not add a duplicate direct dependency. The API continues to accept
compressed JSON. The executable test starts an isolated child API against a
synthetic disposable database and sends gzip, deflate and Brotli bodies, including
truncated JSON, invalid compressed streams and a valid compressed frame with
trailing bytes. It asserts each response, process survival and a subsequent healthy
request. Requests are bounded to three seconds; child startup to five seconds; the
test to 30 seconds, with child termination during cleanup.

A lockfile-matched audit script produces separate production-only and complete-tree
JSON reports. High and critical findings block; low and moderate findings are
reported for maintainer review. A weekly and on-demand workflow retains both
reports. The false-positive procedure requires evidence and review; no advisory
ignore list is provided. Context7 was not available in the current tool inventory;
the repository's retained GitHub advisory response and npm's lockfile-matched audit
are the version-relevant official sources used for this dependency change.

Evidence is in `evidence/q1-*.log`, `evidence/q1-advisory/`, and
`evidence/q1-lockfile.diff`. `evidence/q1-SHA256SUMS.txt` hashes these raw artifacts.
Validation on the candidate: clean `npm run setup`; `npm run check` passed 95 tests,
zero failed and zero skipped; the focused body-parser regression passed; production
and all-tree audits reported zero findings; both Caddy ingress checks passed; all
three browser suites passed. The activation suite reported port 5173 occupied and
selected another port; the suite completed successfully. Generated tracked F11E
screenshots were restored after the browser run. No node/Vite process remained after
the suites. Socket-listener inspection was unavailable because the executor denied
netlink access.

## Q1 checkpoint action (completed)

The single integration writer published the Q1 implementation and a fresh GPT-6
Astra Low reviewer accepted the exact product, as recorded below. Q2 was unblocked
only after that acceptance.

## Publication receipt

Published candidate and implementation: `1cb963d8eee9e12e62de39fa106d439d0af61ea0`; verified remote publication branch matches. Shell git push returned 403 for configured techcorp-dev credentials. Owner GitHub connector published the identical implementation tree `4368c1a7c9931f48dcabf5dd165e305335eddd46` with parent `ea76b23f15b0d13feada592a88b14b587f8b12de`. Local builder implementation `fc4799855695a2c34dad10edee853350a930f522` has the same tree; local receipt head `5cbc7093dae1bf3b96fab30d3e7b97ed5577ee99` is retained on package branch. Hosted advisory run 40139639375 passed; application run 40139639476 passed. Fresh Astra Low assessment uses detached candidate checkout.

## Q1 independent acceptance

Accepted exact product `1cb963d8eee9e12e62de39fa106d439d0af61ea0`. Fresh GPT-6 Astra Low report: [evidence/q1-independent/report.md](evidence/q1-independent/report.md), SHA256 `945b84dc6832137a1893ef905e270c12980fcd9b84621c1a2103aeb3fc7eef7d`. Independent setup/audit/parser/full check (95/95, zero skips), three browser suites and two Caddy checks passed. QA01 and QA18 advisory portion accepted; remaining QA18 portions stay open. Receipt commits are not the audited product identity. Q2 now active at `/workspace/work/quality-q2`, branch `codex/civicmaps-quality-q2`, stacked on accepted Q1.

## Q2 implementation and local evidence

Q2 is based on accepted Q1 receipt `bc180f0ae8c74a58815dfe7dc1614c667eb4d187`.
Request pools use maximum 10 clients, 1,000 ms acquisition and lock budgets,
and a 5,000 ms PostgreSQL statement timeout. Migration and seed operations use
a separate two-client pool with 10,000 ms acquisition, 30,000 ms lock and
120,000 ms statement budgets. This keeps maintenance DDL out of request pool
capacity. The raw synthetic read workload measured maximum 23.5 ms for 50
concurrent-ten indexed service-request counts; 1,000 ms is about 42 times that
observed maximum and 5,000 ms exceeds it by more than 200 times. These local
synthetic timings are budget evidence, not a production throughput claim.

PostgreSQL enforces cancellation server-side. Tests saturate all ten request
connections, hold an actual identity row lock during login, and cancel a
transaction after a write. They prove bounded retryable 503 responses, no
session change, rollback of the partial write, stopped server query and usable
pool capacity afterwards. A terminated backend also proves the checked-out
client is discarded and the pool reconnects. During this test a transport error
could otherwise be emitted while pg-pool has removed its idle error listener
from a checked-out client; the transaction now handles that event, discards the
broken client and classifies the driver transport failure for a safe retryable
response.

Password Scrypt derivation and comparison now use Node's async API behind a
shared two-operation admission gate. This leaves two of Node's default four
libuv workers for other work. The gate returns a generic retryable 503 when
full; login keeps the existing 16-byte random hex salt and 64-byte derived hex
hash, dummy verification, throttling and under-lock recheck. Hashes are checked
against the exact legacy format; invalid stored values reject generically and
log a fixed message without credential data. In a 12-request auth burst,
`/api/health` completed in 20.3 ms (under the documented 250 ms synthetic
acceptance bound); the response distribution was two invalid-credential 401s
and ten overload 503s.

Raw command outputs are retained as `evidence/q2-*.log` and the measured
workload as `evidence/q2-baseline-workload.json`; `scripts/measure-q2-baseline.mjs`
reproduces the read-only database and async password measurements. With the
session's PostgreSQL 15 `CIVICMAPS_DATABASE_URL` set, reproduce the gates with
`npm run setup`, `npm run check`, `npm run test:commandmaps:browser`,
`npm run test:platform:browser`, `npm run test:activation:browser`,
`node tests/ingress-contract.mjs` and `node tests/ingress-login.mjs`; run the
workload probe with `node scripts/measure-q2-baseline.mjs`. The final
candidate's complete evidence hash manifest is `evidence/q2-SHA256SUMS.txt`.
Clean setup, lint, formatting, typechecks, both builds and the complete API suite
passed: 104 tests, zero failures and zero skips. Three browser suites and both
Caddy loopback contracts passed against the same application implementation.
This local product was `2ddd43d74905ee7eafdb6b160bb1cbd9d2d60b22`, tree
`e75b333f76ca98262adbdd0e4274f14ecce67ccd`; the single integration writer
published identical tree `fe736c3ff390b22214de316a8a4ca6f4d90fbb45`. Its fresh
review found two QA02 transport-classification gaps; those findings and their
follow-up are recorded below. No merge or deployment is authorized.

## Q2 independent review and transport follow-up

The published candidate `fe736c3ff390b22214de316a8a4ca6f4d90fbb45` received a
fresh Astra Low `changes_required` verdict. The immutable report is
`evidence/q2-independent-original/report.md` (SHA-256
`205c063eef0f32a51fcdb359d470d2e841af3d48214f6b2e7ff1233ee11be088`). It
identified two QA02 gaps: pg-pool's `Connection terminated due to connection
timeout` during a stalled PostgreSQL handshake returned HTTP 500 without
`Retry-After`; and an already-disconnected checked-out pg client could reject
with `Client has encountered a connection error and is not queryable`, which
was not classified transient. The auditor's reproduction script/log and
focused/full outputs are preserved in `evidence/q2-independent-original/`.

The follow-up is isolated on `codex/civicmaps-quality-q2-fix`, based directly
on published candidate `fe736c3ff390b22214de316a8a4ca6f4d90fbb45`. The
classifier now recognizes those exact pg-pool/pg-client messages, the
transaction preserves the first captured client failure when rollback also
fails, and the backend termination regression waits for the transport error
before making the next query so the non-queryable path is deterministic. A new
separate-process test stalls only the loopback PostgreSQL handshake and asserts
bounded generic 503, `Retry-After: 1`, and recovery-time bounds. Before/after
reproduction logs and follow-up validation are retained as
`evidence/q2-fix-*.log`. The handshake regression changed from HTTP 500 with no
retry header at 1,057 ms on the prior product to HTTP 503 with
`Retry-After: 1` at 1,252 ms. The isolated backend, pool, password and resource
admission suite passed 12 tests with zero failures/skips. The full setup/check
passed lint, formatting, both typechecks/builds, and 105 tests with zero
failures/skips. All three browser suites and both Caddy loopback checks passed.
The activation browser reported port 5173 occupied and selected another port;
its suite completed successfully. Generated F11E screenshots were restored;
no test process or uniquely named disposable test database remained. The fix
candidate awaits publication and fresh independent review; it is not accepted.
The first local pre-fix replay of the old backend test happened to pass in
10.6 ms, while the original Astra focused run captured the non-queryable error
and failed its classifier assertion. This observed timing sensitivity is why
the new test waits for the client error event and asserts the exact secondary
query message before it accepts the transient classification.

## Q2 acceptance receipt

Accepted exact published product `9ab2dbf2e587ad790d5bdb26ad26d32540ec34f7`, full fresh GPT-6 Astra Low PASS. Report [evidence/q2-independent-accepted/report.md](evidence/q2-independent-accepted/report.md), SHA256 `04ad939ca92f2a06a73fb1a9efa4e8fc1f261632f817610c1e579e1b59edf263`. Independently passed focused12/12, full105/105, three browser suites, two Caddy checks and additional workload/credential probes. Hosted app40159555198 and advisory40159555010 SUCCESS. Earlier candidate fe736c3 remains changes_required with original immutable report preserved. QA02, QA03, QA17 accepted; Q3 now active isolated `/workspace/work/quality-q3`, stacked on accepted Q2. Receipt commits are not audited product SHAs.

## Q3 browser recovery and transport

Q3 is implemented locally on `codex/civicmaps-quality-q3`, based on accepted Q2
product `9ab2dbf2e587ad790d5bdb26ad26d32540ec34f7`. The Q2 acceptance receipt
`fc722d19d26fdad8fc66eb2a0809f49856ca19dd` was fast-forwarded before Q3
evidence was added. Q3 local validation is complete; no independent Q3 verdict
or candidate commit is recorded yet. The plan hash above is unchanged.

The shared `apps/shared/api-transport.mjs` primitive applies a 10-second
deadline across both response headers and body parsing, links caller cancellation,
retains HTTP status for JSON/malformed/HTML/empty responses, emits safe generic
messages for HTML and malformed data (including HTML embedded in JSON error
fields), and distinguishes timeout from network failure. Both API prefixes remain
separate. CommandMAPS queue, detail and history reads now use separate abort
controllers and generation guards; the test-only scheduler records exact selected
request ID, request/load/scope generations, and trigger source. Platform session,
directory and detail reads, slug availability, activation status, login and
activation redemption are bounded and cancellable. Mutation deadlines and the
existing same-key retry, uncertain-write reconciliation and explicit retry paths
remain in place; timed-out or lost writes are never replayed automatically.

`evidence/q3-controlled-detail-race.json` records one held selection read and
three separately completed 404 detail refreshes triggered by focus, interval and
focus for the same selected ID. The selection generation advances 20 to 23 while
the scope generation stays 0; releasing the old read leaves the selected record
unavailable with only its safe non-action control. The CommandMAPS browser suite
also checks an HTML 503 does not expose body text, offline failure returns a
safe network message, and each retry recovers the seeded synthetic row. A held
queue response reaches the 10-second timeout, releases the retry control and
recovers on explicit retry. Existing committed-write/lost-response browser cases
continue to assert reconciliation and reuse of the original idempotency key.

The first CommandMAPS runner attempt failed before app tests because its Vite
fixture required port 5173 (`Port 5173 is already in use`). The harness now lets
Vite choose an available local port and uses the actual bound origin. The first
Platform run reached the browser case that held a detail poll; with bounded
transport the expected visible state is `Routing status unavailable` while the
read is held, so the assertion now checks timeout recovery and separately checks
verification expiry after a fresh response. A first controlled race fixture also
timed out waiting for a second 404 because it fired while the prior refresh was
still completing its parallel queue/roster work. The product correctly ignored
the overlapping scheduled refresh; a `refresh-complete` trace and per-response
gates now serialize the controlled focus/interval/focus triggers. These initial
failures and fixture changes are recorded here; final passing runs are retained
separately and are not substituted for the controlled assertions.

Final local gates: clean setup installed 238 packages; `npm run check` passed lint,
format, both typechecks, both production builds and 106 API tests (0 failed, 0
skipped). CommandMAPS, Platform and activation Playwright suites all passed.
Both Caddy loopback ingress contract and login tests passed. The activation
runner logged `Port 5173 is in use, trying another one...` and completed on its
fallback port. Raw outputs and the race trace are in `evidence/q3-*.log` and
`evidence/q3-controlled-detail-race.json`; `evidence/q3-SHA256SUMS.txt` binds
the changed product/test sources and retained evidence. Generated tracked F11E
screenshots were restored. No merge or deployment was performed. QA04, QA08 and
QA09 are locally implemented and validated, pending fresh independent review.
