---
title: "CivicMAPS Configuration, Legal-Rule and Tenancy Model"
document_id: "CIVICMAPS-ARCH-CTM"
version: "0.1.0"
subtitle: "Rebuild-readiness architecture for the 48 municipality-coupled and jurisdiction-bound features identified in the Domain / Department / Configurability Matrix"
document_type: "Architecture Working Document"
classification: "Programme Working Document"
status: "Draft — Not Approved"
authority: "Planning artefact only. Confers no approval of a target runtime, data model, technology selection or implementation baseline. Not Section 03 and not a substitute for it."
effective_date: "Not effective — draft"
source: "CivicMAPS Domain / Department / Configurability Matrix v0.1.0 (CIVICMAPS-PROD-FDM), docs/product/capabilities/"
governing_sources:
  - "CIVICMAPS-S01-APP-001 — Section 01 Authoritative Foundation v3.2.1"
  - "CIVICMAPS-S02-APP-001 — Section 02 Current State Assessment"
  - "CIVICMAPS-SPEC-S03-INDEX@2.1.0 — Section 03 Target State Architecture Index"
  - "CivicMAPS_GS-000_Document_Governance_Framework_v1.0.0 (§8.2 naming)"
feeds:
  - "Section 03 §3.2 Authority, Tenancy, Organisation and Jurisdiction Architecture"
  - "Section 03 §3.5.5, §3.5.18, §3.5.19, §3.5.20, §3.5.22 capability specifications"
  - "Section 03 §3.6.20 Branch Configuration Without Platform Forks"
---

# CivicMAPS — Configuration, Legal-Rule and Tenancy Model

The matrix classified 181 inherited features and found 48 that cannot move into a multi-jurisdiction platform as written: 37 tagged `MUNICIPALITY-CONFIGURABLE` and 11 tagged `JURISDICTION-BOUND`. This document defines what those 48 features become — seven configuration objects, seven classes of legal rule, and the structural entity chain both rest on.

## Purpose and standing

This is a design input, not an architecture baseline. Section 03's approved index reserves §3.2 for the authority, tenancy, organisation and jurisdiction architecture and §3.5.5–§3.5.24 for the twenty shared capabilities; this document is written to be consumed there, not to pre-empt it. It creates no `S03-` requirement identifiers, because those belong to Section 03. Its own identifiers — `CFG-nn`, `RULE-nn`, `TEN-nn`, `OQ-nn` — are document-local and carry no normative force.

`implementationEnabled` remains `false` and `technologyDecisionState` remains `adr-required` in `civicmaps.workspace.json`. Nothing here changes either, and nothing here selects a technology.

## Scope

**In scope:** the configuration model for the 37 municipality-coupled features; the legal-rule abstraction for the 11 jurisdiction-bound features; the multi-tenant structural model both depend on; the resolution order that selects a value at runtime; and a disposition row for every one of the 48.

**Out of scope, and not started here even in outline:** the 20 `DEPARTMENT-SPECIFIC` features and their workflow-definition layer; Case and Investigation Management and Asset Management; the seven authorisation defects in the matrix findings register; and every ADR this design depends on. Where a technology choice would change the design, it is recorded as an open question with the decision it needs.

## Assumptions and divergences from input

The matrix is settled input and its tags are designed against as written. Five points need recording before the design reads correctly.

| # | Item | Treatment |
|---|---|---|
| A1 | The matrix's capability table and the task brief both record `Organisation, Jurisdiction and Tenancy Management` as **Missing**. Section 02 §2.3.18 and §2.13.1 both record it as **Emerging — Incomplete Implementation Evidence** — free-text `branch`, `team_name`, manager and supervised-team fields exist. | Design unaffected: free-text organisational strings are not a foundation to build on, and every structural entity in Part 3 is genuinely absent. The Section 02 disposition is cited correctly here. |
| A2 | The 8-tier role hierarchy (matrix row, `MUNICIPALITY-CONFIGURABLE`) assumes one linear rank ladder. Fourteen branches with parallel command structures cannot be expressed by re-keying its values. | Designed as a model change, not a configuration object — see `CFG-04` and `OQ-14`. The tag is not disputed; making it configurable is necessary but not sufficient. |
| A3 | `autoEndExpiredAssignments` — 8h25m cap (`MUNICIPALITY-CONFIGURABLE`) derives from a local award or EBA term, which is an external legal instrument rather than a municipal preference. | Resolved to `CFG-05` per the tag, with the instrument citation carried as rule-linked provenance. The boundary between an industrial instrument and statute is flagged at `OQ-21`. |
| A4 | `plate-lookup.service.ts` (`JURISDICTION-BOUND`) is two concerns: the lawful authority to query a state vehicle registry, and the integration that performs the query. | The authority is modelled as `RULE-DAT`; the integration is an adapter under `S01-INT-001`. Both are recorded; neither is treated as the whole. |
| A5 | Four of the 48 are flagged `[DORMANT]` in the matrix — an orphaned `canResetPassword`, `parkingZones.ts`, `shared/streets/streetNumbers.ts`, and the unconsumed data files including the Victorian Schedule 6 extract. | Given explicit `DISP-NIL` dispositions in Part 4. Designing configuration for dead code would manufacture requirements. The Schedule 6 extract is called out separately because its content is statutory even though its code references are zero. |

---

# Part 1 — The configuration model

## 1.1 What a configuration object is

A configuration object is a named, owned, versioned, effective-dated set of values that a deployment supplies and the platform consumes without a code change. It is the answer to `S01-CAP-001`, which requires branch-specific catalogues, schedules and procedures to be configuration or owned domain data rather than hard-coded forks.

Three properties separate a configuration object from a settings file. First, it has one accountable owner, expressed as a layer in the structural model rather than a person — this satisfies `S01-DOM-001`'s requirement that every canonical dataset have one authoritative owning domain. Second, it is effective-dated, so that a value which changed on a date can still be resolved as it stood before that date; without this, `S01-LEG-003`'s obligation to resolve historical records against the version applicable at the time cannot be met even for non-legal values. Third, it declares which layers may override it, because "configurable" without an override boundary is how one authority ends up altering another's operating rules, which `S01-CAP-002` prohibits.

