import { randomUUID } from 'node:crypto';
// Synthetic control metadata only; these resources never connect to AWS.
export async function routingFixture(pool) {
  for (let n = 1; n <= 2; n++) {
    const municipality = `20000000-0000-4000-8000-00000000000${n}`;
    const binding = `10000000-0000-4000-8000-00000000000${n}`;
    const job = `f0500000-0000-4000-8000-00000000000${n}`;
    const token = n === 1 ? 'alpha' : 'beta';
    await pool.query(
      `INSERT INTO provisioning_jobs(id,municipality_id,operator_id,adapter,profile,state) SELECT $1,$2,id,'aws-postgres-s3','aws-sydney-development','succeeded' FROM platform_operators LIMIT 1`,
      [job, municipality],
    );
    await pool.query(
      `INSERT INTO municipality_resources(job_id,municipality_id,profile,database_name,runtime_name,secret_ref,storage_prefix,schema_version) VALUES ($1,$2,'aws-sydney-development',$3,$4,$5,$6,2)`,
      [
        job,
        municipality,
        `civicmaps_${job.replaceAll('-', '')}`,
        `runtime_${job.replaceAll('-', '')}`,
        `civicmaps/f05/${job}`,
        `municipalities/${municipality}/${job}/`,
      ],
    );
    await pool.query('INSERT INTO municipality_resource_contexts VALUES ($1,$2)', [job, binding]);
    await pool.query(
      `INSERT INTO service_routes(id,hostname,service,municipality_id,binding_id,job_id,target,state,checked_at,municipality_token) VALUES ($1,$2,'commandmaps',$3,$4,$5,'test-only','ready',now(),$6)`,
      [
        randomUUID(),
        `${token}-commandmaps.dev.civicmaps.com.au`,
        municipality,
        binding,
        job,
        token,
      ],
    );
  }
  await pool.query(
    "INSERT INTO service_routes(id,hostname,service,target,state,checked_at) VALUES ($1,'platform.dev.civicmaps.com.au','platform','test-only','ready',now())",
    [randomUUID()],
  );
}
