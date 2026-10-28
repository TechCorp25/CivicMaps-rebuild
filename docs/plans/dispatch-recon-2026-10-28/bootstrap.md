# Session bootstrap receipt — 28 October 2026

Prepared for reconnaissance and the subsequent dispatch implementation session. No application code, existing development data, AWS resources or deployments changed.

## Ready environment

- Working checkout: `/workspace/work/dispatch-recon/current`, branch `codex/dispatch-recon-workplan-20261028`, application baseline `681ac555e2c24ff6a85af3d216872c8e0f0f4b10`. Documentation changes only above that baseline. The original `/workspace/CivicMaps-rebuild` checkout is unchanged.
- Node 24.19.0; npm 11.9.0; exact committed lockfile installed with `npm run setup` (238 packages). Vite 6.4.4 used in the final verification.
- PostgreSQL 15.18 extracted into the isolated work directory. New synthetic cluster at `/workspace/work/dispatch-recon/database/postgres`, loopback port 55448. Explicit migrations and both synthetic seeds passed. Existing clusters were not reset or reused.
- Session selectors: `source /workspace/work/dispatch-recon/session-env.sh`. This contains local paths and synthetic database connection only, no external credentials.
- Local API on 4100, CommandMAPS on 5173, Platform on 5174; started with `npm run dev`. They run only while this environment/process session remains alive. Restart with the commands below.
- System Chromium `/usr/bin/chromium` is usable for the existing map browser harness.

## Checks actually performed

| Check | Result |
|---|---|
| Exact-lockfile setup | Pass |
| `npm run check` | Pass: lint, format, both app typechecks/builds, 107 tests passed, zero failed/cancelled/skipped |
| `CIVICMAPS_CHROMIUM_EXECUTABLE=/usr/bin/chromium node tests/dispatch/map-review-browser.mjs` | Pass: readiness, auth-loss cleanup, map-mode transitions, cancelled address resolution, canonical pin tokens |
| Authenticated real local app visual inspection | Seeded dispatcher login; settled desktop and narrow screenshots captured using live local API. Google runtime key absent, so these document map-unavailable fallback, not live tiles. |
| Git whitespace | `git diff --check` passed before publication |

Full check output: [bootstrap-check.log](bootstrap-check.log). Screenshots: [desktop](rebuild-desktop.png), [narrow](rebuild-narrow.png). The full CommandMAPS/Platform/activation browser suites, live Google calls, preview runtime and native device tests were not executed in this recon. Synthetic map fixtures are not provider qualification.

## Reproduction and resumption

```bash
cd /workspace/work/dispatch-recon/current
source /workspace/work/dispatch-recon/session-env.sh
npm run db:start
# Already migrated/seeded: do not reset the cluster or replay bootstrap blindly.
npm run dev
```

In a separate shell, source the same selectors before checks. Use disposable test databases, as the existing harness does. Stop only the development process started here and, if desired, this cluster with `npm run db:stop`; do not stop other sessions' services. A new machine needs exact Node/npm/lockfile installation and PostgreSQL 15; the workspace paths are session-local selectors, not portable artifacts.

## Recovered setup limitations

Initial sandboxed Git access failed to reach the proxy and loopback binding was denied. Approved execution escalation allowed both, preserving the inherited proxy and credential configuration. Offline npm setup could not find Vite 6.4.4; an exploratory run with cached dependencies used Vite 6.4.3 and is not the final baseline evidence. Exact online setup and final checks superseded it. PostgreSQL 17 from prior environment preparation was not substituted for the required 15; isolated 15.18 and libraries were prepared instead. A local-file wireframe screenshot was blocked by browser policy; no wireframe screenshot or rendered-wireframe acceptance is claimed. The annotated source structure and local app screenshots support the documented comparison.

The configured projectless output path was absent and not writable on this executor. Durable deliverables are therefore published in this repository, rather than relying on an inaccessible local output folder.

## Independent planning assessment

Fresh GPT-6 Astra Low, `fork_turns=none`, passed the three planning documents at `e936b3af26e87401004cb0dbd60c78f331eff146`. [Report](independent-assessment.md). It did not assess this runtime receipt or claim implementation acceptance. Its low-severity reference-location observation was corrected subsequently; the original verdict remains pinned to its original candidate. The implementation workstream has not started.
