# CivicMAPS governance workstream

Established 18 October 2026 (Australia/Melbourne) following the owner's explicit branching and sequencing direction.

## Authority and purpose

Governance progresses actively alongside functional development. There is no blanket development hold. This instruction supersedes earlier pause language on main; PR #24 separately reconciles those planning pointers. Concrete unresolved policy decisions constrain only the behaviours that depend on them. Production acceptance remains evidence-based and separate from permission to develop.

The durable branch is `codex/civicmaps-governance-workstream`, initially based on main `92b3eea8b8ecfd0505afb6d62d60a001903db161`. Its dedicated worktree is `/workspace/civicmaps-governance-workstream`. It contains governance requirements, decisions, controls, implementation and assurance evidence. Functional phases/features use separate branches and PRs against main. Governance is a concurrent workstream, not the single active functional feature slot.

## Synchronisation contract

1. Start each feature/phase on a fresh branch from current main. Implement and verify the bounded outcome, then publish it for owner review. Do not merge or enable auto-merge on the owner's behalf.
2. After the owner merges a feature, fetch main and merge `origin/main` into the governance branch using normal Git merge. This direction of synchronisation is authorised by the owner. Do not merge unreviewed feature branches directly into governance; consume their reviewed main result once.
3. Keep the worktree clean before synchronisation. Inspect changes to identity, roles, council scope, data flows, storage, audit, integrations, domains and records. Resolve conflicts preserving both the reviewed feature behaviour and governance controls; never use a blanket ours/theirs resolution. Stop only a disputed policy-dependent resolution and explain the concrete dependency.
4. Run documentation checks for documentation-only integration. For runtime changes, run relevant integration/security/tenant-isolation tests and required CI. Record source main SHA, resulting branch SHA, conflicts, validation and remaining decisions in the sync log. Push and verify the remote SHA.
5. Repeat after each owner-merged feature and before starting governance changes. This is an agent workflow, not an installed background auto-sync service. If no agent is running, perform the catch-up merge on resumption.
6. Before final governance review, merge latest main, resolve conflicts, verify main is an ancestor, review the diff against main and run complete applicable acceptance checks. The owner may then squash-merge governance into main. Frequent synchronisation reduces conflicts but cannot guarantee none. Never force-push/rebase the shared workstream merely to hide integration history.
7. After a final squash merge, retire this branch and create a new branch from updated main for further work; do not reuse its pre-squash ancestry.

PR #24 was the small sequencing correction, merged to main at `6ee392a2301704ddadbe274cdcae4f2df425d166` and consumed through the normal sync recorded below. Its earlier independent-review state is historical. This workstream did not require PR #24 to merge before authorised governance work proceeded.

## Active backlog and evidence

The [governance requirements](governance-and-production-readiness-gate.md), [national obligations register](national-governance-obligations-register.md) and [65-finding assessment](evidence/2026-10-18-governance-review.md) remain the detailed baseline. These work packages can advance concurrently with operational development; dependencies within a package still apply.

| Package                                | Current state                                                                                                                                               | Next concrete output                                                                                                            | Decision dependency                                                                                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G01 applicability and data flows       | Initial register plus source-pinned current-state matrix prepared                                                                                           | Validate the matrix against a named customer/workflow when available; keep all unknown locations/copies explicit                | Named council/legal acceptance of actual workflows; no invented retention periods                                                                               |
| G02 council and operator authority     | Requirements prepared                                                                                                                                       | Explicit actor/action matrix and council self-administration design, including staff lifecycle and feature licensing boundaries | Owner/council choices for privileged support, suspension and emergency recovery                                                                                 |
| G03 technical isolation                | Current development boundary assessed                                                                                                                       | Compare runtime, database, storage, keys, deployment and support access against the authority matrix; define negative tests     | Production isolation/key/support model and budget remain unapproved                                                                                             |
| G04 bounded corrective controls        | F-029 audit input/rendering, F-011 idle-pool recovery, F-002 scoped queue pagination and F-009 resource-status admission implemented with hosted CI passing | Revalidate further findings against current main before opening another correction                                              | Preserve existing permissions, transaction ordering, idempotency and worker lease recovery; F-009 cap is per process and other readiness probes remain separate |
| G05 records and evidence               | Requirements prepared                                                                                                                                       | Class-specific custody, retention, holds, export/disposal and incident workflows                                                | Applicable legal/customer schedules and acceptance                                                                                                              |
| G06 assurance and production readiness | Pending implementation                                                                                                                                      | Trace each GOV requirement to source, test evidence, remaining risk and accountable acceptance                                  | Production enablement requires the relevant completed controls and acceptance                                                                                   |

At every functional milestone and governance sync, record the affected package/GOV IDs, progress, next action and decision owner (explicitly unassigned until appointed). This keeps governance moving rather than silently deferring it. Reusable corrective changes needed by functional work should be published in a small separate PR against main, then consumed here through the same sync path, avoiding competing implementations.

## Sync log

| Date (Melbourne) | Main source | Action | Validation |
| ---------------- | ----------- | ------ | ---------- |
| 18 October 2026 | `92b3eea8b8ecfd0505afb6d62d60a001903db161` | Created dedicated branch/worktree from owner-merged PR #23; no feature merge performed by agent | Documentation links and Git whitespace checked; runtime unchanged |
| 19 October 2026 | `1bbfa7bb68190278d6adb64bba39527b7a3e7e36` | Verified PR #24 merged at `6ee392a2301704ddadbe274cdcae4f2df425d166` and PR #26 merged at this main SHA. Merged reviewed main into governance from clean checkpoint `240752473bc1dd44f28ccea9ba8a26b88a69d00b`; merge result `a35582b2e9b1c80d0406c2aa5ffac286ba8ae633`. Follow-up queue reconciliation `855c9fd8dd4f5653bd284d489861757b75b0451d` preserves server keyset pagination, loads all authorized pages before client filters/counts/search, and cancels stale cursor walks. Conflicts in `apps/commandmaps/src/main.tsx`, `docs/plans/governance-and-production-readiness-gate.md` and `tests/browser.mjs` were manually resolved. | Local lint, format, typechecks and builds pass; `npm test` cannot reach `127.0.0.1:55432` and local PostgreSQL binaries are absent. Hosted runs `39161995663`/`39161998517` exposed a dropped F-029 string guard, restored in `318369442d82bcd1a7722b0960cf75fc20a1cc7c`. Runs `39162460514`/`39162463907` then passed the app suite and preceding browser assertions but found a stale search filter in the >1,000-row fixture; the test now clears it before seeding. Final hosted retry pending. `git diff --check` passed. |

### Current sync checkpoint — 19 October 2026

- Last immutable owner decision runsheet v1 at `240752473bc1dd44f28ccea9ba8a26b88a69d00b`: [Markdown](evidence/owner-review/CivicMAPS-owner-decision-runsheet.md), DOCX and PDF evidence pins remain unchanged by this sync.
- Reviewed main consumed: `1bbfa7bb68190278d6adb64bba39527b7a3e7e36` (PR #24 and #26 merged).
- Governance merge result: `a35582b2e9b1c80d0406c2aa5ffac286ba8ae633`; reviewed main is an ancestor.
- Owner decisions D01–D06 remain unresolved and are not reinterpreted by this sync.

Final governance completion is not implied by branch creation, a green CI run or the existence of a domain. F08 deployment and accepted migration 013 remain unchanged.
