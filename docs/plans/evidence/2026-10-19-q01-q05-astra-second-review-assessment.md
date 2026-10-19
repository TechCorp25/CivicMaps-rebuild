# Assessment of second Astra review — synthetic principal ownership

**Disposition:** supported for the narrow synthetic implementation slice after incorporating the listed engineering refinements. This is a design review; no implementation tests or production/customer authority were provided by the reviewer.

## Reviewed evidence and actual findings

Astra reviewed the precise first-slice and Q01–Q05 reassessment documents against application pin `b7d7ec53d2b14259162965ea24861a565a590b95`, main `1bbfa7bb68190278d6adb64bba39527b7a3e7e36`, migrations 001/004/005/009/012, application login/context/routing/seed code, and integration/upgrade tests. The reviewed contract hash was `c9d9f79f33b1f40f6bf8066a24d452cc05463b113039c07e0245add481848488`; revised design hash was `7771a4d21a5f618c653292025418e86a27ec29d5ff0c854fac754d2f3e19bbc5`. See the [full reviewer report](2026-10-19-q01-q05-astra-second-review.md).

The reviewer supported the principal-owner boundary, provided implementation stages the explicit fixture manifest transactionally, closes API admission during migrations, preserves D02 token/grant history, updates migration compatibility coverage, and does not infer or auto-revoke customer data. Specific corrections are:

- D02 deactivation removes sessions and marks outstanding activation tokens revoked while retaining token/event history. The Beta disabled admin's existing grant pair may remain unrevoked and is non-effective because the user is inactive.
- Context grants use composite key `(user_id,binding_id)` and `operating_context_changes` history. There is no grant ID or replacement operation in the slice.
- 014 stages nullable ownership/session fields; 015 enforces them. Runner validation, explicit D02 checks, known synthetic mismatch retirement and session owner backfill occur in one transaction. Unknown owner/grant state aborts fully. API admission must already be closed because advisory locking does not stop application writes.
- Corrected seed order is municipality, user, owner, binding/grant. Fresh installs do not create a historical mismatch solely to revoke it. Pre-004 tests need explicit municipality prerequisites and owner mappings.
- Retain only explicitly mapped valid legacy sessions. Deny or revoke unbound, mismatched, expired, disabled or wrong-route sessions; Alpha `...0006` must never use a Beta session/context. Wrong-council login failures are generic and must not delete another principal's session when a cookie jar is reused.
- Keep session `(user_id,council)` immutable; preserve lock ordering; maintain `valid_operating_context()`. App-role grant writes remain denied. Same-council grant positives use an authorized seed/D02 writer. Runtime `BYPASSRLS`, database owner, DDL, migration and host remain trusted bypass paths.
- Update pack-entitlements, admin-activation and service-routing upgrade fixtures; map test-only historical IDs explicitly, split successful mapped migration from unknown-owner preflight failure, and update migration count to 15.
- Current email uniqueness is case-sensitive in storage while login normalizes input; do not claim normalized uniqueness or enable duplicate identifiers. Future same-email principals need council-audience-scoped lookup and generic failures.
- Recovery remains the separate custodian's authority; remove generic council-approver recovery wording. Old code must not be admitted after enforcement, though added schema cannot technically prevent old reads. A pre-revocation restore requires external authoritative revocation reconciliation.

The supported design resolves implementation sequencing, not any remaining customer ownership facts. The exact pre-code implementation work contract was pinned at SHA-256 `092c571acb6be63cc2d9f340180fca951b8bdb88964d4bfe077f60e8b9e03716` at `/workspace/work/council-principal-ownership-implementation-contract.md`. It authorizes synthetic/test work only. Its output still requires source review and tests; this assessment does not self-certify implementation.
