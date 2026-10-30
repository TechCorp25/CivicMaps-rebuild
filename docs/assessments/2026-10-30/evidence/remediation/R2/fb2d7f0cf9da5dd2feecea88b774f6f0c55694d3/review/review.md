# Independent R2 corrected-deliverable recheck

Verdict: **blocked**. R2-E01 and R2-E02 are corrected at this candidate. Required current Context7 input remains unavailable, so full R2 acceptance cannot be granted.

Task: CivicMaps-rebuild remediation plan 1.0.0, R2 / A1–A5. Checker: GPT-6 Astra, low effort; fresh independent context with no inherited conversation. No builder reasoning, work diary or broad Empirical history was requested. Assessment documents were inspected as the deliverable under review, not treated as proof. The exact accepted R1 report was read solely to verify the status reference. Date observed: 2026-10-30 UTC; the enclosing work directory uses the plan's 2026-10-31 label.

## Frozen identity and integrity

- Candidate HEAD: `fb2d7f0cf9da5dd2feecea88b774f6f0c55694d3`.
- Candidate tree: `644d1cdaad6894cc2b62c79dc68b46a1f75440e3`.
- Product source/base: `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e` (the complete Git object ID; the task's shorter spelling resolves to this source).
- Source tree: `48e965ec9f7068ff0325173e608c8298913d84d4`.
- Input-manifest SHA-256: `dd385a1ebccb2f78302d3077d4e70d93f6afe8e6aebd51f65eee36d6f638ae3c` (`input-hashes.sha256`).
- Source and candidate product-tree inventories both SHA-256 `c1221e9b9cf62733d6fbf27fd670e7815b8baab04657d04634c53e9d2b2788fa`. These contain `git ls-tree -r` entries excluding only `docs/assessments/2026-10-30/`.

The checkout was clean before and after review. All 237 paths changed since product source are inside that assessment directory; `changed-files.txt` records them. No application, test, GIS source/data, infrastructure or dependency file changed. Evidence copies of scripts remain assessment artefacts, not application changes.

## Commands and observed results

Executed `git rev-parse HEAD HEAD^{tree}`, `git status --short`, `git diff --name-only SOURCE HEAD`, and independently compared full tracked product inventories. Read the neutral packet, acceptance criteria, protocol, current matrix/register, GIS inventory/validator, active GIS source and relevant raw evidence. Searched current/historical AUD-001 references and test coverage markers.

Executed `python3 docs/assessments/2026-10-30/evidence/remediation/R2/gis-offline-validation.py`: exit 0; output retained in `gis-rerun.log`. Executed `sha256sum -c` on GIS source hashes from repository root: all 16 entries passed. Executed `sha256sum -c SHA256SUMS` from each respective evidence directory: R2 33 entries, R1 aggregate 222 entries, accepted R1 review 129 entries and R1 corrective validation 19 entries all passed, exit 0. Raw verification logs accompany this report.

Searched the current callable tool inventory by name and description for Context7 / resolve-library-id / query-docs: zero matches. This is fresh availability evidence, not a retrieval attempt or a claim that upstream Context7 is generally unavailable. Cloud runtime status reported the current environment connected/running. No network fetch was necessary for this recheck.

## Targeted closure

**R2-E01 (medium): corrected.** Both active generators and the placeholder GIS domain now appear in A5 with source-to-check mapping. Independent source inspection confirms the road tool fetches live corridor GeoJSON, computes vertex-average centres, selects the first containing embedded zone and writes output; the Python command fetches both sources even in single-output mode. The retained output does not preserve the raw geometry/record linkage needed to independently recompute real assignments.

The reproduced validator reports 202 streets, 401 blocks, 13,193 number entries, 15 areas, 69 embedded zone vertices and 532 road assets. Its checks establish structure, coordinate plausibility, area-label correspondence and representative record presence. They do not establish actual address/road assignment accuracy. The revised documents explicitly disclose that limitation, missing raw snapshots/offline generator inputs, freshness/provenance limits and absent GIS CI coverage. This meets R2's requirement to account for the explicit GIS scope or identify its precise unverified portion. It does not satisfy future spatial qualification. No GIS defect is inferred from missing evidence. The helper's first axis-order failure is preserved rather than relabelled as a product failure.

**R2-E02 (low): corrected.** Current packet, matrix, register, report and checkpoint agree that R1 is accepted and AUD-001 closed. The register's immutable R1 report exists, names source `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`, returns pass for R1 only, and independently hashes to `6b4fa2dfa0c71fdb2b755ac454d1a971660f0fba93bed3d2caf6b913bded75e8`, exactly as cited. Earlier initial findings, corrective builder reports pending review, errata and frozen first-review observations remain historical records; their former open/recheck states do not contradict the current ledger. R2 does not duplicate or reopen AUD-001.

## Overall A1–A5 package and remaining limits

A1 records the exact source's 114 passing tests with zero skips, four sequential browser suites and separate actual Caddy fixture evidence. A2 records production/full zero-advisory reports and the fixed Vite declarations, but expressly lacks the plan-required current guidance. A3/A4 map authority, transaction, retry and race coverage to source/tests; the retained logs support the stated bounded test result. A5 now includes GIS alongside browser, provider and operational limitations. The package separates confirmed findings, hypotheses and unverified areas and does not assert exhaustive assurance from a green suite.

This was an independent evidence/deliverable recheck with fresh GIS reproduction and integrity/status checks, not a new full application security audit or rerun of the 114-test/browser/database suite. Existing logs were inspected and checksummed; no application tests were rerun because source is unchanged and this correction concerns assessment evidence. Actual spatial correctness, live providers, deployed privileges/operations, load and accessibility conformance remain unverified as declared. Hosted CI success was not independently verified here; any running workflow is not acceptance evidence and cannot replace A2.

No new confirmed product defect or additional deliverable correction was established. R2-E01/E02 may be closed as corrected. **Keep R2 blocked** until required current version-compatible Context7 evidence is supplied or the owner explicitly changes that requirement. R4/R5 acceptance cannot follow from this report. No source edits, commits, publication, merge or deployment were performed.
