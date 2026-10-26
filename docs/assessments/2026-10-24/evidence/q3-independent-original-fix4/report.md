# Independent Q3 product audit

Verdict: **changes_required**.

Task: Q3 — Make browser recovery and acceptance deterministic, whole task contract v1.0.0, `/workspace/work/quality-audits/q3-fix4/task.md`. This audit covers the full contract, not only the latest patch.

Provenance: accepted auditor spawn was `gpt-6-astra`, effort `low`, `fork_turns=none`, with fresh task/product context. This is the supplied spawn configuration; no serving-model introspection interface was available to independently verify the underlying serving model or effort. Audit resumed in the same auditor context after an allowance reset. Prior audit reports/conclusions and builder handoff/ledger/checkpoint reasoning were not used as product proof. Historical raw logs and manifest hashes were inspected; any explanatory prose embedded in logs was not accepted as evidence of correctness.

Pinned baseline: `fc722d19d26fdad8fc66eb2a0809f49856ca19dd`.
Pinned candidate: `60bb8c443f99a57d3f7c31f000d06523baccafa2`.
Candidate parent: `44895f86f6d6683d4f0b8e2013848dcec98a6c38`.
Checkout: `/workspace/work/quality-audits/q3-fix4/published` (detached). Subsequent builder changes are outside this verdict.

## Finding Q3-A1 — Medium: interrupted denied response retains actionable Platform detail

Locations: `apps/shared/api-transport.mjs:105–109`; `apps/civicmaps-platform/src/main.tsx:204–218`; pack controls consume `Boolean(detail)` at `apps/civicmaps-platform/src/main.tsx:549–555`.

The transport correctly retains a received HTTP status when body reading fails, but wraps that failure in `ApiTransportError`. Platform detail refresh recognises 401/403/404 only when the error is an `ApiError`. Consequently an HTTP 403 response with a truncated body follows the transient-network branch, leaves cached detail available, and leaves all nine pack switches enabled. Complete HTML 403 instead clears detail and disables all nine switches. This violates the task's status-safe recovery/no stale actionable detail requirement. It is a client recovery defect; this audit does not claim a server-authorisation bypass.

Reproduction, using only disposable synthetic data and loopback:

1. Source `/workspace/work/quality-bootstrap/session-env.sh`; from the pinned checkout run `node /workspace/work/quality-audits/q3-fix4/native-denial.mjs`.
2. The probe signs into Platform, opens a seeded council's pack page and confirms controls are enabled.
3. Its loopback middleware returns HTTP 403 for the next detail refresh, writes an HTML prefix, then destroys the socket after 30 ms. Native browser fetch receives the status but cannot finish reading the body.
4. The UI shows the safe network error yet all nine switches remain enabled. The same probe first performs a complete HTML 403 control: all nine switches become disabled.

Evidence: `native-denial.mjs`, `native-denial.log` (exit 0, both observed states recorded); independently reproduced first with an errored browser response stream in `independent-denial.mjs` and `independent-denial.log`. The native probe uses no fetch replacement. The probe's exit 0 means its observations completed, not that product acceptance passed.

Required correction: apply known denial status consistently when body consumption fails or times out, while preserving caller-cancellation/stale-generation suppression and uncertainty semantics. Add an executable regression under `tests/` covering the interrupted-denial path and stale controls, and ensure local/CI discovery. The existing complete-HTML-403 regression does not cover this combination.

## Checks actually run

Environment: Node v24.19.0, npm 11.9.0 (matching repository settings), prepared PostgreSQL 15 on loopback port 55440, prepared Chromium and Caddy from session-env. Test databases were disposable synthetic databases. No AWS mutation, live-data regeneration, push, merge or deployment occurred.

- `npm run setup`: passed, 238 packages installed from committed lockfile with scripts/bin links disabled.
- `node --test tests/api-transport.test.mjs`: passed, one composite transport test, covering JSON/HTML/empty/malformed responses for 401/403/503, invalid successful responses, safe messages, prefixes, network failure, timeout including body timeout, and caller cancellation.
- `npm run check`: passed lint, formatting, both app typechecks/builds, and 106/106 tests, zero failures/skips. See `check.log`.
- Token drift check: `git diff --exit-code -- apps/commandmaps/src/tokens.css apps/civicmaps-platform/src/tokens.css` passed.
- Three browser suites ran sequentially, once each, without passing retries: CommandMAPS, Platform, activation. All exited 0. `browser-exits.txt` and the three browser logs retain results. These exercise offline recovery, timeouts, selection/history races, malformed server-committed write responses, reconciliation, session invalidation, controls, and normal user flows.
- `node tests/ingress-contract.mjs` and `node tests/ingress-login.mjs`: both passed against actual local Caddy, after the browser suites. Host/authority forwarding, session/client separation and login isolation were exercised over local HTTP.
- Independent interrupted-body denial probes: confirmed Q3-A1 through both an errored response stream and native truncated loopback HTTP.
- Focused repeated M1 checks: three sequential isolated runs of `repeated-m1.mjs` passed after correcting its missing fixture setup, with no product changes. Each invokes the pinned `verifyM1Discovery` helper; per-run controlled response/ID/generation evidence is retained in `repeated-m1-1.json`, `repeated-m1-2.json`, `repeated-m1-3.json`, with corresponding logs and exit records. These are planned repeats, not retries of a failed product assertion..

