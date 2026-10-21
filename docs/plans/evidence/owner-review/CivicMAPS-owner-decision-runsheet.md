# CivicMAPS owner decision runsheet

Version 1.0 | 19 October 2026 | Australia/Melbourne

Status: proposed decisions; none selected.

Choose one option (A, B or C) for each numbered question. (R) marks the recommended option. Leave unresolved items blank and record the responsible person and condition. Recommendations are not selections.

Validation basis: options were checked against the source-backed Checkpoint B findings, approved D02/D03 behavior and the GOV requirements. They are reasonable design or assessment courses, not claims that the proposed systems are implemented, customer-approved or legally certified. Selection sets direction; dependent boundary changes still require a concrete design and review. It does not authorize production spend, deployment, disposal or F09 suspension.

Preserve the existing ADMIN operational exclusion, Alpha’s usable admin, Beta’s disabled admin/no sessions, council scope, audit history, and D03 disable/re-enable ordering. New powers must be explicit. Governance does not impose a blanket development hold.

## 1. Who should be able to administer council staff and approve increased access?

G02 / GOV-02, GOV-03

(R) A. **Council administration with independent approval.** Council administrators handle routine staff changes; a second authorized council approver signs off new administrators and increased operational access. No self-approval.

B. **Central council security team.** A designated council security team executes access changes; another authorized person approves privilege increases. No self-approval. Strong central control, with a larger support workload.

C. **Delegated branch administration.** Branch administrators manage routine access within approved branch limits; a council-level approver authorizes elevated or cross-branch access. Requires a more detailed delegation model.

Why recommended: The current ADMIN has no staff-management powers. Option A enables council self-administration while checking privilege escalation.

Next action after selection: Define the new administration permission set separately from operational CommandMAPS; keep existing ADMIN operational exclusion.

Selection: ____   Decision owner: __________________   Conditions: __________________

## 2. At what scope should a person receive operational permissions?

G02 / GOV-02, GOV-03

(R) A. **Per operating context.** Grant roles separately for each approved council/branch context. A change in one context cannot expand another.

B. **Per council with explicit branch limits.** Use a council role plus an explicit list of allowed branches. Suits councils with consistent duties across branches.

C. **One identity per council.** Keep separate council identities, each with explicit branch permissions. Simplifies council separation but increases sign-in and account administration.

Why recommended: Current roles sit on the user identity while context selection changes scope. Option A directly addresses the risk of a role change affecting another context.

Next action after selection: Design grant replacement and revocation history; verify cross-council and cross-context negative cases before migration.

Selection: ____   Decision owner: __________________   Conditions: __________________

## 3. How should council staff prove their identity and sign in?

G02 / GOV-03, GOV-05

(R) A. **Council single sign-on preferred; governed fallback.** Use the council identity provider where available. Permit a separately approved CivicMAPS account path with MFA for councils without one; local authorization remains explicit.

B. **Council single sign-on required.** Require a council identity provider and MFA policy before onboarding. Reduces local credential handling but excludes councils that cannot yet federate.

C. **CivicMAPS accounts with MFA.** Provide managed local sign-in and MFA, with council-owned joiner/mover/leaver approval. Requires CivicMAPS credential recovery and lifecycle controls.

Why recommended: Customer identity readiness is not yet known. Option A supports varied councils while requiring stronger verification than the current synthetic bootstrap.

Next action after selection: Select and review identity audiences, session boundaries, revocation and provider failure behavior. No identity provider purchase is approved here.

Selection: ____   Decision owner: __________________   Conditions: __________________

## 4. How should first administrators, additional administrators and lockout recovery be established?

G02 / GOV-03, GOV-09

(R) A. **Two verified council administrators.** Independently verify initial council authority, enroll two named administrators with MFA, and require a second authorized council person for privileged recovery.

B. **Council identity-provider administration.** Use independently verified council identity-provider groups for administrator nomination and recovery. Requires option 3A or 3B and a separate emergency procedure.

C. **One administrator plus a council recovery custodian.** Enroll one active administrator and a separately verified council recovery custodian. Recovery requires that custodian and audited operator execution; the operator cannot approve it alone.

Why recommended: The current operator receives a bearer activation link, and D02 has no post-activation recovery. Option A reduces both operator dependence and single-person lockout.

Next action after selection: Do not give existing bootstrap tokens new powers. Define administrator replacement, emergency evidence and recovery audit before implementation.

Selection: ____   Decision owner: __________________   Conditions: __________________

## 5. Who should create branches and replace operating contexts or revoked access?

G02 / GOV-02, GOV-03; G05 / GOV-08

(R) A. **Council approval with controlled version replacement.** Council administrators propose structural changes; a second council approver authorizes them. The service creates new versions and preserves old bindings, grants and record origins.