Grouping matters more than enumeration. The 37 features do not need 37 configuration surfaces; they need seven, because they consume the same few underlying value sets from different screens. Zone detection, zone assignment, service-request zone resolution and the client-side point-in-polygon fallback are four features reading one set of polygons.

## 1.2 The seven configuration objects

### CFG-01 · Jurisdictional Spatial Geometry

| Property | Value |
|---|---|
| Owns | Operational zone geometry and identity — patrol zones, permit zones, operational areas; zone metadata; the point-in-polygon determination that maps a coordinate to a zone |
| Owner | Jurisdiction, custodian GIS Operations; publication through Shared Reference Data does not transfer semantic ownership (`S01-CAP-004`) |
| Override permitted at | None below jurisdiction. A branch may select from jurisdiction-published zones; it may not define its own geometry |
| Effective dating | Required. Boundary changes are gazetted or council-resolved events with a date |
| Answers to | `S01-GIS-001`, `S01-GIS-003`, `S01-GIS-005`, `S01-GIS-007`, `S01-CAP-001` |
| Consumed by | 9 matrix features |

The inherited implementation holds 23 Melbourne polygons in a shared TypeScript module, re-synchronised into the database on every boot. The rebuild inverts that: geometry is deployment data with a custodian and a version, and the boot-time synchroniser becomes a versioned load with provenance rather than a lockstep overwrite from a code constant. `S01-GIS-005` prohibits operational records from holding independently maintained authoritative copies of canonical spatial entities, which is what the duplicated `parkingZones.ts` constant is.

One consequence needs stating because it is not obvious: a zone boundary change is not a configuration edit with retrospective effect. A service request resolved to Zone 4 last month was correctly resolved under the geometry in force then. The record keeps the zone identifier and the geometry version that produced it (see §3.4), and re-resolution is an explicit re-evaluation, never an implicit one.

### CFG-02 · Street and Address Reference

| Property | Value |
|---|---|
| Owns | Canonical street names, cross-street relationships, street segments and side-of-street derivation, address history ranking, the compact client-side snapshot and its cache validator |
| Owner | Jurisdiction, custodian GIS Operations; source may be an external open-data or cadastral publisher, which must be recorded as provenance (`S01-CAP-004`) |
| Override permitted at | Organisation, for locally maintained address corrections only, never for canonical identity |
| Effective dating | Required. Street naming and segmentation change through gazettal and subdivision |
| Answers to | `S01-GIS-001`, `S01-GIS-004`, `S01-GIS-006`, `S01-CAP-004` |
| Consumed by | 8 matrix features |

The inherited version reaches a City of Melbourne Open Data endpoint as a fallback and races a server lookup against Google Places with a three-second cap. Both are integration decisions wearing the costume of a reference dataset. Under `S01-INT-001` each external source becomes an owned adapter; under `S01-GIS-006` the offline snapshot retains canonical identifiers, source version, provenance and synchronisation state rather than being an opaque cached blob. The existing ETag'd snapshot is the right shape and the wrong contents.

`validateMandatoryCapture` sits here rather than in a parking object because its real assumption is structural: it requires a grid-addressable street network in which "between streets" and "side of street" are meaningful. In a rural shire with unnamed access tracks that assumption fails, and the failure is about the address model, not about parking.

### CFG-03 · Kerbside and Parking Restriction Reference

| Property | Value |
|---|---|
| Owns | Parking-period catalogue and mark-up timer inputs; mark-location vocabulary; signage grammar and its parse table; council parking-area and third-party payment-zone identifiers |
| Owner | Organisation, within jurisdiction-published restriction authority |
| Override permitted at | Branch, for operational vocabulary only; never for a value that determines whether an offence occurred |
| Effective dating | Required. Restriction changes are dated instruments |
| Answers to | `S01-CAP-001`, `S01-CAP-015`, `S01-BRN-001` |
| Consumed by | 5 matrix features |

This object carries the design's sharpest boundary. The signage grammar that parses `1P`, `15M` and `LZ15` is a municipal vocabulary and belongs here. The overstay test that decides whether a vehicle has offended is a legal rule and belongs in Part 2. The matrix already drew that line — `time-rules.ts` is `MUNICIPALITY-CONFIGURABLE` and `crossCheckScan` is `JURISDICTION-BOUND` — and this design keeps it. The practical test is whether getting the value wrong produces an operational inconvenience or an unlawful infringement.

`S01-CAP-015` requires Workflow and Configuration to reference effective legislative and policy catalogue versions and prohibits it from owning or duplicating offence or penalty semantics. A parking period stored here is a duration; the same duration cited as the basis for an infringement is resolved through `RULE-CAT`.

### CFG-04 · Organisation, Branch and Position Catalogue

| Property | Value |
|---|---|
| Owns | Branch registry and display names; position catalogue; position-to-role derivation; team naming and rostering-eligibility semantics; officer-number and name format rules; directory grouping; supervisory scoping inputs |
| Owner | Organisation, within tenancy-registered structure (`S01-CAP-003`) |
| Override permitted at | Branch, for position catalogue entries only |
| Effective dating | Required (`S01-TEN-009`) |
| Answers to | `S01-CAP-003`, `S01-CAP-001`, `S01-SOV-002`, `S01-SOV-006`, `S01-SOV-007`, `S01-BRN-004` |
| Consumed by | 11 matrix features |

This is the largest cluster and the one where configuration alone is insufficient. Eleven features encode Melbourne's organisational shape: a hardcoded 20-position map, exactly four HR branches, a three-tier directory rail, an officer-number regex, a team-name string match on the word `shift`, and an eight-tier linear role ladder. Nine of those eleven become values in this object without difficulty.

The role hierarchy does not. A linear ladder from ADMIN to OFFICER cannot express fourteen branches with parallel command structures no matter what strings populate it, because the model is the constraint — an ordinal rank comparison. Re-keying its values produces a configurable version of the wrong model. Authorisation for the rebuild resolves through the Authority Realm and an explicit permission grant, with rank as at most one input among several. This is a model change and is recorded as `OQ-14` rather than resolved here.

