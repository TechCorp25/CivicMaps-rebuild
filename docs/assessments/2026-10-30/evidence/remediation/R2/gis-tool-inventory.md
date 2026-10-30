# Active GIS tool inventory and verification limits

Reviewed against product source `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`. File/source hashes are in `gis-source-hashes.sha256`; offline-only validation code and output are `gis-offline-validation.py` and `gis-offline-validation.log`.

## Active tools and data

| Entry | Source and behaviour | Available validation / limitation |
| --- | --- | --- |
| City road-corridor by-area generator | `geo-data/fetch-com-roads.mjs` embeds 15 patrol zone rings, fetches the City of Melbourne road-corridor GeoJSON export, computes a vertex-average center for each road polygon and assigns each parsed asset to the first containing zone. It deduplicates by area/name/between/off and writes `com_assets_by_area.json` to the current working directory. | No offline input parameter, fixture/test entrypoint, or automated root/CI check. Running it always fetches external data and writes output. Existing `geo-data/com_assets_by_area.json` has 15 areas, 532 assets, and `metadata.generated=2026-03-02T07:44:56.587Z`; it contains no source feature IDs or geometry. |
| CBD street/block/side assignment generator | `geo-data/generate_melbourne_cbd_street_blocks.py` fetches City road-segment GeoJSON and street-address JSONL, extracts corridor centerlines, uses Shapely/Rtree nearest-segment matching and a 60m threshold, and infers block and side from street names, bearings and offsets. `--single` still fetches both endpoints; it only changes output form. The script writes under `--outdir` (default `geo-data/out`) and may split files or include unassigned rows. | No local source fixture/input mode, no committed GIS-specific automated tests, and no CI command. Existing `geo-data/out/melbourne_cbd_street_blocks.json` stores street/block/side/number summaries and source URLs, but not original address coordinates, source record IDs or selected segment geometry. It has no generated-at/source-version field. |
| GIS domain package | `domains/gis-operations/README.md` and `package.json` explicitly mark the package a repository-foundation placeholder pending an approved ADR. Its build/lint/test/typecheck scripts call `scripts/stub-task.mjs`; `src/` and `tests/` contain only `.gitkeep`. | No implemented domain service or GIS test. The stubs are not validation of the two active `geo-data/` tools. |
| Small local data files | `geo-data/data/zones.json`, `parking-zones.json`, `streets.json`, and `street-numbers.json` contain small coordinate/name/range examples. | Bounded shape/range checks passed. Their shapes and values do not include the source road/address records consumed by either generator, so they cannot validate actual generated assignments. |

The Python script imports `orjson`, `requests`, `shapely`, `rtree` and `tqdm`, but `geo-data/package.json` supplies no Python dependency manifest. Neither active GIS command is wired into root `npm run check`, GitHub CI, or `domains/gis-operations`.

## Bounded offline validation performed

The included stdlib-only validator read committed JSON and the embedded zone coordinate list. It did not import the GIS dependencies, contact either external endpoint, invoke either generator, or write product data.

- Address/block output: 202 streets, 401 blocks, 13,193 assigned positive integers; all block keys and side labels had the expected shape, all number arrays were sorted and unique, and there were no empty groups or `unknown` side groups. A representative `A'Beckett Street / Elizabeth–Queen` record had populated north/south number lists.
- Road output: 15 generated areas matched the 15 names embedded in the fetch script; 69 embedded zone coordinate vertices fell inside a broad Melbourne CBD coordinate guard; 532 assets had nonempty names and recognized type labels; there were no duplicate area/name/between/off signatures. The artifact metadata timestamp parsed successfully.
- Local examples: 15 zone polygons, one parking polygon, two street examples and one number range passed basic shape, numeric-coordinate, broad Melbourne-region and range checks. These are local examples, not source exports.

The first validation-helper run interpreted the embedded `[latitude, longitude]` tuples as `[longitude, latitude]` and rejected the embedded coordinate guard. This was a checker-script axis-order mistake, not a product-data result. That run is retained as `gis-offline-validation-axis-order-attempt.log`; the corrected script and successful rerun are the acceptance evidence.

## Precisely unverified GIS criteria and blocker

Actual spatial assignment correctness remains unverified: the retained generated outputs do not contain the input coordinates, raw feature IDs, selected segment geometry, or zone-intersection evidence needed to recompute point-in-polygon or nearest-segment decisions. The repository has no local snapshot of the road-segment, road-corridor or street-address exports and no offline input mode for either active generator. Therefore the local examples and structural representative records cannot establish that a given real address/road is assigned to the correct zone, street block or side, or that it falls within the claimed CBD/distance bounds.

Source freshness, current endpoint schema, upstream completeness, licensing/provenance, overlap/no-zone cases, multi-part geometry handling, street-name fallback accuracy and side-inference accuracy also remain unverified. The road asset snapshot is dated 2026-03-02; the address/block artifact has no generation timestamp or source-version identifiers. This audit did not run the scripts because each necessarily fetches live City data and writes generated output, outside the requested bounded offline scope. A future acceptance check needs owner-approved source fixtures or an approved read-only fetch with outputs directed to scratch, plus GIS-specific tests for output structure, coordinate limits and representative assignments. No product GIS defect is asserted from the current evidence.
