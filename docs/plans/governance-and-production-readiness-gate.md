# CivicMAPS governance and production readiness gate

Prepared 18 October 2026 (Australia/Melbourne) by Codex (agent).

**Status: assessment and proposed remediation programme. The owner clarified that functional development continues while governance is actively resolved in parallel; there is no blanket development gate. Detailed production policy, architectural choices and compliance acceptance remain unresolved.**

## Purpose and authority

The owner requires council administration, operator authority, cloud services and handling of the platform's full range of records to be actively resolved alongside continued functional development, including dispatch. Councils require their own administration surface for branches, functionality and staff. CommandMAPS is operational software; its current ADMIN profile is not a completed council administration portal.

The owner's scope includes employee details, identities, public/service requests, infringements, receipts, evidence/media, operational records, officer locations and audit trails. Sensitive and health information must be considered where workflows can capture it, including free text or media. Inclusion in the assessment does not authorise collecting every category. Each workflow needs a purpose, lawful authority, minimum dataset, responsible council and approved handling rules.

The owner's correction supersedes the earlier blanket development hold. This document retains production acceptance requirements and concrete feature dependencies, not a pause on all development. F08's completed deployment, entitlement enforcement, live acceptance and compatible recovery remain valid within their documented synthetic development scope. Do not redeploy F08, replay migration 013 or downgrade to F07 as a response to this assessment. Preserve Alpha's usable administrator, Beta's disabled administrator, existing records/audit and retained Sydney resources/checkpoints through 21 October under the saved US$50/month development allocation.

The [current-state assessment](evidence/2026-10-18-governance-review.md) reconciles all 65 supplied findings, source revisions and read-only infrastructure observations. It identifies a production architecture gap, two confirmed static security paths and a separate engineering backlog. It does not establish a legal breach, certification, incident or completed remediation.

## Applicability baseline

The owner confirmed all Australian states and territories. The [national obligations register](national-governance-obligations-register.md) covers the eight state/territory government systems and flags external-territory arrangements for explicit mapping. The table below supplies additional Victorian detail; it is not the national baseline by itself. The operator's own obligations and each customer's obligations must be assessed separately, including contractual flow-down. Detailed legal/customer validation remains open for every jurisdiction.

