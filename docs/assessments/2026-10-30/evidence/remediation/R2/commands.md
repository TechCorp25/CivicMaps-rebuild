# R2 reproduction and provenance

Audit source: `92a2296ca126c9cfb20f0f1dcf1636cdf764e28e`; no R2 source/test modification. Node v24.19.0/npm 11.9.0, dedicated synthetic PostgreSQL 15.18 container at `127.0.0.1:55461`, DB `civicmaps_builder`, and Playwright Chromium 145.0.7632.6. PostgreSQL client wrappers under `/workspace/work/remediation-2026-10-31/builder-work/R1` forward host utility calls to that same synthetic container. No credential/password is used.

R2's first locked setup/check/audit logs (`*-r2-initial.log`) were run against the immediately preceding R1 product candidate; the app/API source was unchanged by the R1 Vite-only correction. The exact current candidate's clean `npm run setup`, `npm run check`, installed/locked Vite, npm audits, manifest scan, bounded Vite smoke, and four sequential browser commands are in the candidate-specific R1 directory `../R1/corrective-validation-92a2296ca126c9cfb20f0f1dcf1636cdf764e28e/`; those are the current-source acceptance evidence.

Caddy v2.10.2 loopback fixture commands:

- `CIVICMAPS_CADDY_BINARY=/workspace/work/remediation-2026-10-31/tools/caddy/caddy node tests/ingress-contract.mjs`
- `CIVICMAPS_DATABASE_URL=postgres://civicmaps_builder@127.0.0.1:55461/civicmaps_builder CIVICMAPS_CADDY_BINARY=/workspace/work/remediation-2026-10-31/tools/caddy/caddy node tests/ingress-login.mjs`

Both passed. Logs are `ingress-contract.log` and `ingress-login.log`. These Caddy fixtures were run during the R2 read-only pass on the immediately preceding R1 product candidate; the corrective candidate changed only Vite manifests and the `check` guard, with no API or Caddy source changes. The second command tests Caddy+Express with separate HTTP socket clients and synthetic Alpha/Beta/Platform tenants.

Repository marker scans: `rg -n 'test\\.(skip|only|todo)|describe\\.(skip|only)|it\\.(skip|only|todo)' tests` returned no matches. `rg -n 'axe|accessibility' tests apps/*/package.json .github` returned no matches. Context7 callable tool inventory filter returned 0.
