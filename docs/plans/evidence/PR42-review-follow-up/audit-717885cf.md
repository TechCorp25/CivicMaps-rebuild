# PR42 independent product assessment

Task: PR42 commissioning contract and documentation coherence, neutral task supplied 24 October 2026.
Auditor: GPT-6 Astra, low reasoning effort. Fresh agent context requested with fork_turns=none; no builder conversation, working notes, prior audit reports or broad Empirical notes were supplied or read. Operational documents were inspected only as assessment targets, not evidence of correctness. Their embedded historical status claims were not used to infer acceptance.

Candidate: 717885cf684a5c856367c9965575fb32054497a8
Tree: e59a36c0118718488fc68c12f8e4de45a236ed20
Baseline: 2a20b81cc7c67f90a8063d66acddac303bd0c845
Remote verification: candidate supplied as verified remote by task; local HEAD/tree independently matched. No independent network fetch was performed.

## Verdict

**changes_required** for the documentation correction product. **G1 goal acceptance remains blocked**, independently of defect correction, on the explicitly unresolved owner decisions. G2, provisioning, merge and deployment remain unauthorised. Authentication-receipt reinterpretation is corrected, but the first independent council approval sequence and current status provenance remain incomplete.

## Findings

### F1 — High: naming the first independent council approver does not admit them or obtain their decision

Location: docs/plans/F11-G1-council-staff-authority-contract.md:87–91, 99 and 128; verification inventory at 142.

The setup proposal starts with an external council decision-maker submitting a signed commissioning record naming an independent approver. Its enumerated steps validate that record, collect two operator actions, create pending appointments, and proof nominees. No step independently admits/authenticates the named council approver and obtains that person's approval of the exact appointment payload. The API and schema similarly carry the signed external record and operator approvals without a required first council-approver decision/provenance field. “Council decision” in the final inventory could be the proposing decision-maker's record; neither its distinction from that proposal nor its binding to the named independent approver is defined. Thus an implementation can follow the enumerated sequence with zero action by the named independent approver, despite the authority matrix prohibiting requester/self approval and the phase plan requiring an independent council decision.

Reproduction: trace steps (1)–(5) at line 89 with a valid externally signed proposal naming an approver, valid Q07 operators and all nominee proofing results, but no decision signed by that approver. No explicit setup step rejects this case. The general council-decision endpoint requires an ordinary council session and therefore does not supply the missing setup-only first admission path.

Required correction: explicitly define setup-only approver admission from the external trust record, its evidence and separation constraints, then require that admitted person's independently attributable exact payload/version decision before the Q07 commit. Bind it in the endpoint/schema/inventory and add missing-approver, self-approval, stale/revoked/expired decision and retry cases. Alternatively explicitly define how an independently signed external approval supplies these same controls. Trust-source selection can remain an owner blocker; the proposed control sequence itself must be complete.

### F2 — Medium: current machine-readable status combines new versions with historical candidates/acceptance

Location: docs/plans/dispatch-build/next-build-phase-checkpoint.json:3–29 and 49–66; docs/plans/F11-execution-checkpoint.json:214–235 and 334–338; docs/plans/civicmaps-feature-ledger.json:334–351 and 715–760.

The canonical checkpoint now identifies plan v1.1.2 but retains preparationStatus=P0_accepted and P0 status=accepted/audit=PASS with no distinct current-revision acceptance state. Its G1 row identifies contractVersion=1.5 and publication=verified against candidate 97776474…, which independently contains contract v1.3. The F11 checkpoint and ledger similarly pair contract v1.5 with historical corrected/published identities; the ledger's phase block retains the prior plan hash while pointing at the current manifest. Prose says the new revision awaits assessment, but machine consumers receive conflicting current state and provenance.

Reproduction: parse the current checkpoint's planVersion and goals[P0] fields; compare goals[G1].contractVersion with `git show 97776474e97d286b07a8b9f0baadb4d86ac54c2e:docs/plans/F11-G1-council-staff-authority-contract.md`, which reports 1.3. Compare the ledger planSha256=d3fc4acb… with the actual canonical plan hash bf29dd32….

Required correction: retain prior acceptance/publication under explicitly historical versioned entries; give the current plan and G1 revision separate pending-assessment/publication identities and coherent hashes. A follow-up publication receipt can pin the content commit without requiring a self-referential hash. Do not relabel historical candidates as v1.5.

