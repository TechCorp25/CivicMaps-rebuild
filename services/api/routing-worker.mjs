import { setTimeout } from 'node:timers/promises';
import { runRoutingOnce } from './routing.mjs';
import { pool } from './database.mjs';
const adapter = {
  async reconcile(route) {
    const allowed = (process.env.CIVICMAPS_ROUTE_HOSTS ?? '').split(',');
    if (!allowed.includes(route.hostname)) throw new Error('Route not owned by this ingress');
    // TLS certificate/hostname validation is performed by fetch. Redirects must never carry the token.
    const response = await fetch(`https://${route.hostname}/api/routing/probe`, {
      headers: { 'x-civicmaps-probe': process.env.CIVICMAPS_PROBE_TOKEN },
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('Ingress probe failed');
    return response.json();
  },
  async apply() {
    throw new Error('Owned DNS/TLS deployment must be reconciled before publishing readiness');
  },
};
let running = true;
process.on('SIGTERM', () => {
  running = false;
});
process.on('SIGINT', () => {
  running = false;
});
try {
  do {
    await runRoutingOnce(adapter);
    if (process.argv.includes('--once')) break;
    await setTimeout(10000);
  } while (running);
} finally {
  await pool.end();
}