Two sovereignty constraints bound this object. `S01-SOV-006` prohibits CivicMAPS from becoming the authoritative HR or payroll system, so the position catalogue holds the minimum operational set — the positions that determine field authority — not an establishment register. `S01-SOV-007` requires that where an external HR system is authoritative, CivicMAPS consumes governed data through an approved integration and preserves source authority, purpose limits, freshness and reconciliation state. Whether Melbourne has such a system is unknown from the inventory.

### CFG-05 · Operational Calendar and Business Time

| Property | Value |
|---|---|
| Owns | Time zone; daylight-saving rule; public-holiday calendar; business hours; shift patterns and duration caps; scheduled-job anchors; deadline-calculation basis |
| Owner | Jurisdiction, overridable at organisation for shift patterns and business hours |
| Override permitted at | Organisation (shift patterns, business hours); never for time zone or DST rule |
| Effective dating | Required. Holiday calendars are published annually and amended in-year |
| Answers to | `S01-CAP-009`, `S01-AUD-002` |
| Consumed by | 2 matrix features |

Two features, and the whole of Calendar and Business-Time Management as inherited. `scheduleNightlyArchival()` computes milliseconds until the next midnight AEST and reschedules itself forever; `autoEndExpiredAssignments` caps assignments at 8 hours 25 minutes from a constant. Section 02 §2.13.11 records the capability as **Missing — No Implementation Evidence Found**, and a fixed UTC+10 offset is the entire inherited implementation. It is also wrong within its own jurisdiction for half the year, since Victoria observes daylight saving and AEST is not AEDT.

`S01-CAP-009` requires retaining the basis used for historical calculations, not merely the current calendar. A deadline computed last winter must remain reconstructable as computed. That makes the calendar a versioned input to a stamped calculation, not an ambient property of the server process.

### CFG-06 · Operational Code Vocabulary

| Property | Value |
|---|---|
| Owns | Operational code identifiers, display labels, meanings, permitted transitions and realm scoping |
| Owner | Jurisdiction or approved shared standard (`S01-COD-001`) |
| Override permitted at | Organisation, for display labels only; never for code meaning |
| Effective dating | Required, with historical meaning preserved (`S01-COD-002`) |
| Answers to | `S01-COD-001`, `S01-COD-002`, `S01-CAP-015` |
| Consumed by | 1 matrix feature |

One feature, disproportionate consequence. Duty-status logging hardcodes Code 2, Code 26 and off-duty into route paths and UI labels. Section 01 §1.6 defines Code 3 as officer sign-off; the implementation uses Code 26. `S01-COD-001` prohibits hard-coding operational codes into a branch-specific client, and `S01-COD-002` requires code changes to preserve the meaning applied to historical records — so reconciling Code 26 to Code 3 is a migration obligation with a mapping and an effective date, not a find-and-replace. Recorded as `OQ-30`.

### CFG-07 · Deployment Identity and Presentation

| Property | Value |
|---|---|
| Owns | Brand palette, wordmarks, typography, iconography and per-deployment presentation tokens |
| Owner | Undetermined — no shared capability among the twenty owns deployment presentation (`OQ-16`) |
| Override permitted at | Undetermined pending ownership |
| Effective dating | Recommended, not required |
| Answers to | No Section 01 requirement directly; accessibility obligations under §3.4.14 apply to the rendered result |
| Consumed by | 1 matrix feature |

The inherited design system is a genuine asset — Civic Navy, Operations Teal and Patrol Gold with a documented type pairing, Lucide-only icons, no colour-only status encoding, and a completed 46-finding compliance audit. Its accessibility properties are platform-neutral and should be retained as binding. Its palette and wordmarks are Melbourne-deployment identity. Separating the two is straightforward; deciding which capability owns the result is not, because none of the twenty covers it.

## 1.3 Layer authorship and override permission

Configuration is authored at a layer of the structural model, and the layer determines who may change a value and who inherits it. The permitted authoring layers are Platform Baseline, Shared Reference Adoption, Jurisdiction, Organisation, Branch and Team.

Tenant is deliberately absent from that list. `S01-TEN-011` defines a tenant as a provisioning and administration boundary, not a legal or semantic authority, and `S01-TEN-008` prohibits treating a municipality as the permanent one-to-one definition of a tenant. Authoring operational values at the tenant layer would smuggle semantic authority into an isolation construct and break the moment a tenant hosts two organisations — which the shared-service pattern requires. Presentation values under `CFG-07` are the sole candidate exception, and only because they carry no operational semantics; that too is unresolved at `OQ-16`.

Each configuration object declares its lowest permitted authoring layer, and any layer below inherits without the ability to override. This is what makes `S01-CAP-002` enforceable: an authority cannot alter another realm's rules because it has no authoring right at a layer that another realm inherits from.

## 1.4 Offline and cached configuration

Field devices operate without connectivity, and configuration is exactly the class of data a device caches. `S01-GIS-006` permits offline replicas only where they retain canonical identifiers, source version, provenance and synchronisation state — which means a cached configuration object is version-pinned and self-describing, never an anonymous snapshot.

Two questions follow that this design cannot settle. Whether a device pins a configuration version for the duration of a shift or refreshes continuously changes what "the value in force" means for a record captured offline (`OQ-24`). And the invalidation service level for a changed value — how long a device may lawfully act on a superseded zone boundary — is an operational policy decision, not an engineering default (`OQ-25`).

---

# Part 2 — The legal-rule abstraction

## 2.1 Why a configuration table is not enough

The 11 `JURISDICTION-BOUND` features encode statute. A per-deployment configuration table fails them for four reasons, each of which maps to a Section 01 requirement.

A configuration value has no citation. `S01-LEG-001` requires legislation, subordinate instruments, local laws, offence catalogues, penalty schedules and delegations to retain authoritative source, jurisdiction, citation, version, effective-from and effective-to dates, status and provenance. A key-value pair carries none of that, and `S01-SUC-022` sets the acceptance measure at 100% of enforced legislation having exactly those attributes.

A configuration value resolves to now. `S01-LEG-003` requires historical records and decisions to resolve against the exact legislative version applicable at the event time. An infringement contested two years after issue must be evaluated under the offence code, penalty and evidentiary rules in force on the day of the alleged offence.