## Checks actually executed

- Read AGENTS.md and independent-product-audit-protocol.md, plus target contract, receipts, test inventory, and relevant target operational-document sections/diffs. No prior report links were followed.
- Verified detached checkout HEAD and tree exactly match supplied candidate; `git status --porcelain` empty.
- Ran manifest-restricted `git diff --check` against baseline: exit 0.
- Parsed all four target JSON files with a duplicate-rejecting object_pairs_hook: all pass; no duplicate keys.
- Independently SHA-256 hashed every input below. Canonical plan hash matches plan-manifest.json, next-build-phase-checkpoint.json and `sha256sum -c docs/plans/dispatch-build/next-build-phase.sha256` (OK).
- Inspected prior named published contract at 97776474… only to reproduce version/provenance mismatch: v1.3. Attempt to inspect the correctedCandidate ee4ea9d… contract path failed because that path was unavailable at that reference locally; no conclusion relies on it.
- Manually traced setup trust admission, pending appointments, activation, Q07, retry/replay, expiry/revocation and planned verification coverage. Same-key retries, payload conflict, nonce uniqueness, concurrent slot serialization and pre-activation audit-preserving cancellation are explicitly proposed. Their actual execution is untested and intentionally unimplemented.

## Satisfied scope and limits

The 24 October receipt and contract explicitly restrict authentication/MFA direction to authentication; they confer no commissioner or council appointment authority. Owner decisions on trust-root/admitter, commissioning authority, first decision-maker evidence, expiry/revocation source remain explicit blockers; no customer enrolment is authorised. Test inventory accurately labels coverage as planned. No app/runtime test was run for this documentation-only assessment, and no implementation, provisioning, merge or deployment occurred. Signed owner Q07 source authenticity was not revalidated; findings concern internal contract/task coherence and do not depend on historical assessment summaries. This report does not certify legal authority or operational security.

## Input SHA-256 manifest

- `a9a07470770d3494e000587ae9bbd828bb277738428ea444d401a926bae58bfe` — `AGENTS.md`
- `02ced655e48f0b183dfecd1ff97283682943dca3e0b1855ea12d1578807e3106` — `docs/plans/independent-product-audit-protocol.md`
- `1f45c19dd494e2939df58250b132c64637ef572c68ada41848521d05ce882eab` — `docs/plans/F11-G1-council-staff-authority-contract.md`
- `355528b22f890f8971d2f1140e81e93bcb4b3d66fdde5e8dd5625c36ea59025b` — `tests/f11/README.md`
- `749b4c210d9e238c6e4bd91f695c3d1bb2ae2dd7d588ac61855e6d27b5a9a303` — `docs/plans/evidence/F11-G1-owner-decisions-2026-10-22.md`
- `740f6b96387ff10b8c1bdd7ec3437fd0db834f7cfae50d3f0aab2a6ec0778685` — `docs/plans/evidence/F11-G1-owner-decisions-2026-10-24.md`
- `bf29dd32acc10d5484e81f370c92b45fe097ec934d27e19ef479f24affce0afe` — `docs/plans/dispatch-build/next-build-phase.md`
- `e4c1b02f7b8b9c528aeec07c0d9aa3662e9ed52d49d078f61b91fd2df0d0be4d` — `docs/plans/dispatch-build/next-build-phase-checkpoint.json`
- `00d0335086060d912873f8e0742c690a59805c148f93164e3cfeb084931fac61` — `docs/plans/dispatch-build/plan-manifest.json`
- `6d5a4a3eef5214f52beaab408096f55edb890227b5d34d3ca3021746087946a6` — `docs/plans/dispatch-build/next-build-phase.sha256`
- `bcfd6fc86f706608d9246bb40cd20f81f46e8966fdd060908381ee16105c03d1` — `docs/plans/dispatch-build/README.md`
- `e0bdfa1bd583c5932a043fab8ba55dad53b7ca25b52d98b5aa1ad81ad594b6d8` — `docs/plans/F11-execution-checkpoint.json`
- `714b4d598359c4941ae21e4f179ed0cabc81b7a81ba603a351b759608003a7e2` — `docs/plans/civicmaps-feature-ledger.json`

Timestamp: 2026-10-24T10:21:18.531033+00:00
