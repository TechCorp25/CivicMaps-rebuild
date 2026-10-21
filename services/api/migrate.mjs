import { readFile } from 'node:fs/promises';
import { pool, transaction } from './database.mjs';

const ownershipManifest = JSON.parse(
  await readFile(
    new URL('../../data/fixtures/council-principal-ownership.json', import.meta.url),
    'utf8',
  ),
);
const developmentUsers = JSON.parse(
  await readFile(new URL('../../data/fixtures/development-users.json', import.meta.url), 'utf8'),
);
const operatingContexts = JSON.parse(
  await readFile(new URL('../../data/fixtures/operating-contexts.json', import.meta.url), 'utf8'),
);
const sharedPrincipalId = '00000000-0000-4000-8000-000000000006';
const sharedBindingId = '10000000-0000-4000-8000-000000000003';
const betaMunicipalityId = '20000000-0000-4000-8000-000000000002';
const syntheticHome = new Map(
  operatingContexts.map((context) => [context.scope, context.municipalityId]),
);
const syntheticIdentity = new Map([
  ...developmentUsers.map((user) => [
    user.id,
    {
      email: user.email,
      name: user.name,
      role: user.role,
      tenant_id: `tenant-${user.scope}`,
      jurisdiction_id: `jurisdiction-${user.scope}`,
      data_plane_id: `plane-${user.scope}`,
      organisation_id: `organisation-${user.scope}`,
      branch_id: 'parking',
      municipality_id: syntheticHome.get(user.scope),
    },
  ]),
  ...ownershipManifest.testPrincipals.map((user) => [
    user.userId,
    {
      email: user.email,
      name: user.name,
      role: user.role,
      tenant_id: `tenant-${user.scope}`,
      jurisdiction_id: `jurisdiction-${user.scope}`,
      data_plane_id: `plane-${user.scope}`,
      organisation_id: `organisation-${user.scope}`,
      branch_id: 'parking',
      municipality_id: user.municipalityId,
    },
  ]),
]);

function unique(items, key) {
  return new Set(items.map((item) => item[key])).size === items.length;
}

function verifyManifest() {
  if (
    !unique(ownershipManifest.municipalities, 'id') ||
    !unique(ownershipManifest.municipalities, 'slug') ||
    !unique(ownershipManifest.owners, 'userId') ||
    !unique(ownershipManifest.testPrincipals, 'userId') ||
    ownershipManifest.owners.some((owner) => {
      const identity = syntheticIdentity.get(owner.userId);
      return !identity || identity.municipality_id !== owner.municipalityId;
    })
  )
    throw new Error('Invalid principal ownership fixture manifest');
}

async function verifyFixtureMunicipalities(client) {
  for (const municipality of ownershipManifest.municipalities) {
    await client.query(
      `INSERT INTO platform_municipalities(id,name,slug,status,packs)
       VALUES($1,$2,$3,'Active','["local-laws","parking-services"]') ON CONFLICT(id) DO NOTHING`,
      [municipality.id, municipality.name, municipality.slug],
    );
    const row = await client.query(
      'SELECT 1 FROM platform_municipalities WHERE id=$1 AND name=$2 AND slug=$3',
      [municipality.id, municipality.name, municipality.slug],
    );
    if (!row.rowCount)
      throw new Error(
        'Principal ownership municipality conflicts with canonical synthetic fixture',
      );
  }
}

async function verifySyntheticPrincipal(client, userId) {
  const expected = syntheticIdentity.get(userId);
  const owner = ownershipManifest.owners.find((entry) => entry.userId === userId);
  if (!expected || !owner || owner.municipalityId !== expected.municipality_id)
    throw new Error(`No explicit canonical synthetic owner fixture for ${userId}`);
  const result = await client.query(
    `SELECT email,name,role,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id
     FROM users WHERE id=$1`,
    [userId],
  );
  if (
    !result.rowCount ||
    Object.entries(expected).some(
      ([key, value]) => key !== 'municipality_id' && result.rows[0][key] !== value,
    )
  )
    throw new Error(`Principal ${userId} conflicts with canonical synthetic identity fixture`);
}

async function verifySharedBetaGrant(client) {
  await verifySyntheticPrincipal(client, sharedPrincipalId);
  const beta = await client.query(
    `SELECT 1 FROM platform_municipalities WHERE id=$1 AND name='Synthetic Beta council'
     AND slug='synthetic-beta'`,
    [betaMunicipalityId],
  );
  if (!beta.rowCount) throw new Error('Shared Beta municipality conflicts with canonical fixture');
  const binding = await client.query(
    `SELECT 1 FROM operating_context_bindings WHERE id=$1 AND association_id=$1 AND version=1
     AND municipality_id=$2 AND tenant_id='tenant-shared' AND organisation_id='organisation-alpha'
     AND jurisdiction_id='jurisdiction-beta' AND data_plane_id='plane-shared' AND branch_id='parking'
     AND effective_from='2026-01-01T00:00:00Z' AND effective_to IS NULL AND revoked_at IS NULL`,
    [sharedBindingId, betaMunicipalityId],
  );
  const grant = await client.query(
    `SELECT 1 FROM operating_context_grants WHERE user_id=$1 AND binding_id=$2
     AND effective_from='2026-01-01T00:00:00Z' AND effective_to IS NULL AND revoked_at IS NULL`,
    [sharedPrincipalId, sharedBindingId],
  );
  if (!binding.rowCount || !grant.rowCount)
    throw new Error('Shared Beta grant does not match the canonical synthetic fixture');
}

