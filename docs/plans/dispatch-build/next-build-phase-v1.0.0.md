# Next build phase: M1 discovery and F11 G1 authority contract

Version: 1.0.0. Date: 22 October 2026 (Australia/Melbourne). Guidance: Medium.
Repository: https://github.com/TechCorp25/CivicMaps-rebuild
Planning branch: `codex/civicmaps-m1-g1-phase-plan`.
Canonical path: `docs/plans/dispatch-build/next-build-phase.md`.

## Scope and baseline

Owner instruction for this bounded phase supersedes broader historical run/merge/deploy instructions: GPT-6 Luna Medium completes M1 shared discovery and G1 council staff-authority contract. GPT-6 Astra Low independently audits each completed goal while Luna continues ready independent work. G2 implementation, M2–M7, merge and deployment are excluded. Stop this preparation after P0 publication for the owner to switch the builder model; do not start implementation during preparation.

Remote main was verified by authenticated Git fetch on 22 October 2026 at `6761cd6adcd9f922aed939ccafb75f81cf7eba62`, containing PR37. The prior proxy-unreachable limitation is resolved for Git with supported per-command network permission; preserve proxy and CA configuration. Reverify remote main at run start. PR25/PR32 F-002 and governance controls are merged; consume them without duplicating or taking over governance work. PR35 M0 architecture acceptance at `a1a9a9a969d1d2efc9d1630980adcff3ebaf2b60` remains valid for its recorded scope; PR37 receipt follow-up is merged. Neither establishes M1 or G1 functional acceptance.

Bootstrap verified Node 24.19.0/npm 11.9.0, lockfile installation, PostgreSQL readiness and Playwright Chromium launch. Both app typechecks/builds passed on the preserved earlier local checkout `8f61ee4`; these are tooling checks, NOT acceptance of the new baseline. Luna must install from the current lockfile and run the required baseline suites. No full runtime/browser acceptance is claimed by P0.

## Goals and dependencies

| Goal | Deliverable | Acceptance and dependencies |
| --- | --- | --- |
| P0 | Portable reconciled plan, checkpoints and developer instructions in Git and Empirical | Verified remote baseline; stale PR37 references corrected; complete versioned plan and matching SHA-256 retrievable from both destinations; draft PR and publication receipt. Independent planning audit remains separately pending until its report exists. |
| M1 | Server-backed request search, filters, counts, pagination and independent detail | Start after P0 publication and verified merged M0/F-002 dependencies. Older active requests beyond 100 discoverable; authorised counts, paging, selection and audit survive refresh/failure. Fresh Astra pass required for acceptance. |
| G1 | Versioned staff actor/action/context matrix, proposed API/schema/migration contract, provenance and test inventory | Independent of M1; use signed Q01–Q12 and merged controls. Every action has explicit authority, scope, revocation, audit and retry semantics. Required unresolved policy blocks acceptance and future G2. Fresh Astra pass required. |

G2 remains out of scope even after G1 passes. Owner merge is required before any future dependent implementation. Publication never implies acceptance.

## M1 implementation contract

Consume F-002 status/count/keyset pagination and preserve authorisation. Replace automatic full-dataset loading with first-page loading and explicit **Load more**. Reset pagination on search, filter or operating-context change; reject stale responses and deduplicate by request ID. Failed page loads retain truthful retry state without losing already confirmed pages.

Add optional server-side `q` search for request number and address: trimmed, case-insensitive literal matching, maximum 250 characters, parameterised SQL. Escape SQL wildcard characters so `%` and `_` remain literal, and test escaping/backslashes. Reject over-limit input consistently; empty search preserves existing behaviour. Preserve `status`, `before`, `requests`, `nextCursor` and first-page counts. Counts cover the authorised search result before status filtering and pagination; subsequent pages omit counts. Retain descending keyset behaviour during concurrent inserts and define refresh/reset explicitly.

Fetch selected detail independently of queue pages. Detail and audit are keyed to request and operating context; prevent late responses from restoring another selection/context. Inaccessible detail clears actionable content and displays truthful recovery feedback. Preserve lifecycle, retained-review rules, ADMIN exclusion, officer assignment scope and F11E uncertain-response recovery. No schema migration is planned.

## G1 contract deliverables

Use signed Q01–Q12 decisions and current merged governance controls as authority. Begin with `docs/plans/evidence/2026-10-19-signed-owner-decisions-review.md`, its referenced signed source and assessment, and the current merged governance contracts. Pin exact source path/version/hash and decision identifiers; a summary or old wireframe is not a replacement for signed wording. Existing F11 principal-ownership work is a dependency, not acceptance of staff provisioning.

Specify create/invite/activate/read/grant/revoke/disable, allowed roles, council/context ownership, approval provenance, expiry/replay, reissue, session invalidation and transaction/audit atomicity. Include positive and negative actor/action pairs, self-elevation prevention, cross-council denial and no silent regrant. Define proposed endpoint inputs/outputs/errors, retry/idempotency/version conflicts, additive migration compatibility, populated-data verification and the G2 executable-test matrix. Keep council administration separate from operational CommandMAPS and platform-operator authority. Clearly label proposed schema and endpoints as unimplemented.

Resolve only genuinely missing product choices with the owner after checking signed decisions and Empirical. Record each unresolved choice and affected criterion; do not invent permission. Missing required choices block G1 acceptance and dependent G2, while M1 can continue. Deliver a versioned contract under `docs/plans/`, linked from F11 checkpoint, and update `tests/f11/README.md` with proposed G2 coverage without claiming tests exist.

