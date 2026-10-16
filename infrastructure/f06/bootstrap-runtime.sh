#!/usr/bin/env bash
# Run through authorised SSM on the dedicated F06 instance after reviewing the stack.
set -euo pipefail
: "${F06_BUCKET:?}" "${F06_ARTIFACT_KEY:?}" "${F06_ARTIFACT_SHA256:?}" "${F06_STORAGE_ROLE:?}"
export AWS_DEFAULT_REGION=ap-southeast-2
install -d -m 0755 /opt/civicmaps /opt/civicmaps-node
aws s3 cp "s3://${F06_BUCKET}/${F06_ARTIFACT_KEY}" /opt/civicmaps/source.tar.gz --only-show-errors
printf '%s  %s\n' "$F06_ARTIFACT_SHA256" /opt/civicmaps/source.tar.gz | sha256sum -c -
tar -xzf /opt/civicmaps/source.tar.gz -C /opt/civicmaps
# Install only on the reviewed development runtime; no credentials enter an archive or SSM output.
dnf install -y postgresql15-server postgresql15 tar xz openssl
curl -fsSL https://nodejs.org/dist/v24.19.0/node-v24.19.0-linux-x64.tar.xz -o /tmp/civicmaps-node.tar.xz
curl -fsSL https://nodejs.org/dist/v24.19.0/SHASUMS256.txt -o /tmp/civicmaps-node-checksums
(cd /tmp; grep ' node-v24.19.0-linux-x64.tar.xz$' civicmaps-node-checksums | sed 's/node-v24.19.0-linux-x64.tar.xz/civicmaps-node.tar.xz/' | sha256sum -c -)
tar -xJf /tmp/civicmaps-node.tar.xz -C /opt/civicmaps-node --strip-components=1
curl -fsSL https://github.com/caddyserver/caddy/releases/download/v2.10.2/caddy_2.10.2_linux_amd64.tar.gz -o /tmp/civicmaps-caddy.tar.gz
# Official release checksums use SHA512.
printf '%s  %s\n' '747df7ee74de188485157a383633a1a963fd9233b71fbb4a69ddcbcc589ce4e2cc82dacf5dbbe136cb51d17e14c59daeb5d9bc92487610b0f3b93680b2646546' /tmp/civicmaps-caddy.tar.gz | sha512sum -c -
tar -xzf /tmp/civicmaps-caddy.tar.gz -C /usr/local/bin caddy
id civicmaps >/dev/null 2>&1 || useradd --system --home-dir /opt/civicmaps civicmaps
id caddy >/dev/null 2>&1 || useradd --system --home-dir /var/lib/caddy --create-home caddy
install -d -m 0755 /etc/civicmaps
if [ ! -f /etc/civicmaps/runtime.env ]; then
  # Single generated acceptance password; never use the repository's public local password.
  umask 077
  {
    printf 'CIVICMAPS_DEMO_PASSWORD=%s\n' "$(openssl rand -hex 32)"
    printf 'CIVICMAPS_INGRESS_TOKEN=%s\n' "$(openssl rand -hex 32)"
    printf 'CIVICMAPS_PROBE_TOKEN=%s\n' "$(openssl rand -hex 32)"
    printf 'CIVICMAPS_DATABASE_URL=postgresql://postgres@127.0.0.1:5432/civicmaps_f06\n'
    printf 'CIVICMAPS_ROUTING_MODE=ingress\nCIVICMAPS_PROVISIONING_PAUSED=1\n'
    printf 'CIVICMAPS_ROUTE_HOSTS=platform.dev.civicmaps.com.au,alpha-commandmaps.dev.civicmaps.com.au,beta-commandmaps.dev.civicmaps.com.au\n'
    printf 'CIVICMAPS_ORIGINS=https://platform.dev.civicmaps.com.au,https://alpha-commandmaps.dev.civicmaps.com.au,https://beta-commandmaps.dev.civicmaps.com.au\n'
    printf 'CIVICMAPS_RESOURCE_HOST=civicmaps-f05-development-database-siqbhsmut3gm.c7gy0o46a48t.ap-southeast-2.rds.amazonaws.com\n'
    printf 'CIVICMAPS_RESOURCE_MASTER_SECRET=arn:aws:secretsmanager:ap-southeast-2:597663815195:secret:rds!db-af628053-2227-4050-9b11-9862a73c3eb5-BTC2xW\n'
    printf 'CIVICMAPS_RESOURCE_BUCKET=%s\nCIVICMAPS_RESOURCE_ROLE=%s\nCIVICMAPS_RESOURCE_CA=/etc/civicmaps/rds-ca.pem\n' "$F06_BUCKET" "$F06_STORAGE_ROLE"
  } > /etc/civicmaps/runtime.env
