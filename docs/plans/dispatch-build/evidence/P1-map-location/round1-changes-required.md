# Independent P1 assessment

Verdict: **changes_required**

Candidate: `6c908e323e71c4a58b8229498c94a001732bd4ac`
Base: `d34cf9fd692fabc24d17ff1a9657be9b724d620f`
Assessed: 27 October 2026. Fresh auditor context; no Empirical notes or builder reasoning consulted. Frozen checkout was not modified.

## Findings

1. **P1 completion overstates the concrete provider decision delivered.** `map-location-dashboard-p1-checkpoint.md:3` declares P1 contract/readiness discovery complete, but lines 56 and 65 defer the configuration and cost review itself. The plan's P1 exit requires a recorded provider configuration decision, and the user's Google selection is conditional on concrete review. The product offers accurate illustrative pricing and a useful checklist, but does not select a proposed integration path (Maps JavaScript API / Places API New / reverse-geocoding boundary), state proposed field masks/session lifecycle, give exact proposed allowed origins, or recommend numerical quotas/limits tied to a usage scenario. Those design decisions can be made reviewable without creating resources or spending money. Add a concrete proposed configuration with explicit unresolved owner/project facts and justified usage assumptions, and identify P1 as partial/blocked until its required decisions are resolved. Do not imply that read-only configuration discovery requires provisioning approval.

## What passed

- Exact local candidate identity verified; changes against base are two documentation files only.
- Source claims checked against RequestComposer, main, API create/query code, foundation migration, `.env.example`, and CommandMAPS manifest. Manual coordinates, 100-row pagination, scoped request creation, finite/range checks, audit and idempotency seams are supported. No map dependency is present in the inspected app manifest.
- GIS and dispatch domain READMEs and shared-service contracts inspected. The GIS ADR prerequisite and preservation of dispatch authority/retry are represented correctly.
- Quality ledger supports Q1/Q2 acceptance, Q3 awaiting fresh acceptance and Q4–Q7 outstanding. It does not establish a reconciled accepted implementation baseline; checkpoint appropriately prohibits feature implementation before that gate.
- Provider spending, keys, live calls, customer disclosure, merge and deployment are correctly excluded.
- Official Google pricing and session-pricing excerpts independently retrieved through web search (search ID `search_7117e0d0e377b858a8ff905025072b07`). Published Dynamic Maps $7, Autocomplete Requests $2.83, Place Details Essentials $5 and Geocoding $5 per thousand with 10,000 monthly free caps support the illustration. Arithmetic $70 + $84.90 = $154.90 is correct. Essentials-terminated New sessions bill up to the first 12 autocomplete requests and the terminating details request. This is a conditional pay-as-you-go illustration, not an approved operational budget. The final configuration should explicitly bind these assumptions to Places New, Essentials fields and valid session-token handling; clarify shared billing-account allowances rather than rely on the ambiguous 'account/project as applicable'.

## Checks and limitations

- `git rev-parse HEAD`, `git diff --stat BASE HEAD`, source reads/searches and `git status --porcelain` completed; checkout clean.
- `git diff --check BASE HEAD` reports a non-substantive extra blank line at plan line 109; no application suites run for this documentation-only product.
- The referenced plan commit `b40ed560f5129483d0e2690bba0ffd5141d2b84a` is not available in this local object database. Assessed the plan contained in the frozen candidate; its SHA-256 is `ab9ca461013992472fad7e8602417fa3974d0e02139ef9e1d1ed24bc02dbbd63`. Root should verify this matches the published pinned plan before final acceptance. This is an evidence-access limitation, not proof the published pin is wrong.
- Direct curl retrieval failed because the configured proxy was unavailable; official-page web search excerpts supplied pricing evidence. No Google console, billing project, keys, credentials, or actual usage were inspected. Current remote remediation receipts were not independently fetched.

## Allowed next action

Continue P1 documentation and read-only reconciliation: establish current accepted remediation receipts; draft the concrete Google configuration and usage/cost proposal, resolve the applicable GIS ADR and explicitly identify facts needing owner input. Re-freeze and assess the revised P1 product. Provider configuration/cost approval and quality acceptance remain separate prerequisites; no feature code, provider provisioning/spend, operational location disclosure, merge or deployment is authorised by this assessment.
