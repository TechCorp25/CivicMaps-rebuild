# F11 handoff correction — 20 October 2026

The owner has authorised development. No approval or source-document request is pending with the owner. Signed Q01–Q12 directions and the binding governance corrections are available at PR25 head `254423e103f86b30c94bd45cd518f1563d388d82`.

The coordinator incorrectly narrowed F11 to synthetic principal ownership, then omitted the available governance requirements from the builder and auditor packets. This was an orchestration error, not a new owner instruction or an unresolved owner decision. Synthetic ownership implementation belongs to the separate governance workstream. The original F11 council-to-CommandMAPS outcome and G0–G5 goals are restored.

The historical [G1 review](F11-G1-independent-audit-6210ac0.md) remains unchanged. Its blocked verdict applies to its frozen, incomplete candidate only. It does not establish a blanket development hold or require the owner to resupply documents. The superseded principal-ownership candidate is not the F11 implementation specification.

## Authoritative inputs for resumed design

Read these files at the pinned governance commit above through authenticated GitHub access (their absence from main does not mean they are unavailable):

- `docs/plans/evidence/2026-10-19-governance-checkpoint.md` — superseding signed-owner direction status and implementation checkpoint.
- `docs/plans/evidence/2026-10-19-signed-owner-decisions-assessment.md` and `2026-10-19-signed-owner-decisions-review.md` — approved Q01–Q12 directions.
- `docs/plans/evidence/2026-10-19-council-principal-ownership-first-slice.md` and `2026-10-19-q01-q05-astra-second-review.md` — governance-owned implementation boundary and binding corrections.

The old external scratch-contract hash discrepancy is a historical provenance limitation, not a request for another owner approval. Reference the committed requirements and actual source product, identifying any integration dependency precisely.

## Continue

GPT-6 Luna Medium resumes the F11 G1 actor/action/API/schema design using the approved directions and current application source. Do not duplicate PR25 ownership work. GPT-6 Astra Low independently audits the resulting design with a fresh context containing task requirements, authoritative source requirements and product only. No builder reasoning, working notes, prior verdict or conversation is included in that audit packet. Engineering design and independent assessment remain work to perform; they are not missing user decisions.

Static checks and both builds passed in the prior run. Database/browser acceptance remains unverified: PostgreSQL 15 was absent and the direct database connection returned EPERM. The prior claims of a bind failure and a confirmed apt-policy rejection were not supported by those errors. Diagnose supported runtime/network access separately; do not represent these observations as a governance or owner-approval block. No runtime pass, implementation completion or release is claimed.
