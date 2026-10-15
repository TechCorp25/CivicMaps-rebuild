# Municipality data resources (F05)

F05 adds the `aws-sydney-development` profile to the existing durable provisioning worker. The default remains the explicitly labelled synthetic adapter. New AWS jobs create one PostgreSQL database/runtime login and one independently authorised S3 prefix per municipality, on shared development compute in Sydney (`ap-southeast-2`, project `597663815195`). The application profile permits two municipalities. No service deployment, routing or admin activation is performed; successful municipalities remain Provisioning.

## Configuration and deployment

The reviewed infrastructure is [aws-development.json](../../infrastructure/f05/aws-development.json). Its parameters identify the selected VPC, two or more subnets, an outbound-only runner subnet and an approved Amazon Linux image. This template targets the recorded default VPC; its runner's PostgreSQL egress uses that VPC's `172.31.0.0/16` range. Check this before reusing the template elsewhere. Do not create another stack merely to rerun acceptance.

The database is private, Single-AZ PostgreSQL 18.6, `db.t4g.micro`, 20 GiB encrypted gp3, one-day backups and deletion protection. S3 is private, encrypted and versioned. RDS and S3 have Retain policies. The runner has no inbound rules, requires IMDSv2 and uses an instance role. It is a privileged acceptance/provisioning broker, not a council runtime.

Start the API and worker with these selectors, using the deployed stack outputs:

```text
CIVICMAPS_PROVISIONING_PROFILE=aws-sydney-development
CIVICMAPS_RESOURCE_HOST=<DatabaseHost>
CIVICMAPS_RESOURCE_MASTER_SECRET=<MasterSecretArn>
CIVICMAPS_RESOURCE_BUCKET=<Bucket>
CIVICMAPS_RESOURCE_ROLE=<RuntimeRoleArn>
CIVICMAPS_RESOURCE_CA=<path to the AWS Sydney RDS CA bundle>
```

`CIVICMAPS_DATABASE_URL` still selects the control plane. AWS CLI must be on PATH, or selected through `CIVICMAPS_AWS_BINARY`. All resource calls explicitly select Sydney. On the development workstation use profile CivicMAPS and the toolkit's configuration/cache paths; on the runner use its instance role. Never copy credentials into source, the ledger, screenshots or Empirical. Login sessions are temporary: `aws login` does not support a 90-day session in this workflow.

## Ownership, authentication and recovery

[Migration 007](../../services/api/migrations/007-data-resources.sql) preserves existing synthetic jobs and adds resource inventory plus explicit context-to-resource bindings. Resource names derive from validated job/municipality UUIDs. Inventory stores references, never passwords. Creating resources cannot create user grants or bind an operating context. A structural writer must explicitly bind the authorised immutable context version in `municipality_resource_contexts`; F03's user/context grant checks still apply independently.

The provisioner holds a PostgreSQL advisory lock and reserves a durable ownership row before non-transactional database creation. A new database starts with connections disabled until PUBLIC privileges are removed and its runtime receives CONNECT. Runtime roles have no superuser, database/role creation, inheritance, replication or RLS bypass powers. PUBLIC CONNECT/TEMP is also removed from `postgres` and `template1` on this dedicated F05 instance. Do not point this adapter at an unrelated shared database server.

Passwords are generated once into tagged Secrets Manager records. Retries verify tags, owner, database and login fields and reuse the same password. They do not rotate a working secret or adopt an existing database/login without an ownership reservation. Data migrations use their own transactional version ledger: version 1 creates resource records; version 2 adds creation timestamps. Failure rolls back the pending version; replay preserves records and grants. Unknown future/gapped versions fail closed. Worker checkpoints retain F04's lease fencing and bounded attempt budget; AWS errors are sanitised before job/audit persistence.

