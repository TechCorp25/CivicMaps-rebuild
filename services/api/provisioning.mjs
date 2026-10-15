import { randomUUID } from 'node:crypto';
import { transaction } from './database.mjs';
import {
  awsResourceAdapter,
  resourceNames,
  resourceProfile,
  dataSchemaVersion,
} from './data-resources.mjs';
const maxAttempts = 3;
export const stepNames = ['prepare_workspace', 'prepare_services'];
function conflict(message) {
  throw Object.assign(new Error(message), { status: 409 });
}
export async function enqueueProvisioning(client, municipalityId, operatorId) {
  if (process.env.CIVICMAPS_PROVISIONING_PAUSED === '1')
    conflict('Provisioning is paused for resource maintenance');
  const profile = process.env.CIVICMAPS_PROVISIONING_PROFILE;
  if (profile && profile !== resourceProfile) throw new Error('Invalid provisioning profile');
  if (profile) {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('civicmaps-f05-capacity'))");
    const existing = await client.query(
      "SELECT count(*)::int AS count FROM provisioning_jobs WHERE adapter='aws-postgres-s3'",
    );
    if (existing.rows[0].count >= 2)
      conflict('The development profile permits two municipality resources');
  }
  const id = randomUUID();
  await client.query(
    'INSERT INTO provisioning_jobs(id,municipality_id,operator_id,adapter,profile) VALUES ($1,$2,$3,$4,$5)',
    [id, municipalityId, operatorId, profile ? 'aws-postgres-s3' : 'synthetic', profile ?? null],
  );
  for (const [index, name] of stepNames.entries())
    await client.query('INSERT INTO provisioning_steps(job_id,name,position) VALUES ($1,$2,$3)', [
      id,
      name,
      index + 1,
    ]);
  return id;
}
export async function readProvisioning(client, municipalityId) {
  // Lease tokens are internal fencing credentials, never sent to the browser.
  const jobs = await client.query(
    `SELECT id,municipality_id,operator_id,adapter,profile,state,attempts,available_at,lease_until,error,created_at,updated_at,
    state='failed' AS can_retry,
    (state IN ('queued','waiting','failed') OR (state='running' AND lease_until<=clock_timestamp())) AS can_reconcile
    FROM provisioning_jobs WHERE municipality_id=$1`,
    [municipalityId],
  );
  if (!jobs.rowCount) return null;
  const job = jobs.rows[0];
  const steps = await client.query(
    'SELECT name,position,state,attempts,resource_id,error,completed_at FROM provisioning_steps WHERE job_id=$1 ORDER BY position',
    [job.id],
  );
  return { ...job, steps: steps.rows };
}
export async function controlProvisioning(client, actor, municipalityId, jobId, action) {
  const found = await client.query(
    'SELECT * FROM provisioning_jobs WHERE id=$1 AND municipality_id=$2 FOR UPDATE',
    [jobId, municipalityId],
  );
  if (!found.rowCount)
    throw Object.assign(new Error('Provisioning job not found'), { status: 404 });
  const job = found.rows[0];
  if (action === 'retry' && job.state !== 'failed') conflict('Only a failed job can be retried');
  if (action === 'reconcile') {
    if (job.state === 'succeeded') conflict('This provisioning job is already complete');
    const live = await client.query(
      "SELECT 1 FROM provisioning_jobs WHERE id=$1 AND state='running' AND lease_until>clock_timestamp()",
      [jobId],
    );
    if (live.rowCount) conflict('The worker lease is still active. Refresh after it expires.');
  }
  await client.query(
    "UPDATE provisioning_jobs SET state='queued',available_at=clock_timestamp(),lease_token=NULL,lease_until=NULL,error=NULL,updated_at=clock_timestamp() WHERE id=$1",
    [jobId],
  );
  // Finished steps remain immutable checkpoints; only incomplete work gets a new budget.
  await client.query(
    "UPDATE provisioning_steps SET state='pending',attempts=0,error=NULL WHERE job_id=$1 AND state<>'succeeded'",
    [jobId],
  );
  await client.query(
    'INSERT INTO platform_audit(operator_id,municipality_id,action,details) VALUES ($1,$2,$3,$4)',
    [
      actor.id,
      municipalityId,
      `provisioning_${action}_requested`,
      {
        jobId,
        adapter: job.adapter,
        initiatingOperatorId: job.operator_id,
        performedBy: 'operator',
      },
    ],
  );
  return { job: await readProvisioning(client, municipalityId) };
}
async function workerTransaction(work) {
  return transaction(async (client) => {
    await client.query('SET LOCAL ROLE civicmaps_provisioning_worker');
    return work(client);
  });
}
async function workerAudit(client, job, action, details = {}) {
  await client.query(
    'INSERT INTO platform_audit(operator_id,municipality_id,action,details) VALUES ($1,$2,$3,$4)',
    [
      job.operator_id,
      job.municipality_id,
      action,
      {
        jobId: job.id,
        initiatingOperatorId: job.operator_id,
        performedBy: 'worker',
        adapter: job.adapter,
        ...details,
      },
    ],
  );
}
export async function claimProvisioning({ leaseMs = 60_000 } = {}) {
  if (!Number.isSafeInteger(leaseMs) || leaseMs < 1 || leaseMs > 300_000)
    throw new Error('Invalid worker lease duration');
  return workerTransaction(async (client) => {
    const result = await client.query(`SELECT * FROM provisioning_jobs WHERE
      (state IN ('queued','waiting') AND available_at<=clock_timestamp()) OR (state='running' AND lease_until<=clock_timestamp())
      ORDER BY available_at,created_at,id FOR UPDATE SKIP LOCKED LIMIT 1`);
    if (!result.rowCount) return null;
    const job = result.rows[0];
    const steps = await client.query(
      "SELECT * FROM provisioning_steps WHERE job_id=$1 AND state<>'succeeded' ORDER BY position LIMIT 1 FOR UPDATE",
      [job.id],
    );
    const step = steps.rows[0];
    if (!step) throw new Error('Incomplete job has no pending step');
    if (step.attempts >= maxAttempts) {
      await client.query(
        "UPDATE provisioning_jobs SET state='failed',lease_token=NULL,lease_until=NULL,error='Attempt limit reached. Retry or reconcile this job.',updated_at=clock_timestamp() WHERE id=$1",
        [job.id],
      );
      await client.query(
        "UPDATE provisioning_steps SET state='failed',error='Attempt limit reached' WHERE job_id=$1 AND name=$2",
        [job.id, step.name],
      );
      await workerAudit(client, job, 'provisioning_failed', {
        step: step.name,
        attempt: step.attempts,
      });
      return null;
    }
    const token = randomUUID();
    await client.query(
      "UPDATE provisioning_jobs SET state='running',attempts=attempts+1,lease_token=$2,lease_until=clock_timestamp()+$3*interval '1 millisecond',error=NULL,updated_at=clock_timestamp() WHERE id=$1",
      [job.id, token, leaseMs],
    );
    await client.query(
      "UPDATE provisioning_steps SET state='running',attempts=attempts+1,error=NULL WHERE job_id=$1 AND name=$2",
      [job.id, step.name],
    );
    await workerAudit(client, job, 'provisioning_step_started', {
      step: step.name,
      attempt: step.attempts + 1,
    });
    return { ...job, lease_token: token, step: { ...step, attempts: step.attempts + 1 } };
  });
}
export const syntheticAdapter = {
  async reconcile(job, step) {
    return workerTransaction(async (client) => {
      const result = await client.query(
        'SELECT resource_id FROM synthetic_provisioning_effects WHERE job_id=$1 AND step_name=$2',
        [job.id, step.name],
      );
      return result.rows[0]?.resource_id ?? null;
    });
  },
  async apply(job, step) {
    return workerTransaction(async (client) => {
      const resource = `synthetic:${job.municipality_id}:${job.id}:${step.name}`;
      await client.query(
        'INSERT INTO synthetic_provisioning_effects(job_id,step_name,resource_id) VALUES ($1,$2,$3) ON CONFLICT (job_id,step_name) DO NOTHING',
        [job.id, step.name, resource],
      );
      const result = await client.query(
        'SELECT resource_id FROM synthetic_provisioning_effects WHERE job_id=$1 AND step_name=$2',
        [job.id, step.name],
      );
      return result.rows[0].resource_id;
    });
  },
};
export async function finishProvisioning(claim, { resourceId, errorCode } = {}) {
  return workerTransaction(async (client) => {
    // Lock then check database time: a delayed old worker cannot checkpoint after takeover.
    const locked = await client.query('SELECT id FROM provisioning_jobs WHERE id=$1 FOR UPDATE', [
      claim.id,
    ]);
    if (!locked.rowCount) return false;
    const current = await client.query(
      "SELECT id FROM provisioning_jobs WHERE id=$1 AND state='running' AND lease_token=$2 AND lease_until>clock_timestamp()",
      [claim.id, claim.lease_token],
    );
    if (!current.rowCount) return false;
    if (errorCode) {
      const retryable = errorCode === 'transient' && claim.step.attempts < maxAttempts;
      const message = retryable
        ? 'Provisioning step unavailable; automatic retry scheduled.'
        : 'Provisioning step failed. Retry or reconcile the job.';
      await client.query(
        'UPDATE provisioning_steps SET state=$3,error=$4 WHERE job_id=$1 AND name=$2',
        [claim.id, claim.step.name, retryable ? 'pending' : 'failed', message],
      );
      await client.query(
        "UPDATE provisioning_jobs SET state=$2,error=$3,available_at=clock_timestamp()+$4*interval '1 second',lease_token=NULL,lease_until=NULL,updated_at=clock_timestamp() WHERE id=$1",
        [claim.id, retryable ? 'waiting' : 'failed', message, 2 ** claim.step.attempts],
      );
      await workerAudit(
        client,
        claim,
        retryable ? 'provisioning_retry_scheduled' : 'provisioning_failed',
        {
          step: claim.step.name,
          attempt: claim.step.attempts,
          errorCode: retryable ? 'transient' : 'failed',
        },
      );
    } else {
      const expected =
        claim.adapter === 'synthetic'
          ? `synthetic:${claim.municipality_id}:${claim.id}:${claim.step.name}`
          : `aws:${claim.id}:${claim.step.name === 'prepare_workspace' ? 'database' : 'storage'}`;
      if (typeof resourceId !== 'string' || resourceId !== expected)
        throw new Error('Invalid provisioning resource');
      if (claim.adapter === 'aws-postgres-s3') {
        const names = resourceNames(claim);
        await client.query(
          `INSERT INTO municipality_resources(job_id,municipality_id,profile,database_name,runtime_name,secret_ref,storage_prefix,schema_version)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (job_id) DO NOTHING`,
          [
            claim.id,
            claim.municipality_id,
            claim.profile,
            names.database_name,
            names.runtime_name,
            names.secret_ref,
            names.storage_prefix,
            dataSchemaVersion,
          ],
        );
      }
      await client.query(
        "UPDATE provisioning_steps SET state='succeeded',resource_id=$3,completed_at=clock_timestamp(),error=NULL WHERE job_id=$1 AND name=$2",
        [claim.id, claim.step.name, resourceId],
      );
      const pending = await client.query(
        "SELECT 1 FROM provisioning_steps WHERE job_id=$1 AND state<>'succeeded'",
        [claim.id],
      );
      await client.query(
        'UPDATE provisioning_jobs SET state=$2,available_at=clock_timestamp(),lease_token=NULL,lease_until=NULL,error=NULL,updated_at=clock_timestamp() WHERE id=$1',
        [claim.id, pending.rowCount ? 'queued' : 'succeeded'],
      );
      await workerAudit(client, claim, 'provisioning_step_succeeded', {
        step: claim.step.name,
        attempt: claim.step.attempts,
        resourceId,
      });
      if (!pending.rowCount)
        await workerAudit(client, claim, 'provisioning_succeeded', {
          synthetic: claim.adapter === 'synthetic',
        });
    }
    return true;
  });
}
export async function runProvisioningOnce({ adapter, leaseMs, afterClaim, afterEffect } = {}) {
  const claim = await claimProvisioning({ leaseMs });
  if (!claim) return false;
  if (afterClaim) await afterClaim(claim);
  let resourceId;
  try {
    adapter ??= claim.adapter === 'synthetic' ? syntheticAdapter : awsResourceAdapter();
    // Reconcile every attempt before applying; stable keys recover uncheckpointed effects.
    resourceId =
      (await adapter.reconcile(claim, claim.step)) ?? (await adapter.apply(claim, claim.step));
  } catch (error) {
    await finishProvisioning(claim, {
      errorCode: error.code === 'TRANSIENT' ? 'transient' : 'permanent',
    });
    return true;
  }
  if (afterEffect) await afterEffect(claim);
  await finishProvisioning(claim, { resourceId });
  return true;
}
