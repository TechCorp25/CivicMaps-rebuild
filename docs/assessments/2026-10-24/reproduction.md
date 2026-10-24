# Reproduction and evidence notes

All commands refer to baseline `346dfd2`. Review source before running on another
revision. Use only synthetic, dedicated databases. The normal integration helpers
create/drop their own uniquely named databases and need database-creation permission.
No command below requires a live AWS service or customer data.

## Normal bootstrap and gates

Use Node 24.19.0, npm 11.9.0 and PostgreSQL 15 binaries. The latter must include
`pg_dump`, `pg_restore`, `createdb`, `dropdb` and `psql` on PATH. Select a fresh
`CIVICMAPS_DATA_DIR` and unused `CIVICMAPS_PG_PORT`, then set
`CIVICMAPS_DATABASE_URL` to that dedicated endpoint. A populated development database
does not need resetting. See [the local build guide](../../development/local-build.md).

```bash
npm run setup
npm run db:start
npm run check
npm run test:platform:browser
npm run test:commandmaps:browser
npm run test:activation:browser
npm audit --json
git diff --exit-code -- apps/commandmaps/src/tokens.css apps/civicmaps-platform/src/tokens.css
```

Do not execute browser suites concurrently where their ports or synthetic identities
collide. Browser checks may regenerate the tracked F11E evidence images; preserve
new assessment screenshots separately and restore only the known generated changes.
Do not restore unrelated user work. The assessment changed no executable tests.

This session's PostgreSQL 15 selection was:

```bash
export CIVICMAPS_PG_BIN=/workspace/.assessment-tools/apt/postgresql15/usr/lib/postgresql/15/bin
export PATH="$CIVICMAPS_PG_BIN:$PATH"
export LD_LIBRARY_PATH=/workspace/.assessment-tools/apt/postgresql15/usr/lib/x86_64-linux-gnu
export CIVICMAPS_DATA_DIR=/workspace/.assessment-2026-10-24-pg15
export CIVICMAPS_PG_PORT=55440
export CIVICMAPS_DATABASE_URL=postgresql://civicmaps_local@127.0.0.1:55440/postgres
export PLAYWRIGHT_BROWSERS_PATH=/workspace/.cloud-setup/browsers
```

These absolute paths describe extracted local tools. Other environments should
select their own installed binaries. Network and loopback commands in this executor
used the supported network permission; inherited proxy settings and TLS checks
were preserved. No proxy bypass or interactive reauthentication was necessary.

## Read-only dependency, structure and infrastructure checks

```bash
npm ls express body-parser react react-dom pg vite --all --json
node node_modules/prettier/bin/prettier.cjs --check domains/service-requests-dispatch/lifecycle.mjs geo-data/fetch-com-roads.mjs
ruff check --isolated --select E4,E7,E9,F geo-data/generate_melbourne_cbd_street_blocks.py infrastructure/f06/configure-control-login.py
cfn-lint -r ap-southeast-2 -t infrastructure/f05/aws-development.json infrastructure/f06/aws-development.json --format json
bash -n infrastructure/f06/bootstrap-runtime.sh infrastructure/f06/release-runtime.sh infrastructure/f06/verify-backup.sh
```

Caddy 2.10.2 archive SHA-512:
`747df7ee74de188485157a383633a1a963fd9233b71fbb4a69ddcbcc589ce4e2cc82dacf5dbbe136cb51d17e14c59daeb5d9bc92487610b0f3b93680b2646546`.
Set `CIVICMAPS_CADDY_BINARY` to the verified executable, then run
`node tests/ingress-contract.mjs` and `node tests/ingress-login.mjs` against the dedicated
test database. These scripts run real handlers over loopback HTTP; they do not prove
public certificate identity. Caddy validation used a clearly synthetic ingress-token
placeholder and did not start a public listener.

