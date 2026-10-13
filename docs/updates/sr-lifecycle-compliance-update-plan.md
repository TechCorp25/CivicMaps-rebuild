---
title: "SR Lifecycle Compliance Update Plan"
project: MAPS (Municipal Area Patrol System)
spec_reference: service-requests-workflow.md
version: 1.0.0
status: planned
date: 2026-04-07
tasks_total: 3
layers: [Server, Shared, CommandMAPS, Database]
---

# SR Lifecycle Compliance Update Plan

## Objective

Bring SR lifecycle implementation into compliance with `service-requests-workflow.md` spec.

---

## Tasks

### T001 — Add Missing Statuses to All Layers

Add missing statuses (`ATTENDED`, `PIN_ISSUED`, `CLOSED`, `VOIDED`) to database enum, shared contracts, and UI.

| Field | Detail |
|-------|--------|
| Blocked By | — |
| Files | `civicmaps/shared/schema/enums.ts`, `civicmaps/shared/contracts/code21.ts`, `civicmaps/server/src/db/migrate.ts`, `civicmaps/commandmaps/src/features/code21/Code21Page.tsx` |
| Acceptance | All four new statuses exist in DB enum, shared code, and UI |

---

### T002 — Status Transition Enforcement, Close/Void Endpoints, PIN RBAC, Field Locks, SR Number Rejection

Implement server-side status transition validation, administrative close endpoint, void endpoint, Admin PIN issuance exclusion, field lock enforcement, and `sr_number` payload rejection.

| Field | Detail |
|-------|--------|
| Blocked By | T001 |
| Files | `civicmaps/server/src/modules/code21/code21.routes.ts`, `civicmaps/shared/roles.ts`, `civicmaps/shared/schema/enums.ts` |
| Acceptance | Server validates transitions per spec, close/void endpoints work with correct RBAC, Admin cannot issue PIN, locked fields rejected, `sr_number` in any create/edit payload rejected |

---

### T003 — CommandMAPS UI Updates, Testing, Work Report

Update CommandMAPS UI to reflect all new statuses and field lock states. Run end-to-end tests. Produce work report.

| Field | Detail |
|-------|--------|
| Blocked By | T002 |
| Files | `civicmaps/commandmaps/src/features/code21/Code21Page.tsx`, `civicmaps/docs/work-reports/` |
| Acceptance | UI reflects all new statuses, e2e tests pass, `work-report.md` created |