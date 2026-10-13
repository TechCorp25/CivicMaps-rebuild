# Session 16 — OQ Resolution Decision Sheet

Seven open questions carried into this session (per `docs/Roadmap - Sequences 16-25.md`). No new screens — owner picks below, then Session 16 closes by patching affected screens and striking these through in `handoff.md`.

## OQ12-1 — Platform-admin sign-in domain
1a's model routes sign-in through `<council>.civicmaps.gov.au`. Platform admin has no council, so 12d proposed a separate root domain, unconfirmed.
Options: (a) confirm 12d's separate root domain, (b) fixed `admin.civicmaps.gov.au` subdomain instead, (c) path-based entry off the root marketing domain.

## OQ12-2 — Org-chart/team scope inside a council
"Departments" in Platform Admin currently means domain-pack access only. Literal org-chart/team structure is Directory/Assignments territory (5a-5g), owned by each council's own ADMIN.
Options: (a) domain-pack access only, platform operator has no org-chart hand, (b) read-only visibility for platform operator, (c) platform operator can edit council org-chart directly.

## OQ12-3 — Municipality status set
12b/12c proposed Active / Provisioning / Suspended, unconfirmed.
Options: (a) confirm as-is, (b) add a status (e.g. Archived, Trial), (c) different set entirely (specify).

## OQ13-1 — Subdomain slug uniqueness
13a's slug field has no confirmed uniqueness/immutability rule.
Options: (a) globally unique, immutable after provisioning, (b) globally unique, editable via support only, (c) no enforcement in UI (backend validates silently).

## OQ14-1 — Open-record count per domain pack
14a/14b show an open-record count with no backing query.
Options: (a) keep as illustrative placeholder (wireframe stays as-is), (b) flag for real backend query, keep placeholder meanwhile, (c) remove the count from the UI until it's backed.

## OQ15-1 — Health-check criteria & usage metrics
15a/15b's KPIs and Degraded signal are illustrative, no backing endpoint.
Options: (a) keep illustrative for wireframe purposes, (b) define real criteria now (needs input on what "degraded" means), (c) remove until defined.

## OQ3-1 — `alert()` standardisation
Native `alert()` used for pulse-declined + form errors across several sequences.
Options: (a) replace with a transient toast, (b) replace with an inline/persistent banner, (c) keep native `alert()` as-is.

---

## Decisions (owner, Session 16)

| OQ | Decision |
|---|---|
| OQ12-1 | Left unresolved — no candidate confirmed, carries forward. |
| OQ12-2 | Full edit access — platform operator can edit a council's org-chart. Flag: owner-supplied target architecture (S01-TEN-006) requires this not bypass tenant isolation implicitly — build as an audited action, not a silent override. |
| OQ12-3 | Confirmed as-is: Active / Provisioning / Suspended. |
| OQ13-1 | Globally unique, immutable after provisioning. Patched into 13a. |
| OQ14-1 | Flag for a real backend query; keep the illustrative placeholder meanwhile. |
| OQ15-1 | Stays illustrative — owner unsure how to measure, and the supplied architecture confirms no SLI/SLO/availability target exists anywhere yet. Revisit once that's defined. |
| OQ3-1 | Decided: one-off confirmations → transient toast; form-validation errors → inline/persistent banner. Native `alert()` stays banned for Code 1/Code 2 regardless. Implementation is Session 16b (cross-cutting sweep). |

Owner also supplied three target-architecture documents (Section 01–03) describing a larger Tenant/Organisation/Jurisdiction/Authority Realm model. Logged as background in `handoff.md`; not adopted into the wireframes since Section 03 is unapproved scaffolding.
