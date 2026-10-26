# Independent Q3 audit — changes_required

Timestamp: 2026-10-26T05:41:40Z. Task: WHOLE Q3, task contract v1.0.0, `/workspace/work/quality-audits/q3-fix5/task.md` (SHA256 `11d54b9f578fefdce6277851905a735312cc5559d9d611f912299d0ddee27ab0`). This assesses the entire contract, not only the latest patch.

Accepted spawn configuration reported in the assignment: `gpt-6-astra`, effort `low`, `fork_turns=none`. This auditor received a fresh task message, without builder conversation history. No serving-model/effort introspection endpoint is available to independently attest the actual backend configuration; the requested/accepted configuration is not substituted for that unavailable evidence. No hidden reasoning is included.

Baseline: `fc722d19d26fdad8fc66eb2a0809f49856ca19dd`. Candidate: `49c2acd0ff3019b37245d45ec4c99ef37c3a353d`. Verified candidate parent: `b75a2a390412865f965f507b1408fad88556a48b`. Detached checkout: `/workspace/work/quality-audits/q3-fix5/published`. Initial and final tracked worktree status clean. No product source edits, push, merge, deploy, live regeneration, or AWS mutations. Two screenshots overwritten by the existing browser suite were copied to `generated-output/` and restored from the candidate commit.

## Finding

**Q3-A1 — Medium / P2: Platform acceptance still contains an unsynchronized response-release assertion.** Location: `tests/browser-platform.mjs:513`; route-handler ordering at lines 484–490; gate release at lines 510–512.

Reproduction actually run, once, against the unmodified candidate:

```bash
cd /workspace/work/quality-audits/q3-fix5/published
source /workspace/work/quality-bootstrap/session-env.sh
npm run test:platform:browser
```

The first sequential browser suite exited 1: `Expected: true; Received: false`, at line 513, `expect(obsoleteResponseReleased).toBe(true)`. Raw evidence: `browser-platform.log`; exit record: `browser-exits.log`.

The route handler waits for `sessionReadGate.promise`, then asynchronously awaits `route.fulfill(...).catch(...)`, and only then sets `obsoleteResponseReleased=true`. The test resolves the gate, awaits a negative sign-in-heading assertion already satisfied by the current Health page, then synchronously asserts the flag. That DOM assertion does not establish route-handler completion. The observed failure is a test ordering defect; it does not demonstrate a product session-clearing failure. It nevertheless violates Q3's deterministic acceptance requirement and the requirement that all browser suites pass without masking failures through retries. A later passing run does not close it.

Required correction: expose and await explicit handler completion (including the cancelled-request settlement path) before checking the release flag and final session/UI state. Retain the cancellation assertion and obsolete-401 scenario, and repeat the controlled schedule. No production fix is justified by this failure alone.

A separately labeled diagnostic copy, outside the candidate tree, replaced only that synchronous assertion with `expect.poll` and added diagnostic logging; imports/asset-root paths were rebased to the candidate. It passed and exercised the remaining HTML/interrupted-body 403 checks. In that diagnostic, the flag was already true at the original assertion point. This is supporting evidence of scheduling sensitivity and remaining coverage, **not** an unmodified-candidate acceptance pass. See `platform-diagnostic.mjs`, `platform-diagnostic.log`, and `diagnostic-exits.log`.

## Checks actually run

All service/browser execution used the supplied environment script, dedicated synthetic PostgreSQL 15 on loopback port 55440, installed Chromium, and local Caddy. Network/loopback commands used the required escalated execution route. The environment runtime skill/policy was inspected; no credentials were printed or used for external application access.

| Check | Observed result |
| --- | --- |
| `npm run setup` | Pass; 238 locked packages installed |
| `node --test tests/api-transport.test.mjs` | Pass, 2/2 |
| `npm run check` | Pass: lint, formatting, both typechecks/builds, 107/107 tests; zero skips/failures |
| `npm run test:platform:browser` | **Fail**, first run, finding Q3-A1 |
| `npm run test:commandmaps:browser` | Pass, run after Platform completed |
| `npm run test:activation:browser` | Pass, run after CommandMAPS completed |
| `node tests/ingress-contract.mjs` | Pass, actual local Caddy |
| `node tests/ingress-login.mjs` | Pass, actual local Caddy + API |
| Independent real HTTP interrupted-body probes | Pass: 401, 403, 404, 503 preserved as status-bearing network errors |
| Independent controlled stale-detail races | Pass, three sequential fresh browser contexts, each with one gated stale 200 and three persistent HTML 403 responses under explicit focus/interval/focus scheduling |
| Separately modified Platform diagnostic | Pass; expressly not candidate acceptance |

