import express from 'express';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { pool, transaction } from './database.mjs';
import { hashPassword, verifyPassword } from './passwords.mjs';

export const domainPacks = [
  'Local Laws',
  'Parks & Gardens',
  'Animal Management',
  'Cleaning',
  'Waste',
  'Safe City',
  'Licensing / Permits',
  'Asset Inspections',
];
const digest = (value) => createHash('sha256').update(value).digest('hex');
const dummyHash = hashPassword(randomBytes(32).toString('hex'));
const slugPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const reservedSlugs = new Set(['platform', 'admin', 'api', 'www', 'localhost', 'auth']);
const cookieName = 'civicmaps_platform_session';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cookie = (req) =>
  (req.headers.cookie ?? '')
    .split(';')
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1) ?? '';
function requireValue(value, status, message) {
  if (!value) throw Object.assign(new Error(message), { status });
}
function input(req, keys) {
  requireValue(
    req.body && typeof req.body === 'object' && !Array.isArray(req.body),
    400,
    'A JSON object is required',
  );
  requireValue(
    Object.keys(req.body).every((key) => keys.includes(key)),
    400,
    'Unexpected request field',
  );
  return req.body;
}
const validText = (value, max) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const validSlug = (value) =>
  typeof value === 'string' &&
  value.length <= 63 &&
  slugPattern.test(value) &&
  !reservedSlugs.has(value);
const validPacks = (value) =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((pack) => domainPacks.includes(pack)) &&
  new Set(value).size === value.length;
async function authorised(req, mutate, work) {
  return transaction(async (client) => {
    const result = await client.query(
      `SELECT o.id,o.name,o.email,s.csrf_token FROM platform_sessions s
      JOIN platform_operators o ON o.id=s.operator_id WHERE s.token_hash=$1 AND s.expires_at>now() AND o.active FOR SHARE OF o,s`,
      [digest(cookie(req))],
    );
    requireValue(result.rowCount === 1, 401, 'Sign in as a platform operator to continue');
    const actor = result.rows[0];
    if (mutate)
      requireValue(
        req.headers['x-csrf-token'] === actor.csrf_token,
        403,
        'Session verification failed',
      );
    await client.query('SET LOCAL ROLE civicmaps_platform_app');
    return work(client, actor);
  });
}
async function mutation(req, work) {
  const key = req.headers['idempotency-key'];
  requireValue(
    typeof key === 'string' && /^[A-Za-z0-9_-]{8,128}$/.test(key),
    400,
    'A valid Idempotency-Key is required',
  );
  const fingerprint = digest(JSON.stringify([req.method, req.originalUrl, req.body]));
  return authorised(req, true, async (client, actor) => {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      `platform:${actor.id}:${key}`,
    ]);
    const prior = await client.query(
      'SELECT fingerprint,response FROM platform_receipts WHERE operator_id=$1 AND key=$2',
      [actor.id, key],
    );
    if (prior.rowCount) {
      requireValue(
        prior.rows[0].fingerprint === fingerprint,
        409,
        'Retry key already used for a different action',
      );
      // Provisioning passwords are intentionally not stored in receipts or replayed.
      return { ...prior.rows[0].response, replayed: true };
    }
    const response = await work(client, actor);
    const { temporaryPassword: _secret, ...receipt } = response;
    await client.query(
      'INSERT INTO platform_receipts(operator_id,key,fingerprint,response) VALUES ($1,$2,$3,$4)',
      [actor.id, key, fingerprint, receipt],
    );
    return response;
  });
}
const municipalityQuery = `SELECT m.*, a.first_name,a.last_name,a.email AS admin_email,a.activation_state,
  COALESCE(t.health,'Not yet live') AS health,t.officers_online,t.officers_today,t.code21_7d,t.signal,t.degraded_since,t.observed_at,t.source
  FROM platform_municipalities m LEFT JOIN platform_first_admins a ON a.municipality_id=m.id
  LEFT JOIN platform_metrics t ON t.municipality_id=m.id`;