A configuration value has no precedence. `S01-LEG-002` requires a deterministic authority graph and conflict-resolution model — explicitly *not* a simple ranked hierarchy — covering subject matter, enabling legislation, delegation, geographic jurisdiction, temporal effect, inconsistency rules and statutory versus administrative status. Configuration layering is a ranked hierarchy by construction.

A configuration value applies on publication. `S01-LEG-004` requires that publishing a shared legislative source does not make it applicable until its authority, scope, precedence and effective period are explicitly established, and `S01-LEG-005` prohibits treating an organisational policy or branch procedure as automatically a legislative tier. Adoption is a governed act.

## 2.2 How a rule is represented

A rule is a versioned, cited, effective-dated statement with an applicability predicate and a decision body, owned by Legislative and Policy Catalogue Management (`S01-CAP-005`) and referenced — never duplicated — by Workflow and Configuration (`S01-CAP-015`).

| Element | Purpose |
|---|---|
| Rule identifier | Stable identity across versions |
| Rule version identifier | The specific version resolved and stamped onto records |
| Rule class | One of the seven classes in §2.3; determines the decision body's shape |
| Jurisdiction | The jurisdiction whose authority the rule expresses |
| Authoritative source and citation | Instrument, provision, publisher — the evidence trail `S01-LEG-001` requires |
| Instrument status | Statutory, subordinate, administrative or industrial; feeds precedence, per `S01-LEG-005` |
| Effective from / effective to | The period in which the version has force |
| Lifecycle status | In force, superseded, repealed, not yet commenced |
| Applicability predicate | Subject matter, geography, persons or assets, and authority realm to which the rule applies |
| Precedence position | The rule's node in the authority graph, not a numeric rank |
| Parameters | Values the rule carries — periods, ranges, thresholds, allow-lists |
| Decision body | The determination the rule makes, expressed in its class's form |
| Adoption record | The explicit act making the rule applicable to an authority (`S01-LEG-004`) |
| Provenance and approval | Who authored, who approved, when, under what delegation |

The decision body's representation — parameterised template, declarative predicate, or an executable expression in some rule language — is a genuine technology decision that this document does not make (`OQ-26`). The field set above is chosen to survive any of the three.

## 2.3 The seven rule classes

| Class | Determines | Matrix features |
|---|---|---|
| `RULE-CAT` · Catalogue | The set of offences, their codes, descriptions, penalties and per-code attributes in force for a jurisdiction at a date | Offence catalogue (111 codes); offence-catalogue filter and issue-time display; offence code 701 auto-fire |
| `RULE-DEC` · Decision | Whether a regulated state has been reached from observed facts — the overstay test | `crossCheckScan` decision engine |
| `RULE-IDS` · Identifier scheme | The lawful form, range and uniqueness scope of a statutory identifier | Scrambled SR / PIN number generation |
| `RULE-EVD` · Evidentiary | What evidence and provenance a lawful decision requires — including which codes permit an officer-edited offence time | Issue-infringement clock enforcement |
| `RULE-DOC` · Instrument content | The mandatory content and service requirements of a statutory notice | Printable PIN receipt |
| `RULE-DAT` · Data determination | Lawful retention, re-identification and access limits on regulated data, and the authority to query an external registry | `vehicle-profile.ts` footprint merge; `plate-lookup.service.ts` registry authority |
| `RULE-IDP` · Identity policy | Which identity domains and credential sources are acceptable for an authorised actor | Officer onboarding `.gov.au` validation |

Eleven features, ten live rows — the eleventh, the unconsumed Victorian Schedule 6 extract, is dormant data with zero code references and is dispositioned `DISP-NIL` in Part 4 while being flagged as statutory content that a future catalogue import may legitimately want.

Two of these deserve comment. `RULE-EVD` looks like a configuration allow-list — 5 of 111 codes permit an officer-edited offence time, the rest are forced to the server clock with a five-minute skew tolerance. It is not, because the allow-list is a statutory evidentiary rule about what makes an infringement provable, and getting it wrong voids notices rather than inconveniencing officers. `RULE-IDP` looks like a validation regex. It is a policy statement that authorised officers hold credentials in an Australian government domain, which excludes contractors and shared-service entities that Section 01 §1.1 explicitly brings into scope, and which has no meaning outside Australia.

## 2.4 Selection and historical re-evaluation

Rule selection takes an authority realm, an operative date and a subject, and returns exactly one rule version per applicable rule — or refuses.

Candidate rules are collected by applicability predicate, filtered to versions whose effective period contains the operative date, then reduced by the authority graph. Where two rules of the same class both apply, the graph resolves by subject matter, enabling legislation, delegation, geographic scope, temporal effect and statutory-versus-administrative status. `S01-LEG-002` assigns the graph's structure to Section 03 and this design does not pre-empt it; what it does fix is that the reduction is deterministic and its output is auditable.

The operative date is where re-evaluation is won or lost. For a new operation it is the current date. For evaluating an existing record it is the record's event date — the alleged offence time, not the review time. And because a record must be re-evaluable years later without depending on the catalogue still being reconstructable, every regulated decision stamps the resolved rule version identifiers onto the record at decision time.

This yields two distinct evaluation modes, and conflating them is the failure this design exists to prevent. **As-recorded** replay reads the stamped version identifiers and reproduces the original decision exactly; it is the default for review, appeal and audit. **As-at** re-resolution runs selection afresh for a stated date; it is how the platform answers what a decision *would* have been, and it is an explicitly authorised act, never a side effect of opening a record. Where the two disagree, the disagreement is itself the finding.

## 2.5 Authorship, adoption and supersession

A rule enters the catalogue through authoring, is made applicable to an authority through adoption, and leaves force through supersession or repeal. All three are effective-dated and audited under `S01-AUD-001`.

Adoption is the step the inherited implementation has no concept of. A TypeScript constant containing 111 offence codes is applicable because it was imported. `S01-LEG-004` requires an explicit act establishing authority, scope, precedence and effective period before a published source binds a tenant, organisation or jurisdiction. Supersession never rewrites a superseded version, because records stamped against it must still resolve — which makes the catalogue append-only in the same sense `S01-SOV-005` makes custody history append-only.

---

# Part 3 — The multi-tenant data model

## 3.1 The entity chain

