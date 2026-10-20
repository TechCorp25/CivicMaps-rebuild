# Independent product audit protocol

Owner instruction: 20 October 2026. Applies to the next F11 run.
Builder: GPT-6 Luna Medium. Auditor: GPT-6 Astra Low. These are explicit assignments; do not silently substitute another model or reasoning level.

## Information boundary

Start each assessment in a new auditor context. With agent tools use `fork_turns="none"`, `model="gpt-6-astra"`, `reasoning_effort="low"`. Never fork the builder conversation. If this cannot be enforced, record the audit as blocked and use a separate clean session; do not label a shared-context self-review independent.

Allowed inputs are the task statement, frozen acceptance criteria and authoritative constraints, plus the resulting product at an exact SHA (source, required product documentation, tests, screenshots and raw execution artefacts). Give a neutral file inventory and reproduction commands. Auditor may inspect unchanged dependencies necessary to evaluate that product and independently execute tests.

Excluded inputs: CoF, chain-of-thought, thinking, reasoning traces, scratch files, work diaries, internal planning deliberations, abandoned approaches, builder explanations/justifications, self-evaluation, favourable summaries, prior conversation and prior audit conclusions on an initial assessment. Do not query broad Empirical agent notes or read implementation narratives to form a verdict. Approved owner requirements may be supplied as exact attributable requirements. Product documentation that is itself an assessment target may be examined as a deliverable, never taken as proof of correctness.

The operational build plan and session checkpoint are builder handoff material. For an auditor, supply a standalone neutral task contract and the relevant goal acceptance rows, not this session's narrative. Remove implementation commentary from the packet; do not alter code or evidence to conceal defects. If a necessary contract is missing, the auditor records insufficient evidence rather than receiving builder intent as a substitute.

## Procedure

1. Freeze task/acceptance version, candidate SHA, baseline SHA and product manifest. Record SHA-256 hashes of packet files. Exclude scratch and diary paths; keep the builder handoff outside the audit packet.
2. Send a neutral request: “Assess this product against this task and constraints. Determine correctness independently. Inspect the pinned source and reproduce checks where possible. Do not infer intent or rely on builder claims.”
3. Auditor records model/effort, fresh-context mechanism, exact input manifest, source SHA, checks actually run, evidence-based findings with severity and file/line or reproducible observation, and limits. Verdict: pass, changes_required or blocked. No hidden reasoning is requested or stored.
4. Builder addresses findings and produces a new pinned product. Perform a fresh assessment against the same task. For targeted closure, supply the concrete defect/reproduction and new product only, not builder rationale; distinguish targeted closure from a complete independent reassessment.
5. Accept the goal only with supported evidence and no unresolved blocking findings. A pass is scoped to the criteria and tested product; it is not legal certification, production approval or proof that all bias is eliminated.

Required checkpoints: G1 authority/API contract; G2 server/schema product; G3/G4 UI and connected lifecycle; G5 final exact candidate. The final audit must cover the integrated final product even if earlier checkpoints passed. New product changes after audit invalidate affected acceptance and require reassessment.

## Report fields

Task ID/version; baseline/candidate SHA; auditor model/effort; input manifest/hash; independence declaration; tests executed/results; findings with severity, location, impact and reproduction; unverified requirements; verdict; timestamp. Store the audit report separately from builder working notes. Publication/ledger status must not claim an audit occurred before its report exists.

The final release assessment occurs after tests, docs/Empirical updates and push, against the verified remote candidate. Passing assessment and required CI gate merge; deployment verification follows merge. Record exact candidate and merged/deployed artifact identities. Any material change after assessment requires affected checks and independent reassessment.
