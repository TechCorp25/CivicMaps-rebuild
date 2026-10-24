# Shared-services dispatch build programme

## Current reconciliation — 24 October 2026

Verified `main@c92667e8bd9b12055f2714bac16e6d97008c0d70` includes owner-merged PR #39 and M1 PR #40, including its later Codex review fixes. P0 v1.1.1 remains accepted at its recorded candidate; the corrected canonical plan is v1.1.2 and requires fresh reassessment. M1’s Astra acceptance remains scoped to `d905b85`, with subsequent review fixes recorded separately. G1 commissioning remains owner-blocked: the 24 October receipt records authentication direction only. Use the [current machine-readable checkpoint](next-build-phase-checkpoint.json) for current status. The [v1.0.0 plan retained from main](next-build-phase-v1.0.0.md) preserves the detailed verification, provenance and audit requirements alongside the current [v1.1.2 plan](next-build-phase.md). Historical audit and publication receipts remain scoped to their recorded candidates.

## Historical phase checkpoint — 23 October 2026

Canonical phase plan: [M1 discovery and F11 G1 authority contract, v1.1.2](next-build-phase.md). Verified current main is `c92667e8bd9b12055f2714bac16e6d97008c0d70` (PR #40 merge). M1 is accepted at audited candidate `d905b85ca7f0c2a20eaa956b0448ed7f5581f47b`; its recorded Astra acceptance remains scoped to that candidate. G1 v1.5 is a proposal in PR #42 and remains blocked pending owner designation of commissioning authority, external council trust-record source/admission procedure, and initial council decision-maker evidence. The 24 October receipt records authentication direction only. Fresh G1 and amended-plan reassessment are pending. G2 remains excluded and blocked until G1 acceptance and owner merge.

Historical snapshot prepared 21 October 2026 (Australia/Melbourne); superseded by the current checkpoint above. At that time, the receipt-only PR #37 and M0 review were being tracked against then-current main `6761cd6adcd9f922aed939ccafb75f81cf7eba62`. The then-current execution base was `d4921eb1c37550d9ca1b53a5615242922abfa4ad`. M0 architecture/backlog acceptance remains distinct from functional acceptance. See the [final assessment](evidence/M0-independent-assessment-a1a9a9a.md).

Historical preparation metadata: repository `TechCorp25/CivicMaps-rebuild`; programme-preparation base `313d9a3fc5b2f66819bfaa52019600c3e167eda7` (owner-merged PR27 including PR26; deployed separately); then-current main `6761cd6adcd9f922aed939ccafb75f81cf7eba62`, including PR35 and PR36. These are retained as historical provenance and are not the current phase base. The M0 source-reconciliation baseline `65757b67669e7f9e79fcd160d5e5de23d9d7d42f` is historical. See the [release receipt](../evidence/dispatch-release-closure.md) and [M0 evidence](evidence/M0.md).
Empirical programme memory: **6ad7c3b6beb1d9647062ebd8**. Requirements memory: 6ad4c84fbeb1d9647060a4f3. Release memory: 6ad4c8e8beb1d9647060a602.

## Outcome

Build a usable Parking Services dispatch workspace in CommandMAPS on shared operational services. Operators can discover all authorised work, capture meaningful requests, resolve spatial context, deliberately assign eligible officers, follow confirmed progress and recover safely. Parking is the first consumer, not the owner of common services. This programme extends beyond visual polish and includes necessary backend work.

Shared code does not grant shared access. Council, branch, role, capability and context boundaries remain enforced server-side. Authentication is not operational sign-on. Provider integration is not permission to disclose location. A demo is not a safety service.

## Authority

Current owner decisions take precedence; use the [signed decision assessment](../evidence/2026-10-19-signed-owner-decisions-assessment.md) and [independent reassessment](../evidence/2026-10-19-signed-owner-decisions-review.md) as the current reconciled direction, with their stated provenance and release limits. `_ds` decisions, canonical tokens/components, accessibility rules, wireframes and annotations are design authority; approved rebuild contracts govern server behaviour. CivicMAPS/CivicMaps-preview supplies behavioural evidence only. Do not copy its single-parking schema, role assumptions, credentials, hardcoded travel mode or offence catalogue. Record source conflicts; do not resolve policy by copying UI-kit demonstrations.

Headers show department/role identity, not personal names. Shared lifecycle presentation must be truthful. Do not invent live WebSockets, officer positions, ETA, auto-dispatch, infringement outcomes or SOS delivery.

## Read order and deliverables

0. [Current next build phase: M1 and F11 G1](next-build-phase.md) (canonical v1.1.2; amended plan and G1 reassessment pending).

1. [Luna execution handoff](execution-checkpoint.md).
2. [Reference and gap matrix](reference-and-gap-matrix.md).
3. [Shared service contracts](shared-service-contracts.md).
4. [Decisions and dependencies](decisions-and-dependencies.md).
5. [Milestone contracts](milestones/README.md).
6. [M0 assessment and evidence](evidence/M0.md).

The ledger retains F11 as the single active implementation feature and F12 as its successor. DISPATCH-M0 architecture/backlog assessment is complete; functional acceptance remains pending. The [F11 authority plan](../F11-next-phase-build-plan.md) and [checkpoint](../F11-execution-checkpoint.json) remain required for council staff authority; this programme does not grant or complete that authority.

## Programme sequence

M0 architecture/contracts → M1 complete discovery → M2 Code2/duty → M3 package-aware intake → M4 assignment/dispatch routing → M5 maps/zones/travel routing → M6 tracking/recovery → M7 qualification/release. Dependencies, rather than numbering alone, determine readiness: progress independent work when an affected contract is blocked; never start competing governance fixes.

### Required council authority work

The F11 authority track is part of this programme's release contract and is owned by the functional builder. It is separate from the governance-owned PR25 corrections. M1–M6 do not implicitly implement staff provisioning or council administration; complete the explicit G2/G3 products below as bounded F11 work before integrated qualification.

| F11 goal | Place in the programme | Required product and gate |
| --- | --- | --- |
| G1 — Council staff authority contract | During M0, before G2 implementation | Actor/action/context matrix, API and migration contract using approved decisions; fresh-context Astra Low acceptance before dependent code. M0 shared-service design alone does not satisfy G1. |
| G2 — Server staff provisioning | Dedicated F11 authority implementation after accepted G1; independent M1–M3 work may proceed where it does not depend on G2 | Council-bound staff invitation/activation, grants/revocation/disable, expiry/replay, concurrency/idempotency and immutable audit, with direct API denials and synthetic migration tests. Require G2 audit before dependent integration. |
| G3 — Council administration UI | Dedicated F11 council administration implementation after G2; integrate before the M4/M6 new-council journeys | Separate authorised administration UI for G2, safe retries and accessible feedback; retain ADMIN operational exclusion. Include it in the G3/G4 independent assessment. |
| G4 — Connected council-to-CommandMAPS lifecycle | Across M4/M6 integration, after G2/G3; required before M7 | Two newly provisioned councils: activated admin provisions staff, then create → assign → acknowledge → attend → close; test cross-council/context denials, revocation, disabled-pack retained review and recovery. Existing seeded staff cannot substitute for this acceptance. Require the G3/G4 audit. |
| G5 — Final assessed release | M7, only after accepted G1–G4 and applicable M0–M6 milestones | Final published candidate assessment, required CI, owner merge and verified deployment/recovery evidence under the established release procedure. |

M7 must stop if any G1–G4 product, executable acceptance evidence or required audit is missing. Record exact accepted commits/reports in the F11 checkpoint and M7 release packet. Independent preparation can continue, but missing council authority cannot be deferred past release or labelled complete by dispatch-only tests.

Luna Medium implements bounded milestones. Stronger-model gates: M0 architecture, duty/intake/assignment integration, spatial/tracking integration, final release. Each milestone uses a new branch from verified main, evidence, exact remote SHA, draft PR, CI and Codex review. Owner merges; dependent implementation waits for owner merge. No auto-merge.

## Completion and exclusions

Core acceptance includes realistic Parking Services journeys plus a test-only contrasting package proving common services do not require parking fields. This fixture neither selects nor provisions the next real department. The current five-state lifecycle remains until additional semantics are approved.

SOS, notifications/communications, EnforcementMAPS integration, infringement/evidence outcomes and extended lifecycle transitions are explicit subsequent milestones using the same shared contracts. Define their boundaries now; do not expose operational controls before policy and delivery guarantees are approved and tested. Staff provisioning, suspension policy and production compliance are not implicitly completed by this programme.

## Verification

Every milestone needs source/annotation trace, API and permission evidence, relevant automated tests and inspected desktop/narrow screenshots where UI changes. Run repository lint, formatting, types/builds, integration and relevant browser suites. Test more than 100 requests, older active work, two councils, two package fixtures, denied cross-branch access, disabled-pack review, ADMIN exclusion, concurrent actions, uncertain responses, session loss, historical data and provider outages. Never reset retained data or publish credentials.