| Source | Applicability established or to determine | Required assessment output |
| --- | --- | --- |
| Victorian Privacy and Data Protection Act 2014 and IPPs | OVIC says Victorian councils must comply with the IPPs. Establish contracted-provider arrangements and responsibility for each data flow | Privacy impact assessment; purpose/collection notices; access/correction, permitted use/disclosure, security and transfer controls. [OVIC council guidance](https://ovic.vic.gov.au/privacy/resources-for-organisations/local-government-and-privacy/) |
| Victorian protective data security framework/standards | Councils are generally excluded from Part 4 and direct VPDSS coverage. Exceptions include information/systems managed for regulated entities; contracts can add requirements | Document applicability and contractual adoption, rather than asserting every council is directly bound. [OVIC local government security guidance](https://ovic.vic.gov.au/information-security/local-government-authorities-information-security-considerations/) |
| Victorian transborder transfers, IPP 9 | Sending personal information to a provider outside Victoria can include interstate processing, not only offshore processing | Record a valid transfer ground and safeguards for Sydney hosting, backups, telemetry, support and subprocessors. Sydney hosting is neither automatic compliance nor automatic prohibition. [OVIC IPP 9](https://ovic.vic.gov.au/book/ipp-9-transborder-data-flows/) |
| Public Records Act 1973; PROV standards and applicable RDAs | Council data/information are public records; outsourcing does not remove council responsibility | Map record classes, retention triggers, holds, authorised disposal, export/preservation, ownership and supplier exit. Backups are not a retention schedule. [PROV local government](https://prov.vic.gov.au/recordkeeping-government/a-z-topics/local-government), [cloud guidance](https://prov.vic.gov.au/recordkeeping-government/a-z-topics/cloud-services) |
| Victorian FOI and local-government transparency/confidentiality | Council records need controlled retrieval and disclosure processes, with applicable exemptions/confidentiality | Search/export completeness, authorised redaction/release, access logging and legal holds; no automatic public access to private council records. [OVIC council information framework](https://ovic.vic.gov.au/freedom-of-information/resources-for-agencies/practice-notes/framework-for-releasing-council-information-proactively-and-informally-under-the-local-government-act-2020-vic-and-the-freedom-of-information-act-1982-vic/) |
| Health Records Act 2001 and HPPs | Conditional on handling health information; government and private-sector organisations can be covered | Identify health information in staff records, reports, attachments and incident evidence; map its special handling and transfer requirements. [Victorian health guidance](https://www.health.vic.gov.au/legislation/health-records-act) |
| Commonwealth Privacy Act 1988 / APPs and breach-notification duties | The federal Privacy Act generally does not cover state/local government agencies, but the private operator may be covered depending on its circumstances. Commonwealth contracts can add obligations | Establish operator applicability, contracts and incident duties; do not apply a universal breach-notification clock to every council/data class. [OAIC jurisdiction guidance](https://www.oaic.gov.au/privacy/privacy-legislation/state-and-territory-privacy-legislation), [APP applicability](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-a-introductory-matters) |
| PSPF, ISM, Essential Eight / ASD Essentials and cloud assurance | Assess law/policy/contract applicability individually. PSPF's mandatory federal scope is not a blanket requirement for every council | Select and version the control baseline, required assessment boundary and authorising party. Cloud-provider evidence does not assess CivicMAPS application configuration. [PSPF applicability](https://www.protectivesecurity.gov.au/about/applying-protective-security-policy-framework), [ASD cloud assessment](https://www.cyber.gov.au/publication/cloud-assessment-and-authorisation) |
| Infringements, fines, evidence, surveillance, employment, payments and other departmental laws | Workflow-specific applicability is not yet determined; the generic platform name does not establish legal authority | Obtain council/legal review of each implemented workflow, surveillance/location purpose, evidence use and financial obligations. Record exact instruments, versions, duties and exceptions before enabling it |

This is an initial source-backed applicability register, not a final legal opinion. The accountable council privacy, records, legal and security functions must validate applicable obligations and any residual-risk acceptance. Current source and AWS checks do not replace that review.

## Administration and trust boundaries

The required product distinction is:

1. **CivicMAPS operator administration:** tenant/service lifecycle, commercial entitlements, deployment and sanitised service health under defined authority.
2. **Council administration:** the council's branches, delegated administrators, staff lifecycle, roles, local configuration and activation of licensed features.
3. **Council operations:** authorised command, dispatch, field enforcement and departmental workflows within explicit operating contexts.

Operator status must not implicitly grant council record access, staff provisioning, arbitrary grant authoring or impersonation. Define the boundary between a commercial entitlement ceiling and council approval to activate a feature; a platform operator changing a subscription must not silently create staff permissions. A later implementation must introduce council administration rights explicitly without widening the current F07 ADMIN role by accident.

Application operators, support personnel, AWS administrators, database administrators and service/deployment identities are different actors. The current broker and infrastructure administrators remain trusted across the synthetic councils. Removing council screens from an operator dashboard does not remove their infrastructure access. Ordinary encryption at rest, per-council prefixes and a separate website do not prove that a provider operating the runtime cannot access plaintext.

An absolute provider non-access requirement needs a separately evaluated technical and operational model, including who can deploy code, obtain runtime identity, access keys, restore backups and inspect memory. Customer-managed keys alone do not establish non-access when the same provider-controlled runtime can use them. The owner/council must choose the intended threat boundary; no such architecture is silently approved here.

Separate operator and council registered domains are a candidate browser-isolation measure. Sibling subdomains have no inherent administrative hierarchy, and a different registered domain does not isolate the backend. Host-only cookies, exact origin/CSRF checks, route-bound sessions and distinct identity audiences remain necessary. Decide operator domain, council naming tokens, cookie policy, DNS ownership, certificate management and IdP relationships in a recorded architecture decision. No production domain is selected or purchased by this plan.

## Data-class control register

For every class below, record its council/custodian, lawful purpose, sensitivity/classification, permitted actors, storage/processing locations, keys, collection notice, retention trigger/period, hold/disposal rules, exports, third parties and incident owner. Branch and jurisdiction are explicit authority dimensions, not a simple inherited domain tree.

| Data class | Additional questions and required controls |
| --- | --- |
| Staff identity, employment and administrator records | Council-managed joiner/mover/leaver and delegated approval; MFA/SSO requirements; separate authentication secrets from staff directories; restrict HR/sensitive attributes independently |
| Requests, complainants, addresses and operational notes | Minimise private contact information; control free text and incidental sensitive data; scoped search, queue completeness, access/correction and authorised cross-team transfers |
| Infringements, notices and statutory decisions | Preserve authority/jurisdiction, rule version, actor, decision history, issuance/cancellation and record completeness; workflow-specific legal review before live statutory use |
| Receipts, payment references and financial records | Decide whether a payment provider handles card data; minimise stored payment data, reconcile authoritative provider evidence and avoid calling a redirect a payment. No payment implementation or compliance scope is inferred |
| Evidence photographs, audio, video, documents and metadata | Capture provenance/time, original integrity, custody and access/download history; malware/type/size controls; redaction as a derived object; lawful holds and disposal; offline copies and device loss |
| Officer location, device and activity data | Define purpose, precision, access, employee notice, retention and monitoring limits; minimise background tracking and prevent routine operator surveillance |
| Sensitive, health, children's and vulnerable-person information | Identify where intended or incidental capture occurs; apply appropriate collection/access/transfer rules; prevent broad indexing, analytics or support exposure |
| Audit, security logs and service telemetry | Separate authoritative council audit from provider operational diagnostics; minimise payloads/PII, protect integrity and access, define retention, correlation and incident use; avoid secret values |
| Backups, replicas, exports, caches and mobile offline stores | Include all secondary copies in residency, access, retention, deletion and restore controls. Recovering a database must not restore revoked privileges or bypass current policy |
| Shared GIS/reference/configuration and legal-rule catalogues | Preserve source/version/licence and geographical jurisdiction; validate assignment accuracy; distinguish shared reference material from council-owned operational records |

## Requirements and acceptance evidence

These are proposed implementation and assurance requirements under the owner's parallel governance workstream. Named periods, providers, physical isolation tiers and exceptions remain decisions to obtain.

| ID | Required output or behaviour | Evidence before production acceptance |
| --- | --- | --- |
| GOV-01 | Complete jurisdiction/contract obligations register and privacy impact assessment | Applicable instruments and sources, reviewed duties, responsible parties and residual risks; other jurisdictions explicitly gated |
| GOV-02 | Approved actor/action/data authority matrix | Separate operator, council admin, operational staff, support, workers and infrastructure roles; no implicit council access from operator status |
| GOV-03 | Council administration design | Delegated staff/branch/configuration lifecycle, approval/revocation, MFA/SSO and emergency recovery; direct API negative tests, not UI-only separation |
| GOV-04 | Selected tenant/data isolation and compromise boundary | Document shared/dedicated components, credential/key scope, broker powers and threat assumptions. Test chosen boundary including privileged support and restore paths |
| GOV-05 | Domain/session/identity decision | Distinct audiences, host-only cookies, approved origins and routing ownership; actual ingress/browser cross-origin and copied-session cases |
| GOV-06 | Complete data-flow and location inventory | Primary data, backups, evidence, logs, support, CI, analytics, DNS/CDN and subprocessors; approved transfer grounds and supplier contracts |
| GOV-07 | Record-class retention and custody schedule | Council-approved RDA mapping, triggers, holds, disposal approval, audit and export/preservation requirements; no universal invented retention period |
| GOV-08 | Evidence integrity and legal holds | Hash/provenance, attributable custody and access, derived redactions, authorised release/disposal; retention technology selected for actual requirements |
| GOV-09 | Key, secret and privileged-access design | Ownership/rotation/revocation/recovery, deployment authority and support model; no blanket operator/broker decryption claim; secrets absent from logs/argv where required |
| GOV-10 | Reliable operational discovery and shared capacity | Repair F-002/F-011/F-009/F-029; scoped pagination/counts, idle-pool recovery, bounded provider work and malformed-audit tolerance with preserved authorisation/ordering |
| GOV-11 | Audit and incident operating model | Protected council/provider logs, accountable responders, contract/statute-specific notification rules, usable investigation export and incident exercises |
| GOV-12 | Backup, availability and disaster recovery design | Approved RPO/RTO, isolated recoverable backups, restoration and council-specific recovery tests; suspension/pack/user revocations survive recovery |
| GOV-13 | Geographic data qualification | Resolve F-014/F-040/F-041; independent representative samples, provenance and reason-coded exceptions before operational reliance |
| GOV-14 | Browser/API and assurance backlog | Resolve or formally disposition seven security evidence gaps; define CSP/framing policy, parsing/session recovery, dependency/SDLC and active-code quality coverage |
| GOV-15 | Mobile/device, exports and integrations | Scope future offline/enforcement/public/payment consumers before enablement; storage/remote wipe, delegated sharing and provider reconciliation; scaffold status stays explicit |
| GOV-16 | Council/service exit and portability | Complete scoped export, holds, authorised disposal and key/identity revocation; no loss of public-record custody or cross-council exposure |

Each acceptance record must identify the tested source, deployed configuration, environment, actor, expected denial/success, result and limits. A passing F08 regression suite is valuable existing evidence but not acceptance of these new production requirements.

## Parallel work and release conditions

1. **Assessment checkpoint (prepared):** current main and deployed F08 reconciled; all 65 imported IDs retained with separate security/engineering verdicts; current AWS controls/limits recorded. No source repair or compliance certification performed.
2. **Requirements and architecture:** confirm customer/workflow sequencing across the owner-selected national scope and data classes; complete the national jurisdiction/privacy/data-flow/records register; decide authority, support, isolation/key, identity/domain and recovery models. Obtain legal/council/security decisions on concrete unresolved matters. Budget any production design separately from retained development resources.
3. **Bounded corrective package:** deliver queue completeness, pool reliability, expensive-status isolation and audit input/rendering fixes with disposable regressions. Correct naming/client recovery next. Do not replace consistency locks with unreviewed asynchronous work or rewrite historical audit to hide malformed values.
4. **Governance implementation:** implement council administration and the selected data/control separation, records/evidence protections, identity and privileged access. Use explicit migrations and staged preservation verification; do not bulk migrate retained records before the target and rollback/recovery strategy are reviewed.
5. **Assurance and production acceptance:** resolve proof gaps; verify meaningful security, privacy, recordkeeping, recovery and cross-council cases; record independent assurance required by the actual contracts/classification. Resolve F09-P01–P06 at the affected implementation boundary; independent work can continue while those choices are pending.

The numbered work packages express dependencies within governance and remediation, not a serial prerequisite for all feature development. Functional dispatch work and the corrective package can be implemented and tested with synthetic data while production decisions are pending. Keep one implementation feature active; progress governance requirements, decisions and assurance alongside it. At each feature checkpoint, record the relevant GOV IDs, unresolved assumptions, accountable decision owner (or explicitly unassigned), next action and acceptance evidence. Escalate overdue dependencies when they affect that feature rather than deferring governance indefinitely. This assessment does not implement them or authorise live fault/load testing, production resources, a new expenditure allocation or a new data migration. Existing maintenance and read-only investigation remain available within current authorisation.

The production acceptance gate can close only with concrete decisions and evidence for the agreed scope, explicit accountable acceptance of residual risks, and an updated ledger/roadmap. Neither merging this plan nor choosing a new domain closes the gate. Do not merge or enable auto-merge on the owner's behalf.

## Feature dependency rule

Continue dispatch queue completeness, filtering/pagination, assignment UI and existing workflow regression work within established council scope and entitlement rules. Use synthetic records and preserve audited transitions. This does not approve new grants, platform access to council records, live location collection, retention/destruction rules or statutory issuance.

Pause only the affected behaviour when it requires an unresolved decision: for example, who may suspend a council or view its retained records, whether an operator can impersonate council staff, or how evidence may be deleted. Record the dependency and progress another ready task. A broader pause requires concrete evidence of a cross-cutting risk and an explanation to the owner for reconsideration; unresolved governance alone is insufficient.

## Execution checklist

- [x] Verify current main, original package integrity and the deployed F08 source separately.
- [x] Reassess all 65 finding IDs and record source comparison and current infrastructure observations.
- [x] Record the owner's broad data scope and correction: active governance resolution alongside functional development.
- [x] Confirm national scope: all Australian states and territories; initial eight-jurisdiction register prepared.
- [ ] Appoint council/operator decision owners and complete customer/workflow-specific applicability, including external-territory arrangements where intended.
- [ ] Inventory actual planned fields, attachments, integrations, secondary copies and data flows by feature.
- [ ] Complete applicability/contract, privacy impact and records-retention reviews.
- [ ] Record authority, support, isolation, identity/domain, key and recovery decisions.
- [ ] Prepare and qualify the focused corrective package without altering historical evidence.
- [ ] Deliver the selected governance architecture and council administration in bounded reviewed features.
- [ ] Obtain required assurance, close or accept residual gaps and record production acceptance for the agreed scope.
- [ ] Reconcile F09-P01–P06 with the approved model before dependent implementation.
