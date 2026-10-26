Q3 independent product assessment — **changes_required**

Task: “Make browser recovery and acceptance deterministic”, Q3 task contract v1.0.0. Assessed 2026-10-25T04:35:48Z. Pinned base `fc722d19d26fdad8fc66eb2a0809f49856ca19dd`; candidate `5e3e7b90196599815deb39d3007430ef5f09b6da`, verified at detached `/workspace/work/quality-audits/q3/published`.

Auditor spawn metadata supplied by the parent: `gpt-6-astra`, effort `low`, `fork_turns=none`. This was a fresh context with the task contract, product inventory and raw evidence locations, without inherited builder conversation/reasoning. The serving model cannot be introspected independently from this agent. No builder ledger, handoff, checkpoint narrative, earlier audit conclusions or Empirical notes were used as correctness evidence. Repository instructions were read; manifest checksums also covered excluded narrative files, without reading their contents. The cloud-environment runtime skill was read and current enforced network policy inspected. All execution used synthetic disposable PostgreSQL 15 databases, Chromium and loopback Caddy. No live-data regeneration, AWS mutation, push, merge or deployment occurred.

Two independently reproduced defects prevent acceptance:

1. **Medium / P2 — stale Platform mutation failure changes the new page/session.** `apps/civicmaps-platform/src/main.tsx:202` (`perform`), `:220` (`mutate`), `:260` (`toggle`). The pack mutation does not receive a cancellation signal or capture/check the detail/session scope. `perform` unconditionally passes its rejection to `fail`, whose 401 handling clears the session. Reproduction: sign in as synthetic Platform operator; open a council’s packs; intercept and hold POST `/api/platform/municipalities/:id/packs`; toggle a pack (confirm removal when necessary); navigate with the Network health link; release the old request as HTML 401. The new `#health` page is logged out, despite navigation having incremented `detailScope`. The pending request was not cancelled. Raw script [repro-stale.mjs](repro-stale.mjs), output [repro-stale.log](repro-stale.log). Exact output: `{"phase":"navigated while mutation pending","hash":"#health","aborted":false}` followed by `{"phase":"stale 401 logged out current page","alert":"The operation could not be completed","aborted":false}`. Safe HTML messaging works, but stale-outcome suppression does not. Capture the operation’s session/context scope, cancel owned work on exit, and ignore stale success/error/finalisation; apply consistently to registration, pack, route, directory refresh and activation mutations rather than only job-action success. Preserve uncertain-write retry identity/reconciliation.

2. **Medium / P2 — cancelled history read leaves a permanent loading state.** `apps/commandmaps/src/main.tsx:447` aborts `historyController` when queue search/filter changes; `:549` silently returns for cancellation; the history effect dependencies at `:585` do not restart when the selected request ID/version/scope stays unchanged. Reproduction: create a synthetic request, select it while holding its `/audit` read, enter a search with no matching queue row, then release the held read. After eleven seconds (longer than the ten-second transport lifetime), the selected detail still displays “Loading history for this request…”; the audit request was aborted and no replacement was made. Raw script [repro-history.mjs](repro-history.mjs), output [repro-history.log](repro-history.log): `{"phase":"history remains loading beyond transport lifetime after search cancellation","aborted":true,"reads":1,"audit":"Audit historyLoading history for this request…"}`. Keep selected-history ownership independent of queue-filter cleanup, or restart/transition the cancelled read to a recoverable state. Add an executable browser assertion for this exact sequence. The first scratch run lacked an explicit request fixture and failed setup; [repro-history-setup-failure.log](repro-history-setup-failure.log) is retained. The corrected reproduction creates its own fixture; this was not a passing retry of product acceptance.

Checks actually executed:

