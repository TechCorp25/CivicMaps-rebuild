# M1 independent product assessment

Verdict: **pass**, scoped to shared request discovery at the pinned candidate and the evidence below. No blocking product findings were identified. Local database-backed verification was unavailable and is not represented as passing.

Assessment timestamp: 2026-10-23T09:33:28Z. Task: M1 neutral audit requirements v1. Auditor assignment: GPT-6 Astra, low reasoning effort, fresh `fork_turns=none` agent context. This assessment used the neutral assignment, packet, protocol and specified product inputs; it did not consult prior conversation, prior audit reports, operational plans, checkpoints, ledgers, PR bodies, or builder explanations. A detached worktree was created specifically for this audit; no candidate implementation was edited.

## Identity and input boundary

- Repository: TechCorp25/CivicMaps-rebuild.
- Remote candidate: `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b`.
- Local same-tree mirror: `581a064f7e9b129f744f00a8c4e8897b8a86ae8c`.
- Candidate tree: `9f2950e421c230c03b05efbdcc76a8b4e4fda1da`.
- Base: `d4921eb1c37550d9ca1b53a5615242922abfa4ad`.
- Packet SHA-256: `e7b04e7a8c0c65bb1994d2c06e57df4ee5d628014745c838d77258e7bb7991e9`.
- Protocol SHA-256: `02ced655e48f0b183dfecd1ff97283682943dca3e0b1855ea12d1578807e3106`.

Both packet hashes were independently checked with `sha256sum`. Copies are `requirements.md` and `protocol.md`. `input-sha256.txt` records all inspected product file hashes: API app and entitlements, CommandMAPS main and RequestQueue, foundation tests, browser entry/harness/M1 tests, CI workflow, local-build product documentation, WF-S3 and WF-S7 annotations, and package.json. Inspection of the local-build document was as a requested product deliverable, not proof of implementation correctness. The merged base API was compared only for the allowed API files. No broad remote commit diff endpoint was called.

Commands run for identity, from the detached checkout:

```sh
git merge-base --is-ancestor d4921eb1c37550d9ca1b53a5615242922abfa4ad 581a064f7e9b129f744f00a8c4e8897b8a86ae8c
git merge-tree --write-tree d4921eb1c37550d9ca1b53a5615242922abfa4ad 581a064f7e9b129f744f00a8c4e8897b8a86ae8c
git rev-parse HEAD HEAD^{tree}
git diff --exit-code
```

Ancestry exited 0; merge-tree returned exactly the candidate tree; HEAD/tree matched the local identity above; tracked diff was empty after checks. Remote commit objects are not present locally (`git cat-file -t` for the remote SHA failed). The remote/local same-tree association is the frozen packet's identity assertion; local ancestry/tree was independently verified, and hosted metadata/logs independently bind final CI to the exact remote head/base. No claim is made that the remote Git object itself was downloaded and hashed locally.

## Hosted evidence

GitHub connector calls used account link `link_6ac4f48ae740819186dc64f3e0bb397b`. Run metadata, job lists, explicit job steps, full decoded logs and artifact metadata were fetched directly. Raw results are included beside this report.

| Run / job | Provenance | Results |
| --- | --- | --- |
| 39895161432 / 120223781860 | Checkout log: merge `1ecbb801c6c4ec7de74f698540ca7dc74833ac47` into the stated base | `npm run check`: 93 tests, 93 pass, 0 fail, 0 skipped, 0 cancelled. All three browser commands completed successfully. |
| 39895991685 / 120226461231 | Checkout log: merge `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b` into the stated base; final artifact metadata confirms exact head SHA | Same 93/93, 0 fail/skip/cancel. All three browser commands completed successfully. |

Both jobs' explicit steps report success for lint/type/build/API check, token verification, ingress checks, browser installation, Platform, CommandMAPS and activation. Logs contain the actual commands and browser PASS lines, not just job conclusions. Browser scripts are sequential assertion-based programs rather than a test runner reporting individual case totals; no invented browser assertion count is supplied. Final-run test summary is at log lines 477–484, Platform PASS at 773, CommandMAPS PASS at 786, activation PASS at 798. This verifies hosted execution, not local reproduction.

Screenshot artifact 12475868920 belongs to the first run, with GitHub-reported ZIP digest `sha256:2e3252d9ab2983d9cbc8e99fa72e1ed80404256ab95d3dc98b480fa1ee21743c`. The supplied desktop/narrow PNGs were visually inspected and copied here. Their SHA-256 values are respectively `2e1848c5782d839bbae00de9655af01ba7346fd526ab17036798ccc98921f927` and `c89108f903ac05ff449b63900f2dc80d8b4c0f79d018b81c6fadfc4bce639c8f`. A connector artifact download returned a reusable file reference, but ZIP bytes were not independently rehashed/extracted here; the supplied PNG-to-ZIP association remains packet provenance. Final-run artifact 12477160234 independently reports exact candidate head and digest `sha256:afabec7aa24b9364a0b5d402dc3a8011fbe5ab2c5dacb00900e49bc60ceb3d76`; its images were not inspected.

