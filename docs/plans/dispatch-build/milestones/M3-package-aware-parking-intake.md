# M3 — Package-aware parking intake

Status: contract prepared; implementation has not started. PR #31 is still draft and must be owner-merged before a dependent implementation branch is created.

## Goal and work

Build common location/review/submit/recovery flow plus allowlisted Parking payload; optional vehicle and approved catalogue/classification. Historical records remain readable.

## Dependencies and stop conditions

M0 reviewed; D-INTAKE for affected mandatory rules. Independent of queue fix for contract work.

Read current decisions/dependencies before starting. Ask only for unresolved policy affecting this contract. Continue a ready independent milestone when blocked, recording the reason. Do not expand scope to hide an unresolved dependency.

## Proposed common/package API contract

The following pins the safe technical boundary for review. It does not choose required parking fields, a vehicle-registration rule, a classification catalogue, or an offence outcome. Those remain under D-INTAKE.

### Create

Keep `POST /api/requests` and its existing common fields. The additive request shape is:

```json
{
  "address": "Synthetic location",
  "latitude": -37.81,
  "longitude": 144.96,
  "notes": "Dispatch notes",
  "packageData": {
    "schemaVersion": 1,
    "fields": {}
  }
}
```

- `address`, `latitude`, `longitude`, and `notes` retain their existing validation and meaning.
- `packageData` is a closed object with a positive integer `schemaVersion` and a JSON object `fields`. The version is a package schema version, not a request version.
- The request must not include `packId`, branch, council, tenant, jurisdiction, organisation, or context identifiers. The server derives the effective context and `packId` through the existing authenticated context and entitlement path.
- A static server registry selects the validator by the server-derived `packId` and `schemaVersion`. Each package validator rejects unknown fields and values that fail its declared type, size, or enum constraints. Do not load executable schemas or let a client define validation rules.
- The actor must retain the existing `requests.create` entitlement and DISPATCHER permission. Malformed `packageData` or unknown payload fields are `400`; a known but stale/unsupported schema version is `409` and requires refreshing the intake contract; an unavailable or disabled package/capability is `403`. Keep existing CSRF, context-version, transaction, audit, and idempotency behaviour.
- For a bounded compatibility window, omission of `packageData` may be treated as a legacy version-zero empty payload and stored explicitly as such for new writes. New CommandMAPS intake sends the current package version. End this window before any D-INTAKE rule makes a package field mandatory; after that, the server rejects version zero for that package. Do not use compatibility to bypass an approved mandatory field.
- Idempotency fingerprints include the full common input and package payload. Replaying the same key and input returns the original receipt; changing package fields while reusing a key remains `409` under the existing mutation contract.

### Persist and read

- Add `package_id` (text), `package_schema_version` (integer), and `package_payload` (JSON object) as nullable request columns in one versioned, additive migration. New submissions persist the server-derived package ID and validated payload in the same transaction as the request and audit event.
- Leave all pre-migration rows null in these columns; do not fabricate package classification. Details and audit continue to use the existing authorised request queries and context scope.
- Include the persisted package ID, version, and payload in request responses. A record's captured package identity must not be recomputed from today's branch mapping or pack enablement.
- Retain API response fields used by current CommandMAPS clients. Do not change status transitions, assignment authority, current five-state lifecycle, or queue pagination in M3.

### Reuse and verification boundary

Use the existing server-resolved `entitlements.packId` and enabled capability check; never accept a client-selected package. A test-only contrasting package must use a non-parking payload through the same request path and persist/read contracts. Run it in an isolated test database without provisioning a real branch, department, account, or cloud resource. Keep D-INTAKE open for the parking field allowlist, catalogue source/version, requiredness, vehicle validation, and any jurisdiction-specific rules.

### Schema and rollback

The additive columns are nullable so historical rows and the existing application remain readable during rollout. The compatibility review must test both old application/new schema and new application/old rows. Rollback is an application revert with unused nullable columns retained; do not drop captured data or run a destructive down migration. No seed/bootstrap replay or live data migration is required.

This contract is a proposed review target, not an implementation approval. Pin exact field validators only after D-INTAKE is resolved and this contract has passed the M0/Astra review gate.

## Acceptance

Review/edit/retry retains input; one confirmed request; contrasting package requires no parking fields; persisted detail reloads accurately.

Required targeted scenarios: invalid/unknown fields, client-supplied package/context identifiers, stale schema, disabled package, two councils/packages, duplicate/lost response, old rows, captured package surviving later mapping changes, old-app/new-schema compatibility, new-app/old-row compatibility, keyboard/narrow.

## Execution sequence

1. Verify clean current main, merged dependencies, applicable AGENTS, Empirical and `_ds` sources. Record exact base.
2. Create fresh `codex/civicmaps-dispatch-m3` branch/worktree; no governance worktree edits.
3. Pin behaviour, exact API changes and compatibility tests before implementation. Keep shared-service/package boundaries explicit.
4. Implement a small vertical slice, add meaningful tests, then complete this contract. No mocked success for unavailable services.
5. Run required repo checks and applicable browser tests; inspect screenshots against annotation markers. Record limits honestly.
6. Update evidence/matrix/checkpoint; obtain required stronger-model gate and fix supported findings.
7. Commit/push, verify remote SHA, draft PR, hosted CI and Codex review; update Empirical. Do not merge/auto-merge.
8. Wait owner merge before dependent implementation. Deployment is a separate pinned authorised action.

## Review packet

Goal/result, exact diff/SHA, source trace, shared-service reuse proof, tests/screenshots, migrations/recovery, policy dependencies, residual gaps. Stronger-model approval must be explicit, never inferred from a running review or Luna's self-assessment.
