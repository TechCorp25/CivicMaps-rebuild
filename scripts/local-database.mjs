import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
const dataRoot =
  process.env.CIVICMAPS_DATA_DIR ?? resolve(homedir(), '.local/share/civicmaps-local');
const directory = resolve(dataRoot, 'postgres');
const binaries = process.env.CIVICMAPS_PG_BIN ?? '/usr/lib/postgresql/15/bin';
const port = process.env.CIVICMAPS_PG_PORT ?? '55432';
mkdirSync(dataRoot, { recursive: true, mode: 0o700 });
function run(command, args) {
  const result = spawnSync(`${binaries}/${command}`, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (process.argv[2] === 'stop') {
  run('pg_ctl', ['-D', directory, '-m', 'fast', '-w', 'stop']);
} else if (process.argv[2] === 'start') {
  if (!existsSync(`${directory}/PG_VERSION`))
    run('initdb', [
      '-D',
      directory,
      '-U',
      'civicmaps_local',
      '--auth-local=trust',
      '--auth-host=trust',
      '--encoding=UTF8',
      '--no-locale',
    ]);
  const status = spawnSync(`${binaries}/pg_ctl`, ['-D', directory, 'status'], { stdio: 'ignore' });
  if (status.status !== 0)
    run('pg_ctl', [
      '-D',
      directory,
      '-l',
      resolve(dataRoot, 'postgres.log'),
      '-o',
      `-h 127.0.0.1 -p ${port} -k ${dataRoot}`,
      '-w',
      'start',
    ]);
  console.log(`Local synthetic database available on 127.0.0.1:${port}`);
} else throw new Error('Use start or stop');