async function council(client, id, lock = false) {
  requireValue(uuidPattern.test(id), 404, 'Municipality not found');
  const result = await client.query(
    `${municipalityQuery} WHERE m.id=$1${lock ? ' FOR UPDATE OF m' : ''}`,
    [id],
  );
  requireValue(result.rowCount === 1, 404, 'Municipality not found');
  return result.rows[0];
}
async function audit(client, actor, id, action, details) {
  await client.query(
    'INSERT INTO platform_audit(operator_id,municipality_id,action,details) VALUES ($1,$2,$3,$4)',
    [actor.id, id, action, details],
  );
}

export function platformRouter() {
  const router = express.Router();
  const attempts = new Map();
  router.post('/auth/login', async (req, res) => {
    const data = input(req, ['email', 'password']);
    requireValue(
      validText(data.email, 200) && validText(data.password, 256),
      400,
      'Email and password are required',
    );
    const now = Date.now();
    for (const [key, value] of attempts) if (now - value.start >= 60_000) attempts.delete(key);
    const bucket = attempts.get(req.ip) ?? { start: now, count: 0 };
    attempts.set(req.ip, bucket);
    bucket.count += 1;
    requireValue(bucket.count <= 20, 429, 'Too many sign-in attempts. Try again in a minute.');
    const result = await pool.query('SELECT * FROM platform_operators WHERE email=$1 AND active', [
      data.email.trim().toLowerCase(),
    ]);
    const valid = verifyPassword(data.password, result.rows[0]?.password_hash ?? dummyHash);
    requireValue(
      result.rowCount === 1 && valid,
      401,
      'Platform operator email or password is incorrect',
    );
    const sessionToken = randomBytes(32).toString('hex');
    const csrfToken = randomBytes(32).toString('hex');
    await transaction(async (client) => {
      await client.query('DELETE FROM platform_sessions WHERE token_hash=$1 OR expires_at<=now()', [
        digest(cookie(req)),
      ]);
      await client.query(
        "INSERT INTO platform_sessions(token_hash,operator_id,csrf_token,expires_at) VALUES ($1,$2,$3,now()+interval '8 hours')",
        [digest(sessionToken), result.rows[0].id, csrfToken],
      );
    });
    res.cookie(cookieName, sessionToken, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/api/platform',
      maxAge: 8 * 60 * 60 * 1000,
    });
    const { id, name, email } = result.rows[0];
    res.json({ actor: { id, name, email }, csrfToken });
  });
  router.get('/auth/session', async (req, res) =>
    res.json(
      await authorised(req, false, async (_client, actor) => ({
        actor: { id: actor.id, name: actor.name, email: actor.email },
        csrfToken: actor.csrf_token,
      })),
    ),
  );
  router.post('/auth/logout', async (req, res) => {
    await transaction(async (client) => {
      const result = await client.query(
        'SELECT csrf_token FROM platform_sessions WHERE token_hash=$1 AND expires_at>now() FOR UPDATE',
        [digest(cookie(req))],
      );
      requireValue(result.rowCount === 1, 401, 'Sign in to continue');
      requireValue(
        req.headers['x-csrf-token'] === result.rows[0].csrf_token,
        403,
        'Session verification failed',
      );
      await client.query('DELETE FROM platform_sessions WHERE token_hash=$1', [
        digest(cookie(req)),
      ]);
    });
    res.clearCookie(cookieName, { path: '/api/platform', httpOnly: true, sameSite: 'strict' });
    res.json({ signedOut: true });
  });
  router.get('/municipalities', async (req, res) =>
    res.json(
      await authorised(req, false, async (client) => ({
        municipalities: (await client.query(`${municipalityQuery} ORDER BY m.name`)).rows,
        domainPacks,
        mode: 'local-synthetic',
      })),
    ),
  );
  router.get('/slug-availability', async (req, res) =>
    res.json(
      await authorised(req, false, async (client) => {
        const slug = req.query.slug;
        requireValue(
          validSlug(slug),
          400,
          'Use a lowercase slug with letters, numbers and single hyphens. Reserved platform names cannot be used.',
        );
        return {
          slug,
          available:
            (await client.query('SELECT id FROM platform_municipalities WHERE slug=$1', [slug]))
              .rowCount === 0,
        };
      }),
    ),
  );
  router.get('/municipalities/:id', async (req, res) =>
    res.json(
      await authorised(req, false, async (client) => {
        const municipality = await council(client, req.params.id);
        const workloads = (
          await client.query(
            'SELECT pack,open_count FROM platform_pack_workload WHERE municipality_id=$1',
            [municipality.id],
          )
        ).rows;
        const events = (
          await client.query(
            'SELECT id,action,details,created_at FROM platform_audit WHERE municipality_id=$1 ORDER BY id DESC LIMIT 50',
            [municipality.id],
          )
        ).rows;
        return { municipality, workloads, events };
      }),
    ),
  );
  router.post('/municipalities', async (req, res) => {
    const data = input(req, ['name', 'slug', 'packs', 'firstName', 'lastName', 'email']);
    requireValue(
      validText(data.name, 160) && validSlug(data.slug),
      400,
      'A council name and valid subdomain slug are required',
    );
    requireValue(validPacks(data.packs), 400, 'Select at least one valid domain pack');
    requireValue(
      validText(data.firstName, 80) &&
        validText(data.lastName, 80) &&
        validText(data.email, 200) &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email),
      400,
      'First admin name and a valid email are required',
    );
    try {
      const result = await mutation(req, async (client, actor) => {
        const id = randomUUID();
        const password = `${randomBytes(18).toString('base64url')}!Aa9`;
        const result = await client.query(
          "INSERT INTO platform_municipalities(id,name,slug,status,packs) VALUES ($1,$2,$3,'Provisioning',$4) RETURNING *",
          [id, data.name.trim(), data.slug, JSON.stringify(data.packs)],
        );
        await client.query(
          'INSERT INTO platform_first_admins(municipality_id,first_name,last_name,email,password_hash) VALUES ($1,$2,$3,$4,$5)',
          [
            id,
            data.firstName.trim(),
            data.lastName.trim(),
            data.email.trim().toLowerCase(),
            hashPassword(password),
          ],
        );
        await audit(client, actor, id, 'onboarding_registered', {
          slug: data.slug,
          packs: data.packs,
          infrastructure: 'pending',
        });
        return {
          municipality: result.rows[0],
          temporaryPassword: password,
          infrastructure: 'pending',
        };
      });
      res.status(201).json(result);
    } catch (error) {
      if (error.code === '23505')
        throw Object.assign(new Error('Subdomain slug or first admin email is already in use'), {
          status: 409,
        });
      throw error;
    }
  });
  router.post('/municipalities/:id/packs', async (req, res) => {
    const data = input(req, ['pack', 'enabled', 'version', 'confirmed']);
    requireValue(
      domainPacks.includes(data.pack) &&
        typeof data.enabled === 'boolean' &&
        Number.isInteger(data.version) &&
        data.version > 0 &&
        (data.confirmed === undefined || typeof data.confirmed === 'boolean'),
      400,
      'A valid pack, enabled state and version are required',
    );
    res.json(
      await mutation(req, async (client, actor) => {
        const municipality = await council(client, req.params.id, true);
        requireValue(
          municipality.version === data.version,
          409,
          'Municipality changed. Refresh before trying again.',
        );
        const enabled = municipality.packs.includes(data.pack);
        requireValue(enabled !== data.enabled, 409, 'Domain pack already has the requested state');
        requireValue(
          data.enabled || data.confirmed === true,
          409,
          'Confirm pack removal. Existing records will be retained.',
        );
        const packs = data.enabled
          ? [...municipality.packs, data.pack]
          : municipality.packs.filter((pack) => pack !== data.pack);
        const updated = await client.query(
          'UPDATE platform_municipalities SET packs=$2,version=version+1 WHERE id=$1 RETURNING *',
          [municipality.id, JSON.stringify(packs)],
        );
        const workload = await client.query(
          'SELECT open_count FROM platform_pack_workload WHERE municipality_id=$1 AND pack=$2',
          [municipality.id, data.pack],
        );
        await audit(
          client,
          actor,
          municipality.id,
          data.enabled ? 'pack_enabled' : 'pack_disabled',
          {
            pack: data.pack,
            openCount: workload.rows[0]?.open_count ?? null,
            recordsRetained: true,
          },
        );
        return { municipality: updated.rows[0] };
      }),
    );
  });
  return router;
}
