import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import pg from 'pg';

for (const [migration, originalRole] of [
  ['001-foundation', 'civicmaps_local_app'],
  ['003-platform', 'civicmaps_platform_app'],
  ['006-provisioning-jobs', 'civicmaps_provisioning_worker'],
]) {
  test(`${migration} tolerates concurrent cluster role creation`, async () => {
    const connectionString =
      process.env.CIVICMAPS_DATABASE_URL ?? 'postgresql://civicmaps_local@127.0.0.1:55432/postgres';
    const creator = new pg.Client({ connectionString });
    const contender = new pg.Client({ connectionString });
    const role = `civicmaps_race_${randomUUID().replaceAll('-', '')}`;
    const source = await readFile(
      new URL(`../../services/api/migrations/${migration}.sql`, import.meta.url),
      'utf8',
    );
    const block = source.match(/DO \$\$ BEGIN[\s\S]*?END \$\$;/)?.[0];
    assert.ok(block?.includes(`CREATE ROLE ${originalRole}`));
    const sql = block.replaceAll(originalRole, role);
    let pending;
    try {
      await creator.connect();
      await contender.connect();
      await contender.query("SET statement_timeout='10s'");
      await creator.query('BEGIN');
      await creator.query(`CREATE ROLE ${role} NOLOGIN NOSUPERUSER NOBYPASSRLS`);
      // The uncommitted role is invisible to EXISTS, but its unique-index entry
      // blocks the competing CREATE. Commit only after observing that lock wait.
      pending = contender.query(sql).then(
        () => null,
        (error) => error,
      );
      const deadline = Date.now() + 5000;
      let waiting = false;
      while (Date.now() < deadline) {
        const result = await creator.query(
          'SELECT wait_event_type FROM pg_stat_activity WHERE pid=$1',
          [contender.processID],
        );
        if (result.rows[0]?.wait_event_type === 'Lock') {
          waiting = true;
          break;
        }
        await setTimeout(20);
        await creator.query('SELECT pg_stat_clear_snapshot()');
      }
      assert.ok(waiting, 'competing CREATE must reach the unique-index lock');
      await creator.query('COMMIT');
      assert.equal(await pending, null);
      await contender.query(sql);
      const result = await creator.query(
        'SELECT rolcanlogin,rolsuper,rolbypassrls FROM pg_roles WHERE rolname=$1',
        [role],
      );
      assert.deepEqual(result.rows, [{ rolcanlogin: false, rolsuper: false, rolbypassrls: false }]);
    } finally {
      await creator.query('ROLLBACK').catch(() => {});
      if (pending) await pending;
      await creator.query(`DROP ROLE IF EXISTS ${role}`);
      await Promise.all([creator.end(), contender.end()]);
    }
  });
}
