# F-002 queue completeness extraction

## Scope and source

This change starts from reviewed `main` at `1e658fd8b7f725148640d6ed68e81e3f9b2eaed3` and extracts only the reusable F-002 request-queue completeness behavior. It does not include ownership code or migrations 014/015. Changed runtime files are `services/api/app.mjs`, `apps/commandmaps/src/main.tsx`, and `apps/commandmaps/src/RequestQueue.tsx`; regressions are in `tests/foundation.test.mjs` and `tests/browser.mjs`.

The API now returns pages of up to 100 requests and whole-scope counts, with keyset cursors ordered by request number. Counts and pages share the existing actor visibility predicate: dispatch/supervisor views are council-context scoped by the existing request boundary, while officers see only assigned requests. The UI follows every page before showing the queue and guards against stale concurrent loads. Existing action endpoints, entitlement checks, context checks, optimistic versioning, idempotency receipts, audit records, and recovery behavior were not changed.

## Acceptance evidence

- `npm run typecheck` — pass.
- `npm run build` — pass.
- `npm run lint` — pass.
- `npm run format:check` — pass.
- Focused `tests/foundation.test.mjs` run against disposable PostgreSQL — 11/11 pass, including 110 active plus six closed records, cursor completeness, count deltas, invalid inputs, and officer-only assigned visibility.
- `npm run test:browser` — pass in Chromium against disposable PostgreSQL; existing create/assign/reload/acknowledge/attend/close, cross-scope denial, logout and narrow-layout flow plus active and closed queue discovery beyond the old 100-row limit.
- Chromium required a temporary browser install and writable fontconfig cache under `/workspace/work`; no dependency or browser binaries were added to the repository. The disposable database container was stopped after verification.

## Limits

The service still transfers the complete authorized queue to the browser before client-side search and filtering. This removes silent omission of older requests but is not server-backed search/filter/page interaction. No throughput, latency, or large-council capacity claim is made. Hosted CI on the eventual published SHA remains pending.
