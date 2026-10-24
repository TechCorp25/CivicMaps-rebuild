# Independent M1 reassessment — e137894

Verdict: CHANGES_REQUIRED (documentation/handoff); local functional checks PASS. No product-code defect established.

Timestamp: 2026-10-22T19:55Z. Auditor: GPT-6 Astra Low, fresh delegated context, isolated detached checkout. No builder reasoning, prior audit reports or conclusions were used. Existing product documentation was inspected as a deliverable, not proof. Empirical agent notes and operational handoff narratives were excluded from reasoning.

Task/version: M1 contract in next-build-phase.md (hash below), milestone acceptance and independent-product-audit protocol.
Candidate: e1378947c59bb31299ff2596f531212e253be61f.
Tree: 6c1017f088284ec14f7c1e4089771e3ac7dee9ff.
Local candidate branch verified: codex/civicmaps-dispatch-m1.
Baseline and merge-base: d4921eb1c37550d9ca1b53a5615242922abfa4ad.

## Findings

1. Medium — required M1 handoff documentation is not reconciled. `docs/plans/dispatch-build/milestones/M1-complete-shared-discovery.md:3` still states planned/not implemented. `docs/plans/dispatch-build/reference-and-gap-matrix.md:7` describes automatic loading of all pages and local filtering/counts, opposite to this candidate. No docs changed between baseline and candidate (`git diff --name-only d4921eb HEAD -- docs` is empty). The milestone requires evidence/matrix/checkpoint updates at line 28; phase plan requires separately tracked status and a portable goal handoff at lines 56 and 72. Reconcile status to implemented/audit_pending, update the matrix to server search plus explicit loading, and record exact candidate/base, commands/results/limits and remaining gates. The pinned phase contract documents q semantics and operating-context.md:21 documents keyset pagination, so this is not a claim that the API is wholly undocumented. The stale local-build latest-100 sentence alone is not a blocking source defect.

2. Release-gate limitation — exact remote candidate does not exist in observed origin refs. `git ls-remote origin refs/heads/main refs/heads/codex/civicmaps-dispatch-m1` exited 0 and returned only `d4921eb1c37550d9ca1b53a5615242922abfa4ad refs/heads/main`. No publication was authorised for this auditor. This assessment supports the exact local product only, not remote publication/hosted CI/merge/deploy approval. Publish and verify the final candidate under the established owner workflow before claiming those gates.

## Independently reproduced checks

Node v24.19.0 matches .node-version. Existing lockfile-installed dependencies were reused through a local node_modules symlink, not reinstalled. PostgreSQL base was the dedicated synthetic loopback service on port 55432; harnesses created disposable databases. PG utilities were supplied on PATH and pinned Chromium through PLAYWRIGHT_BROWSERS_PATH.

