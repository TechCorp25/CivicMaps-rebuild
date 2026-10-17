# F06 independent merge assessment — 17 October 2026

Author: Codex (agent). Reviewed branch `codex/civicmaps-f06-build`, starting head `fc8707ddc720cddb00d9a3c5f024a74b367569d9`, against current main `6e405530f8f2de6b85d4ed9476c7bfa667c97a2c`. The resolution commit containing this report has those two commits as parents. Owner merge remains separate.

## Findings and resolution

- Resolved all three Git conflicts: preparation brief, feature ledger and overarching plan. Preserve the existing deployment evidence and record preparation PR #13 as merged; incorporate the revised naming requirements instead of reverting main or falsely resetting implemented F06 to planned.
- Fixed the substantive integration gap: the build lacked the merged preparation contract's DNS-safe municipality tokens, persisted mapping and 63-character label bound. Added a shared deterministic naming helper, migration 010, bootstrap ownership checks and boundary/collision tests. Reserved EnforcementMAPS/report patterns are naming contracts only, not deployed services.
- Upgrade testing exposed retained fixture slugs `synthetic-alpha`/`synthetic-beta`, which differ from approved public tokens `alpha`/`beta`. Added explicit immutable UUID/slug aliases and reserved both tokens against other identities. Updated the naming standard and identity manifest together. No registry identities or public hosts are renamed.
- Existing incompatible route history aborts migration atomically with an explicit reconciliation error. Bootstrap checks every existing municipality route and its target, host, token, context and resource; repeat setup retains route IDs, versions and history. Unique host ownership remains enforced. No automatic reassignment is introduced.

## Assessment scope

Reviewed the F06 diff for authority/forwarded-header validation, host-bound authentication and sessions, exact origin/CSRF checks, context/resource readiness, worker leases and recovery, operator controls, migration compatibility, React integration, Caddy configuration, infrastructure permissions and bootstrap/service configuration. Existing development limitations remain: a trusted cross-council broker, one runtime/control disk, three explicitly deployed hosts and no production HA or disaster-recovery claim. General municipality deployment automation and administrator activation are outside this feature.

## Executed checks

- Clean committed-lockfile installation: `npm_config_cache=/tmp/f06-npm-cache npm run setup` passed; Node 24.19.0 and npm 11.9.0.
- `npm run check`: passed lint with zero warnings, formatting, both TypeScript checks, both application builds and **60/60 integration tests**. Added naming boundaries 47/48/51/52/63 across all product suffixes, repeated mapping, same-prefix and reserved-token collision checks, malformed identity rejection, retained-route upgrade/conflict preservation and bootstrap replay/ownership rejection.
- `PLAYWRIGHT_BROWSERS_PATH=/tmp/f06-playwright npm run test:platform:browser` and then `npm run test:commandmaps:browser`: passed using disposable databases and the matching Playwright Chromium. Screenshots remain in ignored `test-results/`.
- `CIVICMAPS_CADDY_BINARY=/tmp/f06-caddy/caddy node tests/ingress-contract.mjs`: passed actual Caddy 2.10.2 allowlist, authority preservation, ingress-token injection and forged-forwarding rejection. Release SHA512 verified against the committed bootstrap checksum. This is a loopback HTTP contract, not new public TLS acceptance.
- Caddy configuration adaptation, `bash -n infrastructure/f06/bootstrap-runtime.sh`, Python AST parsing and infrastructure JSON parsing passed. Generated tokens unchanged; Git whitespace/conflict-marker checks passed.

The local executor lacked PostgreSQL 15, so a dedicated disposable PostgreSQL **17.11** cluster was installed under `/tmp`; no development or production database was reset. Hosted CI retains PostgreSQL 15 and must pass for the published merge-resolution SHA. Initial sandbox/proxy and missing dependency failures were resolved with permitted network access, a writable npm cache and isolated local binaries; they are not application failures.

## Release boundary

No AWS resources, DNS, credentials or live application data were changed. Previous live acceptance in [F06.md](F06.md) remains evidence for its pinned deployed source, not for this revision. The new naming migration/bootstrap changes require the documented controlled deployment and subsequent live validation before claiming updated deployment acceptance. Preserve retained resources for the 21 October review. PR #14 should target main and remain unmerged for owner review. Consult its exact-head hosted checks for the final publication result.