Diagnostic complexity measurement uses the installed ESLint API with an additional
`overrideConfig` containing `complexity: ['warn', { max: 20 }]` and
`max-lines-per-function: ['warn', { max: 150, skipBlankLines: true, skipComments: true }]`.
Run `lintFiles` over `services/api`, both active app `src` directories and `scripts`;
retain only those two diagnostic rule IDs. Do not change the committed lint gate to
reproduce [complexity.json](evidence/complexity.json).

For lint scope, `new ESLint().calculateConfigForFile(path)` returns zero configured
rules for the active domain lifecycle and GIS JavaScript, versus 64 for the API app
and 48 for CommandMAPS main at this baseline. This is stronger evidence than simply
assuming all files visited by `eslint .` receive semantic rules.

## Focused offline reproductions

These diagnostics establish the observations in the report. They do not constitute
new product acceptance tests. Remediation must add proper regression tests under
`tests/` and invoke them through the established local/CI discovery.

- **QA02:** acquire all ten clients from the exported pool in a disposable
  `createTestEnvironment`; start an eleventh `pool.connect`; inspect `waitingCount`
  after 150 ms; release one client and await recovery. Release all clients and close
  the environment in `finally`. No SQL mutation or provider call is needed.
- **QA03/QA17:** import the original `hashPassword`/`verifyPassword`; schedule a
  zero-delay timer, perform ten valid verifications, measure with `performance.now`;
  then call `verifyPassword('synthetic-probe-value', 'salt:ab')` and retain the error
  code only. Do not log a real credential/hash. Measurements are executor-specific.
- **QA05:** import the original Python module with `importlib`; construct one
  `CorridorSeg` named `Wrong Street`, a real Shapely line from
  `(144.96,-37.81)` to `(144.961,-37.81)`, and its Rtree using
  `build_spatial_index`. Call `pick_best_segment('Requested Street',
  Point(144.9605,-37.81001), index, segments, k=1)`. The function returns index zero;
  its projected Haversine distance is about 1.11 m. The output loop later keys by the
  selected segment street. No external input or generated-output write is involved.
- **QA08:** transpile the original Platform `api.ts` with installed TypeScript,
  import the resulting module in isolation, and replace `globalThis.fetch` with a
  function returning `new Response('<html>Service unavailable</html>',
  { status: 503, headers: { 'Content-Type': 'text/html' } })`. Calling the helper
  produces the recorded SyntaxError with no HTTP status.
- **QA10:** evaluate the original `centroidOfPolygon` function with the closed square
  `[[0,0],[10,0],[10,10],[0,10],[0,0]]`, then the same boundary with its bottom edge
  replaced by points `[0,0]` through `[10,0]`. Results differ despite identical
  polygon area. No road fetch or output file write is required.
- **QA16:** call `municipalityHostname` for slugs `alpha`, `id-melbourne` and 48 `a`
  characters using non-fixture UUID `12345678-1234-4234-8234-123456789abc`; compare
  with the onboarding string `${slug}-commandmaps.dev.civicmaps.com.au`.

The QA01 bounded probe launched three disposable original `createApp` child processes
in local routing mode, one per gzip/deflate/Brotli encoding. It sent a valid compressed
`{}` frame to an unknown API path, waited 100 ms, then sent invalid trailing bytes,
and observed each child for 500 ms before terminating survivors. All survived that
specific sequence. This is retained as negative evidence, not a complete advisory
PoC or proof the affected dependency is safe.

## Tool and scope limits

The narrow current-tree secret inventory checked private-key headers, AWS access-key
ID formats and classic GitHub PAT format in tracked UTF-8 files below 2 MB. It wrote
only locations for any matches. No matches were found; other secret formats and
Git history remain untested.

Ruff initially inherited an external configuration, hence the separate explicit
baseline rerun. cfn-lint is schema/static checking, not AWS validation or Guard
execution. Python syntax checking did not require modifying source. GIS imports
created a local `__pycache__`, which was removed after the probe.