Section 01 §1.2 already defines this vocabulary authoritatively under `S01-TEN-011`, and this design adopts it verbatim rather than coining alternatives. The chain is not a single hierarchy — that is the point of `S01-TEN-011`'s instruction that technical tenancy, legal authority and organisational structure must not be treated as interchangeable.

| Entity | Owns | Does not own |
|---|---|---|
| Platform | Service identity, control-plane scope, platform-baseline configuration, shared schemas | Any operational record; any jurisdictional authority |
| Tenant | Provisioning, isolation and administration boundary; quota and capacity envelope | Legal authority; semantic configuration; offence catalogues |
| Organisation | Legal identity; personnel records and employment authority; organisational policy; branch and position structure | Statute; jurisdictional geometry it does not administer |
| Jurisdiction | Lawful scope — geography, subject matter, persons or assets, statutory power, effective period; legislative and policy catalogue applicability; spatial geometry | Technical isolation; personnel records |
| Jurisdictional Data Plane | The isolated operational data, evidence, personnel, configuration, cryptographic, audit and lifecycle boundary; independently addressable key hierarchy (`S01-ISO-005`) | Legal authority in its own right |
| Authority Realm | The runtime binding of tenant, organisation, jurisdiction, data plane, branch and where applicable team; selects the permitted operating context | Any data; it is a resolution result, not a store (`S01-TEN-011`) |
| Branch | Assigned workflows and operational procedure; branch-layer configuration | Platform capability; legislative semantics (`S01-LEG-005`) |
| Team | Supervision, scheduling, dispatch and task grouping | Data ownership, tenancy or legal authority (`S01-TEN-011`) |
| Officer | Nothing structurally; holds realm memberships and delegations | — |

`S01-TEN-008` requires tenant-to-organisation and tenant-to-jurisdiction relationships to support one-to-one, one-to-many, many-to-one, many-to-many, joint-operation and time-bounded association patterns. That is the requirement that kills the intuitive reading of the chain as a tree, and it is why Authority Realm exists as a distinct construct: the realm is the resolved path through a graph, computed per operation, not a foreign key to a parent.

Every structural change — creation, association, separation, transfer, retirement — is effective-dated, authorised and audited under `S01-TEN-009`, with `S01-CAP-003` making Organisation, Jurisdiction and Tenancy Management the authoritative source for these relationships and their history.

## 3.2 Origin identifiers on operational records

An operational record carries its origin so that isolation, custody and re-evaluation survive everything that happens to it afterwards.

| Stamp | Requirement |
|---|---|
| Origin tenant, organisation, jurisdiction, data plane | Immutable from creation (`S01-SOV-001`) |
| Capturing authority realm | The realm resolved at capture (`S01-TEN-001`) |
| Branch and actor | Accountability |
| Canonical spatial entity identifier | Zone, road segment or bay as applicable (`S01-GIS-001`, `S01-GIS-003`) |
| Resolved configuration version identifiers | Every `CFG` object that shaped the record |
| Resolved rule version identifiers | Every rule that determined a regulated outcome (§2.4) |
| Time set | Capture, device, receipt, processing and upload times (`S01-AUD-002`) |
| Offline and synchronisation provenance | `S01-EVD-004` |

Origin is immutable; custody is current-state with append-only history (`S01-SOV-005`). Granting access transfers neither. Evidence carries the full `S01-EVD-004` metadata set on top of this, which the matrix records as roughly one third implemented today.

## 3.3 Resolution order

This is the operative procedure. Given a runtime value request — a zone boundary, a holiday calendar, an offence code — the platform resolves it as follows.

1. **Resolve the Authority Realm.** Tenant, organisation, jurisdiction, data plane, branch and where applicable team. `S01-TEN-001` requires the complete realm for any jurisdictional operation. An incomplete realm terminates the request; it does not fall back to a default.
2. **Classify the request.** Configuration object, legal rule, or shared reference. `S01-TEN-012` prohibits assigning false jurisdictional ownership to shared or platform-control material, and the three classes resolve by different authorities — layer precedence for configuration, the authority graph for rules.
3. **Determine the operative date.** Current date for a new operation; the record's event date for evaluating an existing one. For an existing record with stamped versions, as-recorded replay short-circuits here and returns the stamped version directly.
4. **Collect candidates.** For configuration, walk the authoring layers from Platform Baseline through Shared Reference Adoption, Jurisdiction, Organisation, Branch to Team, gathering every layer that has authored a value for the object and holds authoring rights over it. For rules, collect by applicability predicate.
5. **Filter by effective period.** Retain only versions whose effective period contains the operative date. This step is what makes the resolution reproducible for a past date.
6. **Reduce to one.** For configuration, the most specific authoring layer wins, subject to the object's declared override permission — a value authored at a layer without authoring rights is an error, not a lower-precedence candidate. For rules, the authority graph reduces per `S01-LEG-002`; layer specificity is not a tiebreak and `S01-LEG-005` forbids treating a branch procedure as a legislative tier.
7. **Bind and stamp.** Return the value with its version identifier, and stamp that identifier onto any record the operation produces.
8. **On failure, refuse.** An unresolvable value terminates the operation with an explicit reason. It does not fall back to a platform default, an adjacent jurisdiction's value, or the last cached value without disclosure — `S01-EVD-002` prohibits silently inventing missing metadata, and `S01-AWR-001` requires operational status to distinguish live, delayed, queued, unavailable and last-known.

Step 8 is the step most likely to be softened in implementation, and softening it is how a second municipality silently operates on Melbourne's zone boundaries.

## 3.4 What a technology choice would change

`S01-BAS-001` leaves the data platform, GIS provider, backend runtime and offline storage as unresolved candidates. Three of those genuinely constrain this model rather than merely implementing it.

The data platform decision determines whether effective-dated resolution is a native temporal capability or an application-layer concern implemented consistently across every object and rule — the model holds either way, but the verification burden differs sharply. The GIS provider decision determines whether `CFG-01` geometry can be versioned and diffed as first-class data or must be re-sourced per deployment. The offline storage decision determines whether version-pinned configuration can be held on device with integrity, which §1.4 assumes. Each is recorded as an open question rather than pre-empted.

---

# Part 4 — Feature disposition

Every one of the 48 features, and the configuration object or rule class it resolves to. `DISP-NIL` marks a feature the design deliberately does not carry forward, with the reason stated.

