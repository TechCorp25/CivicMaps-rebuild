bash -s <<'AUDIT'
set -euo pipefail
export PATH=/usr/local/bin:/usr/bin:/usr/sbin:/sbin
restore_db=f06q_audit_restore_20261017
created=0
cleanup() { if [ "$created" = 1 ]; then runuser -u postgres -- dropdb "$restore_db"; fi; }
trap cleanup EXIT
runuser -u postgres -- createdb "$restore_db"
created=1
runuser -u postgres -- pg_restore --exit-on-error -d "$restore_db" /var/lib/pgsql/f06q-backups/20261017T044858Z-09669af3a9b2/control.dump
python3 - <<'PY'
import subprocess,hashlib
restored='f06q_audit_restore_20261017'
def query(db,sql):return subprocess.check_output(['runuser','-u','postgres','--','psql','-v','ON_ERROR_STOP=1','-d',db,'-Atqc',sql])
for table in ['service_route_events','platform_audit','audit_events']:
 maximum=int(query(restored,f'SELECT COALESCE(max(id),0) FROM {table}').strip())
 sql=f'SELECT to_jsonb(t)::text FROM {table} t WHERE id<={maximum} ORDER BY id'
 original=query(restored,sql);current=query('civicmaps_f06',sql)
 assert original==current,'Historical audit changed: '+table
 print(f'PASS unchanged historical {table}: {len(original.splitlines())} rows match restored pre-release checkpoint; later events remain appended')
PY
AUDIT