The backend resolver derives municipality and context from the authenticated server-side user/grant, verifies the explicit resource binding and deterministic inventory fields, and opens an independent TLS connection using that resource's real runtime login. It closes the connection after the callback, including failures. The authenticated `/api/resources/status` route exercises this resolver and returns readiness/context identifiers only. Existing operational APIs retain their F03 boundary; migrating historical operations or deploying council services is outside F05.

Each storage call uses a 15-minute STS session restricted to one exact municipality/job prefix. Its policy intersects the runtime role's base policy. It permits own-prefix list/read/write/delete and cannot read Secrets Manager or assume another role. The provisioner verifies an ownership marker; a prefix alone never grants access. S3 GetObject uses explicit CLI bucket/key arguments and a private temporary output file, removed in `finally`.

Provider administrators and the privileged broker can access all F05 resources. Runtime credentials and the server-side resolver are the tested municipality boundary. F05 does not claim protection against a compromised provider administrator or broker, dedicated compute, production identity management, immutable evidence retention or a deployed control-plane service.

## Repeatable validation

```sh
npm run check
npm run test:platform:browser
npm run test:commandmaps:browser
```

Both browser commands use disposable control databases; run them sequentially. CI runs these checks and uploads screenshots. Local tests include historical F04 upgrade/seed preservation, data version upgrade/failure/replay, inventory/context rejection, capacity and maintenance pause. They do not substitute for provider acceptance.

Run the explicit provider harness from the authorised runner with the resource selectors above, Node/npm dependencies, a disposable local PostgreSQL control-plane base and:

```sh
CIVICMAPS_CLOUD_ACCEPTANCE=F05-synthetic-only npm run test:resources:cloud
```

The harness uses fixed synthetic Alpha/Beta job IDs `f0500000-0000-4000-8000-000000000001` and `...0002` for stable replay. The first run upgrades populated version-1 resources through an injected version-2 failure, then the worker completes version 2. Later runs verify the retained version-2 resources; CI independently repeats the version-1 upgrade test. Every run checks actual SCRAM challenges, correct/wrong/missing/cross-paired passwords, TLS, privilege and cross-database denial, login disable/re-enable, S3 crossing/escalation denial, swapped credentials through the real backend, HTTP context denial and stale-worker crash recovery. It removes only its generated disposable control database and retains the populated data resources. See [executed evidence](../plans/evidence/F05.md) for the actual inventory and results.

## Rollback, retention and cost

Set `CIVICMAPS_PROVISIONING_PAUSED=1` on the API to reject new registrations before effects, and stop the worker. Preserve existing jobs/checkpoints. Set `municipality_resources.disabled_at` for the selected resource to deny further broker access. The privileged `setDatabaseAccess(job,target,false)` helper verifies ledger/secret ownership, disables the owned runtime login and terminates its connections; pass `true` to restore login without deleting data or changing the password. Existing issued S3 sessions can remain valid for up to 15 minutes; an urgent storage revocation requires an explicit provider bucket-policy deny for the affected prefix. Do not delete data as a substitute for access revocation.

Owner-approved development budget: US$50/month, including a US$15 initial seven-day acceptance allocation. Review retained resources on **21 October 2026**. This tag/date is not an automatic expiry or permission to delete populated resources. Check spend in AWS Settings > Billing; confirm the selected Region in AWS Settings > View all projects > Overview > Additional Info > Region. Budgets/alerts do not enforce a hard cap. Stop the acceptance runner after testing; RDS, secrets, retained EBS and S3 continue to accrue charges. Baseline database list pricing is recorded in [preflight](../plans/evidence/F05-aws-preflight.md).

Keep populated Alpha/Beta resources and ownership markers. Clean only exact owned, empty disposable test resources after verifying both provider tags and the ownership ledger; never infer ownership from a name/prefix. There is deliberately no bulk/drop-data cleanup endpoint. The harness drops its generated control database, while the run inventory identifies the retained cloud resources and any explicitly removed acceptance artefacts. Do not delete the stack as a general cleanup command: retained RDS/S3 resources still exist and may incur costs.
