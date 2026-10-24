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
| Q2 | Implemented; local gates pass; independent review pending | Candidate pending | Q1 dependency satisfied |
| Q3 | Not started | — | Pending |
| Q4 | Not started | — | Pending |
| Q5 | Not started | — | Pending Python contract from Q4 |
| Q6 | Not started | — | Pending |
| Q7 | Not started | — | Depends on stable Q1–Q6 baseline |

Q1 covers QA01 and only the advisory portion of QA18. Q1 was independently
accepted at exact product `1cb963d8eee9e12e62de39fa106d439d0af61ea0`; QA18's
Python and infrastructure checks remain open for Q5. Q2 implements QA02, QA03
and QA17 and has passed its local gates; independent review is pending. No Q2
finding is marked accepted or closed before that review.

## QA01–QA18 dispositions

| Finding | Current disposition |
| --- | --- |
| QA01 | Implemented in Q1; local evidence recorded; independent review pending |
| QA02 | Implemented in Q2; local evidence recorded; independent review pending |
| QA03 | Implemented in Q2; local evidence recorded; independent review pending |
| QA04–QA16 | Open; assigned to their planned Q packages |
| QA17 | Implemented in Q2; local evidence recorded; independent review pending |
| QA18 advisory | Implemented in Q1; review pending |
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
The candidate remains pending publication and fresh independent audit; no merge
or deployment is authorized.
