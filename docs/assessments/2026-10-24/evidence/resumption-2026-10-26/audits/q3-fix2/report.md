# Independent Q3 audit — changes_required

Task: **Q3 — Make browser recovery and acceptance deterministic**, contract **v1.0.0** (`task.md`). Timestamp: 2026-10-25T18:13:36.578183+00:00.

Auditor configuration supplied by accepted fresh spawn: **gpt-6-astra / low / fork_turns=none**. This report records that orchestration configuration; no serving-backend model/effort introspection is available. The auditor received the contract, pinned product and evidence inventory, without inherited builder conversation. Prior audit reports/conclusions, builder handoff/checkpoint/ledger narratives, diaries and broad Empirical were excluded. Existing executable product tests and raw manifests/logs were inspected independently of their authors' conclusions.

Baseline: `fc722d19d26fdad8fc66eb2a0809f49856ca19dd`. Candidate: `6fab138ffe0290ab66358d272518b0630d0fae76`. Parent: `4cafc3f5cbd15047c4d04a092279cfc8ab86a99a`. Detached checkout: `/workspace/work/quality-audits/q3-fix2/published`; HEAD verified unchanged after execution. No source edits, push, merge, deployment, AWS calls or live data regeneration were performed. Browser tests regenerated two tracked F11E PNG screenshots; these are test outputs, not candidate source changes.

## Verified finding

**Q3-A1 — P2 / medium: an obsolete recovery session denial clears the current Platform UI session.**

Location: `apps/civicmaps-platform/src/main.tsx:229` and `:233–235`, inside `perform`'s uncertain-write recovery. The recovery GET `/api/platform/auth/session` has no scope signal. Its success branch checks `expectedScope`, but its catch branch calls `clearSession()` on 401 without checking whether navigation/session scope has changed. Navigation therefore neither cancels this request nor prevents its obsolete denial from clearing the current UI.

Controlled reproduction, executed once successfully against the pinned candidate:

1. Sign in as the synthetic platform operator and open Alpha's pack page.
2. Intercept its pack POST with HTML 503, which correctly enters uncertain-write recovery.
3. Hold the ensuing recovery GET `/api/platform/auth/session` behind an explicit gate.
4. Navigate to `#health` and assert the Network health heading is visible.
5. Release the held recovery GET as HTML 401.
6. Observe Sign in to Platform replacing the current view, while a separate real server session GET still returns 200. The held session request was not cancelled.

Raw observation: `{"observed":"obsolete reconciliation session 401 cleared current authenticated view","sessionCancelled":false,"serverSessionStatus":200,"uiSignIn":true}`.

Reproducer: `audit-stale-session.mjs`; evidence: `audit-stale-session.log`. Both are preserved unchanged. Re-run from the pinned checkout after sourcing `/workspace/work/quality-bootstrap/session-env.sh`: `node ../audit-stale-session.mjs`. Its exit 0 means the asserted defect was observed, not that the product passed. This violates Q3's requirement to ignore stale outcomes after context/session changes. No server logout, cross-council disclosure or duplicate write is claimed. Carry the original scope signal through reconciliation and check scope on rejection as well as success; add the demonstrated navigation race to the executable browser suite.

## Checks actually executed

Environment: Node v24.19.0, npm 11.9.0, dedicated synthetic PostgreSQL 15 on loopback port 55440, Playwright Chromium and local Caddy. Network/loopback executions used approved escalation. Browser suites were sequential. Full integration checks ran concurrently with part of that sequence in separate disposable databases. No failed product suite was retried.

| Check | Actual result | Raw evidence |
| --- | --- | --- |
| `npm run setup` | exit 0 | `audit-setup.log` |
| `node --test tests/api-transport.test.mjs` | 1 test passed | `audit-transport.log` |
| `npm run check` | exit 0; lint, formatting, typecheck/build; 106 tests passed, 0 failed/skipped | `audit-check.log` |
| `npm run test:commandmaps:browser` | first run exit 0 | `audit-commandmaps-browser.log`, `.exit` |
| `npm run test:platform:browser` | first run exit 0 | `audit-platform-browser.log`, `.exit` |
| `npm run test:activation:browser` | first run exit 0 | `audit-activation-browser.log`, `.exit` |
| `node tests/ingress-contract.mjs` | first run exit 0 | `audit-caddy-contract.log`, `.exit` |
| `node tests/ingress-login.mjs` | first run exit 0 | `audit-caddy-login.log`, `.exit` |
| Generated token diff | unchanged | inspected `git diff --exit-code` |
| Independent stale recovery-session probe | defect reproduced, exit 0 observed before runtime interruption | `audit-stale-session.mjs`, `.log` |
| Independent real HTTP transport probe | exit 0 | `audit-live-transport.mjs`, `.log`, `.exit` |
| Controlled M1 repetitions | all three passed in fresh browser contexts, no assertion retries | `audit-repeat-race-v3.mjs`, `.log`, `.exit`; `audit-controlled-race-1.json` through `-3.json` |

