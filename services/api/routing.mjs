import { runtimeConnection, configuredDataTarget, resourceNames } from './data-resources.mjs';
import { timingSafeEqual, randomUUID } from 'node:crypto';
import { permittedContexts } from './operating-context.mjs';

function requireValue(value, status, message) {
  if (!value) throw Object.assign(new Error(message), { status });
}
export function deployedRouting() {
  const mode = process.env.CIVICMAPS_ROUTING_MODE ?? 'local';
  requireValue(['local', 'ingress'].includes(mode), 503, 'Invalid routing mode');
  return mode === 'ingress';
}
export function canonicalHost(value) {
  requireValue(typeof value === 'string' && value.length <= 253, 421, 'Invalid service authority');
  // Ports, trailing dots and alternate spellings are intentionally not accepted on HTTPS ingress.
  requireValue(
    /^[a-z0-9]+(?:-[a-z0-9]+)*\.dev\.civicmaps\.com\.au$/i.test(value),
    421,
    'Invalid service authority',
  );
  return value.toLowerCase();
}
export async function routeReady(client, route) {
  if (route.service === 'platform') return true;
  const result = await client.query(
    `SELECT 1 FROM operating_context_bindings b
     JOIN municipality_resource_contexts c ON c.binding_id=b.id
     JOIN municipality_resources r ON r.job_id=c.job_id
     JOIN provisioning_jobs j ON j.id=r.job_id
     WHERE b.id=$1 AND b.municipality_id=$2 AND r.municipality_id=$2 AND r.job_id=$3
     AND j.municipality_id=$2 AND j.state='succeeded' AND r.schema_version=2 AND r.disabled_at IS NULL
     AND b.revoked_at IS NULL AND b.effective_from<=clock_timestamp()
     AND (b.effective_to IS NULL OR b.effective_to>clock_timestamp())`,
    [route.binding_id, route.municipality_id, route.job_id],
  );
  return result.rowCount === 1;
}
export async function routingMiddleware(req, res, next) {
  try {
    if (!deployedRouting()) return next();
    const { pool } = await import('./database.mjs');
    const expected = process.env.CIVICMAPS_INGRESS_TOKEN ?? '';
    const actual = req.headers['x-civicmaps-ingress'] ?? '';
    requireValue(
      expected.length >= 32 &&
        typeof actual === 'string' &&
        actual.length === expected.length &&
        timingSafeEqual(Buffer.from(expected), Buffer.from(actual)),
      421,
      'Untrusted ingress',
    );
    requireValue(
      ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress),
      421,
      'Untrusted ingress',
    );
    const counts = new Map();
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      const key = req.rawHeaders[i].toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (const key of ['host', 'x-forwarded-host', 'x-forwarded-proto', 'x-civicmaps-ingress'])
      requireValue(counts.get(key) === 1, 421, 'Ambiguous service authority');
    requireValue(
      !req.headers.forwarded && req.headers['x-forwarded-proto'] === 'https',
      421,
      'Invalid forwarded authority',
    );
    const hostname = canonicalHost(req.headers.host);
    requireValue(
      req.headers['x-forwarded-host'] === req.headers.host,
      421,
      'Invalid forwarded authority',
    );
    const route = (await pool.query('SELECT * FROM service_routes WHERE hostname=$1', [hostname]))
      .rows[0];
    requireValue(route, 421, 'Unknown service authority');
    // The probe is gated by a separate random token and returns no credentials or operational data.
    if (req.path === '/api/routing/probe') {
      const probe = req.headers['x-civicmaps-probe'];
      requireValue(
        typeof probe === 'string' &&
          probe === process.env.CIVICMAPS_PROBE_TOKEN &&
          probe.length >= 32,
        403,
        'Probe authentication required',
      );
      requireValue(
        route.state !== 'withdrawn' && (await routeReady(pool, route)),
        503,
        'Service resources unavailable',
      );
      if (route.service === 'commandmaps') {
        const job = { id: route.job_id, municipality_id: route.municipality_id };
        const inventory = (
          await pool.query('SELECT * FROM municipality_resources WHERE job_id=$1', [route.job_id])
        ).rows[0];
        const names = resourceNames(job);
        requireValue(
          Object.entries(names).every(([k, v]) => inventory?.[k] === v),
          503,
          'Resource ownership mismatch',
        );
        const connection = await runtimeConnection(job, configuredDataTarget());
        try {
          await connection.query('SELECT 1 FROM council.resource_records LIMIT 1');
        } finally {
          await connection.end();
        }
      }
      return res.json({
        hostname: route.hostname,
        routeId: route.id,
        version: route.version,
        municipalityId: route.municipality_id,
        service: route.service,
      });
    }
    requireValue(
      route.state === 'ready' &&
        route.checked_at &&
        Date.now() - new Date(route.checked_at).getTime() < 300000 &&
        (await routeReady(pool, route)),
      503,
      'Service route unavailable',
    );
    req.serviceRoute = route;
    const platformPath = req.path.startsWith('/api/platform/');
    if (req.path.startsWith('/api/') && req.path !== '/api/health')
      requireValue(
        platformPath === (route.service === 'platform'),
        403,
        'Service identity mismatch',
      );
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin)
      requireValue(
        req.headers.origin === `https://${hostname}`,
        403,
        'Request origin is not permitted',
      );
    return next();
  } catch (error) {
    next(error);
  }
}
export function checkRouteSession(req, session) {
  if (!req.serviceRoute) return;
  requireValue(
    session.route_id === req.serviceRoute.id && session.route_version === req.serviceRoute.version,
    401,
    'Session belongs to another service route',
  );
}
export async function routeContext(client, req, user) {
  if (!req.serviceRoute) return req.headers['x-civicmaps-context'];
  const selector = req.headers['x-civicmaps-context'];
  requireValue(
    !selector || selector === req.serviceRoute.binding_id,
    403,
    'Operating context does not match service route',
  );
  const contexts = await permittedContexts(client, user);
  requireValue(
    contexts.some((b) => b.id === req.serviceRoute.binding_id),
    403,
    'Service access is not permitted',
  );
  return req.serviceRoute.binding_id;
}
export async function controlRoute(client, id, version, action, actor) {
  requireValue(
    ['retry', 'withdraw'].includes(action) && Number.isInteger(version),
    400,
    'Invalid route action',
  );
  const result = await client.query(
    `UPDATE service_routes SET state=$3,version=version+1,attempts=0,lease_token=NULL,lease_until=NULL,checked_at=NULL,error=NULL
     WHERE id=$1 AND version=$2 AND ($3='withdrawn' OR state IN ('failed','withdrawn','pending')) RETURNING *`,
    [id, version, action === 'withdraw' ? 'withdrawn' : 'pending'],
  );
  requireValue(result.rowCount === 1, 409, 'Route version or state changed');
  const row = result.rows[0];
  await client.query(
    'INSERT INTO service_route_events(route_id,version,action,actor) VALUES ($1,$2,$3,$4)',
    [id, row.version, action, actor],
  );
  return row;
}
export async function runRoutingOnce(adapter, { afterEffect } = {}) {
  const { pool, transaction } = await import('./database.mjs');
  const route = await transaction(async (client) => {
    const r = (
      await client.query(
        `SELECT * FROM service_routes WHERE state='pending' OR (state='running' AND lease_until<clock_timestamp()) OR (state='ready' AND checked_at<clock_timestamp()-interval '60 seconds' AND (lease_until IS NULL OR lease_until<clock_timestamp())) ORDER BY checked_at NULLS FIRST,hostname FOR UPDATE SKIP LOCKED LIMIT 1`,
      )
    ).rows[0];
    if (!r) return null;
    if (r.attempts >= 3 && r.state !== 'ready') {
      await client.query(
        "UPDATE service_routes SET state='failed',lease_token=NULL,lease_until=NULL,error='Route attempt budget exhausted' WHERE id=$1",
        [r.id],
      );
      return null;
    }
    return (
      await client.query(
        `UPDATE service_routes SET state=CASE WHEN state='ready' THEN 'ready' ELSE 'running' END,attempts=CASE WHEN state='ready' THEN 1 ELSE attempts+1 END,lease_token=$2,lease_until=clock_timestamp()+interval '60 seconds' WHERE id=$1 RETURNING *`,
        [r.id, randomUUID()],
      )
    ).rows[0];
  });
  if (!route) return false;
  let success = false;
  try {
    requireValue(await routeReady(pool, route), 503, 'Resources unavailable');
    const observed = (await adapter.reconcile(route)) ?? (await adapter.apply(route));
    requireValue(
      observed.hostname === route.hostname &&
        observed.routeId === route.id &&
        observed.version === route.version &&
        observed.municipalityId === route.municipality_id &&
        observed.service === route.service,
      503,
      'Probe identity mismatch',
    );
    if (afterEffect) await afterEffect(route);
    success = true;
  } catch {
    /* Never persist provider error payloads, headers, certificates or credentials. */
  }
  return transaction(async (client) => {
    const result = await client.query(
      `UPDATE service_routes SET state=$3,checked_at=CASE WHEN $3='ready' THEN clock_timestamp() ELSE NULL END,error=$4,lease_token=NULL,lease_until=NULL
    WHERE id=$1 AND lease_token=$2 AND lease_until>clock_timestamp() RETURNING id`,
      [
        route.id,
        route.lease_token,
        success ? 'ready' : 'failed',
        success ? null : 'Route reconciliation failed; inspect owned ingress and retry',
      ],
    );
    if (result.rowCount)
      await client.query(
        'INSERT INTO service_route_events(route_id,version,action,actor) VALUES ($1,$2,$3,$4)',
        [route.id, route.version, success ? 'ready' : 'failed', 'routing-worker'],
      );
    return result.rowCount === 1;
  });
}
