# Independent Q2 product audit

**Verdict: pass.** No actionable defect against Q2 task contract v1.0.0 was found in the pinned product after source review and independent execution. This assesses the whole Q2 contract, not only the latest timeout changes.

- Audit completed: 2026-10-25T03:53:00Z (UTC).
- Requested and accepted auditor configuration supplied by the coordinator: `gpt-6-astra`, low effort, `fork_turns="none"`. This agent cannot independently introspect serving-model identity or actual effort allocation; those settings are reported as requested configuration, not independently attested runtime facts.
- Fresh context: a separately spawned auditor received task requirements, baseline/candidate identities, product inventory and environment instructions. No inherited builder conversation was supplied. Execution handoffs, ledgers, checkpoints, builder diaries, prior audit reports/conclusions (including q2-independent-original/report.md), and broad Empirical notes were excluded from substantive review. Repository AGENTS.md was read; its generic Empirical instruction was superseded by the explicit audit context restriction.
- Baseline: `bc180f0ae8c74a58815dfe7dc1614c667eb4d187`.
- Candidate: `9ab2dbf2e587ad790d5bdb26ad26d32540ec34f7`.
- Candidate parent: `fe736c3ff390b22214de316a8a4ca6f4d90fbb45`.
- Detached checkout: `/workspace/work/quality-audits/q2-fix/published`; verified HEAD and parent directly. Checkout was initially clean and is clean after verification. Browser-generated tracked screenshots were restored; no source edits, commits, pushes, merges or deployments occurred.

## Inputs and integrity

Contract: `/workspace/work/quality-audits/q2/task.md`, SHA-256 `ff937a978a1662bbb4ba82f3c6665aa3b03f5c4bd88ecde9ca36e9b737e1af2d`.

The adjacent manifests enumerate hashes for the product inputs, including API, tests, scripts, application/domain source, schemas/fixtures, infrastructure, package lock, CI, repository instructions and relevant development documentation. Hashing a file does not imply line-by-line review of that file.

| Manifest | SHA-256 |
| --- | --- |
| [audit-input-SHA256SUMS.txt](audit-input-SHA256SUMS.txt), 237 candidate/contract/manifest entries | `656cd86840e885440e5688bf169f9e38df4d94e09c77d62a9a0add241084750d` |
| [audit-baseline-SHA256SUMS.txt](audit-baseline-SHA256SUMS.txt), 230 baseline product entries | `9769f11d8615cdb8f70ba216e6e6f04e027098afa642fb01ef508f1a71b6d310` |
| [audit-manifest-verification.json](audit-manifest-verification.json) | `640eddfb250fa4afd99b55ee215db95b299a19f02e93c6152987f0ab979f93ab` |
| [audit-output-SHA256SUMS.txt](audit-output-SHA256SUMS.txt), independent evidence files | `a7e2a91aaa845034bab5348bc7bfc0400a4ac9b20850b6bf640c25d355fddb72` |

Independently recalculated all 42 allowed product/raw-evidence entries in the supplied q2 and q2-fix manifests: all matched. Original q2 entries were checked against the parent revision, and q2-fix entries against the candidate. Entries referring to excluded narratives or the prior independent audit were omitted. Hash consistency establishes integrity against those manifests, not the truth of builder claims. Product documentation was treated as specification/explanation; verdict evidence came from source and new executions.

## Checks actually run

Environment: Node v24.19.0, npm 11.9.0, dedicated synthetic PostgreSQL 15 at loopback port 55440, configured Chromium and Caddy. The session environment script was sourced. The cloud-environment-runtime skill and network policy were inspected; database/browser/ingress commands used approved escalated execution for local networking. Tests created and removed their own disposable databases. No live customer data or AWS mutations were used.