- `source /workspace/work/quality-bootstrap/session-env.sh; npm run setup`: passed, pinned lockfile installation. [audit-setup.log](audit-setup.log).
- `npm run check`: passed lint, formatting, both app typechecks/builds and 106 tests; zero failures, cancellations, skips or todo. [audit-check.log](audit-check.log). Generated token files had no changes.
- Sequential `npm run test:commandmaps:browser`, `npm run test:platform:browser`, `npm run test:activation:browser`: all passed first execution; no retry wrapper. Logs: [CommandMAPS](audit-test-commandmaps-browser.log), [Platform](audit-test-platform-browser.log), [activation](audit-test-activation-browser.log).
- Sequential `node tests/ingress-contract.mjs` and `node tests/ingress-login.mjs` with the dedicated Caddy binary: both passed. Logs: [contract](audit-ingress-contract.log), [login](audit-ingress-login.log).
- Two further `npm run test:commandmaps:browser` executions, each with a fresh disposable database, passed to repeat the controlled race. These additional repetitions overlapped other independent audit processes; the required three-suite sequence itself was serial. No failed suite was masked by repetition. Logs [run 2](audit-race-2.log), [run 3](audit-race-3.log); controlled traces [run 2 JSON](audit-race-2.json), [run 3 JSON](audit-race-3.json).
- The two independent scratch reproductions above executed against the pinned product and asserted the actual faulty UI state. They are audit artifacts outside the product, not a substitute for committed regression tests.
- Raw manifest verification: all 26 entries matched; product/raw-evidence-only verification is retained in [manifest-verification.log](manifest-verification.log). Final `git status --short` was empty. Browser-generated tracked screenshot changes were restored byte-for-byte from the pinned commit.

Acceptance evidence and remaining limits:

The shared transport preserves status for JSON/HTML/empty/malformed HTTP error bodies and suppresses raw upstream HTML. Its executable unit test covers 401/403/503, invalid successful bodies, network failure, timeout before headers and during body consumption, cancellation, and the Platform prefix. The browser suite independently exercised HTML 503 queue recovery, offline retry, ten-second timeout/button recovery, server-committed lost action response and retained-key recovery. The independent stale-mutation reproduction additionally exercised safe HTML 401 rendering. The API prefixes remain `/api` and `/api/platform`; no server authority, HttpOnly/CSRF or idempotency implementation was changed by this candidate, and the integration/ingress tests passed.

The controlled M1 reproduction identifies the exact selected request UUID, operations and monotonically increasing request generations in one scope; it holds the old selection read while three later focus/interval/focus refreshes return 404, keeping denial active until assertions complete. The reproduced trace and UI assertions passed repeatedly. It is a real controlled schedule, not merely a passing rerun. The stale selection request can be aborted by the new generation; releasing its route does not itself prove receipt of a late successful response, so these traces establish cancellation/denial handling, not every possible post-body-processing timing. Other out-of-order queue and selected-detail pagination cases also ran in the browser suite.

The full lifetime requirement is not complete: several mutation/reconciliation/manual retry paths still rely on the shared timeout without caller-owned cancellation; Platform mutation scope handling is inconsistent. The two defects above are concrete acceptance failures. The committed suite does not explicitly prove spinner/button recovery across every login/activation/directory/history/mutation and HTML/empty/malformed cross-product combination. No separate exhaustive matrix was claimed. CI configuration was inspected: nested `tests/**/*.test.mjs` is discovered by local `npm test`/`npm run check`; CI invokes check, all three browser suites and both Caddy checks. No remote CI run was executed in this audit.

Task SHA-256: `11d54b9f578fefdce6277851905a735312cc5559d9d611f912299d0ddee27ab0`. Candidate manifest SHA-256: `fd96c875637ac7878b63f77562a70f27b281aaafb82c0908fd4cf473963520ad`. Additional inputs and complete product/raw evidence SHA-256 inventory follow.

