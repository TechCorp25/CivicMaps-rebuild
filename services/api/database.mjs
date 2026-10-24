import pg from 'pg';
export const connectionString =
  process.env.CIVICMAPS_DATABASE_URL ?? 'postgresql://civicmaps_local@127.0.0.1:55432/postgres';
export const databaseBudgets = Object.freeze({
  // Ten-client synthetic reads peaked at 23.5 ms; one second leaves room for bursts
  // while bounding checkout and lock waits. Statements get five seconds per server query.
  request: Object.freeze({ acquireMs: 1_000, statementMs: 5_000, lockMs: 1_000, max: 10 }),
  // Migrations and fixture seeding run outside request paths and may hold DDL locks longer.
  maintenance: Object.freeze({
    acquireMs: 10_000,
    statementMs: 120_000,
    lockMs: 30_000,
    max: 2,
  }),
});

function createPool(profile) {
  const budget = databaseBudgets[profile];
  const clientPool = new pg.Pool({
    connectionString,
    max: budget.max,
    connectionTimeoutMillis: budget.acquireMs,
    options: `-c statement_timeout=${budget.statementMs} -c lock_timeout=${budget.lockMs}`,
  });
  clientPool.on('error', (error) => {
    const code =
      typeof error?.code === 'string' && /^[A-Z0-9]{5}$/.test(error.code) ? error.code : 'unknown';
    console.error('Idle PostgreSQL client error', { code });
  });
  return clientPool;
}

export const pool = createPool('request');
export const maintenancePool = createPool('maintenance');

const transientSqlStates = new Set([
  '08000',
  '08001',
  '08003',
  '08006',
  '08P01',
  '53300',
  '55P03',
  '57014',
  '57P01',
  '57P02',
  '57P03',
]);
const transientNodeCodes = new Set([
  'ECONNABORTED',
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EAI_AGAIN',
  'EPIPE',
  'ETIMEDOUT',
]);

export function isTransientDatabaseError(error) {
  return (
    transientSqlStates.has(error?.code) ||
    transientNodeCodes.has(error?.code) ||
    error?.message === 'Connection terminated unexpectedly' ||
    error?.message === 'timeout exceeded when trying to connect'
  );
}

export async function transaction(work, clientPool = pool) {
  const client = await clientPool.connect();
  let discardClient;
  const captureClientFailure = (error) => {
    // pg-pool removes its idle error listener while a client is checked out.
    // Keep transport failures handled until release so a concurrent socket error
    // cannot become an uncaught process exception.
    discardClient ??= error;
  };
  client.on('error', captureClientFailure);
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      discardClient = rollbackError;
      const code =
        typeof rollbackError?.code === 'string' && /^[A-Z0-9]{5}$/.test(rollbackError.code)
          ? rollbackError.code
          : 'unknown';
      console.error('Database rollback failed; pooled client will be discarded', { code });
    }
    throw error;
  } finally {
    client.removeListener('error', captureClientFailure);
    client.release(discardClient);
  }
}
