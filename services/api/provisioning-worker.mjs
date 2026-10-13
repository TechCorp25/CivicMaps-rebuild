import { setTimeout as delay } from 'node:timers/promises';
import { pool } from './database.mjs';
import { runProvisioningOnce } from './provisioning.mjs';
let stopping = false;
process.on('SIGTERM', () => {
  stopping = true;
});
process.on('SIGINT', () => {
  stopping = true;
});
const fault = process.env.CIVICMAPS_WORKER_TEST_FAULT;
if (fault && (process.env.NODE_ENV !== 'test' || !['after-claim', 'after-effect'].includes(fault)))
  throw new Error('Worker fault injection is only supported in isolated tests');
try {
  do {
    const worked = await runProvisioningOnce({
      afterClaim: fault === 'after-claim' ? () => process.exit(86) : undefined,
      afterEffect: fault === 'after-effect' ? () => process.exit(87) : undefined,
    });
    if (process.argv.includes('--once')) break;
    if (!worked && !stopping) await delay(1000);
  } while (!stopping);
} catch {
  console.error(
    'Provisioning worker stopped after a database or checkpoint failure. Jobs retain their leases for recovery.',
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