## Execution and concurrent audit

1. Luna verifies remote main, dependencies, worktree ownership and local runtime. Read AGENTS, this plan, programme contracts, M1 milestone, F11 requirements, affected domain READMEs and current design annotations. Record exact base and limitations. Use one Luna implementation worker and a designated publisher.
2. Publish P0, then begin M1 while a fresh Astra audits the frozen P0 planning product. Preparation can hand over with P0 audit pending; Luna starts that audit immediately after model switch. Planning defects must be fixed and reassessed before P0 acceptance.
3. On M1 completion freeze its commit and neutral packet, then start fresh Astra assessment in an isolated detached checkout. Luna prepares G1 on a separate branch from freshly verified main while review runs. Carry the portable plan as a pinned reference if its PR is unmerged; do not import M1 implementation into G1.
4. On G1 completion start another fresh Astra assessment. Luna addresses M1 findings or prepares portable handoff while that audit runs. Bound the backlog to one pending review and one active goal; finish or checkpoint earlier review before starting another when needed.
5. Fix findings on the relevant branch, rerun affected checks and obtain fresh reassessment. Finish only when both goals pass or concrete blockers are recorded. No merge/deploy.

Every assessment uses `fork_turns="none"`, `model="gpt-6-astra"`, `reasoning_effort="low"`, isolated checkout and frozen requirements, authoritative constraints, exact base/candidate/tree SHAs, product files and raw evidence. Follow `docs/plans/independent-product-audit-protocol.md`. Never supply builder conversation, reasoning, scratch diaries or self-review conclusions. Give a standalone neutral acceptance contract; this operational handoff is not an auditor narrative. Auditor may inspect necessary dependencies and independently reproduce checks, but does not edit/publish. Reports record model/effort, independence, manifest hash, actual checks, findings, limits and pass/changes_required/blocked. Missing evidence is not a pass. Material product changes require reassessment.

Track `planned`, `implemented`, `audit_pending`, `changes_required`, `blocked`, `accepted` separately from publication and CI. Freeze commits before audit; retain accepted ancestry and never label unreviewed work accepted.

## Verification

Run `npm run setup` with writable cache, then `npm run check` and `npm run test:commandmaps:browser`, `npm run test:platform:browser`, `npm run test:activation:browser`; sequence suites where ports collide. Configure dedicated disposable synthetic PostgreSQL and matching Chromium via `docs/development/local-build.md`; do not replay migrations/seeds against retained data. New checkout installations must use their own exact lockfile. No dependency on a specific machine path is allowed.

Commit M1 integration/browser tests under `tests/`; wire new browser discovery into local commands and CI and verify non-zero execution. Existing recursive Node discovery does not automatically run standalone browser scripts. Cover >100 and >200 requests, older active work, concurrent inserts, literal/empty/over-limit search, search/filter/count agreement, paging retries, stale responses, refresh, independent detail and inaccessible selection. Exercise council/context isolation, officer restrictions, ADMIN exclusion, disabled-pack retained review, session loss and uncertain-response recovery. Inspect desktop/narrow screenshots and keyboard operation against `_ds` annotations.

Validate G1 action coverage, exact decision provenance, API/schema consistency, populated-data/migration/recovery specifications and G2 test matrix. Contract acceptance must not claim provisioning implementation. Record exact candidate SHAs, commands, counts, failures and limitations; skipped tests/setup failures are not passes. Planning validation is JSON/link/hash/whitespace and scope reconciliation, not application acceptance.

## Portable publication and handoff

Canonical plan is this file. Its exact UTF-8 bytes, including final newline, are hashed with SHA-256; `next-build-phase.sha256` stores the digest. The digest is outside this file to avoid self-reference. Commit/push the planning branch, verify its remote SHA, publish a draft PR against main, and store complete text/version/hash/Git commit permalink/dependencies in Empirical workspace `civicmaps_rebuild`. Read it back and recompute the hash. A post-publication receipt may reference the immutable plan commit without changing the canonical text.

Maintain `next-build-phase-checkpoint.json`, programme entrypoint/execution checkpoint, feature ledger and F11 checkpoint. Preserve historical evidence as history; current scope overrides broader old merge/deploy instructions. Each goal receipt includes repository URL, branch/base/candidate SHAs, prerequisites, commands/counts/results, status, audit report and hash, CI/publication status, blockers and exact next action. Null candidate/audit fields mean not completed, never implicit acceptance.

Record separate P0/M1/G1 work-history receipts in Empirical with `authorType=agent`, mass 1 and `CivicMaps-rebuild` tags; owner workflow/decisions use `authorType=user`. Never store secrets. On memory failure, preserve an unsaved receipt and pause memory-dependent publication under policy. Keep raw evidence portable in committed safe files or retrievable artifacts, not transient absolute paths.

Checkpoint after each meaningful edit, test, freeze, review and push. At allowance warning stop new goals, preserve unaccepted work explicitly and save restart pointers while capacity remains. No automatic allowance refresh/resume is promised. Exact next action after preparation: switch builder to GPT-6 Luna Medium, fetch the published P0 branch, verify plan hash/checkpoint and remote main, launch fresh P0 Astra Low audit, then start M1 with baseline validation. Do not start G2 or merge/deploy.
