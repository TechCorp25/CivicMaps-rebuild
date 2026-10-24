# PR42 targeted closure and product coherence reassessment

Task/version: closure of this auditor's F1/F2 on contract v1.6 and phase plan v1.1.3, against the same commissioning and documentation requirements supplied 24 October 2026.
Auditor: GPT-6 Astra, low effort. This is a targeted closure plus coherence reassessment in the original independent auditor context, originally created with fork_turns=none. It is not a fresh initial full audit. The auditor retained its own F1/F2; no builder rationale, builder conversation, scratch notes, broad Empirical notes or other prior audit reports were read. Operational documents were assessed as product targets only.

Candidate: 4ab717cd51a9a122799fc500ea0b5977e7008637
Tree: dd07e6e0a4d5b4f95a8ca86611d948d5415eb0db
Repository baseline: 2a20b81cc7c67f90a8063d66acddac303bd0c845
Closure comparison: 717885cf684a5c856367c9965575fb32054497a8, tree e59a36c0118718488fc68c12f8e4de45a236ed20.
Remote identity was supplied as verified by the task; local detached HEAD/tree independently match. No independent remote fetch was performed.

## Verdict

**pass** for targeted F1/F2 defect closure and scoped documentation coherence. No remaining blocking defect was found within this reassessment scope. **G1 goal acceptance remains blocked** on owner decisions. This pass does not accept G1, approve trust roots/customer appointments, authorise G2/provisioning, merge or deployment, or certify implemented runtime behaviour.

## Closure evidence

**F1 (High) — closed.** Contract line 89 now requires external admission/provenance of the independent council approver, separate proofing of that person's identity and authority, issuance of a one-use council/record/payload/version/nonce/expiry-scoped setup credential, and the approver's explicit signed or strongly authenticated decision. The approver must differ from requester, every appointment subject and both privileged operators. The setup verifier checks this decision; the transaction rechecks proofs/approvals before pending creation, and activation rechecks them again. Line 91 binds retries to the same approval and invalidates failed/revoked setup work without creating usable roles. The API row at 99, schema at 128 and required verification inventory at 142 reflect these controls. The original reproduction with a named but inactive approver is now explicitly rejected.

This path requires no ordinary staff session; it uses the external setup-only proof/approval and separate Q07 privileged operator boundary. General operator endpoints remain separately authenticated (lines 95 and 108). The external source/admitter and approver authentication policy remain unresolved owner choices, rather than being supplied by the owner's personal MFA receipt. The proposed sequence is therefore noncircular without pretending these owner decisions are resolved.

**F2 (Medium) — closed for version/status provenance.** The canonical checkpoint now marks P0 audit_pending_amendment, explicitly identifies accepted v1.1.1 and pending v1.1.3 separately, and binds the amendment hash. G1 identifies the reviewed v1.5 candidate 717885cf… separately from correctedContractVersion=1.6 and pending publication/reassessment. F11 checkpoint, feature ledger and manifest distinguish historical versions/candidates from current amendment fields. Current plan hash bindings match the actual file. Prior v1.3 candidates are explicitly labelled priorV13 rather than assigned v1.6. Neither the prior P0 pass nor the G1 finding is represented as a pass for the new product.

Publication receipts remain deliberately pending in the frozen files; this is a publication bookkeeping limitation, not an assertion that the current content has been accepted. The exact reviewed content is pinned by this report's candidate/tree and hashes. A later publication/status receipt must retain this scope and must not turn defect closure into G1 acceptance.

## Checks actually executed