The full check and browser sequence ran concurrently, using separate disposable test databases; the three browser suites themselves were strictly sequential. The independent browser probes and Platform diagnostic ran subsequently and sequentially. No browser suite was retried as acceptance. Raw logs retain the original Platform failure.

Independent probes (`independent-probes.mjs` / `.json` / `.log`) assert each selected ID, four selection/refresh events, increasing request generation, three denied refreshes, no raw HTML, and only the recovery button remaining after release of the stale success. They use new synthetic requests and actual candidate UI. They are audit-only artifacts, not proposed product tests or CI additions. Candidate controlled race output is preserved in `suite-controlled-detail-race.json`.

## Contract assessment and evidence boundaries

Source inspection covered the shared transport and declarations; both main apps; CommandMAPS Activation and RequestComposer; Platform AdminActivation, Onboarding and API wrapper; the specified browser/unit tests, selected-detail pagination helper, package scripts and CI workflow. The shared 10-second transport timer covers fetch and body consumption, composes caller abort signals, sanitizes error messages, and preserves available HTTP status for parse/body failures. All direct frontend fetch use is routed through that shared primitive. Prefixes remain `/api` and `/api/platform`; auth/CSRF headers remain at their respective callers.

The executed CommandMAPS suite verifies queue outage/offline retry and timeout recovery, selection/history races (including obsolete 401 and A→B→A selection), committed/lost responses, all three invalid success-body forms, independent history/detail reconciliation, and no duplicate writes. Candidate source retains per-request retry state and generation/scope checks. Activation suite covers cancellation/navigation, issuance/reissue, one-use redemption, session revocation and least privilege. Full API and actual Caddy tests provide additional evidence for HttpOnly sessions, CSRF, idempotency and authority isolation. Builds regenerated tokens without tracked token drift. No backend product changes exist in the baseline-to-candidate delta inspected.

The original M1 controlled scenario is instrumented by selected request ID, operation and generation, with persistent denial and controlled focus/interval scheduling; both the full CommandMAPS execution and the three independent controlled races passed. No product defect was demonstrated in these reproduced paths. The remaining acceptance defect is Q3-A1.

The unmodified Platform run stopped before its final denial-body checks; those later checks were reached only by the labeled diagnostic. Therefore a clean unmodified full Platform acceptance run remains unverified. This audit does not exhaust every endpoint × body form × cancellation interleaving; it combines source inspection, the executed contract tests, and the explicit independent probes. Live cloud/TLS/production behavior is outside the authorized synthetic/loopback scope. A pass verdict is not warranted while the observed deterministic-acceptance defect remains.

## Input and historical evidence integrity

`audited-input-SHA256SUMS.txt` records candidate product/test/workflow inputs, the task contract and environment script. `audit-output-SHA256SUMS.txt` records the raw audit outputs and probe scripts. `manifest-verification.json` contains every historical manifest entry's expected/actual hash and commit. Seven manifests were verified against their own recorded-file commits, not incorrectly against the latest tree: **178/178 entries matched**.

| Manifest | Commit used | Matching entries |
| --- | --- | --- |
| q3-SHA256SUMS.txt | 5e3e7b90196599815deb39d3007430ef5f09b6da | 26/26 |
| q3-fix/SHA256SUMS.txt | 4cafc3f5cbd15047c4d04a092279cfc8ab86a99a | 27/27 |
| q3-fix2/SHA256SUMS.txt | 6fab138ffe0290ab66358d272518b0630d0fae76 | 32/32 |
| q3-fix3/SHA256SUMS.txt | 44895f86f6d6683d4f0b8e2013848dcec98a6c38 | 18/18 |
| q3-fix4/SHA256SUMS.txt | 60bb8c443f99a57d3f7c31f000d06523baccafa2 | 44/44 |
| q3-fix5/input-SHA256SUMS.txt | 49c2acd0ff3019b37245d45ec4c99ef37c3a353d | 10/10 |
| q3-fix5/output-SHA256SUMS.txt | 49c2acd0ff3019b37245d45ec4c99ef37c3a353d | 21/21 |

Historical manifest verification reads blobs for hashing only, including entries naming excluded narratives; those narratives were not used as assessment evidence. Prior independent reports, resumption audit conclusions, builder handoffs/ledgers/checkpoints, diaries/conversations and broad Empirical memory were not consulted for conclusions. Historical raw logs were inspected only as recorded outputs; any appended explanatory prose was not relied upon. Matching hashes establish integrity, not correctness or determinism of a historical passing run.

**Verdict: changes_required.** Fix the demonstrated Platform harness ordering defect and re-establish deterministic browser acceptance. Preserve this first failure; do not replace it with a passing retry.