## 4.1 Municipality-configurable features (37)

### CFG-01 · Jurisdictional Spatial Geometry — 9

| Matrix feature | Current hardcoding | Resolves to |
|---|---|---|
| `PATROL_ZONES` / `PATROL_ZONE_DETAILS` | 23 Melbourne patrol zones with boundary/laneway detail | CFG-01 · zone geometry and metadata |
| `sync-patrol-zones.ts` boot sync | Re-runs every boot in lockstep with the Melbourne seed | CFG-01 · versioned load with provenance |
| Zone detection — ray-casting with sticky zone | Operates over the 23 hardcoded polygons | CFG-01 · point-in-polygon determination |
| `useAssignment` (server-authoritative zone banner) | Dispatcher-assigned zone from the Melbourne set | CFG-01 · zone identity |
| `useAssignedZone` (self-declared, AsyncStorage) | Officer self-declared preference, no server call | CFG-01 · zone identity, pending `OQ-08` reconciliation |
| Zone assignment — many-per-zone, scope-checked | Zones are the 23 Melbourne polygons | CFG-01 · zone identity |
| SR creation with auto zone/officer resolution | Zone resolution against the 23 polygons | CFG-01 · point-in-polygon determination |
| `Code21CreateForm` | Client-side point-in-polygon fallback on the hardcoded set | CFG-01 · cached geometry, version-pinned per §1.4 |
| `parkingZones.ts` (mobile constants) | Duplicate zone constant, zero references | **DISP-NIL** — `[DORMANT]`; duplicate of the shared module, prohibited by `S01-GIS-005`. Delete, do not configure |

### CFG-02 · Street and Address Reference — 8

| Matrix feature | Current hardcoding | Resolves to |
|---|---|---|
| `street-lookup.ts` | City of Melbourne Open Data fallback endpoint | CFG-02 · canonical streets, via an owned adapter (`S01-INT-001`) |
| `street-segments.ts` | CBD street-grid segment resolver, assumes Melbourne's grid | CFG-02 · segment identity and side-of-street derivation |
| `AddressLookup` / `useStreetName` | Type-ahead over Melbourne street data, GPS-ranked history | CFG-02 · street names and address history |
| `GET /address-search` · `/zone-resolve` · `/officers` | Canonical Melbourne street names; PostGIS containment against Melbourne zones | CFG-02 · address search, with zone containment from CFG-01 |
| `/streets/*` ETag'd snapshot | Compact Melbourne street snapshot cached client-side | CFG-02 · offline snapshot, version-pinned per `S01-GIS-006` |
| `MarkupForm` / `MarkupPage` (web) | Cross-street autocomplete server-first with Google Places fallback | CFG-02 · cross-street resolution, via an owned adapter |
| `validateMandatoryCapture` — between-streets & side | Assumes a grid-addressable network with meaningful side-of-street | CFG-02 · address model capability declaration |
| `shared/streets/streetNumbers.ts` | 2,646 lines, zero importers | **DISP-NIL** — `[DORMANT — Dead code]`; superseded by a differently-sourced module. Delete, do not configure |

### CFG-03 · Kerbside and Parking Restriction Reference — 5

| Matrix feature | Current hardcoding | Resolves to |
|---|---|---|
| `time-rules.ts` parking-sign parser | Parses `1P`, `15M`, `LZ15` — Melbourne's signage grammar | CFG-03 · signage grammar and parse table |
| Mark-up creation with timer computation | Timer end from Melbourne's parking-period catalogue | CFG-03 · parking-period catalogue |
| `GET /reference` — period & mark-location tables | Melbourne's period and mark-location lookup values | CFG-03 · period and mark-location vocabulary |
| `parking-area-lookup.ts` | 491-entry street-to-parking-zone lookup; council-issued payment-zone numbers | CFG-03 · parking-area and payment-zone identifiers |
| Street / parking HUD | Displays council parking-area and third-party payment numbers | CFG-03 · display of the above |

### CFG-04 · Organisation, Branch and Position Catalogue — 11

| Matrix feature | Current hardcoding | Resolves to |
|---|---|---|
| `POSITION_ROLE_MAP` (20 HR position strings) | Assumes exactly four HR branches; catalogue hardcoded in a route module | CFG-04 · position catalogue and branch registry |
| `/metadata` — branch-scoped manager & position lists | Hardcoded Melbourne position list filtered by actor rank | CFG-04 · position catalogue |
| Employee role auto-assignment from position | Derives role from the hardcoded 20-position map | CFG-04 · position-to-role derivation |
| Officer number & name format validation | Regex encodes Melbourne's officer-number format | CFG-04 · identifier format rules |
| `DirectoryPage` — grouped rail, onboarding, edit, reset | Rail groups hardcoded Management / Supervisors / Officers | CFG-04 · directory grouping |
| `canCoAssignToZone` | String-matches `"shift"`-named teams; requires a shared non-empty team name | CFG-04 · team naming and rostering-eligibility semantics |
| `AssignmentsPage` — roster with eligibility reasons | Disables candidates using the Melbourne team-name rule | CFG-04 · rostering-eligibility semantics |
| `seed.ts` — demo org chart & zones | Seeds a Melbourne org chart and the 23 zones | CFG-04 · deployment seed; zones via CFG-01 |
| 8-tier role hierarchy (ADMIN → OFFICER) | One linear rank ladder with Melbourne's supervisor tiers | CFG-04 · **partial** — values configurable, model change required (`OQ-14`) |
| `canResetPassword` (live implementation) | Branch + supervised-team scoping assumes Melbourne's team structure | CFG-04 · supervisory scoping inputs; authorisation via realm (`OQ-14`). Carries `[SECURITY]` from the matrix |
| Second, orphaned `canResetPassword` | Disagrees with the live version; only its own CI test imports it | **DISP-NIL** — `[SECURITY]` `[DORMANT — Orphaned]`; delete with its test. Findings register #2 |

### CFG-05 · Operational Calendar and Business Time — 2

| Matrix feature | Current hardcoding | Resolves to |
|---|---|---|
| `archiveCompletedMarkups()` nightly job | AEST-only midnight anchor, self-rescheduling forever | CFG-05 · scheduled-job anchor, time zone and DST rule |
| `autoEndExpiredAssignments` — 8h25m cap | Local award/EBA term as a constant | CFG-05 · shift pattern and duration cap; instrument citation retained (`OQ-21`) |

