# Independent Q3 audit — changes_required

Timestamp: 2026-10-25T18:33:59Z. Task: Q3 task contract v1.0.0, complete scope in `task.md` (SHA-256 `11d54b9f578fefdce6277851905a735312cc5559d9d611f912299d0ddee27ab0`).

Fresh-context delegated audit; accepted spawn configuration supplied by the parent: `gpt-6-astra`, reasoning effort `low`, `fork_turns=none`. Serving model/effort cannot be independently introspected from this worker; this records the accepted configuration, not a claim of serving telemetry. No prior audit reports, builder handoff, ledger/checkpoint conclusions, diaries, conversations, or Empirical memory were used as evidence.

Pinned base: `fc722d19d26fdad8fc66eb2a0809f49856ca19dd`. Candidate: `44895f86f6d6683d4f0b8e2013848dcec98a6c38`, parent `6fab138ffe0290ab66358d272518b0630d0fae76`. Reviewed detached checkout: `/workspace/work/quality-audits/q3-fix3/published`.

## Finding Q3-A1 — medium: denied Platform detail leaves stale pack controls actionable

Locations: `apps/civicmaps-platform/src/main.tsx:204`–209 (detail failure retains prior `detail`), `main.tsx:539` (`loaded={Boolean(detail)}`), and `apps/civicmaps-platform/src/PackAssignments.tsx:38` (controls disabled only for busy/unloaded state).

Independent reproduction: sign into a fresh synthetic Platform fixture, navigate to an existing municipality's packs page, wait for successful detail and enabled switches, intercept that exact municipality-detail GET with HTML 403, advance the controlled browser clock 16 seconds, and confirm the denial was received. The page shows the generic safe error but retains previous configuration activity and all nine enabled pack switches. The source confirms this is retained state after an explicit denial, rather than an unsettled request.

Executable probe: `audit-evidence/denied-platform-detail.mjs`. Definitive output: `audit-evidence/denied-platform-detail-corrected.log`. Run from the pinned checkout after sourcing `/workspace/work/quality-bootstrap/session-env.sh` with `node /workspace/work/quality-audits/q3-fix3/audit-evidence/denied-platform-detail.mjs`.

Expected under the whole Q3 acceptance contract: explicit denial must leave no stale actionable detail; invalidate or gate controls until a fresh authorized response restores them. Actual: all nine switches have `disabled:false`. This is a client-state recovery defect, not a demonstrated server authorization bypass. Add an executable regression in the appropriate browser suite, including restoration after a successful authorized refresh.

## Verification performed

All commands ran on synthetic PostgreSQL 15 at loopback port 55440, local Chromium and local Caddy, with the supplied environment file. No live data regeneration, AWS mutation, push, merge or deployment occurred.

- `npm run setup`: passed.
- `node --test tests/api-transport.test.mjs`: passed, 1 aggregate test covering JSON/HTML/empty/malformed responses, 401/403/503 status, network errors, deadline/body timeout, cancellation and uncertain writes.
- `npm run check`: passed, including lint, formatting, both TypeScript applications, builds and 106 tests (106 passed, none failed/skipped/cancelled).
- Three browser suites ran sequentially, once each, without rerunning failed product suites: Platform, CommandMAPS, activation — all passed. Logs retain uncertain-session cancellation, history ABA cancellation, committed malformed response reconciliation and history/filter race observations.
- Actual Caddy `tests/ingress-contract.mjs` and `tests/ingress-login.mjs`: passed.
- Independent Platform 403 probe: reproduced Q3-A1. Initial probe used an incorrect button-role locator; preserved initial failure log, corrected to the actual switch role, then obtained the definitive reproduction.
- Focused M1 response-gate block extracted from the pinned executable test and run in three fresh browser contexts, with explicitly controlled focus/interval scheduling, exact selected ID, generation assertions, held stale selection read and three later denied reads: 3/3 passed in `audit-evidence/repeated-m1-settled.log`. Denial stayed installed through the final no-actionable-detail assertion.
- All input hashes are recorded in `audit-evidence/input-SHA256SUMS.txt`. All 103 manifest entries matched at their relevant commits: original Q3 `5e3e7b9`, fix `4cafc3f`, fix2 `6fab138`, fix3 `44895f8`. Verification hashes bytes only for excluded narrative/report entries; their conclusions are not evidence. Details: `audit-evidence/manifest-verification.json`.
- Generated token files have no diff. Candidate source, tests, package files and lockfile remain unchanged. Browser execution updated two tracked screenshot artifacts under `docs/plans/evidence/F11E`; these are generated evidence, not source edits.

Focused harness failures are retained rather than hidden: the first M1 harness lacked request fixtures; after fixtures were added, two iterations passed and the third did not observe its refresh-complete event within 5 seconds. The final harness adds an initial network-idle barrier before clearing instrumentation and starting the controlled schedule; three iterations then passed. These are harness revisions, not retries counted as product acceptance. The unexplained intermediate missing completion is not treated as proof of a product defect or as independently closed merely by a passing rerun.

## Whole-contract assessment and limits

Source review covered the shared transport and declarations; CommandMAPS main, activation and composer; Platform main, API wrapper, activation management and onboarding; all inventoried browser/transport tests and CI discovery. Both API prefixes remain `/api` and `/api/platform`; no backend API or authority changes appear in the Q3 source diff. Existing HttpOnly-session/CSRF, scope, version and idempotency constraints were exercised by the full regression suite and ingress checks. CI invokes `npm run check`, all three browser suites and both ingress checks; new product tests are under `tests/` and discoverable.

The shared primitive provides a 10-second deadline through body consumption, preserves HTTP status even for unreadable/error body forms, uses safe displayed error text, propagates cancellation, and marks uncertain write outcomes. Queue/detail/history/directory/login/activation/mutation paths use it. Source guards and passing controlled cases support stale selection/context/session isolation for the exercised paths. CommandMAPS offline retry, retained action keys, independent detail/history reconciliation, lost committed responses and malformed success bodies are exercised; Platform uncertain-write scope cancellation is exercised. The concrete Platform denied-detail finding prevents whole-contract acceptance despite these passes.

This is bounded synthetic verification, not exhaustive exploration of every endpoint/body/status/scheduling combination. Not every individual UI call received its own timeout/offline/cancellation test. Administrator link reissue intentionally uses fresh tokens/keys with refreshed status, and redemption directs the user to sign in after uncertain completion; this audit did not independently test every committed-loss variation of those flows. Real deployment TLS and live cloud provisioning were outside scope. The initial focused-harness refresh-completion anomaly remains a limitation; no passing rerun is offered as its causal explanation. No claim is made that Q3 is fully closed.

Verdict: **changes_required**, based on independently reproduced Q3-A1.
