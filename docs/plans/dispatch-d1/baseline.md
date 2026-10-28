# Dispatch D1 baseline and scope

This is a partial D1 implementation, not acceptance of the complete dashboard. The execution contract is the [dispatch workplan](https://github.com/TechCorp25/CivicMaps-rebuild/blob/95a907c32742c2a251786ca7f44712d58d0038f5/docs/plans/dispatch-recon-2026-10-28/workplan.md). The base is main commit `681ac555e2c24ff6a85af3d216872c8e0f0f4b10`, tree `ed78c412ea7cf32c6570503584c2052a6558ac53`. GitHub PR46 merged head `1050d90f92bdecb4f34700c31b01506cff683d87` and PR47 merged head `7e1d23944229231524a841fbcf98c662c7791d6d`. The independent M1 assessment applies to its own exact candidate; M0 is architecture acceptance only.

## Contract and decision ledger

- The [shared service contracts](../dispatch-build/shared-service-contracts.md) retain server-scoped reads, the five-state model, cursor/count discovery, independent selected detail and audit, and write/version/idempotency controls. The [decision ledger](../dispatch-build/decisions-and-dependencies.md) identifies D-DUTY, D-INTAKE, D-ROUTING, D-GIS, D-SAFETY and D-LIFECYCLE as gates for their affected features. G1 commissioning is a separate authority question, not blanket permission for dashboard operation.
- The current user direction in the workplan supersedes historical model assignments and resolves the queue-first design example in favour of a map-first shell with an accessible queue. The Places API (New) and location-picker constraints are retained. The B2 radio-label conflict remains unresolved and is not addressed by this change.
- The map consumes loaded queue records and the independently selected record, not a complete spatial search. Provider SDK tests use synthetic data. Live provider restrictions, billing, terms and disclosure remain unqualified. Existing field scaffolds do not prove operational field integration.
- Existing F11E recovery, M1 discovery and P1 location picker remain in place; this change does not alter server contracts, permissions, storage or migrations. No G1–G4 acceptance, live operation, deployment or customer acceptance is implied.

## D1 partial slice

Requirements: distinguish queue loading, empty and unavailable states; identify stale retained map records and limited map coverage; keep the queue usable when map setup fails; permit map retry; preserve the existing detail and location workflows. Tests target initial failed queue, failed refresh with retained data, pagination beyond the first page and synthetic map marker failure/retry. This slice does not establish all D1 acceptance: full B0 decision reconciliation, desktop/narrow visual assessment, broader scope, race and provider qualification, and independent review remain required. The exact commands and results belong in the external candidate audit packet for the frozen commit.
