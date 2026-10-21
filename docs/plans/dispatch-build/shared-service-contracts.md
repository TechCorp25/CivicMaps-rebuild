# Shared service contracts and dependency map

Architecture contract for M0, not a claim these services exist. Prefer existing domain modules; do not introduce microservices or a plugin engine merely to create boundaries. Public wire contracts for each new milestone must be pinned and reviewed before code changes.

| Responsibility | Shared ownership | Department ownership | Boundary and proof |
|---|---|---|---|
| Authentication/context | identity-access; organisation-jurisdiction-tenancy | None | Server resolves actor and context; never trust submitted tenant IDs |
| Operational Code2/sign-on | officer-management | Approved operational configuration | Login does not imply duty; transitions versioned/audited; policy gate D-DUTY |
| Request coordination | service-requests-dispatch | Typed package intake and outcomes | Common identity/location/assignment/version/audit; no mandatory parking fields |
| Assignment/recipient routing | service-requests-dispatch with officer-management | Required package capabilities | Same eligibility checks for manual and automatic assignment; commit-time validation |
| Search/pagination/detail | Shared request read contracts | Supported package filters | Counts and cursor queries use identical authorisation; governance F-002 ownership |
| Location/zone/travel routing | gis-operations | Versioned authorised zone/reference configuration | Server authoritative zone result; provider adapter; no browser-authoritative eligibility |
| SOS | emergency-response | Approved recipient configuration only | Authenticated origin, scoped recipients, acknowledgement/escalation/recovery; no operational UI until approved |
| Notifications/comms | notification-delivery and recipient-groups | Template/event content within approved scope | Permission-checked recipients, delivery state, deduplication; no parking-specific transport |
| Audit | audit-records | Domain event payload contract | Preserve historical records; immutable provenance; defensive rendering |
| Parking catalogue/vehicle/outcome | Shared-reference and domain interfaces only | Parking package | No universal offence schedule or registration constraint inferred from preview |

## Data and interfaces

Existing endpoints `/api/requests`, `/api/requests/:id/audit`, `/api/requests/:id/actions`, `/api/officers` remain compatible during staged rollout. Existing five server statuses and version/idempotency/CSRF enforcement remain authoritative. Map presentation aliases without changing stored meaning.

M1 contract requirements: filtered discovery and counts over the complete authorised dataset, stable pagination, independent authorised detail retrieval, explicit paging metadata. Consume governance's reviewed wire contract; do not invent a rival endpoint shape here.

M2 contract requirements: authenticated duty transitions and eligible availability reads distinct from sessions. A transition includes expected version and replay protection; audit binds actor/context. Exact state enum, sign-off and session relationship require approved D-DUTY before implementation.

M3 request and migration contract proposal: see [M3 package-aware parking intake](milestones/M3-package-aware-parking-intake.md). It adds an allowlisted, versioned `packageData` envelope to the existing request body, uses server-derived `entitlements.packId`, and captures package identity/version/payload on new rows. Reject unexpected fields, cross-package coercion and client-selected council overrides. Keep the migration additive; old records need no fabricated classification. Package versioning is explicit, not arbitrary executable configuration. The proposal is not implementation approval; D-INTAKE still governs mandatory parking fields and catalogue choices.

M4 contract requirements: eligibility query and assignment use one domain policy. Commit-time checks are authoritative. Manual selection persists through zone refresh; stale eligibility/version is a visible rejection, not a silent substitute. Existing assigned work retains history if an officer becomes ineligible.

M5 contract requirements: distinguish address search, coordinate resolution, zone resolution and travel directions. Shared adapters carry source/freshness and unavailable results. Never call an external provider with real personal data without approved configuration. Synthetic fixtures exercise contracts without selecting a provider.

M6 contract requirements: common confirmed state, timestamps, assignment and audit; package outcomes integrate through explicit validated events. No implicit extension to eleven states. Polling remains labelled polling until a qualified transport exists.

## Future safety interfaces

SOS and communications depend on approved recipient visibility, cross-branch scope, acknowledgement authority, escalation, delivery failure/offline behaviour, retention and operational response ownership. Define intent and event boundaries now; defer exact wire/schema choices until those requirements are settled. Do not treat infrastructure receipt as human acknowledgement. No simulated emergency banner may appear as a working service.

## Dependency graph

Authentication/context → duty policy → eligibility → assignment.
Common request + package validation → intake → assignment → tracking.
Authorised spatial data → zone resolution → recommendation; travel routing remains a separate provider operation.
Authorised event origin + recipient policy + delivery contracts → SOS/comms.
All reads/writes → context, entitlement, audit and recovery controls.

## Reuse proof

Use one non-production contrasting package fixture with non-vehicle fields and a distinct capability requirement. Exercise identical shared request, duty, eligibility, routing and history interfaces. No real second department, grants or cloud resources are provisioned. Assert the common API rejects parking-only assumptions and prevents another branch from reading the fixture without permission.
