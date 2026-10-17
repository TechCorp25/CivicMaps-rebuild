#!/usr/bin/env bash
# Run as the database operator; this owns only its unique disposable restore database.
set -euo pipefail
backup=${1:?Backup path required}
revision=${2:?Source revision required}
[[ "$revision" =~ ^[a-f0-9]{40}$ ]]
[ -f "$backup" ]
recovery_db="f06q_restore_${revision:0:12}_$(tr -d '-' < /proc/sys/kernel/random/uuid)"
created=0
cleanup() {
  local result=$?
  trap - EXIT INT TERM
  if [ "$created" = 1 ]; then
    if ! dropdb "$recovery_db"; then
      echo "Disposable backup-verification database cleanup failed: $recovery_db" >&2
      result=1
    fi
  fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
createdb "$recovery_db"
created=1
pg_restore --exit-on-error -d "$recovery_db" "$backup"
psql -v ON_ERROR_STOP=1 -d "$recovery_db" -Atqc "SELECT count(*)=3 FROM service_routes" | grep -qx t
