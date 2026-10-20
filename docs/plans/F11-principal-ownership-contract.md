> Superseded candidate from an incorrect coordinator assignment. This is not the current F11 scope or an owner instruction. See [handoff correction](evidence/F11-handoff-correction-2026-10-20.md). Historical candidate content follows.

# F11 G1 candidate: synthetic principal ownership

Version: 0.1.0 (candidate for independent G1 review)  
Date: 20 October 2026  
Status: contract only; no schema, API, UI, identity, grant, or operational behavior is implemented by this document.

## Purpose and limit

Define the smallest F11 slice currently authorised for design review: enforce a synthetic council principal's ownership boundary. This candidate does not authorize general staff provisioning or any real-council identity workflow. It is narrower than the prepared F11 outcome and cannot by itself satisfy F11 completion.

The exact clean implementation contract previously expected at `/workspace/work/council-principal-ownership-implementation-contract.md` is unavailable. The PR25 source records named in the execution instruction are not present in this checkout, and their Git objects could not be fetched in this environment. Therefore this document claims no additional detail from those records. The controlling assignment for this candidate expressly narrows the slice to “synthetic/test only principal ownership enforcement with binding corrections.” If a required behavior below cannot be traced to that direction or the owner constraints quoted here, the auditor must mark it unspecified; implementation must wait for an approved source.

## Attributable approved constraints

The owner-signed CivicMAPS-rebuild decision runsheet, executed 19 October 2026, is recorded with source SHA-256 `63e61d2a0f800b4fa713ed5b5f8041c8e5c43bf10930b95e18d0c412f8f4af30`. Its controlling Q02 selection is “C + A”: independent council identities and separately scoped grants. The controlling interpretation states:

> Each council independently establishes and controls its staff identities, login sessions, authorization grants, employment/access status and operational work or records. The same person employed by two councils has two independently administered council identities. No identity/permission/status/work sharing, inheritance, visibility or operational cross-council federation is permitted. Within a council, access grants are separately scoped to explicitly approved branches and operating contexts and cannot bleed into another context. Regrant/revocation history is preserved.

The same signed record's Q01 interpretation assigns routine staff changes to council security with documented branch-limited delegation and independent approval for elevated/cross-branch access. Q04 requires independently verified administrators and a separate recovery custodian; Q05 requires independent council approval for high-impact structural changes, controlled versions and no automatic revival of revoked access. Those are recorded here as constraints on future work, not as authority to implement those workflows in this slice.

The authorized F11 instruction further states that this slice is synthetic/test-only and includes “binding corrections.” The exact PR25 correction text is unavailable in this checkout, so no correction beyond the listed signed-owner constraints is inferred here. This limitation is an explicit audit question.

## Candidate invariant and observable contract

For synthetic fixtures only, every authenticated principal used for council-scoped operational work belongs to exactly one council identity. That ownership is established by trusted server-side fixture/setup data, is not chosen by a request payload, and cannot be changed by an ordinary application request. Two synthetic council identities representing the same hypothetical person remain independent identities.

For every request handled in a council operating context:

| Actor/action | Allowed | Denied |
| --- | --- | --- |
| Unauthenticated caller reads or changes council-scoped operational data | Nothing in this contract | All such access |
| Authenticated synthetic principal accesses data in its own active, explicitly granted operating context | Existing permissions continue to govern the operation | Access outside the active principal/context boundary |
| Caller supplies or substitutes principal owner, council, or context in a request body to gain another boundary | No ownership-changing action | Reject the attempt; do not persist a reassigned owner or cross-boundary effect |
| Principal from council A lists, reads, changes, assigns, or reads audit for council B work | Nothing | Deny or return the established non-disclosing not-found response used by the existing API contract |
| ADMIN identity accesses operational records solely because it is ADMIN | Nothing | Preserve the existing ADMIN operational exclusion |
| Application code changes a principal's owning council or merges same-person identities across councils | Nothing | No such application operation is included or authorized |

The API's existing authenticated session and server-resolved operating context are the source of effective actor and context. The client cannot assert an owner identity or use an arbitrary council identifier to widen scope. Existing role and entitlement checks remain in force; this candidate grants no new role or capability.

Ownership provenance must remain attributable in existing audit/history where the current operation already records it. This contract does not authorize new audit fields containing personal information, free text, credentials, or secrets. It does not authorize rewriting historical records.

## Schema and migration proposal

The migration proposal is limited to expressing the invariant in the existing synthetic persistence model: a trusted principal-to-council ownership association, with uniqueness/foreign-key constraints sufficient to prevent one principal identity being owned by multiple councils and to preserve existing record ownership. Existing rows must not be silently reassigned, merged, or deleted. A populated upgrade must either preserve valid ownership unchanged or fail closed and roll back atomically when ownership is ambiguous.

The physical representation is deliberately unselected pending source review. Candidate designs may reuse an existing immutable user-to-council association if one already enforces these properties; otherwise a new constrained association may be proposed. No column/table name, backfill rule, database role privilege, identity-provider linkage, or production migration behavior is approved by this contract. Any such choice must be explicit in the audited design before implementation.

## Explicitly out of scope or denied

- Staff invitation, activation, delivery, recovery, reissue, expiry, disablement, or session revocation.
- Creating or approving administrators, dispatchers, officers, records custodians, or delegated branch administrators.
- Council-wide or branch-wide administration endpoints, screens, routes, or operator workflows.
- Any production, live-council, cloud, provider, SSO, MFA, credential, or real-person identity behavior.
- Identity merge, cross-council federation, cross-council grants, automatic regrant, self-elevation, or owner transfer.
- F09 suspension, Q06 pack activation changes, Q07 privileged operator actions, Q08 production topology, Q09 custodial access implementation, retention/disposal, or legal decisions.
- New privilege or data access for ADMIN, platform operators, database roles, workers, or support personnel.

## G1 review questions and gate

The independent reviewer must determine whether the invariant and denials are fully supported by the supplied task direction and attributable owner constraints; whether the actor/action/context matrix leaves a material path unspecified; whether the schema proposal preserves current ownership without inventing a backfill; and whether the unavailability of the named PR25 source corrections prevents a reliable verdict.

Verdict must be `pass`, `changes_required`, or `blocked` under the independent-product-audit protocol. A blocked or changes-required verdict prevents schema/API implementation. Even a pass authorizes only implementation of the audited synthetic ownership invariant and denials; it does not reinstate the broader staff-management goal or authorize any out-of-scope behavior above.

## Source availability record

- Signed owner runsheet: Empirical record `6ad58671beb1d96470610c4c`, source hash above; Q02 controlling text quoted in this contract.
- Approved implementation direction: current F11 execution instruction: synthetic/test-only principal ownership enforcement with binding corrections.
- Named PR25 source records: `docs/plans/evidence/2026-10-19-council-principal-ownership-first-slice.md` and `docs/plans/evidence/2026-10-19-q01-q05-astra-second-review.md`; unavailable in this checkout because the PR25 commit is not present locally and network fetch is blocked.
- Expected clean contract file: `/workspace/work/council-principal-ownership-implementation-contract.md`; absent.

