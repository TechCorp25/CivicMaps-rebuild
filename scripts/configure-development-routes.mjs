// Explicit deployment bootstrap for the two retained synthetic F05 sandboxes only.
import { randomUUID } from 'node:crypto';
import { pool, transaction } from '../services/api/database.mjs';
import { resourceNames } from '../services/api/data-resources.mjs';
if (process.env.CIVICMAPS_CONFIGURE_ROUTES !== 'F06-synthetic-only')
  throw new Error('Explicit F06 configuration selector required');
try {
  await transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('f06-manifest'))");
    const operator = (
      await client.query('SELECT id FROM platform_operators ORDER BY email LIMIT 1')
    ).rows[0];
    if (!operator) throw new Error('Seeded synthetic operator required');
    for (const n of [1, 2]) {
      const municipality = `20000000-0000-4000-8000-00000000000${n}`;
      const binding = `10000000-0000-4000-8000-00000000000${n}`;
      const job = { id: `f0500000-0000-4000-8000-00000000000${n}`, municipality_id: municipality };
      const names = resourceNames(job);
      // Import exact retained resource identities; this creates no external resources or user grants.
      await client.query(
        `INSERT INTO provisioning_jobs(id,municipality_id,operator_id,adapter,profile,state)
    VALUES($1,$2,$3,'aws-postgres-s3','aws-sydney-development','succeeded') ON CONFLICT(id) DO NOTHING`,
        [job.id, municipality, operator.id],
      );
      await client.query(
        `INSERT INTO municipality_resources(job_id,municipality_id,profile,database_name,runtime_name,secret_ref,storage_prefix,schema_version)
    VALUES($1,$2,'aws-sydney-development',$3,$4,$5,$6,2) ON CONFLICT(job_id) DO NOTHING`,
        [job.id, municipality, ...Object.values(names)],
      );
      await client.query(
        'INSERT INTO municipality_resource_contexts VALUES($1,$2) ON CONFLICT DO NOTHING',
        [job.id, binding],
      );
      const hostname = `${n === 1 ? 'alpha' : 'beta'}-commandmaps.dev.civicmaps.com.au`;
      const existing = (
        await client.query('SELECT * FROM service_routes WHERE hostname=$1', [hostname])
      ).rows[0];
      if (
        existing &&
        (existing.binding_id !== binding ||
          existing.job_id !== job.id ||
          existing.municipality_id !== municipality ||
          existing.service !== 'commandmaps')
      )
        throw new Error('Route ownership conflict');
      await client.query(
        `INSERT INTO service_routes(id,hostname,service,municipality_id,binding_id,job_id,target)
    VALUES($1,$2,'commandmaps',$3,$4,$5,'civicmaps-f06-development') ON CONFLICT(hostname) DO NOTHING`,
        [randomUUID(), hostname, municipality, binding, job.id],
      );
      await client.query("UPDATE platform_municipalities SET status='Provisioning' WHERE id=$1", [
        municipality,
      ]);
    }
    await client.query(
      "INSERT INTO service_routes(id,hostname,service,target) VALUES($1,'platform.dev.civicmaps.com.au','platform','civicmaps-f06-development') ON CONFLICT(hostname) DO NOTHING",
      [randomUUID()],
    );
  });
  console.log('F06 manifest configured; live TLS/resource probes still required.');
} finally {
  await pool.end();
}
