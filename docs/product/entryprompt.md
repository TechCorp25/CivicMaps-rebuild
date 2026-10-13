---
name: civicmaps-configuration-and-tenancy-model
description: Turns the CivicMAPS Domain/Department/Configurability Matrix into the rebuild-readiness architecture — a configuration model for municipality-coupled features, a legal-rule abstraction for jurisdiction-bound ones, and the multi-tenant data model both rest on. Produces a governed repo document. Stops at the technology boundary and hands implementation to ADRs.
model: claude-opus-5
---

You're picking up the CivicMAPS rebuild in the `CivicMAPS/pin-force` repo. Attached is
`CivicMAPS_Product_Feature_Department_Matrix_v0.1.0.md` — 181 features from the current
platform, each classified by functional domain, consuming branch, and how tightly it is
coupled to one jurisdiction, one municipality, or one department. Read the whole file
before starting. Its classifications are settled input; this session builds on them
rather than re-deriving them.

The matrix ends at classification and explicitly hands off what you're doing now.

## The task

The matrix identified **37 `MUNICIPALITY-CONFIGURABLE`** and **11 `JURISDICTION-BOUND`**
features — 48 features that cannot move into a multi-jurisdiction platform as written.
Each one names its specific hardcoding: Melbourne's 23 patrol-zone polygons, the AEST
midnight archival timer, the 111-entry Victorian offence catalogue, the 8h25m shift cap,
the `.gov.au` email policy, the `1P`/`15M`/`LZ15` signage grammar, the overstay test.

Produce the architecture that makes those 48 features deployable to a second municipality
and a second jurisdiction without a code fork. Three deliverables, one document:

**1. The configuration model.** What the 37 municipality-coupled features become when
their values move out of code. Group them into configuration objects rather than treating
each feature separately — spatial geometry, street and parking reference data, the
organisation and position catalogue, business-time and operational calendars, operational
code vocabularies, and deployment branding are the obvious clusters, but derive the real
set from the matrix rows. For each object: what it owns, who owns it, its effective-dating
behaviour, and which matrix features consume it.

**2. The legal-rule abstraction.** The 11 jurisdiction-bound features encode statute, not
values — an offence catalogue with penalty schedules, the overstay decision rule, PIN
numbering within a statutory range, infringement-notice content, and an identity-domain
policy. A per-deployment config table does not generalise these. Define how a rule is
represented, versioned, cited to its legislative source, and selected for a given
authority and date, so that a historical record can be re-evaluated under the rule that
applied when it was created rather than the current one.

**3. The multi-tenant data model.** Both of the above rest on structural relationships
that have no inherited implementation at all — Section 02 records
`Organisation, Jurisdiction and Tenancy Management` as Missing. Define the entity chain
(tenant, organisation, jurisdiction, authority realm, jurisdictional data plane, branch,
team, officer), what each owns, and how an operational record carries its origin
identifiers. Include the **resolution order**: given a runtime value — a zone boundary, a
holiday calendar, an offence code — state precisely how the platform resolves which
version applies, across the layer hierarchy and across effective dates.

Close with a **feature disposition table**: every one of the 48 features, and the
configuration object or rule it resolves to. A feature the design does not account for
gets a row saying so.

<example>
Shape of a configuration object entry and its disposition rows — illustrative content,
drawn from the matrix but not a design decision you have to keep:

### CFG-04 · Operational Calendar

| Property | Value |
|---|---|
| Owns | Time zone, DST rule, public holidays, business hours, shift patterns, scheduled-job anchors |
| Owner | Jurisdiction, overridable at organisation level |
| Effective dating | Required — holiday calendars are published annually and amended |
| Answers to | `S01-CAP-009` |

| Matrix feature | Current hardcoding | Resolves to |
|---|---|---|
| `archiveCompletedMarkups()` nightly job | AEST-only midnight anchor | CFG-04 · scheduled-job anchor |
| `autoEndExpiredAssignments` — 8h25m cap | Local award/EBA term as a constant | CFG-04 · shift pattern |
</example>

## Governing constraints

`civicmaps.workspace.json` carries `implementationEnabled: false` and
`technologyDecisionState: adr-required`. Neither changes in this session.

- **No implementation code.** No schema DDL, no migrations, no type definitions, no
  service scaffolding. Entity relationships and field semantics described in prose and
  tables are the deliverable; a `CREATE TABLE` is not.
- **No technology selection.** PostgreSQL/PostGIS, MongoDB, the mobile framework, the GIS
  provider and the backend runtime are all unresolved candidates under `S01-BAS-001`,
  pending ADRs. Design so that the ADR outcome does not invalidate the model, and note
  where a choice would actually constrain it.
- **Anchor to the approved sections.** `docs/governance/approved-source/` holds Section 01
  (§1.4 branches, §1.5 capabilities, §1.6 operational codes) and Section 02. The
  requirements this work answers to include `S01-CAP-001` through `S01-CAP-015`,
  `S01-COD-001`, `S01-COD-002`, `S01-BRN-001` and `S01-EVD-004`. Cite the requirement id
  where a design decision is answering one.
- **Follow GS-000 §8.2** for the filename:
  `CivicMAPS_[DocumentClass]_[DocumentName]_v[Major.Minor.Patch].md`. Write to
  `docs/architecture/`. Mark it `status: Draft — Not Approved`.

## Scope boundary

In scope: the configuration model, the rule abstraction, the tenancy data model, and the
48-feature disposition table.

Out of scope, and not to be started here even in outline:

- The **20 `DEPARTMENT-SPECIFIC` features** and their workflow-definition layer. That is
  the session after this one.
- **Case and Investigation Management** and **Asset Management** — the two absent
  capabilities blocking nine uncovered branches. Separate work.
- The **seven authorisation defects** in the findings register. A security remediation
  task, not an architecture task.
- Any **ADR**. Where this design depends on an unresolved technology choice, record it as
  an open question with the decision it needs — do not draft the ADR itself.

## Working notes

- Handle this directly. Do not dispatch subagents; a single-document design task of this
  size does not need them.
- The matrix is settled input. Do not re-read the source inventory or re-classify features
  — if you disagree with a tag, note it in a short assumptions section and design against
  the matrix as written.
- List every unresolved decision you hit, including ones that look minor. Do not filter
  the list down to the significant ones; a separate pass will triage it.
- Tables over narrative, matching the matrix's register. Target 2,500–4,000 words of prose
  plus whatever tables the content needs.
- Worked examples use placeholder values. No real personnel records, officer numbers,
  credentials, tokens or production endpoints belong in a design document.
- Stop and confirm before committing or pushing anything.

## Response format

Write the document to the repo. In the chat, keep your response under 250 words: the
document path, the configuration objects you defined, the two or three design decisions
a reviewer would most likely challenge, and the open-question count. No preamble, no
restatement of this brief, no summary of the steps you took.

Close the document with a **Next session** section naming the department-specific
workflow layer as the follow-on, so the handoff chain stays explicit.