Runtime interruption occurred between initial suite execution and completion of repetition work. Initial setup/full-check terminal exit 0 and stale-session probe exit 0 were observed before interruption; they are not inferred from missing sessions. The five browser/Caddy exit files survive with value 0. The dedicated synthetic database was restarted before resumed repetition work.

The standalone repetition harness had two audit setup failures, preserved in `audit-repeat-race.mjs/.log` and `audit-repeat-race-v2.mjs/.log/.exit`: the first assumed a pre-existing request as a capture-binding source; the second did not refresh the UI after inserting fixtures and failed at the initial row-count precondition. Neither reached the controlled race. Version 3 creates the prerequisite request and explicitly refreshes after insertion, then invokes the unchanged candidate `verifyM1Discovery` three times. This is a corrected harness setup, not a passing rerun offered to close a demonstrated product race. The first interrupted harness's exit code was not recovered and is not inferred; v2 recorded exit 1. Version 3 recorded exit 0 and three explicit pass lines.

## Full-contract assessment

- **M1 determinism:** selected UUID, operation, scope/load/detail generations and explicitly fired focus/interval sources are instrumented. The held selection response is released only after three newer 404 detail refreshes and unavailable/no-action assertions. Candidate tests also cover detail during pagination, failed queue continuation, stale search, and held history after filtering. Three controlled repetitions passed; per-run JSON preserves UUID, generations, schedule and response outcomes. These results support the covered M1 schedules, rather than claiming all schedules are proven.
- **Status-safe transport:** both application wrappers use the shared primitive while retaining `/api` and `/api/platform`. The focused test exercises JSON/HTML/empty/malformed 401/403/503, invalid 200 reads/writes, network errors, timeouts and cancellation. Independent real loopback HTTP tests additionally verified HTML rejection, stalled body deadlines retaining received 401/403/503 status, caller cancellation, and one committed empty 201 classified as uncertain. Raw upstream HTML was not exposed in those checks.
- **Lifetimes and stale outcomes:** the shared 10-second default covers reads and writes, and the inspected selection/history/directory/login/activation/mutation code uses abort controllers and scope/generation checks in substantial paths. Browser coverage proves queue timeout/offline retry control recovery, selected-history ABA cancellation, held detail/pagination handling and direct Platform mutation cancellation on navigation. **The additional recovery-session path fails**, so the complete stale-outcome/cancellation requirement is not met.
- **Write uncertainty and authority:** CommandMAPS browser checks confirmed server-committed lost responses plus empty/malformed/HTML successful confirmations, no automatic write replay, independent detail/history reconciliation and retained same-action retry keys. Platform checks confirmed committed empty pack confirmation reconciliation without a duplicate write. Prefix/auth/CSRF/idempotency and tenant/platform isolation are supported by source inspection, the full integration suite, activation suite and actual Caddy tests. The recovery-session defect is not excused by those passes.
- **Local/CI discovery:** `package.json` discovers `tests/**/*.test.mjs`; the transport test is included in `npm run check`. Browser helpers are imported by the root browser suite and the three browser commands are present in `.github/workflows/ci.yml`. This verifies wiring and local execution, not a new remote CI run. Audit probes outside `tests/` are independent evidence only; they do not satisfy the product's regression-test placement requirement.

## Input integrity and limitations

Contract SHA-256: `11d54b9f578fefdce6277851905a735312cc5559d9d611f912299d0ddee27ab0`.

`audit-input-SHA256SUMS.txt` contains the contract and requested product/test inventory plus CI/lockfile inputs; SHA-256 `7448ff6d36b60f5d798a3d97a866ebf9e7ecd0748f5a3a47a03b3a9a84816983`. `audit-product-SHA256SUMS.txt` records 138 tracked app/test/API/script/config inputs; SHA-256 `a818d1ae7dac53c6fe4c2adef025bbe21148dd175a1be284cc97128a53e5e10a`. Source remains pinned and unmodified.

`audit-historical-manifests.json` records 43 relevant product/raw-log comparisons, all matching: original Q3 manifest against its own `5e3e7b90196599815deb39d3007430ef5f09b6da` commit and fix2 manifest against `6fab138...`. Historical hashes were not incorrectly compared to later edited files. Excluded narrative/report files listed within manifests were not read or used as proof.

Validation is synthetic, loopback, Chromium and local HTTP only. No production TLS, remote CI, live cloud behavior, other browser engines or exhaustive Cartesian matrix of every response shape against every UI operation was executed. Every login/activation/create-write timeout and lost-confirmation combination is not independently proven by the selected browser cases. The independently demonstrated stale-session defect alone is sufficient for **changes_required**; passing checks do not establish full Q3 acceptance. Later builder fixes are outside this pinned report.
