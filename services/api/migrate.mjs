import { readFile } from 'node:fs/promises';
import { pool, transaction } from './database.mjs';
const ownershipManifest = JSON.parse(
  await readFile(
    new URL('../../data/fixtures/council-principal-ownership.json', import.meta.url),
    'utf8',
  ),
);
function unique(items, key) {
  return new Set(items.map((item) => item[key])).size === items.length;
}
async function stagePrincipalOwnership(client) {
  if (
    !unique(ownershipManifest.municipalities, 'id') ||
    !unique(ownershipManifest.municipalities, 'slug') ||
    !unique(ownershipManifest.owners, 'userId')
  )
    throw new Error('Invalid principal ownership fixture manifest');
  for (const municipality of ownershipManifest.municipalities) {
    await client.query(
      `INSERT INTO platform_municipalities(id,name,slug,status,packs)
      VALUES($1,$2,$3,'Active','["local-laws","parking-services"]') ON CONFLICT(id) DO NOTHING`,
      [municipality.id, municipality.name, municipality.slug],
    );
    const row = await client.query(
      'SELECT id FROM platform_municipalities WHERE id=$1 AND slug=$2',
      [municipality.id, municipality.slug],
    );
    if (!row.rowCount)
      throw new Error('Principal ownership municipality conflicts with existing authority data');
  }
  for (const owner of ownershipManifest.owners) {
    const exists = await client.query('SELECT 1 FROM users WHERE id=$1', [owner.userId]);
    if (!exists.rowCount) continue; // Fresh install applies this mapping after fixture users are seeded.
    await client.query(
      `INSERT INTO council_principal_owners(user_id,municipality_id) VALUES($1,$2)
      ON CONFLICT(user_id) DO NOTHING`,
      [owner.userId, owner.municipalityId],
    );
    const current = await client.query(
      'SELECT municipality_id FROM council_principal_owners WHERE user_id=$1',
      [owner.userId],
    );
    if (current.rows[0]?.municipality_id !== owner.municipalityId)
      throw new Error(`Conflicting explicit owner for synthetic principal ${owner.userId}`);
  }
  // D02 activation is itself the authoritative user-to-council relationship.
  await client.query(`INSERT INTO council_principal_owners(user_id,municipality_id)
    SELECT user_id,municipality_id FROM platform_first_admins WHERE user_id IS NOT NULL
    ON CONFLICT(user_id) DO NOTHING`);
  const unmapped =
    await client.query(`SELECT u.id FROM users u LEFT JOIN council_principal_owners o ON o.user_id=u.id
    WHERE o.user_id IS NULL LIMIT 1`);
  if (unmapped.rowCount)
    throw new Error(`Unclassified principal ownership: ${unmapped.rows[0].id}`);
  const d02Conflict = await client.query(`SELECT 1 FROM platform_first_admins a
    JOIN council_principal_owners o ON o.user_id=a.user_id
    LEFT JOIN operating_context_bindings b ON b.id=a.binding_id
    WHERE a.user_id IS NOT NULL AND (a.municipality_id<>o.municipality_id OR
      (a.activation_state='Activated' AND (a.binding_id IS NULL OR b.municipality_id<>a.municipality_id))) LIMIT 1`);
  if (d02Conflict.rowCount)
    throw new Error('D02 principal owner conflicts with designated municipality');

  // Only this reviewed synthetic pair is retired; all other active mismatches abort.
  const knownMismatch =
    await client.query(`UPDATE operating_context_grants SET revoked_at=clock_timestamp()
    WHERE user_id='00000000-0000-4000-8000-000000000006'
      AND binding_id='10000000-0000-4000-8000-000000000003' AND revoked_at IS NULL`);
  const mismatch = await client.query(`SELECT g.user_id FROM operating_context_grants g
    JOIN operating_context_bindings b ON b.id=g.binding_id JOIN council_principal_owners o ON o.user_id=g.user_id
    WHERE g.revoked_at IS NULL AND b.municipality_id<>o.municipality_id LIMIT 1`);
  if (mismatch.rowCount)
    throw new Error(`Unclassified active cross-council grant: ${mismatch.rows[0].user_id}`);
  await client.query(`UPDATE sessions s SET municipality_id=o.municipality_id FROM council_principal_owners o
    WHERE s.user_id=o.user_id AND s.municipality_id IS NULL`);
  await client.query(`DELETE FROM sessions s USING service_routes r
    WHERE s.route_id=r.id AND s.user_id='00000000-0000-4000-8000-000000000006'
      AND r.municipality_id<>s.municipality_id`);
  const badRoute =
    await client.query(`SELECT s.user_id FROM sessions s JOIN service_routes r ON r.id=s.route_id
    WHERE r.municipality_id<>s.municipality_id LIMIT 1`);
  if (badRoute.rowCount)
    throw new Error(`Legacy session route conflicts with owner: ${badRoute.rows[0].user_id}`);
  return knownMismatch.rowCount;
}
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
      '006-provisioning-jobs',
      '007-data-resources',
      '008-service-routing',
      '009-authentication-locks',
      '010-route-municipality-tokens',
      '011-routing-retries',
      '012-first-admin-activation',
      '013-pack-entitlements',
      '014-council-principal-ownership',
      '015-enforce-principal-ownership',
    ]) {
      const existing = await client.query('SELECT id FROM civicmaps_migrations WHERE id = $1', [
        id,
      ]);
      if (!existing.rowCount) {
        await client.query(
          await readFile(new URL(`./migrations/${id}.sql`, import.meta.url), 'utf8'),
        );
        if (id === '014-council-principal-ownership') await stagePrincipalOwnership(client);
        await client.query('INSERT INTO civicmaps_migrations(id) VALUES ($1)', [id]);
      }
    }
  });
  console.log('Foundation migrations applied or already present');
} finally {
  await pool.end();
}
