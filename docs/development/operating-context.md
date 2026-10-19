# Municipality operating contexts (F03)

The municipality registry is connected to explicit operating bindings and user grants. A municipality may have several associations; the tenant is an administration boundary, not a synonym for a municipality or legal authority. See the [tenancy model](../architecture/CivicMAPS_Architecture_Configuration_and_Tenancy_Model_v0.1.0.md) and [F03 implementation brief](../plans/F03-preparation.md).

## Model and authoring

`operating_context_bindings` stores immutable snapshots: binding UUID, association UUID (version lineage), positive version, municipality UUID, tenant, organisation, jurisdiction, data plane, branch and effective period. A binding UUID selects one exact version. The user role remains the existing account role; per-realm role administration is later identity work. Team is retained as account metadata and grants no ownership or realm access.

`operating_context_grants` explicitly authorises a user for a binding version with its own effective period. Periods include their start and exclude their end. NULL end means unbounded. Setting `revoked_at` immediately revokes the row; revocation is irreversible. Scope and period fields are immutable; rows may only be revoked, never deleted. To restore or alter access, append a new binding version and explicit grants; retire the previous version where appropriate. Overlapping authorised versions require explicit selection and never silently become a default.

Only the privileged database owner/migration writer currently authors this structure. Neither application role has INSERT/UPDATE/DELETE privileges on bindings or grants. There is no operator-facing authoring endpoint in F03. `operating_context_changes` records persisted inserts and revocations, including before/after state and database author. Authorised platform management and per-operator attribution belong to later administration work.

## API contract

Council cookie authentication remains separate from platform authentication. Login authenticates identity and returns credentials; it does not establish operating authority. Logout requires the valid session and CSRF token but stays available after grant expiry.

| Request | Behaviour |
| --- | --- |
| `GET /api/auth/contexts` | With a valid council session, list only currently effective granted binding versions and their explicit scope |
| `GET /api/auth/session` | Resolve the selected/default context; actor includes `context_id`, `context_version` and `municipality_id` |
| Council operational reads/writes | Resolve binding and grant on every operation, then set transaction-local RLS dimensions |
| `X-CivicMAPS-Context: <binding UUID>` | Select an exact permitted version; a selector is never trusted ownership data |

One effective grant allows an unambiguous default for existing clients. Zero or multiple effective bindings without a selector produce 403. Malformed, ungranted, future, expired or revoked selection produces 403. Unauthenticated access produces 401. Body fields that attempt to assign ownership remain rejected. Platform sessions cannot select council contexts.

The existing web client remains a single-context client; multi-context switching is an API capability at this phase. Use the contexts endpoint and explicit header for shared-service integration. Adding a chooser belongs to the relevant subsequent application integration scope.

## Scope, records and retries

RLS continues to match tenant, organisation, jurisdiction, data plane and branch. Migration 005 adds restrictive policies requiring those dimensions to agree with the selected binding and an active actor with an effective grant. The same gate protects requests, audit, personnel, grants and retry tables. A boolean SECURITY DEFINER helper uses the existing privileged migration/resolver owner, fully qualified tables, a fixed `pg_catalog, pg_temp` search path and app-only execution to avoid recursive grant/personnel policies. The owner must retain its existing RLS-bypass capability; neither application role receives that capability. Officers and assignment candidates are visible only through effective grants in the resolved context, rather than their legacy home scope fields. Officer request access still requires assignment and existing role rules.

New requests store immutable `capture_binding_id` and `capture_binding_version` alongside immutable origin scope. The insert trigger validates that binding and scope match; its narrow SECURITY DEFINER function has a fixed search path and no public execution permission. Neither a later binding version nor a user reassignment rewrites origin. Historical requests retain NULL capture fields and their existing scope; no authority provenance is fabricated.

Receipts remain readable only to their actor in the exact current binding. Different associations may use the same key without sharing responses. Within one association, a key is unique across binding versions: attempting a write using an earlier version's key returns 409 and rolls back the attempted write/audit. The old receipt stays hidden. After version replacement, refresh state before choosing a new key. Revoked/expired context is denied before any receipt replay. Legacy receipts have no context provenance; their keys are retained in an actor-scoped guard and produce 409, rather than replaying data or creating an accidental duplicate.

## Concurrency

Resolution locks the authenticated session/user and the user's binding/grant rows with `FOR SHARE`, in binding-ID order. It then evaluates effective periods using PostgreSQL `clock_timestamp()`, after lock acquisition, preserving database timestamp precision. See [PostgreSQL 15 row locks](https://www.postgresql.org/docs/15/explicit-locking.html), checked through Context7.

A structural update that commits first is observed by a waiting resolver. Revocation waits for an already resolved transaction to finish; RLS also checks effective periods at each SQL statement; crossing an expiry boundary before a later write can deny the statement and roll back the operation. The next operation re-resolves and is denied. An inserted grant is not implicitly usable by an operation whose candidate snapshot did not contain it. Transactions do not promise an immediately cancelled in-flight write. Role/context settings reset on transaction completion.

## Migration and synthetic fixtures

Apply migrations through the explicit runner, then seed the dedicated local database. Synthetic principals have an explicit immutable council owner. `shared@alpha.example` remains one Alpha principal; the old Beta grant is retired only when the migration runs with the explicit `CIVICMAPS_MIGRATION_PROFILE=synthetic-fixture` selector and its email, name, Beta municipality, binding and grant fields match the canonical synthetic fixtures. A populated database without that profile, or with conflicting fixture data, aborts without committing migration changes. Real council names/slugs are never used to infer authority.

Only known fixture user IDs with matching stored fixture home dimensions receive seeded grants. Unknown historical users remain unmapped and receive 403 until explicitly granted. Repeated seeding preserves passwords, bindings and revoked grants. Repeated migration/seed operations do not append false audit entries: recording uses AFTER triggers so skipped conflicts are not audited.

A populated-upgrade test preserves existing request content, passwords and old receipts, leaves capture provenance NULL and proves legacy keys cannot create duplicate records. The disposable environment's optional `beforeMigrate` hook creates that older schema only in its newly generated database.

## Rollback and validation

An earlier API binary is incompatible with the new capture requirement and does not enforce current grants. Keep the resolver/migration together. A safe operational fallback is to stop affected writes and revoke/disable context access while correcting the release. A destructive down-migration or restoration of an older database is not part of this feature; recovery requires an explicitly reviewed backup/restore plan. Retain origin, captures, grant history and receipts.

`npm run check` covers quality gates, both builds and 31 integration tests. `npm run test:platform:browser` covers the platform. Run CommandMAPS browser acceptance against a seeded disposable environment after session or resolver changes. See [F03 evidence](../plans/evidence/F03.md).
