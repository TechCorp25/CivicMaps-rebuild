# Goal-based code audit — 30 October 2026

## Contract

Assess CivicMaps-rebuild at current-main baseline `b168dc0ce2b3d28011588b497e8e6fc459c2aa6a`, verified with GitHub compare and Git fetch. Workstream: `codex/code-audit-2026-10-30`. Preserve other workstreams. Audit findings and evidence are the deliverable; remediation, merge and deployment require separate scoped work. Dates use Australia/Melbourne.

## Ordered goals and acceptance gates

| Goal | Work and rationale | Required evidence / exit gate |
| --- | --- | --- |
| A0 — Reproducible baseline | Verify main, clean source, instructions, exact Node/npm/lockfile, isolated synthetic PostgreSQL and browser tooling. Inventory runnable products versus scaffolds. | Source SHA, tool versions, dependency installation, database readiness, commands and limitations recorded. |
| A1 — Reliable quality signal | Run lint, format, both typechecks/builds, complete integration suite, sequential map/Platform/CommandMAPS/activation browser suites. Inspect CI discovery and skipped tests. | Counts and raw logs; distinguish product failures from harness failures. Never treat a skipped/blocked check as passing. |
| A2 — Dependencies and current guidance | Audit production and full dependency trees; review runtime support, lockfile integrity, advisory enforcement and native wrappers. Use @context7 for Express 5, React 19, node-postgres 8, Playwright and Vite guidance relevant to actual code. | Record library ID, retrieved date, installed/documented version, source URL and applied rule. Latest guidance must be checked for compatibility with pinned versions. Unavailable Context7 remains an explicit open requirement, not a fabricated citation. |
| A3 — Trust boundaries and data integrity | Trace authentication, session/cookie/CSRF controls, council/context/role isolation, object-level authorisation, input validation, parameterised SQL, migrations, audit writes and secret handling. | Negative cases for cross-council/object access and malformed inputs; transactional rollback and migration compatibility evidence; each finding has path/line and reproduction. |
| A4 — Correct behaviour under failure | Review dispatch intake/lifecycle, idempotency, concurrent writes, pagination, stale UI responses, context switches, cancellation, provisioning leases/retries and provider failures. | Trace requirements to source and tests; deterministic race/failure reproductions; no duplicate writes or stale-authority success. |
| A5 — User and operational quality | Assess loading/error/empty states, keyboard/focus and responsive behaviour, map/provider boundaries, observability/redaction, bounded resource use, deployment/rollback configuration and GIS validation. | Browser evidence and targeted measurements; clearly separate synthetic provider acceptance from live-provider evidence. |
| A6 — Independent synthesis and handoff | Deduplicate findings against existing remediation, prioritise by impact/exploitability, produce dependency-ordered remediation packages and freeze report/evidence. Independently assess the frozen deliverable under the repository protocol. | Severity, confidence, affected version, reproduction, acceptance test and owner/workstream per finding; explicit untested areas; independent verdict tied to exact SHA. |

Run A0 then A1 before interpreting deeper failures. A2 informs A3–A5. Execute one goal at a time; a blocked external check may be recorded while independent read-only inspection continues. Do not repeatedly rerun green checks without a relevant change. Preserve initial failures and subsequent corrections.

## Scope and reporting

Implemented scope: CommandMAPS, CivicMAPS Platform, Express API, PostgreSQL migrations, active scripts/tests, CI, infrastructure and active GIS tools. Catalogue scaffold/native gaps without claiming they were tested. Use synthetic data only and a dedicated database; no production calls, deployment or credential disclosure.

Findings require ID, severity (critical/high/medium/low), goal, file/line, observed versus required behaviour, impact, reproducible command or test, confidence, remediation proposal and verification gate. Separate confirmed defects, hypotheses and environment blockers. A green suite is evidence for covered behaviours, not proof of absence of defects.

Store sanitised evidence beside the report; scratch logs/runtime files live in `/workspace/work/code-audit-2026-10-30`. Update Empirical at each meaningful completed goal with `authorType: agent`, project/work-history tags and mass 1. Store user requirements separately from agent conclusions. Before resuming, recheck branch/SHA and memory; main advances do not silently change this frozen baseline.

## Initial state

A0 in progress; A1 started. Node 24.19.0 and npm 11.9.0 match repository pins. PostgreSQL 15.18 starts on dedicated loopback port 55450 using the supported elevated execution path; sandbox execution alone denies sockets. Git fetch also works through the supported elevated path. Context7 is not exposed by the connected tool inventory and no repository/client configuration was found; A2 Context7 evidence is pending. Historical audit conclusions are leads to revalidate, not current findings.
