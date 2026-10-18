import { readFile } from 'node:fs/promises';
import { pool, transaction } from './database.mjs';
import { hashPassword } from './passwords.mjs';
const fixtures = JSON.parse(
  await readFile(new URL('../../data/fixtures/development-users.json', import.meta.url), 'utf8'),
);
const contexts = JSON.parse(
  await readFile(new URL('../../data/fixtures/operating-contexts.json', import.meta.url), 'utf8'),
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
    for (const context of contexts) {
      await client.query(
        `INSERT INTO platform_municipalities(id,name,slug,status,packs)
        VALUES ($1,$2,$3,'Active','["local-laws","parking-services"]') ON CONFLICT (id) DO NOTHING`,
        [context.municipalityId, context.name, context.slug],
      );
      await client.query(
        `INSERT INTO operating_context_bindings(id,association_id,version,municipality_id,
        tenant_id,organisation_id,jurisdiction_id,data_plane_id,branch_id,effective_from)
        VALUES ($1,$1,1,$2,$3,$4,$5,$6,'parking','2026-01-01T00:00:00Z') ON CONFLICT (id) DO NOTHING`,
        [
          context.id,
          context.municipalityId,
          `tenant-${context.scope}`,
          context.organisationId ?? `organisation-${context.scope}`,
          context.jurisdictionId ?? `jurisdiction-${context.scope}`,
          `plane-${context.scope}`,
        ],
      );
      // Grant only explicitly known fixtures whose stored home scope still matches.
      // Re-seeding never resurrects revoked grants or maps unknown historical users.
      for (const user of fixtures.filter(
        (user) => user.scope === context.scope || context.userIds?.includes(user.id),
      )) {
        await client.query(
          `INSERT INTO operating_context_grants(user_id,binding_id,effective_from)
          SELECT id,$2,'2026-01-01T00:00:00Z' FROM users WHERE id=$1 AND tenant_id=$3
          AND organisation_id=$4 AND jurisdiction_id=$5 AND data_plane_id=$6 AND branch_id='parking'
          ON CONFLICT (user_id,binding_id) DO NOTHING`,
          [
            user.id,
            context.id,
            `tenant-${user.scope}`,
            `organisation-${user.scope}`,
            `jurisdiction-${user.scope}`,
            `plane-${user.scope}`,
          ],
        );
      }
    }
  });
  console.log(
    `${fixtures.length} synthetic users seeded; existing passwords and records preserved`,
  );
} finally {
  await pool.end();
}
