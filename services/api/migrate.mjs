import { readFile } from 'node:fs/promises';
import { pool, transaction } from './database.mjs';
try {
  await transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('civicmaps-migrations'))");
    await client.query(
      'CREATE TABLE IF NOT EXISTS civicmaps_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
    );
    for (const id of [
      '001-foundation',
      '002-auth-scope',
      '003-platform',
      '004-operating-context',
      '005-context-rls',
    ]) {
      const existing = await client.query('SELECT id FROM civicmaps_migrations WHERE id = $1', [
        id,
      ]);
      if (!existing.rowCount) {
        await client.query(
          await readFile(new URL(`./migrations/${id}.sql`, import.meta.url), 'utf8'),
        );
        await client.query('INSERT INTO civicmaps_migrations(id) VALUES ($1)', [id]);
      }
    }
  });
  console.log('Foundation migrations applied or already present');
} finally {
  await pool.end();
}