async function stagePrincipalOwnership(client) {
  const users = await client.query('SELECT count(*)::int AS count FROM users');
  if (process.env.CIVICMAPS_MIGRATION_PROFILE !== 'synthetic-fixture') {
    if (users.rows[0].count !== 0)
      throw new Error(
        'Existing principals require an explicitly selected synthetic-fixture migration profile',
      );
    return 0;
  }

  verifyManifest();
  await verifyFixtureMunicipalities(client);
  for (const owner of ownershipManifest.owners) {
    const exists = await client.query('SELECT 1 FROM users WHERE id=$1', [owner.userId]);
    if (!exists.rowCount) continue; // A fresh install applies owners after fixture users are seeded.
    await verifySyntheticPrincipal(client, owner.userId);
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

  // D02's principal, designated municipality and selected binding form its explicit owner record.
  const d02Rows =
    await client.query(`SELECT a.user_id,a.municipality_id,a.binding_id,a.activation_state,
      u.role,u.active,b.municipality_id AS binding_municipality
    FROM platform_first_admins a LEFT JOIN users u ON u.id=a.user_id
    LEFT JOIN operating_context_bindings b ON b.id=a.binding_id WHERE a.user_id IS NOT NULL`);
  for (const row of d02Rows.rows) {
    if (
      row.role !== 'ADMIN' ||
      row.binding_municipality !== row.municipality_id ||
      (row.activation_state === 'Activated' && row.active !== true) ||
      (row.activation_state === 'Disabled' && row.active !== false)
    )
      throw new Error('D02 principal, binding and designated municipality are inconsistent');
    await client.query(
      `INSERT INTO council_principal_owners(user_id,municipality_id) VALUES($1,$2)
       ON CONFLICT(user_id) DO NOTHING`,
      [row.user_id, row.municipality_id],
    );
    const current = await client.query(
      'SELECT municipality_id FROM council_principal_owners WHERE user_id=$1',
      [row.user_id],
    );
    if (current.rows[0]?.municipality_id !== row.municipality_id)
      throw new Error('D02 principal owner conflicts with designated municipality');
  }

  const unmapped = await client.query(`SELECT u.id FROM users u
    LEFT JOIN council_principal_owners o ON o.user_id=u.id WHERE o.user_id IS NULL LIMIT 1`);
  if (unmapped.rowCount)
    throw new Error(`Unclassified principal ownership: ${unmapped.rows[0].id}`);

  const target = await client.query(
    'SELECT 1 FROM operating_context_grants WHERE user_id=$1 AND binding_id=$2',
    [sharedPrincipalId, sharedBindingId],
  );
  if (target.rowCount) await verifySharedBetaGrant(client);
  const retired = target.rowCount
    ? await client.query(
        `UPDATE operating_context_grants SET revoked_at=clock_timestamp()
         WHERE user_id=$1 AND binding_id=$2 AND revoked_at IS NULL`,
        [sharedPrincipalId, sharedBindingId],
      )
    : { rowCount: 0 };

  const mismatchedGrants = await client.query(`SELECT g.user_id FROM operating_context_grants g
    JOIN operating_context_bindings b ON b.id=g.binding_id
    JOIN council_principal_owners o ON o.user_id=g.user_id
    WHERE g.revoked_at IS NULL AND b.municipality_id<>o.municipality_id LIMIT 1`);
  if (mismatchedGrants.rowCount)
    throw new Error(`Unclassified active cross-council grant: ${mismatchedGrants.rows[0].user_id}`);

  const wrongSessions = await client.query(`SELECT s.token_hash,s.user_id,r.hostname,r.service,
      r.municipality_id AS route_municipality,r.binding_id,r.job_id,r.target,r.municipality_token
    FROM sessions s JOIN council_principal_owners o ON o.user_id=s.user_id
    LEFT JOIN service_routes r ON r.id=s.route_id
    WHERE (r.municipality_id IS NOT NULL AND r.municipality_id<>o.municipality_id) OR
      (s.municipality_id IS NOT NULL AND s.municipality_id<>o.municipality_id)`);
  const retireSessionTokens = [];
  for (const row of wrongSessions.rows) {
    const isCanonicalSharedBetaRoute =
      row.user_id === sharedPrincipalId &&
      row.route_municipality === betaMunicipalityId &&
      row.hostname === 'beta-commandmaps.dev.civicmaps.com.au' &&
      row.service === 'commandmaps' &&
      row.binding_id === '10000000-0000-4000-8000-000000000002' &&
      row.job_id === 'f0500000-0000-4000-8000-000000000002' &&
      row.target === 'civicmaps-f06-development' &&
      row.municipality_token === 'beta';
    if (!isCanonicalSharedBetaRoute)
      throw new Error(`Legacy session route conflicts with owner: ${row.user_id}`);
    retireSessionTokens.push(row.token_hash);
  }
  if (retireSessionTokens.length)
    await client.query('DELETE FROM sessions WHERE token_hash=ANY($1::text[])', [
      retireSessionTokens,
    ]);
  // Pre-014 allowed multiple cookie jars per user; retain the longest-lived session before enforcing one owner pair.
  await client.query(`DELETE FROM sessions legacy
    USING council_principal_owners o
    WHERE legacy.user_id=o.user_id AND legacy.municipality_id IS NULL
      AND (
        EXISTS (SELECT 1 FROM sessions assigned
          WHERE assigned.user_id=o.user_id AND assigned.municipality_id=o.municipality_id)
        OR legacy.token_hash<>(
          SELECT candidate.token_hash FROM sessions candidate
          WHERE candidate.user_id=o.user_id AND candidate.municipality_id IS NULL
          ORDER BY candidate.expires_at DESC,candidate.token_hash ASC LIMIT 1
        )
      )`);
  await client.query(`UPDATE sessions s SET municipality_id=o.municipality_id
    FROM council_principal_owners o WHERE s.user_id=o.user_id AND s.municipality_id IS NULL`);
  return retired.rowCount;
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
