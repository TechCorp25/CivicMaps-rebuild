# Repository Guidelines

## Project Structure & Module Organization

CivicMAPS is connected to TechCorp25/CivicMaps-rebuild. The reviewed integration branch is main; verify the remote state before each feature.

- `apps/`: runnable CommandMAPS and CivicMAPS Platform web apps; EnforcementMAPS web/mobile and public-portal scaffolds.
- `services/api/`: Express/PostgreSQL API, explicit migrations and synthetic seeds.
- `tests/`: executable integration and Playwright browser checks.
- `domains/`: responsibility-based modules, including identity, GIS, dispatch, evidence, and audit; read each module’s `README.md` before changing it.
- `_ds/`: design tokens, components, UI kits, fonts, and assets; preserve archive imports under `_ds/imports/`.
- `docs/`: architecture records, workflows, wireframes, and naming decisions.
- `data/`: raw, staging, curated, reference, schema, and synthetic-fixture areas.
- `geo-data/`: GIS processing scripts, source datasets, and generated output.

## Build, Test, and Development Commands

Use the Node version in `.node-version` and npm version in the root manifest. From the root:

- `npm run setup`: install exactly the committed lockfile without package scripts or executable links.
- `npm run db:start`, `npm run db:migrate`, `npm run db:seed`: start a dedicated PostgreSQL instance, migrate and seed synthetic data.
- `npm run dev`: run API (4100), CommandMAPS (5173) and Platform (5174).
- `npm run dev:platform`: run API and Platform only.
- `npm run check`: lint, check formatting, typecheck/build both web apps and run integration tests.
- `npm run test:browser`: exercise CommandMAPS against a running seeded environment.

See `docs/development/local-build.md` for configuration and Linux x64 wrapper requirements. Other app/domain scripts invoking the absent `scripts/stub-task.mjs` are placeholders, not validation. CI covers implemented root scripts only.

Available GIS commands, run from `geo-data/`:

- `node fetch-com-roads.mjs`: fetch Melbourne road corridors and write `com_assets_by_area.json`.
- `python3 generate_melbourne_cbd_street_blocks.py --single --outdir out`: generate consolidated street-block data. Requires `orjson`, `requests`, `shapely`, `rtree`, and `tqdm`.

These commands access external data and write output; review destinations before regeneration.

## Coding Style & Naming Conventions

Match nearby files: two-space indentation in JSON/JavaScript and four spaces in Python. Use descriptive `kebab-case` module directories and `snake_case` Python identifiers. Write documentation and UI copy in Australian English. Preserve CivicMAPS, CommandMAPS, and EnforcementMAPS naming; avoid `cmaps`. Use design tokens rather than raw component colours. Run `npm run format` for implemented application code and `npm run lint` for semantic checks. The explicit scope excludes archives, generated tokens and scaffolds; see `docs/development/local-build.md`.

## Testing Guidelines

The root suite uses Node’s test runner and disposable PostgreSQL databases; browser checks use Playwright. Never reset development or production data. No coverage threshold is established. Keep test data synthetic in `data/fixtures/`. For changes, document the exact checks performed and their limitations; GIS validation should check output structure, coordinates, and representative street assignments.

## Future Commit & Pull Request Guidelines

Follow `docs/plans/civicmaps-platform-assessment-and-autonomous-plan.md` and its ledger. Keep one feature in progress, use a fresh branch, record evidence, push and verify its SHA, update Empirical and open a draft PR for owner review. State stacked branch dependencies explicitly. For the F11 continuation, follow the owner-authorised sequence below; older draft-only restrictions are superseded. Keep changes focused and provide a concise change summary, validation results, relevant document references, and screenshots for visual changes.

## Agent & Configuration Instructions

Query Empirical before substantive work; record meaningful completed work there with explicit authorship. Never store secrets. Current user authorisation takes precedence over historical governance boilerplate. Continue authorised implementation in the existing stack; resolve concrete D01–D06 product/provider decisions at the feature that needs them. Do not infer a production boundary from the local build.

Record recurring gotchas in Empirical with symptom, cause, verified fix and prevention, tagged with this project and feature. Check these notes on resumption. Add useful why-comments using the language’s syntax (`//` or `/* */` in JS/TS; `#` in shell/Python), rather than narrating obvious code. Keep relative documentation links current. Lint and formatting are enforced by `npm run check` and CI. Keep React Hooks dependency checks enabled.

## Next F11 execution assignment (owner instruction, 20 October 2026)

Read `docs/plans/F11-next-phase-build-plan.md` and `docs/plans/F11-execution-checkpoint.json` before continuing. Builder is GPT-6 Luna Medium; independent auditor is GPT-6 Astra Low. Follow `docs/plans/independent-product-audit-protocol.md`: fresh auditor context, no inherited conversation or builder reasoning/CoF/working notes; task requirements and resulting product only. No audit has occurred merely because a plan is present. Preserve separate governance PR25 ownership.

## Required development lifecycle (owner instruction, 20 October 2026)

Plan → build → test → update docs and Empirical → push to Git → independent assessment → merge → deploy → plan next phase. Follow the gates in `docs/plans/F11-next-phase-build-plan.md`; do not stop at draft publication when execution is authorised. Merge and deploy only the tested, independently assessed product using the established release procedure. Preserve separate governance ownership.

All new tests belong in the appropriate `tests/` subdirectory. Create missing directories and executable tests, commit them, and wire nested test discovery into local commands and CI. Scratch-only tests, placeholders and zero-test runs do not satisfy acceptance.

## Current bounded phase — owner instruction, 22 October 2026

Use `docs/plans/dispatch-build/next-build-phase.md` and its checkpoint as the current run contract. GPT-6 Luna Medium implements M1 discovery and prepares G1 authority contract; fresh GPT-6 Astra Low audits each frozen goal with no inherited builder context. The current phase excludes G2, M2–M7, merge and deployment, superseding the broader historical lifecycle instructions above for this run. Finish P0 publication before the owner model switch; no implementation during preparation. Preserve M0 architecture-only acceptance and merged governance ownership.

## Current dispatch map implementation override — owner instruction, 27 October 2026

The user has authorised the map-centred dispatch dashboard and Places API (New) implementation to proceed on the verified rebuild baseline. Q3–Q7 quality remediation is a parallel workstream, not an implementation gate; preserve separate remediation ownership. Reuse the existing preview Maps key only through protected runtime configuration, and never store its value in Git, logs or Empirical. This task authorises implementation, synthetic qualification, publication and draft review preparation; merge and deployment are outside this authority. Treat older preparation-only/no-implementation and remediation/provider-development-gate text as superseded for this feature. Actual provider restrictions/billing qualification and live-call evidence remain distinct from synthetic acceptance.
