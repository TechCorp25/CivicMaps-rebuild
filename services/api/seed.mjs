import { readFile } from 'node:fs/promises';
import { pool, transaction } from './database.mjs';
import { hashPassword } from './passwords.mjs';
const fixtures = JSON.parse(
  await readFile(new URL('../../data/fixtures/development-users.json', import.meta.url), 'utf8'),
);
const password = process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!';
try {
  await transaction(async (client) => {
    for (const user of fixtures) {
      await client.query(
        `INSERT INTO users(id,email,name,password_hash,role,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO NOTHING`,
        [
          user.id,
          user.email,
          user.name,
          hashPassword(password),
          user.role,
          `tenant-${user.scope}`,
          `jurisdiction-${user.scope}`,
          `plane-${user.scope}`,
          `organisation-${user.scope}`,
          'parking',
          'day-team',
        ],
      );
    }
  });
  console.log('Five synthetic users seeded; existing passwords and records preserved');
} finally {
  await pool.end();
}
