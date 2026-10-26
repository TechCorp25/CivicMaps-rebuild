# Independent Q2 assessment

Verdict: **changes_required**.

Task: Q2 — Bound server work and preserve safe authentication, contract v1.0.0. Assessment completed 2026-10-25T03:39:34.918233+00:00.

Identity: requested/accepted auditor spawn `gpt-6-astra`, effort `low`, `fork_turns=none`. The serving model/effort cannot be independently introspected from this context; these are orchestration declarations, not a measured runtime identity. Fresh-context mechanism was a separate auditor agent with no inherited parent conversation. Inputs were the task contract, pinned product, relevant dependencies, and independently generated test evidence. Builder narratives, prior audit conclusions, execution handoffs, diaries and Empirical notes were not used for the verdict. The supplied evidence checksum file was verified mechanically, including its narrative-file entries; their contents were not reviewed as evidence.

Base: `bc180f0ae8c74a58815dfe7dc1614c667eb4d187`.
Candidate: `fe736c3ff390b22214de316a8a4ca6f4d90fbb45`, independently checked with git rev-parse in `/workspace/work/quality-audits/q2/published`.
Contract SHA-256: `ff937a978a1662bbb4ba82f3c6665aa3b03f5c4bd88ecde9ca36e9b737e1af2d`.
Input manifest: [auditor-evidence/input-SHA256SUMS.txt](auditor-evidence/input-SHA256SUMS.txt), SHA-256 `ef1c342ffd7bab215e10d51e250b0aaac128e5247ac3e32832bd6ee496401643`. This records the task, environment script, product inventory and available source/test/build dependencies; inclusion is a content fingerprint, not a claim that every file was individually reviewed. Raw audit output manifest: [auditor-evidence/audit-output-SHA256SUMS.txt](auditor-evidence/audit-output-SHA256SUMS.txt), SHA-256 `55b14f663cb32cc66a1c8cddb4d46c79f992bde85baf1d04671e3c966886d92f`.

## Findings

### Q2-A1 — Medium: initial database connection timeout returns non-retryable HTTP 500

Location: `services/api/database.mjs:60–66`; response mapping in `services/api/app.mjs:675–686`.

The classifier recognises the queued-pool checkout timeout but omits the new-client connection timeout emitted by pinned `pg-pool`: `Connection terminated due to connection timeout`. A PostgreSQL endpoint that accepts TCP but does not complete the handshake causes `/api/health` to return 500 without `Retry-After`, violating Q2 requirement 2. The request still ends within its acquisition budget; the defect is response classification.

Reproduction: run `node /workspace/work/quality-audits/q2/auditor-evidence/connect-timeout-repro.mjs`. The retained script opens a disposable loopback TCP listener that stalls the PostgreSQL handshake, imports the pinned candidate, starts its API and requests `/api/health`. Observed response: status 500, Retry-After null, generic error body, 1137.0 ms. See [raw reproduction](auditor-evidence/connect-timeout-repro.log). No external database or customer data is involved.

Required correction: preserve/normalise this driver connection-timeout error as transient and add a discovered regression asserting 503, Retry-After and bounded completion.

### Q2-A2 — Medium: checked-out transport failure loses transient classification

Location: `services/api/database.mjs:72–95`, classifier at `:60–66`; existing regression `tests/database-budgets.test.mjs:194–225`.

When a backend dies between statements, the client error listener captures the original transport failure, but the next query can instead reject with `Client has encountered a connection error and is not queryable`. The transaction throws that secondary uncoded error, which the classifier does not recognise. The API mapping therefore selects 500 rather than the required retryable response. The client is discarded, but the useful failure identity is lost.

Reproduction actually run: source `/workspace/work/quality-bootstrap/session-env.sh`, then from the pinned worktree run `node --test tests/database-budgets.test.mjs tests/password-work.test.mjs tests/database-pool.test.mjs tests/resource-admission.test.mjs`. The existing backend-termination test failed at its transient-error predicate after `pg_terminate_backend` followed by `client.query('SELECT 1')`. [focused.log](auditor-evidence/focused.log) retains the full failure and stack. This timing-dependent path passed in the later full gate; that does not invalidate the captured failure. HTTP impact here follows the inspected error mapping; unlike Q2-A1, a separate HTTP reproduction was not performed.

Required correction: preserve or normalise the captured transport error through rollback/discard and add a deterministic regression for termination observed between statements, including recovery and HTTP retry semantics.

## Checks actually performed

Environment: Node v24.19.0 (matches `.node-version`), npm 11.9.0, dedicated synthetic PostgreSQL 15 on loopback port 55440, supplied Chromium and Caddy. Cloud runtime skill/network policy inspected; only dependency installation and disposable/local checks performed. Existing dedicated PostgreSQL was accepting connections; no cluster restart was needed.

- `npm run setup`: completed, 238 packages installed with pinned lockfile, scripts/bin links disabled. Tool output retained in the audit conversation; no separate setup log was created.
- Focused four-file command above: **10 passed, 1 failed**. Pool exhaustion, server cancellation with rollback, row-lock timeout, idle-client recovery, hash compatibility, malformed-hash sanitisation, password overload and resource admission passed. Health under auth burst: 24.2 ms against 250 ms threshold.
- `npm run check`: lint, formatting, both typechecks/builds and **104/104 tests passed**, zero skipped. Health-under-auth diagnostic: 23.3 ms. See [check.log](auditor-evidence/check.log).
- Sequential `npm run test:commandmaps:browser`, `npm run test:platform:browser`, `npm run test:activation:browser`: each reached its PASS completion marker. Activation reported port 5173 occupied and selected another port. See corresponding browser logs.
- Sequential `node tests/ingress-contract.mjs` and `node tests/ingress-login.mjs` with supplied Caddy: both reached PASS markers. Local HTTP fixture only.
- Independent stalled-handshake reproduction: confirmed Q2-A1.
- Supplied `q2-SHA256SUMS.txt`: all entries verified. This establishes file integrity, not correctness of supplied claims.
- Source review covered changed runtime modules, password call sites, budget/password tests, relevant environment helpers and pinned pg/pg-pool error handling. Shared-lock login recheck, existing hash representation and transaction-local authorisation protections remain present; full tests exercise revocation, receipts, worker fencing and historical migration compatibility.

The sequential gate process completed during an interruption; its process handle was no longer available on resumption. Full check's final test summary and each browser/ingress terminal PASS marker are retained. Per-command shell exit output after the interruption was not recovered, so this report does not invent exit codes for those commands.

## Limits and unverified requirements

The two findings leave Q2 transient database retry semantics unmet. No production deployment, live provider/customer database, AWS mutation, TLS/load-balancer or production capacity validation was performed. Budgets are explicitly local measurements, not production guarantees. The baseline measurement script was inspected but not independently rerun; responsiveness was independently measured by focused/full tests. All listed required suites were launched and completion evidence inspected; none is inferred from builder claims.

Browser tests regenerated tracked screenshots `docs/plans/evidence/F11E/desktop-detail.png` and `narrow-officer.png`. Git HEAD remained pinned and no product source was edited. The input manifest fingerprints the original candidate inputs; those two generated output files are not inputs in that manifest. No code fixes, commit, push, merge or deploy were made by this auditor.