| Execution | Result and retained evidence |
| --- | --- |
| `npm run setup` | Exit 0; audit-setup.log |
| `node --test tests/database-budgets.test.mjs tests/database-handshake-timeout.test.mjs tests/password-work.test.mjs tests/database-pool.test.mjs tests/resource-admission.test.mjs` | 12 passed, zero failures/skips; audit-focused.log |
| `npm run check` | Lint, formatting, typecheck, both builds, and 105 tests passed; zero failures/skips; audit-check.log |
| `node tests/browser-commandmaps.mjs` | Passed; audit-browser-commandmaps.log |
| `node tests/browser-platform.mjs` | Passed; audit-browser-platform.log |
| `node tests/browser-activation.mjs` | Passed; audit-browser-activation.log |
| `node tests/ingress-contract.mjs` | Passed actual Caddy loopback routing checks; audit-ingress-contract.log |
| `node tests/ingress-login.mjs` | Passed actual Caddy + API throttling/authority checks; audit-ingress-login.log |
| `scripts/measure-q2-baseline.mjs`, invoked after creating a new synthetic test environment | Exit 0; audit-measurement.json and audit-measurement-errors.log |
| Additional direct password-module probe | Eight malformed forms rejected with ERR_PASSWORD_HASH_FORMAT before admission; capacity remained zero; a newly generated async hash verified with the old synchronous algorithm; audit-extra-hash-format.log |

The three browsers ran sequentially, followed by the two Caddy checks. Full-gate and measurement execution overlapped part of the run; measurements are observations of this local environment rather than isolated hardware benchmarks.

## Contract assessment

1. **Explicit work budgets:** database.mjs configures request acquisition/statement/lock limits of 1000/5000/1000 ms with ten clients, and a separate two-client maintenance pool at 10000/120000/30000 ms. Migrate and seed call sites select maintenance explicitly. Server startup options enforce PostgreSQL cancellation, rather than merely rejecting a JavaScript promise. The synthetic workload rationale is documented. Independent 50-read measurements at concurrency ten peaked at 25.977 ms, broadly consistent with the recorded 23.537 ms basis. Existing provider-connection limits remain separate.
2. **Retry, cancellation and cleanup:** focused executions demonstrated bounded pool saturation, row-lock failure, server-side statement cancellation with no surviving partial insert, healthy subsequent queries, dead-backend disposal and reconnection, idle-client recovery, and stalled PostgreSQL handshake mapping to generic 503 with Retry-After: 1. Source inspection confirms BEGIN/work/COMMIT, rollback on failure, and discard when rollback or client transport fails. Shared authentication locking and transaction-local roles/context remain in place. Full-gate executions cover revocation ordering, scope isolation, receipts, migration preservation, worker fencing, recovery after effects and idempotent replay.
3. **Asynchronous password work:** all production hash/verify consumers were inspected for awaited conversion. The shared admission gate allows two asynchronous scrypt operations and rejects excess work without an unbounded queue. Unknown users retain dummy verification; council login still performs its active/hash recheck under the existing identity lock. Identity/client throttling remains and actual ingress checks pass. The independent 12-login burst produced two 401 and ten 503 responses; concurrent health completed in 45.9 ms, below the documented 250 ms ceiling. Full-gate activation tests exercise the login/disable race, and existing session revocation tests passed.
4. **Credential integrity and compatibility:** format validation precedes comparison and derivation, with fixed sanitised logging and generic login rejection. Malformed-hash integration, overload recovery, valid/invalid credentials and legacy-hash verification passed. Additional probes covered null/undefined/object/empty/wrong-length/nonhex/extra-field/uppercase forms. New hashes remain readable by the previous synchronous derivation algorithm. No credential-format migration or destructive schema change was introduced.

The new tests reside under tests/ and are discovered by the root recursive Node test command; CI invokes that gate and the browser/Caddy checks. Existing resource-admission and database-pool checks were explicitly rerun as required.

## Findings and limitations

No blocking or nonblocking Q2 findings were established; there is therefore no defect severity/location/reproduction entry.

All contract acceptance areas have supporting local execution and/or source evidence. This is not a proof of every possible failure interleaving. Statement budgets bound individual server statements, not an overall wall-clock request or an arbitrary transaction callback. The independent cancellation test uses a synthetic transaction rather than injecting a timeout at every receipt-write boundary; atomicity also relies on the preserved common transaction wrapper and passing receipt/recovery tests.

Production throughput, network partitions that keep sockets indefinitely half-open after a query is submitted, managed PostgreSQL variants, nondefault libuv pool settings, and live provider maintenance behaviour were not exercised. Caddy checks used loopback HTTP and do not establish public TLS/certificate behaviour. These are scope limitations, not production readiness claims. Q1 acceptance was supplied as a task dependency and was not independently re-audited. The extra direct hash probe supplements, rather than substitutes for, committed tests.
