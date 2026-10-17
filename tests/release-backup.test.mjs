import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { access, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createTestEnvironment } from './helpers/environment.mjs';
import { routingFixture } from './helpers/routing-fixture.mjs';

test('release verification cleans owned restore databases after success, assertion failure and interruption', async () => {
  const env = await createTestEnvironment({ platform: true });
  const directory = await mkdtemp(join(tmpdir(), 'civicmaps-release-backup-'));
  const revision = randomUUID().replaceAll('-', '').padEnd(40, 'a');
  const prefix = `f06q_restore_${revision.slice(0, 12)}`;
  let retained = false;
  try {
    await routingFixture(env.pool);
    // A pre-existing database, including one left by the old release helper, is never ours to drop.
    await env.pool.query(`CREATE DATABASE ${prefix}`);
    retained = true;
    const connection = new URL(env.connectionString);
    const helperEnv = {
      ...process.env,
      PGHOST: connection.hostname,
      PGPORT: connection.port,
      PGUSER: decodeURIComponent(connection.username),
      PGPASSWORD: decodeURIComponent(connection.password),
      PGDATABASE: connection.pathname.slice(1),
    };
    const backup = join(directory, 'control.dump');
    const dump = () => {
      const result = spawnSync('pg_dump', ['-Fc', '-f', backup, env.connectionString], {
        encoding: 'utf8',
      });
      assert.equal(result.status, 0, result.stderr);
    };
    const verify = (path = backup, overrides = {}) =>
      spawnSync('bash', [resolve('infrastructure/f06/verify-backup.sh'), path, revision], {
        encoding: 'utf8',
        timeout: 15000,
        env: { ...helperEnv, ...overrides },
      });
    const assertClean = async () => {
      assert.deepEqual(
        (
          await env.pool.query('SELECT datname FROM pg_database WHERE datname LIKE $1', [
            prefix + '%',
          ])
        ).rows.map((row) => row.datname),
        [prefix],
      );
    };
    dump();
    assert.equal(verify().status, 0);
    await assertClean();
    // A bad restore remains private and must not leave a database that blocks a retry.
    const invalid = join(directory, 'invalid.dump');
    await writeFile(invalid, 'Synthetic invalid backup');
    assert.notEqual(verify(invalid).status, 0);
    await assertClean();
    const interrupted = join(directory, 'interrupted');
    await mkdir(interrupted);
    await writeFile(join(interrupted, 'pg_restore'), '#!/usr/bin/env bash\nkill -TERM "$PPID"\n', {
      mode: 0o700,
    });
    assert.equal(verify(backup, { PATH: `${interrupted}:${process.env.PATH}` }).status, 143);
    await assertClean();
    assert.equal(verify().status, 0);
    await assertClean();
    await env.pool.query("DELETE FROM service_routes WHERE service='platform'");
    dump();
    assert.notEqual(verify().status, 0);
    await assertClean();
    assert.equal(
      (await env.pool.query('SELECT count(*)::int AS count FROM service_routes')).rows[0].count,
      2,
    );
    const rejected = join(directory, 'rejected');
    await mkdir(rejected);
    await writeFile(join(rejected, 'createdb'), '#!/usr/bin/env bash\nexit 42\n', { mode: 0o700 });
    await writeFile(join(rejected, 'dropdb'), '#!/usr/bin/env bash\ntouch "$F06Q_DROP_MARKER"\n', {
      mode: 0o700,
    });
    const marker = join(directory, 'unexpected-drop');
    assert.equal(
      verify(backup, {
        PATH: `${rejected}:${process.env.PATH}`,
        F06Q_DROP_MARKER: marker,
      }).status,
      42,
    );
    await assert.rejects(access(marker), { code: 'ENOENT' });
    await assertClean();
  } finally {
    if (retained) await env.pool.query(`DROP DATABASE ${prefix}`);
    await rm(directory, { recursive: true, force: true });
    await env.close();
  }
});
