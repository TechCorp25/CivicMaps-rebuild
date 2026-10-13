# Synthetic provisioning jobs (F04)

Registering a new municipality atomically creates one queued job and two steps: `prepare_workspace` and `prepare_services`. Historical registry fixtures are not enqueued. Registration retry receipts carry the same job ID and still omit temporary passwords. A job contains IDs, state and timing only, never admin credentials.

Run migrations through 006, seed the dedicated development database, start the API/apps, then run `npm run worker:provisioning` in another terminal with the same `CIVICMAPS_DATABASE_URL`. `npm run worker:provisioning -- --once` executes at most one eligible step and exits. No worker runs implicitly inside the web/API process. Pausing it leaves the queue visible and durable.

## State and recovery contract

The job transitions `queued → running → queued/succeeded` on successful steps. A transient failure schedules `waiting → running` with 2/4-second backoff; each incomplete step has a maximum of three attempts per operator recovery cycle. Permanent failure or exhausted attempts produces `failed`. A crash retains `running` until its lease expires. Retry/reconcile preserve the job ID, completed steps, resource IDs and audit history; only incomplete step attempt budgets reset. The cumulative job attempt count never resets.

Claims lock one eligible job with `FOR UPDATE SKIP LOCKED`, using database clock time for eligibility and a fresh UUID lease token. The lease lasts 60 seconds. A completion/failure checkpoint locks the job, rechecks token and expiry with database clock time, and writes the step, job and audit atomically. Expired or superseded workers cannot checkpoint. Adapter operations happen between short database transactions; no transaction spans an adapter call. There is no lease heartbeat in this bounded local simulation: an overlong operation is recovered after expiry.

The synthetic adapter keeps durable effects in its own table keyed by `(job_id, step_name)`. Every attempt reconciles first; applying the same stable key cannot create a second effect. Resource IDs contain the municipality, job and step, with a `synthetic:` prefix. A process crash after effect commit but before checkpoint is recovered by finding that exact effect, then checkpointing it. These are local synthetic proofs of at-least-once recovery, not live-provider or exactly-once delivery guarantees.

Successful simulation never changes municipality status to Active, creates operating bindings or activates an admin. Existing Active fixture municipalities retain their status. Job state is independent of registry status, infrastructure readiness and health.

## API and UI

`GET /api/platform/municipalities/:id` includes `job` (null for historical rows), ordered steps, error summaries and server-computed retry/reconcile availability. It omits the internal lease token. The detail UI polls active jobs, stops on terminal state/navigation, and supports manual refresh and unavailable-response recovery. Synthetic mode is labelled prominently.

`POST /api/platform/municipalities/:id/jobs/:jobId/actions` accepts only `{ "action": "retry" }` or `{ "action": "reconcile" }`. It requires an active platform session, CSRF and an Idempotency-Key. IDs must match the same municipality. Retry accepts failed jobs only. Reconcile accepts incomplete jobs with no live worker lease; it queues inspection of saved synthetic effects on the next worker attempt. Successful jobs cannot be restarted. Replay of a previous action receipt represents that request's acknowledgement; refresh detail for current state. Duplicate keys do not duplicate actions, and concurrent retries with different keys cannot begin two recovery cycles.

Worker events identify the initiating operator, municipality, job, step, attempt and synthetic resource where present, with `performedBy: worker`; operator recovery events identify the requesting operator separately. Provider exception text is not persisted or returned; the worker records bounded, actionable summaries.

## Permissions and compatibility

The council role has no job, step or effect access. The platform role manages job requests/status and cannot read the synthetic provider effect table. A new `civicmaps_provisioning_worker` NOLOGIN/NOBYPASSRLS role can update jobs/steps, insert/read synthetic effects and append platform audit; it cannot read operational users, admin credentials or activate municipalities. The existing trusted local database connection switches to this role only within worker transactions. This does not select production credentials or deployment architecture.

Migration 006 is additive, enqueues nothing and is safe to repeat through the migration ledger. Do not rewrite applied migrations. The worker requires 006; the new API must ship with 006 to enqueue atomically. An older API leaves new registrations without jobs, so pause registrations when rolling binaries back rather than silently losing queue coverage.

Rollback: stop the worker; pause registration and recovery mutations at the service boundary while diagnosing. Keep jobs, steps, effects, registry and audit. Expired leases permit recovery after restoring the matching worker/API version. There is no destructive down-migration or automatic resource cleanup.

## Verification and gotchas

`npm run test:provisioning` covers duplicate registration, enqueue rollback, claims, lease fencing, before/after-effect process crashes, bounded retries, operator controls, ownership, permissions and repeated migrations/seeds. `npm run check` includes this suite automatically. Platform browser acceptance tests status reload, keyboard retry, unavailable recovery, reconciliation of a crashed worker and successful completion, and captures desktop/narrow screenshots. See [F04 evidence](../plans/evidence/F04.md).

Test hooks are injected into the worker runner in disposable tests. The CLI's `CIVICMAPS_WORKER_TEST_FAULT=after-claim|after-effect` deliberately exits without cleanup and is accepted only with `NODE_ENV=test`; never use it on shared data. Tests expire leases explicitly, rather than sleeping for a minute. Import the worker module only after creating the test environment: its database import otherwise caches a pool for the base database. A narrow-layout check with long job IDs/email/slugs caught flex/grid minimum-width overflow; preserve wrapping and the browser check.

PostgreSQL 15 [queue locking](https://www.postgresql.org/docs/15/sql-select.html) was checked through Context7. Claims intentionally use SKIP LOCKED for the queue, not for ordinary registry reads.
