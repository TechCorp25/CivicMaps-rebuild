# F11 — Council-to-CommandMAPS build plan

Date: 20 October 2026 (Australia/Melbourne). Author: Codex.
Status: prepared for owner model switch; implementation and independent audit not started.
Executor: **GPT-6 Luna, Medium reasoning**. Independent auditor: **GPT-6 Astra, Low reasoning**.

## Outcome and boundaries

An activated administrator of a newly provisioned synthetic council can provision explicitly authorised dispatcher/officer access. Those staff complete create → assign → acknowledge → attend → close in their own council. Another council cannot discover, assign, mutate or read the audit of that work. ADMIN identity alone grants no operational-record access. Existing pack enforcement, retained review, session revocation, concurrency and idempotency remain effective.

This completes F11, not merely another dispatch presentation precursor. F11D and F11E are already merged. F12 dedicated officer web and F13 mobile remain later work. No production deployment, cloud expenditure, retained-data migration, real council onboarding, suspension policy, evidence/infringement issuance, offline sync or new legal authority is included. Synthetic local migrations needed by F11 must be reversible through a compatible application rollback with records preserved; do not run them against retained/cloud databases.

## Verified starting point

- GitHub main and clean attached source matched `313d9a3fc5b2f66819bfaa52019600c3e167eda7` on 20 October; PR27 F11E is merged. Refresh this fact at execution time.
- PR25 `codex/civicmaps-governance-workstream` remains a separate draft, observed at `254423e103f86b30c94bd45cd518f1563d388d82`. Its G04 F-002 pagination, F-009 resource-status admission, F-011 pool recovery and F-029 audit validation/rendering belong to that workstream. Do not cherry-pick, duplicate or edit that branch. Consume reviewed main after owner merges.
- F06–F08 source dependencies are merged; F08 live acceptance is historical release evidence, not proof of this checkout's deployment.
- Existing ADMIN activation permits own session/profile and explicit contexts; staff management is new F11 authority, not an implied F07 permission.
- Node 24.19.0/npm 11.9.0 and installed dependencies work. Lint, formatting, typechecks and both builds passed. Full check failed in test setup; direct foundation test returned EPERM on 127.0.0.1:55432. PostgreSQL 15 binaries are missing and the configured HTTP proxy refused connections. Runtime/bootstrap remains incomplete. No browser acceptance was rerun.
- Ledger F11E state and misattributed F09 publication fields are reconciled in this preparation. Two all-NUL committed READMEs are replaced by current source-based summaries, not claimed recovered originals.

## Goal sequence and acceptance

Keep one implementation feature active. Each goal produces a reviewable product and an independent audit checkpoint under the [audit protocol](independent-product-audit-protocol.md). Do not mark F11 complete until all goals pass.

| Goal | Required product | Observable acceptance |
| --- | --- | --- |
| G0 — Reproducible development | Fresh feature branch from verified main (explicitly stacked on this preparation if unmerged); supported runtime setup; baseline receipt | Pinned Node/npm; lockfile install if needed; dedicated synthetic PostgreSQL; baseline check and applicable browser suites pass, or precise environmental blockers recorded without false passes. Use workspace data/cache paths. Restore supported proxy/runtime access, never bypass policy. |
| G1 — Explicit council staff authority | Versioned F11 actor/action/context matrix, API contract, schema/migration proposal and approved-decision references | Every create/invite/activate/grant/revoke/disable/read action identifies actor, council/context boundary, approval provenance, allowed role, audit and revocation semantics. No operator or ADMIN implicit operational access; no self-elevation, cross-council identities or silent regrant. Unknown decisions are labelled and resolved before dependent code. Audit this contract before implementation. |
| G2 — Server-enforced staff provisioning | Bounded council-administration endpoints, persistence and synthetic regressions | Council administrator provisions only authorised DISPATCHER/OFFICER access within its own explicit contexts; server rejects client-selected ownership and privilege escalation. Activation/delivery, expiry/replay, reissue, disable/session revocation and context removal follow the G1 contract. Version conflicts and retry keys cannot duplicate identities/grants/audit. Direct API denials are tested. |
| G3 — Usable council administration | Separate council administration presentation integrated with approved routing, plus design trace | Authorised admin can complete G2 with truthful pending/success/failure states, safe retry and accessible controls. Operational CommandMAPS and platform-operator authority stay separate. Follow current _ds rules/annotations; header shows department/role, not personal name. No fabricated workflow or copied demo permissions. |
| G4 — Connected dispatch | New-council lifecycle and adversarial browser/API acceptance | Two newly provisioned synthetic councils, not only existing Alpha/Beta seeded staff, exercise the full lifecycle. Wrong-council list/detail/audit/assignment fail; officers see only assigned work. Disabled pack denies writes and retains only authorised review; re-enable follows D03. Expiry/revocation, stale version, uncertain response/retry, reload, keyboard and narrow viewport pass. F11E recovery does not regress. |
| G5 — Reviewable release candidate | Exact-commit evidence, independent final audit, draft PR and Empirical checkpoint | Required checks pass on final source; findings fixed and independently reassessed. Local and hosted results are distinguished. Push/verify SHA, record dependency and rollback, open draft PR for owner. No merge, auto-merge or deployment. |