- `npm run check`: lint, formatting, both typechecks and both builds passed. Its default-sandbox test phase could not use loopback (EPERM); this invocation is NOT recorded as an overall pass.
- `PATH=/workspace/.cache/civicmaps-pgtools:$PATH npm test` with permitted loopback execution: **93 tests, 93 pass, 0 fail, 0 cancelled, 0 skipped**, duration 63159ms. Includes literal wildcard/backslash, empty/case-insensitive/formatted-number search, >250 rejection, independent detail, cross-council/officer denial; inherited >100/keyset concurrent insertion/count tests passed.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npm run test:commandmaps:browser`: PASS, after initial sandbox EPERM setup failure. Executes nested `verifyM1Discovery` via tests/browser.mjs:5,542. More than 1000 active fixture rows, older search, load-more retry, retained refresh extent/page, first-page and continuation failure with inaccessible detail, delayed selection success after newer denial, stale search response, keyboard loading, and existing F11E recovery all ran. Browser runner is wired into package.json:31 and CI at .github/workflows/ci.yml:56. This is nonzero execution, not mere file discovery.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npm run test:platform:browser`: PASS.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npm run test:activation:browser`: PASS. Reported port 5173 in use and selected another port; no skip.
- `git diff --check`: PASS.
- Independently inspected generated m1-discovery-desktop.png and m1-discovery-narrow.png: complete 1005 count vs 100 loaded, explicit Load more, visible search/filter and separate selected detail. Narrow layout readable; keyboard scenario exercised by browser test. No broader accessibility certification claimed.

Source inspection: services/api/app.mjs:428-484 preserves status/before/requests/nextCursor, omits later-page counts, searches with parameterised POSITION/LOWER and enforces 250-character query bound. Counts use the same officer visibility and authorised RLS scope before status/paging. New detail route at 532-553 uses scoped capability enforcement and officer assignment restrictions. Scoped authority at 103-142 and restrictive context RLS are preserved; no migrations changed. main.tsx:168-344 applies queue generations, deduplication, retained extent and independent selected-detail invalidation before continuation failures. main.tsx:391-481 binds selection/history to context and request; detail content at 994 onward hides actionable content on unavailable detail. Existing lifecycle mutation authority is unchanged. Full suites cover retained review, ADMIN exclusion, isolation, migrations and recovery.

## Raw execution artefacts and limits

Local raw logs: /tmp/m1-reassessment-check.log (initial restricted check), /tmp/m1-reassessment-tests.log (successful integration), /tmp/m1-reassessment-browser.log (initial restricted browser), /tmp/m1-reassessment-browser-retry.log (successful CommandMAPS), /tmp/m1-reassessment-platform.log, /tmp/m1-reassessment-activation.log. These are local supporting artefacts; exact outcome and commands are embedded above for portability. Generated F11E tracked screenshots were restored to the frozen source after inspection; no product edits or publication performed. A subsequent documentation-only candidate needs documentation closure and exact identity verification; a product change requires affected functional reassessment.

## Input manifest SHA-256

1d5b803d0340b04c40f7804520cba98bd0517215583671a66b7332434c8939b8  AGENTS.md
02ced655e48f0b183dfecd1ff97283682943dca3e0b1855ea12d1578807e3106  docs/plans/independent-product-audit-protocol.md
2d0ec0e5d94b69740d5839bbbbd4d89084bc8f802bceb82726aba39ae9fe8eec  docs/plans/dispatch-build/next-build-phase.md
90e7fcce715de321c090c9b977bedc8d95d67621fdfc4d53ade72fad552b294a  docs/plans/dispatch-build/milestones/M1-complete-shared-discovery.md
2b0cab7d1d5770c2ff675dd7682a245a432b3525821b0029d0e86e34b5ef3849  docs/plans/dispatch-build/shared-service-contracts.md
dc3daff7bcfa8553433e36aea0722ce00a8f42cdcdc0a5f690419fb6bb1a5043  docs/plans/dispatch-build/reference-and-gap-matrix.md
edf23501bdf197421696f1056ab289844185224a1a8cd603fbd4c1c4529e1c03  docs/development/operating-context.md
8486a0d91633856ee2af08760fc57598d7c0c50ac49504665f20b22ee2a1dbfc  docs/development/local-build.md
8433fe1852278f4645a2ca8efcc49490bddb494f7d92da3c3283c964051ec1b2  docs/plans/F11E-dispatch-detail-plan.md
68223da12401987735487904a5992cfef037efc6c015ad4b7b3eb3b7e542f34d  apps/commandmaps/src/main.tsx
0097db2807d0b5dfb513c8368709b678c7b236d5f6d003cd3d73818aaca70f2a  apps/commandmaps/src/RequestQueue.tsx
cb8abcdf048cd724c2f7a681081ae10ba7b66e7fff6d33bdd4bc6c07167da805  services/api/app.mjs
a1b413f43b0cb89809e65ca46d48d8d353f07a41699809907cd36f8ddde9418e  tests/foundation.test.mjs
377aa379702a97c070d00d25ef62928f1eca652d75520c705cc05fe7c44ec5f5  tests/browser.mjs
7e8cb8992fba5dd4e29a6d233f91ac8c667ffdd85ff955f6b062ddc4060e7bef  tests/browser/m1-discovery.mjs
98f7b72acd19549f218dbe4a08399e212c9997f889f6e7ae7ba1d4bf937f603d  tests/browser-commandmaps.mjs
66c692674533daeda37d91f8eeca0442c1cb8c47628685d7edc09d46e1f83075  tests/helpers/environment.mjs
414666bc0a5a07d9b01729443e92974eb004ee1eb7591ef2803d76a216d3a3e2  package.json
72156f9307466e1303a4ee379af7964a202166716959a1b2cb4934153f7f323e  .github/workflows/ci.yml
0812a8fd16fe66fe63316f8acb73d70e3940f8c943fb0a17770c40496f9f44f1  services/api/migrations/005-context-rls.sql
