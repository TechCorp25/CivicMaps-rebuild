# F04 — Durable provisioning job lifecycle: implementation brief

Prepared from main `130caab6b97230c0b5cf45d75a19ee4ec2805085`, which merged PR #9 including assessed-context fix `683abee563efa37a77826d35d1aae4fa6fc492ca`. F01, F02, F02Q and F03 dependencies are merged. This document prepares F04; it does not claim implementation or acceptance completion.

## Single-feature goal

A platform operator can request, observe and safely resume one durable municipality provisioning job across retries, duplicate delivery and worker restarts. Use a visibly synthetic adapter only. See the [feature card](civicmaps-platform-assessment-and-autonomous-plan.md#f04--durable-provisioning-job-lifecycle) and [feature ledger](civicmaps-feature-ledger.json).

Registration currently creates a Provisioning municipality, pending first admin and audit event in `services/api/platform.mjs`. No durable job/worker exists. Integrate here and in the Platform onboarding/detail UI; preserve existing registration idempotency and password-response handling. Never put credentials in job payloads, status responses, logs or audit details.

## Targeted build checkpoints

1. **Define and migrate the job model.** Add migration 006 after the applied 005 RLS fix. Persist municipality, initiating operator, adapter mode, job state, step state, attempts, bounded retry schedule, lease ownership/expiry and timestamps. Define allowed transitions and terminal states, uniqueness for duplicate requests and at most one active job per municipality. Keep registry status distinct from job success. Preserve existing records; do not automatically enqueue historical councils on migration/seed.
2. **Integrate enqueue and inspection.** Atomically register/enqueue or expose an explicit operator action that atomically requests the job. Choose and document one supported path. Reuse existing platform session, CSRF, input validation and idempotency conventions. Persist the job before returning success; expose municipality-scoped job/step history. Council credentials cannot read or control jobs. Failed/duplicate enqueue must not leave partial registry or job data.
3. **Build the worker and synthetic adapter.** Use the existing PostgreSQL/Node stack, a separately runnable worker and a small adapter interface; no new queue service or generic workflow engine. Claim work atomically using database time. Fence completion/retry updates with the current lease token so a stale worker cannot overwrite a newer attempt. Do not hold a database transaction across adapter calls. Persist stable job/step idempotency keys and synthetic resource IDs; adapter reconciliation must recover the crash window after an effect but before its checkpoint. Demonstrate at-least-once execution safely rather than claiming exactly-once external delivery.
4. **Integrate recovery and status UI.** Show queued/running/waiting/failed/succeeded job state, current step, attempt count and actionable error summaries. Offer authorised retry and reconcile actions with idempotency and concurrency protection. Define reconcile as inspecting recorded synthetic effects and repairing/resuming checkpoints; do not invent live-resource health. Show synthetic mode prominently. A simulated success must not mark a municipality Active or imply production readiness. Retain existing Active fixture rows without downgrade. Worker failure leaves the municipality non-active and diagnosable.
5. **Test and publish the feature.** Run targeted disposable-database worker/API tests and browser acceptance, then the full quality suite. Record evidence, exact source SHA, limitations and rollback. Update the ledger and Empirical, push and verify the remote SHA, and maintain a single F04 draft PR for owner review. F05 remains planned until F04 acceptance and owner merge.

## Acceptance matrix

| Scenario | Required outcome |
| --- | --- |
| New request and duplicate submission | One durable job for the municipality; stable response; no duplicate steps/resources or registry records |
| Registration/enqueue transaction failure | No partial job/registry write; existing onboarding retry/credential rules preserved |
| Two workers claim one eligible job | One current lease; no competing accepted step completion |
| Worker dies before/after adapter effect | Lease expiry permits recovery of the same job; stable keys/reconcile recover the effect without duplicating resources |
| Old worker returns after lease takeover | Fenced write rejected; newer job/step state remains authoritative |
| Retryable/permanent step failure | Bounded attempts/backoff; visible terminal failure; municipality never becomes Active |
| Operator retry/reconcile, including duplicates | Authorised and audited; same job/history retained; concurrent actions cannot revive completed work incorrectly |
| Alpha and Beta jobs interleave | Each result/resource/audit stays linked to its municipality; council sessions cannot inspect/control either platform job |
| Missing session, CSRF or forged IDs | Denied without state changes; job IDs are validated and bound to the requested municipality |
| Synthetic successful completion | Persisted job success and resource IDs, visibly synthetic; no real provisioning or activation claimed |
| Audit and errors | Initiating operator plus job/municipality/step/resource identifiers traceable; worker actions distinguishable; no credentials exposed |
| Existing populated database and repeated migration/seed | Existing rows, passwords, grants, captures and retries preserved; no automatic jobs or duplicate audit noise |
| UI reload and worker pause/restart | Durable status survives reload; retry/reconcile availability matches server state; keyboard/narrow-layout/error recovery work |

Use deterministic fault injection and controllable lease expiry in disposable fixtures. Avoid tests that depend on long sleeps. Include the adapter-effect/checkpoint crash window, not just a restart between completed steps. Test job permissions independently at SQL-role and API boundaries so the F03 mismatch class cannot recur.

## Validation and completion evidence

Run `npm run setup`, focused job/worker tests, `npm run check`, `npm run test:platform:browser`, and CommandMAPS browser regression against a seeded disposable environment. Exercise the worker as a separate process for restart acceptance. Preserve generated tokens. Add a runnable worker command and relevant checks to the existing CI rather than claiming manual-only coverage. Consult Context7 for the exact installed PostgreSQL/Node/library behaviour where needed.

Write `docs/plans/evidence/F04.md` with commands/results, tested commit, migration/upgrade evidence, failure/restart matrix, screenshots for the new status UI and synthetic limitations. Record the remote branch/PR and Empirical completion separately; only mark F04 review_ready when all gates pass. At interruption, checkpoint current SHA, dirty paths, completed matrix rows, failing command and exact next action. Resume on the same feature branch without repeating completed work or starting F05.

## Boundaries, rollback and gotchas

No real provider resources, isolation choice, DNS/TLS, admin activation, service routing, pack enforcement, public portals or payments. D01–D06 remain at their established later feature boundaries; F04 needs no production-provider decision.

Rollback: pause the worker and disable new enqueue/retry actions while retaining jobs, steps, registry and audit for diagnosis. Do not remove populated resources or rewrite applied migrations. Document worker/schema compatibility and lease recovery before shipping.

Carry forward F03: keep migration 005 and its restrictive context policies; platform jobs must not widen council role access. Preserve immutable operational capture. Use one test environment per process because the API pool is cached. Migration counts must include the new migration. PostgreSQL transaction-start time is stale after lock waits; use database time appropriate to claim/lease semantics and test it. AFTER audit triggers avoid false events from skipped `ON CONFLICT` inserts. Do not infer production readiness from synthetic success.
