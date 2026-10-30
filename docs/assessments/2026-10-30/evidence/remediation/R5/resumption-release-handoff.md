# R5 resumption and release handoff

## Current verified state

- Remediation plan: v1.0.0. The authoritative checkpoint is maintained by the coordinator and is intentionally not changed in this handoff branch.
- Accepted product: exact R4 candidate/source `d02cbe02f13ea3476d805dc27cfc72185eb9119f`.
- R4 report: [candidate-keyed independent assessment](../R4/d02cbe02f13ea3476d805dc27cfc72185eb9119f/review.md), verdict accepted. It verifies 573/573 product manifest entries and matching candidate tree.
- Hosted CI succeeded on that exact product: [run 41052458962](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/41052458962) and [run 41052458823](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/41052458823).
- R1 accepted; AUD-001 closed. R2 accepted. R3.n not applicable because no additional product defects were confirmed. R5 is pending and has no independent report.
- This branch is documentation-only. Keep PR #52 draft. No merge or deployment is authorised.

## Fresh Astra R5 assessment instructions

Create a clean, fresh GPT-6 Astra Low context (`fork_turns="none"`) with no builder conversation, reasoning, diary, self-evaluation or broad Empirical history. Provide only the neutral packet, frozen authoritative acceptance requirements, relevant result product and integrity manifests. Ask the reviewer to assess independently, reproduce checks where possible, and not rely on builder claims. Do not characterize this handoff itself as the verdict.

Freeze and record both identities distinctly:

1. **Product source SHA:** `d02cbe02f13ea3476d805dc27cfc72185eb9119f` — the exact R4 assessed product.
2. **R5 documentation candidate SHA:** the commit that contains these handoff files, obtained after commit with `git rev-parse HEAD`; verify its product tree equals the R4 source's product tree. The R5 review must cite both SHAs and must not treat later unreviewed product changes as covered.

Before review, verify every supplied file checksum using the intended directory and confirm the packet checksum file itself. The R4 report's 573-entry manifest digest is `de7adfb6af773d9c1059e99e6da30875a2db6eae2e522b7a65f3ca666a27036e`; recompute/compare the product tree under the manifest's declared rules against `d02cbe02f13ea3476d805dc27cfc72185eb9119f`. Record exact commands and results, files actually inspected, hashes, findings, unverified criteria and limits. Preserve any prior report unchanged; store a new report under the exact R5 candidate key.

The reviewer should determine whether the final register, acceptance reports, evidence index and resumption/release handoff accurately map every goal to source, report, verdict, dependencies and verification evidence; verify AUD-001 maps to R1; confirm R2 accepted, R3 not applicable, R4 accepted at the exact candidate with the two successful hosted runs; verify product manifest identity; and confirm no false R5/overall-completion claim. R5 acceptance depends on an independent pass. A blocked assessment is not a pass.

## Limits to carry forward

Retain the accepted R4 report's explicit boundaries: true GIS spatial accuracy was not established; local Caddy HTTP fixtures do not prove public TLS issuance; live provider calls and billing were not qualified; production operations were not exercised; accessibility conformance is not exhaustive; historical Context7 retrieval transcripts are not retained; and host package installation was constrained (system dependency installation encountered unavailable `su` authentication, while locked Playwright Chromium and browser suites succeeded). Do not broaden the accepted test evidence beyond its report.

## Release state

PR #52 remains draft for owner review after coordinator reconciliation. This packet does not authorise merge, deployment, or changing PR state. The coordinator is the sole publisher and owner of authoritative checkpoint updates. If owner-controlled release authority is later granted, that release must use its separate tested procedure and record the exact merged/deployed artifact identities; no deployment or production status is implied here.
