# R2 deduplicated findings register

Candidate product source inspected: `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`.

## Confirmed findings

| ID | Severity | State | Evidence and bounded follow-up |
| --- | --- | --- | --- |
| AUD-001 | Medium | Existing R1 finding; open pending fresh R1 independent review | GHSA-8g5g-mxqh-grgj affects Vite exactly 6.4.4 and first patches at 6.4.5. The original R1 candidate omitted `apps/commandmaps/package.json:20`; this same occurrence is now pinned to 6.4.5 in candidate `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`. The new repo-wide verifier scans every tracked/unignored `package.json` under the repository except `.git` and `node_modules`; it found 27 manifests and no direct Vite declaration except 6.4.5. Root installed/locked audit and all relevant checks passed. This is one advisory root cause; do not create a duplicate R3 finding. |

No additional R2 defect was confirmed from the reviewed sources and fresh local checks. R3 findings are therefore not instantiated by this evidence. AUD-001 remains assigned to R1 and remains open until the new exact candidate receives independent review.

## Unconfirmed hypotheses

- The API logs non-transient `error.message` to server stderr at `services/api/app.mjs`; no sensitive output was observed or reproduced in the synthetic tests. Whether production log collection adds additional redaction/retention controls was not inspected. This is an operational verification question, not a confirmed finding.

## Coverage gaps and blockers

- **Context7 unavailable for the current pass:** required by the plan for version-compatible framework/runtime guidance; callable tool inventory search returned zero matches. The historical 2026-10-24 reference map covers Express, React and node-postgres but not Playwright/Vite, lacks retained raw Context7 responses, and explicitly does not claim all material matches pinned versions. It cannot satisfy this plan's fresh retrieval requirement. No current citation or retrieval is fabricated. This blocks complete A2 and R2 acceptance.
- **Accessibility conformance:** no axe or equivalent automated conformance suite was found. Existing keyboard/focus and narrow viewport tests are useful evidence but are not a WCAG audit.
- **Live integrations/operations:** no AWS, live identity provider, map billing/provider qualification, production database, customer data, backup/restore on a deployment target, or release/bootstrap action was exercised.
- **Hosted CI:** local checks passed, but GitHub-hosted CI was not run here. CI uses `ubuntu-24.04` and a PostgreSQL service; the workflow does not explicitly install PostgreSQL client utilities and depends on runner-provided availability.
- **Scope:** source audit and test evidence are bounded to the current synthetic CivicMaps product and listed files/checks. No native/mobile application, formal threat model, load test, or exhaustive security assurance is claimed.
