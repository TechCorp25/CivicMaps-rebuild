# Neutral R5 acceptance packet — CivicMaps-rebuild PR #52

Status: **pending independent review**. This packet is a review contract, not a verdict. Goal: R5 — completion and handoff, remediation plan v1.0.0.

## Frozen identities

- Accepted integrated product source: `d02cbe02f13ea3476d805dc27cfc72185eb9119f`.
- R4 accepted report: `../R4/d02cbe02f13ea3476d805dc27cfc72185eb9119f/review.md`.
- R4 product manifest: `../R4/product-tree-manifest.sha256`; SHA-256 `de7adfb6af773d9c1059e99e6da30875a2db6eae2e522b7a65f3ca666a27036e`; 573 tracked product files.
- R5 documentation candidate: fill with the exact commit SHA containing this packet after it is committed. The independent report must state both this candidate and the product source SHA above. Verify documentation-only changes did not alter the accepted product tree.
- Baseline: `b168dc0ce2b3d28011588b497e8e6fc459c2aa6a`.
- Plan version: 1.0.0; source requirements: `../../../remediation-plan.md`, with authoritative current state in `../../../remediation-checkpoint.json` (coordinator-owned; use as supplied, do not modify from this assessment).

## Neutral request

“Assess this handoff against the task and constraints below. Determine correctness independently. Inspect the pinned product and handoff evidence, verify hashes and links, and reproduce checks where possible. Do not infer intent or rely on builder claims.”

## Allowed review inputs

Use this task contract, the exact accepted goal reports and their frozen evidence, the R4 assessment target/product at the pinned source SHA, and the three R5 handoff deliverables:

- `final-register.md`
- `evidence-index.md`
- `resumption-release-handoff.md`

Verify this packet and its accompanying checksum file. Exclude builder conversations, reasoning traces, diaries, self-evaluations, scratch, and broad Empirical agent history. Treat handoff prose as an assessment target, not proof. Do not change source, reports, evidence, PR state or the authoritative checkpoint.

## Acceptance criteria

1. The final register and evidence index include every goal R0–R5 and the R3.n family, each with exact product source SHA, report path/verdict, dependencies, and verification evidence/links. Distinguish source/product identity from documentation/candidate commits.
2. AUD-001 maps to accepted R1 at `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`; R2 is accepted at its recorded candidate with product source SHA stated in its report; R3 is not applicable based on accepted R2 evidence.
3. R4 is accepted at exact product candidate `d02cbe02f13ea3476d805dc27cfc72185eb9119f`. Its independent report and evidence demonstrate the 573-file manifest identity and both successful exact-candidate hosted workflow runs: `41052458962` and `41052458823`.
4. Every local path exists and resolves to the intended evidence; external verification URLs resolve to the recorded GitHub Actions run IDs. Supplied hashes validate in their intended directories. The final product tree matches the accepted/assessed R4 manifest.
5. R5 status remains pending unless this fresh independent review produces a supported pass. The documents do not claim R5 acceptance or overall completion. PR #52 remains draft; no merge/deployment is represented as authorised or done.
6. Preserve these external limits explicitly: GIS spatial accuracy, public TLS issuance, live providers/billing, production operations, accessibility conformance, historical Context7 transcripts and host installation limits.

## Verification procedure

Start a fresh GPT-6 Astra Low context (`fork_turns="none"`); if freshness/model cannot be enforced, record blocked. Independently:

1. Record the exact R5 documentation candidate and verify clean checkout, packet checksum, R4 evidence checksums and 573-entry manifest.
2. Check all referenced files, SHA values, goal report verdicts and dependency claims against the immutable checkpoint/reports. Confirm R2's candidate and distinct product source SHA from its report, rather than assuming they are identical.
3. Verify both run URLs resolve to the exact run IDs and corroborate success/candidate correspondence using R4 report and hosted metadata if available. Confirm the merge tree described by R4 matches the R4 product tree.
4. Compare product files/tree for R4 source and R5 documentation candidate; report any product delta. The packet's claim is limited to the declared manifest scope.
5. Return verdict `pass`, `changes_required` or `blocked`, with model/effort, fresh-context declaration, input manifest/hash, commands/results, findings, unverified requirements and limits. Store immutable report at `evidence/remediation/R5/<exact-documentation-candidate-sha>/review.md`, with report checksum. Acceptance requires a supported pass.

Do not run new product suites merely to restate R4 results; evaluate their preserved exact-candidate records. R5 is a documentation and evidence reconciliation goal.
