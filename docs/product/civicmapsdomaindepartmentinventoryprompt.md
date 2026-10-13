---
name: civicmaps-domain-department-inventory
description: Restructures the verified CivicMAPS feature inventory (attached, verbatim ground truth) into a domain × department × configurability matrix, scoped for planning the multi-jurisdiction, multi-municipality, multi-department rebuild. Produces a repo doc plus a published artifact. Explicitly stops short of the rebuild architecture itself and hands that off to a separate session.
model: claude-opus-5
---

You're picking up work in the CivicMAPS repo (`civicmaps/civicmaps-preview`). Attached is `civicmaps-feature-inventory.md` — a feature-by-feature inventory of the current platform (backend API, mobile officer app, web companion, dispatcher dashboard, shared layer) that was independently verified against source, not drafted from memory. Every claim in it — feature descriptions, `[LIVE]`/`[DORMANT]` status, `[BUG]`/`[SECURITY]`/`[NOTE]` findings — is ground truth. Read the whole file before starting.

## Why this document is needed

CivicMAPS is being scoped for a rebuild that serves multiple jurisdictions, multiple municipalities, and multiple departments — not just the City of Melbourne / Parking Services deployment the current build evidences. Before that rebuild can be architected, every existing feature needs to be mapped to (a) which functional domain it belongs to, (b) which department or role actually depends on it today, and (c) how tightly it's coupled to *this* jurisdiction, *this* municipality, or *this* department — because that coupling is exactly what the rebuild has to either generalize or explicitly scope around. A domain with zero features serving a department is a gap the rebuild has to close before that department reaches full operational capability. That gap is invisible unless someone builds this matrix first.

## What to produce

Reorganize (not re-research) the attached inventory into a domain × department × configurability matrix.

**1. Domains.** Derive the functional domain list from the source document's own module structure — don't impose a generic taxonomy. As a starting point, the source content clusters into: Patrol & Field Presence, Dispatch & Service Requests (Code21), Digital Enforcement (mark-ups, digital chalking, ANPR), Workforce & HR / Directory, Realtime Safety (duress, peer-share, location-pulse), Notifications & Communications, Audit & Compliance, Platform / Auth / Identity, and Geo & Reference Data. Merge, split, or rename these where the actual feature content supports it better — treat this list as a hypothesis, not a mandate.

**2. Departments / consumer roles.** The source evidences four branches (Parking Services, Local Laws, Animal Control, Parks & Gardens) plus two cross-cutting roles (Dispatch/Command, Compliance/Admin). Use these as the concrete instantiation, but name the rows by function, not by Melbourne's org chart, so the matrix reads correctly for a municipality with different department names. Where the source shows a domain effectively only serves Parking Services in practice (digital chalking and ANPR are the clearest case), say so plainly — that's exactly the kind of gap this document exists to surface, not something to paper over.

**3. Configurability tag.** Give every feature carried over from the source exactly one tag, from this legend:

| Tag | Meaning |
|---|---|
| `CORE-PLATFORM` | Works unmodified for any jurisdiction, municipality, or department |
| `MUNICIPALITY-CONFIGURABLE` | Same logic shape, but the *values* are Melbourne-specific today (zone boundaries, branch names, offence-code catalogue) — needs to become config, not code, per deployment |
| `JURISDICTION-BOUND` | Tied to Victorian/Australian law or a specific regulatory scheme (e.g. Schedule 6 infringement codes, PIN numbering, `.gov.au` email policy) — generalizing this means abstracting a legal rule, not just a value |
| `DEPARTMENT-SPECIFIC` | Only meaningful for one department's workflow as currently built (e.g. parking-offence infringement issuance has no Animal Control equivalent yet) |

For every `MUNICIPALITY-CONFIGURABLE`, `JURISDICTION-BOUND`, or `DEPARTMENT-SPECIFIC` tag, add a one-line reason naming the specific hardcoding — e.g. "AEST-only nightly archival timer," "Victorian Schedule 6 offence codes," "assumes exactly four HR branches."

**4. Carry findings forward.** Every `[BUG]`, `[SECURITY]`, `[NOTE]`, and `[DORMANT]` flag from the source attaches to its feature's matrix cell as-is — these are operational-capability risks a department would inherit if the rebuild ships that feature unchanged. Don't summarize them away; a one-line pointer back to the source finding is enough.

**Worked example of the row format** (illustrative content, not sourced):

```
### Domain: Digital Enforcement

| Feature | Departments | Tag | Note |
|---|---|---|---|
| ANPR provider abstraction (stub/anthropic/http/carmen) | Parking Services | CORE-PLATFORM | Provider-agnostic by design; no change needed. |
| Offence code 701 auto-fire on overstay | Parking Services | JURISDICTION-BOUND | Victorian offence-code catalogue; other jurisdictions need their own code sets. |
| No Report photo evidence (web) | Parking Services, Compliance/Admin | DEPARTMENT-SPECIFIC | [BUG] imageBase64 computed but never transmitted — see source §Web companion. |
```

