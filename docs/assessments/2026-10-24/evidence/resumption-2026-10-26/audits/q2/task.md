Q2 task contract v1.0.0

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


Constraints: preserve council/session authority, revocation ordering, worker fencing, idempotency, receipt atomicity, lost-response recovery and historical migration compatibility. Synthetic disposable DB and loopback checks only; no merge/deploy/AWS mutation/live customer data. Tests under tests/ and discovered in local/CI checks. Baseline accepted Q1 product1cb963d8eee9e12e62de39fa106d439d0af61ea0; final audit base/candidate identities supplied separately. Required report: task/version,model/effort,fresh-context mechanism,base/candidate SHA,input manifest/hashes,checks actually run,findings severity/location/repro,unverified requirements,limitations,timestamp,verdict pass/changes_required/blocked. No hidden reasoning requested.
