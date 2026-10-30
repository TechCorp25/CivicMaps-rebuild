# R2 deduplicated findings register

Product source reviewed: `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`. The report also responds to immutable R2 review `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e/review/review.md` (SHA-256 `6de266dc0c55323d90dc26be729df5d1b7b25d2b32cdb622213e0697771c53ec`). See `review-response-6de266dc0c55323d90dc26be729df5d1b7b25d2b32cdb622213e0697771c53ec.md` for the detailed response.

## Product findings

| ID | Severity | Owning goal | State | Evidence / disposition |
| --- | --- | --- | --- | --- |
| AUD-001 | Medium | R1 | **Closed under accepted R1** | GHSA-8g5g-mxqh-grgj affected Vite exactly 6.4.4; source candidate `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e` updates both root and CommandMAPS declarations to 6.4.5. R1 was independently accepted at that exact source. Immutable report: `../R1/92a2296ca126c9cfb20f0f1dcf1636cdf764e28e/review/review.md`, SHA-256 `6b4fa2dfa0c71fdb2b755ac454d1a971660f0fba93bed3d2caf6b913bded75e8`. Root checkpoint records R1 accepted and AUD-001 closed. This finding remains R1-owned; R2 does not reopen or duplicate it. |

No additional product defect was confirmed in the bounded R2 source/reproduction scope. No R3 product goal is instantiated.

## Resolved R2 audit-deliverable findings

| ID | Severity | State | Correction |
| --- | --- | --- | --- |
| R2-E01 | Medium | **Resolved in this R2 evidence revision** | A5 now inventories both active GIS tools, local outputs, placeholder domain, CI/test status, bounded offline evidence and exact spatial-assignment/source-data blockers. See `gis-tool-inventory.md`, the A5 GIS map in `coverage-matrix.md`, and validator/log pair. No product GIS defect is asserted. |
| R2-E02 | Low | **Resolved in this R2 evidence revision** | The AUD-001 row now states closed under R1 and cites the exact immutable accepted R1 report and its hash. Packet, report, checkpoint and register agree that R1 is accepted and AUD-001 is closed. |

These are corrections to the R2 assessment deliverable, not application defects and not R3 work.

## Unconfirmed hypotheses

- The API logs non-transient `error.message` to server stderr at `services/api/app.mjs`; no sensitive output was observed or reproduced in the synthetic checks. Production log collection/redaction/retention controls were not inspected. This remains an operational verification question, not a confirmed finding.

## Open coverage requirements and blockers

- **Context7 guidance supplied; independent validation pending:** current retrievals for all five required library families are documented in `context7-guidance-review.md`. Version mismatches are explicit: Express docs 5.2.0 vs installed 5.2.1; React docs 19.2.7 vs installed 19.2.0; node-postgres has no version tags; Vite docs are major v6; Playwright matches 1.58.2. Inspected usage follows the retrieved contract and no new defect was confirmed. The independent reviewer must decide whether the citations and version qualifications satisfy A2 before R2 can be accepted.
- **GIS spatial assignment and source provenance:** output structure and local coordinate fixtures were checked offline, but generated outputs do not retain point geometry or source feature IDs, raw source exports are absent, and active tools always fetch/write. Actual coordinate bounds, point-in-polygon membership, nearest-segment mapping, block/side accuracy, source freshness and licensing remain unverified. The precise limitation and evidence prerequisite are in `gis-tool-inventory.md`.
- **Accessibility conformance:** no axe/equivalent automated conformance suite was found. Keyboard/focus/narrow viewport browser flows are evidence for those paths, not a WCAG audit.
- **Live integrations/operations and hosted CI:** no AWS/provider/identity/map billing/production operation, deployment-target backup/restore, customer data, or hosted GitHub CI was exercised.
- **Scope:** this is a bounded source and offline-artifact audit, not a formal threat model, load test, deployed-role inventory, native/mobile audit, or exhaustive security assurance.
