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

PR #24 is the small sequencing correction and remains independently reviewable. Once owner-merged, consume it through the normal main sync. This workstream does not require that PR to merge before authorised governance work proceeds.

## Active backlog and evidence

The [governance requirements](governance-and-production-readiness-gate.md), [national obligations register](national-governance-obligations-register.md) and [65-finding assessment](evidence/2026-10-18-governance-review.md) remain the detailed baseline. These work packages can advance concurrently with operational development; dependencies within a package still apply.

| Package | Current state | Next concrete output | Decision dependency |
| --- | --- | --- | --- |
| G01 applicability and data flows | Initial national register prepared; implementation-pinned map in progress | Map implemented and planned fields, actors, locations, secondary copies and subprocessors to duties and record classes | Named council/legal acceptance of actual workflows; no invented retention periods |
| G02 council and operator authority | Requirements prepared | Explicit actor/action matrix and council self-administration design, including staff lifecycle and feature licensing boundaries | Owner/council choices for privileged support, suspension and emergency recovery |
| G03 technical isolation | Current development boundary assessed | Compare runtime, database, storage, keys, deployment and support access against the authority matrix; define negative tests | Production isolation/key/support model and budget remain unapproved |
| G04 bounded corrective controls | F-029 API/rendering correction implemented and exact-head CI passed; other candidates pending | F-002 queue completeness, F-011 pool errors and F-009 shared-capacity controls with meaningful regressions | Preserve existing permissions, transaction ordering and immutable historical audit |
| G05 records and evidence | Requirements prepared | Class-specific custody, retention, holds, export/disposal and incident workflows | Applicable legal/customer schedules and acceptance |
| G06 assurance and production readiness | Pending implementation | Trace each GOV requirement to source, test evidence, remaining risk and accountable acceptance | Production enablement requires the relevant completed controls and acceptance |

At every functional milestone and governance sync, record the affected package/GOV IDs, progress, next action and decision owner (explicitly unassigned until appointed). This keeps governance moving rather than silently deferring it. Reusable corrective changes needed by functional work should be published in a small separate PR against main, then consumed here through the same sync path, avoiding competing implementations.

## Sync log

| Date (Melbourne) | Main source | Action | Validation |
| --- | --- | --- | --- |
| 18 October 2026 | `92b3eea8b8ecfd0505afb6d62d60a001903db161` | Created dedicated branch/worktree from owner-merged PR #23; no feature merge performed by agent | Documentation links and Git whitespace checked; runtime unchanged |

Final governance completion is not implied by branch creation, a green CI run or the existence of a domain. F08 deployment and accepted migration 013 remain unchanged.