## Product assessment

- API search uses trimmed optional q, a 250-character cap and parameterized POSITION/LOWER predicates, so `%`, `_` and backslash are literal. Empty q becomes null. Existing scoped transaction, capability checks, row-security context and officer restriction are preserved. Counts use the same visibility/search before status and cursor filtering; later pages omit counts. Existing 100-row keyset behavior is extended rather than replaced. Independently fetched detail is scoped and returns 404 for inaccessible records (`services/api/app.mjs:428`, `:532`). No migration is introduced by these changes.
- Initial UI loads one server page; explicit Load more appends with ID deduplication. Search/filter changes invalidate outstanding queue generations and reset results/cursor; operating-context changes clear selection/history/recovery state. Refresh recollects the loaded extent before committing the queue, preserving the old snapshot if continuation fails. Selected detail results are processed before a queue failure is thrown and are separately generation-fenced (`apps/commandmaps/src/main.tsx:167`, `:246`, `:272`, `:362`, `:391`).
- Selected request and audit content are independent of queue membership. Audit state is keyed by request and scope, rejects stale responses, and renders truthful loading/unavailable/empty states. Repeated selection is a no-op; detail denial removes actionable detail. Uncertain mutation recovery retains explicit reconciliation and same-key retry rules (`main.tsx:430`, `:484`, `:634`, `:1204`).
- Executable source covers 105 older active records behind 110 closed records, insertion between keyset pages, literal/empty/over-limit search, number search, counts and cross-scope denial (`tests/foundation.test.mjs:222`, `:282`). Browser fixtures contain 1005 active plus 110 closed records; M1 checks cover server discovery of an older record, 100→200→300 loaded rows, continuation failure/retry, refresh retention, stale search, detail denial combined with first-page/continuation errors, and late detail success after newer denial. Existing browser checks exercise audit races/failure, session loss, retained disabled-pack review and F11E uncertain response. Hosted logs also show council-context, officer and row-security tests passing. ADMIN exclusion remains explicitly enforced in scoped API access and the operational UI.
- Against the relevant WF-S7 discovery annotations, screenshots show address/SR search, status filters, identifiable clickable rows and consistent status presentation. Desktop shows queue and independent selected history alongside it; narrow view stacks readable controls and detail/history. The wider table uses a focusable horizontal region at narrow width. WF-S3's broader map/zone/emergency surfaces and WF-S7's historical PIN/void workflows are outside M1 and were not treated as newly required M1 functionality.
- Focused keyboard evidence: native labeled search/select controls, native request/filter/paging buttons, `aria-pressed` states and table-region focusability are present in RequestQueue. M1 browser source focuses Load more and presses Enter, then asserts 200 loaded results; final hosted CommandMAPS success covers this execution. Existing browser source also checks Escape dismissal and returned focus. This is a focused keyboard review, not comprehensive assistive-technology certification or an independently executed local keyboard session.

## Local execution and limits

Environment: Node v24.19.0, npm 11.9.0. The audit checkout reused the existing installed dependencies via a node_modules symlink; it did not perform an independent clean install. Cloud runtime skill/status was consulted for environment limitations. No implementation changes were made.

| Command actually attempted locally | Result |
| --- | --- |
| `npm run check` | Lint, formatting, both app typechecks and both production builds passed. Integration stage could not complete in this environment; the stalled process tree was terminated. Final interrupted summary: 24 tests, 1 pass, 9 fail, 14 cancelled, 0 skipped. Shell exit 143. This is **not** a passing check. |
| `npm run test:commandmaps:browser` | Exit 1 at DB setup: connect EPERM 127.0.0.1:55432; no browser acceptance executed locally. |
| `npm run test:platform:browser` | Same setup failure, exit 1. |
| `npm run test:activation:browser` | Same setup failure, exit 1. |

Browser attempts were sequential. Logs are `local-check.log` and `local-*-browser.log`. Local database unavailability remains an explicit limitation; hosted success does not turn these failed setup attempts into local passes. No deployment, production data, native-device behavior, full accessibility audit, or exhaustive concurrency proof was assessed. The exact remote-to-local tree association and supplied screenshot provenance have the limits stated above.

The pass rests on the frozen product identity, independently inspected implementation/tests, verified exact-head hosted execution, and focused visual/keyboard evidence. It does not authorize production deployment or extend to a later changed product.
