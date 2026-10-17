import { controlRoute } from './routing.mjs';

export async function recoverPlatformRoute(client, version, actor) {
  const auth = await client.query('SELECT rolsuper FROM pg_roles WHERE rolname=current_user');
  if (!auth.rows[0]?.rolsuper)
    throw Object.assign(new Error('Database operator authentication required'), { status: 403 });
  const result = await client.query(
    "SELECT * FROM service_routes WHERE hostname='platform.dev.civicmaps.com.au' AND service='platform' AND state='failed' AND version=$1 FOR UPDATE",
    [version],
  );
  if (result.rowCount !== 1)
    throw Object.assign(new Error('Platform route version or terminal state changed'), {
      status: 409,
    });
  return controlRoute(client, result.rows[0].id, version, 'retry', `out-of-band:${actor}`);
}