The initial independent denial harness queried the wrong table (`municipalities` rather than `platform_municipalities`); its failure is retained in `independent-denial-initial-harness-error.log`. After resumption, PostgreSQL was stopped; native/focused probe attempts failed with ECONNREFUSED before product execution. Those logs are retained as `*-environment-unavailable.log` and the associated exit ledger. PostgreSQL was restarted using the prepared synthetic configuration. The initial standalone M1 harness lacked a source request for overflow-fixture ownership; it failed at its fixture assertion before running M1 and is retained in `repeated-m1-initial-fixture-error.log`. Harness corrections do not convert these initial attempts into passing product tests.

## Contract assessment and evidence integrity

Shared transport extraction preserves the separate `/api` and `/api/platform` prefixes and applies a default 10-second request deadline. Complete-body error forms use safe messages; no raw upstream HTML appeared in exercised UI cases. Source review covers queue/detail/history/directory/login/activation/mutation callers, abort controllers, generation/scope guards, action retry keys and reconciliation. Existing server API/auth/idempotency implementations are unchanged from the baseline. Full tests and Caddy checks support preservation of council/platform authority, sessions/CSRF and idempotency within the synthetic environment. They do not erase Q3-A1.

M1 instrumentation identifies selected request ID, operation, request generation, load generation and scope generation. Its controlled scheduler gates focus/interval refreshes and holds a stale selection response while later denied refreshes settle. The denial remains active through the assertions. The supplied browser run completed those assertions; isolated repeats are recorded above. Local `npm test` uses nested `tests/**/*.test.mjs` discovery; CI runs `npm run check` and all three browser scripts, which invoke the relevant browser helpers. CI configuration was inspected; no remote CI run was initiated or claimed.

Input hashes are in `input-SHA256SUMS.txt` (SHA-256 `1a61d93d862bb21d3b7b1d9b313db47c9cbbf13789b44c5f5c387adf138c70e7`), including the enumerated product/tests, package manifests, CI workflow and task. Task SHA-256: `11d54b9f578fefdce6277851905a735312cc5559d9d611f912299d0ddee27ab0`.

All 147 entries across five raw Q3 manifests match the committed bytes at their respective manifest commits:

| Manifest | Commit | Entries |
| --- | --- | ---: |
| q3-SHA256SUMS.txt | 5e3e7b90196599815deb39d3007430ef5f09b6da | 26 |
| q3-fix/SHA256SUMS.txt | 4cafc3f5cbd15047c4d04a092279cfc8ab86a99a | 27 |
| q3-fix2/SHA256SUMS.txt | 6fab138ffe0290ab66358d272518b0630d0fae76 | 32 |
| q3-fix3/SHA256SUMS.txt | 44895f86f6d6683d4f0b8e2013848dcec98a6c38 | 18 |
| q3-fix4/SHA256SUMS.txt | 60bb8c443f99a57d3f7c31f000d06523baccafa2 | 44 |

`manifest-verification.json` records expected/actual hashes and commit mapping (SHA-256 `79c5d230717e08cd972a142fcb5b6cf5ea3116fac5647b73b4b2dbdb0dcc2b4a`). Hashing excluded prior reports/narratives as proof: any such referenced entries were verified as bytes only, not read as audit conclusions. Historical passing runs establish provenance, not current acceptance.

## Limits

No exhaustive proof of every possible response schedule, status/body combination or browser engine is claimed. Native interrupted 403 was directly reproduced; analogous 401/404 failure branches are apparent in source but were not independently exercised by this probe. Production TLS, remote infrastructure, live sessions and remote CI were outside the authorised scope. A rollback was not performed; extraction is isolated in shared files with separate caller wrappers, while safety tests remain under tests/. Audit probes are outside the product tree and are reproduction evidence, not a substitute for committed CI regressions.

Browser execution generated changes to two tracked evidence PNGs (`docs/plans/evidence/F11E/desktop-detail.png`, `narrow-officer.png`); no product source edits were made. Final source/hash verification and UTC timestamp: 2026-10-26T05:29:53.112534+00:00. All 19 recorded task/product input hashes still match; see `final-input-verification.log`..
