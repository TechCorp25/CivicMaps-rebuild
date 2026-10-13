# Repository Guidelines

## Project Structure & Module Organization

CivicMAPS is a local build project, currently unconnected to any Git repository. Historical repository references in documents are background, not a configured upstream.

- `apps/`: CommandMAPS, EnforcementMAPS web/mobile, and public-portal scaffolds.
- `domains/`: responsibility-based modules, including identity, GIS, dispatch, evidence, and audit; read each module’s `README.md` before changing it.
- `_ds/`: design tokens, components, UI kits, fonts, and assets; preserve archive imports under `_ds/imports/`.
- `docs/`: architecture records, workflows, wireframes, and naming decisions.
- `data/`: raw, staging, curated, reference, schema, and synthetic-fixture areas.
- `geo-data/`: GIS processing scripts, source datasets, and generated output.

## Build, Test, and Development Commands

There is no root package manifest or established application development server. App/domain manifests expose `build`, `lint`, `test`, and `typecheck`, but these invoke the absent `scripts/stub-task.mjs`; they are placeholders, not runnable validation.

Available GIS commands, run from `geo-data/`:

- `node fetch-com-roads.mjs`: fetch Melbourne road corridors and write `com_assets_by_area.json`.
- `python3 generate_melbourne_cbd_street_blocks.py --single --outdir out`: generate consolidated street-block data. Requires `orjson`, `requests`, `shapely`, `rtree`, and `tqdm`.

These commands access external data and write output; review destinations before regeneration.

## Coding Style & Naming Conventions

Match nearby files: two-space indentation in JSON/JavaScript and four spaces in Python. Use descriptive `kebab-case` module directories and `snake_case` Python identifiers. Write documentation and UI copy in Australian English. Preserve CivicMAPS, CommandMAPS, and EnforcementMAPS naming; avoid `cmaps`. Use design tokens rather than raw component colours. No project-wide formatter is configured.

## Testing Guidelines

No executable test suite, framework, or coverage threshold is established in this checkout. Keep test data synthetic in `data/fixtures/`. For changes, document the exact checks performed and their limitations; GIS validation should check output structure, coordinates, and representative street assignments.

## Future Commit & Pull Request Guidelines

Git commits and pull requests do not currently apply. No commit convention can be established from local history. Keep changes focused and provide a concise change summary, validation results, relevant document references, and screenshots for visual changes.

## Agent & Configuration Instructions

Query Empirical before substantive work; record meaningful completed work there with explicit authorship. Never store secrets. Follow module architecture approval requirements before selecting frameworks, databases, identity providers, or deployment boundaries.
