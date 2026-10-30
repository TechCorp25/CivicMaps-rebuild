# GIS offline-validation attempt record

The first stdlib-only validator run checked the embedded `fetch-com-roads.mjs` zone coordinates as `[longitude, latitude]`. The source stores those pairs as `[latitude, longitude]`; this mistake produced 69 guard failures. The full initial output is retained at `gis-offline-validation-axis-order-attempt.log` and is not counted as a product failure.

The validator was corrected to read the stored axis order and rerun read-only. `gis-offline-validation.log` records exit 0, output counts, coordinate/fixture results and stated limits. Both runs read only repository-local source/data and made no external requests or product-data writes.
