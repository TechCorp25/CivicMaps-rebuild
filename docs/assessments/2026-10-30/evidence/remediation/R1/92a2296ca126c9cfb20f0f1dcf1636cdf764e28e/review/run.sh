#!/bin/bash
cd /workspace/work/remediation-2026-10-31/checker
out=/workspace/work/remediation-2026-10-31/checker-output/R1-recheck
export PATH="$out/pgtools:$PATH"
export CIVICMAPS_DATABASE_URL=postgres://civicmaps_recheck@127.0.0.1:55473/civicmaps_recheck
export PLAYWRIGHT_BROWSERS_PATH=/tmp/civicmaps-r1-builder-browsers
export CIVICMAPS_AUDIT_OUTPUT_DIR="$out/audit"
run() { label=$1; shift; "$@" > "$out/$label.log" 2>&1; result=$?; echo "$label=$result" | tee -a "$out/exits.log"; }
run postgres-version docker exec civicmaps-r1-recheck-20261031 psql -U civicmaps_recheck -c 'select version()'
run manifests npm run verify:vite-manifests
run installed npm ls vite
run audit npm run audit:dependencies
run check npm run check
run map-browser npm run test:map:browser
run platform-browser npm run test:platform:browser
run commandmaps-browser npm run test:commandmaps:browser
run activation-browser npm run test:activation:browser
run vite-smoke node docs/assessments/2026-10-30/evidence/remediation/R1/vite-fs-smoke.mjs