```text
fd96c875637ac7878b63f77562a70f27b281aaafb82c0908fd4cf473963520ad  docs/assessments/2026-10-24/evidence/q3-SHA256SUMS.txt
72156f9307466e1303a4ee379af7964a202166716959a1b2cb4934153f7f323e  .github/workflows/ci.yml
eec0b6034157c291d60ef55566a173f27ef0692a8f944c98030f1b65b9701f11  package-lock.json
ecc7eb4c25087e7a79e88b3212457ee851b3c7bd95c5bc59e20dd099b424b396  package.json
58d7c5dc1daeefa056499c79f2c90144919c3b2cb9207d2c58417622d31eed1e  apps/shared/api-transport.mjs
a8657c8e1d65494b9ece55be99b3088bf029f7a16533a4fce0b8ef3dde41ee52  apps/shared/api-transport.d.mts
d0f85571c79792a92bfe4805404e1cd236122d2094753207a0aec1b00c88859e  apps/commandmaps/src/main.tsx
36661c897efcf179214d6f128723e64109de67ed457beba23a33cb59e49824ae  apps/commandmaps/src/Activation.tsx
701c1391d92da8ee1db2d4cd89e5f7fe4d2e1d1be5af42b07909e4bc4d8dafb2  apps/civicmaps-platform/src/api.ts
17fbe48e086990c7d963ae83ff5892a87b0a5715e0464c061dd84638a746b4f5  apps/civicmaps-platform/src/main.tsx
3c9b21387a3cf1affb46944e04eb68bc9e989bd6fd759d5dd126de6f8fecdc16  apps/civicmaps-platform/src/AdminActivation.tsx
b13d43e50beb55721c868583302156df809700b3aee1eea06d8c0c0f186df6a2  apps/civicmaps-platform/src/Onboarding.tsx
077f5d425172ece342551bf2cbb44b3b2c11a48a6b071bb55fac24b7063eb8fa  tests/api-transport.test.mjs
189f51088097126d75c5bd746c63ad09e12e9e203abc9c1998dd6a4e34eadb38  tests/browser.mjs
d2b95903d0378de89ab582eae0ab753cfa565359b0b681e69b14b8c460656c57  tests/browser/m1-discovery.mjs
a5fbc438d892dd8619cde34e3a4673ec8062f895cfb0ae7c9983e1df3dbc385b  tests/browser-commandmaps.mjs
a62497be2b2abd5261a2dd6f5f0958b2701575b86c0f6c756bc1326af7e6c220  tests/browser-platform.mjs
17c90744ffc7fc7fbff0229ef8dbd2075197c8cbca43d68eb37b0b371eeaf3c9  docs/assessments/2026-10-24/evidence/q3-setup.log
1648554b7ecdb8770355efda2dff60ee3f5a35ae6d67378e7d7e0864a05f4b34  docs/assessments/2026-10-24/evidence/q3-check.log
efcf52e5a8ada7fb221575e7cbc023da7fb2f9c2ed882f905a3340654db7ac61  docs/assessments/2026-10-24/evidence/q3-api-transport.log
d10fac683cfc8b0d6415ef3f86e6a310fe9ee94f0eeb83ef7429aba8c7eb1384  docs/assessments/2026-10-24/evidence/q3-commandmaps-browser.log
a9937446018cc328827067df616271570fb24d5f3ccfcfc07c17ff3f086921d8  docs/assessments/2026-10-24/evidence/q3-platform-browser.log
f67016e1ab5b35d3edeee5b7ea377de86b6728f20c42f727f5d04a1d2e816133  docs/assessments/2026-10-24/evidence/q3-activation-browser.log
314cfa172f5c16d8d9e320c59f9760c864e777bdf3acd75e065c6658ab597dd2  docs/assessments/2026-10-24/evidence/q3-controlled-detail-race.json
bbf40f4d8c567ad0e2fde913bf011aeac82235d8c928453c69c09d51f42949b3  docs/assessments/2026-10-24/evidence/q3-ingress-contract.log
d46be2da3690293ff09aac585e4e12dd66c81bab9a4845b125b43c6b0c7692dc  docs/assessments/2026-10-24/evidence/q3-ingress-login.log

```