## G1 decision reconciliation

Read current approved owner decision records from the CivicMAPS-rebuild workspace and source-pinned governance deliverables. The recent Q1–Q10 memory records describe council-led security with bounded delegation, council-specific identities/context grants, SSO preference with governed fallback, verified administrator/recovery custody, controlled structural changes, bounded operator authority, dedicated-environment assessment, records-custodian separation and human-approved disposal. They are design directions, not implemented controls or permission to select providers. Obtain exact current wording/provenance; do not use old wireframe operator powers as current authority.

The contract must resolve who may provision which staff roles, identity/invitation and recovery handling for this synthetic slice, grant scope/delegation, suspension interaction, independent approval requirements and the council administration entry point. Reuse already approved choices without asking again. Escalate only concrete missing choices; continue G0, tests/contracts and independent permitted work while awaiting them. Do not invent a permission to satisfy an acceptance test. F09-P01–P06 remain a separate suspension decision set; F11 must not implement suspension by assumption.

## Engineering and verification contract

Read AGENTS.md, affected domain READMEs, operating-context, provisioning, routing, activation and entitlement contracts, and current _ds sources before edits. Retain the existing React/TypeScript/Vite and Express/PostgreSQL stack. Follow lint/formatting, appropriate module boundaries, useful why-comments and React Hooks checks. Avoid speculative refactors.

Use only disposable synthetic test databases. Cover positive and negative actor/action pairs, two councils, two contexts where applicable, replay and competing updates, transaction/audit atomicity, grant removal and stale sessions. Validate migrations from populated prior schemas and preserve immutable ownership/history. Run `npm run check`, `npm run test:platform:browser`, `npm run test:commandmaps:browser`, `npm run test:activation:browser`, and focused new F11 browser tests sequentially where harness ports collide. Record exact commands, SHAs, counts, failures and untested limits. Capture and inspect desktop/narrow screenshots. Existing CI requirements still apply; do not substitute mocked outputs for runtime evidence.

## Independence and checkpoint handoff

At G1, G2, G3/G4 and final G5, freeze the task contract and product SHA, then invoke GPT-6 Astra Low in a fresh context with no inherited conversation. Follow the audit protocol. The auditor receives only task requirements, authoritative constraints and the resulting product; it must not receive chain-of-thought, CoF, thinking, reasoning, scratch work, implementation diary, builder explanations or self-review conclusions. Auditor may inspect code and independently run tests. Implementation resumes only on the relevant product after the audit verdict; unresolved blocking findings prevent acceptance.

## Start instruction after model switch

Run this plan as GPT-6 Luna Medium, beginning at G0 then G1. Read the current ledger and execution checkpoint; verify remote main and governance boundaries. Use GPT-6 Astra Low with a fresh, non-inheriting context at the defined checkpoints. Keep audit input restricted by the independent-product-audit protocol. Complete the authorised goals, fixes, checks, evidence and draft publication; stop only dependent work for a concrete unresolved decision. Do not merge or deploy. This preparation does not start that run.