**5. Coverage check.** Close the matrix with a department × domain presence table — one row per department/role, one column per domain, each cell marked with a feature count or "—" for zero coverage. This is the direct answer to whether every department's concerns are served; a department with several "—" cells has an unmet requirement the rebuild needs to design for, not an oversight in this document.

**6. Handoff, not a continuation.** End with a short "Next session" section stating plainly: this document is the inventory and gap map only. The rebuild-readiness architecture — how each `MUNICIPALITY-CONFIGURABLE` and `JURISDICTION-BOUND` feature actually becomes configurable, what the multi-tenant data model looks like — is separate, follow-on work for its own session, seeded from this matrix. Do not start that design here.

## Constraints

- Treat the attached file as verified ground truth. Reorganize and tag it; don't re-verify it against the live repo, and don't alter, drop, or soften any factual claim in the process.
- No code changes. This is a planning document.
- Don't invent departments, jurisdictions, or municipalities beyond what the source evidences or a clearly-labeled reasonable generalization ("e.g., a second municipality would need...").
- Handle this directly — it's a restructuring pass over a document that already exists, not new research. Don't dispatch subagents for it.
- Favor tables and one-to-two-sentence notes over narrative prose; match the source document's reference-doc register, not an essay.

## Deliverable

Write the matrix to `civicmaps/docs/plan/domain-department-feature-matrix.md`, following the numbering/naming convention already used in that folder (visible in the source inventory's Shared platform layer section). Stop and confirm with the user before committing or pushing anything.

Also publish it as a Claude Artifact for stakeholder sharing. Load the `artifact-design` skill first, as usual. For visual consistency with the earlier feature-inventory artifact in this same review series, reuse the CivicMAPS design tokens at `civicmaps/design-system/colors_and_type.css` if present, or fall back to: Civic Navy `#1b2a4a`, Operations Teal `#1a7a6d`, Patrol Gold `#d4a843`/`#b08a2e`, type pairing DM Sans (body) / Plus Jakarta Sans (display) / JetBrains Mono (identifiers, tags, code). A matrix this size will want a filterable or at least clearly-anchored layout — sketch the design plan against the actual row count before committing to a layout, rather than defaulting to one long table.

---

# Implementation context

**Techniques used**
- No chain-of-thought scaffolding — Opus 5 reasons natively; adding "think step by step" here would cost tokens for no gain.
- Structured output via an explicit tag legend + one worked example row, rather than prose description of the desired format — this is a matrix deliverable, so the schema *is* the instruction.
- Explicit scope boundary and delegation cap (Opus 5 profile: task expansion and eager subagent delegation are the two things to constrain directly, not through effort).
- Explicit length/register constraint ("tables over narrative") rather than relying on effort to shorten output — effort governs thinking depth on Opus 5, not response length.
- No verification instruction anywhere (PE004) — Opus 5 self-verifies; if you're also running a review hook on this repo, adding one here would be paying for the same check twice.

**Parameters**
- Model: `claude-opus-5`. Effort: leave at the Claude Code default (`high`) — this task has real judgment calls (domain boundaries, tag assignment on ambiguous features) where `high` earns its cost. Sweep down only if you find yourself re-running this pattern often enough that cost matters more than first-pass judgment quality.
- No `max_tokens` override needed; a matrix over ~150-200 source features fits comfortably inside a normal Opus 5 turn even accounting for its higher verbosity.

**Testing suggestions**
- Spot-check 3-4 features that clearly cross domains (e.g. the mark-up expiry alarm, which touches both Digital Enforcement and Notifications) and confirm the session picked one home domain rather than duplicating the row or refusing to choose.
- Check that at least one `[BUG]`/`[SECURITY]` finding from the source survives into the matrix verbatim, to catch silent softening.
- Check the coverage-check table actually has visible gaps for Animal Control / Parks & Gardens rather than every domain claiming full coverage — a suspiciously clean coverage table is a sign the model filled cells rather than reporting the real gap.

**Edge cases**
- If Claude Code can't locate `civicmaps/design-system/colors_and_type.css` in this session's checkout, the fallback palette in the prompt prevents it from defaulting to a generic AI-design look.
- If the source inventory's `docs/plan/` naming convention isn't obvious from context, it's fine for the session to ask rather than guess a filename — that's a one-line clarifying question, not scope creep.
- Watch for the model trying to *start* the rebuild architecture despite the explicit handoff instruction — Opus 5's task-expansion tendency is exactly this. If it happens, the "Next session" section instruction is the thing to point back to.

**Cost note**
Tier choice is the dominant lever here, as usual — Sonnet 5 would run this materially cheaper. Opus 5 was the deliberate choice per your answer, and it's the right one for this specific pass: assigning a configurability tag correctly requires judging *why* a feature is coupled to Melbourne, not just pattern-matching keywords, and that's where Opus 5's edge over Sonnet 5 actually shows up.
