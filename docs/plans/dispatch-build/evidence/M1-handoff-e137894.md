# M1 candidate handoff — local functional result

**Goal:** M1 shared request discovery. **Acceptance status:** functional checks pass on the local candidate; overall M1 acceptance remains `audit_pending` after documentation corrections. The independent Astra review of the prior candidate returned `CHANGES_REQUIRED` solely for stale milestone/matrix documentation and missing portable handoff. No source-code defect was established. A fresh assessment of the corrected exact candidate is required.

**Repository:** `https://github.com/TechCorp25/CivicMaps-rebuild`
**Branch:** `codex/civicmaps-dispatch-m1`
**Verified base:** `d4921eb1c37550d9ca1b53a5615242922abfa4ad` (current `main`, includes merged PR #38 phase plan)
**Reviewed candidate:** `e1378947c59bb31299ff2596f531212e253be61f`
**Candidate tree:** `6c1017f088284ec14f7c1e4089771e3ac7dee9ff`
**Fresh review:** [Astra reassessment](M1-independent-audit-e137894.md), verdict `CHANGES_REQUIRED` for documentation/handoff only. Its base/candidate values remain historical for this receipt; any corrected candidate SHA is recorded in the next receipt.

## Implemented behavior

M1 consumes the existing governance-owned F-002 endpoint. It preserves status filtering, first-page counts, and descending keyset pagination; loads the first page and exposes explicit “Load more”; resets pages when search/filter/context changes; deduplicates IDs and rejects stale responses. Optional server-side `q` searches request number and address using trimmed, case-insensitive literal matching, parameterized SQL, and a 250-character maximum. Counts represent the authorized search result before status and pagination; later pages omit counts. Selected detail and audit history are independently retrieved and keyed to request/context, including truthful unavailable-state behavior and the regression for a late stale success after a newer denial. No migration is planned. Existing lifecycle, retained-review, ADMIN exclusion, officer scope, F11E uncertain-response recovery, and context authorization are preserved.

## Reproduction and evidence

On Node version from `.node-version` with dependencies installed and the pinned PostgreSQL 15 test service available:

- `PATH=/workspace/.cache/civicmaps-pgtools:$PATH npm test` — 93 passed, 0 failed, 0 cancelled, 0 skipped.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npm run test:commandmaps:browser` — passed, including M1 search, older active records, paging/retry, stale responses, inaccessible detail, keyboard loading, and F11E recovery.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npm run test:platform:browser` — passed.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npm run test:activation:browser` — passed.
- `npm run check` — lint, format, both typechecks, and both builds passed. Its default-sandbox test subprocess could not use loopback (EPERM); the separately permitted integration rerun above passed all 93 tests.

The independent reviewer inspected desktop and narrow screenshots: the UI showed 1,005 matching requests with 100 loaded, clear explicit Load more, readable search/filter, and separate selected detail; its browser keyboard scenario passed. Tests are discovered through `tests/browser.mjs`, the local CommandMAPS browser command, and CI. No runtime skipped tests are counted as passes.

## Remaining gates and next action

The exact M1 candidate has not been published; hosted CI and remote SHA verification are pending. The next action is to freeze the documentation-reconciled candidate, obtain a fresh independent Astra Low audit of that exact SHA, then push the branch, verify its remote SHA, open a draft PR, and record hosted CI. Do not merge. M2–M7 and deployment remain excluded. No `/workspace` or transient log path is required to reproduce the checks; the path examples above identify the pinned local tooling only.