B. **Council central administration only.** A designated central council team manages structural versions and regrants under documented internal approval. Simpler delegation, more central workload.

C. **Council request with operator-assisted execution.** The council approves each structural change; an operator executes a bounded audited procedure. Useful during transition, but the operator cannot decide council grants.

Why recommended: Bindings and revoked grants are immutable today. Option A supports self-administration without rewriting historical ownership or reviving old grants.

Next action after selection: Specify replacement/rehire semantics and human, approver and target attribution; preserve all historical origins.

Selection: ____   Decision owner: __________________   Conditions: __________________

## 6. How should councils activate features within their licence?

G02 / GOV-02, GOV-03

(R) A. **Council activation within the commercial ceiling.** The operator sets the contracted feature ceiling; a council administrator chooses which licensed features are active. Neither action creates identities or assigns role grants; activation changes feature capabilities for already-authorized roles under D03.

B. **Council request with operator execution.** The council approves activation/deactivation and the operator applies that exact request. Offers a controlled assisted rollout at the cost of operator dependence.

C. **Two-party approval for activation changes.** A council approver and operator both approve every activation/deactivation. Suits contracts needing joint control but adds turnaround time.

Why recommended: Option A matches the owner’s requirement for council control of functionality while preserving commercial entitlements and separate staff grants.

Next action after selection: Preserve D03 retained review, disable/write ordering and audited re-enable. Municipality suspension remains a separate F09 decision.

Selection: ____   Decision owner: __________________   Conditions: __________________

## 7. Who should approve high-impact platform operations affecting a council?

G02 / GOV-02; G06 / GOV-11

(R) A. **Split operator duties with second-person approval.** Separate routine service work from activation, entitlement and route-withdrawal powers; require independent operator approval for high-impact actions, plus council authorization where the action changes council authority.

B. **A small privileged operator team.** Restrict high-impact actions to a named senior team, with mandatory reasons, council authorization where needed and independent post-action review. Less workflow overhead, more concentrated trust.

C. **Joint council/operator approval by default.** Require a council approver and a privileged operator for planned high-impact changes; define a narrow, recorded emergency service response with later review.

Why recommended: All active operators currently share broad control-plane powers. Option A introduces separation without making routine service work depend on council response.

Next action after selection: Define the action list, notice and emergency rules before enforcement. This selection does not approve F09 suspension policies.

Selection: ____   Decision owner: __________________   Conditions: __________________

## 8. What provider access boundary should the next production design target?

G03 / GOV-04, GOV-09

(R) A. **Controlled privileged access.** Develop a managed-service design with least privilege, temporary approved support access, separate deployment authority and council-visible audit. Provider technical access remains an explicitly governed trust.

B. **Dedicated managed council environments.** Design separate council runtime/data credentials and resources, with controlled privileged support. Improves separation but increases operating cost; dedication alone does not prevent provider plaintext access.

C. **Customer-controlled operation feasibility study.** Assess a design in which the council controls runtime, deployment and keys and grants support access. Proceed only after proving the trust boundary and recovery model; make no provider non-access promise before that evidence.

Why recommended: The present broker bypasses RLS and can read all control tables. Option A is the most direct bounded improvement; B and C are reasonable higher-separation paths needing additional design evidence.

Next action after selection: Selection authorizes design and cost assessment only. Production topology, key custody, support permissions and expenditure require separate approval.

Selection: ____   Decision owner: __________________   Conditions: __________________

## 9. Who should retain access to historical records when staff or structures change?

G05 / GOV-07, GOV-08; G02 / GOV-02

(R) A. **Dedicated council records-custodian permission.** Create an explicitly scoped records-custodian role for retained review/export; ordinary administrators receive no automatic operational-record access.

B. **Council records team with dual approval.** Restrict retained-record access and export to a records team; require an independent council approver for each exceptional access or export.

C. **Approved council archive with controlled handover.** Export records and provenance to a council-approved records system under verified acceptance; retain the source until reconciliation and lawful disposal authorization are complete.

Why recommended: Current officer visibility follows assignment; feature disable and route withdrawal are not records-custody workflows. Option A gives continuity with a clear accountable role.

Next action after selection: Preserve originals, provenance, audit and D03 retained review and write ordering. Custodian access adds no automatic ADMIN record access. Define departure, closure and exit scope; F09 suspension remains separate.

Selection: ____   Decision owner: __________________   Conditions: __________________

## 10. How should retention, legal holds and disposal be introduced?

G01 / GOV-01; G05 / GOV-07, GOV-08

(R) A. **Approve schedules first; automate disposal later.** Map each record class to the applicable council schedule, trigger and hold rules; implement holds and export first. Enable automated disposal only after separate approval and tested safeguards.

B. **Permanent human approval of each disposal batch.** Apply approved schedules and holds, but require records-custodian approval for every disposal batch. Lower automation risk with continuing manual workload.

