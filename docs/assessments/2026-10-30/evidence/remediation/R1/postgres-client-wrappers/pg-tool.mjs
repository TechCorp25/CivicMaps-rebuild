import { basename } from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';

const mode = basename(process.argv[1]);
const args = process.argv.slice(2);
const container = 'civicmaps-r0-builder-20261031';
function fail(result) {
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) process.stderr.write(`${result.error.message}\n`);
  process.exit(result.status ?? 1);
}
const pgEnv = [
  '-e', 'PGHOST=127.0.0.1',
  '-e', 'PGPORT=5432',
  '-e', `PGUSER=${process.env.PGUSER ?? 'civicmaps_builder'}`,
  '-e', `PGDATABASE=${process.env.PGDATABASE ?? 'civicmaps_builder'}`,
];
if (process.env.PGPASSWORD) pgEnv.push('-e', `PGPASSWORD=${process.env.PGPASSWORD}`);
function dockerExec(command, toolArgs, env = true) {
  return spawnSync('docker', ['exec', ...(env ? pgEnv : []), container, command, ...toolArgs], {
    encoding: null,
    maxBuffer: 256 * 1024 * 1024,
  });
}
function internalUrl(value) {
  const url = new URL(value);
  url.hostname = '127.0.0.1';
  url.port = '5432';
  return url.href;
}
if (mode === 'pg_dump') {
  let destination = null;
  const toolArgs = [];
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === '-f' || value === '--file') {
      destination = args[++index];
      continue;
    }
    if (value.startsWith('--file=')) {
      destination = value.slice('--file='.length);
      continue;
    }
    if ((value === '-d' || value === '--dbname') && args[index + 1]) {
      toolArgs.push(value, internalUrl(args[++index]));
      continue;
    }
    if (value.startsWith('--dbname=')) {
      const db = value.slice('--dbname='.length);
      toolArgs.push(`--dbname=${db.startsWith('postgres://') || db.startsWith('postgresql://') ? internalUrl(db) : db}`);
      continue;
    }
    if (value.startsWith('postgres://') || value.startsWith('postgresql://')) {
      toolArgs.push(internalUrl(value));
      continue;
    }
    toolArgs.push(value);
  }
  const result = dockerExec('pg_dump', toolArgs);
  if (result.status !== 0) fail(result);
  if (destination) writeFileSync(destination, result.stdout);
  else process.stdout.write(result.stdout);
} else if (mode === 'pg_restore') {
  const fileIndex = args.findIndex((value) => existsSync(value));
  if (fileIndex < 0) throw new Error('Backup file missing in pg_restore invocation');
  const localFile = args[fileIndex];
  const containerFile = `/tmp/civicmaps-restore-${randomUUID()}.dump`;
  const copy = spawnSync('docker', ['cp', localFile, `${container}:${containerFile}`], { encoding: 'utf8' });
  if (copy.status !== 0) fail(copy);
  const toolArgs = args.map((value, index) => {
    if (index === fileIndex) return containerFile;
    if (value.startsWith('postgres://') || value.startsWith('postgresql://')) return internalUrl(value);
    if (value.startsWith('--dbname=postgres://') || value.startsWith('--dbname=postgresql://'))
      return `--dbname=${internalUrl(value.slice('--dbname='.length))}`;
    return value;
  });
  const result = dockerExec('pg_restore', toolArgs);
  spawnSync('docker', ['exec', container, 'rm', '-f', containerFile], { encoding: 'utf8' });
  if (result.status !== 0) fail(result);
  if (result.stdout?.length) process.stdout.write(result.stdout);
} else if (['createdb', 'dropdb', 'psql'].includes(mode)) {
  const result = dockerExec(mode, args);
  if (result.status !== 0) fail(result);
  if (result.stdout?.length) process.stdout.write(result.stdout);
} else throw new Error(`Unknown PostgreSQL tool wrapper: ${mode}`);
