import pg from 'pg';
export const connectionString =
  process.env.CIVICMAPS_DATABASE_URL ?? 'postgresql://civicmaps_local@127.0.0.1:55432/postgres';
export const pool = new pg.Pool({ connectionString, max: 10 });
pool.on('error', (error) => {
  const code =
    typeof error?.code === 'string' && /^[A-Z0-9]{5}$/.test(error.code) ? error.code : 'unknown';
  console.error('Idle PostgreSQL client error', { code });
});
export async function transaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