- Inspected manifest-restricted diffs from the original reviewed candidate, including full changed commissioning sequence/API/schema/inventory and current/historical status fields. Rechecked unchanged owner receipts/test inventory by content hashes and original review context. No other audit reports were opened.
- `git rev-parse HEAD HEAD^{tree}`: exact candidate/tree match.
- `git status --porcelain`: empty; product unchanged.
- `git diff --check 2a20b81cc7c67f90a8063d66acddac303bd0c845 HEAD -- <explicit input manifest>`: exit 0.
- Python JSON parser using duplicate-rejecting object_pairs_hook on all four target JSON files: pass, no duplicate keys.
- Independently computed SHA-256 for all input files below. Six current plan bindings checked by assertions: canonical checkpoint plan hash, manifest hash, checkpoint P0 amendment hash, F11 checkpoint current amendment hash, ledger nextBuildPhase plan hash and ledger dispatchBuildProgramme currentPlan hash. All equal 618a5555f94b231cf46e44a993b5320a4a5fdf4abb802b71762a06755401d1cc.
- `sha256sum -c docs/plans/dispatch-build/next-build-phase.sha256`: OK.
- Manually traced exact independent approval, Q07 separation, pending/activation revalidation, same-payload-and-approval retries, conflicts, nonce serialization, expiry/revocation and audit-retaining failure handling. This verifies contract statements only; no executable commissioning tests exist or were claimed to pass.

## Limits and outstanding acceptance gates

Commissioning authority, external trust source/admission, initial council decision-maker/approver evidence, approver authentication method and configured validity/revocation policy still require explicit owner decisions and later accepted implementation. Actual council appointments remain outside this synthetic contract. The authentication receipt grants no commissioner or council authority. The planned test inventory remains planned. No runtime/browser/database tests were appropriate or run for this docs-only closure. No new legal or signed-source authenticity assessment was performed. Earlier M1/P0 historical audit claims were not independently re-audited.

## Input SHA-256 manifest

- `a9a07470770d3494e000587ae9bbd828bb277738428ea444d401a926bae58bfe` — `AGENTS.md`
- `02ced655e48f0b183dfecd1ff97283682943dca3e0b1855ea12d1578807e3106` — `docs/plans/independent-product-audit-protocol.md`
- `0401ecfbd3cd58b2bb16cec895f8296d01fb41f3112deb7a8f8f20efe615e9d1` — `docs/plans/F11-G1-council-staff-authority-contract.md`
- `355528b22f890f8971d2f1140e81e93bcb4b3d66fdde5e8dd5625c36ea59025b` — `tests/f11/README.md`
- `749b4c210d9e238c6e4bd91f695c3d1bb2ae2dd7d588ac61855e6d27b5a9a303` — `docs/plans/evidence/F11-G1-owner-decisions-2026-10-22.md`
- `740f6b96387ff10b8c1bdd7ec3437fd0db834f7cfae50d3f0aab2a6ec0778685` — `docs/plans/evidence/F11-G1-owner-decisions-2026-10-24.md`
- `618a5555f94b231cf46e44a993b5320a4a5fdf4abb802b71762a06755401d1cc` — `docs/plans/dispatch-build/next-build-phase.md`
- `ab0966ea9e6f15927aff9833a4d748970992f23c6c45e7198ddbac39edad334f` — `docs/plans/dispatch-build/next-build-phase-checkpoint.json`
- `bc3d6b2709b653e35ac9331fc99b937a5f66daf26d248c2eaf94a5af36757574` — `docs/plans/dispatch-build/plan-manifest.json`
- `03c4bb5292adb5be59673b1bb28465d692e76d15b99421f8a2eb359e6e95b088` — `docs/plans/dispatch-build/next-build-phase.sha256`
- `d5b81eb239381bcde30d184aa2f7ac83670f30f40bd26a8da360ce3ff67cf091` — `docs/plans/dispatch-build/README.md`
- `9d0e61c755619e8dc72fbb40c9d67af5d16b76547ad7752794046deb1aab2451` — `docs/plans/F11-execution-checkpoint.json`
- `82aab7589b6537bf5a54004693d8147cbe873c124ae1fddbf7517b3cb4e1eea4` — `docs/plans/civicmaps-feature-ledger.json`

Timestamp: 2026-10-24T10:27:08.710465+00:00
