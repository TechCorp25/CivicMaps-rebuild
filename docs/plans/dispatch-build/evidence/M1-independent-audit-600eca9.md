# M1 independent audit — candidate `600eca9`

**Verdict: blocked pending runtime verification.** The independent source review identified no blocking product defect, but required runtime, browser, screenshot, and keyboard acceptance did not execute.

| Field | Value |
|---|---|
| Repository | `https://github.com/TechCorp25/CivicMaps-rebuild` |
| Branch | `codex/civicmaps-dispatch-m1` |
| Candidate | `600eca9cec38d65d605965842f540e8c9045379a` |
| Candidate tree | `f3a169da01ab70639dcaead315c5a7d062fb0dde` |
| Base | `d4921eb1c37550d9ca1b53a5615242922abfa4ad` |
| Requirements | Phase plan SHA-256 `2d0ec0e5d94b69740d5839bbbbd4d89084bc8f802bceb82726aba39ae9fe8eec` |

## Independent source assessment

The isolated assessment reviewed the M1 requirements, changed API/client/tests, current reference matrix and milestone, authorization wrapper, CI wiring, and S7 annotations. The reviewed source covers parameterized literal search, authorized first-page counts, explicit cursor loading, ID deduplication, independently retrieved detail, response-generation guards, officer restrictions, and `ADMIN` exclusion. The assessor found no blocking source defect. These source observations do not substitute for runtime acceptance.

Static gates passed using the lock-matching dependencies from the candidate worktree:

```text
cmp package-lock.json /workspace/work/civicmaps-m1/package-lock.json
rm node_modules
ln -s /workspace/work/civicmaps-m1/node_modules node_modules
npm run lint && npm run format:check && npm run typecheck && npm run build
```

Environment: Node `v24.19.0`, npm `11.9.0`, Vite `6.4.4`. Both application typechecks and builds passed. Dependencies were reused; no fresh install was performed.

## Blocked runtime evidence

The exact-candidate integration attempt was:

```text
node --test tests/foundation.test.mjs
```

It reported 14 tests, 0 passed, 14 failed, 0 cancelled, and 0 skipped. All failures were shared setup failures from `ECONNREFUSED 127.0.0.1:55432`; they are not demonstrated product-test failures.

The exact-candidate CommandMAPS browser attempt was:

```text
npm run test:commandmaps:browser
```

It first returned `EPERM` in the sandbox; with local TCP permission it returned `ECONNREFUSED 127.0.0.1:55432` at `tests/helpers/environment.mjs:52`, through `tests/browser-commandmaps.mjs:9`, before browser scenarios ran. Platform and activation browser suites were not run. No screenshots were generated or inspected; keyboard checks were not executed.

The assessor confirmed `git diff --exit-code` in its isolated checkout. The initial exploratory `npm run check` used a nonmatching Vite `6.4.3` dependency tree and is excluded from acceptance evidence; the listed static gates were rerun with Vite `6.4.4`.

Setup diagnostics from the primary workspace: `docker start civicmaps-test-pg` returned “No such container”; `CIVICMAPS_DATA_DIR=/workspace/.civicmaps-local npm run db:start` failed with `/usr/lib/postgresql/15/bin/initdb ENOENT`; an attempted connection to the configured endpoint was refused. The supplied client utility directory contains client tools but no PostgreSQL server binaries.

## Assessment limitation and next action

The current milestone document contained historical verdict and check-count prose. The assessor encountered that prose while inspecting the requested product document, disclosed the exposure, did not open any prior audit report or handoff receipt, and did not rely on those claims as evidence. This is recorded as a limitation on the verdict-blind process.

Restore a disposable PostgreSQL service, then rerun `npm run check`, `npm run test:commandmaps:browser`, `npm run test:platform:browser`, and `npm run test:activation:browser` against the exact frozen candidate. Inspect newly generated desktop and narrow screenshots and keyboard operation. Setup failure or skipped suites do not satisfy acceptance.