C. **Delegate retention to an approved council records system.** Use a council archive as the authoritative retention/hold service, with verified transfer, reconciliation and separately authorized source cleanup. Depends on that system’s capability and contract.

Why recommended: There is no defensible universal national retention period. Option A provides a staged path that preserves records while customer-specific rules are validated.

Next action after selection: Council records/legal owners approve applicability and schedules; no selection authorizes immediate deletion or indefinite retention without review.

Selection: ____   Decision owner: __________________   Conditions: __________________

## 11. How should incidents and restoration be coordinated between operator and councils?

G01 / GOV-01; G06 / GOV-11, GOV-12

(R) A. **Joint response with separate accountable duties.** Operator leads technical containment and recovery; each council leads its statutory/customer decisions. Agree escalation, evidence preservation and restore checks that preserve revocations.

B. **Council-led response with operator execution.** Council incident leadership directs response under a service agreement; the operator performs technical actions, with narrowly agreed urgent containment powers.

C. **Independent managed response service.** Commission a qualified response provider under joint council/operator oversight, with scoped access and approved playbooks. Validate procurement, cost and service responsibilities first.

Why recommended: Council and private-operator legal duties differ. Option A names both responsibilities without inventing a single notification deadline.

Next action after selection: Set workflow/jurisdiction-specific notification triggers, contacts and recovery objectives. Recheck grants, holds, revocations and audit before restored service is released.

Selection: ____   Decision owner: __________________   Conditions: __________________

## 12. Who should approve the design and accept it for each council’s production use?

G01–G06 / GOV-01, GOV-02, GOV-06, GOV-11, GOV-12

(R) A. **Named joint acceptance owners.** The CivicMAPS owner approves product direction; operator security approves technical evidence; each council names its service, privacy/security and records decision owners for customer acceptance.

B. **Council-led assurance panel.** A council-led panel reviews the evidence and directs acceptance, with operator technical sign-off and the CivicMAPS owner approving product commitments. Suits larger or higher-risk deployments.

C. **Independent assessor plus accountable sign-off.** A qualified external assessor reviews the implementation and customer applicability; the operator and council retain their acceptance responsibilities. Requires separate procurement and budget approval.

Why recommended: Source review and CI demonstrate bounded behavior, not complete production or legal readiness. Option A establishes accountable decisions immediately without assuming an external assessor budget.

Next action after selection: Name people, scope, conditions and evidence owners. Retain Checkpoints B/C/D; functional work continues alongside specific pending decisions.

Selection: ____   Decision owner: __________________   Conditions: __________________

## Owner selection record

Owner/reviewer: __________________  Date: __________________

Record answers as 1A, 2B, etc. Blank means unresolved; no recommendation is preselected.

1. ____
2. ____
3. ____
4. ____
5. ____
6. ____
7. ____
8. ____
9. ____
10. ____
11. ____
12. ____

Selected decisions authorize direction only within the limits above. Return choices and conditions for a recorded implementation contract and the applicable advanced review.

## Evidence and validation

Evidence baseline: governance 04b7189bb610faa5c7b93915c175a5905870c7c6; integrated main 92b3eea8b8ecfd0505afb6d62d60a001903db161. The underlying Checkpoint B matrix received two Astra source reviews; this runsheet received a separate Luna consistency review; three wording gaps were corrected. That review validates consistency of proposed directions, not implementation or legal approval. Hosted run 39159642180 passed for substantive package 8ccb793; it does not validate future options as implemented.

- [Authority/data-flow matrix](https://github.com/TechCorp25/CivicMaps-rebuild/blob/04b7189bb610faa5c7b93915c175a5905870c7c6/docs/plans/evidence/2026-10-19-authority-data-flow-matrix.md)
- [Checkpoint B findings and disposition](https://github.com/TechCorp25/CivicMaps-rebuild/blob/04b7189bb610faa5c7b93915c175a5905870c7c6/docs/plans/evidence/2026-10-19-governance-checkpoint.md)
- [Approved D02](https://github.com/TechCorp25/CivicMaps-rebuild/blob/04b7189bb610faa5c7b93915c175a5905870c7c6/docs/plans/F07-D02-decisions.md)
- [Approved D03](https://github.com/TechCorp25/CivicMaps-rebuild/blob/04b7189bb610faa5c7b93915c175a5905870c7c6/docs/plans/F08-D03-decisions.md)
- [GOV requirements](https://github.com/TechCorp25/CivicMaps-rebuild/blob/04b7189bb610faa5c7b93915c175a5905870c7c6/docs/plans/governance-and-production-readiness-gate.md)
- [National obligations register](https://github.com/TechCorp25/CivicMaps-rebuild/blob/04b7189bb610faa5c7b93915c175a5905870c7c6/docs/plans/national-governance-obligations-register.md)
