# F05 — Build execution plan

Prepared 14 October 2026 on `codex/civicmaps-f05-build`, based on main `8fb71bd1cbec4cd630deece5ec9ec589e2763f98`. PR #11 merged the preparation contract, including authentication clarification `51436b1ac1b34ded8850c0b14032451123594e4a`. It did not implement F05. F04 remains the last completed feature; F05 is the sole next build feature.

## Goal and contract

Develop, build, integrate and prove isolated municipality data resources through the durable provisioning adapter, then publish the tested feature for owner review and record completion in Empirical. The merged [F05 brief](F05-preparation.md) is the authoritative scope and acceptance matrix; this document supplies the session execution order, not a second specification. The [ledger](civicmaps-feature-ledger.json) separates preparation merge from implementation status.

## Entry decision

D01 is still unresolved. Approval of the preparation PR did not choose between its local and cloud alternatives. Before resource-dependent implementation, record the target/profile, isolation boundary, region/residency, resource budget, retention and secret facility in the brief's decision table. No secrets belong in the repository or Empirical.

The concrete proposal remains a PostgreSQL database and runtime login per sandbox plus an independently authorised storage namespace. Local development must prove real authentication and storage enforcement using synthetic data; cloud acceptance must exercise the selected account/provider. Hostnames remain F06. Contract inspection and synthetic test design can proceed before D01 is resolved; do not mark resource acceptance complete from that work.

## Sequential completion goals

| Checkpoint | Work | Observable completion evidence |
| --- | --- | --- |
| 0 — Establish target | Record D01 values, inspect current main and affected module READMEs, identify owned resource limits and selected authentication/secret mechanisms | Concrete target entry and executable acceptance setup; unresolved inputs recorded before dependent work |
| 1 — Develop persistence | Extend the current synthetic-only job/resource constraints through the next ordered migration; define profile, inventory, schema version and secret-reference ownership | Upgrade and replay preserve existing synthetic jobs and operational records; no implicit historical provisioning |
| 2 — Build resources | Implement one adapter for database, runtime login, storage authorisation and data-plane migrations; reconcile partial external effects | Duplicate and crash/restart tests recover the same owned resource IDs; credentials are never published; stale workers cannot checkpoint |
| 3 — Integrate | Connect inventory and permitted operating context to the actual backend resource resolver and safe job status/recovery UI | Real application access path reaches the correct resource; forged IDs/context fail; synthetic mode remains distinct; no Active/service-ready claim |
| 4 — Prove acceptance | Execute every row of the merged brief's matrix with Alpha/Beta resources and independent runtime connections | Valid credentials work; wrong/missing/cross-paired credentials fail under enforced authentication; database and storage crossing fail; migration/recovery/rollback evidence captured |
| 5 — Verify build | Run focused resource tests and `npm run check`; run Platform and CommandMAPS browser regressions sequentially; inspect CI | Passing commands tied to source SHA, reproducible target-specific checks, screenshots when UI changes, no generated-token drift |
| 6 — Publish | Write `docs/plans/evidence/F05.md`, update ledger, commit and push this branch, verify remote SHA, maintain one F05 implementation PR, update Empirical | Review-ready only after feature acceptance, publication and memory recording; owner decides merge; F06 remains planned until F05 is complete |

Use the existing stack and worker. Keep changes scoped to F05. Add comments for non-obvious authentication, ownership, transaction and retry rules; keep lint/format and Hooks checks enabled. Consult Context7 for installed database/provider behaviour during implementation. No routing, DNS/TLS, admin activation, pack enforcement, portal workflows or payments in this build.

## Authentication regression carried into the build

PR #11's assessment clarification is part of acceptance, not an optional follow-up. The current local launcher uses `trust`; merely supplying a password cannot prove it is validated. The F05 target must enforce the selected authentication method, such as SCRAM for password logins. Verify the matching connection rule and disable credential fallback in negative cases. Preserve separate cross-database, role-escalation and object-access tests. The exact matrix and documentation references remain in the [brief](F05-preparation.md#acceptance-matrix).

## Session control and handoff

At checkpoint 0, mark F05 in_progress only when implementation starts; no other feature may be in progress. Before interruption record HEAD, dirty paths, D01 values, owned resource IDs without secrets, completed/failed matrix rows, failing command and exact next action. Resume on `codex/civicmaps-f05-build`; the preparation branch was merged and is historical.

Record gotchas in Empirical as symptom, cause, verified fix and prevention with `authorType: agent` and project/F05 tags. Distinguish a planned test from an executed proof. Keep setup-before-import for the cached database pool, await reconcile before synchronous worker processes and retain F04's navigation/poll recovery regressions.

Rollback and cleanup follow the merged brief: pause new provisioning, preserve checkpoints and populated resources, disable access as needed and remove only explicitly owned, tagged, empty test resources. Capture an exact inventory. Do not infer deletion ownership from a prefix or change applied migrations.

## Preparation validation

This handoff changes documentation only. Validate ledger JSON/state consistency, merge/fix ancestry, relative links and diff whitespace. Runtime/provider tests belong to the build checkpoints and are not claimed by preparation. F05 remains planned, acceptance false, until its implementation evidence exists.
