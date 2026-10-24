# Execution handoff — complete the quality remediation goals

Version 1.0.0 · Owner instruction: 24 October 2026

You are the receiving developer's Codex execution coordinator for
TechCorp25/CivicMaps-rebuild. Execute the completed [remediation plan](remediation-plan.md)
through Q1–Q7. Start work; do not produce another planning-only response. This is
code-quality remediation before further feature building, with no new governance
block. The original developer is handing this workstream to another developer and
their Codex agents and will work on a separate task. Do not start their next task or
assume ownership of their other branches.

## Authoritative inputs and starting state

Read repository/local AGENTS.md, the plan, [assessment](assessment.md),
[findings register](findings.json), [references](references.md),
[reproduction notes](reproduction.md), and the
[independent audit protocol](../../plans/independent-product-audit-protocol.md).
Read applicable module READMEs before editing. Query Empirical scoped to
`CivicMaps-rebuild`, including current owner instructions and recurring gotchas.
Use Context7 for version-relevant library guidance during implementation.

The plan is v1.0.0, SHA-256
`1ce4e1a3000c5148eb98d161d2d941f2e85009249cb6ddc9dd6c61dd36578cea`.
It is the already completed goal/acceptance contract; retain its criteria and
rollback requirements. Any evidence-backed adjustment must be explicit and linked
to affected findings rather than silently dropping scope.

- Workstream/publication branch: `codex/civicmaps-code-quality-assessment-2026-10-24`.
- Existing draft PR: https://github.com/TechCorp25/CivicMaps-rebuild/pull/43.
- Assessed main: `346dfd2d74cdd52d88bf9e4b7bd046a500a4c390`.
- Assessment product independently accepted at `43423d7671468417914dc2d15841f59fd0ede0e8`;
  assessment receipt head before this handoff: `86d09a7be724de0950ebab48190748d982129c4d`.
- Those assessments accept the report/plan, not any implementation fixes.
- Plan Empirical memory: `6adcb100ba781229b953f72c`; assessment receipt:
  `6adcb21dba781229b953f83c`. Historical “owner review next” and “proposed, not
  started” statements describe assessment-time status. This handoff instructs the
  receiving developer to execute remediation; it does not authorise merge/deploy.

Fetch origin and verify the current branch tip, main and clean working tree. Read
later changes before choosing a baseline; do not reset someone else's work. Keep
one focused implementation package in progress, with a fresh explicitly stacked
package branch/worktree as required by repository workflow. Publish every completed
checkpoint to the workstream branch above, preserving history. Use a single
integration writer; fetch before each push, reconcile concurrent changes without
force-pushing, and revalidate materially changed candidates. Record base/candidate
SHAs and any stack dependency. Do not merge main or release the application merely
because a checkpoint passes.

## Model assignments and independent assessment

Implementation is **GPT-6 Luna, Medium reasoning** (`gpt-6-luna`, `medium`).
Independent assessment is **GPT-6 Astra, Low reasoning** (`gpt-6-astra`, `low`).
Use these actual model settings; a prompt claiming the role does not change the
model. If the receiving coordinator is another model, delegate implementation to
Luna with explicit settings and a fresh context. Do not silently substitute models.
If required model/session controls are unavailable, record the concrete limitation
and have the receiving developer launch the correctly configured separate session.

Each checkpoint receives a fresh Astra session with `fork_turns="none"`, never an
inherited builder conversation. Provide only a standalone neutral task/acceptance
contract, authoritative constraints, exact base and candidate SHAs, product-file
inventory, reproduction commands and raw evidence with SHA-256 hashes. Use an
isolated detached worktree at the pinned candidate so Luna's subsequent edits cannot
change the reviewed product. Exclude this operational handoff, builder diaries,
reasoning/CoF, self-evaluations, favourable summaries, prior conversations and prior
audit conclusions from initial audit packets. Necessary product documentation is
reviewable as product, never proof of correctness. Do not query broad Empirical
agent notes to form the auditor's verdict.

Neutral audit request: “Assess this product against the supplied task and
constraints. Determine correctness independently. Inspect the pinned source and
reproduce checks where possible. Do not infer intent or rely on builder claims.”

Require a report containing task/version, model/effort, fresh-context mechanism,
base/candidate SHA, input manifest/hashes, checks actually run, findings with
severity/location/reproduction, unverified requirements, limitations, timestamp and
`pass`, `changes_required` or `blocked`. No hidden reasoning is requested or stored.

## Checkpoint loop — publish, assess, and keep progressing

For each Q package, and each explicitly split subcheckpoint:

1. Take its exact requirements and acceptance from the existing plan. Implement a
   bounded goal, reproduce defects where meaningful, add real executable tests in
   the appropriate `tests/` directory, and wire discovery into local checks/CI.
2. Run relevant acceptance checks and required regression gates. Record exact
   commands, results and limitations. Do not call a skipped/zero-test run a pass.
3. Update product docs, findings and a remediation execution ledger; save meaningful
   progress to Empirical with explicit authorship. Keep original assessment evidence
   intact. Distinguish implemented, tested, published, under review and accepted.
4. Commit the complete candidate, push it to the named workstream branch, and verify
   the remote SHA equals the candidate. Publication is mandatory at each checkpoint,
   even when independent acceptance is still pending. Record CI status accurately.
