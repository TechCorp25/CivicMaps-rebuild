import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { pool, transaction } from './database.mjs';
import { hashPassword } from './passwords.mjs';
const fixtures = JSON.parse(
  await readFile(
    new URL('../../data/fixtures/platform-municipalities.json', import.meta.url),
    'utf8',
  ),
);
const password = process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!';
try {
  await transaction(async (client) => {
    await client.query(
      `INSERT INTO platform_operators(id,email,name,password_hash) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING`,
      [randomUUID(), 'operator@platform.example', 'S. Ibrahim', hashPassword(password)],
    );
    for (const fixture of fixtures) {
      const result = await client.query(
        `INSERT INTO platform_municipalities(id,name,slug,status,packs,created_at)
        VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING RETURNING id`,
        [
          randomUUID(),
          fixture.name,
          fixture.slug,
          fixture.status,
          JSON.stringify(fixture.packs),
          fixture.added,
        ],
      );
      if (!result.rowCount) continue;
      const id = result.rows[0].id;
      await client.query(
        'INSERT INTO platform_first_admins(municipality_id,first_name,last_name,email,password_hash) VALUES ($1,$2,$3,$4,$5)',
        [id, fixture.firstName, fixture.lastName, fixture.email, hashPassword(password)],
      );
      await client.query(
        `INSERT INTO platform_metrics(municipality_id,officers_online,officers_today,code21_7d,health,signal,degraded_since)
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          id,
          fixture.online,
          fixture.today,
          fixture.volume,
          fixture.health,
          fixture.signal ?? null,
          fixture.health === 'Degraded' ? '2026-08-09T04:20:00Z' : null,
        ],
      );
      await client.query(
        'INSERT INTO platform_pack_workload(municipality_id,pack,open_count) VALUES ($1,$2,$3)',
        [id, 'Parks & Gardens', fixture.workload],
      );
    }
  });
  console.log(
    'Synthetic platform operator, municipalities and metric snapshots seeded; existing configuration preserved',
  );
} finally {
  await pool.end();
}