### CFG-06 · Operational Code Vocabulary — 1

| Matrix feature | Current hardcoding | Resolves to |
|---|---|---|
| Duty-status logging (Code 2 / Code 26 / off-duty) | Local radio convention in route and UI names; Code 26 where §1.6 defines Code 3 | CFG-06 · code vocabulary, with a dated meaning-preserving mapping (`OQ-30`) |

### CFG-07 · Deployment Identity and Presentation — 1

| Matrix feature | Current hardcoding | Resolves to |
|---|---|---|
| Design system — brand profile & UI kits | Melbourne brand palette and wordmarks; platform-neutral accessibility rules | CFG-07 · presentation tokens; accessibility properties retained as binding, ownership open (`OQ-16`) |

## 4.2 Jurisdiction-bound features (11)

| Matrix feature | Current hardcoding | Resolves to |
|---|---|---|
| `offence-codes.ts` — 111 codes | Victorian parking-offence catalogue as a TypeScript constant | `RULE-CAT` · catalogue with citation, version, effective dating and adoption |
| Offence catalogue filter box & live-ticking issue time | Filters the 111-entry Victorian catalogue | `RULE-CAT` · catalogue projection at the operative date |
| Offence code 701 auto-fire on overstay | Victorian offence code fired automatically on the overstay outcome | `RULE-CAT` · code selection, triggered by `RULE-DEC` |
| `crossCheckScan` decision engine | Victorian overstay test — offending once `now ≥ earliest-prior-scan + min(both periods)` | `RULE-DEC` · overstay determination |
| Scrambled SR / PIN number generation | 4-round Feistel over a sequence producing 7 digits in 1000000–1999999 | `RULE-IDS` · statutory identifier scheme; uniqueness scope open (`OQ-28`) |
| Issue-infringement clock enforcement | 5 of 111 codes permit officer-edited offence time; rest forced to server clock | `RULE-EVD` · evidentiary rule, per-code |
| Printable PIN receipt | Statutory notice content and service requirements | `RULE-DOC` · instrument content and service |
| `vehicle-profile.ts` parking-footprint merge | Retention and re-identification limits on per-plate movement history | `RULE-DAT` · retention and re-identification determination (`OQ-32`) |
| `plate-lookup.service.ts` registry | On-disk registry standing in for a state vehicle-registry integration | `RULE-DAT` · query authority, plus an owned integration adapter (`S01-INT-001`) |
| Officer onboarding validation | Requires a `.gov.au` email address | `RULE-IDP` · identity-domain policy; contractor exclusion is a live gap (`OQ-33`) |
| Unconsumed data files | Schedule 6 extract, placeholder zone and street JSON; zero code references | **DISP-NIL** — `[DORMANT — No importers]`; delete the placeholders. The Schedule 6 extract is statutory content and is a candidate catalogue import source, not a runtime dependency (`OQ-34`) |

**Disposition totals:** 43 features resolve to a configuration object or rule class; 5 are `DISP-NIL` — four dormant artefacts and one dormant dataset with retained statutory value.

---

# Part 5 — Open questions

Unfiltered, per instruction. Triage is a separate pass.

## Structural and tenancy

| # | Question | Blocks |
|---|---|---|
| OQ-01 | Can one jurisdiction span multiple tenants, and one tenant multiple jurisdictions concurrently? | Realm resolution cardinality; `S01-TEN-007` |
| OQ-02 | Is a Jurisdictional Data Plane one-to-one with a jurisdiction, or may a jurisdiction hold several? | Isolation boundary and key hierarchy |
| OQ-03 | Does a branch belong to an organisation or to a jurisdiction? Can one branch operate under two jurisdictions? | CFG-04 authoring layer |
| OQ-04 | May a team span branches for cross-branch operations? | Rostering eligibility semantics |
| OQ-05 | Are contractors an organisation, or a role within the host organisation? Contractor Operations is an approved branch | Personnel sovereignty; `RULE-IDP` |
| OQ-06 | Is an Authority Realm materialised with a persistent identifier, or computed per session? | Record stamping and audit replay |
| OQ-07 | May an officer hold concurrent realm memberships, and may a realm be switched mid-shift? | In-flight record ownership |
| OQ-08 | Which is authoritative for an officer's operating zone — server assignment or the device self-declaration? They do not reconcile today | CFG-01 consumption |
| OQ-09 | In a joint operation, which data plane owns a jointly created record? | `S01-TEN-010` custody |
| OQ-10 | Does a shared-service tenant require a distinct data plane per participating organisation? | Isolation proof |
| OQ-11 | What is the authority-graph structure for rule conflict resolution? Assigned to Section 03 by `S01-LEG-002`; this design needs its contract | §2.4 reduction |

## Configuration model

| # | Question | Blocks |
|---|---|---|
| OQ-12 | Per object, which layers may author and which may override? Needs governance sign-off, not an engineering default | §1.3 permission matrix |
| OQ-13 | Is configuration versioned per whole object or per key? | Stamping granularity |
| OQ-14 | Does the role hierarchy become configuration, or a permission model change? Fourteen branches with parallel command structures cannot be expressed as a linear ladder | CFG-04; seven authorisation defects share a root cause here |
| OQ-15 | Is an external HR system authoritative for positions and employment? `S01-SOV-007` applies if so | CFG-04 sourcing |
| OQ-16 | Which of the twenty capabilities owns deployment identity and presentation? None currently does | CFG-07 ownership |
| OQ-17 | May configuration be backdated, and under whose approval? | Effective-dating semantics |
| OQ-18 | What happens to in-flight operational records when a zone boundary changes mid-shift? | CFG-01 change control |
| OQ-19 | Does the platform ship a Platform Baseline default for any object, or is every object deployment-mandatory? | Resolution step 4 |
| OQ-20 | Is the officer-number format an organisation or jurisdiction concern where a tenant hosts two organisations? | CFG-04 layer |
| OQ-21 | Is an award or EBA shift cap configuration or an industrial-instrument rule? It is an external legal source, but not statute | CFG-05 vs Part 2 boundary |
| OQ-22 | Who is the authoritative custodian of street and address data per deployment — council open data, state cadastre, or a commercial provider? | CFG-02 provenance |
| OQ-23 | Are configuration objects portable between deployments, and if so with what provenance? | Onboarding a second municipality |
| OQ-24 | Does a device pin a configuration version for a shift, or refresh continuously? | Offline record semantics |
| OQ-25 | What is the invalidation service level for a changed value on a disconnected device? | §1.4; `S01-AWR-001` |