5. Start fresh Astra Low assessment of that immutable published candidate. While
   Astra works, Luna continues useful independent next work in an isolated package
   worktree: fixtures, reproducible tooling, diagnostic cases or another bounded
   prerequisite that does not rely on unaccepted behaviour. Preserve one active
   implementation package; do not start a dependent package contrary to the plan's
   acceptance dependencies. When no independent implementation is available, use
   the time for read-only inspection and preparation. Do not idle solely for review,
   and do not present speculative downstream work as accepted.
6. Triage the report promptly. Fix validated defects on a new candidate, rerun
   affected checks, push and obtain fresh independent assessment. Suspend affected
   dependent work and rebase/retest isolated work if its assumptions changed. Record
   evidence-backed disagreements, never overwrite an auditor report or mark a
   failing checkpoint accepted. A targeted closure review must be labelled as such.
7. Record the report, accepted exact SHA, CI result and issue dispositions; push the
   checkpoint receipt and verify the remote tip again. Receipt-only commits do not
   imply that their SHA was the audited product. Material product changes require
   affected tests and reassessment. Update Empirical with the same identities.
8. Continue to the next eligible goal without asking the original owner to approve
   routine reversible implementation or repeatedly confirm this workstream.

All checkpoint pushes are reviewable work, not merge/deployment approval. Keep
unrelated ongoing work off this branch. No checkpoint may remain only on a local
machine when reported complete.

## Goal order and coverage

Use the full plan's acceptance clauses; the following is a navigation index only.

| Goal | Required finding coverage | Outcome |
| --- | --- | --- |
| Q1 | QA01; QA18 advisory portion | Patched parser, bounded HTTP regression, advisory CI |
| Q2 | QA02, QA03, QA17 | Bounded database/auth work, safe credential handling |
| Q3 | QA04, QA08, QA09 | Deterministic browser recovery, robust transport and deadlines |
| Q4 | QA05, QA10, QA11, QA12 | Correct offline GIS fixtures and reproducible ingestion |
| Q5 | QA06, QA13, QA14; QA18 Python/infra portions | Active-source checks and truthful bootstrap/scaffolds |
| Q6 | QA15, all four QA16 subissues | Authoritative presentation and tested browser hardening |
| Q7 | QA07 | Smaller responsibilities with preserved behaviour |

Q1 is first. Honour Q2's Q1-acceptance dependency, Q3's response-contract dependency,
Q5's Python-contract dependency and Q7's stable Q1–Q6 baseline. Apply independent
assessment to every completed checkpoint, including the final combined product.
Do not replace QA04's controlled reproduction with passing retries. Do not describe
the affected parser advisory as a locally reproduced crash: the assessment's bounded
probes did not crash. Do not reopen historical fixed findings without new evidence.

## Bootstrap and validation

Use `.node-version`, the root npm version and `npm run setup` with the committed
lockfile. Follow `docs/development/local-build.md` and actual current CI scripts.
Use dedicated synthetic PostgreSQL databases; never reset existing developer or
customer data. In the original workspace the prepared environment is
`/workspace/.assessment-2026-10-24-pg15/session-env.sh` (PG15, loopback port 55440).
Check that it exists and is suitable before sourcing; these paths/tools/databases
are machine-local and must be recreated through documented setup on another machine.
Never copy secrets into Git, audit packets or Empirical.

Baseline evidence includes full checks with 94 integration tests, three browser
suites, real Caddy loopback checks and regional cfn-lint. Those are historical results;
run required checks on each changed candidate. Preserve token drift checks, nested
test discovery, tenant/session authority, revocation ordering, idempotency and
lost-response recovery. Use the plan's offline/synthetic GIS tests and avoid live
dataset regeneration. CloudFormation validation targets `ap-southeast-2` and creates
no resources. Do not mutate AWS resources or operate on live customer data.

Codex Security's deep-scan coordinator was unavailable during assessment; manual
source/dependency review has explicit limits. Do not claim an exhaustive plugin scan
or certification. Use available supported tooling and retain precise limitations.

## Durable state, resumption and completion

Maintain an execution ledger alongside this handoff containing current goal,
status of every Q package, QA01–QA18 dispositions (including grouped subissues),
implementation and accepted SHAs, branch/PR, tests and evidence paths, auditor report
paths, pending reviews, dependencies and exact next action. Keep
`assessment-checkpoint.json` and `findings.json` current while preserving their
historical baseline provenance. Store full instruction/contract artifacts and
meaningful checkpoint receipts in Empirical with project tags, explicit authorship,
version, hash and immutable Git permalink; read back critical artifacts to verify.
Do not store secrets, raw conversations or private reasoning.

Before context or allowance exhaustion: push completed work, preserve unfinished
work safely without claiming acceptance, record pending auditor sessions and exact
resumption commands, update the ledger and Empirical, and provide the receiving
developer a concise handoff. On resumption inspect actual Git and audit state before
repeating work. Do not wait for the original developer's next unrelated task.

Finish only when all 18 findings are fixed or explicitly reclassified with evidence
and independent review; every Q goal is accepted; complete combined regression,
browser and Caddy gates pass; and a fresh Astra Low assessment accepts the final
integrated candidate. Publish all results and verify remote identity. Report the
accepted SHA, final branch tip, CI status, reports, remaining factual limitations
and next-feature readiness. Keep merge, deployment and new feature implementation
outside this handoff; those follow separate current owner authority. This is an
engineering completion criterion, not a new governance approval process.

Begin now with repository/memory reconciliation and Q1 implementation.
