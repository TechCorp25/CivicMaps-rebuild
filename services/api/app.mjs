import express from 'express';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { pool, transaction } from './database.mjs';
import { verifyPassword, hashPassword } from './passwords.mjs';
import { transition, statusLabels } from '../../domains/service-requests-dispatch/lifecycle.mjs';
import { resolveContext, permittedContexts } from './operating-context.mjs';
import { platformRouter } from './platform.mjs';

const digest = (value) => createHash('sha256').update(value).digest('hex');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dummyPassword = hashPassword(randomBytes(32).toString('hex'));
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
function requireValue(condition, status, message) {
  if (!condition) throw new HttpError(status, message);
}
function body(req, keys) {
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
function text(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
function token(req) {
  return (
    (req.headers.cookie ?? '')
      .split(';')
      .map((value) => value.trim())
      .find((value) => value.startsWith('civicmaps_session='))
      ?.slice('civicmaps_session='.length) ?? ''
  );
}
function actorView(user) {
  const {
    id,
    email,
    name,
    role,
    tenant_id,
    jurisdiction_id,
    data_plane_id,
    organisation_id,
    branch_id,
    team_id,
  } = user;
  return {
    id,
    email,
    name,
    role,
    tenant_id,
    jurisdiction_id,
    data_plane_id,
    organisation_id,
    branch_id,
    team_id,
    context_id: user.context_id,
    context_version: user.context_version,
    municipality_id: user.municipality_id,
  };
}
async function authenticated(client, req) {
  const auth = await client.query(
    `SELECT u.*, s.csrf_token FROM sessions s JOIN users u ON u.id=s.user_id
      WHERE s.token_hash=$1 AND s.expires_at>now() AND u.active FOR SHARE OF u,s`,
    [digest(token(req))],
  );
  requireValue(auth.rowCount === 1, 401, 'Sign in to continue');
  return auth.rows[0];
}
async function scoped(req, mutate, work) {
  return transaction(async (client) => {
    const user = await authenticated(client, req);
    const actor = await resolveContext(client, user, req.headers['x-civicmaps-context']);
    if (mutate)
      requireValue(
        req.headers['x-csrf-token'] === actor.csrf_token,
        403,
        'Session verification failed',
      );
    // Transaction-local roles cannot leak to the next pooled request.
    await client.query('SET LOCAL ROLE civicmaps_local_app');
    for (const [name, value] of Object.entries({
      tenant: actor.tenant_id,
      jurisdiction: actor.jurisdiction_id,
      plane: actor.data_plane_id,
      organisation: actor.organisation_id,
      branch: actor.branch_id,
      actor: actor.id,
      context: actor.context_id,
    })) {
      await client.query('SELECT set_config($1,$2,true)', [`civicmaps.${name}`, value]);
    }
    return work(client, actor);
  });
}
async function audit(client, actor, request, action, details) {
  await client.query(
    `INSERT INTO audit_events(request_id,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,actor_id,action,details)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      request.id,
      actor.tenant_id,
      actor.jurisdiction_id,
      actor.data_plane_id,
      actor.organisation_id,
      actor.branch_id,
      actor.id,
      action,
      details,
    ],
  );
}
async function mutation(req, work) {
  const key = req.headers['idempotency-key'];
  requireValue(
    typeof key === 'string' && /^[A-Za-z0-9_-]{8,128}$/.test(key),
    400,
    'A valid Idempotency-Key is required',
  );
  const fingerprint = digest(JSON.stringify([req.method, req.path, req.body]));
  return scoped(req, true, async (client, actor) => {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      `${actor.id}:${actor.context_association_id}:${key}`,
    ]);
    const legacy = await client.query(
      'SELECT 1 FROM legacy_mutation_keys WHERE actor_id=$1 AND key=$2',
      [actor.id, key],
    );
    requireValue(
      legacy.rowCount === 0,
      409,
      'Legacy retry key has no operating context; refresh the record before using a new key',
    );
    const prior = await client.query(
      'SELECT * FROM mutation_receipts WHERE actor_id=$1 AND binding_id=$2 AND key=$3',
      [actor.id, actor.context_id, key],
    );
    if (prior.rowCount) {
      requireValue(
        prior.rows[0].fingerprint === fingerprint,
        409,
        'Retry key already used for a different action',
      );
      return prior.rows[0].response;
    }
    const response = await work(client, actor);
    try {
      await client.query(
        'INSERT INTO mutation_receipts(actor_id,association_id,binding_id,key,fingerprint,response) VALUES ($1,$2,$3,$4,$5,$6)',
        [actor.id, actor.context_association_id, actor.context_id, key, fingerprint, response],
      );
    } catch (error) {
      // The previous version's receipt is deliberately hidden by RLS. This collision
      // rolls back the attempted write rather than exposing or repeating it.
      if (error.code === '23505' && error.constraint === 'receipt_association_key') {
        throw new HttpError(
          409,
          'Retry key belongs to another binding version; refresh before using a new key',
        );
      }
      throw error;
    }
    return response;
  });
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(req.method) && req.headers.origin) {
      const origins = (
        process.env.CIVICMAPS_ORIGINS ??
        'http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:5174,http://localhost:5174'
      ).split(',');
      if (!origins.includes(req.headers.origin))
        return res.status(403).json({ error: 'Request origin is not permitted' });
    }
    next();
  });
  app.get('/api/health', async (_req, res) => {
    await pool.query('SELECT 1');
    res.json({ status: 'ready', mode: 'local-synthetic' });
  });
  const attempts = new Map();
  app.post('/api/auth/login', async (req, res) => {
    const input = body(req, ['email', 'password']);
    requireValue(
      text(input.email, 200) && text(input.password, 256),
      400,
      'Email and password are required',
    );
    const now = Date.now();
    for (const [key, attempt] of attempts) if (now - attempt.start >= 60_000) attempts.delete(key);
    const bucket = attempts.get(req.ip) ?? { start: now, count: 0 };
    bucket.count += 1;
    attempts.set(req.ip, bucket);
    requireValue(bucket.count <= 20, 429, 'Too many sign-in attempts. Try again in a minute.');
    const result = await pool.query('SELECT * FROM users WHERE email=$1 AND active', [
      input.email.toLowerCase().trim(),
    ]);
    const valid = verifyPassword(input.password, result.rows[0]?.password_hash ?? dummyPassword);
    requireValue(result.rowCount === 1 && valid, 401, 'Email or password is incorrect');
    const sessionToken = randomBytes(32).toString('hex');
    const csrfToken = randomBytes(32).toString('hex');
    await transaction(async (client) => {
      await client.query('DELETE FROM sessions WHERE token_hash=$1 OR expires_at<=now()', [
        digest(token(req)),
      ]);
      await client.query(
        "INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at) VALUES ($1,$2,$3,now()+interval '8 hours')",
        [digest(sessionToken), result.rows[0].id, csrfToken],
      );
    });
    res.cookie('civicmaps_session', sessionToken, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/api',
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.json({ actor: actorView(result.rows[0]), csrfToken });
  });
  app.get('/api/auth/contexts', async (req, res) => {
    res.json(
      await transaction(async (client) => {
        const user = await authenticated(client, req);
        return (await permittedContexts(client, user)).map((b) => ({
          id: b.id,
          version: b.version,
          municipality_id: b.municipality_id,
          tenant_id: b.tenant_id,
          organisation_id: b.organisation_id,
          jurisdiction_id: b.jurisdiction_id,
          data_plane_id: b.data_plane_id,
          branch_id: b.branch_id,
        }));
      }),
    );
  });
  app.get('/api/auth/session', async (req, res) => {
    res.json(
      await scoped(req, false, async (_client, actor) => ({
        actor: actorView(actor),
        csrfToken: actor.csrf_token,
      })),
    );
  });
  app.post('/api/auth/logout', async (req, res) => {
    // Locking the session row serialises logout against outstanding authorised writes.
    await transaction(async (client) => {
      const result = await client.query(
        'SELECT csrf_token FROM sessions WHERE token_hash=$1 AND expires_at>now() FOR UPDATE',
        [digest(token(req))],
      );
      requireValue(result.rowCount === 1, 401, 'Sign in to continue');
      requireValue(
        req.headers['x-csrf-token'] === result.rows[0].csrf_token,
        403,
        'Session verification failed',
      );
      await client.query('DELETE FROM sessions WHERE token_hash=$1', [digest(token(req))]);
    });
    res
      .clearCookie('civicmaps_session', { path: '/api', httpOnly: true, sameSite: 'strict' })
      .json({ ok: true });
  });
  app.get('/api/officers', async (req, res) => {
    res.json(
      await scoped(req, false, async (client) => {
        const result = await client.query(
          `SELECT id,name,team_id FROM users WHERE active AND role='OFFICER' ORDER BY name`,
        );
        return result.rows;
      }),
    );
  });
  app.get('/api/requests', async (req, res) => {
    res.json(
      await scoped(req, false, async (client, actor) => {
        const result = await client.query(
          `SELECT * FROM service_requests WHERE ($1::text<>'OFFICER' OR assigned_officer_id=$2) ORDER BY number DESC LIMIT 100`,
          [actor.role, actor.id],
        );
        return { requests: result.rows, statusLabels };
      }),
    );
  });
  app.post('/api/requests', async (req, res) => {
    const input = body(req, ['address', 'latitude', 'longitude', 'notes']);
    requireValue(
      text(input.address, 250) && typeof input.notes === 'string' && input.notes.length <= 2000,
      400,
      'Address and notes are invalid',
    );
    requireValue(
      Number.isFinite(input.latitude) &&
        Math.abs(input.latitude) <= 90 &&
        Number.isFinite(input.longitude) &&
        Math.abs(input.longitude) <= 180,
      400,
      'Valid coordinates are required',
    );
    res.status(201).json(
      await mutation(req, async (client, actor) => {
        requireValue(actor.role === 'DISPATCHER', 403, 'Dispatch access is required');
        const result = await client.query(
          `INSERT INTO service_requests(id,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,address,latitude,longitude,notes,status,capture_binding_id,capture_binding_version)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'RECEIVED',$11,$12) RETURNING *`,
          [
            randomUUID(),
            actor.tenant_id,
            actor.jurisdiction_id,
            actor.data_plane_id,
            actor.organisation_id,
            actor.branch_id,
            input.address.trim(),
            input.latitude,
            input.longitude,
            input.notes,
            actor.context_id,
            actor.context_version,
          ],
        );
        await audit(client, actor, result.rows[0], 'created', { status: 'RECEIVED' });
        return result.rows[0];
      }),
    );
  });
  app.get('/api/requests/:id/audit', async (req, res) => {
    requireValue(uuid.test(req.params.id), 400, 'Invalid request identifier');
    res.json(
      await scoped(req, false, async (client, actor) => {
        const request = await client.query('SELECT * FROM service_requests WHERE id=$1', [
          req.params.id,
        ]);
        requireValue(
          request.rowCount === 1 &&
            (actor.role !== 'OFFICER' || request.rows[0].assigned_officer_id === actor.id),
          404,
          'Request not found',
        );
        return (
          await client.query(
            'SELECT id,actor_id,action,details,created_at FROM audit_events WHERE request_id=$1 ORDER BY id',
            [req.params.id],
          )
        ).rows;
      }),
    );
  });
  app.post('/api/requests/:id/actions', async (req, res) => {
    requireValue(uuid.test(req.params.id), 400, 'Invalid request identifier');
    const input = body(req, ['action', 'version', 'officerId', 'reason']);
    requireValue(
      ['assign', 'acknowledge', 'attend', 'close'].includes(input.action) &&
        Number.isSafeInteger(input.version) &&
        input.version > 0,
      400,
      'Action and current version are required',
    );
    if (input.action === 'assign')
      requireValue(
        typeof input.officerId === 'string' && uuid.test(input.officerId),
        400,
        'Select an officer',
      );
    if (input.action === 'close')
      requireValue(text(input.reason, 1000), 400, 'A closure reason is required');
    res.json(
      await mutation(req, async (client, actor) => {
        const found = await client.query('SELECT * FROM service_requests WHERE id=$1 FOR UPDATE', [
          req.params.id,
        ]);
        requireValue(found.rowCount === 1, 404, 'Request not found');
        const request = found.rows[0];
        if (actor.role === 'OFFICER')
          requireValue(request.assigned_officer_id === actor.id, 404, 'Request not found');
        requireValue(actor.role !== 'SUPERVISOR', 403, 'This account has read-only access');
        const next = transition(actor, request, input.action);
        requireValue(next, 409, 'Action is not permitted in the current state');
        requireValue(
          request.version === input.version,
          409,
          'Request changed. Refresh before trying again.',
        );
        let officerId = request.assigned_officer_id;
        if (input.action === 'assign') {
          const officer = await client.query(
            `SELECT id FROM users WHERE id=$1 AND active AND role='OFFICER'`,
            [input.officerId],
          );
          requireValue(officer.rowCount === 1, 403, 'Officer is outside the permitted scope');
          officerId = input.officerId;
        }
        const updated = await client.query(
          'UPDATE service_requests SET status=$2,assigned_officer_id=$3,version=version+1,updated_at=now() WHERE id=$1 RETURNING *',
          [request.id, next, officerId],
        );
        await audit(client, actor, request, input.action, {
          from: request.status,
          to: next,
          reason: input.reason ?? null,
          officerId,
        });
        return updated.rows[0];
      }),
    );
  });
  app.use('/api/platform', platformRouter());
  app.use((_req, res) => res.status(404).json({ error: 'Endpoint not found' }));
  app.use((error, _req, res, _next) => {
    const status = error.status ?? (error.type === 'entity.parse.failed' ? 400 : 500);
    if (status >= 500) console.error('API operation failed:', error.message);
    res
      .status(status)
      .json({ error: status >= 500 ? 'The operation could not be completed' : error.message });
  });
  return app;
}
