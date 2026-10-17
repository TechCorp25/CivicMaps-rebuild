bash -s <<'ROLLBACK'
set -euo pipefail
export PATH=/opt/civicmaps-node/bin:/usr/local/bin:/usr/bin:/usr/sbin:/sbin
newheld=/opt/civicmaps-releases/qualified-f06q-09669af3a9b2
oldheld=/opt/civicmaps-releases/previous-20261017T044858Z-09669af3a9b2
[ ! -e "$newheld" ]
[ -d "$oldheld" ]
[ "$(cat /opt/civicmaps/.deployed-revision)" = 09669af3a9b2d4cd9ff465f70647fd286849222d ]
warm_ingress() (
 set -a
 . /etc/civicmaps/runtime.env
 set +a
 /opt/civicmaps-node/bin/node --input-type=module <<'NODE'
import {setTimeout} from 'node:timers/promises';
for(const host of ['platform.dev.civicmaps.com.au','alpha-commandmaps.dev.civicmaps.com.au','beta-commandmaps.dev.civicmaps.com.au']) {
 let ready=false;
 for(let attempt=0;attempt<30;attempt++) {
  try {
   const r=await fetch(`https://${host}/api/routing/probe`,{headers:{'x-civicmaps-probe':process.env.CIVICMAPS_PROBE_TOKEN},redirect:'error',signal:AbortSignal.timeout(10000)});
   if(r.ok&&(await r.json()).hostname===host){ready=true;break;}
  } catch { /* Startup waits must never log credentials or raw provider failures. */ }
  await setTimeout(1000);
 }
 if(!ready)throw new Error('Private ingress readiness did not recover');
}
console.log('PASS authenticated private ingress is ready before starting routing');
NODE
)

recover() {
 local status=$?
 trap - EXIT
 if [ "$status" != 0 ]; then
  systemctl stop civicmaps-routing civicmaps-ingress civicmaps-api || true
  if [ -d "$newheld" ]; then
   [ ! -d /opt/civicmaps ] || mv /opt/civicmaps "$oldheld"
   mv "$newheld" /opt/civicmaps
  fi
  systemctl start civicmaps-api civicmaps-ingress
  warm_ingress
  systemctl start civicmaps-routing
 fi
 exit "$status"
}
trap recover EXIT
systemctl stop civicmaps-routing
systemctl stop civicmaps-ingress civicmaps-api
umask 077
sha256sum /etc/civicmaps/runtime.env /etc/civicmaps/ingress.env > /var/lib/pgsql/f06q-env-fingerprint
python3 - <<'PRE' > /var/lib/pgsql/f06q-pre-rollback.json
import subprocess,hashlib,json
from pathlib import Path
result={}
for table in ['users','platform_operators','platform_first_admins','platform_municipalities','operating_context_bindings','operating_context_grants','municipality_resources','municipality_resource_contexts','provisioning_jobs','sessions','platform_sessions']:
    data=subprocess.check_output(['runuser','-u','postgres','--','psql','-v','ON_ERROR_STOP=1','-d','civicmaps_f06','-Atqc',f'SELECT to_jsonb(t)::text FROM {table} t ORDER BY to_jsonb(t)::text'])
    result[table]={'sha256':hashlib.sha256(data).hexdigest(),'rows':len(data.splitlines())}
data=subprocess.check_output(['runuser','-u','postgres','--','psql','-v','ON_ERROR_STOP=1','-d','civicmaps_f06','-Atqc','SELECT id,hostname,service,municipality_id,binding_id,job_id,target,version FROM service_routes ORDER BY hostname'])
result['routes']=data.decode().splitlines()
print(json.dumps(result,sort_keys=True))

PRE
mv /opt/civicmaps "$newheld"
mv "$oldheld" /opt/civicmaps
systemctl start civicmaps-api civicmaps-ingress
warm_ingress
systemctl start civicmaps-routing
verify_health() {
 local mode=$1
 for attempt in $(seq 1 24); do
  ready=1
  for host in platform.dev.civicmaps.com.au alpha-commandmaps.dev.civicmaps.com.au beta-commandmaps.dev.civicmaps.com.au; do
   if ! curl -fsS --max-time 10 "https://$host/api/health" > /tmp/f06q-rollback-health.json; then ready=0; continue; fi
   if ! python3 -c 'import sys,json; assert json.load(open("/tmp/f06q-rollback-health.json"))["mode"]==sys.argv[1]' "$mode"; then ready=0; fi
  done
  [ "$ready" != 1 ] || return 0
  sleep 5
 done
 return 1
}
verify_health local-synthetic
printf 'PASS previous b5c9709 application/Caddy operates with additive migrations010/011
'
sha256sum /opt/civicmaps/services/api/routing.mjs
systemctl stop civicmaps-routing
systemctl stop civicmaps-ingress civicmaps-api
mv /opt/civicmaps "$oldheld"
mv "$newheld" /opt/civicmaps
CIVICMAPS_DATABASE_URL='postgresql://postgres@localhost/civicmaps_f06?host=/var/run/postgresql' runuser -u postgres --preserve-environment -- node /opt/civicmaps/services/api/migrate.mjs
systemctl start civicmaps-api civicmaps-ingress
warm_ingress
systemctl start civicmaps-routing
verify_health ingress
sha256sum -c /var/lib/pgsql/f06q-env-fingerprint
python3 - <<'POST' > /var/lib/pgsql/f06q-post-rollback.json
import subprocess,hashlib,json
from pathlib import Path
result={}
for table in ['users','platform_operators','platform_first_admins','platform_municipalities','operating_context_bindings','operating_context_grants','municipality_resources','municipality_resource_contexts','provisioning_jobs','sessions','platform_sessions']:
    data=subprocess.check_output(['runuser','-u','postgres','--','psql','-v','ON_ERROR_STOP=1','-d','civicmaps_f06','-Atqc',f'SELECT to_jsonb(t)::text FROM {table} t ORDER BY to_jsonb(t)::text'])
    result[table]={'sha256':hashlib.sha256(data).hexdigest(),'rows':len(data.splitlines())}
data=subprocess.check_output(['runuser','-u','postgres','--','psql','-v','ON_ERROR_STOP=1','-d','civicmaps_f06','-Atqc','SELECT id,hostname,service,municipality_id,binding_id,job_id,target,version FROM service_routes ORDER BY hostname'])
result['routes']=data.decode().splitlines()
print(json.dumps(result,sort_keys=True))

POST
python3 - <<'COMPARE'
import json
from pathlib import Path
assert json.loads(Path('/var/lib/pgsql/f06q-pre-rollback.json').read_text())==json.loads(Path('/var/lib/pgsql/f06q-post-rollback.json').read_text()),'Rollback changed control data, sessions or route ownership/version'
print('PASS code rollback and return preserve 11 control/session table fingerprints and all route identities/versions; private environment unchanged')
print('Final deployed revision:',Path('/opt/civicmaps/.deployed-revision').read_text().strip())
COMPARE
systemctl is-active postgresql civicmaps-api civicmaps-ingress civicmaps-routing
trap - EXIT
ROLLBACK
