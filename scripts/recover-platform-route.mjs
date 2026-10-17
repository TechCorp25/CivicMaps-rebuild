// Run through authorised SSM as OS postgres with peer DB authentication; never expose an HTTP bypass.
import { userInfo } from 'node:os';
import { pool, transaction } from '../services/api/database.mjs';
import { recoverPlatformRoute } from '../services/api/platform-route-recovery.mjs';
try {
  const version = Number(process.argv[2]);
  if (userInfo().username !== 'postgres' || !Number.isInteger(version) || version < 1)
    throw new Error('Run as OS postgres with the current terminal Platform route version');
  const route = await transaction((client) =>
    recoverPlatformRoute(client, version, 'ssm-postgres'),
  );
  console.log(JSON.stringify({ routeId: route.id, version: route.version, state: route.state }));
} catch {
  console.error(
    'Platform recovery refused; verify operator authentication, terminal state and current version',
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
