# Goal-based remediation execution plan

Version 1.0.0 — 31 October 2026 (Australia/Melbourne)

## Authority and assignments

Owner instruction: produce a remediation plan for PR #52; work is to be completed by **GPT-6 Luna Medium** and checked by **GPT-6 Astra Low**, with the work agent continuing independent goals while the check agent reviews completed work. Publication and ongoing commits to `codex/code-audit-2026-10-30` are authorised. Merge and deployment remain outside this plan.

- Builder: `gpt-6-luna`, `reasoning_effort="medium"`.
- Checker: `gpt-6-astra`, `reasoning_effort="low"`.
- Coordinator: maintains the goal ledger, routes results and is the sole publisher to PR #52. It does not substitute its own review for Astra's verdict.
- Launch both roles with `fork_turns="none"` and explicit model/effort. If an assigned model is unavailable, mark the affected role blocked; do not silently substitute.

This commit prepares the execution contract; it does not claim implementation or checking has occurred. The receiving Luna agent should begin R0 and continue through the executable goals without asking again for routine commits or publication.

## Evidence boundary

Frozen audited application baseline: `b168dc0ce2b3d28011588b497e8e6fc459c2aa6a`. Existing published audit checkpoint: `42507f392beb5f0143b9f840754b95866671153f`. PR #52 is the only publication branch for this workstream. Inspect current remote refs and preserve any newer commits before starting; do not reset or force-push. Main movement is recorded, not silently incorporated into the frozen assessment.

The [initial audit](initial-audit.md) establishes one confirmed finding, AUD-001: Vite 6.4.4 is reported affected by GHSA-8g5g-mxqh-grgj; the registry reported 6.4.5 as a fix. The prior 114-test baseline passed, but browser and deeper audit coverage are incomplete. Older Q1–Q7 records are historical leads, not a new remediation backlog. Reproduce against this baseline and coordinate ownership before reopening any historical item.

## Goal sequence and acceptance

| Goal | Deliverable and work | Dependencies | Acceptance checked by Astra |
| --- | --- | --- | --- |
| R0 — Reproducible execution contract | Verify branch/SHA, clean worktrees, Node/npm pins, lockfile setup, dedicated synthetic database, browser and Caddy availability. Create the neutral acceptance packet and initialise the ledger. | Published plan | Tool versions and commands are reproducible; database is isolated; scope and unresolved Context7 requirement are explicit; no old results are relabelled as fresh. |
| R1 — Remove the known vulnerable dependency | Recheck AUD-001 against current registry guidance; apply the smallest compatible fixed Vite patch and lockfile update. Start with reported 6.4.5 only if current evidence still supports it. Preserve the pinned package-manager and no-install-script setup. | R0 builder-ready; R0 acceptance required for final R1 acceptance | Lockfile and installed Vite agree; affected version is absent; AUD-001 no longer appears in production/full scans; new high/critical advisories absent; other advisories triaged explicitly. Locked install, full check and all four browser suites pass. Review the patch/advisory and dev-server behaviour; no claim of an exploit reproduction without evidence. |
| R2 — Establish the complete defect register | Finish A1–A5 in the [audit plan](work-plan.md): browser/CI coverage, dependency guidance, security/data integrity, failure handling and UX/operations. Produce a requirement-to-source/test coverage matrix and a deduplicated findings register. | R0 builder-ready; may run while R1 is checked | Every confirmed defect has impact, path/line or reproducible observation, severity, confidence and proposed regression check. Coverage gaps and environment blockers are separate. Include negative authority cases, transaction/retry/race cases and operational limits. No assertion of exhaustive assurance from green tests. Each area is completed or explicitly blocked, never silently skipped. |
| R3.n — Close each newly confirmed defect | After R2 identifies a finding, instantiate one bounded goal per defect or inseparable root cause. Order security/isolation/data-loss first, then correctness/reliability, then UX/maintainability. Add the goal contract to the ledger before coding. | Finding reproduced; explicit prerequisite goals listed | Failing-before/passing-after behavioural evidence where feasible; focused durable regression test under the appropriate `tests/` subdirectory and CI discovery; smallest justified fix; affected checks pass; independent closure against exact candidate SHA. No speculative refactoring. If no additional defects are confirmed, record this family as not applicable with R2 evidence. |
| R4 — Integrated qualification | Assemble all accepted fixes, recheck current dependency guidance, run the final suite and freeze the resulting product for a full independent assessment. | R0–R2 and every R3.n accepted; R1 accepted | Full `npm run check`, four sequential browser suites, both actual Caddy ingress checks, dependency audits and generated-token consistency pass on the final product. Required hosted CI succeeds at the published candidate. All findings mapped to accepted fixes; no outstanding blockers or unverified required criteria. |
| R5 — Completion and handoff | Publish final register, acceptance reports, evidence index and resumption/release handoff; reconcile ledger and Empirical with PR #52. | Astra passes R4 exact product | Each goal has source SHA, report, verdict and verification links; final product matches the assessed source; outstanding external limits remain explicit. PR remains draft pending owner review; no merge/deployment. |

Each R3.n contract must name: finding IDs, intended behaviour, allowed scope/files, dependencies, regression strategy, commands, acceptance criteria, evidence paths and rollback implications. Concrete goals are added from evidence, not invented to fill categories. New product/provider policy decisions that cannot be inferred from approved contracts are raised specifically; unrelated goals continue.

## Concurrent build and check workflow

