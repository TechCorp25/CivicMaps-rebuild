# Q4 offline fixture preparation

This is a preparation artifact outside the product branch. It is not an accepted
implementation or a code change to CivicMaps. All features, road names, address
numbers, and coordinate values here are synthetic. The field names are shaped from
the current scripts and assessment findings; no City of Melbourne records or live
provider responses were downloaded or copied.

The fixture coordinates use GeoJSON `[longitude, latitude]` order and EPSG:4326.
They are fabricated near `144.960,-37.810` for axis-order realism. To make expected
geometry arithmetic exact and readable, the two zones form a 1-by-1 grid each after
subtracting that anchor and dividing both axes by `0.001` degrees. Those normalized
units are for fixture comparisons only. Production distances/areas must use a
documented metric or equal-area projection; do not interpret these degree squares as
metres.

## Current script interfaces

`geo-data/fetch-com-roads.mjs` consumes a GeoJSON `FeatureCollection`. It reads
`features[]`, `geometry`, and `properties.seg_descr` / `str_type`; the current zone
rings are local arrays of `[latitude, longitude]` converted to GeoJSON order in the
script. The current JS output is `{metadata, areas}`, with each area holding an
`assets[]` list.

`geo-data/generate_melbourne_cbd_street_blocks.py` consumes GeoJSON features with
street property aliases (`streetname`, `street_name`, `street`, `roadname`, `rd_name`)
and intersection aliases (`streetfrom` / `streetto`, `between_1` / `between_2`, and
related variants). Polygon/MultiPolygon road surfaces are converted to assignment
lines. The address JSONL provider fields are `str_name`, `street_no`, `longitude`,
`latitude`, and `suburb`; the script normalizes them to `street`, `street_no_raw`,
`street_no`, `lon`, `lat`, and `suburb`. Python output is `{metadata, streets}` with
optional `unassigned_addresses`; its split form adds `manifest.json`.

## Geometry fixtures and expected measurements

`geometry/zones.geojson` defines adjacent West `[0,1]×[0,1]` and East `[1,2]×[0,1]`
zones in normalized grid coordinates. `geometry/roads.geojson` includes:

- `square-basic` and `square-resampled`: the same closed square `[0.1,0.9]²`,
  including collinear samples along one edge. Both have area `0.64` and centroid
  `(0.5,0.5)`; closure/resampling must not change assignment.
- `concave-u`: a U-shaped polygon with area `0.475`; its area centroid is about
  `(0.5,0.45658)`, in the open notch and therefore outside the polygon. A centroid
  point is not a valid representative point for this case.
- `hole-center-in-void`: outer square `[0.1,0.9]²` and centered `[0.35,0.65]²`
  hole. Net area is `0.55`, area centroid `(0.5,0.5)` lies in the hole, and a
  representative point must lie in the polygon shell but outside the hole.
- `multipart-west-east`: two equal `0.09` components, one in each zone (combined
  area `0.18`). Processing only the largest component loses one component.
- `touch-only-east`: positive overlap with West is `0.18`; East is touched only at
  the shared edge and has zero area. A separate `boundary-line` has no polygon area.
- `equal-overlap-tie`: total area `0.6`, with `0.3` overlap in each zone. The chosen
  product representation needs a stable documented tie-break independent of zone
  input order.
- `unequal-cross-zone`: total area `0.72`; West overlap is `0.48`, East is `0.24`.
  This measures multi-zone membership. Before implementation, document whether output
  duplicates the road into both zones or stores one primary zone plus all overlap
  IDs; fixtures should assert the selected representation and never silently discard
  the secondary overlap.

## Street matching fixtures

`streets/corridors.geojson` has a synthetic `Wrong Street` corridor only `0.02`
normalized grid units wide around the first address. `streets/addresses.jsonl` requests
`Requested Street`; there is deliberately no exact corridor. The old global nearest
fallback would choose `Wrong Street` at essentially zero distance. The corrected
behavior should preserve `Requested Street` and place the address in an unassigned or
review result with a stable `street_name_unmatched` reason. Proximity must not replace
street identity.

A second row uses source street `St Kilda Road`, while the matching synthetic corridor
is `Saint Kilda Road`. `streets/approved-aliases.json` explicitly authorizes that one
normalization. It should assign only through that declared alias and preserve both
source and canonical names in provenance. An undeclared spelling should follow the
unmatched path.

## Provider payloads and atomic-output test recipe

`provider/` has one valid FeatureCollection, a valid empty collection, missing or
non-array `features`, a non-Feature entry, malformed geometry, malformed JSON text,
and mixed JSONL containing one valid row plus syntax/shape/value failures. A valid
empty feature list must be distinguished from a missing or malformed provider shape.

Delayed response-header and response-body cases require an ordinary local HTTP test
server; no live URL is involved. Serve the fixture bytes with controllable gates, then
verify the fetch aborts within the configured deadline. Before each failure test,
write sentinel bytes to a temporary target file; assert fetch, JSON parse, schema,
geometry-validation, and timeout failures leave those bytes unchanged. On a valid
payload, assert an atomic temporary-file rename publishes the complete new JSON.
Rejection totals should distinguish malformed JSON, wrong collection shape, invalid
feature/geometry, missing required properties, malformed JSONL, missing address
fields, and invalid coordinates rather than silently dropping input.

`fixture-metadata.json` is the machine-readable provenance index. Suggested next step
once Q3 is accepted: import these fixtures into executable tests under `tests/`,
including exact expected normalized coordinates and overlap areas; decide and document
one cross-zone representation before asserting final output shape. Do not regenerate
`geo-data/com_assets_by_area.json` or `geo-data/out/melbourne_cbd_street_blocks.json`
as part of these code fixes.
