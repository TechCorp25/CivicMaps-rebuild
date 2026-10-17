// Explicit deployment bootstrap for the two retained synthetic F05 sandboxes only.
import { randomUUID } from 'node:crypto';
import { pool, transaction } from '../services/api/database.mjs';
import { resourceNames } from '../services/api/data-resources.mjs';
import { municipalityToken, municipalityHostname } from '../services/api/service-naming.mjs';
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
      const record = (
        await client.query('SELECT slug FROM platform_municipalities WHERE id=$1', [municipality])
      ).rows[0];
      const token = municipalityToken(record?.slug, municipality);
      const hostname = municipalityHostname(record?.slug, municipality);
      const existing = (
        await client.query(
          "SELECT * FROM service_routes WHERE hostname=$1 OR (municipality_id=$2 AND service='commandmaps')",
          [hostname, municipality],
        )
      ).rows;
      if (
        existing.some(
          (existing) =>
            existing.hostname !== hostname ||
            existing.municipality_token !== token ||
            existing.binding_id !== binding ||
            existing.job_id !== job.id ||
            existing.municipality_id !== municipality ||
            existing.service !== 'commandmaps' ||
            existing.target !== 'civicmaps-f06-development',
        )
      )
        throw new Error('Route ownership conflict');
      await client.query(
        `INSERT INTO service_routes(id,hostname,service,municipality_id,binding_id,job_id,target,municipality_token)
    VALUES($1,$2,'commandmaps',$3,$4,$5,'civicmaps-f06-development',$6) ON CONFLICT(hostname) DO NOTHING`,
        [randomUUID(), hostname, municipality, binding, job.id, token],
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
