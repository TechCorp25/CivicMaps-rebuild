# F03 — Municipality-to-operating-context binding: implementation brief

Prepared from main `8954d46b7214a3bfaeaf680dc9f4ab180719a420`, which merged F02Q through PR #8. F01, F02 and F02Q prerequisites are complete. F03 remains planned; this brief does not implement bindings.

## Single-feature goal

Resolve a registered municipality and authenticated council user to an explicitly permitted, effective operating context before operational reads or writes. Preserve tenant, organisation, jurisdiction, data-plane and branch isolation. Team membership must not imply ownership or authority.

See the [feature card](civicmaps-platform-assessment-and-autonomous-plan.md#f03--municipality-to-operating-context-binding) and [tenancy model](../architecture/CivicMAPS_Architecture_Configuration_and_Tenancy_Model_v0.1.0.md). Authority Realm is a resolution result, not a data store. A municipality is not permanently synonymous with a tenant; shared-service associations must be representable without widening access implicitly.

## Current implementation seam

`services/api/app.mjs` currently reads scope strings directly from the authenticated user in `scoped`, then sets transaction-local RLS context. Municipality records in `003-platform.sql` have no association to those operational identities. Seed users derive Alpha/Beta identifiers from synthetic scope strings. F03 must connect these explicitly, not match real council names or infer tenant IDs from slugs.

## Targeted implementation checkpoints

1. Define the minimal versioned, effective-dated association model and user grants. Record keys, foreign-key/uniqueness rules, active interval semantics and revocation rules before writing the migration. Support multiple associations rather than imposing municipality/tenant uniqueness. Reuse existing scope identifiers; do not introduce a general-purpose policy engine.
2. Add the next ordered migration and explicit synthetic fixtures. Preserve existing rows and passwords. Backfill only unambiguous known fixtures; unknown historical scope must fail closed until explicitly mapped. Verify first run and repeated migration/seed execution.
3. Implement server-side resolution before setting transaction-local role/context. Validate the full binding and user permission on every operation, including expiry/revocation. Any client context identifier is a lookup selector, never trusted scope data. Resolve a unique authorised default for existing single-context clients; reject missing/ambiguous selection rather than choosing the first match. Platform credentials remain unable to perform council operations.
4. Stamp new operational records with the resolved capture association/version while preserving immutable origin tenant, organisation, jurisdiction and data plane. Define handling of historical records lacking capture metadata; do not fabricate provenance. Keep idempotency receipts isolated across any permitted context selection. Document whether previous receipts remain replayable after association expiry and verify that no replay exposes an unauthorised context.
5. Add focused integration coverage, run all quality/acceptance gates, document migration compatibility and rollback, then publish a fresh F03 implementation branch with evidence and Empirical gotchas. Keep only this feature active.

## Acceptance matrix

| Scenario | Required result |
| --- | --- |
| Alpha and Beta normal sessions | Existing authorised lifecycle works; no cross-context list, detail, audit, assignment or mutation |
| Shared-service association | Same organisation can hold explicitly granted associations in distinct contexts; one grant does not authorise the other |
| Missing, forged or ambiguous context | Denied before operational work; no fallback to arbitrary user-supplied scope |
| Future, expired or revoked association/grant | Denied on the next operation, including existing sessions; test boundary instants |
| Concurrent binding change and write | Defined transactional behaviour; no write under a partially resolved or stale grant |
| Origin protection | Updates and association changes cannot rewrite original scope; capture version remains traceable |
| Retry key across contexts | No receipt collision or disclosure; existing duplicate/stale-version behaviour preserved |
| Unset/mismatched database context | RLS still denies access, including after connection reuse |
| Migration/seed repeated | No duplicate associations or destructive reset; historical records preserved |

## Completion and handoff

Run `npm run setup`, `npm run check`, and `npm run test:platform:browser` with a disposable PostgreSQL instance. Run CommandMAPS browser acceptance when its session/context behaviour changes. Preserve generated tokens. Write `docs/plans/evidence/F03.md` with the exact commit, checks, fixture model, concurrency policy and migration/rollback limits; update the ledger and Empirical before declaring review-ready.

Use one test environment per process: the API database module caches its pool. Preserve independent SQL assertions and partial-setup cleanup. Keep Hooks dependency rules enabled and existing same-ID route acceptance coverage. See [F02Q evidence](evidence/F02Q.md) for known tooling and browser gotchas.

No provider provisioning, DNS, admin activation, operational pack enforcement, portals or payment work belongs in F03. D01–D06 remain at their existing feature boundaries. No new framework or identity-provider choice is required to begin. Rollback must disable new context use without deleting operational records or silently restoring an unsafe fallback.