fi
curl -fsSL https://truststore.pki.rds.amazonaws.com/ap-southeast-2/ap-southeast-2-bundle.pem -o /etc/civicmaps/rds-ca.pem
# Initialise only a new dedicated local control database; preserve it across subsequent releases.
[ -f /var/lib/pgsql/data/PG_VERSION ] || postgresql-setup --initdb
# The control database listens only on loopback and uses SCRAM; peer access stays available to the OS postgres user.
python3 - <<'PY'
from pathlib import Path
p=Path('/var/lib/pgsql/data/pg_hba.conf')
p.write_text("local all postgres peer\nlocal all all reject\nhost civicmaps_f06 civicmaps_f06_runtime 127.0.0.1/32 scram-sha-256\nhost all all 127.0.0.1/32 reject\nhost all all ::1/128 reject\n")
p=Path('/var/lib/pgsql/data/postgresql.conf');s=p.read_text();s+="\nlisten_addresses = '127.0.0.1'\npassword_encryption = 'scram-sha-256'\n";p.write_text(s)
PY
systemctl enable --now postgresql
systemctl restart postgresql
cd /opt/civicmaps
export PATH=/opt/civicmaps-node/bin:$PATH
npm ci --omit=dev --ignore-scripts --bin-links=false --no-audit --no-fund --cache /opt/civicmaps/.npm-cache
# Source is trusted committed deployment configuration, generated with hex-only secret values.
set -a
. /etc/civicmaps/runtime.env
set +a
# OS postgres peer access performs schema installation; runtime DB login has no superuser powers.
runuser -u postgres -- psql -Atqc "SELECT 1 FROM pg_database WHERE datname='civicmaps_f06'" | grep -q 1 || runuser -u postgres -- createdb civicmaps_f06
CIVICMAPS_DATABASE_URL=postgresql://postgres@localhost/civicmaps_f06?host=/var/run/postgresql runuser -u postgres --preserve-environment -- /opt/civicmaps-node/bin/node services/api/migrate.mjs
CIVICMAPS_DATABASE_URL=postgresql://postgres@localhost/civicmaps_f06?host=/var/run/postgresql runuser -u postgres --preserve-environment -- /opt/civicmaps-node/bin/node services/api/seed.mjs
CIVICMAPS_DATABASE_URL=postgresql://postgres@localhost/civicmaps_f06?host=/var/run/postgresql runuser -u postgres --preserve-environment -- /opt/civicmaps-node/bin/node services/api/seed-platform.mjs
CIVICMAPS_DATABASE_URL=postgresql://postgres@localhost/civicmaps_f06?host=/var/run/postgresql CIVICMAPS_CONFIGURE_ROUTES=F06-synthetic-only runuser -u postgres --preserve-environment -- /opt/civicmaps-node/bin/node scripts/configure-development-routes.mjs
# Generate a distinct database owner credential into a private file, never argv/log output.
runuser -u postgres -- /usr/bin/python3 /opt/civicmaps/infrastructure/f06/configure-control-login.py
python3 - <<'PYENV'
from pathlib import Path
p=Path('/etc/civicmaps/runtime.env')
s=p.read_text()
url=Path('/var/lib/pgsql/f06-runtime-url').read_text()
s='\n'.join('CIVICMAPS_DATABASE_URL='+url if line.startswith('CIVICMAPS_DATABASE_URL=') else line for line in s.splitlines())+'\n'
p.write_text(s)
PYENV
chown -R civicmaps:civicmaps /opt/civicmaps
chmod -R a+rX /opt/civicmaps
cp infrastructure/f06/civicmaps-api.service infrastructure/f06/civicmaps-routing.service infrastructure/f06/civicmaps-ingress.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable civicmaps-api civicmaps-ingress civicmaps-routing
systemctl restart civicmaps-api civicmaps-ingress
# Verify real public TLS before the first manifest probe. A pending-route HTTP503 is expected here.
for host in platform.dev.civicmaps.com.au alpha-commandmaps.dev.civicmaps.com.au beta-commandmaps.dev.civicmaps.com.au; do
  verified=0
  for attempt in $(seq 1 36); do
    if curl --silent --show-error --max-time 10 --output /dev/null "https://${host}/api/health"; then verified=1; break; fi
    sleep 5
  done
  [ "$verified" = 1 ] || { echo "TLS not ready for ${host}"; exit 1; }
done
systemctl restart civicmaps-routing
