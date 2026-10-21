# F11 G1 independent product audit

- Task: CivicMaps F11, G1 synthetic/test principal ownership enforcement with binding corrections.
- Product version: 0.1.0.
- Baseline SHA: `20fd9fa32eea42d9957bb84e183533f2f94cecb5` (candidate parent; metadata only, baseline product not audited).
- Candidate SHA: `6210ac02ca81738ba943c6096d56238728316d10`.
- Candidate tree: `372a6d96aec959f0eb1975c505e202c45461127d`.
- Auditor model/effort: GPT-6 Astra, low reasoning effort (invocation metadata supplied by the orchestrator); independent child agent with `fork_turns=none`.
- Timestamp: `2026-10-20T01:25:56Z`.
- Fresh-context declaration: reviewed only the assigned frozen contract and Git identity/hash metadata. No builder plan, checkpoint, handoff, diary, earlier conversation, or Empirical memory was consulted.

## Input manifest and checks

The sole product input was `docs/plans/F11-principal-ownership-contract.md`, read directly from the candidate commit with `git show`. SHA-256 independently calculated as `33e68899331de5df6f71b6f062b6072f25628374dd2b7e9179079701742591f3`, matching the supplied manifest. `git show -s` confirmed the candidate commit, tree, and parent above.

Reviewed the stated task scope, attributable Q02 quotation, accept/deny matrix, provenance rule, schema/migration proposal, exclusions, and source-availability disclosure for support and completeness. No implementation tests were executed: this is a contract-only audit.

## Findings

1. The quoted owner Q02 constraint supports independent council identities and grants, denial of cross-council operational access, and prohibition of identity merging or ownership transfer. The matrix and explicit synthetic-only exclusions consistently preserve that narrow direction and do not grant ADMIN operational access.
2. Required binding corrections cannot be assessed. The assignment explicitly includes them, but their content and the named clean contract are unavailable. Disclosure is accurate about this limitation; it does not establish that the candidate incorporates the corrections. Neither the Q02 quotation nor a synthetic/test limitation supplies the missing requirements. This is insufficient evidence for a G1 pass.
3. The schema proposal states useful uniqueness, ownership-preservation, and atomic fail-closed upgrade requirements, but leaves the actual association, backfill rules, and privileges unselected. The contract itself requires these choices to be explicit in an audited design before implementation. Consequently it is not a complete implementation authorization even apart from missing corrections.
4. Existing session/context resolution, role checks, non-disclosing response behavior, ADMIN exclusion, and audit attribution are referenced rather than independently evidenced here. Their existence and adequacy remain unverified. The owner source hash is recorded by the candidate; this audit did not independently retrieve or authenticate that source.

## Unverified requirements and disposition

Recover approved binding-correction content and the clean implementation contract, establish their applicability, and map each required correction to the candidate. Supply an explicit synthetic persistence/migration design and evidence for the existing enforcement behavior it depends on; independently re-audit the resulting frozen product. Do not invent missing correction details.

**Verdict: `blocked`. G2 implementation is not authorized.** The decisive issue is unavailable mandatory source content, not a demonstrated conflict with Q02. The present contract can serve as a bounded draft, but cannot establish that the assigned first slice is complete or safe to authorize.
