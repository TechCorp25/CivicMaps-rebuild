Q4 task contract v1.0.0

### Q4 — Restore reliable GIS ingestion and reproducibility

Covers QA05, QA10, QA11 and QA12. Dependencies: no product-policy decision; sequence
after Q3 to maintain one work package in progress. No external regeneration required.

1. Declare supported Python and dependency versions using the repository's chosen
   reproducible dependency mechanism. Add an explicit isolated Ruff configuration.
   Correct the three baseline diagnostics; assess stricter rules separately.
2. Require street-name/approved-alias agreement. Put unmatched addresses into a
   review/unassigned collection with their source street and reason.
3. Replace vertex averaging with a documented geometry rule. Cover ring closure,
   resampling, concavity, holes, multipolygons, zone edges and overlap ties. Document
   how roads spanning more than one zone are represented.
4. Add JS fetch deadlines, shape checks, counted rejection reasons and atomic output
   writes. Preserve the existing good output on fetch/parse/validation failure.
   Python's existing HTTP deadlines must remain.

Acceptance: a fresh environment installs declared GIS dependencies; real geometry
fixtures reproduce then prevent the two observed assignment defects. Delayed/invalid
provider fixtures produce bounded failures and useful rejection totals without
overwriting existing output. Tests run offline in ordinary CI. Any later live-data
regeneration is a separately reviewed data change with provenance, counts, coordinate
bounds and representative street/zone comparisons; do not silently rewrite committed
datasets during these code corrections.


Constraints: offline synthetic fixtures only; no live provider/dataset regeneration, AWS mutation, merge/deploy. Preserve existing good datasets and provenance on failures. Tests executable under tests/, ordinary local/CI discovery. Full regression/browser/Caddy gates on materially affected final candidate. Reporttask/version,model/effort/freshcontext,exactbase/candidate,inputmanifest hashes,checks actuallyrun,findings severity/location/repro,unverifiedrequirements,limits,timestamp,verdict pass/changes_required/blocked. No hidden reasoning.
