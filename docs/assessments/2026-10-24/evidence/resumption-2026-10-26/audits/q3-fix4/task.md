Q3 task contract v1.0.0

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


Constraints: preserve exact API prefixes and council/platform authority, HttpOnly sessions/CSRF, idempotency, uncertain-write reconciliation, generation/scope guards and token drift. Synthetic/offline/loopback only; no live data regeneration, AWS mutation, merge or deploy. No passing retries as substitute for controlled race reproduction. Tests must be executable under tests/ and discovered by local/CI checks. Report actual model/effort/fresh context, pinned base/candidate SHA,input hashes,checks actually run,findings severity/location/repro,unverified requirements/limitations,timestamp,verdict pass/changes_required/blocked. No hidden reasoning.
