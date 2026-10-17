#!/usr/bin/env bash
# Existing approved synthetic runtime only. Execute via authenticated SSM as root.
# Stage/verify everything before stopping routing; preserve DB and private configuration.
set -euo pipefail
: "${F06_BUCKET:?}" "${F06_ARTIFACT_KEY:?}" "${F06_ARTIFACT_SHA256:?}" "${F06_REVISION:?}"
[[ "$F06_REVISION" =~ ^[a-f0-9]{40}$ && "$F06_ARTIFACT_SHA256" =~ ^[a-f0-9]{64}$ ]]
[ "$(id -u)" = 0 ]
export AWS_DEFAULT_REGION=ap-southeast-2
export PATH=/opt/civicmaps-node/bin:/usr/local/bin:/usr/bin:/usr/sbin:/sbin
[ "$(aws sts get-caller-identity --query Account --output text)" = 597663815195 ]
# Fail before mutation if this is a different machine or database boundary.
metadata_token=$(curl -fsS --max-time 5 -X PUT -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' http://169.254.169.254/latest/api/token)
[ "$(curl -fsS --max-time 5 -H "X-aws-ec2-metadata-token: $metadata_token" http://169.254.169.254/latest/meta-data/instance-id)" = i-0bbfbcd2d870cce97 ]
[ -f /etc/civicmaps/runtime.env ]
[ "$(stat -c %a /etc/civicmaps/runtime.env)" = 600 ]
# The approved artifact bucket is shared with the retained F05 data, never replaced.
[ "$F06_BUCKET" = civicmaps-f05-development-storage-iq7jtwcoip2y ]
[ "$F06_ARTIFACT_KEY" = "f06/releases/${F06_REVISION}.tar.gz" ]
checkpoint="$(date -u +%Y%m%dT%H%M%SZ)-${F06_REVISION:0:12}"
stage="/opt/civicmaps-releases/$checkpoint"
previous="/opt/civicmaps-releases/previous-$checkpoint"
backup="/var/lib/pgsql/f06q-backups/$checkpoint"
install -d -m 0755 /opt/civicmaps-releases "$stage"
aws s3 cp "s3://$F06_BUCKET/$F06_ARTIFACT_KEY" "$stage/source.tar.gz" --only-show-errors
printf '%s  %s\n' "$F06_ARTIFACT_SHA256" "$stage/source.tar.gz" | sha256sum -c -
# Reject path traversal and links before extracting an exact git archive + build outputs.
python3 - "$stage/source.tar.gz" <<'PY'
import sys,tarfile
from pathlib import PurePosixPath
with tarfile.open(sys.argv[1]) as archive:
    for member in archive:
        p=PurePosixPath(member.name)
        assert not p.is_absolute() and '..' not in p.parts and not member.issym() and not member.islnk()
PY
tar -xzf "$stage/source.tar.gz" -C "$stage"
cd "$stage"
[ "$(cat .deployed-revision)" = "$F06_REVISION" ]
test -f apps/commandmaps/dist/index.html
test -f apps/civicmaps-platform/dist/index.html
npm ci --omit=dev --ignore-scripts --bin-links=false --no-audit --no-fund --cache /opt/civicmaps/.npm-cache
CIVICMAPS_INGRESS_TOKEN=preflight-placeholder-at-least-32-characters caddy validate --config infrastructure/f06/Caddyfile --adapter caddyfile
chmod -R a+rX "$stage"
chown -R civicmaps:civicmaps "$stage"
# Private backups remain on the existing encrypted control disk; no new chargeable resource.
install -d -m 0700 -o postgres -g postgres /var/lib/pgsql/f06q-backups "$backup"
# Preserve intentional withdrawal: a release is not authority to resume a closed service.
runuser -u postgres -- psql -v ON_ERROR_STOP=1 -d civicmaps_f06 -Atqc "SELECT count(*)=3 AND bool_and(state='ready') FROM service_routes WHERE hostname IN ('platform.dev.civicmaps.com.au','alpha-commandmaps.dev.civicmaps.com.au','beta-commandmaps.dev.civicmaps.com.au')" | grep -qx t
switched=0
restore_services() {
  local result=$?
  trap - EXIT
  if [ "$result" != 0 ]; then
    systemctl stop civicmaps-routing civicmaps-ingress civicmaps-api || true
    if [ "$switched" = 1 ]; then
      mv /opt/civicmaps "/opt/civicmaps-releases/failed-$checkpoint"
      mv "$previous" /opt/civicmaps
    fi
    # Migrations 010/011 are additive; keep data/history and forward-compatible schema.
    systemctl start civicmaps-api civicmaps-ingress
    systemctl start civicmaps-routing
    echo "Release failed; prior application restored. Checkpoint: $checkpoint" >&2
  fi
  exit "$result"
}
trap restore_services EXIT
systemctl stop civicmaps-routing
systemctl stop civicmaps-ingress civicmaps-api
runuser -u postgres -- pg_dump -Fc -d civicmaps_f06 -f "$backup/control.dump"
runuser -u postgres -- bash -c 'umask 077; pg_dumpall --roles-only > "$1"' -- "$backup/roles.sql"
# Prove the checkpoint can be read and restored before altering the live schema.
runuser -u postgres -- pg_restore --list "$backup/control.dump" > "$backup/inventory.txt"
recovery_db="f06q_restore_${F06_REVISION:0:12}"
runuser -u postgres -- createdb "$recovery_db"
if ! runuser -u postgres -- pg_restore --exit-on-error -d "$recovery_db" "$backup/control.dump"; then
  runuser -u postgres -- dropdb "$recovery_db"
  exit 1
fi
runuser -u postgres -- psql -v ON_ERROR_STOP=1 -d "$recovery_db" -Atqc "SELECT count(*)=3 FROM service_routes" | grep -qx t
runuser -u postgres -- dropdb "$recovery_db"
sha256sum "$backup/control.dump" > "$backup/control.sha256"
# No seed/bootstrap replay or identity/login recreation during an application update.
CIVICMAPS_DATABASE_URL='postgresql://postgres@localhost/civicmaps_f06?host=/var/run/postgresql' runuser -u postgres --preserve-environment -- node services/api/migrate.mjs
mv /opt/civicmaps "$previous"
if ! mv "$stage" /opt/civicmaps; then mv "$previous" /opt/civicmaps; exit 1; fi
switched=1
cd /opt/civicmaps
systemctl start civicmaps-api civicmaps-ingress
systemctl start civicmaps-routing
# Only a successful fenced worker probe may publish readiness. Withdrawn routes stay closed.
for attempt in $(seq 1 36); do
  ready=1
  for host in platform.dev.civicmaps.com.au alpha-commandmaps.dev.civicmaps.com.au beta-commandmaps.dev.civicmaps.com.au; do
    if ! curl -fsS --max-time 10 --output /dev/null "https://$host/api/health"; then ready=0; fi
  done
  if [ "$ready" = 1 ]; then break; fi
  sleep 5
done
[ "$ready" = 1 ]
printf 'Release revision: %s\nArchive SHA256: %s\nPrivate backup: %s\nPrevious source: %s\n' "$F06_REVISION" "$F06_ARTIFACT_SHA256" "$backup" "$previous"
trap - EXIT