## Legal rules

| # | Question | Blocks |
|---|---|---|
| OQ-26 | How is a decision body represented — parameterised template, declarative predicate, or executable expression? | `RULE-DEC` implementation; needs an ADR |
| OQ-27 | Does the platform hold legislative text, or citations only? | Catalogue storage and licensing |
| OQ-28 | Is the statutory PIN range scoped per jurisdiction, per organisation, or per infringement scheme? Must PINs be unique across a tenant hosting two councils in one jurisdiction? | `RULE-IDS`; sequence exhaustion |
| OQ-29 | Are penalty indexation events new rule versions or rule parameters? | `RULE-CAT` versioning cadence |
| OQ-30 | How is Code 26 reconciled to Code 3 while preserving historical meaning under `S01-COD-002`? | CFG-06 migration |
| OQ-31 | Who authors and approves rules — a legal function per organisation, per jurisdiction, or a programme-level catalogue authority? | Adoption workflow |
| OQ-32 | Where statute and organisational privacy policy both constrain plate-history retention, which prevails and at what layer? | `RULE-DAT` |
| OQ-33 | Is the identity-domain policy an organisation allow-list or a jurisdiction rule, and how are contractors and shared-service entities admitted? | `RULE-IDP`; `S01-SCP-002` |
| OQ-34 | Is the dormant Schedule 6 extract a legitimate catalogue import source, and who validates it against the authoritative instrument? | `RULE-CAT` seeding |
| OQ-35 | On migration, what rule version binds existing Melbourne records that were created with no version stamp? | `S01-MIG-001`; historical re-evaluation |
| OQ-36 | If a stamped rule version is later found to have been wrongly resolved, what authorises re-evaluation and who may perform it? | §2.4 as-at mode |
| OQ-37 | Which state vehicle-registry integrations are in scope, and who holds the access authority and audit obligation per jurisdiction? | `RULE-DAT`; `S01-INT-002` |

## Technology-dependent

| # | Question | Decision needed |
|---|---|---|
| OQ-38 | Does the selected data platform provide native temporal support, or is effective dating an application concern? | Data-platform ADR (`S01-BAS-001`) |
| OQ-39 | Can the selected GIS provider version and diff zone geometry as first-class data? | GIS-provider ADR |
| OQ-40 | Can the selected offline store hold version-pinned configuration with integrity? | Offline-storage ADR (`S01-OFF-006`) |
| OQ-41 | Is configuration served through the canonical OpenAPI contract or a separate channel? | `S01-CON-001` scope |
| OQ-42 | Does realm resolution occur in the token, per request, or both, and what is its revocation latency? | Identity and session-security ADR (`S01-SEC-002`) |

---

# Traceability

| Design element | Section 01 requirements |
|---|---|
| Configuration objects CFG-01 – CFG-07 | `S01-CAP-001`, `S01-CAP-002`, `S01-CAP-004`, `S01-DOM-001` |
| CFG-01, CFG-02 spatial and address reference | `S01-GIS-001`, `S01-GIS-003`, `S01-GIS-004`, `S01-GIS-005`, `S01-GIS-006`, `S01-GIS-007` |
| CFG-04 organisation and position catalogue | `S01-CAP-003`, `S01-SOV-002`, `S01-SOV-006`, `S01-SOV-007`, `S01-BRN-004` |
| CFG-05 calendar and business time | `S01-CAP-009`, `S01-AUD-002` |
| CFG-06 operational codes | `S01-COD-001`, `S01-COD-002` |
| Layer authorship and override permission | `S01-TEN-008`, `S01-TEN-011`, `S01-TEN-012`, `S01-CAP-002` |
| Offline configuration | `S01-GIS-006`, `S01-AWR-001` |
| Rule representation and classes | `S01-LEG-001`, `S01-CAP-005`, `S01-CAP-015`, `S01-SUC-022` |
| Rule selection and re-evaluation | `S01-LEG-002`, `S01-LEG-003` |
| Rule adoption and supersession | `S01-LEG-004`, `S01-LEG-005`, `S01-AUD-001` |
| Entity chain and cardinality | `S01-TEN-007`, `S01-TEN-008`, `S01-TEN-009`, `S01-TEN-011`, `S01-CAP-003` |
| Isolation and data planes | `S01-ISO-001` – `S01-ISO-006`, `S01-SCP-005` |
| Origin identifiers on records | `S01-SOV-001`, `S01-SOV-005`, `S01-EVD-004`, `S01-AUD-002` |
| Resolution order | `S01-TEN-001`, `S01-TEN-012`, `S01-LEG-002`, `S01-LEG-003`, `S01-EVD-002`, `S01-AWR-001` |
| External source adapters | `S01-INT-001`, `S01-INT-002`, `S01-INT-005` |
| Technology open questions | `S01-BAS-001`, `S01-BAS-003` |

---

# Next session

**This document is the configuration, rule and tenancy model only.**

The follow-on is the **department-specific workflow layer**: the 20 features the matrix tagged `DEPARTMENT-SPECIFIC`, decomposed into a shared capability plus a per-department workflow definition under Workflow and Configuration. That work inherits three things from here — the configuration objects a workflow definition may reference, the rule-selection contract a workflow invokes for a regulated decision, and the Authority Realm a workflow executes within. It is separate, follow-on work for its own session and is deliberately not started here.

Also downstream, and explicitly not part of that next session: Case and Investigation Management and Asset Management, which nine of the eleven uncovered branches are blocked on; and the seven authorisation defects in the matrix findings register, which share the root cause recorded at `OQ-14` but remain a security remediation task rather than an architecture one.

`implementationEnabled` remains `false`. `technologyDecisionState` remains `adr-required`. Neither changes on the strength of a design document.
