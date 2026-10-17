# CivicMAPS status assessment — 17 October 2026

Assessed by Codex (agent) against verified merged main **`8da79eec7ae56cd3d9a21930842b217967df049e`**. PR #13 merged as `6e405530f8f2de6b85d4ed9476c7bfa667c97a2c`; PR #14 merged as this main commit. The main tree is identical to reviewed PR head `d9259130efa9d5e2996b42922776ee9f5cd3ec77`. This assessment changes documentation and diagnostic evidence only; it does not deploy or fix the findings below.

## Current position

F01, F02, F02Q and F03–F06 are merged: seven completed delivery cards. Reproducible builds/CI, Platform registration, explicit operating-context grants and RLS, durable provisioning, separate AWS database/logins/storage namespaces, and exact-host HTTPS routing are implemented. CommandMAPS and CivicMAPS Platform are runnable. The three development endpoints returned HTTP 200 during this assessment; public checks were read-only and used normal TLS verification through the execution environment proxy.

| Area                     | Current result and limit                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source quality           | Fresh `npm run check` on merged main passed zero-warning lint, formatting, both typechecks/builds and **60/60 tests**. Dependencies were reused from the existing lockfile-compatible installation, not freshly resolved.                                                                                                                                                                                    |
| Hosted acceptance        | [PR-head CI 38984872758](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/38984872758) passed, including both browser suites. Main has the same tree. A separate post-merge CI run is not claimed.                                                                                                                                                                                               |
| Live services            | Platform, Alpha CommandMAPS and Beta CommandMAPS currently respond. Earlier full live isolation/recovery/browser acceptance is pinned to source `b5c9709`; healthy URLs alone do not establish deployment of current main.                                                                                                                                                                                   |
| Source versus deployment | Merge revision `d925913` adds migration 010, deterministic municipality tokens, label bounds and bootstrap ownership checks. Its [merge assessment](evidence/F06-merge-assessment.md#release-boundary) explicitly says these were not deployed. Current runtime source/migration revision was not queried during this assessment; treat current-main live acceptance as outstanding until verified.          |
| Data isolation           | F05 proves separate operational resource databases/logins and scoped storage access. `/api/resources/status` opens the selected F05 database. Existing service-request CRUD still uses the shared control database with F03 RLS; this is not evidence that all operational records have moved into separate F05 databases. Decide and verify that connection during F11 rather than implying it is complete. |
| First administrator      | Registry has pending first-admin credentials; no activation/redemption/recovery route or council ADMIN role exists. This is planned F07 work, not a regression. Lost initial credential response needs the F07 recovery contract.                                                                                                                                                                            |
| Packs/suspension         | Pack configuration exists; server-enforced entitlements (F08) and general municipality suspension/resumption (F09) remain planned. Route withdrawal is not full council suspension.                                                                                                                                                                                                                          |
| Other surfaces           | EnforcementMAPS web/mobile and public portal are scaffolds. Their package commands reference the absent stub-task script; do not count those commands as build/test coverage. Public reports, payments, officer mobile/offline and production operations remain future work.                                                                                                                                 |

## Findings

### A1 — High: Platform probe failure prevents self-service recovery

**Confirmed in a disposable database.** A single transient probe exception changes the Platform manifest to `failed`. Subsequent worker cycles do not select failed routes, even when the adapter is healthy. Routing middleware rejects Platform login and all management paths with HTTP 503. The only route-control HTTP endpoint is municipality-scoped, while the Platform route has no municipality. Recovery therefore requires an out-of-band database/operator action; the current UI cannot restore itself.

Evidence: [worker selection and failure persistence](../../services/api/routing.mjs), [routing middleware](../../services/api/routing.mjs), [municipality-only controls](../../services/api/platform.mjs), and [executed diagnostic](evidence/2026-10-17-post-f06/assessment-api-probes.mjs). The diagnostic injected one probe error, observed failed state/login 503, and proved the next healthy worker cycle never called its adapter.

Recommended F06Q correction: bounded durable retry/backoff for transient failures while access stays fail-closed; preserve lease fencing, attempt limits, withdrawal semantics and audit. Supply and test an authenticated, explicitly scoped out-of-band Platform recovery command for terminal failure. Do not solve this by bypassing ingress readiness or exposing an unauthenticated recovery API.

### A2 — High: login throttling groups all clients behind Caddy

**Confirmed through local ingress-mode HTTP.** Both login handlers key their 20-per-minute counters on `req.ip`. The API receives all production connections from loopback Caddy and does not configure trusted client-address resolution. Twenty failed Platform attempts blocked an unrelated valid operator login with 429 despite distinct forwarded client addresses. Council login uses the same pattern and shares its counter across council hosts. This enables sign-in denial and causes legitimate-user collisions; it does not demonstrate cross-council data disclosure.

Evidence: [Platform login bucket](../../services/api/platform.mjs), [council login bucket](../../services/api/app.mjs), [Caddy reverse proxy](../../infrastructure/f06/Caddyfile), and the API diagnostic above. No public brute-force traffic was sent.

Recommended F06Q correction: derive a validated client key only from the authenticated loopback ingress and a header Caddy overwrites; combine appropriate client/route/identity controls. Test genuine different clients, same-client limits, spoofed/duplicate address headers and cross-host behaviour. Do not enable blanket `trust proxy` or trust arbitrary client-supplied forwarding values.

### A3 — Medium: displayed routing readiness can remain stale

**Confirmed with Chromium's controlled clock on the actual component; surrounding polling verified in source.** `RoutingStatus` calls `Date.now()` during render but schedules no expiry update. The detail effect stops polling once jobs and routes settle. A mounted ready component still said ready after 301 seconds; reloading then showed “Verification expired”. A later worker failure can likewise remain invisible on an otherwise quiet detail page. The backend continues to enforce readiness, so the impact is misleading operator status rather than an access bypass.

Evidence: [detail refresh effect](../../apps/civicmaps-platform/src/main.tsx), [status rendering](../../apps/civicmaps-platform/src/RoutingStatus.tsx), [browser diagnostic](evidence/2026-10-17-post-f06/routing-freshness-probe.mjs). Correct with a bounded refresh/expiry timer, cancellation on navigation/unmount, and a visible unavailable state when refresh fails. Verify live status transitions without user clicks, expiry, retry recovery and no overlapping polling.

### A4 — Release gap: merged naming revision lacks live acceptance

The new naming migration is tested locally and in hosted CI, but the deployment evidence describes older source. Before F07 depends on it, inspect the actual source/schema, preserve ownership and control data, deploy the exact tested revision within the existing approved development boundary, then verify migration/bootstrap replay and live ingress/isolation. Do not infer a deployment from GitHub merge or healthy endpoints. No new domain, stack or additional council should be created for this alignment.

### A5 — Low: deployed health response reports the wrong mode

All three deployed `/api/health` responses say `mode: local-synthetic`, because the [handler](../../services/api/app.mjs) hard-codes that value. Synthetic data is intentional, but routing/deployment mode is a separate fact. Return a truthful safe mode indicator and keep synthetic-data status separate; no sensitive configuration or credentials should enter public health output. This is misleading diagnostics, not a failed health check.

## Boundaries and maintenance risks

The EC2/control process remains a trusted broker across two synthetic councils. Local encrypted control storage has no tested HA/disaster-recovery assurance. AWS resources and DNS remain under the earlier owner approval: Sydney project 597663815195, profile CivicMAPS, total US$50/month development allocation, approximately US$40/month combined fixed estimate before usage/tax. Preserve populated resources for the 21 October review; that date is not deletion permission. The US$15 initial F05 acceptance allocation is not renewed.

F06 bootstrap unconditionally sets its two fixture municipalities to Provisioning. This is compatible with the current synthetic pre-activation state, but F07 must prevent repeat bootstrap from demoting an activated municipality. Similarly, activation must create explicit immutable context grants; it must not infer access from a hostname, slug or first-admin registry row. D02 still needs concrete minimum ADMIN permissions and activation delivery/recovery policy. Existing framework, Sydney hosting, domain, budget, isolation and guidance decisions should not be reopened.

## Recommended next phase

Complete **F06Q — routing reliability and release alignment** before F07. This is one bounded stabilisation outcome: recoverable ingress, correctly scoped throttling, truthful/fresh operator status and exact deployed-release evidence. The [copyable instructional prompt](F06Q-next-phase-prompt.md) includes the negative cases and completion gates. F07 then implements first council-admin activation/recovery; F08 follows for entitlements, and F11 connects newly activated councils to the operational lifecycle.

The ledger marks F06 merged, preserves historical deployed-source evidence, and schedules F06Q as planned. No implementation feature is in progress. No production incident, data leak or current live outage is claimed by these diagnostics.

## Reproduction and verification limits

[Recorded results](evidence/2026-10-17-post-f06/results.txt) accompany the diagnostic sources. Run from repository root with a dedicated local PostgreSQL base capable of creating disposable databases:

```sh
node docs/plans/evidence/2026-10-17-post-f06/assessment-api-probes.mjs
PLAYWRIGHT_BROWSERS_PATH=/workspace/playwright node docs/plans/evidence/2026-10-17-post-f06/routing-freshness-probe.mjs
```

These diagnostics intentionally assert the observed defects and are not normal CI acceptance tests; replace them with tests of corrected behaviour during F06Q. They use synthetic credentials and clean up their owned databases/browser processes. They do not send login attempts or fault injection to AWS. Initial diagnostic failures from Node fetch Host handling and direct CommonJS browser imports were harness errors; using raw HTTP authority headers and Vite bare imports produced the confirmed results above. No exhaustive security audit, load test, fresh cloud inventory or production-readiness certification was performed.

Empirical assessment: `6ad2f4cebeb1d964705ec77e`. Individual open findings: A1 `6ad2f4e8beb1d964705ec7d4`, A2 `6ad2f4f5beb1d964705ec83c`, A3 `6ad2f501beb1d964705ec8ab`. These are confirmed findings with fixes pending, not completed remediation.