Use one active Luna implementation goal and one active Astra review, in separate worktrees. The coordinator owns the publication checkout. Builder and checker use separate synthetic databases, runtime directories and ports; never share a mutable database or fixed-port browser harness. Serialise browser checks if ports/resources cannot be isolated.

1. Luna completes a goal's implementation, focused tests and evidence, then supplies a commit and neutral packet. Coordinator integrates it with a fast-forward or reviewed cherry-pick, verifies the result, pushes PR #52 and verifies the remote SHA.
2. Freeze `candidate_sha`, `base_sha`, criteria version and SHA-256 manifest. Start Astra on a detached worktree at that exact candidate. Later branch commits must not move the checker's checkout.
3. Luna starts the next **independent** ready goal while Astra reviews. For example, Luna may finish R2's audit coverage while Astra checks R1. Preparation and read-only discovery for a dependent goal are allowed; dependent implementation and acceptance wait for prerequisite acceptance. Disjoint filenames alone do not prove independence: check shared contracts, schema and runtime behaviour.
4. Queue at most one additional completed candidate behind the active review. If there is no independent goal, continue evidence preparation or wait; do not invent work or accumulate unreviewed dependent changes.
5. Astra returns `pass`, `changes_required` or `blocked`. The coordinator records the report separately and updates the ledger. Only `pass` plus satisfied dependencies yields `accepted`.
6. For changes required, Luna prioritises a corrective goal after safely checkpointing independent work. Publish a new candidate and use a fresh Astra context. Provide the concrete defect/reproduction for targeted closure; do not reuse prior approval for changed product.
7. If a failed goal invalidates later work, mark downstream goals `blocked` or `recheck_required`; reassess dependencies and affected tests before continuing. Never overwrite previous reports or force-push away failing evidence.
8. Final R4 reviews the integrated product even when individual goals passed. Any subsequent product change reopens affected acceptance. Evidence/ledger-only commits must be distinguished by a verified product manifest; they cannot smuggle code changes after assessment.

## Independent checker packet

Apply the [independent product audit protocol](../../plans/independent-product-audit-protocol.md) to this workstream. Give Astra a standalone task statement, authoritative constraints, relevant goal acceptance criteria, exact source/base SHAs, neutral file inventory, checks and raw sanitised evidence. Include SHA-256 hashes. Do not give the builder conversation, internal reasoning, diary, favourable summaries or broad Empirical agent history. This operational plan is builder/coordinator guidance; extract the neutral contract rather than passing narratives as proof.

Neutral request: “Assess this product against this task and constraints. Determine correctness independently. Inspect the pinned source and reproduce checks where possible. Do not infer intent or rely on builder claims.”

Each report records goal/version, model/effort, fresh-context declaration, candidate/base SHAs, manifest hash, commands/results, findings and severity, unverified criteria, limitations and verdict. A blocked check is not a pass. Keep reports immutable under `evidence/remediation/<goal>/<candidate-sha>/review.md`; keep the packet and sanitised evidence alongside it. Scratch work belongs under `/workspace/work/`.

## Validation and current knowledge

Use pinned Node/npm and `npm run setup`. Source a verified synthetic session environment; the previous session's path is a convenience, not evidence that its processes still exist. Never point tests or seeds at customer/production data.

For R1 and R4 run:

```sh
npm run setup
npm run check
npm run audit:dependencies
npm run test:map:browser
npm run test:platform:browser
npm run test:commandmaps:browser
npm run test:activation:browser
```

Run the browser commands sequentially. R4 additionally executes `node tests/ingress-contract.mjs` and `node tests/ingress-login.mjs` with a verified `CIVICMAPS_CADDY_BINARY` matching CI, and checks generated tokens against Git. Use the current CI workflow as the executable reference. Record exit codes, counts, skips, tool versions and logs; preserve first failures. For R3.n, use focused checks plus relevant integration/browser checks; repeat the full suite at integration or when shared boundaries change. GIS and infrastructure changes require their applicable domain checks.

Discover @context7 on resumption. Retrieve installed-version-compatible Vite guidance for R1 and Express/React/pg/Playwright guidance where R2/R3 rely on it; record library ID, retrieval date, version, source URL and applied rule. Current absence of Context7 is an open external dependency. Official release notes, advisories and versioned source may support independent work, but cannot be represented as Context7 retrieval. Do not label R2/final overall completion fully accepted while this explicit requirement remains unmet, unless the owner explicitly changes it. No broad dependency upgrades merely to match latest documentation.

## Ledger, publication and memory

[remediation-checkpoint.json](remediation-checkpoint.json) is the machine-readable handoff. States: `pending`, `in_progress`, `ready_for_check`, `checking`, `changes_required`, `blocked`, `recheck_required`, `accepted`, `not_applicable`. Record builder-ready separately from checker acceptance. Every transition carries evidence and exact SHA when applicable; no placeholder report counts as a check.

At every meaningful goal checkpoint: update docs and Empirical, commit, push, verify remote SHA, and keep PR #52's description current. Use explicit authorship: owner assignments/preferences are user facts; execution results are agent work-history with project tags and mass 1. Do not leak secrets or raw session transcripts. The coordinator alone publishes to avoid branch races; workers commit in their own worktrees and return SHAs. A commit is not accepted merely because it was pushed.

Completion requires R5 accepted, all confirmed findings closed by supported independent evidence, final integrated qualification and CI passed, and all required external knowledge checks satisfied. Until then report the exact completed goals and remaining blockers. This plan does not authorise merge or deployment.
