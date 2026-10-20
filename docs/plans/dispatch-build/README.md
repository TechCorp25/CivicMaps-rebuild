# Shared-services dispatch build programme

Prepared 21 October 2026, Australia/Melbourne. Owner approved the staged programme and explicitly required shared services across branches. **Status: M0 architecture and handoff prepared; independent gate review pending. No new functional capability or deployment is claimed.**

Repository: TechCorp25/CivicMaps-rebuild. Base: `313d9a3fc5b2f66819bfaa52019600c3e167eda7` (owner-merged PR27 including PR26; deployed separately). PR30 release documentation remains separate and open at preparation. Branch: `codex/civicmaps-dispatch-programme`.
Empirical programme memory: **6ad7c3b6beb1d9647062ebd8**. Requirements memory: 6ad4c84fbeb1d9647060a4f3. Release memory: 6ad4c8e8beb1d9647060a602.

## Outcome

Build a usable Parking Services dispatch workspace in CommandMAPS on shared operational services. Operators can discover all authorised work, capture meaningful requests, resolve spatial context, deliberately assign eligible officers, follow confirmed progress and recover safely. Parking is the first consumer, not the owner of common services. This programme extends beyond visual polish and includes necessary backend work.

Shared code does not grant shared access. Council, branch, role, capability and context boundaries remain enforced server-side. Authentication is not operational sign-on. Provider integration is not permission to disclose location. A demo is not a safety service.

## Authority

Current owner decisions take precedence. `_ds` decisions, canonical tokens/components, accessibility rules, wireframes and annotations are design authority; approved rebuild contracts govern server behaviour. CivicMAPS/CivicMaps-preview supplies behavioural evidence only. Do not copy its single-parking schema, role assumptions, credentials, hardcoded travel mode or offence catalogue. Record source conflicts; do not resolve policy by copying UI-kit demonstrations.

Headers show department/role identity, not personal names. Shared lifecycle presentation must be truthful. Do not invent live WebSockets, officer positions, ETA, auto-dispatch, infringement outcomes or SOS delivery.

## Read order and deliverables

1. [Luna execution handoff](execution-checkpoint.md).
2. [Reference and gap matrix](reference-and-gap-matrix.md).
3. [Shared service contracts](shared-service-contracts.md).
4. [Decisions and dependencies](decisions-and-dependencies.md).
5. [Milestone contracts](milestones/README.md).
6. [M0 assessment and evidence](evidence/M0.md).

## Programme sequence

M0 architecture/contracts → M1 complete discovery → M2 Code2/duty → M3 package-aware intake → M4 assignment/dispatch routing → M5 maps/zones/travel routing → M6 tracking/recovery → M7 qualification/release. Dependencies, rather than numbering alone, determine readiness: progress independent work when an affected contract is blocked; never start competing governance fixes.

Luna Medium implements bounded milestones. Stronger-model gates: M0 architecture, duty/intake/assignment integration, spatial/tracking integration, final release. Each milestone uses a new branch from verified main, evidence, exact remote SHA, draft PR, CI and Codex review. Owner merges; dependent implementation waits for owner merge. No auto-merge.

## Completion and exclusions

Core acceptance includes realistic Parking Services journeys plus a test-only contrasting package proving common services do not require parking fields. This fixture neither selects nor provisions the next real department. The current five-state lifecycle remains until additional semantics are approved.

SOS, notifications/communications, EnforcementMAPS integration, infringement/evidence outcomes and extended lifecycle transitions are explicit subsequent milestones using the same shared contracts. Define their boundaries now; do not expose operational controls before policy and delivery guarantees are approved and tested. Staff provisioning, suspension policy and production compliance are not implicitly completed by this programme.

## Verification

Every milestone needs source/annotation trace, API and permission evidence, relevant automated tests and inspected desktop/narrow screenshots where UI changes. Run repository lint, formatting, types/builds, integration and relevant browser suites. Test more than 100 requests, older active work, two councils, two package fixtures, denied cross-branch access, disabled-pack review, ADMIN exclusion, concurrent actions, uncertain responses, session loss, historical data and provider outages. Never reset retained data or publish credentials.
